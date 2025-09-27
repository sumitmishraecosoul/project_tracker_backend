const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all comments for a brand
const getBrandComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, entity_type, entity_id, status = 'active' } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      status: status
    };

    if (entity_type) {
      query.entity_type = entity_type;
    }

    if (entity_id) {
      query.entity_id = new mongoose.Types.ObjectId(entity_id);
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user', 'name email')
      .populate('parent_comment', 'content author')
      .sort({ is_pinned: -1, created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching brand comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand comments',
      error: error.message
    });
  }
};

// Get comments for a specific entity
const getEntityComments = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { page = 1, limit = 20, parent_comment = null } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      entity_type: entityType,
      entity_id: new mongoose.Types.ObjectId(entityId),
      status: 'active'
    };

    if (parent_comment === 'null' || parent_comment === null) {
      query.parent_comment = null;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user', 'name email')
      .populate('parent_comment', 'content author')
      .sort({ is_pinned: -1, created_at: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching entity comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entity comments',
      error: error.message
    });
  }
};

// Get comment details
const getBrandCommentById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    })
      .populate('author', 'name email avatar')
      .populate('mentions.user', 'name email')
      .populate('parent_comment', 'content author')
      .populate('reactions.user', 'name email avatar');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error fetching comment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment details',
      error: error.message
    });
  }
};

// Create comment
const createBrandComment = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { content, parent_comment, mentions = [], attachments = [] } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is too long (max 5000 characters)'
      });
    }

    // Create comment
    const comment = new Comment({
      brand_id: new mongoose.Types.ObjectId(brandId),
      content: content.trim(),
      author: new mongoose.Types.ObjectId(userId),
      entity_type: entityType,
      entity_id: new mongoose.Types.ObjectId(entityId),
      parent_comment: parent_comment ? new mongoose.Types.ObjectId(parent_comment) : null,
      mentions: mentions.map(mention => ({
        user: new mongoose.Types.ObjectId(mention),
        mentioned_at: new Date(),
        notified: false
      })),
      attachments: attachments,
      metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        device_type: req.get('X-Device-Type') || 'unknown',
        browser: req.get('X-Browser') || 'unknown'
      }
    });

    await comment.save();

    // Populate the comment
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user', 'name email');

    // Create activity
    const activity = new Activity({
      brand_id: new mongoose.Types.ObjectId(brandId),
      created_by: new mongoose.Types.ObjectId(userId),
      type: 'comment_added',
      title: 'New comment added',
      description: `A new comment was added to ${entityType}`,
      metadata: {
        entity_type: entityType,
        entity_id: new mongoose.Types.ObjectId(entityId),
        entity_title: `${entityType} comment`,
        old_values: null,
        new_values: { content: content.trim() },
        additional_data: { comment_id: comment._id }
      },
      recipients: mentions.map(mention => ({
        user: new mongoose.Types.ObjectId(mention),
        role: 'mentioned',
        notification_sent: false,
        read: false,
        notified: false
      }))
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// Update comment
const updateBrandComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can edit this comment
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment'
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is too long (max 5000 characters)'
      });
    }

    // Update comment
    await comment.editComment(content.trim(), userId);
    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions.user', 'name email');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

// Delete comment
const deleteBrandComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can delete this comment
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    // Soft delete
    comment.status = 'deleted';
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// Reply to comment
const replyToComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { content, mentions = [] } = req.body;
    const userId = req.user.id;

    // Find parent comment
    const parentComment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Create reply
    const reply = new Comment({
      brand_id: new mongoose.Types.ObjectId(brandId),
      content: content.trim(),
      author: new mongoose.Types.ObjectId(userId),
      entity_type: parentComment.entity_type,
      entity_id: parentComment.entity_id,
      parent_comment: new mongoose.Types.ObjectId(id),
      mentions: mentions.map(mention => ({
        user: new mongoose.Types.ObjectId(mention),
        mentioned_at: new Date(),
        notified: false
      })),
      metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        device_type: req.get('X-Device-Type') || 'unknown',
        browser: req.get('X-Browser') || 'unknown'
      }
    });

    await reply.save();

    // Update parent comment reply count
    parentComment.analytics.reply_count += 1;
    await parentComment.save();

    // Populate the reply
    await reply.populate('author', 'name email avatar');
    await reply.populate('mentions.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: reply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reply',
      error: error.message
    });
  }
};

// Get comment thread
const getCommentThread = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const thread = await Comment.getCommentThread(id, new mongoose.Types.ObjectId(brandId));

    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Error fetching comment thread:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment thread',
      error: error.message
    });
  }
};

// React to comment
const reactToComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Add reaction
    await comment.addReaction(userId, emoji);
    await comment.populate('reactions.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction',
      error: error.message
    });
  }
};

// Remove reaction from comment
const removeReactionFromComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove reaction
    await comment.removeReaction(userId);
    await comment.populate('reactions.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing reaction',
      error: error.message
    });
  }
};

// Mention user in comment
const mentionUserInComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { userId: mentionedUserId } = req.body;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Add mention
    await comment.addMention(mentionedUserId);
    await comment.populate('mentions.user', 'name email');

    res.json({
      success: true,
      message: 'User mentioned successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error mentioning user:', error);
    res.status(500).json({
      success: false,
      message: 'Error mentioning user',
      error: error.message
    });
  }
};

// Update comment permissions
const updateCommentPermissions = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { permissions } = req.body;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Update permissions
    comment.permissions = { ...comment.permissions, ...permissions };
    await comment.save();

    res.json({
      success: true,
      message: 'Comment permissions updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment permissions',
      error: error.message
    });
  }
};

// Moderate comment
const moderateComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { status } = req.body;
    const moderatorId = req.user.id;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Moderate comment
    await comment.moderateComment(status, moderatorId);

    res.json({
      success: true,
      message: 'Comment moderated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error moderating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating comment',
      error: error.message
    });
  }
};

// Pin comment
const pinComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Pin comment
    await comment.pinComment();

    res.json({
      success: true,
      message: 'Comment pinned successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error pinning comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error pinning comment',
      error: error.message
    });
  }
};

// Unpin comment
const unpinComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Unpin comment
    await comment.unpinComment();

    res.json({
      success: true,
      message: 'Comment unpinned successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error unpinning comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpinning comment',
      error: error.message
    });
  }
};

// Search comments
const searchComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const comments = await Comment.searchComments(
      new mongoose.Types.ObjectId(brandId),
      q,
      { limit: limit * 1, skip: (page - 1) * limit }
    );

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          pages: Math.ceil(comments.length / limit),
          total: comments.length
        }
      }
    });
  } catch (error) {
    console.error('Error searching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching comments',
      error: error.message
    });
  }
};

// Filter comments
const filterComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, author, status, is_pinned, date_from, date_to, page = 1, limit = 20 } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId)
    };

    if (entity_type) query.entity_type = entity_type;
    if (entity_id) query.entity_id = new mongoose.Types.ObjectId(entity_id);
    if (author) query.author = new mongoose.Types.ObjectId(author);
    if (status) query.status = status;
    if (is_pinned !== undefined) query.is_pinned = is_pinned === 'true';

    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user', 'name email')
      .sort({ is_pinned: -1, created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error filtering comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering comments',
      error: error.message
    });
  }
};

// Get comment analytics
const getCommentAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, date_from, date_to } = req.query;

    const analytics = await Comment.getCommentAnalytics(
      new mongoose.Types.ObjectId(brandId),
      { entity_type, entity_id, date_from, date_to }
    );

    res.json({
      success: true,
      data: analytics[0] || {
        total_comments: 0,
        total_reactions: 0,
        total_mentions: 0,
        total_attachments: 0,
        avg_reactions_per_comment: 0,
        avg_mentions_per_comment: 0,
        comments_by_entity_type: []
      }
    });
  } catch (error) {
    console.error('Error fetching comment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment analytics',
      error: error.message
    });
  }
};

// Get comment analytics by ID
const getCommentAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const analytics = {
      view_count: comment.analytics.view_count,
      reply_count: comment.analytics.reply_count,
      reaction_count: comment.analytics.reaction_count,
      mention_count: comment.analytics.mention_count,
      reactions: comment.reactions,
      mentions: comment.mentions,
      attachments: comment.attachments
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching comment analytics by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment analytics by ID',
      error: error.message
    });
  }
};

// Upload comment attachment
const uploadCommentAttachment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { filename, original_name, file_size, file_type, file_url } = req.body;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Add attachment
    comment.attachments.push({
      filename,
      original_name,
      file_size,
      file_type,
      file_url,
      uploaded_at: new Date()
    });

    await comment.save();

    res.json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading attachment',
      error: error.message
    });
  }
};

// Delete comment attachment
const deleteCommentAttachment = async (req, res) => {
  try {
    const { brandId, id, attachmentId } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove attachment
    comment.attachments = comment.attachments.filter(
      attachment => attachment._id.toString() !== attachmentId
    );

    await comment.save();

    res.json({
      success: true,
      message: 'Attachment deleted successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attachment',
      error: error.message
    });
  }
};

// Get comment history
const getCommentHistory = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      data: comment.history
    });
  } catch (error) {
    console.error('Error fetching comment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment history',
      error: error.message
    });
  }
};

// Export comments
const exportComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, date_from, date_to, format = 'json' } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      status: 'active'
    };

    if (entity_type) query.entity_type = entity_type;
    if (entity_id) query.entity_id = new mongoose.Types.ObjectId(entity_id);

    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email')
      .populate('mentions.user', 'name email')
      .sort({ created_at: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: comment.author.name,
        entity_type: comment.entity_type,
        entity_id: comment.entity_id,
        created_at: comment.created_at,
        reactions: comment.reactions.length,
        mentions: comment.mentions.length
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=comments.csv');
      res.json({
        success: true,
        data: csvData
      });
    } else {
      res.json({
        success: true,
        data: comments
      });
    }
  } catch (error) {
    console.error('Error exporting comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting comments',
      error: error.message
    });
  }
};

module.exports = {
  getBrandComments,
  getEntityComments,
  getBrandCommentById,
  createBrandComment,
  updateBrandComment,
  deleteBrandComment,
  replyToComment,
  getCommentThread,
  reactToComment,
  removeReactionFromComment,
  mentionUserInComment,
  updateCommentPermissions,
  moderateComment,
  pinComment,
  unpinComment,
  searchComments,
  filterComments,
  getCommentAnalytics,
  getCommentAnalyticsById,
  uploadCommentAttachment,
  deleteCommentAttachment,
  getCommentHistory,
  exportComments
};