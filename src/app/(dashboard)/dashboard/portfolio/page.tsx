"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatPrice } from "@/lib/market/binance";
import { getSupabase } from "@/lib/supabase/client";

// ponytail: all zeros until Freqtrade wiring (Phase 4) — /profit /balance /daily /status /trades
const MOCK = {
  balance: 0,
  totalPnl: 0,
  totalPnlPct: 0,
  volume: 0,
  winRate: 0,
  wins: 0,
  losses: 0,
  realized: 0,
  unrealized: 0,
  openPositions: 0,
  openValue: 0,
  atRisk: 0,
  dailyPnl: {} as Record<string, number>,
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const dateKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const usd = (n: number) =>
  `${n < 0 ? "-" : ""}$${n === 0 ? "0.00" : formatPrice(Math.abs(n))}`;

function calendarCells(year: number, month: number): (number | null)[] {
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PortfolioPage() {
  const [username, setUsername] = useState("trader");
  const [monthOffset, setMonthOffset] = useState(0);
  const [view, setView] = useState<"calendar" | "chart">("calendar");
  const [tab, setTab] = useState<"positions" | "activity">("positions");

  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data }) => {
        const meta = data.user?.user_metadata as
          | { username?: string; first_name?: string }
          | undefined;
        setUsername(
          meta?.username || meta?.first_name || data.user?.email?.split("@")[0] || "trader",
        );
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const viewYear = now.getFullYear();
  const viewMonth = now.getMonth() + monthOffset;
  const cells = calendarCells(viewYear, viewMonth);
  const monthName = `${MONTHS[((viewMonth % 12) + 12) % 12]} ${viewYear}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl text-white">Portfolio</h1>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
        <div className="text-lg font-medium text-white">{username}</div>
        {[
          ["Total Balance", usd(MOCK.balance)],
          ["Open Value", usd(MOCK.openValue)],
          ["Volume", usd(MOCK.volume)],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-[11px] uppercase tracking-wider text-white/50">{label}</div>
            <div className="text-lg font-semibold text-white">{value}</div>
          </div>
        ))}
        <div className="ml-auto text-right">
          <div className="text-[11px] uppercase tracking-wider text-white/50">Total PnL</div>
          <div className="text-lg font-semibold text-white">
            {usd(MOCK.totalPnl)}{" "}
            <span className="text-sm font-normal text-white/50">
              {MOCK.totalPnlPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Metrics panel */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <div className="mb-4 text-[11px] uppercase tracking-wider text-white/50">Metrics</div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="font-serif text-4xl text-white">{MOCK.winRate.toFixed(1)}%</div>
              <div className="text-xs text-white/50">Win Rate</div>
            </div>
            <div className="text-right">
              <div className="text-lg text-white">{usd(MOCK.balance)}</div>
              <div className="text-xs text-white/50">
                {MOCK.wins}W / {MOCK.losses}L
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/10">
            {[
              ["Realized PnL", usd(MOCK.realized)],
              ["Unrealized PnL", usd(MOCK.unrealized)],
              ["Open Positions", String(MOCK.openPositions)],
              ["At Risk", usd(MOCK.atRisk)],
              ["Open Value", usd(MOCK.openValue)],
              ["Volume", usd(MOCK.volume)],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#111008] p-3">
                <div className="text-[11px] text-white/50">{label}</div>
                <div className="mt-0.5 text-base font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar / chart */}
        <section className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-4">
            {(["calendar", "chart"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs uppercase tracking-wider ${
                  view === v ? "border-b border-white pb-1 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setMonthOffset((o) => o - 1)}
                className="text-white/50 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-20 text-center text-sm text-white">{monthName}</span>
              <button
                onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
                disabled={monthOffset === 0}
                className="text-white/50 hover:text-white disabled:opacity-30"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {view === "calendar" ? (
            <div className="flex flex-1 flex-col">
              <div className="mb-2 grid grid-cols-7 gap-px">
                {WEEKDAYS.map((d, i) => (
                  <div key={i} className="py-1 text-center text-[11px] uppercase text-white/40">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-7 gap-px overflow-hidden rounded-lg bg-white/10">
                {cells.map((day, i) => {
                  const isToday =
                    day !== null &&
                    monthOffset === 0 &&
                    now.getDate() === day;
                  const pnl =
                    day === null
                      ? undefined
                      : MOCK.dailyPnl[dateKey(viewYear, ((viewMonth % 12) + 12) % 12, day)];
                  return (
                    <div
                      key={i}
                      className={`flex min-h-14 flex-col items-center justify-center bg-[#111008] p-1 ${
                        isToday ? "ring-1 ring-inset ring-white/50" : ""
                      }`}
                    >
                      {day !== null && (
                        <>
                          <div className="text-xs text-white/70">{day}</div>
                          {pnl !== undefined && (
                            <div
                              className={`text-[11px] ${
                                pnl >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {pnl >= 0 ? "+" : "-"}${formatPrice(Math.abs(pnl))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-end gap-4 text-[11px] text-white/50">
                {[
                  ["Loss", "bg-red-400"],
                  ["Profit", "bg-emerald-400"],
                  ["Best", "bg-emerald-300"],
                ].map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={`size-2 rounded-sm ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg bg-[#111008] p-10 text-center text-sm text-white/40">
              Cumulative PnL chart arrives with live Freqtrade data (Phase 4).
            </div>
          )}
        </section>
      </div>

      {/* Positions / Activity */}
      <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-5 border-b border-white/10 px-5 py-3">
          {(
            [
              ["positions", "Positions"],
              ["activity", "Activity"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-sm ${
                tab === key ? "border-b border-white pb-2.5 pt-3 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "positions" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                {["Pair", "Amount", "Entry Price", "Current Price", "PnL", "PnL %", "Since"].map((h) => (
                  <th key={h} className="px-5 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-white/40">
                  No open positions — place a trade to see active positions.
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                {["Pair", "Exit Reason", "Entry → Exit", "PnL", "PnL %", "Duration"].map((h) => (
                  <th key={h} className="px-5 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-white/40">
                  No closed trades yet — history appears once the bot runs.
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
