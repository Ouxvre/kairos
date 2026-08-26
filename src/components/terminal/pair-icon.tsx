"use client";

import { useState } from "react";

/* Logo pair: rantai CDN gambar (jsDelivr → CoinCap).
   Semua sumber gagal → fallback lingkaran berwarna + huruf pertama. */

const BRAND: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#00FFA3",
  XRP: "#346AA9",
  BNB: "#F3BA2F",
  DOGE: "#C2A633",
  ADA: "#0033AD",
  AVAX: "#E84142",
  LINK: "#2A5ADA",
  DOT: "#E6007A",
  MATIC: "#8247E5",
  TON: "#0098EA",
};

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 45%)`;
}

const SOURCES = [
  (sym: string) => `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${sym}.png`,
  (sym: string) => `https://assets.coincap.io/assets/icons/${sym}@2x.png`,
];

export function PairIcon({ symbol, size = 18 }: { symbol: string; size?: number }) {
  /* simbol gagal + jumlah sumber yang sudah dicoba.
     Ganti symbol → otomatis reset (failed.sym tidak cocok). */
  const [failed, setFailed] = useState<{ sym: string; count: number }>({ sym: "", count: 0 });

  const tried = failed.sym === symbol ? failed.count : 0;
  const src = SOURCES[tried]?.(symbol.toLowerCase());

  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={symbol}
        width={size}
        height={size}
        onError={() => setFailed({ sym: symbol, count: tried + 1 })}
        className="shrink-0 rounded-full object-contain select-none"
        style={{ width: size, height: size }}
      />
    );
  }

  const bg = BRAND[symbol] ?? hashColor(symbol);
  const dark = symbol === "SOL" || symbol === "BNB" || symbol === "DOGE";

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-mono font-bold select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: dark ? "#000" : "#fff",
        fontSize: Math.round(size * 0.55),
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {symbol[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
