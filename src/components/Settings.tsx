import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, Image, Sliders, Shield, MessageSquare, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  currentSettings: SystemSettings;
  onRefresh: () => void;
}

export default function Settings({ currentSettings, onRefresh }: SettingsProps) {
  const [siteName, setSiteName] = useState(currentSettings.siteName);
  const [siteDescription, setSiteDescription] = useState(currentSettings.siteDescription);
  const [logoUrl, setLogoUrl] = useState(currentSettings.logoUrl);
  const [cpuThreshold, setCpuThreshold] = useState(String(currentSettings.cpuThreshold));
  const [ramThreshold, setRamThreshold] = useState(String(currentSettings.ramThreshold));
  
  // Custom timezone & info
  const [timezone, setTimezone] = useState(currentSettings.timezone || 'UTC');
  const [footerText, setFooterText] = useState(currentSettings.footerText || 'Powered by SkydoCloud');
  const [faviconUrl, setFaviconUrl] = useState(currentSettings.faviconUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=32&h=32&fit=crop');
  const [userRegistration, setUserRegistration] = useState(currentSettings.userRegistration !== false);

  // Discord Configuration fields
  const [discordEnabled, setDiscordEnabled] = useState(currentSettings.discordEnabled);
  const [discordClientId, setDiscordClientId] = useState(currentSettings.discordClientId);
  const [discordClientSecret, setDiscordClientSecret] = useState(currentSettings.discordClientSecret);
  const [discordRedirectUri, setDiscordRedirectUri] = useState(currentSettings.discordRedirectUri);
  const [allowAutoRegistration, setAllowAutoRegistration] = useState(currentSettings.allowAutoRegistration);
  const [buttonText, setButtonText] = useState(currentSettings.buttonText);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(currentSettings.backgroundImageUrl || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          siteDescription,
          logoUrl,
          cpuThreshold: Number(cpuThreshold),
          ramThreshold: Number(ramThreshold),
          discordEnabled,
          discordClientId,
          discordClientSecret,
          discordRedirectUri,
          allowAutoRegistration: userRegistration && allowAutoRegistration,
          buttonText,
          backgroundImageUrl,
          footerText,
          timezone,
          faviconUrl,
          userRegistration
        }),
      });

      if (!res.ok) throw new Error('Failed to update system panel configurations');
      
      setSuccess('Global system panel settings committed and applied successfully!');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Breadcrumbs precisely styled like Image 6 */}
      <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5 font-mono">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span>Admin</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400">Settings</span>
      </div>

      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Panel Settings</h2>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
          {success}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg flex items-center gap-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: General Settings */}
          <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
              General Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Site Description
                </label>
                <input
                  type="text"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Footer Text
                </label>
                <input
                  type="text"
                  placeholder="Powered by SkydoCloud"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userRegistration}
                    onChange={(e) => setUserRegistration(e.target.checked)}
                    className="rounded bg-[#070a13] border-slate-800 text-blue-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">Enable user registration</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Branding */}
          <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
                Branding
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Header Icon URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Favicon URL
                </label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-4">
              <span className="text-xs font-semibold text-slate-400 block">Header Icon</span>
              <div className="bg-[#070a13] border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center space-y-1">
                <img
                  src={logoUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop'}
                  alt="Branding Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Resource Limits */}
          <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
              Resource Limits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  CPU Threshold %
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={cpuThreshold}
                  onChange={(e) => setCpuThreshold(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  RAM Threshold %
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={ramThreshold}
                  onChange={(e) => setRamThreshold(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Discord Authentication */}
          <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Discord Authentication
              </h3>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={discordEnabled}
                  onChange={(e) => setDiscordEnabled(e.target.checked)}
                  className="rounded bg-[#070a13] border-slate-800 text-blue-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs text-slate-300">Enable Discord Authentication</span>
              </label>
            </div>

            <div className={`space-y-4 transition-all duration-300 ${discordEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Discord Client ID
                  </label>
                  <input
                    type="text"
                    disabled={!discordEnabled}
                    value={discordClientId}
                    onChange={(e) => setDiscordClientId(e.target.value)}
                    className="w-full bg-[#070a13] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-250 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Discord Client Secret
                  </label>
                  <input
                    type="password"
                    disabled={!discordEnabled}
                    value={discordClientSecret}
                    onChange={(e) => setDiscordClientSecret(e.target.value)}
                    className="w-full bg-[#070a13] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-250 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Redirect URI
                </label>
                <input
                  type="text"
                  disabled={!discordEnabled}
                  value={discordRedirectUri}
                  onChange={(e) => setDiscordRedirectUri(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-250 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  disabled={!discordEnabled}
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-250 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  disabled={!discordEnabled}
                  checked={allowAutoRegistration}
                  onChange={(e) => setAllowAutoRegistration(e.target.checked)}
                  className="rounded bg-[#070a13] border-slate-800 text-blue-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs text-slate-300">Allow Auto-Registration</span>
              </div>

              <div className="bg-[#070a13]/60 border border-slate-900 rounded-xl p-4 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Setup Instructions</span>
                <ul className="text-xs text-slate-500 space-y-1 list-decimal list-inside pl-1">
                  <li>Create an application on the Discord Developer Portal.</li>
                  <li>Add a redirect URI matching your panel URL.</li>
                  <li>Copy the Client ID and Client Secret into the fields above.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dynamic HVM Background Customization Option inside settings page */}
          <div className="bg-[#0b101c]/75 backdrop-blur-md border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-3">
              Background Customization Wallpaper
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Custom Wallpaper Image URL
              </label>
              <input
                type="text"
                placeholder="Enter wallpaper image URL link"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1 mt-3">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Quick presets:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    name: "Aquatic Glow",
                    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&fit=crop"
                  },
                  {
                    name: "Crystal Cave",
                    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&fit=crop"
                  },
                  {
                    name: "Nebula Space",
                    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1920&fit=crop"
                  },
                  {
                    name: "Cyber Grid",
                    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&fit=crop"
                  },
                  {
                    name: "Minimal Dark",
                    url: ""
                  }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBackgroundImageUrl(preset.url)}
                    className={`group relative h-14 rounded-xl overflow-hidden border transition-all text-left p-1.5 flex flex-col justify-end cursor-pointer ${
                      backgroundImageUrl === preset.url
                        ? 'border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {preset.url ? (
                      <>
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#070a13] opacity-80"></div>
                    )}
                    <span className="relative z-10 text-[9px] font-bold text-slate-200 tracking-wide truncate group-hover:text-white transition-colors">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Form action controllers matches Image 6 */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
