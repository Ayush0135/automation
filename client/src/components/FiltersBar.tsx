import React from "react";
import { Filter, Instagram, Layers, SlidersHorizontal, EyeOff, Search, LayoutGrid, List, ArrowUpDown } from "lucide-react";

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
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
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
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-xl shadow-black/20 backdrop-blur-md space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Source Channel Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={() => onTabChange("all")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>All Channels</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onTabChange("instagram")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "instagram"
                ? "bg-gradient-to-r from-rose-950/80 to-purple-950/80 text-pink-300 border border-pink-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram Reels</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-pink-300 font-bold">
              {counts.instagram} {counts.realInstagram !== undefined ? `(${counts.realInstagram} Real)` : ""}
            </span>
          </button>

          <button
            onClick={() => onTabChange("meta_ad_library")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "meta_ad_library"
                ? "bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Meta Ad Library</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-blue-300 font-bold">
              {counts.meta} {counts.realMeta !== undefined ? `(${counts.realMeta} Real)` : ""}
            </span>
          </button>
        </div>

        {/* Quick Instant Search inside results */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search captions, handles or ad copy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* View Mode Toggle (Grid vs Table) */}
        <div className="flex items-center space-x-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition ${
              viewMode === "grid" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-lg transition ${
              viewMode === "table" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Compact Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Min Score Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Match Cutoff:</span>
            <select
              value={minScore}
              onChange={(e) => onMinScoreChange(parseFloat(e.target.value))}
              className="bg-transparent font-mono text-indigo-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900 text-white">All Results (0%)</option>
              <option value="0.4" className="bg-slate-900 text-white">≥ 40% (Usable Media)</option>
              <option value="0.6" className="bg-slate-900 text-white">≥ 60% (High Confidence)</option>
              <option value="0.75" className="bg-slate-900 text-white">≥ 75% (Verified Exact)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="score" className="bg-slate-900 text-white">Highest AI Match</option>
              <option value="recent" className="bg-slate-900 text-white">Most Recent</option>
              <option value="views" className="bg-slate-900 text-white">Most Engagement</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleDuplicates}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              showDuplicates
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            <span>Include Cross-Search Duplicates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
