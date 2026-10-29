import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Instagram, 
  Layers, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Code, 
  FileText,
  ChevronRight,
  Maximize2
} from "lucide-react";

interface StudioCinemaViewProps {
  items: any[];
  selectedItem: any;
  onSelectItem: (item: any) => void;
}

export const StudioCinemaView: React.FC<StudioCinemaViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
}) => {
  const activeItem = selectedItem || items[0];
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeItem?.id]);

  if (!activeItem) return null;

  const isInstagram = activeItem.source === "instagram";
  const scorePercent = Math.round((activeItem.similarityScore || 0) * 100);

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeItem.permalink || activeItem.videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-obsidian-900 border border-white/[0.08] rounded-3xl p-5 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Top Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Master Cinema Video Player (9:16 aspect phone frame) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-black border-2 border-white/10 reel-shadow">
            {activeItem.videoUrl ? (
              <video
                ref={videoRef}
                src={activeItem.videoUrl}
                poster={activeItem.thumbnailUrl}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setProgress((videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100);
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeItem.thumbnailUrl}
                alt={activeItem.captionOrAdText}
                className="w-full h-full object-cover"
              />
            )}

            {/* Ambient Shadow Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            {/* Player Overlay Controls */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (videoRef.current) videoRef.current.muted = next;
                  }}
                  className="w-10 h-10 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition active:scale-95"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {activeItem.videoUrl && (
                <a
                  href={activeItem.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export MP4</span>
                </a>
              )}
            </div>

            {/* Scrubber line */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-20">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Analytical Intelligence & Match Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isInstagram ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" : "bg-blue-600"
              }`}>
                {isInstagram ? <Instagram className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeItem.advertiserName || "Commercial Candidate"}</span>
                  {activeItem.isMock ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Fallback Mode
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Live Verified
                    </span>
                  )}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Source: {isInstagram ? "Instagram Reels Ecosystem" : "Meta Ad Library Commercial Index"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy URL"}</span>
              </button>
              <a
                href={activeItem.permalink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 flex items-center space-x-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Origin</span>
              </a>
            </div>
          </div>

          {/* AI Match Confidence Breakdown Panel */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Relevance & Semantic Confidence</span>
              </span>
              <span className={`text-sm font-mono font-black ${
                scorePercent >= 80 ? "text-emerald-400" : scorePercent >= 50 ? "text-cyan-400" : "text-indigo-400"
              }`}>
                {scorePercent}%
              </span>
            </div>

            {/* Segmented meter bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  scorePercent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-cyan-400"
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
              {activeItem.matchReason || "High token similarity with product model numbers and verified commercial context."}
            </p>
          </div>

          {/* Caption & Content */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Commercial Copy & Caption
            </span>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-sm text-slate-200 leading-relaxed font-sans max-h-36 overflow-y-auto">
              {activeItem.captionOrAdText || "No caption text supplied for this asset."}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">Total Views</span>
              <span className="text-base font-bold font-mono text-cyan-300 mt-1">
                {formatNumber(activeItem.metadata?.views)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">Reactions</span>
              <span className="text-base font-bold font-mono text-rose-300 mt-1">
                {formatNumber(activeItem.metadata?.likes)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">Discussion</span>
              <span className="text-base font-bold font-mono text-indigo-300 mt-1">
                {formatNumber(activeItem.metadata?.comments)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quick Playlist Strip */}
      <div className="pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Creative Playlist ({items.length} Candidates)
          </span>
          <span className="text-[11px] font-mono text-indigo-400">
            Click thumbnail to load into theater
          </span>
        </div>

        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((it) => {
            const isCurrent = it.id === activeItem.id;
            return (
              <button
                key={it.id}
                onClick={() => onSelectItem(it)}
                className={`relative flex-shrink-0 w-24 aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  isCurrent
                    ? "border-indigo-500 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                }`}
              >
                <img
                  src={it.thumbnailUrl}
                  alt={it.advertiserName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <span className="absolute bottom-1.5 inset-x-1 text-[9px] font-mono text-white truncate text-center">
                  {it.advertiserName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
