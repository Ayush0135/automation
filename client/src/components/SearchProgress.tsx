import React from "react";
import { Instagram, Layers, CheckCircle2, AlertTriangle, RefreshCw, Zap, ShieldCheck } from "lucide-react";

interface SearchProgressProps {
  progress: any;
  onRetry?: () => void;
}

export const SearchProgress: React.FC<SearchProgressProps> = ({ progress, onRetry }) => {
  if (!progress) return null;

  const ig = progress.instagram || { discovered: 0, usable: 0, target: 20, shortfall: 20 };
  const meta = progress.meta || { discovered: 0, usable: 0, target: 20, shortfall: 20 };
  const isCompleted = progress.status === "completed";
  const isRunning = progress.status === "running";

  return (
    <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 backdrop-blur-2xl shadow-2xl transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Live Dual-Source Pipeline Monitor
          </span>
          <span
            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 border font-semibold ${
              isRunning
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Harvesting Stream</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Dual Engine Finished</span>
              </>
            )}
          </span>
        </div>

        {isCompleted && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition font-mono"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Re-evaluate</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Instagram Reels Channel Card */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Instagram Reels Stream</span>
            </div>
            <span className="text-[11px] font-mono text-pink-400 font-bold">
              {ig.usable} / {ig.target} Usable
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (ig.usable / (ig.target || 1)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.04] text-[11px] font-mono">
            <div>
              <span className="text-[9px] text-slate-500 block">TARGET</span>
              <span className="font-bold text-white">{ig.target}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">DISCOVERED</span>
              <span className="font-bold text-slate-300">{ig.discovered}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">USABLE</span>
              <span className="font-bold text-emerald-400">{ig.usable}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">SHORTFALL</span>
              <span className={`font-bold ${ig.shortfall > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {ig.shortfall}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Ad Library Channel Card */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Meta Ad Library Stream</span>
            </div>
            <span className="text-[11px] font-mono text-blue-400 font-bold">
              {meta.usable} / {meta.target} Usable
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (meta.usable / (meta.target || 1)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.04] text-[11px] font-mono">
            <div>
              <span className="text-[9px] text-slate-500 block">TARGET</span>
              <span className="font-bold text-white">{meta.target}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">DISCOVERED</span>
              <span className="font-bold text-slate-300">{meta.discovered}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">USABLE</span>
              <span className="font-bold text-emerald-400">{meta.usable}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">SHORTFALL</span>
              <span className={`font-bold ${meta.shortfall > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {meta.shortfall}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
