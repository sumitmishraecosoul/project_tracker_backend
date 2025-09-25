const express = require('express');
const router = express.Router();
const advancedCommentController = require('../controllers/advancedCommentController');
const auth = require('../middleware/auth');
const { brandContext } = require('../middleware/brandContext');
const { authorize } = require('../middleware/authorize');

// Apply auth and brandContext middleware to all routes
router.use(auth);
router.use(brandContext);

// Comment Management Routes
router.get('/tasks/:taskId/comments', authorize(['admin', 'manager', 'employee']), advancedCommentController.getComments);
router.post('/tasks/:taskId/comments', authorize(['admin', 'manager', 'employee']), advancedCommentController.createComment);
router.put('/comments/:commentId', authorize(['admin', 'manager', 'employee']), advancedCommentController.updateComment);
router.delete('/comments/:commentId', authorize(['admin', 'manager', 'employee']), advancedCommentController.deleteComment);

// Reply Management Routes
router.get('/comments/:commentId/replies', authorize(['admin', 'manager', 'employee']), advancedCommentController.getReplies);
router.post('/comments/:commentId/replies', authorize(['admin', 'manager', 'employee']), advancedCommentController.addReply);

// Reaction Management Routes
router.post('/comments/:commentId/reactions', authorize(['admin', 'manager', 'employee']), advancedCommentController.addReaction);
router.delete('/comments/:commentId/reactions/:reactionId', authorize(['admin', 'manager', 'employee']), advancedCommentController.removeReaction);

// Activity Management Routes
router.get('/tasks/:taskId/activities', authorize(['admin', 'manager', 'employee']), advancedCommentController.getActivities);

// Mention Suggestions Route
router.get('/brands/:brandId/mention-suggestions', authorize(['admin', 'manager', 'employee']), advancedCommentController.getMentionSuggestions);

// Subscription Management Routes
router.post('/tasks/:taskId/subscribe', authorize(['admin', 'manager', 'employee']), advancedCommentController.subscribeToTask);
router.delete('/tasks/:taskId/subscribe', authorize(['admin', 'manager', 'employee']), advancedCommentController.unsubscribeFromTask);

// Analytics Routes
router.get('/comments/:commentId/statistics', authorize(['admin', 'manager', 'employee']), advancedCommentController.getCommentStatistics);
router.get('/tasks/:taskId/comment-analytics', authorize(['admin', 'manager', 'employee']), advancedCommentController.getCommentAnalytics);

module.exports = router;

