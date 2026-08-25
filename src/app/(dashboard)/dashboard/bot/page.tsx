"use client";

import { useState } from "react";

import { BotOfflineFallback } from "@/components/dashboard/bot-offline-fallback";
import { FtError, ftAction, useBotConfig } from "@/lib/swr";

type Action = "start" | "stop" | "reload";

const ACTIONS: { id: Action; label: string }[] = [
  { id: "start", label: "Start Bot" },
  { id: "stop", label: "Stop Bot" },
  { id: "reload", label: "Reload Config" },
];

export default function BotPage() {
  const { data: config, error, isLoading, mutate } = useBotConfig();
  const [busy, setBusy] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <BotOfflineFallback error={error.message} />;

  if (isLoading || !config) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40 backdrop-blur-md">
        Loading bot status…
      </div>
    );
  }

  const running = config.state === "running";

  async function run(action: Action) {
    setBusy(action);
    setActionError(null);
    try {
      await ftAction(action);
      await mutate();
    } catch (e) {
      setActionError(e instanceof FtError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl text-white">Bot Control</h1>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-white">
              {config.bot_name || "Freqtrade"}
            </h2>
            <p className="mt-1 font-mono text-xs text-white/40">
              {config.exchange} · {config.strategy}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${
              running
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {running ? "Running" : "Stopped"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-white/10 px-2 py-1 text-white/70">
            {config.dry_run ? "Dry-run" : "Live"}
          </span>
          {config.dry_run_wallet != null && (
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-white/70">
              Paper wallet: {config.dry_run_wallet.toLocaleString()} USDT
            </span>
          )}
          {config.max_open_trades != null && (
            <span className="rounded-md bg-white/10 px-2 py-1 text-white/70">
              Max open trades: {config.max_open_trades}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {ACTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => run(id)}
              disabled={busy !== null}
              className={`rounded-lg px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                id === "start"
                  ? "bg-emerald-600/80 text-white hover:bg-emerald-600"
                  : id === "stop"
                    ? "bg-red-600/80 text-white hover:bg-red-600"
                    : "border border-white/15 bg-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              {busy === id ? "Working…" : label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}
      </section>
    </div>
  );
}
