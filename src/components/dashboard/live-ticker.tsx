"use client";

import { useEffect, useState } from "react";

import { PAIRS, formatPrice, openStream, symbolOf } from "@/lib/market/binance";

type Tick = { price: number; changePct: number };

export function LiveTicker() {
  const [ticks, setTicks] = useState<Record<string, Tick>>({});

  useEffect(
    () =>
      openStream(
        PAIRS.map((p) => `${symbolOf(p).toLowerCase()}@miniTicker`),
        (data) => {
          if (data.e !== "24hrMiniTicker") return;
          setTicks((prev) => ({
            ...prev,
            [data.s]: {
              price: +data.c,
              changePct: ((+data.c - +data.o) / +data.o) * 100,
            },
          }));
        },
      ),
    [],
  );

  const items = PAIRS.map((p) => {
    const t = ticks[symbolOf(p)];
    if (!t) return `${p}/USDT …`;
    return `${p}/USDT $${formatPrice(t.price)} ${t.changePct >= 0 ? "▲" : "▼"} ${Math.abs(t.changePct).toFixed(1)}%`;
  }).join("　·　");

  return (
    <div className="k-ticker-track text-xs text-white/50">
      <span className="whitespace-nowrap pr-12">{items}</span>
      <span className="whitespace-nowrap pr-12">{items}</span>
    </div>
  );
}
