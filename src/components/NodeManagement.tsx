import React, { useState } from 'react';
import { Server, Plus, Trash2, ShieldCheck, Cpu, HardDrive, MapPin, KeyRound } from 'lucide-react';
import { Node } from '../types';

interface NodeProps {
  nodes: Node[];
  onRefresh: () => void;
}

export default function NodeManagement({ nodes, onRefresh }: NodeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('USA - Virginia');
  const [apiSecret, setApiSecret] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('32'); // in GB
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (nodeId: string) => {
    setDeleteConfirmId(nodeId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const nodeId = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/nodes/${nodeId}`, {
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

    if (!name || !ipAddress || !apiSecret || !maxCapacity) {
      setError('All parameters are required to configure a hardware node.');
      return;
    }

    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ipAddress,
          location,
          apiSecret,
          maxCapacity: Number(maxCapacity),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setModalOpen(false);
      setName('');
      setIpAddress('');
      setApiSecret('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sync with node daemon');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">Dedicated Physical Nodes</h2>
          <p className="text-xs text-slate-500 font-sans">Register and scale separate, dedicated virtualization servers dynamically</p>
        </div>

        <button
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Physical Node
        </button>
      </div>

      {nodes.length === 0 ? (
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 space-y-4">
          <Server className="w-12 h-12 text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-slate-300 font-medium">No Hardware Nodes Linked</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This panel is empty. Add your first hardware node using the form at top right to enable virtual machine provisioning.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => {
            const usedRAMPercent = Math.round((node.ramUsage / node.maxCapacity) * 100);

            return (
              <div
                key={node.id}
                className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                {/* Node details */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <Server className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                        {node.name}
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_7px_#22c55e]"></span>
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">
                        IP: {node.ipAddress}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(node.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-colors cursor-pointer"
                    title="Remove Hardware Node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Node metrics layout */}
                <div className="space-y-3 font-sans text-xs pt-3 border-t border-[#1e293b]/70">
                  {/* Location info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3" /> Geographical Node Location
                    </span>
                    <span className="font-semibold text-slate-300">{node.location}</span>
                  </div>

                  {/* Allocation memory limits */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                      <span>RAM Occupancy</span>
                      <span>{usedRAMPercent}% ({node.ramUsage} GB / {node.maxCapacity} GB)</span>
                    </div>
                    <div className="w-full bg-[#181f30] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(7, usedRAMPercent))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Simulated CPU limits */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                      <span>CPU Pipeline Reserved</span>
                      <span>{node.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-[#181f30] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-yellow-500 h-1.5 rounded-full"
                        style={{ width: `${node.cpuUsage || 15}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Secure communication channel indicator */}
                <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Secure daemon authentication channel active
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add node modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" /> Add Dedicated Node Partner
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
                  Node Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., US-Host-Hypervisor-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    IP Address Host *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 141.98.50.211"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Geographic Region
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="USA - Virginia">USA - Virginia</option>
                    <option value="EU - Frankfurt">EU - Frankfurt</option>
                    <option value="Asia - Singapore">Asia - Singapore</option>
                    <option value="India - Mumbai">India - Mumbai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Daemon Key Secret *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="password"
                      required
                      placeholder="API Access Token"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Node RAM Capacity (GB)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="1024"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-sans leading-normal leading-relaxed">
                * Note: The server controller will send secure, signed HTTPS token signals to verify daemon handshakes. Ensure the remote agent is loaded and network ports allow inbound secure sockets.
              </p>

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
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:shadow-cyan-400/20 shadow-lg transition-all"
                >
                  Confirm Link Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Hardware Node Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in pb-12">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-5 select-none text-[#cbd5e1]">
            <div className="flex items-center gap-3 text-red-500 border-b border-[#1e293b]/50 pb-3">
              <Cpu className="w-5 h-5 flex-shrink-0 animate-pulse text-red-500" />
              <h3 className="font-semibold text-xs uppercase tracking-widest text-slate-100">
                Destroy Daemon Hardware Node
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              CRITICAL WARNING: Deleting this physical node will wipe out all virtual machines, instances, and port routing rules configured on this hardware. This cannot be undone! Proceed?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#334155]/20 text-slate-300 text-[10px] tracking-wider uppercase font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] tracking-wider uppercase font-semibold rounded-xl shadow-lg shadow-red-500/10 transition-all cursor-pointer"
              >
                Destroy Hardware Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
