import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, FileText, Search, Play, Pause, ChevronRight } from 'lucide-react';
import { SystemLog } from '../types';

export default function LogsConsoleView() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logScope, setLogScope] = useState<string>('all');
  const [logLimit, setLogLimit] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [filterText, setFilterText] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?scope=${logScope}&limit=${logLimit}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Telemetry fetch failing", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [logScope, logLimit]);

  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      loadLogs();
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPoll, logScope, logLimit]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filterText.toLowerCase()) ||
    log.scope.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 3 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">System Logs</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" /> System Logs Console
          </h2>
          <p className="text-xs text-slate-500 mt-1">Live, dynamic hypervisor event stream of auth transactions and database rollbacks</p>
        </div>

        {/* Console Controls bar */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search stream..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#070a13] border border-slate-800 rounded-lg text-xs placeholder:text-slate-600 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={logScope}
            onChange={(e) => setLogScope(e.target.value)}
            className="bg-[#070a13] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-350 outline-none cursor-pointer"
          >
            <option value="all">All Scopes</option>
            <option value="HVM Panel">HVM Panel</option>
            <option value="Node Agent">Node Agent</option>
            <option value="Security">Security</option>
            <option value="Database">Database</option>
          </select>

          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
              autoPoll 
                ? 'bg-[#15803d]/10 border-[#15803d]/30 text-green-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {autoPoll ? <Play className="w-3 h-3 text-green-400" /> : <Pause className="w-3 h-3" />}
            {autoPoll ? 'Auto 5s' : 'Paused'}
          </button>

          <button
            disabled={loading}
            onClick={loadLogs}
            className="p-2.5 bg-[#0e1629] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal View Panel */}
      <div className="bg-[#05070a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-900/80 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="ml-1.5 text-slate-400">host_agent@controller:~</span>
          </div>
          <span className="font-semibold text-cyan-500">TTY: SECURE SSL CHANNEL ACTIVE</span>
        </div>

        {/* Telemetry Console screen rows */}
        <div className="p-5 font-mono text-[11px] leading-relaxed max-h-[500px] overflow-y-auto space-y-2 select-text custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-16">
              No telemetry events match query boundaries under active scope filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const stampStr = new Date(log.timestamp).toLocaleTimeString();
              const levelColor = log.level === 'error' 
                ? 'bg-red-500/10 text-red-400' 
                : log.level === 'warning'
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-cyan-500/10 text-cyan-400';

              return (
                <div key={log.id} className="flex items-start gap-2.5 border-b border-slate-900/20 pb-1.5">
                  <span className="text-slate-600 shrink-0 select-none">[{stampStr}]</span>
                  
                  <span className={`px-2 py-0.2 rounded text-[9px] shrink-0 font-bold select-none uppercase ${levelColor}`}>
                    {log.scope}
                  </span>

                  <span className={`${
                    log.level === 'error' 
                      ? 'text-red-300 font-semibold' 
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
    </div>
  );
}
