import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  AlertCircle, 
  Wrench, 
  Search, 
  CheckCircle2, 
  FileText, 
  PlusCircle,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  // Modals / Quick Action Forms
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showLostForm, setShowLostForm] = useState(false);

  // Forms states
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', location: '', attachment_url: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ category: 'electrical', description: '', location: '' });
  const [lostForm, setLostForm] = useState({ item_name: '', description: '', location: '', date_lost: '', image_url: '' });

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
      
      // Load recent activities (merging latest complaints and maintenance)
      const complaintsRes = await api.get('/complaints?limit=3');
      const maintenanceRes = await api.get('/maintenance?limit=3');
      
      const mixed = [
        ...(complaintsRes.data.complaints || []).map(c => ({ ...c, actType: 'complaint' })),
        ...(maintenanceRes.data.requests || []).map(m => ({ ...m, actType: 'maintenance' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

      setRecentActivities(mixed);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', complaintForm);
      setShowComplaintForm(false);
      setComplaintForm({ title: '', description: '', location: '', attachment_url: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', maintenanceForm);
      setShowMaintenanceForm(false);
      setMaintenanceForm({ category: 'electrical', description: '', location: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleCreateLost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lost-found/lost', lostForm);
      setShowLostForm(false);
      setLostForm({ item_name: '', description: '', location: '', date_lost: '', image_url: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to report lost item');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalMaintenance: 0,
    totalLost: 0,
    totalFound: 0,
  };

  const charts = data?.charts || {};

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Welcome, {user?.name} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Here's what is happening across campus operations today.
          </p>
        </div>

        {/* Quick action button group */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowComplaintForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Complaint</span>
          </button>
          <button 
            onClick={() => setShowMaintenanceForm(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <Wrench className="h-4 w-4 text-indigo-400" />
            <span>Maintenance Req.</span>
          </button>
          <button 
            onClick={() => setShowLostForm(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <Search className="h-4 w-4 text-purple-400" />
            <span>Report Lost Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <AlertCircle className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.totalComplaints}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.pendingComplaints}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.resolvedComplaints}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance</span>
            <Wrench className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.totalMaintenance}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lost Items</span>
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.totalLost}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Found Items</span>
            <CheckCircle2 className="h-5 w-5 text-pink-400" />
          </div>
          <p className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">{kpis.totalFound}</p>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Complaint Trend */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-outfit font-bold text-lg text-slate-100">Monthly Complaint Trend</h3>
            <span className="text-xs text-indigo-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Realtime Activity
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="Complaints" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorComplaints)" />
                <Area type="monotone" dataKey="Resolved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Category Distribution */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-outfit font-bold text-lg text-slate-100 mb-6">Category Distribution</h3>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(charts.categoryDistribution || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row with activity & secondary chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
          <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No recent activity logged.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-start justify-between p-3 rounded-2xl bg-slate-900/30 border border-slate-800/40">
                  <div className="flex gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      act.actType === 'complaint' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {act.actType === 'complaint' ? <AlertCircle className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {act.title || act.category || 'Maintenance Request'}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {act.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-full uppercase ${
                      act.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {act.status}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-1">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-outfit font-bold text-lg text-slate-100 mb-6">Resolution Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.resolutionRate || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="rate" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* QUICK ACTION MODALS */}
      {showComplaintForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Create New Complaint</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" required placeholder="e.g. WiFi issue in Hostel Block B"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Provide details of the problem..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" required placeholder="e.g. Room 402, Hostel B"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={complaintForm.location}
                  onChange={(e) => setComplaintForm({...complaintForm, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Attachment URL (Optional)</label>
                <input 
                  type="url" placeholder="https://example.com/file.jpg"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={complaintForm.attachment_url}
                  onChange={(e) => setComplaintForm({...complaintForm, attachment_url: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" onClick={() => setShowComplaintForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaintenanceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Request Maintenance</h3>
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={maintenanceForm.category}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, category: e.target.value})}
                >
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="furniture">Furniture</option>
                  <option value="internet">Internet</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Describe the maintenance needed..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" required placeholder="e.g. Mess Hall C"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={maintenanceForm.location}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, location: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" onClick={() => setShowMaintenanceForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Request Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Report Lost Item</h3>
            <form onSubmit={handleCreateLost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Name</label>
                <input 
                  type="text" required placeholder="e.g. Black iPhone 13"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={lostForm.item_name}
                  onChange={(e) => setLostForm({...lostForm, item_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Identify marks, cases, serial codes, etc..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={lostForm.description}
                  onChange={(e) => setLostForm({...lostForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location Lost</label>
                <input 
                  type="text" required placeholder="e.g. Basketball Court benches"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={lostForm.location}
                  onChange={(e) => setLostForm({...lostForm, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date Lost (Optional)</label>
                <input 
                  type="date"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={lostForm.date_lost}
                  onChange={(e) => setLostForm({...lostForm, date_lost: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                <input 
                  type="url" placeholder="https://example.com/item.jpg"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={lostForm.image_url}
                  onChange={(e) => setLostForm({...lostForm, image_url: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" onClick={() => setShowLostForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Report Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
