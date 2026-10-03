const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  guardianName: {
    type: String
  },
  guardianPhone: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  checkInDate: {
    type: Date,
    default: Date.now
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  status: {
    type: String,
    enum: ['Active', 'Checked-Out'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
