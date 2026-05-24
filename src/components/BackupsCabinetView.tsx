import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, ChevronRight, Archive, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Backup } from '../types';

interface BackupsProps {
  onRefreshPanel: () => void;
}

export default function BackupsCabinetView({ onRefreshPanel }: BackupsProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerBackup = async () => {
    setNotice(null);
    try {
      const res = await fetch('/api/backups', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Synthesize snapshot collapsed');

      setNotice({ message: `Stand-alone file system backup snap [${data.filename}] synthesized successfully in cabinet directory.`, type: 'success' });
      loadBackups();
    } catch (err: any) {
      setNotice({ message: err.message || 'Backup collapsed.', type: 'error' });
    }
  };

  const triggerRestore = (fname: string) => {
    setConfirmModal({
      title: 'CRITICAL DATABASE SNAPSHOT RESTORATION',
      message: `UNAUTHORIZED ACTIONS ARE PROHIBITED: Restoring database snapshot file [${fname}] will overwrite ALL current users, logs, nodes registry entries, and VPS machines with historical values. All modern configs created since then will be deleted! Continue?`,
      onConfirm: async () => {
        setNotice(null);
        try {
          const res = await fetch('/api/backups/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: fname }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setNotice({ message: 'Panel master databases successfully synchronized to snapshot image structure!', type: 'success' });
          loadBackups();
          onRefreshPanel();
        } catch (err: any) {
          setNotice({ message: err.message || 'Restoration failed.', type: 'error' });
        }
      }
    });
  };

  const triggerDeleteBackup = (fname: string) => {
    setConfirmModal({
      title: 'DRASTIC SNAPSHOT FILE STORAGE PURGE',
      message: `Permanently delete snapshot file [${fname}] memory reserve from server storage files? This is irreversible!`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/backups/${fname}`, { method: 'DELETE' });
          if (res.ok) {
            setNotice({ message: 'Snapshot file purged successfully!', type: 'success' });
            loadBackups();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 4 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">Database Backups</span>
      </div>

      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Database Backups</h2>
        </div>

        <button
          onClick={triggerBackup}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-lg shadow-lg shadow-blue-500/10 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5" /> Synthesize Snapshot
        </button>
      </div>

      {notice && (
        <div className={`p-4 border rounded-xl flex items-start gap-3 animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-green-950/40 border-green-850/40 text-green-200' 
            : 'bg-red-950/40 border-red-900/40 text-red-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${notice.type === 'success' ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-0.5">Notification Banner</div>
            <p className="text-xs">{notice.message}</p>
          </div>
        </div>
      )}

      {/* Warning layout */}
      <div className="border border-yellow-900/30 bg-yellow-950/20 p-4 rounded-xl flex items-start gap-2.5 text-xs text-yellow-300">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0 animate-pulse" />
        <p className="leading-relaxed">
          <strong>Security Warning:</strong> Snapshot alignment destroys modifications executed in this terminal workspace since the historical snapshot was created. Always confirm master controller auth before restoration commands!
        </p>
      </div>

      {/* Snapshots Table Card */}
      <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
          <h3 className="text-slate-200 font-semibold text-sm tracking-tight flex items-center gap-2">
            <Archive className="w-4 h-4 text-blue-400" /> Stand-alone Snapshot Cabinet
          </h3>
          <button
            onClick={loadBackups}
            className="p-1.5 bg-[#0e1629] border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic text-xs font-mono">
            No system snapshot files located in cabinet reservoirs directory. Click "Synthesize Snapshot" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-slate-900/40">
                  <th className="p-4 pl-6">Backup Name</th>
                  <th className="p-4">Storage Size</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right pr-6">Control/Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-slate-900/20 transition-colors text-slate-300 text-xs">
                    <td className="p-4 pl-6 font-mono text-slate-200 font-semibold text-xs truncate max-w-sm">
                      {b.filename}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {(b.size / 1024).toFixed(2)} KB
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => triggerRestore(b.filename)}
                          className="px-3 py-1 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400 text-[10px] font-bold uppercase rounded transition-colors cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => triggerDeleteBackup(b.filename)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal overlay shield */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-[#cbd5e1]">
            <div className="flex items-center gap-2 text-yellow-500 border-b border-slate-800 pb-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-500" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
