import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, KeyRound, User, ArrowLeft, LogIn } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  siteName: string;
  backgroundImageUrl?: string;
  onBackToLanding?: () => void;
  footerText?: string;
}

export default function Login({ onLoginSuccess, siteName, backgroundImageUrl, onBackToLanding, footerText }: LoginProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in both account credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Connecting to Controller backend failed.');
    } finally {
      setLoading(false);
    }
  };

  const activeBg = backgroundImageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&fit=crop";
  const defaultLogo = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop";

  return (
    <div className="min-h-screen text-[#cbd5e1] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none bg-[#05070a] font-sans">
      {/* Immersive Wallpaper layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${activeBg})` }}
      />
      {/* Dark glassmorphic layer */}
      <div className="absolute inset-0 bg-slate-950/85 md:bg-slate-950/75 backdrop-blur-[6px] z-0" />

      {/* Radiant spotlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in space-y-6">
        
        {/* Back Button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </button>
        )}

        {/* Central Core Login Card */}
        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo container & welcome headers centered */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-4">
              <img 
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop" 
                alt={`${siteName} logo`} 
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md shadow-blue-500/25"
                onError={(e) => {
                  e.currentTarget.src = defaultLogo;
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-lg flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500/80 rounded-lg py-2.5 px-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-300 font-sans">
                  Password
                </label>
                <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070a13] border border-slate-800 focus:border-blue-500/80 rounded-lg py-2.5 pl-3 pr-10 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Checkbox fields: Remember me etc */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded bg-[#070a13] border-slate-800 text-blue-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
            </div>

            {/* Action Submit - Solid bright flat blue with entry arrow icon */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer outline-none select-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Auth Version Footer matches Image 7 perfectly! */}
        <div className="text-center pt-2">
          <p className="text-slate-500 text-[11px] tracking-wider font-sans">
            {footerText || "Powered by SkydoCloud"} © 2026 | Version 5.2-PRO-ULTIMATE
          </p>
        </div>
      </div>
    </div>
  );
}
