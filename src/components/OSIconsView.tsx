import React from 'react';
import { HelpCircle, Terminal, HelpCircle as QuestionIcon, Plus, Check, ChevronRight } from 'lucide-react';

export default function OSIconsView() {
  const templates = [
    { name: "Ubuntu 22.04 LTS (Jammy)", type: "Linux (Debian-based)", icon: "https://assets.ubuntu.com/v1/29985a98-ubuntu-logo32.png", arch: "x86_64", state: "Verified" },
    { name: "Debian 12 (Bookworm)", type: "Linux (Debian-based)", icon: "https://www.debian.org/logos/openlogo-100.png", arch: "x86_64", state: "Verified" },
    { name: "CentOS Stream 9", type: "Linux (RedHat-based)", icon: "https://www.centos.org/assets/img/logo-centos-stream.png", arch: "x86_64", state: "Legacy" },
    { name: "AlmaLinux 9.4", type: "Linux (RedHat-based)", icon: "https://almalinux.org/images/logo.svg", arch: "x86_64", state: "Verified" },
    { name: "Alpine Linux 3.20", type: "Linux (Ultra-light)", icon: "https://alpinelinux.org/alpinelinux-logo.svg", arch: "x86_64 / arm64", state: "Verified" },
    { name: "Windows Server 2022 Datacenter", type: "Windows (Hyper-V Optimized)", icon: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg", arch: "x86_64", state: "Premium Required" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 4 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">OS Icons Gallery</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Terminal className="w-6 h-6 text-green-400" /> OS Containers Templates
        </h2>
        <p className="text-xs text-slate-500 mt-1">Deployable local container virtual machine images and base operating system kernels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.name} className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-950/40 p-2 flex items-center justify-center border border-slate-900 group-hover:scale-105 transition-transform">
                  <img 
                    src={t.icon} 
                    alt={t.name} 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs tracking-wide">{t.name}</h4>
                  <span className="text-[10px] text-slate-500 block font-mono">{t.type}</span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[8px] font-mono leading-none tracking-wider uppercase ${
                t.state === 'Verified' 
                  ? 'bg-green-950/20 text-green-400 border border-green-900/30' 
                  : t.state === 'Legacy' 
                  ? 'bg-yellow-950/20 text-yellow-400 border border-yellow-900/30' 
                  : 'bg-blue-950/20 text-blue-400 border border-blue-900/30'
              }`}>
                {t.state}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-900/40 pt-3">
              <span>Architecture Check:</span>
              <span className="font-semibold text-slate-300">{t.arch}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
