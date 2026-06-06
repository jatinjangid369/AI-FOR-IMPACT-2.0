import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BookOpen, UploadCloud, FileText, ArrowUpRight, Plus, Folder, Calendar } from 'lucide-react';

const PolicyCenter = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Admin form modal
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Academics', pdf_url: '' });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let url = '/policies';
      if (selectedCategory) url += `?category=${selectedCategory}`;
      const res = await api.get(url);
      setPolicies(res.data.policies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/policies', form);
      setShowUpload(false);
      setForm({ title: '', category: 'Academics', pdf_url: '' });
      fetchPolicies();
      alert('Policy published successfully');
    } catch (err) {
      alert('Failed to publish policy');
    }
  };

  const categories = ['Academics', 'Hostel Life', 'Sports & Rec', 'Codes of Conduct', 'Fees & Finance'];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Policy Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Access campus rules, student code, academic guidelines and regulations.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/15 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Policy</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Categories Sidebar Filter */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</span>
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              selectedCategory === ''
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Folder className="h-4 w-4" />
            <span>All Policies</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Policies Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm glass-card rounded-3xl">
              No policies uploaded under this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map(policy => (
                <div key={policy.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-48">
                  
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {policy.category}
                      </span>
                    </div>
                    <h3 className="font-outfit font-bold text-base text-slate-200 line-clamp-2 leading-relaxed">
                      {policy.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-auto">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(policy.created_at).toLocaleDateString()}
                    </span>
                    
                    <a
                      href={policy.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <span>View PDF</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* UPLOAD FORM MODAL */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-400" />
              <span>Upload Campus Policy</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" required placeholder="e.g. Student Academic Code 2026-2027"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">PDF File URL</label>
                <input 
                  type="url" required placeholder="https://example.com/policy-doc.pdf"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.pdf_url}
                  onChange={(e) => setForm({...form, pdf_url: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" onClick={() => setShowUpload(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PolicyCenter;
