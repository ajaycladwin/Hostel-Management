# HostelPro - Hostel Management System

A full-stack hostel management web application built with Node.js, Express, MongoDB, and React (Vite + Tailwind CSS).

## 🚀 Key Features

- **Dashboard & Analytics**: Real-time stats on occupancy, revenue, and pending maintenance requests.
- **Room Management**: Room creation, status tracking (available/occupied/maintenance), and allocation.
- **Resident Records**: Resident profiles, check-in/checkout dates, room assignments, and emergency contacts.
- **Maintenance Tracking**: Submit and monitor repair requests with status workflows.
- **Billing & Payments**: Invoice generation and online payments with Razorpay integration.
- **Role-Based Access Control**: Secure JWT authentication for Admins, Staff, and Residents.

---

## 📁 Project Structure

```text
Hostel-Management/
├── Backend/                 # Express REST API
│   ├── config/              # Database connection
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth & role authorization
│   ├── models/              # Mongoose database schemas
│   ├── routes/              # Express API route handlers
│   ├── server.js            # Express server entry point
│   └── Dockerfile           # Backend Docker container
├── Frontend/                # React (Vite) client
│   ├── src/                 # React components, pages & services
│   ├── public/              # Static assets
│   ├── netlify.toml         # Netlify deployment configuration
│   ├── vercel.json          # Vercel deployment configuration
│   ├── nginx.conf           # Production Nginx reverse proxy
│   └── Dockerfile           # Frontend Docker container
├── render.yaml              # Render 1-click blueprint config
├── docker-compose.yml       # Multi-container orchestration
└── DEPLOYMENT.md            # Detailed deployment instructions
```

---

## 🛠️ Local Development

### 1. Backend Setup
```bash
cd Backend
cp .env.example .env    # Configure MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
cp .env.example .env    # Ensure VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## 🌐 Production Deployment

For complete, step-by-step production deployment instructions (Render, Vercel, Netlify, Docker, and MongoDB Atlas), see:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**
