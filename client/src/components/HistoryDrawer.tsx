import React from "react";
import { X, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  onSelectSearch: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Search History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No previous searches recorded in local database.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectSearch(item.id);
                  onClose();
                }}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg cursor-pointer transition group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition">
                    {item.product?.name || "Product Search"}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(item.startedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 text-[11px] font-mono text-slate-400">
                  <span>IG: <strong className="text-slate-300">{item.discoveredInstagramCount}</strong></span>
                  <span>Meta: <strong className="text-slate-300">{item.discoveredMetaCount}</strong></span>
                  <span>Matched: <strong className="text-emerald-400">{item.matchedCount}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
