const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { brandContext } = require('../middleware/brandContext');
const brandActivityController = require('../controllers/brandActivityController');

// Activity CRUD Operations
// Get all activities for a brand
router.get('/:brandId/activities', auth, brandContext, brandActivityController.getBrandActivities);

// Get activity details
router.get('/:brandId/activities/:id', auth, brandContext, brandActivityController.getBrandActivityById);

// Get user activity feed
router.get('/:brandId/activities/feed', auth, brandContext, brandActivityController.getUserActivityFeed);

// Get activities for a specific entity (task, project, subtask, etc.)
router.get('/:brandId/:entityType/:entityId/activities', auth, brandContext, brandActivityController.getEntityActivities);

// Create activity
router.post('/:brandId/activities', auth, brandContext, brandActivityController.createBrandActivity);

// Update activity
router.put('/:brandId/activities/:id', auth, brandContext, brandActivityController.updateBrandActivity);

// Delete activity
router.delete('/:brandId/activities/:id', auth, brandContext, brandActivityController.deleteBrandActivity);

// Activity Recipients
// Add recipient to activity
router.post('/:brandId/activities/:id/recipients', auth, brandContext, brandActivityController.addActivityRecipient);

// Remove recipient from activity
router.delete('/:brandId/activities/:id/recipients/:userId', auth, brandContext, brandActivityController.removeActivityRecipient);

// Activity Status Management
// Mark activity as read
router.put('/:brandId/activities/:id/read', auth, brandContext, brandActivityController.markActivityAsRead);

// Mark activity as notified
router.put('/:brandId/activities/:id/notified', auth, brandContext, brandActivityController.markActivityAsNotified);

// Archive activity
router.put('/:brandId/activities/:id/archive', auth, brandContext, brandActivityController.archiveActivity);

// Activity Search & Filtering
// Search activities
router.get('/:brandId/activities/search', auth, brandContext, brandActivityController.searchActivities);

// Filter activities
router.get('/:brandId/activities/filter', auth, brandContext, brandActivityController.filterActivities);

// Activity Analytics
// Get activity analytics
router.get('/:brandId/activities/analytics', auth, brandContext, brandActivityController.getActivityAnalytics);

// Get activity analytics by ID
router.get('/:brandId/activities/:id/analytics', auth, brandContext, brandActivityController.getActivityAnalyticsById);

// Activity Export
// Export activities
router.get('/:brandId/activities/export', auth, brandContext, brandActivityController.exportActivities);

// Activity Notifications
// Get notifications
router.get('/:brandId/activities/notifications', auth, brandContext, brandActivityController.getNotifications);

// Mark notification as read
router.put('/:brandId/activities/notifications/:id/read', auth, brandContext, brandActivityController.markNotificationAsRead);

// Mark notification as unread
router.put('/:brandId/activities/notifications/:id/unread', auth, brandContext, brandActivityController.markNotificationAsUnread);

// Activity Preferences
// Get activity preferences
router.get('/:brandId/activities/preferences', auth, brandContext, brandActivityController.getActivityPreferences);

// Update activity preferences
router.put('/:brandId/activities/preferences', auth, brandContext, brandActivityController.updateActivityPreferences);

module.exports = router;