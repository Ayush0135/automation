import React from "react";
import { Film, History, Activity, ShieldCheck, Sparkles, Layers, Instagram } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenStatus: () => void;
  providerStatus: any;
  totalSearches?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenStatus,
  providerStatus,
  totalSearches = 0,
}) => {
  const isMockMode =
    providerStatus?.providers?.instagram?.status === "unconfigured" ||
    providerStatus?.providers?.meta_ad_library?.status === "unconfigured";

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-indigo-400 shadow-sm">
              <Film className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Product Video Discovery Dashboard
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 shadow-sm">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:flex items-center space-x-2">
              <span>Dual-channel intelligence:</span>
              <span className="inline-flex items-center text-pink-400 font-mono text-[10px]">
                <Instagram className="w-2.5 h-2.5 mr-0.5" /> Instagram Reels
              </span>
              <span>+</span>
              <span className="inline-flex items-center text-blue-400 font-mono text-[10px]">
                <Layers className="w-2.5 h-2.5 mr-0.5" /> Meta Ad Library
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Live Status indicator */}
          <button
            onClick={onOpenStatus}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border-slate-800 hover:border-slate-700 shadow-sm"
            title="Inspect Provider Health and API status"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isMockMode ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isMockMode ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
            </span>
            <span className="font-medium text-[11px]">
              {isMockMode ? "Fallback Mode" : "Live APIs Active"}
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Search History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {totalSearches > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-indigo-300">
                {totalSearches}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
