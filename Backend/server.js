require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().then(async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Creating default admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      await User.create({
        name: 'Admin',
        email: 'ajay@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
});

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ 
  origin: clientUrl, 
  credentials: true 
}));
app.use(express.json());

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "Hostel Management API is running" });
});

// Routes
const userRoutes = require('./routes/userRoutes');
const residentRoutes = require('./routes/residentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const billRoutes = require('./routes/billRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { protect, authorizeRoles } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/users', protect, authorizeRoles('admin', 'staff'), userRoutes);
app.use('/api/residents', protect, authorizeRoles('admin', 'staff'), residentRoutes);
app.use('/api/rooms', protect, authorizeRoles('admin', 'staff'), roomRoutes);
app.use('/api/maintenance', protect, authorizeRoles('admin', 'staff', 'resident'), maintenanceRoutes);
app.use('/api/bills', protect, authorizeRoles('admin', 'staff', 'resident'), billRoutes);
app.use('/api/reports', protect, reportRoutes);
app.use('/api/notifications', protect, notificationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});