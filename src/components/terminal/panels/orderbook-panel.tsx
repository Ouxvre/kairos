"use client";

import { useEffect, useState } from "react";

import { openStream, symbolOf } from "@/lib/market/binance";
import { usePair } from "../pair-context";

type Level = [string, string]; // [price, qty]
type Book = { bids: Level[]; asks: Level[] };

export function OrderbookPanel() {
  const { pair } = usePair();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!pair) return;
    const close = openStream(
      [`${symbolOf(pair).toLowerCase()}@depth20@100ms`],
      (data) => {
        const d = data as { bids?: Level[]; asks?: Level[] };
        if (d.bids && d.asks) setBook({ bids: d.bids, asks: d.asks });
      },
    );
    return close;
  }, [pair]);

  if (!pair) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-center font-mono text-[11px] text-white/25">No pair selected</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="font-mono text-[11px] text-white/25">Loading order book…</span>
      </div>
    );
  }

  const spread =
    book.asks.length && book.bids
      ? +book.asks[0][0] - +book.bids[0][0]
      : 0;
  const maxQty = Math.max(
    ...book.bids.map(([, q]) => +q),
    ...book.asks.map(([, q]) => +q),
    1e-9,
  );

  const Row = ({ level, side }: { level: Level; side: "bid" | "ask" }) => (
    <div className="relative flex flex-1 items-center justify-between px-2.5 font-mono text-[11px] tabular-nums">
      {/* depth bar */}
      <div
        className={`absolute inset-y-[2px] right-0 ${side === "bid" ? "bg-emerald-500/[0.14]" : "bg-red-500/[0.14]"}`}
        style={{ width: `${Math.max((+level[1] / maxQty) * 100, 2)}%` }}
      />
      <span className={`relative ${side === "bid" ? "text-emerald-400" : "text-red-400"}`}>
        {formatLevel(level[0])}
      </span>
      <span className="relative text-white/55">{formatQty(level[1])}</span>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header row */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.05] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white/25">
        <span>Price (USDT)</span>
        <span>Amount ({pair})</span>
      </div>

      {/* Asks — anchored to spread (bottom of block); clip saat panel sempit,
          jangan sampai rows meluber nutupin header */}
      <div className="flex flex-1 flex-col justify-end min-h-0 overflow-hidden">
        {[...book.asks].reverse().slice(0, 5).map((level, i) => (
          <Row key={`a${i}`} level={level} side="ask" />
        ))}
      </div>

      {/* Spread — mid row */}
      <div className="flex shrink-0 items-center justify-between border-y border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 font-mono tabular-nums">
        <span className="text-[13px] font-semibold text-white">
          {formatLevel(book.bids[0]?.[0] ?? "0")}
        </span>
        <span className="text-[9.5px] text-white/30">spread {spread.toFixed(2)}</span>
      </div>

      {/* Bids — anchored to spread (top of block) */}
      <div className="flex flex-1 flex-col justify-start min-h-0 overflow-hidden">
        {book.bids.slice(0, 5).map((level, i) => (
          <Row key={`b${i}`} level={level} side="bid" />
        ))}
      </div>
    </div>
  );
}

const formatLevel = (p: string) =>
  +p >= 100 ? (+p).toFixed(2) : +p >= 1 ? (+p).toFixed(4) : (+p).toFixed(6);

const formatQty = (q: string) => {
  const n = +q;
  return n >= 100 ? n.toFixed(1) : n >= 1 ? n.toFixed(3) : n.toFixed(5);
};
