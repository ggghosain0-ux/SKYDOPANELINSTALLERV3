import React, { useState } from 'react';
import { User, Save, Shield, Key, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  currentUser: UserType;
  onUserUpdate: (updated: UserType) => void;
}

export default function ProfileView({ currentUser, onUserUpdate }: ProfileProps) {
  const [alias, setAlias] = useState(currentUser.username);
  const [emailStr, setEmailStr] = useState(currentUser.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notif, setNotif] = useState('');
  const [errNotif, setErrNotif] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotif('');
    setErrNotif('');

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: alias,
          email: emailStr,
          isAdmin: currentUser.isAdmin,
          password: newPassword || undefined
        }),
      });

      if (!res.ok) throw new Error('Saving credentials profile failed');
      const updated = await res.json();
      
      setNotif('Profile information updated successfully!');
      onUserUpdate(updated);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setErrNotif(err.message || 'Validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 4 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">Profile Settings</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-500 animate-pulse" /> Profile Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">Configure your personal login credentials and email notifications parameters</p>
      </div>

      {notif && (
        <div className="p-3.5 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
          {notif}
        </div>
      )}

      {errNotif && (
        <div className="p-3.5 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg flex items-center gap-2">
          {errNotif}
        </div>
      )}

      <form onSubmit={saveProfile} className="space-y-6 max-w-2xl bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
          Security Credentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Username ID
            </label>
            <input
              type="text"
              required
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Bind
            </label>
            <input
              type="email"
              required
              value={emailStr}
              onChange={(e) => setEmailStr(e.target.value)}
              className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              New Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank to maintain current credentials"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Save button matching Solid high fidelity */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
