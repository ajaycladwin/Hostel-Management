const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.post('/', maintenanceController.createMaintenance);
router.get('/', maintenanceController.getAllMaintenance);
router.get('/:id', maintenanceController.getMaintenanceById);
router.put('/:id', maintenanceController.updateMaintenance);
router.patch('/:id/status', maintenanceController.updateMaintenanceStatus);
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;
