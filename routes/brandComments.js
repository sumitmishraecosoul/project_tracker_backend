const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { brandContext } = require('../middleware/brandContext');
const brandCommentController = require('../controllers/brandCommentController');

// Comment CRUD Operations
// Get all comments for a brand
router.get('/:brandId/comments', auth, brandContext, brandCommentController.getBrandComments);

// Get comments for a specific entity (task, project, subtask, etc.)
router.get('/:brandId/:entityType/:entityId/comments', auth, brandContext, brandCommentController.getEntityComments);

// Get comment details
router.get('/:brandId/comments/:id', auth, brandContext, brandCommentController.getBrandCommentById);

// Create comment
router.post('/:brandId/:entityType/:entityId/comments', auth, brandContext, brandCommentController.createBrandComment);

// Update comment
router.put('/:brandId/comments/:id', auth, brandContext, brandCommentController.updateBrandComment);

// Delete comment
router.delete('/:brandId/comments/:id', auth, brandContext, brandCommentController.deleteBrandComment);

// Comment Threading
// Reply to comment
router.post('/:brandId/comments/:id/reply', auth, brandContext, brandCommentController.replyToComment);

// Get comment thread
router.get('/:brandId/comments/:id/thread', auth, brandContext, brandCommentController.getCommentThread);

// Comment Reactions
// React to comment
router.post('/:brandId/comments/:id/react', auth, brandContext, brandCommentController.reactToComment);

// Remove reaction from comment
router.delete('/:brandId/comments/:id/react', auth, brandContext, brandCommentController.removeReactionFromComment);

// Comment Mentions
// Mention user in comment
router.post('/:brandId/comments/:id/mention', auth, brandContext, brandCommentController.mentionUserInComment);

// Comment Permissions
// Update comment permissions
router.put('/:brandId/comments/:id/permissions', auth, brandContext, brandCommentController.updateCommentPermissions);

// Comment Moderation
// Moderate comment (approve/reject/flag)
router.put('/:brandId/comments/:id/moderate', auth, brandContext, brandCommentController.moderateComment);

// Comment Pinning
// Pin comment
router.put('/:brandId/comments/:id/pin', auth, brandContext, brandCommentController.pinComment);

// Unpin comment
router.put('/:brandId/comments/:id/unpin', auth, brandContext, brandCommentController.unpinComment);

// Comment Search & Filtering
// Search comments
router.get('/:brandId/comments/search', auth, brandContext, brandCommentController.searchComments);

// Filter comments
router.get('/:brandId/comments/filter', auth, brandContext, brandCommentController.filterComments);

// Comment Analytics
// Get comment analytics
router.get('/:brandId/comments/analytics', auth, brandContext, brandCommentController.getCommentAnalytics);

// Get comment analytics by ID
router.get('/:brandId/comments/:id/analytics', auth, brandContext, brandCommentController.getCommentAnalyticsById);

// Comment Attachments
// Upload attachment to comment
router.post('/:brandId/comments/:id/attachments', auth, brandContext, brandCommentController.uploadCommentAttachment);

// Delete attachment from comment
router.delete('/:brandId/comments/:id/attachments/:attachmentId', auth, brandContext, brandCommentController.deleteCommentAttachment);

// Comment History
// Get comment history
router.get('/:brandId/comments/:id/history', auth, brandContext, brandCommentController.getCommentHistory);

// Comment Export
// Export comments
router.get('/:brandId/comments/export', auth, brandContext, brandCommentController.exportComments);

module.exports = router;