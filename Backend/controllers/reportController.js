const Bill = require('../models/Bill');
const Room = require('../models/Room');
const Resident = require('../models/Resident');
const Maintenance = require('../models/Maintenance');

exports.getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    let stats = {};

    // Common stats
    const totalRooms = await Room.countDocuments();
    const rooms = await Room.find();
    let totalCapacity = 0;
    let totalOccupied = 0;
    let occupiedRooms = 0;
    
    rooms.forEach(r => {
      totalCapacity += r.capacity;
      totalOccupied += r.occupied;
      if (r.occupied > 0) occupiedRooms++;
    });
    
    stats.totalRooms = totalRooms;
    stats.occupiedRooms = occupiedRooms;
    stats.availableRooms = totalRooms - occupiedRooms;
    stats.occupancyRate = totalCapacity === 0 ? 0 : Math.round((totalOccupied / totalCapacity) * 100);

    // Staff & Admin stats
    if (userRole === 'admin' || userRole === 'staff') {
      stats.totalResidents = await Resident.countDocuments();
      stats.pendingMaintenance = await Maintenance.countDocuments({ status: 'Pending' });
    }

    // Admin-only stats
    if (userRole === 'admin') {
      const revenueResult = await Bill.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]);
      stats.totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
      stats.pendingBills = await Bill.countDocuments({ paymentStatus: { $in: ['Unpaid', 'Overdue'] } });
    }

    // Recent Maintenance
    let recentMaintenance = [];
    if (userRole === 'admin' || userRole === 'staff') {
      recentMaintenance = await Maintenance.find().sort({ createdAt: -1 }).limit(5);
    } else if (userRole === 'resident') {
      recentMaintenance = await Maintenance.find({ residentId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    }

    res.status(200).json({
      stats,
      recentMaintenance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const revenueByMonth = await Bill.aggregate([
      { $match: { paymentStatus: 'Paid', paidAt: { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: { $month: "$paidAt" }, 
          revenue: { $sum: "$totalAmount" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedRevenue = revenueByMonth.map(item => ({
      month: months[item._id - 1],
      revenue: item.revenue
    }));

    res.status(200).json(formattedRevenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOccupancyReport = async (req, res) => {
  try {
    const rooms = await Room.find();
    let totalCapacity = 0;
    let totalOccupied = 0;
    
    rooms.forEach(r => {
      totalCapacity += r.capacity;
      totalOccupied += r.occupied;
    });
    
    const occupied = totalOccupied;
    const available = totalCapacity - totalOccupied;
    const occupancyRate = totalCapacity === 0 ? 0 : Math.round((totalOccupied / totalCapacity) * 100);

    res.status(200).json({
      occupied,
      available,
      occupancyRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaintenanceReport = async (req, res) => {
  try {
    const maintenanceCounts = await Maintenance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const result = {
      Pending: 0,
      "In Progress": 0,
      Completed: 0
    };
    
    maintenanceCounts.forEach(item => {
      if (result[item._id] !== undefined) {
        result[item._id] = item.count;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
