import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Home, Wrench } from 'lucide-react';
import api, { handleApiError } from '../services/api';

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [revRes, occRes, mainRes] = await Promise.all([
          api.get('/reports/revenue'),
          api.get('/reports/occupancy'),
          api.get('/reports/maintenance')
        ]);

        // Revenue: backend returns [{month, revenue}] - direct use
        setRevenueData(revRes.data || []);

        // Occupancy: backend returns {occupied, available, occupancyRate}
        // Convert to pie chart format
        const occ = occRes.data;
        if (occ && (occ.occupied !== undefined || occ.available !== undefined)) {
          setOccupancyData([
            { name: 'Occupied', value: occ.occupied || 0 },
            { name: 'Available', value: occ.available || 0 }
          ]);
        } else {
          // Maybe it's already an array
          setOccupancyData(Array.isArray(occRes.data) ? occRes.data : []);
        }

        // Maintenance: backend returns {Pending, "In Progress", Completed}
        // Convert to bar chart format
        const main = mainRes.data;
        if (main && typeof main === 'object' && !Array.isArray(main)) {
          setMaintenanceData(
            Object.entries(main).map(([status, count]) => ({ status, count }))
          );
        } else {
          setMaintenanceData(Array.isArray(mainRes.data) ? mainRes.data : []);
        }
      } catch (err) {
        setError(handleApiError(err, 'Failed to fetch report data'));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Financial and operational performance overview</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">Revenue Trend</h2>
          </div>
          <div className="h-72">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val) => [`$${val}`, 'Revenue']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={40} className="mb-2 opacity-30" />
                <p>No revenue data available yet</p>
                <p className="text-xs mt-1">Generate and pay bills to see revenue data</p>
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Home size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-800">Room Occupancy</h2>
          </div>
          <div className="h-72">
            {occupancyData.length > 0 && (occupancyData[0].value > 0 || occupancyData[1]?.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    fill="#8884d8"
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Home size={40} className="mb-2 opacity-30" />
                <p>No occupancy data available</p>
                <p className="text-xs mt-1">Add rooms to see occupancy data</p>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">Maintenance Requests by Status</h2>
          </div>
          <div className="h-72">
            {maintenanceData.length > 0 && maintenanceData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="status" type="category" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Legend />
                  <Bar dataKey="count" name="Requests" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Wrench size={40} className="mb-2 opacity-30" />
                <p>No maintenance data available</p>
                <p className="text-xs mt-1">Submit maintenance requests to see data here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
