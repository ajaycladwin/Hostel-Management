const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/', billController.createBill);
router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.get('/resident/:residentId', billController.getBillsByResident);
router.put('/:id', billController.updateBill);
router.patch('/:id/pay', billController.payBill);
router.delete('/:id', billController.deleteBill);

// Razorpay Routes
router.post('/:id/create-order', billController.createRazorpayOrder);
router.post('/:id/verify-payment', billController.verifyRazorpayPayment);

module.exports = router;
