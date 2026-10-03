const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', authorizeRoles('admin', 'staff', 'resident'), reportController.getDashboardStats);
router.get('/revenue', authorizeRoles('admin'), reportController.getRevenueReport);
router.get('/occupancy', authorizeRoles('admin', 'staff'), reportController.getOccupancyReport);
router.get('/maintenance', authorizeRoles('admin', 'staff'), reportController.getMaintenanceReport);

module.exports = router;
