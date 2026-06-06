import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  ArrowLeft, Calendar, MapPin, Tag, User, 
  ExternalLink, MessageSquare, ShieldCheck, CheckCircle 
} from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusVal, setStatusVal] = useState('');

  const fetchComplaintDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setStatusVal(res.data.complaint.status);
    } catch (err) {
      console.error(err);
      alert('Failed to load complaint details.');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await api.put(`/complaints/${id}`, { status: statusVal });
      fetchComplaintDetail();
      alert('Status updated successfully');
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Navigation & Header */}
      <div>
        <Link 
          to="/complaints"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaints</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-outfit font-extrabold text-2xl text-slate-100 tracking-tight">
              {complaint.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Ticket ID: {complaint.id}
            </p>
          </div>
          <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
            complaint.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
            complaint.status === 'in_progress' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
            'bg-amber-500/15 text-amber-400 border border-amber-500/20'
          }`}>
            {complaint.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-outfit font-bold text-base text-slate-100 mb-4 border-b border-slate-800 pb-2">
              Complaint Description
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>

            {complaint.attachment_url && (
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Attachment
                </span>
                <a 
                  href={complaint.attachment_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Attached File</span>
                </a>
              </div>
            )}
          </div>

          {/* Timeline Tracker */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-outfit font-bold text-base text-slate-100 mb-6 border-b border-slate-800 pb-2">
              Resolution Timeline
            </h3>
            <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-6">
              
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#0F172A]"></span>
                <h4 className="text-sm font-semibold text-slate-200">Ticket Submitted</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged by {complaint.users?.name || 'Student'} on {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>

              {complaint.status !== 'open' && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-[#0F172A]"></span>
                  <h4 className="text-sm font-semibold text-slate-200">Moved In Progress</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operations team assigned the ticket.
                  </p>
                </div>
              )}

              {complaint.status === 'resolved' && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0F172A]"></span>
                  <h4 className="text-sm font-semibold text-slate-200">Resolved</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marked resolved by Admin.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Sidebar Info/Actions */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-outfit font-bold text-base text-slate-100 mb-2">Ticket Info</h3>
            
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <span className="block text-xs text-slate-500">Owner</span>
                <span className="font-semibold">{complaint.users?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-slate-500" />
              <div>
                <span className="block text-xs text-slate-500">Location</span>
                <span className="font-semibold">{complaint.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <span className="block text-xs text-slate-500">Created At</span>
                <span className="font-semibold">{new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Admin Control Panel */}
          {user?.role === 'admin' && (
            <div className="glass-card p-6 rounded-2xl border border-indigo-500/10">
              <h3 className="font-outfit font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span>Admin Actions</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Update Status
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 outline-none"
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {updating ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ComplaintDetail;
