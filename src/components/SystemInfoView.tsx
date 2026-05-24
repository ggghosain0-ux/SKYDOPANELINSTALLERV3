import React from 'react';
import { Info, HelpCircle, Server, Terminal, ShieldAlert, Cpu } from 'lucide-react';

interface SystemInfoViewProps {
  siteName: string;
}

export default function SystemInfoView({ siteName }: SystemInfoViewProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Page Title & Diagnostics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Info className="w-6 h-6 text-blue-500 animate-pulse" /> System Diagnostics
        </h2>
        <p className="text-xs text-slate-500 mt-1">Host system virtual ethernet card interfaces and environment controller variables</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Virtual Ethernet Port Interfacing */}
        <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> Ethernet Card Interfaces
          </h3>

          <div className="space-y-3.5 font-mono text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
              <span className="text-slate-500">Controller IP Bind:</span>
              <span className="text-slate-250 font-bold text-blue-400">10.0.0.120</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
              <span className="text-slate-500">Subnet Mask:</span>
              <span className="text-slate-250 font-semibold text-slate-350">255.255.255.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
              <span className="text-slate-500">Broadcast Range:</span>
              <span className="text-slate-250 font-semibold text-slate-350">10.0.0.255</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
              <span className="text-slate-500">Hardware MAC Address:</span>
              <span className="text-slate-250 font-semibold text-slate-350">00:1A:2B:3C:4D:5E</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">DHCP Lease Type:</span>
              <span className="text-slate-250 font-medium px-2 py-0.5 rounded text-[10px] bg-blue-950/40 text-blue-400 border border-blue-900/30">
                STATIC IPV4
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Micro-Controller App Environment */}
        <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Host Environment Settings
            </h3>

            <div className="space-y-3.5 font-mono text-xs pt-1">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                <span className="text-slate-500">Version:</span>
                <span className="text-slate-250 font-bold text-slate-300">5.2-PRO-ULTIMATE</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                <span className="text-slate-500">Installation Dir:</span>
                <span className="text-slate-300 select-all">/home/panel/core</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                <span className="text-slate-500">Db File Path:</span>
                <span className="text-slate-300 select-all">/home/panel/db/db.json</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Python Binary:</span>
                <span className="text-slate-300 select-all">/usr/bin/python3</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-950/20 border border-blue-900/35 rounded-lg text-xs flex gap-2 text-blue-300 leading-relaxed">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
            <p>
              <strong>Handshake Authorized:</strong> Programmatic microkernel running in CJS-Agent Mode with active SSL token handshake and TLS certificate mapping.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
