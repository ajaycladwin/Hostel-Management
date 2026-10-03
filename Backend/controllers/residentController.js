const Resident = require('../models/Resident');

// Create a resident
const createResident = async (req, res) => {
  try {
    const existingResident = await Resident.findOne({ registerNumber: req.body.registerNumber });
    if (existingResident) {
      return res.status(400).json({ message: 'Resident with this register number already exists' });
    }

    const resident = new Resident(req.body);
    const savedResident = await resident.save();
    res.status(201).json(savedResident);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all residents
const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find()
      .populate('userId', 'name email role')
      .populate('room', 'roomNumber block floor');
    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get resident by ID
const getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('room', 'roomNumber block floor');
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.status(200).json(resident);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update resident
const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.status(200).json(resident);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete resident
const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndDelete(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.status(200).json({ message: 'Resident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createResident,
  getResidents,
  getResidentById,
  updateResident,
  deleteResident
};
