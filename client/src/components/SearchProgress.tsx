import React from "react";
import { Instagram, Layers, CheckCircle2, AlertTriangle, RefreshCw, Zap } from "lucide-react";

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
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            2. Live Discovery Pipeline Stream
          </span>
          <span
            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 border font-medium ${
              isRunning
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm"
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
                <span>Collection Complete</span>
              </>
            )}
          </span>
        </div>

        {isCompleted && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition shadow-sm font-medium"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Re-evaluate</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Instagram Reels Channel Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-inner relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Instagram Reels</h3>
                <span className="text-[10px] text-slate-400 font-mono">Apify Live Search Actor</span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-sm font-bold text-white">
                {ig.discovered} <span className="text-slate-500 font-normal">/ {ig.target || 20}</span>
              </span>
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Target Quota</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-3.5 p-0.5 border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow"
              style={{ width: `${Math.min(100, ((ig.discovered || 0) / (ig.target || 20)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-900 text-center font-mono text-xs">
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Discovered</span>
              <span className="font-bold text-slate-200">{ig.discovered}</span>
            </div>
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Usable Stream</span>
              <span className="font-bold text-emerald-400">{ig.usable}</span>
            </div>
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Shortfall</span>
              <span className={`font-bold ${ig.shortfall > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {ig.shortfall || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Ad Library Channel Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-inner relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Meta Ad Library</h3>
                <span className="text-[10px] text-slate-400 font-mono">Commercial Video Ads Engine</span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-sm font-bold text-white">
                {meta.discovered} <span className="text-slate-500 font-normal">/ {meta.target || 20}</span>
              </span>
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Target Quota</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-3.5 p-0.5 border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow"
              style={{ width: `${Math.min(100, ((meta.discovered || 0) / (meta.target || 20)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-900 text-center font-mono text-xs">
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Discovered</span>
              <span className="font-bold text-slate-200">{meta.discovered}</span>
            </div>
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Usable Stream</span>
              <span className="font-bold text-emerald-400">{meta.usable}</span>
            </div>
            <div className="bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Shortfall</span>
              <span className={`font-bold ${meta.shortfall > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {meta.shortfall || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
