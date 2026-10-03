import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bed, 
  Wrench, 
  Receipt, 
  FileText, 
  UserCircle,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let userRole = 'resident';
  try {
    if (userStr) userRole = JSON.parse(userStr).role;
  } catch(e) {}

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'staff', 'resident'] },
    { name: 'Residents', path: '/residents', icon: <Users size={20} />, roles: ['admin', 'staff'] },
    { name: 'Rooms', path: '/rooms', icon: <Bed size={20} />, roles: ['admin', 'staff'] },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} />, roles: ['admin', 'staff', 'resident'] },
    { name: 'Billing', path: '/billing', icon: <Receipt size={20} />, roles: ['admin', 'staff', 'resident'] },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} />, roles: ['admin', 'staff'] },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} />, roles: ['admin', 'staff', 'resident'] },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800 transition-all duration-300">
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-indigo-400">HostelPro</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

