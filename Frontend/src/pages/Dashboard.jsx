import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiError } from '../services/api';
import { 
  Users, Home, DoorClosed, DoorOpen, DollarSign, Receipt, Wrench, 
  UserPlus, Bed, FileText, AlertCircle, Loader2, LogOut, Calendar, 
  Activity, Clock
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin', role: 'admin' };
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data);
      } catch (err) {
        setError(handleApiError(err, 'Failed to fetch dashboard data.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="font-extrabold text-2xl text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalResidents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalRevenue: 0,
    pendingBills: 0,
    pendingMaintenance: 0
  };

  const occupancyPercentage = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;

  const recentMaintenance = data?.recentMaintenance || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, {user.name}
              </h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center text-gray-500 font-medium gap-2">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard 
            icon={Users} label="Total Residents" value={stats.totalResidents} 
            subtitle="Active in hostel" iconBg="bg-blue-100" iconColor="text-blue-600" stripColor="bg-blue-500" 
          />
          <StatCard 
            icon={Home} label="Total Rooms" value={stats.totalRooms} 
            subtitle="Total capacity" iconBg="bg-indigo-100" iconColor="text-indigo-600" stripColor="bg-indigo-500" 
          />
          <StatCard 
            icon={DoorClosed} label="Occupied Rooms" value={stats.occupiedRooms} 
            subtitle="Currently in use" iconBg="bg-purple-100" iconColor="text-purple-600" stripColor="bg-purple-500" 
          />
          <StatCard 
            icon={DoorOpen} label="Available Rooms" value={stats.availableRooms} 
            subtitle="Ready for allocation" iconBg="bg-emerald-100" iconColor="text-emerald-600" stripColor="bg-emerald-500" 
          />
          <StatCard 
            icon={DollarSign} label="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} 
            subtitle="This month" iconBg="bg-green-100" iconColor="text-green-600" stripColor="bg-green-500" 
          />
          <StatCard 
            icon={Receipt} label="Pending Bills" value={stats.pendingBills} 
            subtitle="Awaiting payment" iconBg="bg-orange-100" iconColor="text-orange-600" stripColor="bg-orange-500" 
          />
          <StatCard 
            icon={Wrench} label="Pending Maintenance" value={stats.pendingMaintenance} 
            subtitle="Unresolved issues" iconBg="bg-rose-100" iconColor="text-rose-600" stripColor="bg-rose-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Occupancy Progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Occupancy Overview</h2>
                <p className="text-gray-500 text-sm font-medium">Current room utilization</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-600">{occupancyPercentage}%</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
              <div 
                className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${occupancyPercentage}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-gray-700">{stats.occupiedRooms} Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-gray-500">{stats.availableRooms} Available</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <ActionButton icon={UserPlus} label="Add Resident" />
              <ActionButton icon={Bed} label="Allocate Room" />
              <ActionButton icon={Wrench} label="Raise Maintenance" />
              <ActionButton icon={FileText} label="Generate Bill" />
            </div>
          </div>

        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">Recent Activity</h2>
              <p className="text-gray-500 text-sm font-medium">Latest maintenance requests</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            {recentMaintenance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Resident</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentMaintenance.slice(0, 5).map((req, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {(req.resident || 'U').charAt(0)}
                            </div>
                            <span className="text-gray-900 font-semibold">{req.resident || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{req.room || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{req.issue || 'General Maintenance'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            req.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                            req.priority?.toLowerCase() === 'medium' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {req.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            req.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-800' :
                            req.status?.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                            req.status?.toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {req.status?.toLowerCase() === 'pending' && <Clock className="w-3 h-3" />}
                            {req.status?.toLowerCase() === 'in progress' && <Activity className="w-3 h-3" />}
                            {req.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm border border-gray-100">
                  <Wrench className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-1">No recent maintenance requests.</h3>
                <p className="text-gray-500 text-sm max-w-sm">When residents submit maintenance tickets, they will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Reusable Subcomponents ---

const StatCard = ({ icon: Icon, label, value, subtitle, iconBg, iconColor, stripColor }) => (
  <div className="relative bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] duration-300 group overflow-hidden">
    {/* Accent Strip */}
    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripColor}`}></div>
    
    <div className="flex items-start justify-between mb-4 pl-2">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="pl-2">
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-bold text-gray-700 tracking-wide">{label}</p>
      <p className="text-xs font-medium text-gray-400 mt-1">{subtitle}</p>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label }) => (
  <button 
    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-400 hover:shadow-md transition-all duration-300 group text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <div className="bg-gray-50 text-gray-500 p-2.5 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-bold text-gray-700 group-hover:text-indigo-700 transition-colors duration-300 text-sm">{label}</span>
  </button>
);

export default Dashboard;
