const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Brand = require('../models/Brand');
const RealtimeSubscription = require('../models/RealtimeSubscription');
const markdownService = require('../services/markdownService');
const realtimeService = require('../services/realtimeService');
const emailService = require('../services/emailService');

// Helper function for consistent error responses
const errorResponse = (res, statusCode, code, message, details = null) => {
  console.error(`Error ${code}: ${message}`, details);
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details ? details.message || details : undefined
    }
  });
};

// @route   GET /api/tasks/:taskId/comments
// @desc    Get comments with threading support
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { thread = true, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {
      brand_id: req.brandId,
      entity_type: 'task',
      entity_id: taskId,
      isDeleted: false
    };

    if (thread) {
      query.parentCommentId = null; // Only top-level comments
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.userId', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get replies for each comment if threading is enabled
    if (thread) {
      for (let comment of comments) {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isDeleted: false
        })
          .populate('author', 'name email avatar')
          .populate('mentions.user_id', 'name email')
          .populate('reactions.userId', 'name email')
          .sort({ createdAt: 1 });

        comment.replies = replies;
      }
    }

    const total = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: comments,
      total,
      page: Math.floor(offset / limit) + 1,
      limit: parseInt(limit),
      message: 'Comments retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'COMMENT_FETCH_ERROR', 'Failed to retrieve comments', error);
  }
};

// @route   POST /api/tasks/:taskId/comments
// @desc    Create a new comment
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, parentCommentId, mentions = [], links = [] } = req.body;

    // Validate content
    const validation = markdownService.validateContent(content);
    if (!validation.isValid) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Content validation failed', validation.errors);
    }

    // Process content (markdown to HTML, extract links and mentions)
    const processedContent = markdownService.processContent(content);

    // Create comment
    const comment = await Comment.create({
      brand_id: req.brandId,
      entity_type: 'task',
      entity_id: taskId,
      content: processedContent.content,
      contentHtml: processedContent.contentHtml,
      author: req.user.id,
      parentCommentId: parentCommentId || null,
      mentions: mentions,
      links: links,
      status: 'active',
      type: parentCommentId ? 'reply' : 'comment'
    });

    // Populate comment with user details
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user_id', 'name email');

    // Create activity
    const activity = await Activity.create({
      brand_id: req.brandId,
      taskId: taskId,
      projectId: req.projectId || null,
      type: 'commented',
      description: `${req.user.name} added a comment`,
      user: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      },
      metadata: {
        commentId: comment._id,
        commentContent: comment.content
      }
    });

    // Send real-time updates
    realtimeService.broadcastCommentAdded(req.brandId, taskId, comment);
    realtimeService.broadcastActivityAdded(req.brandId, taskId, activity);

    // Send email notifications for mentions
    if (mentions.length > 0) {
      for (const mention of mentions) {
        const mentionedUser = await User.findById(mention.user_id);
        if (mentionedUser) {
          const task = await Task.findById(taskId);
          const project = await Project.findById(req.projectId);
          const brand = await Brand.findById(req.brandId);
          
          await emailService.sendMentionEmail({
            mentionedUser,
            mentionedBy: req.user,
            comment,
            task,
            project,
            brand
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: comment,
      activity: activity,
      message: 'Comment created successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'COMMENT_CREATE_ERROR', 'Failed to create comment', error);
  }
};

// @route   PUT /api/comments/:commentId
// @desc    Update a comment
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate content
    const validation = markdownService.validateContent(content);
    if (!validation.isValid) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Content validation failed', validation.errors);
    }

    // Process content
    const processedContent = markdownService.processContent(content);

    // Find and update comment
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, brand_id: req.brandId, author: req.user.id },
      {
        content: processedContent.content,
        contentHtml: processedContent.contentHtml,
        editedAt: new Date(),
        $push: {
          editHistory: {
            content: processedContent.content,
            editedBy: req.user.id,
            editedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!comment) {
      return errorResponse(res, 404, 'COMMENT_NOT_FOUND', 'Comment not found or access denied');
    }

    // Populate comment with user details
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user_id', 'name email');
    await comment.populate('reactions.userId', 'name email');

    // Send real-time update
    realtimeService.broadcastCommentUpdated(req.brandId, comment.entity_id, comment);

    res.status(200).json({
      success: true,
      data: comment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'COMMENT_UPDATE_ERROR', 'Failed to update comment', error);
  }
};

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find and soft delete comment
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, brand_id: req.brandId, author: req.user.id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        status: 'deleted'
      },
      { new: true }
    );

    if (!comment) {
      return errorResponse(res, 404, 'COMMENT_NOT_FOUND', 'Comment not found or access denied');
    }

    // Send real-time update
    realtimeService.broadcastCommentDeleted(req.brandId, comment.entity_id, commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'COMMENT_DELETE_ERROR', 'Failed to delete comment', error);
  }
};

// @route   GET /api/comments/:commentId/replies
// @desc    Get replies to a comment
// @access  Private
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const replies = await Comment.find({
      parentCommentId: commentId,
      brand_id: req.brandId,
      isDeleted: false
    })
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.userId', 'name email')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Comment.countDocuments({
      parentCommentId: commentId,
      brand_id: req.brandId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: replies,
      total,
      page: Math.floor(offset / limit) + 1,
      limit: parseInt(limit),
      message: 'Replies retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'REPLY_FETCH_ERROR', 'Failed to retrieve replies', error);
  }
};

// @route   POST /api/comments/:commentId/replies
// @desc    Add a reply to a comment
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, mentions = [] } = req.body;

    // Validate content
    const validation = markdownService.validateContent(content);
    if (!validation.isValid) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Content validation failed', validation.errors);
    }

    // Process content
    const processedContent = markdownService.processContent(content);

    // Create reply
    const reply = await Comment.create({
      brand_id: req.brandId,
      entity_type: 'task',
      entity_id: req.taskId,
      content: processedContent.content,
      contentHtml: processedContent.contentHtml,
      author: req.user.id,
      parentCommentId: commentId,
      mentions: mentions,
      status: 'active',
      type: 'reply'
    });

    // Populate reply with user details
    await reply.populate('author', 'name email avatar');
    await reply.populate('mentions.user_id', 'name email');

    // Create activity
    const activity = await Activity.create({
      brand_id: req.brandId,
      taskId: req.taskId,
      projectId: req.projectId || null,
      type: 'commented',
      description: `${req.user.name} replied to a comment`,
      user: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      },
      metadata: {
        commentId: reply._id,
        parentCommentId: commentId,
        commentContent: reply.content
      }
    });

    // Send real-time updates
    realtimeService.broadcastCommentAdded(req.brandId, req.taskId, reply);
    realtimeService.broadcastActivityAdded(req.brandId, req.taskId, activity);

    // Send email notifications for mentions
    if (mentions.length > 0) {
      for (const mention of mentions) {
        const mentionedUser = await User.findById(mention.user_id);
        if (mentionedUser) {
          const task = await Task.findById(req.taskId);
          const project = await Project.findById(req.projectId);
          const brand = await Brand.findById(req.brandId);
          
          await emailService.sendMentionEmail({
            mentionedUser,
            mentionedBy: req.user,
            comment: reply,
            task,
            project,
            brand
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: reply,
      activity: activity,
      message: 'Reply added successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'REPLY_CREATE_ERROR', 'Failed to add reply', error);
  }
};

// @route   POST /api/comments/:commentId/reactions
// @desc    Add a reaction to a comment
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Emoji is required');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse(res, 404, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    // Add reaction
    await comment.addReaction(req.user.id, emoji);

    // Populate comment with user details
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user_id', 'name email');
    await comment.populate('reactions.userId', 'name email');

    // Send real-time update
    realtimeService.broadcastCommentUpdated(req.brandId, comment.entity_id, comment);

    res.status(200).json({
      success: true,
      data: comment,
      message: 'Reaction added successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'REACTION_ADD_ERROR', 'Failed to add reaction', error);
  }
};

// @route   DELETE /api/comments/:commentId/reactions/:reactionId
// @desc    Remove a reaction from a comment
// @access  Private
exports.removeReaction = async (req, res) => {
  try {
    const { commentId, reactionId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse(res, 404, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    // Remove reaction
    await comment.removeReaction(req.user.id);

    // Populate comment with user details
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user_id', 'name email');
    await comment.populate('reactions.userId', 'name email');

    // Send real-time update
    realtimeService.broadcastCommentUpdated(req.brandId, comment.entity_id, comment);

    res.status(200).json({
      success: true,
      data: comment,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'REACTION_REMOVE_ERROR', 'Failed to remove reaction', error);
  }
};

// @route   GET /api/tasks/:taskId/activities
// @desc    Get task activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit = 20, offset = 0, type } = req.query;

    const activities = await Activity.getActivitiesByTask(req.brandId, taskId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type: type
    });

    const total = await Activity.countDocuments({
      brand_id: req.brandId,
      taskId: taskId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: activities,
      total,
      page: Math.floor(offset / limit) + 1,
      limit: parseInt(limit),
      message: 'Activities retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'ACTIVITY_FETCH_ERROR', 'Failed to retrieve activities', error);
  }
};

// @route   GET /api/brands/:brandId/mention-suggestions
// @desc    Get mention suggestions
// @access  Private
exports.getMentionSuggestions = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, type = 'user' } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Mention suggestions retrieved successfully'
      });
    }

    let suggestions = [];

    if (type === 'user' || type === 'all') {
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } }
        ]
      })
        .select('name email username avatar')
        .limit(10);

      suggestions = suggestions.concat(users.map(user => ({
        id: user._id,
        type: 'user',
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      })));
    }

    if (type === 'task' || type === 'all') {
      const tasks = await Task.find({
        brand_id: brandId,
        title: { $regex: q, $options: 'i' }
      })
        .select('title description status')
        .limit(5);

      suggestions = suggestions.concat(tasks.map(task => ({
        id: task._id,
        type: 'task',
        name: task.title,
        description: task.description,
        status: task.status
      })));
    }

    if (type === 'project' || type === 'all') {
      const projects = await Project.find({
        brand_id: brandId,
        title: { $regex: q, $options: 'i' }
      })
        .select('title description status')
        .limit(5);

      suggestions = suggestions.concat(projects.map(project => ({
        id: project._id,
        type: 'project',
        name: project.title,
        description: project.description,
        status: project.status
      })));
    }

    res.status(200).json({
      success: true,
      data: suggestions,
      message: 'Mention suggestions retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'MENTION_SUGGESTIONS_ERROR', 'Failed to retrieve mention suggestions', error);
  }
};

// @route   POST /api/tasks/:taskId/subscribe
// @desc    Subscribe to task updates
// @access  Private
exports.subscribeToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { subscriptionType = 'all', preferences = {} } = req.body;

    const subscription = await RealtimeSubscription.createSubscription(
      req.brandId,
      req.user.id,
      taskId,
      req.projectId || null,
      subscriptionType,
      preferences
    );

    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to task updates'
    });
  } catch (error) {
    errorResponse(res, 500, 'SUBSCRIPTION_ERROR', 'Failed to subscribe to task', error);
  }
};

// @route   DELETE /api/tasks/:taskId/subscribe
// @desc    Unsubscribe from task updates
// @access  Private
exports.unsubscribeFromTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await RealtimeSubscription.findOneAndUpdate(
      { brand_id: req.brandId, userId: req.user.id, taskId: taskId },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from task updates'
    });
  } catch (error) {
    errorResponse(res, 500, 'UNSUBSCRIPTION_ERROR', 'Failed to unsubscribe from task', error);
  }
};

// @route   GET /api/comments/:commentId/statistics
// @desc    Get comment statistics
// @access  Private
exports.getCommentStatistics = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse(res, 404, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    const statistics = comment.getStatistics();

    res.status(200).json({
      success: true,
      data: statistics,
      message: 'Comment statistics retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'STATISTICS_ERROR', 'Failed to retrieve comment statistics', error);
  }
};

// @route   GET /api/tasks/:taskId/comment-analytics
// @desc    Get comment analytics for a task
// @access  Private
exports.getCommentAnalytics = async (req, res) => {
  try {
    const { taskId } = req.params;

    const analytics = await Comment.getCommentAnalytics(req.brandId, 'task', taskId);

    res.status(200).json({
      success: true,
      data: analytics[0] || {
        total_comments: 0,
        total_reactions: 0,
        total_mentions: 0,
        total_views: 0,
        avg_reactions_per_comment: 0
      },
      message: 'Comment analytics retrieved successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'ANALYTICS_ERROR', 'Failed to retrieve comment analytics', error);
  }
};

