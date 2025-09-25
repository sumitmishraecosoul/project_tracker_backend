const express = require('express');
const router = express.Router();
const brandNotificationController = require('../controllers/brandNotificationController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware notification routes
// All routes require authentication and brand context

// Get all notifications for a specific brand
router.get('/:brandId/notifications', auth, brandContext, brandNotificationController.getBrandNotifications);

// Get user notifications within a brand
router.get('/:brandId/notifications/user/me', auth, brandContext, brandNotificationController.getUserNotifications);

// Get notification preferences (must come before /:id routes)
router.get('/:brandId/notifications/preferences', auth, brandContext, brandNotificationController.getNotificationPreferences);

// Update notification preferences (must come before /:id routes)
router.put('/:brandId/notifications/preferences', auth, brandContext, brandNotificationController.updateNotificationPreferences);

// Get notification analytics (must come before /:id routes)
router.get('/:brandId/notifications/analytics', auth, brandContext, brandNotificationController.getNotificationAnalytics);

// Search notifications (must come before /:id routes)
router.get('/:brandId/notifications/search', auth, brandContext, brandNotificationController.searchNotifications);

// Export notifications (must come before /:id routes)
router.get('/:brandId/notifications/export', auth, brandContext, brandNotificationController.exportNotifications);

// Mark multiple notifications as read (must come before /:id routes)
router.put('/:brandId/notifications/read-multiple', auth, brandContext, brandNotificationController.markMultipleNotificationsAsRead);

// Mark all notifications as read (must come before /:id routes)
router.put('/:brandId/notifications/read-all', auth, brandContext, brandNotificationController.markAllNotificationsAsRead);

// Get notification details within a brand
router.get('/:brandId/notifications/:id', auth, brandContext, brandNotificationController.getBrandNotificationById);

// Create notification within a brand
router.post('/:brandId/notifications', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandNotificationController.createBrandNotification);

// Update notification within a brand
router.put('/:brandId/notifications/:id', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandNotificationController.updateBrandNotification);

// Delete notification within a brand
router.delete('/:brandId/notifications/:id', auth, brandContext, authorize(['admin', 'manager']), brandNotificationController.deleteBrandNotification);

// Mark notification as read
router.put('/:brandId/notifications/:id/read', auth, brandContext, brandNotificationController.markNotificationAsRead);

// Archive notification
router.put('/:brandId/notifications/:id/archive', auth, brandContext, brandNotificationController.archiveNotification);

module.exports = router;