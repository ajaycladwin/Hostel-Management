const Maintenance = require('../models/Maintenance');
const Resident = require('../models/Resident');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Submit request
exports.createMaintenance = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user.role === 'resident') {
      const resident = await Resident.findOne({ userId: req.user.id });
      if (!resident) {
         return res.status(404).json({ message: 'Resident profile not found' });
      }
      data.resident = resident._id;
      data.room = resident.room;
    }
    const maintenance = new Maintenance(data);
    const savedMaintenance = await maintenance.save();
    
    // Notify admins/staff
    try {
      const staffUsers = await User.find({ role: { $in: ['admin', 'staff'] } });
      for (const staff of staffUsers) {
        await createNotification(staff._id, 'New Maintenance Request', `A new request "${savedMaintenance.title}" was submitted.`, 'info', savedMaintenance._id, 'Maintenance');
      }
    } catch (err) {
      console.error('Failed to send notifications', err);
    }

    res.status(201).json(savedMaintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all requests
exports.getAllMaintenance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'resident') {
      const resident = await Resident.findOne({ userId: req.user.id });
      if (!resident) {
        return res.status(404).json({ message: 'Resident profile not found' });
      }
      query = { resident: resident._id };
    }
    const maintenances = await Maintenance.find(query).populate('resident').populate('room');
    res.status(200).json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one request
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate('resident').populate('room');
    if (!maintenance) return res.status(404).json({ message: 'Maintenance request not found' });
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!maintenance) return res.status(404).json({ message: 'Maintenance request not found' });
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update only status
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('resident');
    if (!maintenance) return res.status(404).json({ message: 'Maintenance request not found' });
    
    // Notify resident
    try {
      if (maintenance.resident && maintenance.resident.userId) {
         await createNotification(maintenance.resident.userId, 'Maintenance Status Updated', `Your request "${maintenance.title}" is now ${status}.`, 'info', maintenance._id, 'Maintenance');
      }
    } catch (err) {
      console.error('Failed to send notification', err);
    }

    res.status(200).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete request
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Maintenance request not found' });
    res.status(200).json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
