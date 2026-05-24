import React, { useState } from 'react';
import { Network, Plus, Trash2, ArrowRightLeft, Radio } from 'lucide-react';
import { PortForward, Instance } from '../types';

interface PortProps {
  ports: PortForward[];
  instances: Instance[];
  onRefresh: () => void;
}

export default function PortForwarding({ ports, instances, onRefresh }: PortProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [vpsId, setVpsId] = useState('');
  const [publicPort, setPublicPort] = useState('');
  const [privatePort, setPrivatePort] = useState('');
  const [protocol, setProtocol] = useState<'tcp' | 'udp'>('tcp');
  const [error, setError] = useState('');

  const handleDelete = async (portId: string) => {
    try {
      const res = await fetch(`/api/ports/${portId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Deletion failed');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vpsId || !publicPort || !privatePort) {
      setError('Please configure all forwarding parameters.');
      return;
    }

    try {
      const res = await fetch('/api/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpsId,
          publicPort: Number(publicPort),
          privatePort: Number(privatePort),
          protocol
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setModalOpen(false);
      setPublicPort('');
      setPrivatePort('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to establish route mapping');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">Active Port Forwarding</h2>
          <p className="text-xs text-slate-500">Route inbound traffic from host nodes to container services</p>
        </div>

        <button
          onClick={() => {
            setError('');
            if (instances.length === 0) {
              setError("Warning: You must provision at least one VPS instance before configuring network port rules.");
              setVpsId('');
            } else {
              setVpsId(instances[0].id);
            }
            setModalOpen(true);
          }}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-cyan-400/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-305 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> ADD PORT RULE
        </button>
      </div>

      {ports.length === 0 ? (
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 space-y-4">
          <Network className="w-12 h-12 text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-slate-300 font-medium">No Port Forwarding Rules Defined</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Map public network sockets on host nodes directly to internal application services like SSH (22) or web servers (80).
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-slate-950/20">
                  <th className="p-4 pl-6">Target VPS</th>
                  <th className="p-4">Public Port</th>
                  <th className="p-4">Protocol</th>
                  <th className="p-4">Internal Mapping</th>
                  <th className="p-4 text-right pr-6">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/30">
                {ports.map((p) => {
                  const correlatedVPS = instances.find(v => v.id === p.vpsId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-950/25 transition-colors text-slate-300 text-xs">
                      <td className="p-4 pl-6 font-medium text-slate-200">
                        {correlatedVPS ? correlatedVPS.name : 'Purged VM'}
                        {correlatedVPS && (
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            {correlatedVPS.ipAddress}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-100">
                        {p.publicPort}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                          p.protocol === 'tcp' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {p.protocol.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>Node IP</span>
                          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-cyan-400">{p.privatePort}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors border border-transparent hover:border-red-500/10 cursor-pointer"
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

      {/* Port Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" /> Configure Port Routing Rule
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Assigned VPS Instance *
                </label>
                <select
                  value={vpsId}
                  onChange={(e) => setVpsId(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                >
                  {instances.map(i => (
                    <option key={i.id} value={i.id}>{i.name} [{i.ipAddress}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Forwarding Protocol
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as 'tcp' | 'udp')}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="tcp">TCP Protocol</option>
                    <option value="udp">UDP Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Private Port *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="65535"
                    placeholder="e.g., 22, 80"
                    value={privatePort}
                    onChange={(e) => setPrivatePort(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Public Port Allocation *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  max="65535"
                  placeholder="e.g., 22001, 8005"
                  value={publicPort}
                  onChange={(e) => setPublicPort(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Typically allocations range above port 1000</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#1e293b] text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={instances.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:shadow-cyan-400/20 shadow-lg transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  Configure Forward Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
