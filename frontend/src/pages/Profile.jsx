import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Award, Edit3 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileName } = useAuth();
  const [nameVal, setNameVal] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nameVal.trim()) return;
    try {
      setSaving(true);
      await updateProfileName(nameVal);
      setEditing(false);
      alert('Profile details updated');
    } catch (err) {
      alert('Failed to update profile name');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-slate-100 tracking-tight">
          User Profile
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Review details and operational metadata.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        
        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold text-xl font-outfit uppercase">
            {user?.name?.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200 font-outfit">{user?.name}</h3>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full capitalize mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Profile details list */}
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => { setNameVal(user?.name || ''); setEditing(false); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span className="text-sm text-slate-200">{user?.name}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/5 transition-all cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-sm text-slate-400">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Access Privilege
            </label>
            <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-sm text-slate-400">
              <Shield className="h-4 w-4 text-slate-500" />
              <span className="capitalize">{user?.role} Access Role</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
