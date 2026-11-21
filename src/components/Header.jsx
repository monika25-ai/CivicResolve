import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Flame, 
  Sparkles, 
  Layers, 
  MapPin, 
  Radio, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Header({ 
  activeView, 
  setActiveView, 
  complaints = [], 
  isOnline = true 
}) {
  // Live badge counts
  const totalCount = complaints.length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const activeUnresolvedCount = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
              <Building2 className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  CivicResolve
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Tamil Nadu GCC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                AI Civic Issue Triage & Municipal Resolution System
              </p>
            </div>
          </div>

          {/* Navigation Dual-View Switcher with Live Badge Counts */}
          <nav className="flex items-center p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-inner">
            {/* Citizen Portal Tab */}
            <button
              onClick={() => setActiveView('citizen')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'citizen'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizen Portal</span>
              {totalCount > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeView === 'citizen'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {totalCount}
                </span>
              )}
            </button>

            {/* Authority Admin Hub Tab */}
            <button
              onClick={() => setActiveView('admin')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Authority Admin Hub</span>
              {criticalCount > 0 ? (
                <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-rose-500 text-white animate-pulse">
                  {criticalCount} Critical
                </span>
              ) : activeUnresolvedCount > 0 ? (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeView === 'admin'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {activeUnresolvedCount} Active
                </span>
              ) : null}
            </button>
          </nav>

          {/* System Indicators (Gemini 2.5 Flash & Live Sync) */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            {/* Gemini Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">gemini-2.5-flash</span>
            </div>

            {/* Firestore Sync Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
              isOnline 
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-950/50 border-amber-500/30 text-amber-400'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isOnline ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              <span className="font-semibold">{isOnline ? 'Firestore Live Sync' : 'Local Cache'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
