"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PAIRS, formatPrice, openStream, symbolOf } from "@/lib/market/binance";

type Tick = { price: number; changePct: number };

export function LiveMarketWidget() {
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

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-white">Live Market</h2>
        <Link
          href="/dashboard/market"
          className="text-[11px] uppercase tracking-wider text-white/50 hover:text-white"
        >
          Charts →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
            <th className="pb-2 font-normal">Pair</th>
            <th className="pb-2 text-right font-normal">Last Price</th>
            <th className="pb-2 text-right font-normal">24h %</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map((p) => {
            const t = ticks[symbolOf(p)];
            return (
              <tr key={p} className="border-t border-white/5">
                <td className="py-2 text-white/80">{p}/USDT</td>
                <td className="py-2 text-right font-mono text-white">
                  {t ? `$${formatPrice(t.price)}` : "—"}
                </td>
                <td
                  className={`py-2 text-right font-mono ${
                    !t ? "text-white/40" : t.changePct >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t
                    ? `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
