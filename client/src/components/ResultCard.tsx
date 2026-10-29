import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Instagram, 
  Layers, 
  Heart, 
  Eye, 
  MessageCircle, 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  Download,
  Share2,
  Clock,
  Radio
} from "lucide-react";

interface ResultCardProps {
  item: any;
  onInspect?: (item: any) => void;
  onToggleFavorite?: (item: any) => void;
  isFavorited?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  item, 
  onInspect,
  onToggleFavorite,
  isFavorited = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isInstagram = item.source === "instagram";
  const scorePercent = Math.round((item.similarityScore || 0) * 100);

  // Determine Match Status styling
  const getMatchBadge = () => {
    if (scorePercent >= 80) {
      return {
        label: `${scorePercent}% VERIFIED`,
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20",
        dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]"
      };
    }
    if (scorePercent >= 50) {
      return {
        label: `${scorePercent}% MATCH`,
        color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20",
        dot: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
      };
    }
    return {
      label: `${scorePercent}% RELEVANT`,
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20",
      dot: "bg-indigo-400"
    };
  };

  const badge = getMatchBadge();

  // Number formatting
  const formatNumber = (num: number) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num);
  };

  const likes = formatNumber(item.metadata?.likes);
  const views = formatNumber(item.metadata?.views);
  const comments = formatNumber(item.metadata?.comments);
  const duration = item.metadata?.duration ? `${Math.round(item.metadata.duration)}s` : "0:25";

  // Autoplay on hover handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered && item.videoUrl) {
      video.muted = isMuted;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay may be blocked if unmuted
      });
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isHovered, isMuted, item.videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.permalink || item.videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  // Matched keyword chips preview
  const reasonText = item.matchReason || "";
  const matchedTokens = reasonText.includes("tokens:")
    ? reasonText.split("tokens:")[1].trim().split(" ")[0].replace(/[[\]]/g, "").split(",").filter(Boolean)
    : [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInspect?.(item)}
      className="group relative cursor-pointer flex flex-col rounded-3xl overflow-hidden bg-obsidian-900 border border-white/[0.08] hover:border-indigo-500/50 transition-all duration-500 reel-shadow hover:shadow-[0_0_35px_rgba(99,102,241,0.22)] hover:-translate-y-1.5"
    >
      {/* 9:16 Vertical Video Frame (Standard Reel / Story Aspect Ratio) */}
      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden flex items-center justify-center">
        {/* Actual Video Layer */}
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.thumbnailUrl}
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.captionOrAdText || "Video thumbnail"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-6 bg-obsidian-950/90 flex flex-col items-center">
            <Radio className="w-8 h-8 text-indigo-400/60 animate-pulse mb-2" />
            <span className="text-xs font-mono text-slate-400">Archived Commercial Asset</span>
            <span className="text-[10px] text-slate-600 mt-1 font-mono">ID: {item.sourceId?.slice(0, 10)}</span>
          </div>
        )}

        {/* Ambient Top & Bottom Vignettes */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/95 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Header Floating Glass Strip */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Creator / Publisher Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg">
            {isInstagram ? (
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center">
                <Instagram className="w-2.5 h-2.5 text-white" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <Layers className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            <span className="text-[11px] font-semibold tracking-tight truncate max-w-[110px]">
              {item.advertiserName || "creator"}
            </span>
            {item.isMock ? (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Fallback
              </span>
            ) : (
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
          </div>

          {/* AI Match Score HUD Tag */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border backdrop-blur-md shadow-md ${badge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Center Hover Controls */}
        <div className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}>
          <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-2xl">
            {/* Direct Play / Pause status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
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
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              title={isPlaying ? "Pause preview" : "Play preview"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-white" />
              ) : (
                <Play className="w-4 h-4 fill-current text-white ml-0.5" />
              )}
            </button>

            {/* Quick Sound Toggle */}
            {item.videoUrl && (
              <button
                onClick={handleSoundToggle}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
                title={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
              </button>
            )}

            {/* Full Theater View */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect?.(item);
              }}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition active:scale-95 shadow-lg shadow-indigo-500/30"
              title="Studio Theater Inspection"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Video Progress Scrubber */}
        {item.videoUrl && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-20 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Bottom Social Video Overlay */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex flex-col space-y-2 pointer-events-auto">
          {/* Audio Track Tag & Duration */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-1">
            <div className="flex items-center space-x-1.5 truncate max-w-[70%] bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              {/* Animated Sound Wave Bars */}
              <div className="flex items-end space-x-0.5 h-3">
                <span className={`w-0.5 bg-indigo-400 rounded-full ${isPlaying ? "animate-sound-wave-1" : "h-1"}`} />
                <span className={`w-0.5 bg-pink-400 rounded-full ${isPlaying ? "animate-sound-wave-2" : "h-2"}`} />
                <span className={`w-0.5 bg-cyan-400 rounded-full ${isPlaying ? "animate-sound-wave-3" : "h-1.5"}`} />
                <span className={`w-0.5 bg-amber-400 rounded-full ${isPlaying ? "animate-sound-wave-4" : "h-2.5"}`} />
              </div>
              <span className="truncate text-[10px]">
                {item.metadata?.musicInfo || "Original Audio"}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
              <Clock className="w-2.5 h-2.5" />
              <span>{duration}</span>
            </div>
          </div>

          {/* Caption Snippet */}
          <p className="text-xs text-white/90 line-clamp-2 font-normal leading-relaxed drop-shadow px-1">
            {item.captionOrAdText || "Commercial creative showcase"}
          </p>

          {/* Social Proof & Metrics Strip */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-slate-300">
            <div className="flex items-center space-x-2.5 text-[11px] font-mono font-medium">
              {views && (
                <span className="flex items-center space-x-1" title={`${views} Views`}>
                  <Eye className="w-3 h-3 text-cyan-400" />
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
                  <MessageCircle className="w-3 h-3 text-indigo-400" />
                  <span>{comments}</span>
                </span>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10"
                title="Copy Reel URL"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              {item.videoUrl && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10"
                  title="Download MP4 stream"
                >
                  <Download className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Token Match Chips (Revealed on hover) */}
          {matchedTokens.length > 0 && isHovered && (
            <div className="flex flex-wrap gap-1 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
              {matchedTokens.slice(0, 3).map((tok, i) => (
                <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  +{tok}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
