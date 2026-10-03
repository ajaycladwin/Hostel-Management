import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Rooms from './pages/Rooms';
import Maintenance from './pages/Maintenance';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes inside DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="billing" element={<Billing />} />
            <Route path="profile" element={<Profile />} />

            {/* Admin and Staff only routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route path="residents" element={<Residents />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>
        
        {/* Catch all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;