import React from 'react';
import { Server, Activity, Laptop, ArrowUpRight, HelpCircle, HardDrive, Shield } from 'lucide-react';
import { Node, Instance, PortForward } from '../types';

interface DashboardProps {
  nodes: Node[];
  instances: Instance[];
  ports: PortForward[];
  onNavigate: (view: string) => void;
  siteName: string;
  siteDescription: string;
}

export default function Dashboard({ nodes, instances, ports, onNavigate, siteName, siteDescription }: DashboardProps) {
  const activeVPS = instances.filter(i => i.status === 'running').length;
  const suspendedVPS = instances.filter(i => i.status === 'suspended').length;
  const stoppedVPS = instances.filter(i => i.status === 'stopped').length;

  const totalRAM = instances.reduce((acc, curr) => acc + (curr.status === 'running' ? curr.ramGB : 0), 0);
  const totalCores = instances.reduce((acc, curr) => acc + (curr.status === 'running' ? curr.cpuCores : 0), 0);

  // Compute stats
  const totalCapacityRAM = nodes.reduce((sum, n) => sum + n.maxCapacity, 0);
  const usedRAMPercent = totalCapacityRAM > 0 ? Math.round((nodes.reduce((sum, n) => sum + n.ramUsage, 0) / totalCapacityRAM) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner grid with high design context */}
      <div className="relative bg-gradient-to-r from-slate-900 to-[#0e1629] border border-cyan-500/10 rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-medium">
              <Shield className="w-3.5 h-3.5" /> Core VM Controller Connected
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-100 tracking-tight">
              Welcome to {siteName}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              {siteDescription} fully decoupled hardware agent framework. Launch, manage, and scale server-grade virtualization environments effortlessly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('vps')}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              Configure Virtual machines
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 bg-[#1e293b]/70 hover:bg-[#1e293b] border border-[#334155]/60 text-slate-300 font-medium text-xs tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer"
            >
              Modify System Limits
            </button>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic VPS active node counts */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 flex items-center justify-between group hover:border-cyan-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Running Containers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-100">{activeVPS}</span>
              <span className="text-xs text-slate-600">of {instances.length} total</span>
            </div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400 border border-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <Laptop className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Dynamic hypervisor cluster agent load metrics */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 flex items-center justify-between group hover:border-cyan-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Hardware Nodes</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-100">
                {nodes.filter(n => n.status === 'online').length}
              </span>
              <span className="text-xs text-slate-600">of {nodes.length} online</span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/5">
            <Server className="w-5 h-5" />
          </div>
        </div>

        {/* Port forward counts */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 flex items-center justify-between group hover:border-cyan-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Active Port Rules</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-100">{ports.length}</span>
              <span className="text-xs text-slate-600">routing channels</span>
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/5">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Active RAM consumption across hypervisors */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-xl p-5 flex items-center justify-between group hover:border-cyan-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Provisioned Memory</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-100">{totalRAM} GB</span>
              <span className="text-xs text-slate-600">across {totalCores} cores</span>
            </div>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/5">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Cluster visual indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core virtual resource summary indicators */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-slate-200 font-semibold tracking-tight">Cluster Node Load Allocation</h3>
              <p className="text-xs text-slate-500">Real-time memory and processing pipeline reservation status</p>
            </div>
            <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" />
          </div>

          <div className="space-y-5">
            {/* Memory state */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase">Memory allocation footprint</span>
                <span className="text-cyan-400 font-semibold">{usedRAMPercent}% ({totalRAM} GB / {totalCapacityRAM || 64} GB)</span>
              </div>
              <div className="w-full bg-[#181f30] rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(8, usedRAMPercent))}%` }}
                ></div>
              </div>
            </div>

            {/* Simulated CPU state based on running VPS */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase">Thread occupancy allocation</span>
                <span className="text-cyan-400 font-semibold">{activeVPS > 0 ? Math.min(100, activeVPS * 15 + 10) : 0}%</span>
              </div>
              <div className="w-full bg-[#181f30] rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${activeVPS > 0 ? Math.min(100, activeVPS * 15 + 10) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick status bullet legends */}
          <div className="pt-4 border-t border-[#1e293b]/70 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-mono">Running</div>
              <div className="text-base font-semibold text-green-400">{activeVPS}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-mono">Stopped</div>
              <div className="text-base font-semibold text-slate-400">{stoppedVPS}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-mono">Suspended</div>
              <div className="text-base font-semibold text-yellow-400">{suspendedVPS}</div>
            </div>
          </div>
        </div>

        {/* Quick Quick Start Action Guide block */}
        <div className="bg-[#0b101c] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-slate-200 font-semibold tracking-tight">API Quick Start</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Programmatic node integration allows managing container states externally over REST APIs using standard key headers.
            </p>
            <div className="p-3 bg-[#0d1321] border border-slate-900 rounded-xl font-mono text-[11px] text-slate-400 space-y-1">
              <div className="text-cyan-500"># Fetch your virtual environments</div>
              <div>curl -X GET \</div>
              <div>&nbsp;&nbsp;-H <span className="text-green-400">"X-API-Key: aryn_api_..."</span> \</div>
              <div>&nbsp;&nbsp;<span className="text-yellow-400">"https://{window.location.host}/api/instances"</span></div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('apikeys')}
            className="w-full mt-6 py-2.5 bg-[#141b2f] border border-[#1e293b] hover:border-cyan-500/40 text-slate-300 font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Create API keys <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
