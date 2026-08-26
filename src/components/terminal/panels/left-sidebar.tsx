"use client";

import { PanelLeft, Plus, X } from "lucide-react";

import { usePair } from "../pair-context";
import { PairIcon } from "../pair-icon";

export function LeftSidebar() {
  const { pair, pairs, contractsDocked, setPair, removePair, toggleContractsDocked, openSearch } = usePair();

  return (
    <aside className="kt-left-sidebar">
      {/* Pair list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
            Pairs
          </span>
          {/* PanelLeft button → dock all contracts to top bar */}
          <button
            onClick={toggleContractsDocked}
            title={contractsDocked ? "Return to left sidebar" : "Dock contracts to top"}
            className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
              contractsDocked
                ? "text-blue-400"
                : "text-white/30 hover:bg-white/[0.06] hover:text-white/60"
            }`}
          >
            <PanelLeft className="size-3" />
          </button>
        </div>

        {pairs.length === 0 && (
          <div className="px-1 py-3 text-center font-mono text-[10.5px] leading-relaxed text-white/20">
            No pairs yet.
            <br />
            Add one to start.
          </div>
        )}

        {pairs.map((p) => {
          const active = p === pair;
          return (
            <div
              key={p}
              className={`group flex items-center rounded-md transition-colors ${
                active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
              }`}
            >
              <button
                onClick={() => setPair(p)}
                className={`flex flex-1 items-center gap-2 px-2 py-1.5 text-left font-mono text-[12px] transition-colors ${
                  active ? "text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                <PairIcon symbol={p} size={18} />
                <span className="truncate">
                  {p}
                  <span className="text-white/25">/USDT</span>
                </span>
              </button>
              <button
                onClick={() => removePair(p)}
                aria-label={`Remove ${p}`}
                className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/0 transition-colors group-hover:text-white/30 hover:!text-white/70 hover:bg-white/[0.06]"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={openSearch}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-white/[0.12] px-2 py-1.5 font-mono text-[11px] text-white/40 transition-colors hover:border-white/25 hover:text-white/70"
        >
          <Plus className="size-3" />
          Add pair
        </button>
        <div className="mt-1 text-center font-mono text-[10px] text-white/15">
          or press{" "}
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
      </div>

    </aside>
  );
}
