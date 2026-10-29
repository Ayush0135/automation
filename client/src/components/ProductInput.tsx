import React, { useState, useEffect } from "react";
import { 
  Search, 
  Link as LinkIcon, 
  Upload, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Globe, 
  Cpu, 
  Radio, 
  Compass, 
  Layers, 
  Instagram,
  RefreshCw
} from "lucide-react";

interface ProductInputProps {
  onStartSearch: (productData: {
    productName: string;
    brand?: string;
    category?: string;
    productUrl?: string;
    imageUrl?: string;
    description?: string;
    keywords: string[];
    requestedCount: number;
  }) => void;
  isLoading: boolean;
}

export const ProductInput: React.FC<ProductInputProps> = ({ onStartSearch, isLoading }) => {
  const [mode, setMode] = useState<"instant" | "url" | "upload">("instant");
  const [productName, setProductName] = useState("Sony WH-1000XM5");
  const [brand, setBrand] = useState("Sony");
  const [category, setCategory] = useState("Headphones");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [requestedCount, setRequestedCount] = useState(20);
  const [inspecting, setInspecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(["wh1000xm5", "sony headphones", "noise cancelling", "xm5"]);

  // Sample preset packs
  const loadPreset = (preset: "sony" | "boat" | "apple" | "nothing" | "dyson") => {
    if (preset === "sony") {
      setProductName("Sony WH-1000XM5");
      setBrand("Sony");
      setCategory("Headphones");
      setKeywords(["wh1000xm5", "sony headphones", "noise cancelling", "xm5"]);
    } else if (preset === "boat") {
      setProductName("boAt Airdopes 141");
      setBrand("boAt");
      setCategory("Wireless Earbuds");
      setKeywords(["airdopes", "boat earbuds", "tws", "earphones"]);
    } else if (preset === "apple") {
      setProductName("AirPods Pro 2");
      setBrand("Apple");
      setCategory("Wireless Earbuds");
      setKeywords(["airpods pro", "airpods pro 2", "apple earbuds", "spatial audio"]);
    } else if (preset === "nothing") {
      setProductName("Nothing Phone (2)");
      setBrand("Nothing");
      setCategory("Smartphones");
      setKeywords(["nothing phone", "glyph interface", "tech review"]);
    } else {
      setProductName("Dyson Airwrap Multi-Styler");
      setBrand("Dyson");
      setCategory("Personal Care");
      setKeywords(["dyson airwrap", "hair styler", "curling review"]);
    }
  };

  const handleInspectUrl = async () => {
    if (!url.trim()) return;
    setInspecting(true);
    try {
      const formData = new FormData();
      formData.append("url", url);
      const res = await fetch("/api/products/inspect", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.metadata) {
        const m = data.metadata;
        setProductName(m.name || productName);
        setBrand(m.brand || brand);
        setCategory(m.category || category);
        setKeywords(m.keywords?.length ? m.keywords : [m.name || productName]);
        setMode("instant");
      }
    } catch (err) {
      console.error("Inspect error:", err);
    } finally {
      setInspecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || isLoading) return;

    onStartSearch({
      productName: productName.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      productUrl: url.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : [productName.trim()],
      requestedCount,
    });
  };

  return (
    <div className="relative group rounded-3xl p-1 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative bg-obsidian-900/90 border border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-2xl">
        {/* Top Control Bar: Title & Input Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.06] gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-white flex items-center gap-2">
                <span>AI Creative Discovery Deck</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Parallel commercial video discovery across Instagram Reels & Meta Ad Library
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-black/60 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("instant")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "instant"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Product</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "url"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Store Link</span>
            </button>
          </div>
        </div>

        {/* Preset Chips Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Compass className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => loadPreset("sony")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              productName.includes("Sony")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10"
            }`}
          >
            🎧 Sony WH-1000XM5
          </button>
          <button
            type="button"
            onClick={() => loadPreset("boat")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              productName.includes("boAt")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10"
            }`}
          >
            ⚡ boAt Airdopes 141
          </button>
          <button
            type="button"
            onClick={() => loadPreset("apple")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              productName.includes("AirPods")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10"
            }`}
          >
            🍎 AirPods Pro 2
          </button>
          <button
            type="button"
            onClick={() => loadPreset("nothing")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              productName.includes("Nothing")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10"
            }`}
          >
            ✨ Nothing Phone (2)
          </button>
          <button
            type="button"
            onClick={() => loadPreset("dyson")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              productName.includes("Dyson")
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10"
            }`}
          >
            💨 Dyson Airwrap
          </button>
        </div>

        {/* Input Form Body */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          {mode === "url" ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Amazon, Shopify, or brand product link (e.g. https://www.amazon.in/dp/...)"
                  className="w-full bg-black/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-sans"
                />
              </div>
              <button
                type="button"
                onClick={handleInspectUrl}
                disabled={inspecting || !url.trim()}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center space-x-2 transition disabled:opacity-50"
              >
                {inspecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Extract Specs</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Main Product Name Field */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-indigo-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter exact product name or model (e.g. Sony WH-1000XM5)..."
                  className="w-full bg-black/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-sans font-medium"
                />
              </div>

              {/* Brand Tag */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand (e.g. Sony)"
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
                />
              </div>

              {/* Category Tag */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category (e.g. Headphones)"
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
                />
              </div>
            </div>
          )}

          {/* AI Keywords & Quota Deck */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
            {/* Live Token Radar */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1 mr-1">
                <Radio className="w-3 h-3 text-emerald-400" /> Active Radar:
              </span>
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300"
                >
                  #{kw}
                </span>
              ))}
            </div>

            {/* Target Count & Launch Button */}
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <div className="flex items-center space-x-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-mono text-slate-400">Target Quota:</span>
                <select
                  value={requestedCount}
                  onChange={(e) => setRequestedCount(Number(e.target.value))}
                  className="bg-transparent text-xs font-mono font-bold text-indigo-300 focus:outline-none cursor-pointer"
                >
                  <option value={10} className="bg-obsidian-950 text-white">10 each (20 total)</option>
                  <option value={20} className="bg-obsidian-950 text-white">20 each (40 total)</option>
                  <option value={30} className="bg-obsidian-950 text-white">30 each (60 total)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !productName.trim()}
                className="relative group overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-xl shadow-indigo-600/30 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Searching Channels...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start AI Discovery</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
