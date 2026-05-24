import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, ShieldCheck, Download, Archive, RefreshCw, Server, AlertCircle, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { Backup, SystemLog, SystemInfo } from '../types';

interface MaintenanceProps {
  onRefresh: () => void;
}

export default function SystemMaintenance({ onRefresh }: MaintenanceProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [logScope, setLogScope] = useState<string>('all');
  const [logLimit, setLogLimit] = useState<number>(30);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/logs?scope=${logScope}&limit=${logLimit}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSysInfo = async () => {
    try {
      const res = await fetch('/api/system-info');
      if (res.ok) {
        const data = await res.json();
        setSysInfo(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerEmergency = (action: string, humanName: string) => {
    setConfirmModal({
      title: 'CRITICAL EMERGENCY OVERRIDE UNLOCKED',
      message: `CRITICAL WARNING: You are triggering an active, panel-wide override action: "${humanName}". This modifies and overrides client virtual container nodes directly. Are you fully authorized and sure you want to proceed?`,
      onConfirm: async () => {
        setActionLoading(action);
        setNotice(null);
        try {
          const res = await fetch('/api/maintenance/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Execution failed');
          
          setNotice({ message: data.message, type: 'warning' });
          loadLogs();
          onRefresh();
        } catch (err: any) {
          setNotice({ message: err.message || 'System override aborted.', type: 'error' });
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const triggerBackup = async () => {
    setNotice(null);
    try {
      const res = await fetch('/api/backups', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNotice({ message: `System database backup file [${data.filename}] synthesized successfully on server disc.`, type: 'success' });
      loadBackups();
      loadLogs();
    } catch (err: any) {
      setNotice({ message: err.message || 'Backup failed.', type: 'error' });
    }
  };

  const triggerRestore = (fname: string) => {
    setConfirmModal({
      title: 'EXTREME SYSTEM DATABASE RESTORE',
      message: `EXTREME WARNING: Restoring the panel database from [${fname}] will overwrite ALL current users, nodes, key databases, and VPS registries with the historical states preserved inside this file. Any newer changes will be permanently discarded! Continue?`,
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

          setNotice({ message: 'Panel database successfully aligned to historical backup file structure!', type: 'success' });
          loadBackups();
          loadLogs();
          onRefresh();
        } catch (err: any) {
          setNotice({ message: err.message || 'Restoration error', type: 'error' });
        }
      }
    });
  };

  const triggerDeleteBackup = (fname: string) => {
    setConfirmModal({
      title: 'DELETE BACKUP SNAPSHOT',
      message: `Permanently remove database backup file ${fname} from disk storage reserves?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/backups/${fname}`, { method: 'DELETE' });
          if (res.ok) {
            setNotice({ message: 'Backup file purged from controller reservoir.', type: 'success' });
            loadBackups();
            loadLogs();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  useEffect(() => {
    loadLogs();
    loadBackups();
    loadSysInfo();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [logScope, logLimit]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" /> Controller Maintenance & Overrides
        </h2>
        <p className="text-xs text-slate-500">Global hypervisor emergency commands, database automated backup caches, and live log logs</p>
      </div>

      {notice && (
        <div className={`p-4 border rounded-xl flex items-start gap-3 animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-green-950/40 border-green-800/40 text-green-200' 
            : notice.type === 'error'
            ? 'bg-red-950/40 border-red-900/40 text-red-200'
            : 'bg-yellow-950/40 border-yellow-800/40 text-yellow-200'
        }`}>
          <AlertCircle className={`w-5 h-5 mt-0.5 ${notice.type === 'success' ? 'text-green-400' : notice.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`} />
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-0.5">Notice</div>
            <p className="text-xs leading-normal">{notice.message}</p>
          </div>
        </div>
      )}

      {/* Database control + Emergency triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database backup block */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-slate-200 font-semibold tracking-tight flex items-center gap-2">
              <Archive className="w-4 h-4 text-cyan-400" /> Database Backup Manager
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Acquire standalone snapshots of the current site state, nodes list, and registries. Snapshots are stored inside the local backup vaults directory.
            </p>
          </div>

          <div className="border border-yellow-900/30 bg-yellow-950/20 p-4 rounded-xl flex items-start gap-2.5 text-xs text-yellow-300">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0 animate-pulse" />
            <p className="leading-normal">
              <strong>Warning Notice:</strong> Restoring snapshot images overwrites all existing profiles, configurations, and active API credentials generated since the backup was taken.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono">Available Snapshots</span>
              <button
                onClick={triggerBackup}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-[10px] tracking-wider uppercase rounded-lg shadow shadow-blue-500/10 cursor-pointer hover:shadow-cyan-400/20 active:translate-y-0.5 transition-all text-center"
              >
                Synthesize Snapshot
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="p-4 bg-[#080d17]/50 border border-slate-900 rounded-xl text-center text-xs text-slate-600 font-mono">
                No local backup snapshots found in controller backups dir.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-[#1e293b]/30 pr-2 space-y-2">
                {backups.map((b) => (
                  <div key={b.filename} className="flex items-center justify-between pt-2 pb-1 text-xs">
                    <div className="font-mono">
                      <span className="text-slate-300 font-semibold block truncate max-w-[200px]">{b.filename}</span>
                      <span className="text-[10px] text-slate-600 block">
                        {(b.size / 1024).toFixed(2)} KB • {new Date(b.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerRestore(b.filename)}
                        className="px-2.5 py-1 bg-yellow-600/10 hover:bg-yellow-600/25 border border-yellow-500/20 text-yellow-400 font-semibold text-[10px] uppercase rounded-md transition-colors cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => triggerDeleteBackup(b.filename)}
                        className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded transition-colors cursor-pointer"
                        title="Purge snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Overrides block */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-slate-200 font-semibold tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500 animate-pulse" /> Emergency Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Trigger global, instantaneous state manipulations in the event of hardware memory leaks or client attacks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <button
              disabled={actionLoading !== null}
              onClick={() => triggerEmergency("emergency_stop", "EMERGENCY STOP ALL ACTIVE VPS")}
              className="py-3.5 px-4 bg-[#df7c05] hover:bg-[#c96e00] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent w-full text-center"
            >
              EMERGENCY STOP ALL ACTIVE VPS
            </button>

            <button
              disabled={actionLoading !== null}
              onClick={() => triggerEmergency("emergency_reboot", "EMERGENCY REBOOT ALL GUEST CONTAINERS")}
              className="py-3.5 px-4 bg-[#f24e1e] hover:bg-[#d83f12] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent w-full text-center"
            >
              EMERGENCY REBOOT ALL GUEST CONTAINERS
            </button>

            <button
              disabled={actionLoading !== null}
              onClick={() => triggerEmergency("clear_suspensions", "CLEAR PANEL MEMORY SUSPENSIONS")}
              className="py-3.5 px-4 bg-[#0da662] hover:bg-[#0b8e53] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent w-full text-center"
            >
              CLEAR PANEL MEMORY SUSPENSIONS
            </button>

            <button
              disabled={actionLoading !== null}
              onClick={() => triggerEmergency("vacuum", "VACUUM & OPTIMIZE LOGS INDEX")}
              className="py-3.5 px-4 bg-[#131d2a]/65 hover:bg-[#1b2737]/80 border border-slate-800/80 text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full text-center"
            >
              VACUUM & OPTIMIZE LOGS INDEX
            </button>
          </div>
        </div>
      </div>

      {/* Logs reader asynchronously scoped */}
      <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-slate-200 font-semibold tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Controller System Log Console
            </h3>
            <p className="text-xs text-slate-500">Live, audited tracking index of authorization events, agent calls, and backup structures</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={logScope}
              onChange={(e) => setLogScope(e.target.value)}
              className="bg-[#0d1321] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="all">All Scopes</option>
              <option value="HVM Panel">HVM Panel</option>
              <option value="Node Agent">Node Agent</option>
              <option value="Security">Security</option>
              <option value="Database">Database</option>
            </select>

            <button
              disabled={loadingLogs}
              onClick={loadLogs}
              className="p-2 bg-[#0e1629] border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl transition-colors cursor-pointer"
              title="Refresh logs console"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Logs Console Box */}
        <div className="bg-[#07090e] border border-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto space-y-1.5 select-text custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-6">No matching telemetry logs located under selected scope query bounds.</div>
          ) : (
            logs.map((log) => {
              const stampStr = new Date(log.timestamp).toLocaleTimeString();
              return (
                <div key={log.id} className="flex items-start gap-2 border-b border-slate-900/40 pb-1">
                  <span className="text-slate-600 shrink-0 select-none">[{stampStr}]</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] shrink-0 font-bold select-none uppercase ${
                    log.level === 'error' 
                      ? 'bg-red-500/10 text-red-400' 
                      : log.level === 'warning'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {log.scope}
                  </span>
                  <span className={`${
                    log.level === 'error' 
                      ? 'text-red-300' 
                      : log.level === 'warning'
                      ? 'text-yellow-200'
                      : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hardware / System environment metrics summary (mimicking screenshot specifications) */}
      {sysInfo && (
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-[#1e293b]/70">
            <h3 className="text-slate-200 font-semibold tracking-tight flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" /> Host System Info Diagnostics
            </h3>
            <p className="text-xs text-slate-500">Local ethernet networks metadata and environment configuration values</p>
          </div>

          {/* Network params */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#070a12]/70 border border-slate-900 p-4 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-900/80">Ethernet Card Interfaces</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Controller IP Bind:</span>
                <span className="text-slate-300 font-semibold">{sysInfo.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subnet Mask:</span>
                <span className="text-slate-300 font-semibold">{sysInfo.netmask}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Broadcast Range:</span>
                <span className="text-slate-300 font-semibold">{sysInfo.broadcast}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hardware MAC Address:</span>
                <span className="text-slate-300 font-semibold">{sysInfo.macAddress}</span>
              </div>
            </div>

            {/* App Environment Configuration list */}
            <div className="bg-[#070a12]/70 border border-slate-900 p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] pb-1.5 border-b border-slate-900/80">Vps Environment Settings</div>
              <div className="grid grid-cols-2 gap-y-2 pt-1 gap-x-1.5 text-[11px]">
                <div className="flex justify-between border-r border-[#1e293b]/40 pr-2">
                  <span className="text-slate-500">Name:</span>
                  <span className="text-slate-300">{sysInfo.env.panelName}</span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-slate-500">Version:</span>
                  <span className="text-slate-300">{sysInfo.env.panelVersion}</span>
                </div>
                <div className="flex justify-between border-r border-[#1e293b]/40 pr-2">
                  <span className="text-slate-500">Developer:</span>
                  <span className="text-slate-300">{sysInfo.env.developer}</span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-slate-500">Bind:</span>
                  <span className="text-slate-300">{sysInfo.env.host}</span>
                </div>
                <div className="flex justify-between border-r border-[#1e293b]/40 pr-2">
                  <span className="text-slate-500">Db Format:</span>
                  <span className="text-slate-300">{sysInfo.env.databasePath}</span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-slate-500">Poll Trigger:</span>
                  <span className="text-slate-300">{sysInfo.env.statsUpdateInterval}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal targeting iframe usability */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-5 select-none text-[#cbd5e1]">
            <div className="flex items-center gap-3 text-red-500 border-b border-[#1e293b]/50 pb-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-500" />
              <h3 className="font-semibold text-xs uppercase tracking-widest text-slate-100">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]/50">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#334155]/20 text-slate-300 text-[10px] tracking-wider uppercase font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] tracking-wider uppercase font-semibold rounded-xl shadow-lg shadow-red-500/10 transition-all cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
