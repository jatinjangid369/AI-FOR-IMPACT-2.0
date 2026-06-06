import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Wrench, Plus, MapPin, Tag, User, Clock, CheckCircle } from 'lucide-react';

const Maintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  
  // Form modal triggers
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'electrical', description: '', location: '' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = '/maintenance?limit=100';
      if (filterCategory) url += `&category=${filterCategory}`;
      const res = await api.get(url);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', form);
      setShowForm(false);
      setForm({ category: 'electrical', description: '', location: '' });
      fetchRequests();
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}`, { status });
      fetchRequests();
      alert('Status updated successfully');
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Maintenance Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Submit electrical, plumbing, internet and other fixes.
          </p>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/15 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Category selector filters */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {['', 'electrical', 'plumbing', 'furniture', 'internet', 'cleaning', 'other'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
              filterCategory === cat 
                ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat === '' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {/* Requests Card Lists */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No maintenance logs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-64 border border-slate-800">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold tracking-wide border rounded-full capitalize bg-slate-900 border-slate-800 text-indigo-400">
                    {req.category}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border rounded-full ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium line-clamp-3 leading-relaxed mb-4">
                  {req.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/60 mt-auto">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {req.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Status action buttons for admins or workers */}
                {user?.role === 'admin' && (
                  <div className="flex gap-2 pt-2">
                    <select
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 outline-none"
                      value={req.status}
                      onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Create New Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
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
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" required placeholder="e.g. Mess Hall C"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" onClick={() => setShowForm(false)}
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

    </div>
  );
};

export default Maintenance;
