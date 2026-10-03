require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database and seed initial admin if database is empty
connectDB().then(async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Creating default admin...');
      const adminEmail = process.env.ADMIN_EMAIL || 'ajay@gmail.com';
      const adminPassword = process.env.ADMIN_PASSWORD || '123456';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: 'Admin',
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Default admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
});

// Configure CORS for production and development
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, health checkers)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow wildcard or matching explicit origin
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Allow vercel, netlify, and render preview/production subdomains by default
    if (
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Deployment health-check and root endpoints
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Hostel Management Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

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
  console.log(`Server running on port ${PORT}`);
});