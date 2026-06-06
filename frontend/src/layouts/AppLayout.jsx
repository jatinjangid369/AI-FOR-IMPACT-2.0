import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Wrench, 
  Search, 
  BookOpen, 
  BarChart3, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Sparkles,
  Menu,
  X,
  Check
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification panel state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Lost & Found', path: '/lost-found', icon: Search },
    { name: 'Policy Center', path: '/policies', icon: BookOpen },
    ...(user?.role === 'admin' ? [{ name: 'Analytics', path: '/analytics', icon: BarChart3 }] : []),
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden text-slate-100">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111827] border-r border-slate-800">
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CampusGenie AI
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-bold font-outfit uppercase">
              {user?.name?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
              <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-medium tracking-wider uppercase bg-indigo-500/10 text-indigo-400 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/25 hover:bg-rose-500/5 transition-all text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0F172A] border-b border-slate-800 z-10">
          
          {/* Mobile menu trigger & title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-200 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-outfit font-bold text-xl text-slate-100 hidden sm:block">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Platform'}
            </h1>
          </div>

          {/* Right section widgets */}
          <div className="flex items-center gap-4">
            
            {/* Search Widget */}
            <div className="relative max-w-xs hidden md:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search issues, policies..."
                className="w-60 bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell Widget */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl relative transition-colors text-slate-300 hover:text-slate-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Dropdown panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-xl border border-slate-800 p-2 z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60">
                    <span className="font-semibold text-sm font-outfit text-slate-200">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 rounded-xl transition-all ${
                            notif.is_read ? 'opacity-60' : 'bg-indigo-500/5 border-l-2 border-indigo-500'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs text-slate-200 leading-relaxed">{notif.message}</p>
                            {!notif.is_read && (
                              <button 
                                onClick={() => markRead(notif.id)}
                                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-indigo-400"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-xs font-outfit uppercase">
                {user?.name?.substring(0, 2)}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {user?.name}
              </span>
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0F172A]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 bg-[#111827] h-full flex flex-col p-6 animate-slide-in relative border-r border-slate-800">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 py-4 mb-6 border-b border-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span className="font-outfit font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                CampusGenie AI
              </span>
            </div>
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500 font-medium'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-6 border-t border-slate-800 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/25 hover:bg-rose-500/5 transition-all text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
