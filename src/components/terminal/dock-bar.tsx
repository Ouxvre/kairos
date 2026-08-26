"use client";

import { useEffect, useState } from "react";
import { Plus, X, Clock, PanelLeft } from "lucide-react";

import { formatPrice, openStream, symbolOf } from "@/lib/market/binance";
import { usePair } from "./pair-context";
import { PairIcon } from "./pair-icon";

type Tick = { last: number; changePct: number };

/* WebSocket miniTicker */
function useDockTicks(key: string, symbols: string[]) {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});

  useEffect(() => {
    if (!symbols.length) return;
    const close = openStream(
      symbols.map((s) => `${symbolOf(s).toLowerCase()}@miniTicker`),
      (data) => {
        if (data.e !== "24hrMiniTicker") return;
        setTicks((prev) => ({
          ...prev,
          [data.s.replace(/USDT$/, "")]: {
            last: +data.c,
            changePct: ((+data.c - +data.o) / +data.o) * 100,
          },
        }));
      },
    );
    return close;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ticks;
}

/* Clock UTC+7 */
function useClockUTC7() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc7ms = now.getTime() + 7 * 60 * 60 * 1000;
      const d = new Date(utc7ms);
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function DockBar() {
  const { pairs, contractsDocked, pair, setPair, removePair, toggleContractsDocked, openSearch } = usePair();

  const key = pairs.join(",");
  const ticks = useDockTicks(key, pairs);
  const time = useClockUTC7();

  /* Only render when contracts are docked to top */
  if (!contractsDocked) return null;

  const isEmpty = pairs.length === 0;

  return (
    <div className="flex h-11 shrink-0 items-center border-b border-white/[0.06] bg-[#0a0a0a] px-3">

      {/* Left: pairs or empty state */}
      <div className="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden min-w-0">
        {isEmpty ? (
          <button
            onClick={openSearch}
            className="flex items-center gap-1.5 font-mono text-[11px] text-white/30 transition-colors hover:text-white/60"
          >
            <Plus className="size-3" />
            Add Contract
          </button>
        ) : (
          <>
            {pairs.map((p) => {
              const t = ticks[p];
              const active = p === pair;
              const up = (t?.changePct ?? 0) >= 0;
              return (
                <div
                  key={p}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-md border py-1 pl-2 pr-1 transition-colors ${
                    active
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Pair info — click to activate */}
                  <button
                    onClick={() => setPair(p)}
                    className="flex items-center gap-1.5"
                    title={`Activate ${p}`}
                  >
                    <PairIcon symbol={p} size={14} />
                    <span className="font-mono text-[11px] font-medium text-white">{p}/USDT</span>
                    {t && (
                      <>
                        <span className={`font-mono text-[11px] font-semibold tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                          {formatPrice(t.last)}
                        </span>
                        <span className={`font-mono text-[10px] tabular-nums ${up ? "text-emerald-400/70" : "text-red-400/70"}`}>
                          {up ? "▲" : "▼"}{Math.abs(t.changePct).toFixed(2)}%
                        </span>
                      </>
                    )}
                  </button>

                  {/* X — remove pair from workspace */}
                  <button
                    onClick={() => removePair(p)}
                    aria-label={`Remove ${p}`}
                    className="flex h-4 w-4 items-center justify-center rounded text-white/20 transition-colors hover:bg-white/[0.08] hover:text-white/60"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              );
            })}

            {/* Add more */}
            <button
              onClick={openSearch}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-dashed border-white/[0.1] text-white/25 transition-colors hover:border-white/25 hover:text-white/60"
              title="Add contract"
            >
              <Plus className="size-3" />
            </button>
          </>
        )}
      </div>

      {/* Right: clock + toggle-back button */}
      <div className="flex shrink-0 items-center gap-3 pl-3 ml-1 border-l border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-white/25">
          <Clock className="size-3" />
          <span className="font-mono text-[11px] tabular-nums text-white/35">{time}</span>
          <span className="font-mono text-[9px] text-white/20">UTC+7</span>
        </div>

        {/* Return to left sidebar */}
        <button
          onClick={toggleContractsDocked}
          title="Return to left sidebar"
          className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] text-white/30 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white/70"
        >
          <PanelLeft className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
