import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header.js";
import { ProductInput } from "./components/ProductInput.js";
import { SearchProgress } from "./components/SearchProgress.js";
import { FiltersBar } from "./components/FiltersBar.js";
import { ResultCard } from "./components/ResultCard.js";
import { HistoryDrawer } from "./components/HistoryDrawer.js";
import { ProviderStatusModal } from "./components/ProviderStatusModal.js";
import { VideoDetailModal } from "./components/VideoDetailModal.js";
import {
  AlertCircle,
  Film,
  Sparkles,
  Inbox,
  Instagram,
  Layers,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function App() {
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & View State
  const [activeTab, setActiveTab] = useState<"all" | "instagram" | "meta_ad_library">("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [showDuplicates, setShowDuplicates] = useState<boolean>(true);
  const [showPreviouslySeen, setShowPreviouslySeen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "recent" | "views">("score");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Detail Modal & History
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [providerStatus, setProviderStatus] = useState<any>(null);

  // Load initial health & provider status
  useEffect(() => {
    fetch("/api/providers/status")
      .then((res) => res.json())
      .then((data) => setProviderStatus(data))
      .catch((err) => console.error("Failed to load provider status:", err));

    loadHistory();
  }, []);

  const loadHistory = () => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        const list = data.history || [];
        setHistoryList(list);
        if (list.length > 0 && !currentSearchId) {
          const completed = list.find((h: any) => h.status === "completed") || list[0];
          if (completed) {
            setCurrentSearchId(completed.id);
            loadResults(completed.id);
            fetch(`/api/search/${completed.id}/progress`)
              .then((r) => r.json())
              .then((prog) => setSearchProgress(prog))
              .catch(() => {});
          }
        }
      })
      .catch((err) => console.error("Failed to load history:", err));
  };

  // Launch a new search
  const handleStartSearch = async (productData: any) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSearchProgress({
      status: "running",
      instagram: { discovered: 0, usable: 0, target: productData.requestedCount, shortfall: productData.requestedCount },
      meta: { discovered: 0, usable: 0, target: productData.requestedCount, shortfall: productData.requestedCount },
    });

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Search initiation failed");
      }

      const searchId = data.searchId;
      setCurrentSearchId(searchId);
      pollSearchProgress(searchId);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Poll progress and fetch final results
  const pollSearchProgress = (searchId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/search/${searchId}/progress`);
        const prog = await res.json();
        setSearchProgress(prog);

        if (prog.status === "completed" || prog.status === "failed") {
          clearInterval(interval);
          setIsLoading(false);
          loadResults(searchId);
          loadHistory();
        }
      } catch (err) {
        console.error("Progress poll error:", err);
      }
    }, 800);
  };

  const loadResults = async (searchId: string) => {
    try {
      const res = await fetch(`/api/search/${searchId}/results?limit=100`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError("Failed to load search results: " + err.message);
    }
  };

  // Switch to a previous search from history
  const handleSelectHistorySearch = (id: string) => {
    setCurrentSearchId(id);
    setIsLoading(false);
    loadResults(id);
    fetch(`/api/search/${id}/progress`)
      .then((res) => res.json())
      .then((prog) => setSearchProgress(prog))
      .catch(() => {});
  };

  // Filter & sort items in memory
  const filteredResults = useMemo(() => {
    return results
      .filter((item) => {
        if (activeTab === "instagram" && item.source !== "instagram") return false;
        if (activeTab === "meta_ad_library" && item.source !== "meta_ad_library") return false;
        if ((item.similarityScore || 0) < minScore) return false;
        if (!showDuplicates && item.isDuplicate) return false;
        if (!showPreviouslySeen && item.isPreviouslySeen) return false;

        // In-memory text search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchAuthor = (item.advertiserName || "").toLowerCase().includes(term);
          const matchText = (item.captionOrAdText || "").toLowerCase().includes(term);
          const matchId = (item.sourceId || "").toLowerCase().includes(term);
          if (!matchAuthor && !matchText && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.similarityScore || 0) - (a.similarityScore || 0);
        }
        if (sortBy === "recent") {
          return new Date(b.firstDiscoveredAt || 0).getTime() - new Date(a.firstDiscoveredAt || 0).getTime();
        }
        if (sortBy === "views") {
          const vA = a.metadata?.views || a.metadata?.likes || 0;
          const vB = b.metadata?.views || b.metadata?.likes || 0;
          return vB - vA;
        }
        return 0;
      });
  }, [results, activeTab, minScore, showDuplicates, showPreviouslySeen, searchTerm, sortBy]);

  const igCount = results.filter((r) => r.source === "instagram").length;
  const metaCount = results.filter((r) => r.source === "meta_ad_library").length;
  const realIgCount = results.filter((r) => r.source === "instagram" && !r.isMock).length;
  const mockIgCount = results.filter((r) => r.source === "instagram" && r.isMock).length;
  const realMetaCount = results.filter((r) => r.source === "meta_ad_library" && !r.isMock).length;
  const mockMetaCount = results.filter((r) => r.source === "meta_ad_library" && r.isMock).length;

  const avgMatchScore = useMemo(() => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, r) => acc + (r.similarityScore || 0), 0);
    return Math.round((total / results.length) * 100);
  }, [results]);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenStatus={() => setStatusOpen(true)}
        providerStatus={providerStatus}
        totalSearches={historyList.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 flex items-start space-x-3 text-rose-200 backdrop-blur-md shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Search Pipeline Notice</h4>
              <p className="text-xs text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Product Input (Bento Box) */}
        <ProductInput onStartSearch={handleStartSearch} isLoading={isLoading} />

        {/* Step 2: Search Progress Stream */}
        {searchProgress && (
          <SearchProgress
            progress={searchProgress}
            onRetry={() => currentSearchId && pollSearchProgress(currentSearchId)}
          />
        )}

        {/* KPI Summary Stats Bar (Active when results exist) */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Discovered
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {results.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">candidates</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {realIgCount + realMetaCount} Verified Live • {mockIgCount + mockMetaCount} Fallback
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>Instagram Reels</span>
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black font-mono text-pink-300 tracking-tight">
                  {igCount}
                </span>
                <span className="text-xs text-pink-400/80 font-mono">reels</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                {realIgCount} Live Organic Posts
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>Meta Ad Library</span>
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black font-mono text-blue-300 tracking-tight">
                  {metaCount}
                </span>
                <span className="text-xs text-blue-400/80 font-mono">ads</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                {realMetaCount} Commercial Video Ads
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>AI Confidence Mean</span>
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black font-mono text-indigo-300 tracking-tight">
                  {avgMatchScore}%
                </span>
                <span className="text-xs text-indigo-400/80 font-mono">match</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Visual & Semantic Weighted
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Interactive Filters Bar & Results Layout */}
        {results.length > 0 && (
          <div className="space-y-5">
            <FiltersBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              showDuplicates={showDuplicates}
              onToggleDuplicates={() => setShowDuplicates(!showDuplicates)}
              showPreviouslySeen={showPreviouslySeen}
              onTogglePreviouslySeen={() => setShowPreviouslySeen(!showPreviouslySeen)}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              counts={{
                all: results.length,
                instagram: igCount,
                meta: metaCount,
                realInstagram: realIgCount,
                mockInstagram: mockIgCount,
                realMeta: realMetaCount,
                mockMeta: mockMetaCount,
              }}
            />

            {/* Results Presentation (Grid or Table) */}
            {filteredResults.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-12 text-center backdrop-blur-md shadow-xl">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-200">No candidates match active criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  {results.length > 0
                    ? `You have ${results.length} discovered items (${igCount} Instagram Reels, ${metaCount} Meta Ads). Clear the text search or lower the match score threshold to view them.`
                    : "No results discovered."}
                </p>
                {results.length > 0 && (
                  <button
                    onClick={() => {
                      setMinScore(0);
                      setSearchTerm("");
                      setShowDuplicates(true);
                      setShowPreviouslySeen(true);
                      setActiveTab("all");
                    }}
                    className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    Reset All Filters ({results.length} Videos Available)
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredResults.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    onInspect={(selected) => setSelectedDetailItem(selected)}
                  />
                ))}
              </div>
            ) : (
              /* Compact Data Table View */
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Channel</th>
                        <th className="px-4 py-3">Creator / Page</th>
                        <th className="px-4 py-3">Caption & Content</th>
                        <th className="px-4 py-3">AI Match</th>
                        <th className="px-4 py-3">Evidence</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {filteredResults.map((item) => {
                        const isIg = item.source === "instagram";
                        const score = Math.round((item.similarityScore || 0) * 100);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center space-x-1.5 font-semibold text-xs">
                                {isIg ? (
                                  <>
                                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                                    <span className="text-pink-300">Instagram Reel</span>
                                  </>
                                ) : (
                                  <>
                                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-blue-300">Meta Ad</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-white whitespace-nowrap max-w-[140px] truncate">
                              {item.advertiserName || "Anonymous"}
                            </td>
                            <td className="px-4 py-3 max-w-sm truncate text-slate-300" title={item.captionOrAdText}>
                              {item.captionOrAdText || "—"}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                              <span
                                className={
                                  score >= 75
                                    ? "text-emerald-400"
                                    : score >= 60
                                    ? "text-indigo-400"
                                    : "text-amber-400"
                                }
                              >
                                {score}%
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono capitalize text-[11px] text-slate-400 whitespace-nowrap">
                              {item.evidenceType}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                  item.isMock
                                    ? "bg-amber-950/80 text-amber-300 border-amber-800"
                                    : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                }`}
                              >
                                {item.isMock ? "Mock" : "Live API"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                              <button
                                onClick={() => setSelectedDetailItem(item)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                              >
                                Inspect
                              </button>
                              <a
                                href={item.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State when no search has been started */}
        {!searchProgress && results.length === 0 && (
          <div className="bg-slate-900/40 border border-dashed border-slate-800/80 rounded-2xl p-16 text-center backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-xl">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Ready for Video Discovery
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Select one of the sample presets above (e.g. <strong className="text-slate-200">Sony XM5</strong> or <strong className="text-slate-200">boAt Earbuds</strong>) or enter your own product to discover high-resolution Instagram Reels and Meta video ads.
            </p>
          </div>
        )}
      </main>

      {/* Video Detail Inspector Modal */}
      <VideoDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyList}
        onSelectSearch={handleSelectHistorySearch}
      />

      {/* Provider Status Modal */}
      <ProviderStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        statusData={providerStatus}
      />
    </div>
  );
}
