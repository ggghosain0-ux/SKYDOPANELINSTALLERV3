import React, { useState } from 'react';
import { Users, Plus, Trash2, KeyRound, ShieldAlert, BadgeInfo, Mail, UserCheck } from 'lucide-react';
import { User } from '../types';

interface UserProps {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function UserManager({ users, currentUser, onRefresh, onUserUpdate }: UserProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin personal profile change state
  const [selfUsername, setSelfUsername] = useState(currentUser.username);
  const [selfEmail, setSelfEmail] = useState(currentUser.email);
  const [selfPassword, setSelfPassword] = useState('');
  
  const [errorNewUser, setErrorNewUser] = useState('');
  const [successNewUser, setSuccessNewUser] = useState('');
  const [errorSelf, setErrorSelf] = useState('');
  const [successSelf, setSuccessSelf] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [msgToast, setMsgToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNewUser('');
    setSuccessNewUser('');

    if (!username || !email || !password) {
      setErrorNewUser('All user parameters are required.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isAdmin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setSuccessNewUser(`User ${username} generated successfully!`);
      setModalOpen(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
      onRefresh();
    } catch (err: any) {
      setErrorNewUser(err.message || 'Account manager sync failed.');
    }
  };

  const handleDeleteUser = (uid: string) => {
    if (uid === currentUser.id) {
      setMsgToast({ message: "You cannot delete your own logged-in admin session profile.", type: 'error' });
      return;
    }
    setDeleteConfirmId(uid);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmId) return;
    const uid = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/users/${uid}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      onRefresh();
      setMsgToast({ message: "User profile successfully deleted and formatted from core directories.", type: 'success' });
    } catch (err: any) {
      setMsgToast({ message: err.message || 'Failed to remove user account profile', type: 'error' });
    }
  };

  const handleUpdateSelf = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSelf('');
    setSuccessSelf('');

    if (!selfUsername || !selfEmail) {
      setErrorSelf('Username and Email parameters cannot be empty.');
      return;
    }

    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: selfUsername,
          email: selfEmail,
          password: selfPassword.trim() !== '' ? selfPassword : undefined
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Profile save error');
      }

      setSuccessSelf('Your administrator account settings have been saved successfully!');
      setSelfPassword('');
      onUserUpdate(data.user);
      onRefresh();
    } catch (err: any) {
      setErrorSelf(err.message || 'Sync failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {msgToast && (
        <div className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 animate-fade-in ${
          msgToast.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        }`}>
          <span>{msgToast.message}</span>
          <button onClick={() => setMsgToast(null)} className="text-[10px] hover:text-slate-100 uppercase tracking-widest font-bold cursor-pointer">OK</button>
        </div>
      )}
      {/* Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Account & User Profiles Manager
          </h2>
          <p className="text-xs text-slate-500 font-sans">Audit panel users, configure permissions, or alter administrative access</p>
        </div>

        <button
          onClick={() => {
            setErrorNewUser('');
            setSuccessNewUser('');
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User directory table list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0b101c] border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-900 bg-slate-950/20">
              <h3 className="text-sm font-semibold text-slate-200">System Users Directory</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-slate-950/10">
                    <th className="p-4 pl-6">Profile Username</th>
                    <th className="p-4">Authorization</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right pr-6">Purge Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/30">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/25 transition-colors text-slate-300 text-xs">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          {u.username}
                          {u.id === currentUser.id && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Active Self</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                      </td>
                      <td className="p-4">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono leading-none bg-red-500/10 text-red-400 border border-red-500/15">
                            <ShieldAlert className="w-3 h-3" /> System Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono leading-none bg-blue-500/10 text-blue-400 border border-blue-500/15">
                            <UserCheck className="w-3 h-3" /> Normal User
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          disabled={u.id === currentUser.id || u.id === 'u-admin'}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title={u.id === currentUser.id ? "Logged session account" : "Delete registered account profile"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Change Admin profile block */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 h-fit space-y-5 shadow-xl">
          <div className="pb-3 border-b border-[#1e293b]">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400 animate-pulse" /> Edit Admin Credentials
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Configure your active username, email parameters or alter password</p>
          </div>

          {errorSelf && (
            <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg animate-shake">
              {errorSelf}
            </div>
          )}

          {successSelf && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-900/40 text-cyan-200 text-xs rounded-lg animate-fade-in">
              {successSelf}
            </div>
          )}

          <form onSubmit={handleUpdateSelf} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={selfUsername}
                onChange={(e) => setSelfUsername(e.target.value)}
                className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500/80 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={selfEmail}
                onChange={(e) => setSelfEmail(e.target.value)}
                className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500/80 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>New Password</span>
                <span className="text-[9px] text-slate-500 font-normal lowercase">(Leave blank to keep same)</span>
              </label>
              <input
                type="password"
                placeholder="Alter your admin123 password"
                value={selfPassword}
                onChange={(e) => setSelfPassword(e.target.value)}
                className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500/80 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl hover:shadow-cyan-400/20 shadow-md transition-all duration-300 cursor-pointer text-center"
            >
              Save Admin Changes
            </button>
          </form>
        </div>
      </div>

      {/* Account Generation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Create System Profile
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {errorNewUser && (
              <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg">
                {errorNewUser}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Account Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., node-tester-profile"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Owner Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., tester@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password value"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="rounded bg-[#0d1321] border-slate-800 text-cyan-500 focus:ring-0 cursor-pointer animate-pulse"
                  />
                  <span className="text-xs text-slate-300 font-semibold uppercase tracking-wide">Induct as System Administrator</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#1e293b] text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:shadow-cyan-400/20 shadow-lg transition-all"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in pb-12">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-5 select-none text-[#cbd5e1]">
            <div className="flex items-center gap-3 text-red-500 border-b border-[#1e293b]/50 pb-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse text-red-500" />
              <h3 className="font-semibold text-xs uppercase tracking-widest text-slate-100">
                Wipe User Session Profile
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Are you sure you want to delete this user profile? All linked VPS containers, network settings, and API credentials owned by this user account will be permanently formatted! This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#334155]/20 text-slate-300 text-[10px] tracking-wider uppercase font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] tracking-wider uppercase font-semibold rounded-xl shadow-lg shadow-red-500/10 transition-all cursor-pointer"
              >
                Destroy Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
