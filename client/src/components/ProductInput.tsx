import React, { useState } from "react";
import { Search, Link, Upload, Tag, Sparkles, CheckCircle2, ArrowRight, Zap, Headphones, Smartphone, Compass } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // Extracted or manually edited product fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [requestedCount, setRequestedCount] = useState(20);

  const handleInspect = async () => {
    if (activeTab === "url" && !url.trim()) return;
    if (activeTab === "upload" && !selectedFile) return;

    setInspecting(true);
    try {
      const formData = new FormData();
      if (activeTab === "url") {
        formData.append("url", url);
      } else if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch("/api/products/inspect", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.metadata) {
        const m = data.metadata;
        setName(m.name || "");
        setBrand(m.brand || "");
        setCategory(m.category || "");
        setImageUrl(m.imageUrl || "");
        setDescription(m.description || "");
        setKeywords(m.keywords || []);
      }
    } catch (err) {
      console.error("Inspection error:", err);
    } finally {
      setInspecting(false);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(newKeyword.trim())) {
        setKeywords([...keywords, newKeyword.trim()]);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const loadSample = (sampleType: "sony" | "boat" | "apple" | "nothing" | "dyson") => {
    if (sampleType === "sony") {
      setName("WH-1000XM5");
      setBrand("Sony");
      setCategory("Headphones");
      setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80");
      setDescription("Industry-leading noise canceling headphones with dual processors and 8 microphones");
      setKeywords(["wh1000xm5", "sony headphones", "noise cancelling", "xm5"]);
    } else if (sampleType === "boat") {
      setName("Airdopes 141");
      setBrand("boAt");
      setCategory("Wireless Earbuds");
      setImageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80");
      setDescription("Wireless Earbuds with 42 hours playback, ENx Technology, and ASAP charge");
      setKeywords(["airdopes", "boat earbuds", "tws", "earphones"]);
    } else if (sampleType === "apple") {
      setName("AirPods Pro 2");
      setBrand("Apple");
      setCategory("Wireless Earbuds");
      setImageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80");
      setDescription("Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio");
      setKeywords(["airpods pro", "airpods pro 2", "apple earbuds", "spatial audio"]);
    } else if (sampleType === "nothing") {
      setName("Phone (2)");
      setBrand("Nothing");
      setCategory("Smartphones");
      setImageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80");
      setDescription("Glyph Interface smartphone with dual 50MP camera and Snapdragon 8+ Gen 1");
      setKeywords(["nothing phone", "glyph interface", "tech review"]);
    } else {
      setName("Airwrap Multi-Styler");
      setBrand("Dyson");
      setCategory("Personal Care");
      setImageUrl("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80");
      setDescription("Styling barrels to curl and wave, and brushes to control, smooth or add volume");
      setKeywords(["dyson airwrap", "hair styler", "curling review"]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onStartSearch({
      productName: name.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      productUrl: url.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : [name.trim()],
      requestedCount,
    });
  };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/30 backdrop-blur-md">
      {/* Top Banner: Title & Sample Chips */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-5 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
              1. Product Search & Attribute Targeting
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Specify any product or link to retrieve real Instagram Reels and Meta video ads.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => loadSample("sony")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
          >
            🎧 Sony XM5
          </button>
          <button
            type="button"
            onClick={() => loadSample("boat")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
          >
            ⚡ boAt Airdopes
          </button>
          <button
            type="button"
            onClick={() => loadSample("apple")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
          >
            🍎 AirPods Pro
          </button>
          <button
            type="button"
            onClick={() => loadSample("nothing")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition shadow-sm"
          >
            📱 Nothing Phone
          </button>
        </div>
      </div>

      {/* URL or Image Inspection */}
      <div className="mt-5">
        <div className="flex items-center space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "url"
                ? "bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Product Page URL (Auto-Extract)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "upload"
                ? "bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Reference Photo</span>
          </button>
        </div>

        {activeTab === "url" ? (
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. https://www.sony.co.in/headphones/products/wh-1000xm5"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={handleInspect}
              disabled={inspecting || !url}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-medium border border-slate-700/80 disabled:opacity-50 transition flex items-center space-x-2 shadow-sm"
            >
              {inspecting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inspect URL</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 border-dashed">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
            <button
              type="button"
              onClick={handleInspect}
              disabled={inspecting || !selectedFile}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-medium border border-slate-700 disabled:opacity-50 transition"
            >
              {inspecting ? "Analyzing Vision..." : "Extract Features"}
            </button>
          </div>
        )}
      </div>

      {/* Main Form: Attributes & Target Trigger */}
      <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Inputs */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. WH-1000XM5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition shadow-inner font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Search Keywords & Tags</span>
                <span className="text-[10px] font-normal text-slate-400">Press Enter to add tag</span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl min-h-[46px] items-center shadow-inner">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-sm"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="ml-1.5 text-slate-400 hover:text-rose-400 font-bold transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder={keywords.length === 0 ? "Type keyword (e.g. wireless, review) and press Enter..." : "+ Add keyword"}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none px-2 py-1 flex-1 min-w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Right: Target Summary & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-inner space-y-4">
            <div className="flex items-center space-x-3.5">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || "Product"}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-800 bg-slate-900 shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-[10px] text-center p-1 bg-slate-900/40">
                  Visual Silhouette
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">
                  Engine Scope
                </span>
                <span className="text-sm font-bold text-white block truncate">
                  {name ? `${brand ? brand + " " : ""}${name}` : "Pending Product Input"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                  Target: 20 Reels + 20 Ads
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-40 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>Discovering Reels & Ads...</span>
                </span>
              ) : (
                <>
                  <span>Launch Discovery Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
