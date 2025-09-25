const express = require('express');
const router = express.Router();
const brandCommentController = require('../controllers/brandCommentController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware comment routes
// All routes require authentication and brand context

// Get all comments for a specific entity within a brand
router.get('/:brandId/comments', auth, brandContext, brandCommentController.getBrandComments);

// Get comments for a specific entity (task, project, subtask)
router.get('/:brandId/:entityType/:entityId/comments', auth, brandContext, brandCommentController.getEntityComments);

// Get comment details within a brand
router.get('/:brandId/comments/:id', auth, brandContext, brandCommentController.getBrandCommentById);

// Create comment within a brand
router.post('/:brandId/:entityType/:entityId/comments', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.createBrandComment);

// Update comment within a brand
router.put('/:brandId/comments/:id', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.updateBrandComment);

// Delete comment within a brand
router.delete('/:brandId/comments/:id', auth, brandContext, authorize(['admin', 'manager']), brandCommentController.deleteBrandComment);

// Comment threading and replies
router.post('/:brandId/comments/:id/reply', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.replyToComment);

// Get comment thread
router.get('/:brandId/comments/:id/thread', auth, brandContext, brandCommentController.getCommentThread);

// Comment reactions
router.post('/:brandId/comments/:id/react', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.reactToComment);

router.delete('/:brandId/comments/:id/react', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.removeReaction);

// Comment mentions
router.post('/:brandId/comments/:id/mention', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.mentionUser);

// Comment permissions
router.put('/:brandId/comments/:id/permissions', auth, brandContext, authorize(['admin', 'manager']), brandCommentController.updateCommentPermissions);

// Comment moderation
router.put('/:brandId/comments/:id/moderate', auth, brandContext, authorize(['admin']), brandCommentController.moderateComment);

// Comment pinning
router.put('/:brandId/comments/:id/pin', auth, brandContext, authorize(['admin', 'manager']), brandCommentController.pinComment);

router.put('/:brandId/comments/:id/unpin', auth, brandContext, authorize(['admin', 'manager']), brandCommentController.unpinComment);

// Comment search and filtering
router.get('/:brandId/comments/search', auth, brandContext, brandCommentController.searchComments);

router.get('/:brandId/comments/filter', auth, brandContext, brandCommentController.filterComments);

// Comment analytics
router.get('/:brandId/comments/analytics', auth, brandContext, brandCommentController.getCommentAnalytics);

router.get('/:brandId/comments/:id/analytics', auth, brandContext, brandCommentController.getCommentAnalyticsById);

// Comment attachments
router.post('/:brandId/comments/:id/attachments', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.uploadCommentAttachment);

router.delete('/:brandId/comments/:id/attachments/:attachmentId', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandCommentController.deleteCommentAttachment);

// Comment history
router.get('/:brandId/comments/:id/history', auth, brandContext, brandCommentController.getCommentHistory);

// Comment export
router.get('/:brandId/comments/export', auth, brandContext, authorize(['admin', 'manager']), brandCommentController.exportComments);

module.exports = router;
