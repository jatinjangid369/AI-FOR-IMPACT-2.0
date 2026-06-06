import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AlertCircle, Plus, Search, Calendar, MapPin, Eye, Trash } from 'lucide-react';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create complaint form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', attachment_url: '' });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let url = '/complaints?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', form);
      setShowForm(false);
      setForm({ title: '', description: '', location: '', attachment_url: '' });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      alert('Failed to delete complaint');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'closed':
        return 'bg-slate-700/20 text-slate-400 border-slate-700/30';
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
            Complaints Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track, review and log campus issues.
          </p>
        </div>

        {user?.role === 'student' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/15 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Complaint</span>
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="flex gap-4 items-center overflow-x-auto pb-1">
        <button 
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            statusFilter === '' 
              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          All issues
        </button>
        <button 
          onClick={() => setStatusFilter('open')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            statusFilter === 'open' 
              ? 'bg-amber-600/15 border-amber-500/40 text-amber-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          Open
        </button>
        <button 
          onClick={() => setStatusFilter('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            statusFilter === 'in_progress' 
              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          In Progress
        </button>
        <button 
          onClick={() => setStatusFilter('resolved')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            statusFilter === 'resolved' 
              ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No complaints found matching selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40">
                  <th className="p-4 font-semibold text-slate-400">Ticket ID</th>
                  <th className="p-4 font-semibold text-slate-400">Title</th>
                  {user?.role === 'admin' && <th className="p-4 font-semibold text-slate-400">User</th>}
                  <th className="p-4 font-semibold text-slate-400">Status</th>
                  <th className="p-4 font-semibold text-slate-400">Location</th>
                  <th className="p-4 font-semibold text-slate-400">Date</th>
                  <th className="p-4 font-semibold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 font-mono text-xs text-indigo-400">{comp.id.substring(0, 8)}...</td>
                    <td className="p-4 font-semibold text-slate-200">{comp.title}</td>
                    {user?.role === 'admin' && (
                      <td className="p-4 text-slate-300">
                        <span className="block text-xs font-semibold">{comp.users?.name}</span>
                        <span className="block text-[10px] text-slate-500">{comp.users?.email}</span>
                      </td>
                    )}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium tracking-wide border rounded-full capitalize ${getStatusBadgeClass(comp.status)}`}>
                        {comp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{comp.location}</td>
                    <td className="p-4 text-slate-400">{new Date(comp.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link 
                        to={`/complaints/${comp.id}`}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 p-2 rounded-xl border border-slate-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(comp.id)}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-rose-950/40 text-rose-400 p-2 rounded-xl border border-slate-700 hover:border-rose-500/20 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COMPLAINT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4">Create New Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" required placeholder="e.g. WiFi issue in Hostel Block B"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Provide details of the problem..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" required placeholder="e.g. Room 402, Hostel B"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Attachment URL (Optional)</label>
                <input 
                  type="url" placeholder="https://example.com/file.jpg"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.attachment_url}
                  onChange={(e) => setForm({...form, attachment_url: e.target.value})}
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
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Complaints;
