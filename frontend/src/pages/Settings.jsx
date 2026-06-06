import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      alert('Password updated successfully');
    } catch (err) {
      alert(err || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-slate-100 tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage security options and passwords.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        
        <h3 className="font-outfit font-bold text-base text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-505 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </form>

      </div>

    </div>
  );
};

export default Settings;
