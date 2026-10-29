import React from "react";
import { 
  X, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Instagram, 
  Layers, 
  Play, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck,
  Code
} from "lucide-react";

interface VideoDetailModalProps {
  item: any | null;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [showRawJson, setShowRawJson] = React.useState(false);

  if (!item) return null;

  const isInstagram = item.source === "instagram";
  const scorePercent = Math.round((item.similarityScore || 0) * 100);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.permalink || item.videoUrl);
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-obsidian-900 border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col reel-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-950/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isInstagram ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" : "bg-blue-600"
            }`}>
              {isInstagram ? <Instagram className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md font-sans">
                  {item.advertiserName || "Discovered Creative"}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  item.isMock
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}>
                  {item.isMock ? "Mock Fallback" : "Live Verified"}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {item.sourceId} • {isInstagram ? "Instagram Reel" : "Meta Ad Library"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
            >
              <span>View Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Vertical 9:16 Video Preview Frame */}
          <div className="md:col-span-5 flex flex-col space-y-4 items-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl">
              {item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.captionOrAdText || "Thumbnail"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs font-mono">
                  No preview stream indexed.
                </div>
              )}
            </div>

            {/* Engagement Metrics */}
            {isInstagram && item.metadata && (
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] bg-black/40 p-2.5 rounded-xl border border-white/10 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Likes</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {formatNumber(item.metadata.likes)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Views</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {formatNumber(item.metadata.views)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mb-0.5">
                    <MessageCircle className="w-3 h-3 text-indigo-400" />
                    <span>Comments</span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {formatNumber(item.metadata.comments)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Confidence, Evidence, Metadata */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* AI Relevance Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Semantic & Visual Relevance</span>
                </span>
                <span className={`text-base font-black font-mono ${
                  scorePercent >= 80 ? "text-emerald-400" : scorePercent >= 50 ? "text-cyan-400" : "text-indigo-400"
                }`}>
                  {scorePercent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    scorePercent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-cyan-400"
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                {item.matchReason || "High token similarity with target SKU product parameters and verified commercial context."}
              </p>
            </div>

            {/* Caption Text Box */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Creative Caption & Text Copy
              </span>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {item.captionOrAdText || "No caption or body text attached to this creative."}
              </div>
            </div>

            {/* Meta Ad Specific Details */}
            {!isInstagram && item.metadata && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-slate-500 block text-[10px]">Campaign Status</span>
                  <span className="text-emerald-400 font-bold">
                    {item.metadata.isActive ? "● Active Commercial Run" : "Archived"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target Markets</span>
                  <span className="text-slate-200">
                    {Array.isArray(item.metadata.targetedCountries)
                      ? item.metadata.targetedCountries.join(", ")
                      : item.metadata.targetedCountries || "Global / India"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied" : "Copy Share Link"}</span>
              </button>

              {item.videoUrl && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download MP4 Stream</span>
                </a>
              )}

              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono border border-white/10 flex items-center space-x-1.5 transition ml-auto"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showRawJson ? "Hide JSON" : "Raw JSON"}</span>
              </button>
            </div>

            {/* Raw JSON viewer */}
            {showRawJson && (
              <div className="relative bg-black/60 border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-emerald-400 max-h-48 overflow-y-auto">
                <button
                  onClick={handleCopyJson}
                  className="absolute top-3 right-3 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] transition"
                >
                  {copiedJson ? "Copied" : "Copy"}
                </button>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
