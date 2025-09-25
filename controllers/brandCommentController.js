const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Subtask = require('../models/Subtask');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/comments';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Get all comments for a specific brand
const getBrandComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, entity_type, entity_id, type, author, status } = req.query;

    // Build query with brand filter
    let query = { brand_id: brandId };

    // Apply additional filters
    if (entity_type) {
      query.entity_type = entity_type;
    }
    if (entity_id) {
      query.entity_id = entity_id;
    }
    if (type) {
      query.type = type;
    }
    if (author) {
      query.author = author;
    }
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments with pagination
    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.user_id', 'name email')
      .populate('parent_comment', 'content author')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Brand comments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand comments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_COMMENTS_FETCH_ERROR',
        message: 'Failed to fetch brand comments',
        details: error.message
      }
    });
  }
};

// Get comments for a specific entity
const getEntityComments = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { page = 1, limit = 20, parent_comment, type } = req.query;

    // Validate entity type
    if (!['task', 'project', 'subtask'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ENTITY_TYPE',
          message: 'Invalid entity type. Must be task, project, or subtask'
        }
      });
    }

    // Check if entity exists
    let entity;
    switch (entityType) {
      case 'task':
        entity = await Task.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'project':
        entity = await Project.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'subtask':
        entity = await Subtask.findOne({ _id: entityId, brand_id: brandId });
        break;
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTITY_NOT_FOUND',
          message: 'Entity not found in this brand'
        }
      });
    }

    // Build query
    let query = {
      brand_id: brandId,
      entity_type: entityType,
      entity_id: entityId,
      status: { $ne: 'deleted' }
    };

    if (parent_comment === 'null' || parent_comment === null) {
      query.parent_comment = null;
    } else if (parent_comment) {
      query.parent_comment = parent_comment;
    }

    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.user_id', 'name email')
      .populate('parent_comment', 'content author')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Entity comments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching entity comments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ENTITY_COMMENTS_FETCH_ERROR',
        message: 'Failed to fetch entity comments',
        details: error.message
      }
    });
  }
};

// Get comment details within a brand
const getBrandCommentById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId })
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.user_id', 'name email')
      .populate('parent_comment', 'content author');

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Increment view count
    comment.analytics.view_count += 1;
    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Brand comment details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand comment details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_COMMENT_FETCH_ERROR',
        message: 'Failed to fetch brand comment details',
        details: error.message
      }
    });
  }
};

// Create comment within a brand
const createBrandComment = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { content, parent_comment, type, visibility, mentions } = req.body;

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment content is required'
        }
      });
    }

    // Validate entity type
    if (!['task', 'project', 'subtask'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ENTITY_TYPE',
          message: 'Invalid entity type. Must be task, project, or subtask'
        }
      });
    }

    // Check if entity exists
    let entity;
    switch (entityType) {
      case 'task':
        entity = await Task.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'project':
        entity = await Project.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'subtask':
        entity = await Subtask.findOne({ _id: entityId, brand_id: brandId });
        break;
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTITY_NOT_FOUND',
          message: 'Entity not found in this brand'
        }
      });
    }

    // Process mentions
    const processedMentions = [];
    if (mentions && Array.isArray(mentions)) {
      for (const mention of mentions) {
        const user = await User.findOne({ _id: mention.user_id, brand_id: brandId });
        if (user) {
          processedMentions.push({
            user_id: mention.user_id,
            position: mention.position,
            length: mention.length
          });
        }
      }
    }

    // Create comment
    const comment = await Comment.create({
      brand_id: brandId,
      entity_type: entityType,
      entity_id: entityId,
      content: content.trim(),
      author: req.user.id,
      parent_comment: parent_comment || null,
      type: type || 'comment',
      visibility: visibility || 'public',
      mentions: processedMentions
    });

    // Populate the created comment
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('parent_comment', 'content author');

    // Create activity
    await Activity.createActivity({
      brand_id: brandId,
      type: 'comment_created',
      action: 'created a comment',
      description: `Commented on ${entityType}: ${entity.title || entity.task || entity.name}`,
      actor: req.user.id,
      target: {
        type: entityType,
        id: entityId,
        name: entity.title || entity.task || entity.name
      },
      context: {
        project_id: entityType === 'project' ? entityId : entity.projectId,
        task_id: entityType === 'task' ? entityId : (entityType === 'subtask' ? entity.task_id : null),
        subtask_id: entityType === 'subtask' ? entityId : null
      },
      recipients: [
        { user_id: req.user.id, role: 'actor' }
      ]
    });

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Brand comment created successfully'
    });
  } catch (error) {
    console.error('Error creating brand comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_COMMENT_CREATE_ERROR',
        message: 'Failed to create brand comment',
        details: error.message
      }
    });
  }
};

// Update comment within a brand
const updateBrandComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { content, visibility, mentions } = req.body;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user can edit comment
    if (!comment.canUserEdit(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to edit this comment'
        }
      });
    }

    // Process mentions
    const processedMentions = [];
    if (mentions && Array.isArray(mentions)) {
      for (const mention of mentions) {
        const user = await User.findOne({ _id: mention.user_id, brand_id: brandId });
        if (user) {
          processedMentions.push({
            user_id: mention.user_id,
            position: mention.position,
            length: mention.length
          });
        }
      }
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        content: content || comment.content,
        visibility: visibility || comment.visibility,
        mentions: processedMentions.length > 0 ? processedMentions : comment.mentions
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar')
     .populate('mentions.user_id', 'name email')
     .populate('reactions.user_id', 'name email');

    res.json({
      success: true,
      data: updatedComment,
      message: 'Brand comment updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_COMMENT_UPDATE_ERROR',
        message: 'Failed to update brand comment',
        details: error.message
      }
    });
  }
};

// Delete comment within a brand
const deleteBrandComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user can delete comment
    if (!comment.canUserDelete(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to delete this comment'
        }
      });
    }

    // Soft delete comment
    comment.status = 'deleted';
    await comment.save();

    res.json({
      success: true,
      message: 'Brand comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_COMMENT_DELETE_ERROR',
        message: 'Failed to delete brand comment',
        details: error.message
      }
    });
  }
};

// Reply to comment
const replyToComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { content, mentions } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Reply content is required'
        }
      });
    }

    const parentComment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Parent comment not found in this brand'
        }
      });
    }

    // Process mentions
    const processedMentions = [];
    if (mentions && Array.isArray(mentions)) {
      for (const mention of mentions) {
        const user = await User.findOne({ _id: mention.user_id, brand_id: brandId });
        if (user) {
          processedMentions.push({
            user_id: mention.user_id,
            position: mention.position,
            length: mention.length
          });
        }
      }
    }

    // Create reply
    const reply = await Comment.create({
      brand_id: brandId,
      entity_type: parentComment.entity_type,
      entity_id: parentComment.entity_id,
      content: content.trim(),
      author: req.user.id,
      parent_comment: id,
      type: 'reply',
      mentions: processedMentions
    });

    const populatedReply = await Comment.findById(reply._id)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('parent_comment', 'content author');

    res.status(201).json({
      success: true,
      data: populatedReply,
      message: 'Comment reply created successfully'
    });
  } catch (error) {
    console.error('Error creating comment reply:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_REPLY_CREATE_ERROR',
        message: 'Failed to create comment reply',
        details: error.message
      }
    });
  }
};

// Get comment thread
const getCommentThread = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    const thread = await comment.getThread();

    res.json({
      success: true,
      data: thread,
      message: 'Comment thread retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching comment thread:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_THREAD_FETCH_ERROR',
        message: 'Failed to fetch comment thread',
        details: error.message
      }
    });
  }
};

// React to comment
const reactToComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Emoji is required for reaction'
        }
      });
    }

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user can react
    if (!comment.canUserReact(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to react to this comment'
        }
      });
    }

    await comment.addReaction(req.user.id, emoji);

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name email avatar')
      .populate('reactions.user_id', 'name email');

    res.json({
      success: true,
      data: updatedComment,
      message: 'Reaction added successfully'
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REACTION_ADD_ERROR',
        message: 'Failed to add reaction',
        details: error.message
      }
    });
  }
};

// Remove reaction
const removeReaction = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    await comment.removeReaction(req.user.id);

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name email avatar')
      .populate('reactions.user_id', 'name email');

    res.json({
      success: true,
      data: updatedComment,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REACTION_REMOVE_ERROR',
        message: 'Failed to remove reaction',
        details: error.message
      }
    });
  }
};

// Mention user in comment
const mentionUser = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { user_id, position, length } = req.body;

    if (!user_id || position === undefined || !length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user_id, position, and length are required'
        }
      });
    }

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user exists in brand
    const user = await User.findOne({ _id: user_id, brand_id: brandId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in this brand'
        }
      });
    }

    await comment.addMention(user_id, position, length);

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email');

    res.json({
      success: true,
      data: updatedComment,
      message: 'User mentioned successfully'
    });
  } catch (error) {
    console.error('Error mentioning user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MENTION_ERROR',
        message: 'Failed to mention user',
        details: error.message
      }
    });
  }
};

// Update comment permissions
const updateCommentPermissions = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { can_edit, can_delete, can_react } = req.body;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Update permissions
    if (can_edit) {
      comment.permissions.can_edit = can_edit;
    }
    if (can_delete) {
      comment.permissions.can_delete = can_delete;
    }
    if (can_react) {
      comment.permissions.can_react = can_react;
    }

    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Comment permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating comment permissions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_PERMISSIONS_UPDATE_ERROR',
        message: 'Failed to update comment permissions',
        details: error.message
      }
    });
  }
};

// Moderate comment
const moderateComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { action, reason } = req.body;

    if (!action || !['approve', 'reject', 'flag'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid moderation action. Must be approve, reject, or flag'
        }
      });
    }

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Update comment status based on action
    switch (action) {
      case 'approve':
        comment.status = 'active';
        break;
      case 'reject':
        comment.status = 'moderated';
        break;
      case 'flag':
        comment.status = 'moderated';
        break;
    }

    if (reason) {
      comment.metadata.additional_data = { moderation_reason: reason };
    }

    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Comment moderated successfully'
    });
  } catch (error) {
    console.error('Error moderating comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_MODERATION_ERROR',
        message: 'Failed to moderate comment',
        details: error.message
      }
    });
  }
};

// Pin comment
const pinComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    comment.metadata.is_pinned = true;
    comment.metadata.pinned_at = new Date();
    comment.metadata.pinned_by = req.user.id;

    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Comment pinned successfully'
    });
  } catch (error) {
    console.error('Error pinning comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_PIN_ERROR',
        message: 'Failed to pin comment',
        details: error.message
      }
    });
  }
};

// Unpin comment
const unpinComment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    comment.metadata.is_pinned = false;
    comment.metadata.pinned_at = undefined;
    comment.metadata.pinned_by = undefined;

    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Comment unpinned successfully'
    });
  } catch (error) {
    console.error('Error unpinning comment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_UNPIN_ERROR',
        message: 'Failed to unpin comment',
        details: error.message
      }
    });
  }
};

// Search comments
const searchComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 20, entity_type, entity_id } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required'
        }
      });
    }

    let query = {
      brand_id: brandId,
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { 'mentions.user_id': { $regex: q, $options: 'i' } }
      ],
      status: { $ne: 'deleted' }
    };

    if (entity_type) {
      query.entity_type = entity_type;
    }
    if (entity_id) {
      query.entity_id = entity_id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.user_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Comment search completed successfully'
    });
  } catch (error) {
    console.error('Error searching comments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_SEARCH_ERROR',
        message: 'Failed to search comments',
        details: error.message
      }
    });
  }
};

// Filter comments
const filterComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, type, author, status, date_from, date_to, page = 1, limit = 20 } = req.query;

    let query = { brand_id: brandId };

    if (entity_type) {
      query.entity_type = entity_type;
    }
    if (entity_id) {
      query.entity_id = entity_id;
    }
    if (type) {
      query.type = type;
    }
    if (author) {
      query.author = author;
    }
    if (status) {
      query.status = status;
    }
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        query.created_at.$lte = new Date(date_to);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('mentions.user_id', 'name email')
      .populate('reactions.user_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Comment filtering completed successfully'
    });
  } catch (error) {
    console.error('Error filtering comments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_FILTER_ERROR',
        message: 'Failed to filter comments',
        details: error.message
      }
    });
  }
};

// Get comment analytics
const getCommentAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, date_from, date_to } = req.query;

    let matchStage = { brand_id: new mongoose.Types.ObjectId(brandId) };

    if (entity_type) {
      matchStage.entity_type = entity_type;
    }
    if (entity_id) {
      matchStage.entity_id = new mongoose.Types.ObjectId(entity_id);
    }
    if (date_from) {
      matchStage.created_at = { $gte: new Date(date_from) };
    }
    if (date_to) {
      matchStage.created_at = { ...matchStage.created_at, $lte: new Date(date_to) };
    }

    const analytics = await Comment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total_comments: { $sum: 1 },
          total_reactions: { $sum: '$analytics.reaction_count' },
          total_mentions: { $sum: '$analytics.mention_count' },
          total_views: { $sum: '$analytics.view_count' },
          avg_reactions_per_comment: { $avg: '$analytics.reaction_count' }
        }
      }
    ]);

    res.json({
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
    console.error('Error fetching comment analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch comment analytics',
        details: error.message
      }
    });
  }
};

// Get comment analytics by ID
const getCommentAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    const statistics = comment.getStatistics();

    res.json({
      success: true,
      data: {
        comment_id: comment._id,
        statistics
      },
      message: 'Comment analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching comment analytics by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch comment analytics',
        details: error.message
      }
    });
  }
};

// Upload comment attachment
const uploadCommentAttachment = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user can edit comment
    if (!comment.canUserEdit(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to edit this comment'
        }
      });
    }

    // Handle file upload
    upload.single('attachment')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: err.message
          }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded'
          }
        });
      }

      // Add attachment to comment
      comment.attachments.push({
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        url: `/uploads/comments/${req.file.filename}`
      });

      await comment.save();

      res.json({
        success: true,
        data: comment,
        message: 'Comment attachment uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Error uploading comment attachment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_ATTACHMENT_UPLOAD_ERROR',
        message: 'Failed to upload comment attachment',
        details: error.message
      }
    });
  }
};

// Delete comment attachment
const deleteCommentAttachment = async (req, res) => {
  try {
    const { brandId, id, attachmentId } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    // Check if user can edit comment
    if (!comment.canUserEdit(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to edit this comment'
        }
      });
    }

    // Find and remove attachment
    const attachment = comment.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ATTACHMENT_NOT_FOUND',
          message: 'Attachment not found'
        }
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', 'comments', attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    attachment.remove();
    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: 'Comment attachment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment attachment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_ATTACHMENT_DELETE_ERROR',
        message: 'Failed to delete comment attachment',
        details: error.message
      }
    });
  }
};

// Get comment history
const getCommentHistory = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const comment = await Comment.findOne({ _id: id, brand_id: brandId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: {
        comment_id: comment._id,
        history: comment.history
      },
      message: 'Comment history retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching comment history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_HISTORY_FETCH_ERROR',
        message: 'Failed to fetch comment history',
        details: error.message
      }
    });
  }
};

// Export comments
const exportComments = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { entity_type, entity_id, format = 'json' } = req.query;

    let query = { brand_id: brandId };

    if (entity_type) {
      query.entity_type = entity_type;
    }
    if (entity_id) {
      query.entity_id = entity_id;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email')
      .populate('mentions.user_id', 'name email')
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
        updated_at: comment.updated_at
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="comments.csv"');
      res.json({
        success: true,
        data: csvData,
        message: 'Comments exported successfully'
      });
    } else {
      res.json({
        success: true,
        data: comments,
        message: 'Comments exported successfully'
      });
    }
  } catch (error) {
    console.error('Error exporting comments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_EXPORT_ERROR',
        message: 'Failed to export comments',
        details: error.message
      }
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
  removeReaction,
  mentionUser,
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
