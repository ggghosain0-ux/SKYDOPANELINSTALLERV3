import React, { useState } from 'react';
import { Key, Plus, Trash2, ShieldCheck, Copy, Check, Users, ChevronRight } from 'lucide-react';
import { ApiKey, User } from '../types';

interface APIProps {
  apiKeys: ApiKey[];
  users: User[];
  onRefresh: () => void;
}

export default function APIManagement({ apiKeys, users, onRefresh }: APIProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [expirationDate, setExpirationDate] = useState('never');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [latestCreatedKey, setLatestCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCopy = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (keyId: string) => {
    setDeleteConfirmId(keyId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const keyId = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/apikeys/${keyId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Revoking key failed');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !userId) {
      setError('Please provide a Label and assign an Owner.');
      return;
    }

    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          userId,
          expirationDate: expirationDate === 'never' ? 'never' : new Date(Date.now() + Number(expirationDate) * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setLatestCreatedKey(data.key.key);
      setModalOpen(false);
      setName('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Key generator error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 1 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">API keys</span>
      </div>

      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">API keys</h2>
        </div>

        <button
          onClick={() => {
            setError('');
            setUserId(users[0]?.id || 'u-admin');
            setLatestCreatedKey(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Key
        </button>
      </div>

      {latestCreatedKey && (
        <div className="p-4 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-xl space-y-3 shadow-md">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-green-400" /> API KEY GENERATED SUCCESSFULLY!
          </div>
          <p className="text-slate-400">
            For security reasons, this key will only be shown ONCE. Copy it immediately to a secure key vault!
          </p>
          <div className="flex items-center gap-2 max-w-xl">
            <span className="bg-[#070a13] border border-slate-800 px-3 py-2 font-mono text-[11px] select-all flex-1 select-all outline-none rounded-lg text-slate-100 font-bold tracking-wide">
              {latestCreatedKey}
            </span>
            <button
              onClick={() => handleCopy(latestCreatedKey, 'latest')}
              className="p-2.5 bg-[#0e1629] hover:bg-[#18233f] text-slate-300 rounded-lg border border-slate-850 flex items-center justify-center cursor-pointer transition-colors"
            >
              {copiedKey === 'latest' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-4">
          <Key className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-slate-300 font-semibold">No API Keys Registered</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create secure client authorization keys utilizing header parameter tokens to sync with automated scripts.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-slate-900/40">
                  <th className="p-4 pl-6">Label / Description</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Secret Access Token</th>
                  <th className="p-4">Expiration</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {apiKeys.map((k) => {
                  const o = users.find(u => u.id === k.userId);
                  return (
                    <tr key={k.id} className="hover:bg-slate-900/30 transition-colors text-slate-300 text-xs">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-slate-200">{k.name}</div>
                        {k.description && (
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">{k.description}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-slate-350">
                          <Users className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                          {o ? o.username : 'admin'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-450">{k.key.substring(0, 15)}...••••</span>
                          <button
                            onClick={() => handleCopy(k.key, k.id)}
                            className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                            title="Copy API Token Key"
                          >
                            {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {k.expirationDate === 'never' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono leading-none bg-green-950/20 text-green-400 border border-green-800/20">
                            Never
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">
                            {new Date(k.expirationDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleDelete(k.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded border border-transparent hover:border-red-500/10 transition-colors cursor-pointer"
                          title="Revoke access key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Key Creation Modal mimicking Image 2 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-slate-100 font-bold text-base">
                Create API Key
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-350 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Automated Agent Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner *
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expiration *
                </label>
                <select
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="never">Never</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="A short note explaining what this credential accesses"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                >
                  Create API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete API Key Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-[#cbd5e1]">
            <div className="flex items-center gap-2 text-red-500 border-b border-slate-800 pb-2.5">
              <Key className="w-4 h-4 flex-shrink-0 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-150">
                Revoke Secure API Key
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal leading-relaxed">
              Are you sure you want to revoke this API access key? Any active scripts or software agents using this secret token will instantly fail security handshake and authorization!
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
