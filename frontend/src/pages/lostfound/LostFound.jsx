import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

const LostFound = () => {
  const [activeTab, setActiveTab] = useState('lost');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  
  // Modals / forms triggers
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item_name: '', description: '', location: '', date: '', image_url: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      let endpoint = activeTab === 'lost' ? '/lost-found/lost' : '/lost-found/found';
      if (searchVal) endpoint += `?search=${searchVal}`;
      const res = await api.get(endpoint);
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab, searchVal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'lost' ? '/lost-found/lost' : '/lost-found/found';
      const payload = {
        item_name: form.item_name,
        description: form.description,
        location: form.location,
        image_url: form.image_url,
      };

      if (activeTab === 'lost') {
        payload.date_lost = form.date;
      } else {
        payload.date_found = form.date;
      }

      await api.post(endpoint, payload);
      setShowForm(false);
      setForm({ item_name: '', description: '', location: '', date: '', image_url: '' });
      fetchItems();
      alert('Report logged successfully');
    } catch (err) {
      alert('Failed to report item');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Lost & Found Bulletin
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse found belongings or publish lost item reports.
          </p>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/15 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{activeTab === 'lost' ? 'Report Lost' : 'Report Found'}</span>
        </button>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Toggle tabs */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('lost')}
            className={`flex-1 sm:flex-initial px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'lost'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`flex-1 sm:flex-initial px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'found'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Found Items
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search items, locations..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No reports found. Be the first to publish one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              
              {/* Item Image */}
              <div className="h-44 bg-slate-900 flex items-center justify-center border-b border-slate-800 relative">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.item_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-700" />
                )}
                <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                  activeTab === 'lost' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                }`}>
                  {activeTab}
                </span>
              </div>

              {/* Item Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-outfit font-bold text-base text-slate-200 line-clamp-1">{item.item_name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/40 mt-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(item.date_lost || item.date_found || item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* REPORT MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 animate-scale-in">
            <h3 className="font-outfit font-bold text-lg text-slate-100 mb-4 capitalize">Report {activeTab} Item</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Name</label>
                <input 
                  type="text" required placeholder="e.g. Leather Wallet"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.item_name}
                  onChange={(e) => setForm({...form, item_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required rows="3" placeholder="Colors, features, identifier tags..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" required placeholder="e.g. Library basement"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                <input 
                  type="date" required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                <input 
                  type="url" placeholder="https://example.com/item.jpg"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  value={form.image_url}
                  onChange={(e) => setForm({...form, image_url: e.target.value})}
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

export default LostFound;
