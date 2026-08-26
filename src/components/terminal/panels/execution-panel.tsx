"use client";

import { useState } from "react";

import { usePair } from "../pair-context";

type Side = "long" | "short";

export function ExecutionPanel() {
  const { pair } = usePair();
  const [side, setSide] = useState<Side>("long");
  const [stake, setStake] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function enter() {
    if (!pair || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/freqtrade/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair: `${pair}/USDT`,
          side,
          ...(stake && +stake > 0 ? { stakeamount: +stake } : {}),
        }),
      });
      const payload = await res.json();
      if (!payload.ok) throw new Error(payload.error ?? "Order failed");
      setMsg({ ok: true, text: `${side === "long" ? "LONG" : "SHORT"} ${pair}/USDT placed` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Order failed" });
    } finally {
      setBusy(false);
    }
  }

  const isLong = side === "long";

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2.5 min-h-0">
      {/* Pair */}
      <div>
        <div className="mb-1 text-[9.5px] uppercase tracking-wider text-white/30">Pair</div>
        <div className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[12px] text-white truncate">
          {pair ? `${pair}/USDT` : "—"}
        </div>
      </div>

      {/* Side toggle */}
      <div>
        <div className="mb-1 text-[9.5px] uppercase tracking-wider text-white/30">Side</div>
        <div className="grid grid-cols-2 gap-1 rounded border border-white/[0.08] p-0.5">
          <button
            onClick={() => setSide("long")}
            className={`rounded py-1 font-mono text-[11px] font-semibold transition-colors ${
              isLong
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-white/35 hover:text-white/60"
            }`}
          >
            LONG
          </button>
          <button
            onClick={() => setSide("short")}
            className={`rounded py-1 font-mono text-[11px] font-semibold transition-colors ${
              !isLong
                ? "bg-red-500/20 text-red-400"
                : "text-white/35 hover:text-white/60"
            }`}
          >
            SHORT
          </button>
        </div>
      </div>

      {/* Stake amount */}
      <div>
        <div className="mb-1 text-[9.5px] uppercase tracking-wider text-white/30">
          Stake (USDT) — optional
        </div>
        <input
          type="number"
          min="0"
          step="any"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="bot default"
          className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[12px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/25"
        />
      </div>

      {/* Enter button */}
      <button
        onClick={enter}
        disabled={!pair || busy}
        className={`w-full rounded py-1.5 font-mono text-[11px] font-bold tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          isLong
            ? "bg-emerald-500/90 text-black hover:bg-emerald-400"
            : "bg-red-500/90 text-black hover:bg-red-400"
        }`}
      >
        {busy ? "…" : isLong ? "BUY / LONG" : "SELL / SHORT"}
      </button>

      {/* Message */}
      {msg && (
        <div
          className={`rounded border px-2 py-1 font-mono text-[10px] leading-relaxed ${
            msg.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      <p className="mt-auto font-mono text-[9px] leading-relaxed text-white/20">
        Dry-run via Freqtrade /forceentry. Stake kosong = pakai default bot.
      </p>
    </div>
  );
}
