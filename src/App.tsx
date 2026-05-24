import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Laptop, LayoutDashboard, Key, Server, Settings as SettingsIcon, 
  ShieldAlert, Users, Radio, HelpCircle, LogOut, Bell, ShieldCheck, Database,
  Info, Terminal, User, ChevronRight, Search, Folder
} from 'lucide-react';
import { User as UserType, Node, Instance, PortForward, ApiKey, SystemSettings } from './types';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VPSManagement from './components/VPSManagement';
import PortForwarding from './components/PortForwarding';
import NodeManagement from './components/NodeManagement';
import APIManagement from './components/APIManagement';
import UserManager from './components/UserManager';
import SystemMaintenance from './components/SystemMaintenance';
import Settings from './components/Settings';

// Fully integrated modular components
import SystemInfoView from './components/SystemInfoView';
import LogsConsoleView from './components/LogsConsoleView';
import BackupsCabinetView from './components/BackupsCabinetView';
import OSIconsView from './components/OSIconsView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import FileExplorer from './components/FileExplorer';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [guestView, setGuestView] = useState<'landing' | 'login'>('landing');
  
  // Scopes synced states
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [ports, setPorts] = useState<PortForward[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Notifications badge trigger
  const [unreadCount, setUnreadCount] = useState<number>(7);

  // Sync state data from API
  const refreshPanelData = async () => {
    try {
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
      }

      if (user) {
        const nodeRes = await fetch('/api/nodes');
        if (nodeRes.ok) setNodes(await nodeRes.json());

        const instRes = await fetch('/api/instances');
        if (instRes.ok) setInstances(await instRes.json());

        const portRes = await fetch('/api/ports');
        if (portRes.ok) setPorts(await portRes.json());

        const keyRes = await fetch('/api/apikeys');
        if (keyRes.ok) setApiKeys(await keyRes.json());

        const userRes = await fetch('/api/users');
        if (userRes.ok) setUsers(await userRes.json());
      }
    } catch (e) {
      console.error("Connection failed syncing metadata directories", e);
    }
  };

  useEffect(() => {
    refreshPanelData();
  }, [user]);

  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const setRes = await fetch('/api/settings');
        if (setRes.ok) {
          const setData = await setRes.json();
          setSettings(setData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialSettings();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setGuestView('landing');
  };

  const panelName = settings?.siteName || "SkydoCloud";
  const panelTag = settings?.siteDescription || "High-Performance VPS Panel";
  const panelLogo = settings?.logoUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop";

  if (!user) {
    if (guestView === 'landing') {
      return (
        <LandingPage 
          siteName={panelName}
          siteDescription={panelTag}
          logoUrl={panelLogo}
          backgroundImageUrl={settings?.backgroundImageUrl}
          onNavigateToLogin={() => setGuestView('login')}
          footerText={settings?.footerText}
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={(loggedUser) => setUser(loggedUser)} 
        siteName={panelName} 
        backgroundImageUrl={settings?.backgroundImageUrl}
        onBackToLanding={() => setGuestView('landing')}
        footerText={settings?.footerText}
      />
    );
  }

  const bgImg = settings?.backgroundImageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&fit=crop";

  // Filter for expiring instances
  const expiringInstances = instances.filter(inst => inst.status === 'suspended' || inst.name.toLowerCase().includes('temp') || inst.id.includes('v-1'));

  return (
    <div className="min-h-screen text-[#cbd5e1] font-sans flex select-none relative overflow-hidden bg-[#05070a]">
      {/* Absolute Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-102 pointer-events-none z-0"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070a]/93 via-[#060a15]/85 to-[#04060c]/94 backdrop-blur-[6px] pointer-events-none z-0" />

      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
        ></div>
      )}

      {/* Navigation sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[#070a13]/85 backdrop-blur-lg border-r border-slate-900/80 flex flex-col justify-between transition-all duration-300 w-64 shrink-0 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Logo Brand Title */}
          <div className="p-5 border-b border-slate-900/60 flex items-center gap-3">
            <img 
              src={panelLogo} 
              alt={`${panelName} logo`} 
              className="w-9 h-9 rounded-lg object-cover border border-slate-800"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop';
              }}
            />
            <div className="truncate">
              <h1 className="text-slate-100 font-bold text-xs tracking-tight uppercase">{panelName}</h1>
              <p className="text-[9px] text-slate-500 font-mono tracking-wide truncate">{panelTag}</p>
            </div>
          </div>

          <nav className="p-4 space-y-6 flex-1">
            {/* CATEGORY 1: MAIN */}
            <div>
              <span className="block px-2 text-[9px] font-mono tracking-widest text-slate-500 uppercase mb-2">MAIN</span>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'dashboard' 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab('vps'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'vps' 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Laptop className="w-4 h-4" /> Guest VPS List
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-900 border border-slate-800 text-slate-350 font-mono">
                    {instances.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('ports'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'ports' 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Radio className="w-4 h-4" /> Port Routing Map
                </button>
              </div>
            </div>

            {/* CATEGORY 2: MANAGEMENT */}
            <div>
              <span className="block px-2 text-[9px] font-mono tracking-widest text-slate-500 uppercase mb-2">MANAGEMENT</span>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('profile'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <User className="w-4 h-4" /> Profile Settings
                </button>

                <button
                  onClick={() => { setActiveTab('notifications'); setUnreadCount(0); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Bell className="w-4 h-4" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-600 text-white font-bold animate-pulse font-mono">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* CATEGORY 3: ADMINISTRATION */}
            {user.isAdmin && (
              <div>
                <span className="block px-2 text-[9px] font-mono tracking-widest text-slate-500 uppercase mb-2">ADMINISTRATION</span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveTab('users'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'users' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Users Profiles
                  </button>

                  <button
                    onClick={() => { setActiveTab('expiring-vps'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'expiring-vps' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Expiring VPS
                    </span>
                    {expiringInstances.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('nodes'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'nodes' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Server className="w-4 h-4" /> Nodes Server
                  </button>

                  <button
                    onClick={() => { setActiveTab('os-icons'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'os-icons' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" /> OS Icons Gallery
                  </button>

                  <button
                    onClick={() => { setActiveTab('apikeys'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'apikeys' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Key className="w-4 h-4" /> API Credentials
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY 4: SYSTEM */}
            {user.isAdmin && (
              <div>
                <span className="block px-2 text-[9px] font-mono tracking-widest text-slate-500 uppercase mb-2">SYSTEM</span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveTab('settings'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'settings' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4" /> Settings Configuration
                  </button>

                  <button
                    onClick={() => { setActiveTab('system-info'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'system-info' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Info className="w-4 h-4" /> System Info Diagnostics
                  </button>

                  <button
                    onClick={() => { setActiveTab('logs'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'logs' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Terminal className="w-4 h-4" /> Console Telemetry
                  </button>

                  <button
                    onClick={() => { setActiveTab('backups'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'backups' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Database className="w-4 h-4" /> Snapshots Backups
                  </button>

                  <button
                    onClick={() => { setActiveTab('files'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'files' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5' 
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Folder className="w-4 h-4" /> Local File Manager
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Profiles foot-bar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate max-w-[150px]">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow uppercase select-none font-mono">
                {user.username.substring(0, 2)}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-200 text-xs block truncate">{user.username}</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Primary Container Board */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <header className="h-16 bg-[#070a13]/85 border-b border-slate-900/80 flex items-center justify-between px-6 z-30 sticky top-0 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all select-none focus:outline-none cursor-pointer"
              title="Toggle system side-menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Simulated breadcrumb layout */}
            <div className="text-xs text-slate-500 font-mono tracking-wide hidden sm:flex items-center gap-1.5">
              <span>HVM Panel</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/20 border border-blue-900/10 text-blue-400 text-xs font-mono select-none font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> HANDSHAKE AUTHORIZED
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/30 hover:border-red-800 text-red-400 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CANVAS */}
        <main className="flex-1 p-6 overflow-y-auto max-w-full z-10 box-border custom-scrollbar">
          {activeTab === 'dashboard' && (
            <Dashboard 
              nodes={nodes} 
              instances={instances} 
              ports={ports} 
              onNavigate={(tab) => {
                const target = user.isAdmin ? tab : ['dashboard', 'vps', 'ports'].includes(tab) ? tab : 'dashboard';
                setActiveTab(target);
              }}
              siteName={panelName}
              siteDescription={panelTag}
            />
          )}

          {activeTab === 'vps' && (
            <VPSManagement 
              instances={instances} 
              nodes={nodes} 
              users={users} 
              currentUser={user}
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'ports' && (
            <PortForwarding 
              ports={ports} 
              instances={instances} 
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              currentUser={user}
              onUserUpdate={(updatedUser) => setUser(updatedUser)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView />
          )}

          {activeTab === 'users' && user.isAdmin && (
            <UserManager 
              users={users} 
              currentUser={user}
              onRefresh={refreshPanelData} 
              onUserUpdate={(updatedUser) => setUser(updatedUser)}
            />
          )}

          {activeTab === 'expiring-vps' && user.isAdmin && (
            <div className="space-y-6">
              <div className="border border-amber-900/30 bg-amber-950/15 p-4 rounded-xl text-xs text-amber-300 leading-relaxed flex items-start gap-2.5 font-sans">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
                <div>
                  <strong>Expiring Machines Warning:</strong> Active containers that have reached their expiration schedules. Review user profile resource bounds before applying suspension!
                </div>
              </div>
              <VPSManagement 
                instances={expiringInstances} 
                nodes={nodes} 
                users={users} 
                currentUser={user}
                onRefresh={refreshPanelData} 
              />
            </div>
          )}

          {activeTab === 'nodes' && user.isAdmin && (
            <NodeManagement 
              nodes={nodes} 
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'os-icons' && user.isAdmin && (
            <OSIconsView />
          )}

          {activeTab === 'apikeys' && user.isAdmin && (
            <APIManagement 
              apiKeys={apiKeys} 
              users={users} 
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'maintenance' && user.isAdmin && (
            <SystemMaintenance 
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'settings' && user.isAdmin && (
            <Settings 
              currentSettings={settings!} 
              onRefresh={refreshPanelData} 
            />
          )}

          {activeTab === 'system-info' && user.isAdmin && (
            <SystemInfoView siteName={panelName} />
          )}

          {activeTab === 'logs' && user.isAdmin && (
            <LogsConsoleView />
          )}

          {activeTab === 'backups' && user.isAdmin && (
            <BackupsCabinetView onRefreshPanel={refreshPanelData} />
          )}

          {activeTab === 'files' && user.isAdmin && (
            <FileExplorer />
          )}
        </main>
      </div>
    </div>
  );
}
