const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomFee: {
    type: Number,
    required: true
  },
  utilityFee: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  lateFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Overdue'],
    default: 'Unpaid'
  },
  paidAt: {
    type: Date
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  }
}, { timestamps: true });

billSchema.pre('save', function (next) {
  this.totalAmount = (this.roomFee || 0) + 
                     (this.utilityFee || 0) + 
                     (this.serviceFee || 0) + 
                     (this.lateFee || 0) - 
                     (this.discount || 0);
  next();
});

module.exports = mongoose.model('Bill', billSchema);
