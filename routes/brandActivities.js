const express = require('express');
const router = express.Router();
const brandActivityController = require('../controllers/brandActivityController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware activity routes
// All routes require authentication and brand context

// Get all activities for a specific brand
router.get('/:brandId/activities', auth, brandContext, brandActivityController.getBrandActivities);

// Get activity details within a brand
router.get('/:brandId/activities/:id', auth, brandContext, brandActivityController.getBrandActivityById);

// Get user activity feed
router.get('/:brandId/activities/feed', auth, brandContext, brandActivityController.getUserActivityFeed);

// Get activities by entity (task, project, subtask)
router.get('/:brandId/:entityType/:entityId/activities', auth, brandContext, brandActivityController.getEntityActivities);

// Create activity within a brand
router.post('/:brandId/activities', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandActivityController.createBrandActivity);

// Update activity within a brand
router.put('/:brandId/activities/:id', auth, brandContext, authorize(['admin', 'manager']), brandActivityController.updateBrandActivity);

// Delete activity within a brand
router.delete('/:brandId/activities/:id', auth, brandContext, authorize(['admin']), brandActivityController.deleteBrandActivity);

// Activity recipients management
router.post('/:brandId/activities/:id/recipients', auth, brandContext, authorize(['admin', 'manager']), brandActivityController.addActivityRecipient);

router.delete('/:brandId/activities/:id/recipients/:userId', auth, brandContext, authorize(['admin', 'manager']), brandActivityController.removeActivityRecipient);

// Activity status management
router.put('/:brandId/activities/:id/read', auth, brandContext, brandActivityController.markActivityAsRead);

router.put('/:brandId/activities/:id/notified', auth, brandContext, brandActivityController.markActivityAsNotified);

router.put('/:brandId/activities/:id/archive', auth, brandContext, authorize(['admin', 'manager']), brandActivityController.archiveActivity);

// Activity filtering and search
router.get('/:brandId/activities/search', auth, brandContext, brandActivityController.searchActivities);

router.get('/:brandId/activities/filter', auth, brandContext, brandActivityController.filterActivities);

// Activity analytics
router.get('/:brandId/activities/analytics', auth, brandContext, brandActivityController.getActivityAnalytics);

router.get('/:brandId/activities/:id/analytics', auth, brandContext, brandActivityController.getActivityAnalyticsById);

// Activity export
router.get('/:brandId/activities/export', auth, brandContext, authorize(['admin', 'manager']), brandActivityController.exportActivities);

// Activity notifications
router.get('/:brandId/activities/notifications', auth, brandContext, brandActivityController.getActivityNotifications);

router.put('/:brandId/activities/notifications/:id/read', auth, brandContext, brandActivityController.markNotificationAsRead);

router.put('/:brandId/activities/notifications/:id/unread', auth, brandContext, brandActivityController.markNotificationAsUnread);

// Activity preferences
router.get('/:brandId/activities/preferences', auth, brandContext, brandActivityController.getActivityPreferences);

router.put('/:brandId/activities/preferences', auth, brandContext, brandActivityController.updateActivityPreferences);

module.exports = router;
