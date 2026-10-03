const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  installments: [{
    installmentNumber: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Overdue'],
      default: 'Unpaid'
    },
    paidAt: {
      type: Date
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
