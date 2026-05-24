import React from 'react';
import { LogIn, UserPlus, Shield, Cpu, ChevronRight, Zap, Network, Lock, Globe } from 'lucide-react';

interface LandingPageProps {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  onNavigateToLogin: () => void;
  footerText?: string;
}

export default function LandingPage({
  siteName,
  siteDescription,
  logoUrl,
  backgroundImageUrl,
  onNavigateToLogin,
  footerText
}: LandingPageProps) {
  const activeBg = backgroundImageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&fit=crop";
  const defaultLogo = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop";

  return (
    <div className="min-h-screen text-[#e2e8f0] flex flex-col relative overflow-hidden select-none bg-[#05070a]">
      {/* Immersive Wallpaper layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${activeBg})` }}
      />
      {/* Dark frosted overlay to pop content with contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070a]/94 via-[#080d19]/86 to-[#04060c]/96 backdrop-blur-[6px] z-0" />

      {/* Radiant ambient spotlights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* HEADER BAR */}
      <header className="relative z-10 w-full h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-900/40 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl || defaultLogo} 
            alt={`${siteName} logo`} 
            className="w-10 h-10 rounded-xl object-cover border border-[#1e293b]/80 shadow-[0_0_12px_rgba(34,211,238,0.1)] animate-pulse"
            onError={(e) => {
              e.currentTarget.src = defaultLogo;
            }}
          />
          <div>
            <h1 className="text-slate-100 font-bold text-sm tracking-tight">{siteName}</h1>
            <p className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase">{siteDescription}</p>
          </div>
        </div>

        {/* Top-Right Login Trigger */}
        <button
          onClick={onNavigateToLogin}
          className="px-5 py-2 hover:bg-[#1e293b]/70 border border-[#334155]/30 text-slate-300 hover:text-cyan-400 text-xs font-semibold rounded-xl hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2"
        >
          <LogIn className="w-3.5 h-3.5" /> Login
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-8 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/20 text-cyan-400 text-[10px] font-mono select-none tracking-wider uppercase animate-fade-in">
              <Shield className="w-3 h-3 text-cyan-400" /> Platform Security Active
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-100 uppercase tracking-tight leading-none font-sans">
                High-Performance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 font-extrabold mt-1">
                  VPS Management
                </span>
              </h2>
              <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed font-sans max-w-xl">
                Deploy and manage LXC containers with ease. Full-featured panel with real-time monitoring, port forwarding, and multi-node support.
              </p>
            </div>

            {/* Interaction Buttons exactly like screenshots */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Get Started
              </button>
              <button
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 bg-[#0b1329]/60 hover:bg-[#111c3a]/80 border border-[#22d3ee]/20 hover:border-cyan-400/50 text-slate-200 hover:text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            </div>

            {/* Performance metrics indicators matching screenshot */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-900/60 max-w-lg">
              <div className="space-y-1">
                <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">100%</span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Open Source</span>
              </div>
              <div className="space-y-1">
                <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">LXC</span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Container Native</span>
              </div>
              <div className="space-y-1">
                <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">Multi-Node</span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cluster Ready</span>
              </div>
            </div>
          </div>

          {/* Right side interactive card deck */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              {/* Backglow glow card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/5 rounded-2xl blur-xl" />
              
              <div className="relative bg-[#0b0f19]/70 border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-6 backdrop-blur-md select-none">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#22d3ee]">Active Daemon Node</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">v5.2-PRO</span>
                </div>

                {/* Simulated Server Live performance telemetry info */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Server Processor Usage</span>
                      <span className="text-cyan-400">24.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '24.2%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Network Port Routing Layer</span>
                      <span className="text-emerald-400">Normal</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1 pt-1">
                      {[1,1,1,1,1,1,0,1].map((status, i) => (
                        <div 
                          key={i} 
                          className={`h-4 rounded-[4px] border ${
                            status ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#070a13] border border-slate-900 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300 font-semibold font-mono">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Virtual Private Servers Online
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                      Guest kernels utilize native LXC namespaces, routing directly through hardware eth0 port pools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* POWERFUL FEATURES SECTION */}
      <section className="relative z-10 py-16 px-6 sm:px-12 border-t border-slate-900/60 bg-slate-950/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Built for Hypervisors</h3>
            <h4 className="text-2xl font-bold text-slate-150 uppercase tracking-tight">Powerful Features</h4>
            <p className="text-slate-500 text-xs">
              Every tool required to orchestrate physical container pools and port tables in a neat workspace UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0b0f19]/40 border border-slate-900/80 rounded-2xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/10 text-cyan-400 w-fit">
                <Network className="w-5 h-5" />
              </div>
              <h5 className="font-semibold text-slate-200 text-sm">Dynamic IP & Port Mapper</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Establish sub-routing mappings on the daemon host instantly. Route specific incoming high-ports to guest virtual servers automatically.
              </p>
            </div>

            <div className="bg-[#0b0f19]/40 border border-slate-900/80 rounded-2xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/10 text-cyan-400 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h5 className="font-semibold text-slate-200 text-sm">Token handshaking authorization</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Issue RESTful API keys with customizable limits to authorize third-party software agents or monitoring nodes to synchronize telemetry.
              </p>
            </div>

            <div className="bg-[#0b0f19]/40 border border-slate-900/80 rounded-2xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/10 text-cyan-400 w-fit">
                <Globe className="w-5 h-5" />
              </div>
              <h5 className="font-semibold text-slate-200 text-sm">Full-Stack backup snapshots</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Maintain backup snapshots in binary formats for secure database recovery. Vacuum unused rows to maximize performance safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 px-6 sm:px-12 border-t border-slate-900/40 text-center text-slate-600 text-[10px] tracking-wider uppercase font-mono">
        <span className="text-slate-500 font-semibold">{siteName}</span> © {new Date().getFullYear()} • {footerText || "Powered by SkydoCloud"} • Version 5.2-PRO-ULTIMATE
      </footer>
    </div>
  );
}
