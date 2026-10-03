const Room = require('../models/Room');
const Resident = require('../models/Resident');

// Create room
const createRoom = async (req, res) => {
  try {
    const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room with this number already exists' });
    }

    const room = new Room(req.body);
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('residents', 'registerNumber phone');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available rooms
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'Available' }).populate('residents', 'registerNumber phone');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Allocate a resident to a room
const allocateRoom = async (req, res) => {
  try {
    const { roomId, residentId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.status === 'Maintenance') return res.status(400).json({ message: 'Room is under maintenance' });
    if (room.occupied >= room.capacity) return res.status(400).json({ message: 'Room capacity exceeded' });
    
    // Check if resident exists
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ message: 'Resident not found' });
    
    // Check if resident is already in this room
    if (room.residents.includes(residentId)) {
      return res.status(400).json({ message: 'Resident already allocated to this room' });
    }

    // Update Room
    room.residents.push(residentId);
    room.occupied += 1;
    if (room.occupied >= room.capacity) {
      room.status = 'Full';
    }
    await room.save();

    // Update Resident with room reference
    resident.room = roomId;
    await resident.save();

    res.status(200).json({ message: 'Room allocated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Checkout a resident from a room
const checkoutRoom = async (req, res) => {
  try {
    const { roomId, residentId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Check if resident is in this room
    if (!room.residents.includes(residentId)) {
      return res.status(400).json({ message: 'Resident is not allocated to this room' });
    }

    // Update Room
    room.residents = room.residents.filter(id => id.toString() !== residentId);
    room.occupied -= 1;
    if (room.status === 'Full' && room.occupied < room.capacity) {
      room.status = 'Available';
    }
    await room.save();

    // Update Resident
    const resident = await Resident.findById(residentId);
    if (resident) {
      resident.room = null;
      resident.status = 'Checked-Out';
      await resident.save();
    }

    res.status(200).json({ message: 'Checkout successful', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
  allocateRoom,
  checkoutRoom
};
