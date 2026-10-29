import React from "react";
import { X, ShieldAlert, CheckCircle2, Info, ExternalLink } from "lucide-react";

interface ProviderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: any;
}

export const ProviderStatusModal: React.FC<ProviderStatusModalProps> = ({
  isOpen,
  onClose,
  statusData,
}) => {
  if (!isOpen) return null;

  const ig = statusData?.providers?.instagram;
  const meta = statusData?.providers?.meta_ad_library;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Discovery Providers & Credentials Status
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-5">
          {/* Instagram Provider Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Instagram Reels Provider</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  ig?.isConfigured
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {ig?.status.toUpperCase() || "UNCONFIGURED"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {ig?.message || "Operating with realistic offline test datasets."}
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-500">
              Active Provider: <span className="text-slate-300">{ig?.providerName}</span>
            </div>
          </div>

          {/* Meta Ad Library Provider Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Meta Ad Library Provider</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  meta?.isConfigured
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {meta?.status.toUpperCase() || "UNCONFIGURED"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {meta?.message || "Operating with realistic offline test datasets."}
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-500">
              Active Provider: <span className="text-slate-300">{meta?.providerName}</span>
            </div>
          </div>

          {/* Regional & Compliance Notice */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300 block mb-1">Notice on Commercial Ads in India:</strong>
            Meta's official Ad Library API restricts commercial ads to the EU and UK under Digital Services Act mandates.
            To query commercial video ads for India, configure <code className="text-indigo-400">SEARCHAPI_API_KEY</code> or <code className="text-indigo-400">APIFY_TOKEN</code> in your local <code className="text-slate-300">.env</code>.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            Close Status
          </button>
        </div>
      </div>
    </div>
  );
};
