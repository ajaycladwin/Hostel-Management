const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  gateway: {
    type: String,
    enum: ['Razorpay', 'Cash', 'Bank Transfer'],
    default: 'Razorpay'
  },
  gatewayOrderId: {
    type: String
  },
  gatewayPaymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
