import React from "react";
import { X, ExternalLink, Download, Copy, Check, Instagram, Layers, Play, Calendar, Eye, Heart, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";

interface VideoDetailModalProps {
  item: any | null;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedJson, setCopiedJson] = React.useState(false);

  if (!item) return null;

  const isInstagram = item.source === "instagram";
  const scorePercent = Math.round((item.similarityScore || 0) * 100);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              isInstagram ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" : "bg-blue-600"
            }`}>
              {isInstagram ? <Instagram className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white truncate max-w-md">
                  {item.advertiserName || "Discovered Candidate"}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  item.isMock
                    ? "bg-amber-950/80 text-amber-300 border-amber-800"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                }`}>
                  {item.isMock ? "Mock Fallback" : "Live Verified"}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ID: {item.sourceId} • {isInstagram ? "Instagram Reel" : "Meta Ad Library"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center space-x-1.5 shadow"
            >
              <span>View Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Video Preview */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <div className="relative aspect-[9/16] max-h-[480px] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              {item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.captionOrAdText || "Thumbnail"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs">
                  No direct preview stream available.
                </div>
              )}
            </div>

            {/* Engagement Metrics (Instagram) */}
            {isInstagram && item.metadata && (
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Likes</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {formatNumber(item.metadata.likes)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>Views</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {formatNumber(item.metadata.views)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <MessageCircle className="w-3 h-3 text-amber-400" />
                    <span>Comments</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {formatNumber(item.metadata.comments)}
                  </span>
                </div>
              </div>
            )}

            {/* Direct MP4 Link Button */}
            {item.videoUrl && (
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Direct CDN MP4 Stream URL</span>
              </a>
            )}
          </div>

          {/* Right Column: AI Match & Metadata Breakdown */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* Match Score Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Similarity & Match Evaluation</span>
                </span>
                <span className={`text-base font-bold font-mono ${
                  scorePercent >= 75 ? "text-emerald-400" : scorePercent >= 60 ? "text-indigo-400" : "text-amber-400"
                }`}>
                  {scorePercent}% Match
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    scorePercent >= 75
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : scorePercent >= 60
                      ? "bg-gradient-to-r from-indigo-500 to-blue-400"
                      : "bg-gradient-to-r from-amber-500 to-orange-400"
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-mono text-[11px] block mb-1">EVALUATION SUMMARY:</span>
                {item.matchExplanation || "Candidate matched query parameters and semantic keywords."}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-1">
                <div>
                  <span className="text-[10px] block text-slate-500">EVIDENCE LEVEL:</span>
                  <span className="text-slate-200 capitalize font-medium">{item.evidenceType || "Thumbnail"}</span>
                </div>
                <div>
                  <span className="text-[10px] block text-slate-500">DISCOVERY METHOD:</span>
                  <span className="text-slate-200 capitalize font-medium">{item.discoveryMethod || "Live API"}</span>
                </div>
              </div>
            </div>

            {/* Ad Text / Caption */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-xs font-medium text-slate-300">
                {isInstagram ? "Post Caption & Hashtags" : "Ad Creative Copy"}
              </span>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto pr-1">
                {item.captionOrAdText || "No text body available for this creative."}
              </p>
            </div>

            {/* Raw Metadata JSON Inspector */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 font-mono">
                  Raw Provider Metadata
                </span>
                <button
                  onClick={handleCopyJson}
                  className="text-[11px] font-mono flex items-center space-x-1 text-slate-400 hover:text-white transition"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? "Copied JSON" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(item.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 font-mono">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Permalink Copied!" : "Copy Source URL"}</span>
          </button>
          <span>Discovered: {new Date(item.firstDiscoveredAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
