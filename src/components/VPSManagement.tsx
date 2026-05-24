import React, { useState } from 'react';
import { Laptop, Play, Square, RotateCw, AlertTriangle, Plus, Trash2, ShieldAlert, Cpu, HardDrive, Network, Search } from 'lucide-react';
import { Instance, Node, User } from '../types';

interface VPSProps {
  instances: Instance[];
  nodes: Node[];
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

export default function VPSManagement({ instances, nodes, users, currentUser, onRefresh }: VPSProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [userId, setUserId] = useState('');
  const [cpuCores, setCpuCores] = useState('2');
  const [ramGB, setRamGB] = useState('4');
  const [diskGB, setDiskGB] = useState('40');
  const [ipAddress, setIpAddress] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const triggerAction = async (vpsId: string, action: string) => {
    setActionLoading(`${vpsId}-${action}`);
    try {
      const res = await fetch(`/api/instances/${vpsId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Action execution failed');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteInstance = (vpsId: string) => {
    setDeleteConfirmId(vpsId);
  };

  const confirmDeleteInstance = async () => {
    if (!deleteConfirmId) return;
    const vpsId = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/instances/${vpsId}`, {
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

    if (!name || !nodeId || !userId || !ipAddress) {
      setError('Please configure all allocation parameters.');
      return;
    }

    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nodeId,
          userId,
          cpuCores: Number(cpuCores),
          ramGB: Number(ramGB),
          diskGB: Number(diskGB),
          ipAddress
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setModalOpen(false);
      setName('');
      setIpAddress('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to provision instance');
    }
  };

  // Filter instances if not admin
  const visibleInstances = currentUser.isAdmin 
    ? instances 
    : instances.filter(i => i.userId === currentUser.id);

  const filteredInstances = visibleInstances.filter(vps => {
    const correspondingNode = nodes.find(n => n.id === vps.nodeId);
    const owner = users.find(u => u.id === vps.userId);
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      vps.name.toLowerCase().includes(query) ||
      vps.ipAddress.toLowerCase().includes(query) ||
      (correspondingNode?.name || '').toLowerCase().includes(query) ||
      (owner?.username || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">Virtual Private Servers (VPS)</h2>
          <p className="text-xs text-slate-500 mt-1">Launch and maintain custom container environments</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search VPS instances..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#070a13] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all w-full sm:w-64"
            />
          </div>

          {currentUser.isAdmin && (
            <button
              onClick={() => {
                setError('');
                if (nodes.length === 0) {
                  setError("Warning: No physical node servers exist. You must configure at least one physical Node in the Node Servers panel before a VPS can be provisioned.");
                  setNodeId('');
                  setUserId('');
                } else {
                  setNodeId(nodes[0].id);
                  setUserId(users[0]?.id || currentUser.id);
                }
                setModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Provision VPS
            </button>
          )}
        </div>
      </div>

      {visibleInstances.length === 0 ? (
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 space-y-4">
          <Laptop className="w-12 h-12 text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-slate-300 font-medium">No VPS Instances Registered</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no sample virtual environments in this panel. {currentUser.isAdmin ? "Add a physical Node and click 'Provision VPS' to activate your first virtual container." : "No instances assigned to your profile yet."}
            </p>
          </div>
        </div>
      ) : filteredInstances.length === 0 ? (
        <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-4 animate-fade-in">
          <Search className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-slate-300 font-semibold">No Results Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your search for "{searchText}" produced no matching Virtual Private Servers names, IPs, nodes, or owners.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredInstances.map((vps) => {
            const correspondingNode = nodes.find(n => n.id === vps.nodeId);
            const owner = users.find(u => u.id === vps.userId);

            return (
              <div
                key={vps.id}
                className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                {/* Header detail */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      vps.status === 'running' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/10' 
                        : vps.status === 'suspended'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'
                        : 'bg-slate-500/10 text-slate-400 border-slate-700/40'
                    }`}>
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                        {vps.name}
                        <span className={`w-2 h-2 rounded-full ${
                          vps.status === 'running' 
                            ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' 
                            : vps.status === 'suspended'
                            ? 'bg-yellow-500'
                            : 'bg-slate-500'
                        }`}></span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                          {vps.ipAddress}
                        </span>
                        <span>•</span>
                        <span>Node: {correspondingNode ? correspondingNode.name : 'Unknown Host'}</span>
                        {currentUser.isAdmin && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">Owner: {owner ? owner.username : 'Unknown'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {currentUser.isAdmin && (
                    <button
                      onClick={() => deleteInstance(vps.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
                      title="Destroy Virtual Machine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Resource allocations bar grids */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#1e293b]/70 text-xs font-mono">
                  <div className="bg-[#080d17]/50 p-2 rounded-lg border border-slate-900">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-600" /> CPU Allocation
                    </div>
                    <div className="text-slate-300 font-semibold mt-1">{vps.cpuCores} vCores</div>
                  </div>
                  <div className="bg-[#080d17]/50 p-2 rounded-lg border border-slate-900">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-600" /> Memory size
                    </div>
                    <div className="text-slate-300 font-semibold mt-1">{vps.ramGB} GB RAM</div>
                  </div>
                  <div className="bg-[#080d17]/50 p-2 rounded-lg border border-slate-900">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                      <Network className="w-3 h-3 text-slate-600" /> SSD Storage
                    </div>
                    <div className="text-slate-300 font-semibold mt-1">{vps.diskGB} GB SSD</div>
                  </div>
                </div>

                {/* VM Actions (Start, Stop, Reboot, Suspend) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={vps.status === 'running' || vps.status === 'suspended' || actionLoading !== null}
                    onClick={() => triggerAction(vps.id, 'start')}
                    className="flex-1 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg border border-green-500/15 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                  <button
                    disabled={vps.status === 'stopped' || vps.status === 'suspended' || actionLoading !== null}
                    onClick={() => triggerAction(vps.id, 'stop')}
                    className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/15 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop
                  </button>
                  <button
                    disabled={vps.status === 'stopped' || vps.status === 'suspended' || actionLoading !== null}
                    onClick={() => triggerAction(vps.id, 'restart')}
                    className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/15 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Reboot
                  </button>

                  {currentUser.isAdmin && (
                    <button
                      disabled={vps.status === 'suspended' || actionLoading !== null}
                      onClick={() => triggerAction(vps.id, 'suspend')}
                      className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg border border-yellow-500/15 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center"
                      title="Suspend container resources"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision VPS modal form for Admins */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" /> Provision Virtual Environment
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    VPS Instance Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., prod-web-server"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Assigned IP Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 185.22.41.98"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Host physical node *
                  </label>
                  <select
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.name} [{n.ipAddress}]</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                    Owner Account *
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    vCPU Cores
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={cpuCores}
                    onChange={(e) => setCpuCores(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    RAM Volume (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={ramGB}
                    onChange={(e) => setRamGB(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    SSD Disk (GB)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={diskGB}
                    onChange={(e) => setDiskGB(e.target.value)}
                    className="w-full bg-[#0d1321] border border-[#1e293b] rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
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
                  disabled={nodes.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:shadow-cyan-400/20 shadow-lg transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md animate-fade-in pb-12">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-5 select-none text-[#cbd5e1]">
            <div className="flex items-center gap-3 text-red-500 border-b border-[#1e293b]/50 pb-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-red-500" />
              <h3 className="font-semibold text-xs uppercase tracking-widest text-slate-100">
                Destroy Virtual Machine
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Are you sure you want to delete this VPS instance? This action is permanent and will format all virtual disks! This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#334155]/20 text-slate-300 text-[10px] tracking-wider uppercase font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInstance}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] tracking-wider uppercase font-semibold rounded-xl shadow-lg shadow-red-500/10 transition-all cursor-pointer"
              >
                Destroy VPS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
