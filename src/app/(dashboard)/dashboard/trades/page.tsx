"use client";

import { useState } from "react";

import { BotOfflineFallback } from "@/components/dashboard/bot-offline-fallback";
import { FtError, ftAction, useTrades } from "@/lib/swr";

const fmtPrice = (v: number) =>
  v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v.toPrecision(6);

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

function duration(from: string, to?: string) {
  const ms = (to ? new Date(to).getTime() : Date.now()) - new Date(from).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TradesPage() {
  const { data, error, isLoading, mutate } = useTrades();
  const [exiting, setExiting] = useState<number | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  if (error) return <BotOfflineFallback error={error.message} />;

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40 backdrop-blur-md">
        Loading trades…
      </div>
    );
  }

  async function forceExit(tradeId: number) {
    if (!window.confirm(`Force exit trade #${tradeId}?`)) return;
    setExiting(tradeId);
    setPageError(null);
    try {
      await ftAction(`exit/${tradeId}`);
      await mutate();
    } catch (e) {
      setPageError(e instanceof FtError ? e.message : "Exit failed");
    } finally {
      setExiting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl text-white">Trades</h1>

      {pageError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 font-serif text-lg text-white">Open Positions</h2>
        {data.open.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">
            No open positions. Start your bot to enter trades.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="pb-2 font-normal">#</th>
                <th className="pb-2 font-normal">Pair</th>
                <th className="pb-2 text-right font-normal">Entry</th>
                <th className="pb-2 text-right font-normal">Current</th>
                <th className="pb-2 text-right font-normal">P&amp;L</th>
                <th className="pb-2 text-right font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {data.open.map((t) => {
                const up = (t.profit_ratio ?? 0) >= 0;
                return (
                  <tr key={t.trade_id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-white/50">{t.trade_id}</td>
                    <td className="py-2 text-white/80">{t.pair}</td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {fmtPrice(t.open_rate)}
                    </td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {t.current_rate != null ? fmtPrice(t.current_rate) : "—"}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.profit_ratio != null ? fmtPct(t.profit_ratio) : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => forceExit(t.trade_id)}
                        disabled={exiting !== null}
                        className="rounded-md border border-red-400/30 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {exiting === t.trade_id ? "Exiting…" : "Exit"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 font-serif text-lg text-white">Trade History</h2>
        {data.closed.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">
            No closed trades yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="pb-2 font-normal">#</th>
                <th className="pb-2 font-normal">Pair</th>
                <th className="pb-2 text-right font-normal">Entry</th>
                <th className="pb-2 text-right font-normal">Exit</th>
                <th className="pb-2 text-right font-normal">Profit</th>
                <th className="pb-2 font-normal">Reason</th>
                <th className="pb-2 text-right font-normal">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.closed.map((t) => {
                const up = (t.close_profit ?? 0) >= 0;
                return (
                  <tr key={t.trade_id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-white/50">{t.trade_id}</td>
                    <td className="py-2 text-white/80">{t.pair}</td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {fmtPrice(t.open_rate)}
                    </td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {t.close_rate != null ? fmtPrice(t.close_rate) : "—"}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.close_profit != null ? fmtPct(t.close_profit) : "—"}
                    </td>
                    <td className="py-2 text-white/60">{t.exit_reason ?? "—"}</td>
                    <td className="py-2 text-right text-white/60">
                      {duration(t.open_date, t.close_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
