import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header.js";
import { ProductInput } from "./components/ProductInput.js";
import { SearchProgress } from "./components/SearchProgress.js";
import { FiltersBar } from "./components/FiltersBar.js";
import { ResultCard } from "./components/ResultCard.js";
import { StudioCinemaView } from "./components/StudioCinemaView.js";
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
  Radio,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

export default function App() {
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & View State (default: 'reels' wall view for full TikTok/Foreplay creative vibe)
  const [activeTab, setActiveTab] = useState<"all" | "instagram" | "meta_ad_library">("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [showDuplicates, setShowDuplicates] = useState<boolean>(true);
  const [showPreviouslySeen, setShowPreviouslySeen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "recent" | "views">("score");
  const [viewMode, setViewMode] = useState<"reels" | "cinema" | "table">("reels");
  const [selectedCinemaItem, setSelectedCinemaItem] = useState<any | null>(null);

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

  const currentSearchRecord = historyList.find((h) => h.id === currentSearchId);
  const currentProductName = currentSearchRecord?.product?.name || "Sony WH-1000XM5";

  const avgMatchScore = useMemo(() => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, r) => acc + (r.similarityScore || 0), 0);
    return Math.round((total / results.length) * 100);
  }, [results]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Cyber Grid Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none cyber-grid-bg opacity-30 z-0" />

      {/* Atmospheric Ambient Glows */}
      <div className="fixed -top-40 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -left-40 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Header */}
      <Header
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenStatus={() => setStatusOpen(true)}
        providerStatus={providerStatus}
        totalSearches={historyList.length}
        currentProduct={currentProductName}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 flex items-start space-x-3 text-rose-200 backdrop-blur-md shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Search Pipeline Notice</h4>
              <p className="text-xs text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: AI Creative Discovery Deck */}
        <ProductInput onStartSearch={handleStartSearch} isLoading={isLoading} />

        {/* Step 2: Search Progress Stream */}
        {searchProgress && (
          <SearchProgress
            progress={searchProgress}
            onRetry={() => currentSearchId && pollSearchProgress(currentSearchId)}
          />
        )}

        {/* KPI Intelligence Strip */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Discovered */}
            <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-white/20 transition">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Discovered Creative</span>
                <Radio className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {results.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">candidates</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                {realIgCount + realMetaCount} Verified Live • {mockIgCount + mockMetaCount} Fallback
              </span>
            </div>

            {/* Instagram Reels */}
            <div className="bg-obsidian-900/90 border border-white/[0.08] hover:border-pink-500/40 rounded-2xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col justify-between group transition">
              <span className="text-[11px] font-mono text-pink-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram Reels</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">9:16</span>
              </span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-3xl font-extrabold font-mono text-pink-300 tracking-tight">
                  {igCount}
                </span>
                <span className="text-xs text-pink-400/80 font-mono">reels</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono block">
                {realIgCount} Live Organic Posts Indexed
              </span>
            </div>

            {/* Meta Ad Library */}
            <div className="bg-obsidian-900/90 border border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col justify-between group transition">
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Meta Ad Library</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">ADS</span>
              </span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-3xl font-extrabold font-mono text-blue-300 tracking-tight">
                  {metaCount}
                </span>
                <span className="text-xs text-blue-400/80 font-mono">commercial ads</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono block">
                {realMetaCount} Commercial Campaigns Active
              </span>
            </div>

            {/* AI Confidence Mean */}
            <div className="bg-obsidian-900/90 border border-white/[0.08] hover:border-indigo-500/40 rounded-2xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col justify-between group transition">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Relevance Mean</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SCORE</span>
              </span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-3xl font-extrabold font-mono text-indigo-300 tracking-tight">
                  {avgMatchScore}%
                </span>
                <span className="text-xs text-indigo-400/80 font-mono">confidence</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Weighted Brand & SKU Model Overlap
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Interactive Filter Dock & Creative Presentations */}
        {results.length > 0 && (
          <div className="space-y-6">
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

            {/* View State Rendering */}
            {filteredResults.length === 0 ? (
              <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-3xl p-12 text-center backdrop-blur-xl shadow-2xl">
                <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No candidates match active filter parameters</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed font-mono">
                  {results.length > 0
                    ? `You have ${results.length} discovered items (${igCount} Reels, ${metaCount} Ads). Clear the search query or lower the confidence filter.`
                    : "No candidates discovered."}
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
                    className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 active:scale-95"
                  >
                    Reset Filters ({results.length} Videos Available)
                  </button>
                )}
              </div>
            ) : viewMode === "cinema" ? (
              /* Studio Cinema Theater Split View */
              <StudioCinemaView
                items={filteredResults}
                selectedItem={selectedCinemaItem || filteredResults[0]}
                onSelectItem={(item) => setSelectedCinemaItem(item)}
              />
            ) : viewMode === "reels" ? (
              /* 9:16 Vertical Video Reels Wall (Creative Center style) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredResults.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    onInspect={(selected) => setSelectedDetailItem(selected)}
                  />
                ))}
              </div>
            ) : (
              /* Data Matrix Table View */
              <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-black/60 text-[11px] font-mono uppercase text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="px-5 py-3.5">Video Preview</th>
                        <th className="px-5 py-3.5">Channel</th>
                        <th className="px-5 py-3.5">Creator / Page</th>
                        <th className="px-5 py-3.5">Caption & Content</th>
                        <th className="px-5 py-3.5">AI Confidence</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-sans">
                      {filteredResults.map((item) => {
                        const isIg = item.source === "instagram";
                        const score = Math.round((item.similarityScore || 0) * 100);
                        return (
                          <tr key={item.id} className="hover:bg-white/[0.03] transition">
                            <td className="px-5 py-3">
                              <div className="w-14 aspect-[9/16] rounded-lg overflow-hidden bg-black border border-white/10 relative">
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.advertiserName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
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
                            <td className="px-5 py-3 font-semibold text-white whitespace-nowrap max-w-[150px] truncate">
                              {item.advertiserName || "Anonymous"}
                            </td>
                            <td className="px-5 py-3 max-w-sm truncate text-slate-300" title={item.captionOrAdText}>
                              {item.captionOrAdText || "—"}
                            </td>
                            <td className="px-5 py-3 font-mono font-bold whitespace-nowrap">
                              <span
                                className={
                                  score >= 80
                                    ? "text-emerald-400"
                                    : score >= 50
                                    ? "text-cyan-400"
                                    : "text-indigo-400"
                                }
                              >
                                {score}%
                              </span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                  item.isMock
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                }`}
                              >
                                {item.isMock ? "Mock Fallback" : "Live API"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right whitespace-nowrap space-x-2">
                              <button
                                onClick={() => setSelectedDetailItem(item)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition"
                              >
                                Inspect
                              </button>
                              <a
                                href={item.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                              >
                                <span>Source</span>
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
      </main>

      {/* Video Detail Theater Modal */}
      {selectedDetailItem && (
        <VideoDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Provider Status Modal */}
      {statusOpen && (
        <ProviderStatusModal
          isOpen={statusOpen}
          onClose={() => setStatusOpen(false)}
          providerStatus={providerStatus}
          onRefresh={() => {
            fetch("/api/providers/status")
              .then((res) => res.json())
              .then((data) => setProviderStatus(data));
          }}
        />
      )}

      {/* Search History Drawer */}
      {historyOpen && (
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          historyList={historyList}
          currentSearchId={currentSearchId}
          onSelectSearch={(id) => {
            handleSelectHistorySearch(id);
            setHistoryOpen(false);
          }}
        />
      )}
    </div>
  );
}
