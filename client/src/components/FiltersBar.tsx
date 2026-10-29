import React from "react";
import { 
  Instagram, 
  Layers, 
  Search, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  Film, 
  Sparkles, 
  ArrowUpDown, 
  Zap,
  Columns
} from "lucide-react";

interface FiltersBarProps {
  activeTab: "all" | "instagram" | "meta_ad_library";
  onTabChange: (tab: "all" | "instagram" | "meta_ad_library") => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  showDuplicates: boolean;
  onToggleDuplicates: () => void;
  showPreviouslySeen: boolean;
  onTogglePreviouslySeen: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  sortBy: "score" | "recent" | "views";
  onSortByChange: (sort: "score" | "recent" | "views") => void;
  viewMode: "reels" | "cinema" | "table";
  onViewModeChange: (mode: "reels" | "cinema" | "table") => void;
  counts: {
    all: number;
    instagram: number;
    meta: number;
    realInstagram?: number;
    mockInstagram?: number;
    realMeta?: number;
    mockMeta?: number;
  };
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  activeTab,
  onTabChange,
  minScore,
  onMinScoreChange,
  showDuplicates,
  onToggleDuplicates,
  showPreviouslySeen,
  onTogglePreviouslySeen,
  searchTerm,
  onSearchTermChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  counts,
}) => {
  return (
    <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-2xl space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Source Channel Switcher */}
        <div className="flex items-center space-x-1.5 p-1 bg-black/60 border border-white/10 rounded-xl">
          <button
            onClick={() => onTabChange("all")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "all"
                ? "bg-white/10 text-white shadow-sm border border-white/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>All Creative</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-slate-200">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onTabChange("instagram")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "instagram"
                ? "bg-gradient-to-r from-rose-950/90 to-purple-950/90 text-pink-300 border border-pink-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram Reels</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-pink-950 text-pink-300 font-bold border border-pink-700/50">
              {counts.instagram} {counts.realInstagram ? `(${counts.realInstagram} Live)` : ""}
            </span>
          </button>

          <button
            onClick={() => onTabChange("meta_ad_library")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "meta_ad_library"
                ? "bg-blue-950/90 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Meta Ad Library</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-bold border border-blue-700/50">
              {counts.meta} {counts.realMeta ? `(${counts.realMeta} Live)` : ""}
            </span>
          </button>
        </div>

        {/* View Mode Switcher (Reels Wall / Cinema Split / Matrix Table) */}
        <div className="flex items-center space-x-1.5 self-end lg:self-auto">
          <span className="text-[11px] font-mono text-slate-500 mr-1 hidden sm:inline">View:</span>
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => onViewModeChange("reels")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === "reels"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="9:16 Vertical Video Reels Wall"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Reels Wall</span>
            </button>

            <button
              onClick={() => onViewModeChange("cinema")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === "cinema"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Studio Cinema Split Theater"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Cinema Studio</span>
            </button>

            <button
              onClick={() => onViewModeChange("table")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Analytics Data Table"
            >
              <List className="w-3.5 h-3.5" />
              <span>Data Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Search, Score Threshold, & Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 border-t border-white/[0.06] gap-3">
        {/* Instant filter query */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Filter captions, creators, SKU tags..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
          />
        </div>

        {/* Confidence Score Pill Slider & Sort Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Match Score Filter */}
          <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400">Min Match:</span>
            <button
              onClick={() => onMinScoreChange(0)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${minScore === 0 ? "bg-white/20 text-white font-bold" : "text-slate-400"}`}
            >
              All
            </button>
            <button
              onClick={() => onMinScoreChange(0.5)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${minScore === 0.5 ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "text-slate-400"}`}
            >
              50%+
            </button>
            <button
              onClick={() => onMinScoreChange(0.8)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${minScore === 0.8 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold" : "text-slate-400"}`}
            >
              80%+ Verified
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="score" className="bg-obsidian-950 text-white">AI Confidence</option>
              <option value="views" className="bg-obsidian-950 text-white">Engagement Views</option>
              <option value="recent" className="bg-obsidian-950 text-white">Recency</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
