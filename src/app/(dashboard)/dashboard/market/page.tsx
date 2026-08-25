"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import {
  INTERVALS,
  PAIRS,
  fetch24h,
  fetchKlines,
  formatCompact,
  formatPrice,
  openStream,
  symbolOf,
  type Kline,
  type Stats24h,
} from "@/lib/market/binance";

export default function MarketPage() {
  const [pair, setPair] = useState<string>("BTC");
  const [interval, setIntervalState] = useState<string>("15m");
  const [stats, setStats] = useState<Stats24h | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Chart lifecycle (once)
  useEffect(() => {
    const chart = createChart(chartRef.current!, {
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

  // Chart data: REST seed + kline stream, re-runs on pair/interval change
  useEffect(() => {
    const symbol = symbolOf(pair);
    let cancelled = false;

    fetchKlines(symbol, interval)
      .then((klines: Kline[]) => {
        if (!cancelled && seriesRef.current) {
          seriesRef.current.setData(
            klines.map((k) => ({ ...k, time: k.time as UTCTimestamp })),
          );
        }
      })
      .catch(() => !cancelled && setError("Failed to load chart data"));

    const close = openStream(
      [`${symbol.toLowerCase()}@kline_${interval}`, `${symbol.toLowerCase()}@miniTicker`],
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

  // Full 24h stats: REST seed, then live high/low/volume from miniTicker
  useEffect(() => {
    const symbol = symbolOf(pair);
    let cancelled = false;

    fetch24h(symbol)
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setError("Failed to load market stats"));

    return () => {
      cancelled = true;
    };
  }, [pair]);

  const up = (stats?.changePct ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-3xl text-white">Market</h1>
        <select
          value={pair}
          onChange={(e) => {
            setPair(e.target.value);
            setError(null);
          }}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none"
        >
          {PAIRS.map((p) => (
            <option key={p} value={p}>
              {p}/USDT
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-black/40 p-1">
          {INTERVALS.map((i) => (
            <button
              key={i}
              onClick={() => setIntervalState(i)}
              className={`rounded-md px-2.5 py-1 text-xs ${
                interval === i ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* 24h stats */}
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">
            {symbolOf(pair)} · 24h
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl text-white">
              {stats ? `$${formatPrice(stats.last)}` : "—"}
            </span>
            {stats && (
              <span className={`text-sm font-medium ${up ? "text-[var(--k-up)]" : "text-[var(--k-down)]"}`}>
                {up ? "▲" : "▼"} {Math.abs(stats.changePct).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        {[
          ["24h High", stats?.high ? `$${formatPrice(stats.high)}` : "—"],
          ["24h Low", stats?.low ? `$${formatPrice(stats.low)}` : "—"],
          ["24h Volume", stats?.quoteVolume ? `$${formatCompact(stats.quoteVolume)}` : "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
            <div className="text-lg text-white/90">{value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div
        ref={chartRef}
        className="h-[420px] w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
      />
    </div>
  );
}
