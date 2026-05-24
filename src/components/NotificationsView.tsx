import React, { useState } from 'react';
import { Bell, ShieldCheck, Mail, Check, Star, RefreshCw, Trash2, ChevronRight } from 'lucide-react';

export default function NotificationsView() {
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Database snapshot compiled', desc: 'Standalone snapshots database backup completed successfully by the auto controller.', date: 'Just now', unread: true },
    { id: 2, title: 'VPS Suspension cleared', desc: 'Virtual machine container user-2949 CPU resource usage reset to 4.2% bounds.', date: '10 minutes ago', unread: true },
    { id: 3, title: 'Secure SSL Handshake Secure', desc: 'Secure SSL handshake completed. CJS-Agent controller binding online.', date: '1 hour ago', unread: true },
    { id: 4, title: 'Port routing rules appended', desc: 'Forwarding rule established: node virtual machine interface mapping port 25565.', date: 'Yesterday', unread: false },
    { id: 5, title: 'Global panel setup loaded', desc: 'Primary site metadata saved in system file cabinet db.json.', date: '2 days ago', unread: false }
  ]);

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, unread: false })));
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 4 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">Notifications</span>
      </div>

      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-500 animate-bounce" /> Notifications Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">Status notifications from master node controllers and database triggers</p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white font-bold text-xs uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl divide-y divide-slate-850">
        {alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic text-xs font-mono">
            No system notifications active in your stream logs.
          </div>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-900/10 transition-colors ${a.unread ? 'bg-blue-950/5' : ''}`}>
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${a.unread ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-950/40 text-slate-500'} border border-slate-900`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 tracking-wide flex items-center gap-2">
                    {a.title}
                    {a.unread && (
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{a.desc}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">{a.date}</span>
                </div>
              </div>

              <button
                onClick={() => deleteAlert(a.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
