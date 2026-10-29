import React, { useState } from "react";
import { ExternalLink, Play, Copy, Check, Instagram, Layers, Heart, Eye, MessageCircle, Maximize2, Sparkles } from "lucide-react";

interface ResultCardProps {
  item: any;
  onInspect?: (item: any) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, onInspect }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const isInstagram = item.source === "instagram";
  const scorePercent = Math.round((item.similarityScore || 0) * 100);

  const formatNumber = (num: number) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num);
  };

  const likes = formatNumber(item.metadata?.likes);
  const views = formatNumber(item.metadata?.views);
  const comments = formatNumber(item.metadata?.comments);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group relative bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-0.5"
    >
      {/* Media / Video Container */}
      <div className="relative aspect-[9/13] sm:aspect-[4/5] bg-slate-950 overflow-hidden flex items-center justify-center">
        {isPlaying && item.videoUrl ? (
          <video
            src={item.videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : item.thumbnailUrl ? (
          <>
            <img
              src={item.thumbnailUrl}
              alt={item.captionOrAdText || "Video thumbnail"}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 opacity-70 group-hover:opacity-50 transition" />

            {/* Play Button Overlay */}
            {item.videoUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl group/btn"
                title="Play video stream"
              >
                <Play className="w-5 h-5 ml-0.5 fill-current text-white group-hover/btn:text-indigo-400 transition" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-slate-950/90">
            <span className="text-xs text-slate-500 block font-mono">
              [Snapshot Creative]
            </span>
            <span className="text-[10px] text-slate-600 mt-1 block">
              Reference record indexed
            </span>
          </div>
        )}

        {/* Source Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md shadow-md bg-slate-950/85 border border-slate-800 text-white">
          {isInstagram ? (
            <>
              <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600" />
              <span>Reel</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Meta Ad</span>
            </>
          )}
        </div>

        {/* AI Match Confidence Ring (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.8 rounded-lg text-[11px] font-mono font-bold backdrop-blur-md shadow-md bg-slate-950/85 border border-slate-800">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span
            className={
              scorePercent >= 75
                ? "text-emerald-400"
                : scorePercent >= 60
                ? "text-indigo-400"
                : "text-amber-400"
            }
          >
            {scorePercent}%
          </span>
        </div>

        {/* Status Pills (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border backdrop-blur-md font-medium shadow-sm ${
              item.isMock
                ? "bg-amber-950/80 text-amber-300 border-amber-800"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
            }`}
          >
            {item.isMock ? "Mock Fallback" : "Live API"}
          </span>

          {item.isDuplicate && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md shadow-sm">
              Duplicate
            </span>
          )}
        </div>

        {/* Quick Inspect Button (Bottom Right) */}
        {onInspect && (
          <button
            onClick={() => onInspect(item)}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition shadow-md"
            title="Inspect full details & metadata"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Creator / Brand Handle */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-white truncate max-w-[170px]" title={item.advertiserName || "Unknown"}>
              {item.advertiserName || "Anonymous Creator"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ""}
            </span>
          </div>

          {/* Caption text */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {item.captionOrAdText || "No caption or ad text provided for this creative."}
          </p>
        </div>

        {/* Engagement Chips (if available) */}
        {(views || likes || comments) && (
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 pt-1">
            {views && (
              <span className="flex items-center space-x-1" title={`${views} Views`}>
                <Eye className="w-3 h-3 text-indigo-400" />
                <span>{views}</span>
              </span>
            )}
            {likes && (
              <span className="flex items-center space-x-1" title={`${likes} Likes`}>
                <Heart className="w-3 h-3 text-rose-400" />
                <span>{likes}</span>
              </span>
            )}
            {comments && (
              <span className="flex items-center space-x-1" title={`${comments} Comments`}>
                <MessageCircle className="w-3 h-3 text-amber-400" />
                <span>{comments}</span>
              </span>
            )}
          </div>
        )}

        {/* AI Evidence Snippet */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-[11px] text-slate-300 leading-snug">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] text-indigo-400 uppercase tracking-wider font-bold">
              Match Evidence
            </span>
            <span className="font-mono text-[9px] text-slate-500 uppercase">
              {item.evidenceType}
            </span>
          </div>
          <p className="line-clamp-2 text-slate-400">
            {item.matchExplanation || "Discovered via targeted product query."}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition py-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <div className="flex items-center space-x-2">
            {onInspect && (
              <button
                onClick={() => onInspect(item)}
                className="text-xs text-slate-300 hover:text-white font-medium transition py-1 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60"
              >
                Inspect
              </button>
            )}

            <a
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition py-1"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
