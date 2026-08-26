"use client";

import { useEffect, useRef, useState } from "react";
import { CandlestickChart, Settings, Maximize2 } from "lucide-react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import {
  fetch24h,
  fetchKlines,
  formatCompact,
  formatPrice,
  openStream,
  symbolOf,
  type Kline,
  type Stats24h,
} from "@/lib/market/binance";

import { usePair } from "../pair-context";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

export function ChartPanel() {
  const { pair } = usePair();
  const [interval, setInterval] = useState("15m");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats24h | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  /* ── Chart lifecycle (once) ─────────────────────────────── */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.55)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(255,255,255,0.1)",
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      crosshair: { mode: CrosshairMode.Normal },
    });

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#4ade80",
      downColor: "#f87171",
      borderUpColor: "#4ade80",
      borderDownColor: "#f87171",
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
    });
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      seriesRef.current = null;
    };
  }, []);

  /* ── Chart data: REST seed + kline stream ────────────────── */
  useEffect(() => {
    /* pair kosong (semua dihapus) → kosongkan candlestick */
    if (!pair) {
      seriesRef.current?.setData([]);
      return;
    }
    const sym = symbolOf(pair);
    let cancelled = false;

    fetchKlines(sym, interval)
      .then((klines: Kline[]) => {
        if (!cancelled && seriesRef.current) {
          seriesRef.current.setData(
            klines.map((k) => ({ ...k, time: k.time as UTCTimestamp })),
          );
          setError(null);
        }
      })
      .catch(() => !cancelled && setError("Failed to load chart data"));

    /* 24h stats: REST seed, lalu live via miniTicker */
    fetch24h(sym)
      .then((s) => !cancelled && setStats(s))
      .catch(() => {});

    const close = openStream(
      [`${sym.toLowerCase()}@kline_${interval}`, `${sym.toLowerCase()}@miniTicker`],
      (data) => {
        if (data.e === "kline") {
          const k = data.k;
          seriesRef.current?.update({
            time: k.t / 1000 as UTCTimestamp,
            open: +k.o,
            high: +k.h,
            low: +k.l,
            close: +k.c,
          });
        } else if (data.e === "24hrMiniTicker") {
          setStats({
            last: +data.c,
            changePct: ((+data.c - +data.o) / +data.o) * 100,
            high: +data.h,
            low: +data.l,
            quoteVolume: +data.q,
          });
        }
      },
    );

    return () => {
      cancelled = true;
      close();
    };
  }, [pair, interval]);

  /* ── Toolbar ─────────────────────────────────────────────── */
  return (
    <>
      {/* Toolbar — sembunyikan saat tak ada pair */}
      {pair && (
      <div className="flex h-8 shrink-0 items-center gap-1.5 overflow-hidden border-b border-white/[0.06] bg-[#0e0e10] px-3">
        <span className="shrink-0 font-mono text-[11px] font-medium text-white">
          {pair}/USDT
        </span>

        {stats && (
          <>
            <span
              className={`shrink-0 font-mono text-[11px] font-semibold tabular-nums ${
                stats.changePct >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatPrice(stats.last)}
            </span>
            <span
              className={`shrink-0 font-mono text-[10.5px] tabular-nums ${
                stats.changePct >= 0 ? "text-emerald-400/80" : "text-red-400/80"
              }`}
            >
              {stats.changePct >= 0 ? "▲" : "▼"} {Math.abs(stats.changePct).toFixed(2)}%
            </span>
          </>
        )}

        <div className="h-4 w-px bg-white/[0.08]" />

        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setInterval(tf)}
              className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
                tf === interval ? "bg-white/10 text-white" : "text-white/35 hover:text-white/55"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/[0.08]" />

        <button className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-white/35 transition-colors hover:text-white/55">
          <CandlestickChart className="size-3" />
        </button>

        <div className="h-4 w-px bg-white/[0.08]" />

        <button className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-white/35 transition-colors hover:text-white/55">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Indicators
        </button>

        <div className="flex-1" />

        <span className="font-mono text-[10px] text-white/20">·</span>
        <span className="font-mono text-[10px] text-white/30">Heikin Ashi</span>
        <button className="font-mono text-[10px] text-white/25 transition-colors hover:text-white/40">
          Volume
        </button>

        <div className="flex items-center gap-0.5">
          <button className="flex h-6 w-6 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/50">
            <Settings className="size-3" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/50">
            <Maximize2 className="size-3" />
          </button>
        </div>
      </div>
      )}

      {/* Chart content — min-h-0 wajib: tanpa ini flex item menolak menyusut
          di bawah ukuran canvas (min-height:auto) dan chart tidak ikut resize */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <div ref={chartRef} className="absolute inset-0" />

        {/* pair kosong → overlay empty state, chart tetap mounted (lifecycle [] deps) */}
        {!pair && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111113]">
            <span className="font-mono text-[11px] text-white/25">No pair selected</span>
          </div>
        )}

        {error && pair && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Bottom info bar — 24h stats */}
        {pair && stats && (
          <div className="absolute bottom-0 left-0 right-0 z-10 flex h-7 items-center gap-4 border-t border-white/[0.06] bg-[#0e0e10]/80 px-2.5 font-mono text-[10px] tabular-nums text-white/35 backdrop-blur-sm">
            <span>
              24h H <span className="text-white/60">{formatPrice(stats.high)}</span>
            </span>
            <span>
              24h L <span className="text-white/60">{formatPrice(stats.low)}</span>
            </span>
            <span>
              24h Vol <span className="text-white/60">${formatCompact(stats.quoteVolume)}</span>
            </span>
          </div>
        )}
      </div>
    </>
  );
}