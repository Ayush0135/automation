import React from "react";
import { Film, History, Activity, Sparkles, Layers, Instagram, Github, Radio } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenStatus: () => void;
  providerStatus: any;
  totalSearches?: number;
  currentProduct?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenStatus,
  providerStatus,
  totalSearches = 0,
  currentProduct = "Sony WH-1000XM5",
}) => {
  const isMockMode =
    providerStatus?.providers?.instagram?.status === "unconfigured" ||
    providerStatus?.providers?.meta_ad_library?.status === "unconfigured";

  return (
    <header className="border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-2xl sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo & Studio Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-rose-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-300"></div>
            <div className="relative w-9 h-9 rounded-xl bg-obsidian-900 border border-white/20 flex items-center justify-center text-indigo-400 shadow-md">
              <Film className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold tracking-tight text-white font-sans">
                Creative Discovery Studio
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                PRO 2.0
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center text-rose-400">
                <Instagram className="w-2.5 h-2.5 mr-0.5" /> Reels 9:16
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center text-blue-400">
                <Layers className="w-2.5 h-2.5 mr-0.5" /> Meta Ads
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate max-w-[140px] sm:max-w-xs">
                Active: <span className="text-slate-200">{currentProduct}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Health Radar & History */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Engine Status Radar */}
          <button
            onClick={onOpenStatus}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all bg-black/40 hover:bg-white/[0.08] text-slate-300 border-white/10 shadow-sm"
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
            <span className="font-semibold text-[11px] hidden sm:inline">
              {isMockMode ? "Fallback Mode" : "Live APIs Active"}
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Search History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-black/40 hover:bg-white/[0.08] text-slate-300 border border-white/10 transition shadow-sm"
            title="Search History Log"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {totalSearches > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {totalSearches}
              </span>
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Ayush0135/automation"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-black/40 hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 transition shadow-sm"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
