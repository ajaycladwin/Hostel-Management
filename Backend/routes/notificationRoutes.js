const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure user is logged in for all notification routes
router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
