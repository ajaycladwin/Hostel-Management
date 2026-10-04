# 🏢 HostelPro - Hostel Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**HostelPro** is a modern, responsive, full-stack hostel management platform engineered with **Node.js**, **Express**, **MongoDB**, and **React (Vite + Tailwind CSS)**. Designed for hostel administrators, wardens, staff, and student residents, it streamlines room allocation, resident onboarding, maintenance requests, billing, and real-time financial reporting.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture & Roles](#-system-architecture--roles)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Root Monorepo Scripts)](#option-a-quick-start-recommended)
  - [Manual Setup (Separate Terminals)](#option-b-manual-setup)
  - [Docker Setup](#option-c-docker-compose-setup)
- [Environment Configuration](#-environment-configuration)
- [Default Login Credentials](#-default-login-credentials)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## ✨ Key Features

### 📊 Executive Dashboard & Analytics
- **Occupancy Tracking**: Real-time visualization of total, occupied, and vacant rooms and beds.
- **Financial Overview**: Monthly revenue metrics, pending fee collection status, and payment histories using interactive **Recharts** graphs.
- **Maintenance Status**: Immediate visibility into open, pending, and resolved maintenance tickets.
- **Recent Activities Feed**: High-level log of recent allocations, checkouts, and payments.

### 🛏️ Room & Bed Management
- **Room Registry**: Add and manage rooms with details like room number, floor number, room type, and monthly rent.
- **Status Lifecycle**: Toggle statuses across `Available`, `Occupied`, and `Maintenance`.
- **Bed-Level Allocation**: Assign residents to specific rooms with automatic vacancy validation and occupancy count calculations.
- **Check-In & Check-Out**: Seamless workflows that release room capacity upon checkout.

### 👤 Resident Management
- **Resident Directory**: Centralized profiles containing personal info, contact numbers, email, guardian details, and emergency contacts.
- **Room Association**: Direct linking between resident profiles and their allocated rooms.
- **Status Tracking**: Keep track of active vs. departed residents.

### 🛠️ Maintenance & Repair Workflow
- **Ticket Submission**: Residents and staff can submit repair requests specifying room number, category, description, and urgency.
- **Priority Tiers**: Categorize issues into `Low`, `Medium`, `High`, and `Urgent`.
- **Status Progression**: Wardens/staff can transition tickets across `Pending` ➔ `In Progress` ➔ `Completed`.

### 💳 Billing, Invoicing & Razorpay Payments
- **Automated Invoices**: Generate monthly rent and utility invoices for individual residents.
- **Payment Gateway Integration**: Embedded checkout flow powered by **Razorpay** with backend signature verification (`crypto` HMAC SHA256).
- **Payment Records & History**: Log offline/cash payments or automated online transactions with instant invoice status updates (`Paid` / `Unpaid`).

### 🔔 In-App Notifications
- Real-time alerts notifying residents and admins about invoice generation, payment confirmations, and maintenance ticket status updates.

### 🛡️ Role-Based Access Control (RBAC) & Security
- Secure authentication using **JSON Web Tokens (JWT)** and **bcryptjs** password hashing.
- Guarded frontend routes and role-protected backend endpoints for `admin`, `staff`, and `resident`.
- Robust CORS policy with production safeguards and multi-origin allowlists.

---

## 👥 System Architecture & Roles

```text
┌─────────────────────────────────────────────────────────────┐
│                          HostelPro                          │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │ Admin / Staff  │             │    Resident     │
       └───────┬────────┘             └────────┬────────┘
               │                               │
  • Analytics Dashboard          • Assigned Room Info
  • Room Allocation & Creation   • Submit Maintenance Tickets
  • Resident Records             • View Invoices & Due Dates
  • Maintenance Ticket Queue     • Pay Rent Online (Razorpay)
  • Invoicing & Billing          • Personal Notifications
  • Financial Reports
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Navigation**: React Router DOM v7
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (>= 18.0.0)
- **Framework**: Express.js 5
- **Database & ODM**: MongoDB & Mongoose 8
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Payment Processing**: Razorpay Node SDK
- **Cross-Origin Handling**: CORS with dynamic origin filtering

### DevOps & Containerization
- **Docker**: Multi-stage Docker builds for backend and frontend
- **Docker Compose**: Orchestration for MongoDB, Backend API, and Frontend Nginx
- **Web Server**: Nginx (Production reverse proxy & SPA static server)
- **Cloud Configurations**: Ready for Render (`render.yaml`), Vercel (`vercel.json`), Netlify (`netlify.toml`), and MongoDB Atlas

---

## 📁 Project Directory Structure

```text
Hostel-Management/
├── Backend/                       # Express REST API
│   ├── config/                    # Database connection (Mongoose)
│   ├── controllers/               # Business logic & request handlers
│   ├── middleware/                # JWT verification & role authorization
│   ├── models/                    # MongoDB schemas (User, Resident, Room, Bill, etc.)
│   ├── routes/                    # API routes (/auth, /rooms, /residents, etc.)
│   ├── .env.example               # Backend environment template
│   ├── Dockerfile                 # Node.js backend Docker container
│   ├── package.json               # Backend dependencies and scripts
│   └── server.js                  # Application entry point & auto-seeding
├── Frontend/                      # React SPA client (Vite + Tailwind)
│   ├── public/                    # Static assets & icons
│   ├── src/
│   │   ├── assets/                # Images and SVGs
│   │   ├── components/            # Reusable UI widgets, navigation & modals
│   │   ├── layouts/               # Dashboard layout & wrappers
│   │   ├── pages/                 # Route views (Dashboard, Rooms, Residents, etc.)
│   │   ├── services/              # Axios API service instances & helpers
│   │   ├── App.jsx                # Route definitions & auth state
│   │   └── main.jsx               # React DOM root entry point
│   ├── .env.example               # Frontend environment template
│   ├── Dockerfile                 # Multi-stage Nginx frontend Docker container
│   ├── netlify.toml               # Netlify SPA redirect rules
│   ├── nginx.conf                 # Production Nginx reverse proxy config
│   ├── package.json               # Frontend dependencies & Vite setup
│   ├── vercel.json                # Vercel SPA rewrite configuration
│   └── vite.config.js             # Vite configuration with Tailwind plugin
├── docker-compose.yml             # Multi-container orchestration (Mongo + App)
├── render.yaml                    # Render Blueprint configuration
├── DEPLOYMENT.md                  # Comprehensive cloud deployment instructions
├── package.json                   # Root monorepo convenience scripts
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` OR a free [MongoDB Atlas](https://cloud.mongodb.com) cluster)
- **Docker & Docker Compose** *(Optional, if running via containers)*

---

### Option A: Quick Start (Recommended)

You can run both Backend and Frontend seamlessly from the repository root using the bundled scripts:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ajaycladwin/Hostel-Management.git
   cd Hostel-Management
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Files:**
   - In `Backend/`: copy `.env.example` to `.env`
   - In `Frontend/`: copy `.env.example` to `.env`
   *(See [Environment Configuration](#-environment-configuration) below)*

4. **Launch the servers:**
   - **Terminal 1** (Backend):
     ```bash
     npm run server:dev
     ```
   - **Terminal 2** (Frontend):
     ```bash
     npm run client
     ```

5. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd Backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev
```
*Backend will run on [http://localhost:5000](http://localhost:5000).*

#### 2. Frontend Setup
```bash
cd Frontend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend will run on [http://localhost:5173](http://localhost:5173).*

---

### Option C: Docker Compose Setup

Run the complete stack (MongoDB database, Express backend, and Nginx-powered frontend) with a single command:

```bash
# Start all services in the background
docker compose up -d --build

# View container status
docker compose ps

# Follow container logs
docker compose logs -f
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **MongoDB**: Port `27017` with persistent data stored in `mongo_data` volume

To stop the containers:
```bash
docker compose down
```

---

## ⚙️ Environment Configuration

### Backend (`Backend/.env`)

| Variable | Required | Default / Example | Purpose |
|:---|:---:|:---|:---|
| `PORT` | Optional | `5000` | Port on which the Express server listens |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` / `production`) |
| `MONGO_URI` | **Yes** | `mongodb://127.0.0.1:27017/hostelpro` | MongoDB local connection string or MongoDB Atlas URI |
| `JWT_SECRET` | **Yes** | `supersecretjwtkey123!` | Secure secret key for signing JWT tokens |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Allowed frontend origin(s), comma-separated for multiple |
| `ADMIN_EMAIL` | Optional | `admin@hostelpro.com` | Email for initial auto-seeded admin account |
| `ADMIN_PASSWORD` | Optional | `123456` | Password for initial auto-seeded admin account |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_xxxxxx` | Razorpay Key ID (required for online payments) |
| `RAZORPAY_KEY_SECRET` | Optional | `your_razorpay_secret` | Razorpay Key Secret |

### Frontend (`Frontend/.env`)

| Variable | Required | Default / Example | Purpose |
|:---|:---:|:---|:---|
| `VITE_API_URL` | **Yes** | `http://localhost:5000/api` | Base URL of the backend REST API |

---

## 🔑 Default Login Credentials

When the backend starts up for the first time with an empty database, it automatically creates a default administrator user:

- **Email**: `admin@hostelpro.com` *(or `ajay@gmail.com` if fallback)*
- **Password**: `123456` *(or the value configured in `ADMIN_PASSWORD`)*
- **Role**: `admin`

Log in via the `/login` route to access the Admin Dashboard, configure rooms, register residents, and manage staff accounts.

---

## 📡 REST API Endpoints Reference

All routes (except `/api/auth/register` and `/api/auth/login`) require a valid JWT passed in the `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve current user profile |

### Rooms (`/api/rooms`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rooms` | Admin, Staff | Retrieve all rooms |
| `GET` | `/api/rooms/available` | Admin, Staff | Get list of vacant / available rooms |
| `POST` | `/api/rooms` | Admin, Staff | Create a new room |
| `PUT` | `/api/rooms/:id` | Admin, Staff | Update room details |
| `DELETE` | `/api/rooms/:id` | Admin, Staff | Delete room |
| `POST` | `/api/rooms/allocate` | Admin, Staff | Allocate resident to room |
| `POST` | `/api/rooms/checkout` | Admin, Staff | Process resident checkout |

### Residents (`/api/residents`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/residents` | Admin, Staff | List all residents |
| `GET` | `/api/residents/:id` | Admin, Staff | Get resident details |
| `POST` | `/api/residents` | Admin, Staff | Register new resident |
| `PUT` | `/api/residents/:id` | Admin, Staff | Update resident profile |
| `DELETE` | `/api/residents/:id` | Admin, Staff | Delete resident record |

### Maintenance Requests (`/api/maintenance`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Admin, Staff, Resident | List maintenance tickets |
| `GET` | `/api/maintenance/:id` | Admin, Staff, Resident | Get ticket by ID |
| `POST` | `/api/maintenance` | Admin, Staff, Resident | Submit new maintenance request |
| `PUT` | `/api/maintenance/:id` | Admin, Staff, Resident | Update maintenance details |
| `PATCH`| `/api/maintenance/:id/status` | Admin, Staff | Update ticket status |
| `DELETE`| `/api/maintenance/:id` | Admin, Staff | Delete maintenance record |

### Bills & Payments (`/api/bills`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bills` | Admin, Staff, Resident | List all invoices |
| `GET` | `/api/bills/:id` | Admin, Staff, Resident | Get invoice details |
| `GET` | `/api/bills/resident/:residentId` | Admin, Staff, Resident | Get bills for specific resident |
| `POST` | `/api/bills` | Admin, Staff | Create invoice |
| `PUT` | `/api/bills/:id` | Admin, Staff | Update invoice details |
| `PATCH`| `/api/bills/:id/pay` | Admin, Staff, Resident | Mark bill as paid (offline/cash) |
| `POST` | `/api/bills/:id/create-order` | Admin, Staff, Resident | Generate Razorpay payment order |
| `POST` | `/api/bills/:id/verify-payment` | Admin, Staff, Resident | Verify signature & complete payment |
| `DELETE`| `/api/bills/:id` | Admin, Staff | Delete invoice |

### Reports & Analytics (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/dashboard` | Admin, Staff, Resident | Overall system metrics and KPIs |
| `GET` | `/api/reports/occupancy` | Admin, Staff | Detailed room & bed occupancy stats |
| `GET` | `/api/reports/revenue` | Admin | Monthly revenue & collection reports |
| `GET` | `/api/reports/maintenance` | Admin, Staff | Maintenance resolution metrics |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Get notifications for authenticated user |
| `PATCH`| `/api/notifications/:id/read` | Authenticated | Mark notification as read |

---

## 🌐 Production Deployment

Comprehensive deployment guidelines for cloud providers and containers are documented in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Deployment Summary
- **Backend**: Deploy on [Render](https://render.com) using the Node web service configuration or the provided [`render.yaml`](./render.yaml).
- **Frontend**: Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) using Vite presets.
- **Database**: Free managed MongoDB Atlas cluster with network access allowed.
- **Self-Hosted VPS**: Use `docker compose up -d` on any Ubuntu/Debian VPS with Docker installed.

👉 For detailed, step-by-step instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 📄 License

This project is licensed under the [ISC License](./Backend/package.json). Feel free to use and customize for educational or organizational purposes.
