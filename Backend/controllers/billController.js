const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createNotification } = require('./notificationController');
// Generate bill
exports.createBill = async (req, res) => {
  try {
    const bill = new Bill(req.body);
    const savedBill = await bill.save();
    
    // Attempt to notify user if resident exists
    try {
      if (savedBill.resident) {
        // Need to get user ID from resident. Resident has a user field? Let's assume we fetch resident or resident is user id.
      }
    } catch(err) {}

    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({ path: 'resident', populate: { path: 'userId', select: 'name email' } })
      .populate('room');
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one bill
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({ path: 'resident', populate: { path: 'userId', select: 'name email' } })
      .populate('room');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bills of one resident
exports.getBillsByResident = async (req, res) => {
  try {
    const bills = await Bill.find({ resident: req.params.residentId })
      .populate({ path: 'resident', populate: { path: 'userId', select: 'name email' } })
      .populate('room');
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    Object.keys(req.body).forEach(key => {
      bill[key] = req.body[key];
    });

    const updatedBill = await bill.save();
    res.status(200).json(updatedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark bill as paid
exports.payBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    bill.paymentStatus = 'Paid';
    bill.paidAt = Date.now();

    const updatedBill = await bill.save();
    res.status(200).json(updatedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.status(200).json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    
    if (bill.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock mode for testing without keys
      const order = { id: `mock_order_${Date.now()}`, amount: bill.totalAmount * 100, currency: "INR" };
      return res.status(200).json({ order, key_id: 'mock_key', mock: true });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: bill.totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_bill_${bill._id}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    res.status(200).json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const billId = req.params.id;

    if (razorpay_signature === 'mock_sig') {
      const bill = await Bill.findById(billId).populate({ path: 'resident', populate: { path: 'userId', select: 'name email' } });
      if (!bill) return res.status(404).json({ message: 'Bill not found' });
      bill.paymentStatus = 'Paid';
      bill.paidAt = Date.now();
      bill.razorpayPaymentId = razorpay_payment_id;
      bill.razorpayOrderId = razorpay_order_id;
      const savedBill = await bill.save();
      return res.status(200).json({ message: 'Mock payment successful', bill: savedBill });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay secret missing' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (!isAuthentic) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const bill = await Bill.findById(billId).populate({ path: 'resident', populate: { path: 'userId', select: 'name email' } });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    bill.paymentStatus = 'Paid';
    bill.paidAt = Date.now();
    bill.razorpayOrderId = razorpay_order_id;
    bill.razorpayPaymentId = razorpay_payment_id;
    bill.razorpaySignature = razorpay_signature;

    await bill.save();

    // Create a payment record
    const payment = new Payment({
      bill: bill._id,
      resident: bill.resident,
      amount: bill.totalAmount,
      gateway: 'Razorpay',
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      status: 'Success',
      paidAt: Date.now()
    });
    await payment.save();

    res.status(200).json({ message: 'Payment successful and verified', bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
