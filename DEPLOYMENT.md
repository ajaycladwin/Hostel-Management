# 🚀 Hostel Management System - Deployment Guide

This guide covers everything required to deploy the **Hostel Management System** (React + Express + MongoDB) to production.

---

## 📋 Table of Contents
1. [Prerequisites: MongoDB Atlas Setup](#1-prerequisites-mongodb-atlas-setup)
2. [Recommended Deployment: Render (Backend) + Vercel / Netlify (Frontend)](#2-recommended-deployment-render-backend--vercel--netlify-frontend)
3. [One-Click Deployment: Render Blueprint (render.yaml)](#3-one-click-deployment-render-blueprint-renderyaml)
4. [Docker Deployment (Self-Hosted / VPS / Railway)](#4-docker-deployment-self-hosted--vps--railway)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Initial Admin Login](#6-initial-admin-login)

---

## 1. Prerequisites: MongoDB Atlas Setup

You need a cloud MongoDB database for production.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account.
2. Create a new **M0 (Free)** cluster.
3. Under **Security > Database Access**:
   - Create a database user (e.g. `admin_user`) and a secure password.
4. Under **Security > Network Access**:
   - Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so cloud servers (Render, Railway, etc.) can connect.
5. In **Database > Clusters**, click **Connect** > **Drivers** (Node.js).
6. Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/hostelpro?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

---

## 2. Recommended Deployment: Render (Backend) + Vercel / Netlify (Frontend)

### Part A: Deploy the Backend on Render (Free)

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure deployment setup"
   git push origin main
   ```
2. Sign in to [Render](https://render.com).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository (`Hostel-Management`).
5. Configure the following settings:
   - **Name**: `hostel-management-backend`
   - **Region**: Choose the closest region (e.g. Singapore, Frankfurt, Oregon)
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Click **Advanced** > **Add Environment Variable**:
   | Key | Value | Note |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *(Random 32+ characters)* | Secret key for JWT auth |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Your frontend URL (can update after deploying frontend) |
   | `ADMIN_EMAIL` | `admin@hostelpro.com` | Initial admin email |
   | `ADMIN_PASSWORD` | `your_secure_password` | Initial admin password |
7. Click **Create Web Service**.
8. Once deployed, copy your backend URL (e.g., `https://hostel-management-backend.onrender.com`).

---

### Part B: Deploy the Frontend on Vercel or Netlify

#### Option B1: Deploy on Vercel (Recommended)
1. Go to [Vercel](https://vercel.com) and log in.
2. Click **Add New...** > **Project** and import your `Hostel-Management` repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `Frontend`
4. Expand **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://hostel-management-backend.onrender.com/api` |
5. Click **Deploy**.
6. After deployment completes, copy your frontend domain (e.g., `https://hostel-management-frontend.vercel.app`).
7. **Important**: Go back to your Render backend service dashboard, edit `CLIENT_URL` to your Vercel URL, and save.

#### Option B2: Deploy on Netlify
1. Go to [Netlify](https://netlify.com) and log in.
2. Click **Add new site** > **Import an existing project** > **GitHub**.
3. Select the repository.
4. Settings:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. In **Environment variables**, add:
   - `VITE_API_URL`: `https://hostel-management-backend.onrender.com/api`
6. Click **Deploy Hostel-Management**.
7. Copy the Netlify URL and update `CLIENT_URL` in the Render backend environment.

---

## 3. One-Click Deployment: Render Blueprint (render.yaml)

A [`render.yaml`](./render.yaml) blueprint is pre-configured in this repository.

1. Push your repository to GitHub.
2. In Render, click **New +** > **Blueprint**.
3. Select your repository.
4. Render will parse `render.yaml` and prompt you for the required values:
   - `MONGO_URI`
   - `CLIENT_URL`
   - `VITE_API_URL`
   - `ADMIN_PASSWORD`
5. Click **Apply** to deploy both services simultaneously.

---

## 4. Docker Deployment (Self-Hosted / VPS / Railway)

If deploying to a VPS (DigitalOcean, AWS EC2, Hetzner) or Docker host:

```bash
# 1. Clone the repository
git clone https://github.com/ajaycladwin/Hostel-Management.git
cd Hostel-Management

# 2. Start all services (MongoDB + Backend + Frontend Nginx)
docker compose up -d --build

# 3. Verify services are running
docker compose ps
```

- **Frontend**: Available at `http://localhost:3000` (or `http://<your-server-ip>:3000`)
- **Backend API**: Available at `http://localhost:5000/api`
- **MongoDB**: Runs on internal network with persistent data volume `mongo_data`

---

## 5. Environment Variables Reference

### Backend (`Backend/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Auto | Cloud port (defaults to 5000) | `5000` |
| `NODE_ENV` | Yes | App environment | `production` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hostelpro` |
| `JWT_SECRET` | Yes | Random secure secret | `a8d6f9e2b4c1037...` |
| `CLIENT_URL` | Yes | Allowed frontend origin(s) | `https://app.example.com` or comma-separated list |
| `ADMIN_EMAIL` | Optional | Initial seeded admin email | `admin@hostelpro.com` |
| `ADMIN_PASSWORD` | Optional | Initial seeded admin password | `securepassword123` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key for payments | `rzp_live_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret | `xxxxxxxxxxxxxxxx` |

### Frontend (`Frontend/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL | `https://hostel-api.onrender.com/api` |

---

## 6. Initial Admin Login

When the backend starts up for the first time with an empty database:
- It automatically seeds an initial admin account:
  - **Email**: `ADMIN_EMAIL` (default: `admin@hostelpro.com` or `ajay@gmail.com`)
  - **Password**: `ADMIN_PASSWORD` (default: `123456`)
- Log in through `/login` to access the admin dashboard, create rooms, manage residents, and add staff members.
