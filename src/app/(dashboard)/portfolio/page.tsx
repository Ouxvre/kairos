"use client";

import { useState, useMemo } from "react";
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  TrendingUp,
} from "lucide-react";

/* ─── Types ──────────────────────────────── */
type CalendarMetric = "PNL" | "VOLUME";
type CalendarView = "CALENDAR" | "CHART";
type BottomTab =
  | "Positions"
  | "Activity"
  | "Rewards"
  | "Copy Trading"
  | "Advanced Analytics"
  | "Competitions";

/* ─── Static data ────────────────────────── */
const PLATFORM_STATS = [
  { label: "PORTFOLIO", value: "$0.00" },
  { label: "POSITIONS", value: "$0.00" },
  { label: "POLYMARKET", value: "$0.00" },
  { label: "PREDICT.FUN", value: "$0.00" },
  { label: "PF POINTS", value: "0" },
  { label: "KALSHI", value: "—" },
];

const BOTTOM_TABS: BottomTab[] = [
  "Positions",
  "Activity",
  "Rewards",
  "Copy Trading",
  "Advanced Analytics",
  "Competitions",
];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const DAY_LABELS = ["S","M","T","W","T","F","S"];

/* ─── Helpers ────────────────────────────── */
function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

/* ─── Main page ──────────────────────────── */
export default function PortfolioPage() {
  const today = new Date();
  const [calView, setCalView] = useState<CalendarView>("CALENDAR");
  const [calMetric, setCalMetric] = useState<CalendarMetric>("PNL");
  const [bottomTab, setBottomTab] = useState<BottomTab>("Positions");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  /* ── calendar math ── */
  const daysInMonth = useMemo(() => getDaysInMonth(calYear, calMonth), [calYear, calMonth]);
  const firstDay    = useMemo(() => getFirstDayOfMonth(calYear, calMonth), [calYear, calMonth]);

  const calRows = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows: (number | null)[][] = [];
    let row: (number | null)[] = [];
    cells.forEach((c, i) => {
      row.push(c);
      if ((i + 1) % 7 === 0) { rows.push(row); row = []; }
    });
    if (row.length) rows.push(row);
    return rows;
  }, [firstDay, daysInMonth]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  const isToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#0d0d0d] text-white">

      {/* ═══════════════════════════════════════════════════════════════
          TOP STATS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="shrink-0 flex items-center gap-0 border-b border-white/[0.07] bg-[#111113]" style={{ height: 44 }}>

        {/* "Portfolio" label */}
        <div className="px-4 flex items-center h-full border-r border-white/[0.07]">
          <span className="text-[13px] font-semibold text-white">Portfolio</span>
        </div>

        {/* Platform stats row */}
        <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none px-2">
          {PLATFORM_STATS.map((s, i) => (
            <div key={s.label} className={`flex items-center gap-2.5 px-4 h-full ${i < PLATFORM_STATS.length - 1 ? "border-r border-white/[0.06]" : ""}`}>
              <span className="text-[10px] font-mono text-white/35 uppercase tracking-wider shrink-0">
                {s.label}
              </span>
              <span className="text-[13px] font-mono font-semibold text-white shrink-0">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Refresh / Export */}
        <div className="flex items-center gap-0.5 px-2 border-l border-white/[0.07]">
          <button title="Refresh" className="w-8 h-8 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
            <RefreshCw className="size-3.5" />
          </button>
          <button title="Export" className="w-8 h-8 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
            <Download className="size-3.5" />
          </button>
        </div>

        {/* Total PnL + Volume */}
        <div className="flex items-stretch shrink-0 border-l border-white/[0.07]">
          <div className="flex flex-col justify-center px-4">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-0.5">TOTAL PNL</div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono font-semibold text-white">$0.00</span>
              <span className="text-[10px] font-mono text-white/30">0.00%</span>
            </div>
          </div>
          <div className="w-px bg-white/[0.07] my-2" />
          <div className="flex flex-col justify-center px-4">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-0.5">VOLUME</div>
            <span className="text-[13px] font-mono font-semibold text-white">$0.00</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN BODY  (metrics ← | calendar → | ALL ↕)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ─── LEFT: Metrics panel ────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col border-r border-white/[0.07] bg-[#111113] overflow-y-auto scrollbar-none"
          style={{ width: 240 }}
        >
          {/* Header */}
          <div className="px-4 pt-3 pb-2">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Metrics</span>
          </div>

          {/* Win rate hero */}
          <div className="px-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[30px] font-mono font-semibold text-white leading-none tracking-tight">
                  0.0%
                </div>
                <div className="text-[10px] font-mono text-white/35 mt-1 uppercase">Win Rate</div>
              </div>
              <div className="text-right pb-0.5">
                <div className="text-[13px] font-mono text-white/55">$0.00</div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5">0W / 0L</div>
              </div>
            </div>
          </div>

          {/* Metric grid */}
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {[
              ["Realized PnL", "$0.00", "Unrealized PnL", "$0.00"],
              ["Open Positions", "0", "AI Risk", "$0.00"],
              ["Open Value", "$0.00", "Volume", "$0.00"],
            ].map(([l1, v1, l2, v2], i) => (
              <div key={i} className="grid grid-cols-2 gap-x-4 px-4 py-3">
                <div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-wide mb-0.5">{l1}</div>
                  <div className="text-[12px] font-mono text-white/75">{v1}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-wide mb-0.5">{l2}</div>
                  <div className="text-[12px] font-mono text-white/75">{v2}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CENTER: Calendar ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">

          {/* Calendar top bar */}
          <div className="shrink-0 flex items-center justify-between border-b border-white/[0.07] bg-[#111113] px-3" style={{ height: 36 }}>
            {/* CALENDAR / CHART tabs */}
            <div className="flex items-center gap-0 h-full">
              {(["CALENDAR","CHART"] as CalendarView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setCalView(v)}
                  className={`h-full px-4 text-[11px] font-mono font-medium transition-colors border-b-2 ${
                    calView === v
                      ? "text-white border-white/50 bg-white/[0.03]"
                      : "text-white/35 border-transparent hover:text-white/55"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* PNL / VOLUME toggle (right) */}
            <div className="flex items-center gap-0 border border-white/[0.09] rounded overflow-hidden">
              {(["PNL","VOLUME"] as CalendarMetric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setCalMetric(m)}
                  className={`px-3 py-0.5 text-[10px] font-mono transition-colors ${
                    calMetric === m
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/55"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar body */}
          {calView === "CALENDAR" ? (
            <div className="flex-1 overflow-y-auto scrollbar-none p-4 flex flex-col gap-3">

              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[13px] font-mono text-white/65">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7">
                {DAY_LABELS.map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-mono text-white/25 uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="flex flex-col gap-px flex-1">
                {calRows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7 gap-px" style={{ minHeight: 52 }}>
                    {Array.from({ length: 7 }).map((_, ci) => {
                      const day = row[ci] ?? null;
                      if (day === null) {
                        return (
                          <div key={`e-${ri}-${ci}`} className="bg-white/[0.01] border border-white/[0.03] rounded-sm" />
                        );
                      }
                      const tod = isToday(day);
                      return (
                        <div
                          key={day}
                          className={`flex flex-col items-start justify-start p-1.5 rounded-sm border transition-colors cursor-default hover:bg-white/[0.04] ${
                            tod
                              ? "border-white/25 bg-white/[0.06]"
                              : "border-white/[0.04] bg-white/[0.015]"
                          }`}
                        >
                          <span className={`text-[11px] font-mono leading-none ${tod ? "text-white" : "text-white/40"}`}>
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-4 pt-2 border-t border-white/[0.05]">
                {[["Loss","bg-red-500/60"],["Profit","bg-emerald-500/60"],["Best","bg-blue-500/60"]].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
                    <span className={`w-2 h-2 rounded-full ${c}`} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* CHART placeholder */
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
              <TrendingUp className="size-10 text-white/10" />
              <div className="text-[12px] font-mono text-white/25">No chart data</div>
              <div className="text-[10px] font-mono text-white/15">Trade to see performance</div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: "ALL" narrow tab ─────────────────────────────── */}
        <div className="shrink-0 w-9 border-l border-white/[0.07] bg-[#111113] flex flex-col items-center gap-3 pt-4">
          {/* PNL / VOLUME labels — sideways */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
              ALL
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <div className="shrink-0 flex flex-col border-t border-white/[0.07] bg-[#111113]" style={{ height: 200 }}>

        {/* Tab bar + controls */}
        <div className="shrink-0 flex items-center h-9 border-b border-white/[0.07]">
          {/* Tabs */}
          <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {BOTTOM_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setBottomTab(tab)}
                className={`px-3 h-full shrink-0 text-[11px] font-mono font-medium transition-colors border-b-2 ${
                  bottomTab === tab
                    ? "text-white border-white/50"
                    : "text-white/35 border-transparent hover:text-white/55"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 px-3 shrink-0 border-l border-white/[0.07]">
            <button className="text-[10px] font-mono text-white/40 hover:text-white/65 uppercase tracking-wide transition-colors whitespace-nowrap">
              Hide History
            </button>

            <div className="w-px h-4 bg-white/[0.08]" />

            {/* STATUS dropdown */}
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-white/45 hover:text-white/65 hover:border-white/[0.14] transition-colors">
              STATUS <ChevronDown className="size-3 opacity-60" />
            </button>

            {/* CATEGORY dropdown */}
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-white/45 hover:text-white/65 hover:border-white/[0.14] transition-colors">
              CATEGORY <ChevronDown className="size-3 opacity-60" />
            </button>

            {/* Search */}
            <div className="flex items-center gap-1.5 border border-white/[0.08] rounded bg-white/[0.02] px-2 py-1 w-36">
              <Search className="size-3 text-white/25 shrink-0" />
              <input
                type="text"
                placeholder="Search markets..."
                className="bg-transparent text-[10px] font-mono text-white/55 placeholder:text-white/25 outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 flex items-center justify-center">
          {bottomTab === "Positions" && (
            <div className="text-center">
              <div className="text-[12px] font-mono text-white/30 mb-1">No open positions</div>
              <div className="text-[10px] font-mono text-blue-400/50 cursor-pointer hover:text-blue-400/70 transition-colors">
                Place a trade to see active positions
              </div>
            </div>
          )}
          {bottomTab === "Activity" && (
            <div className="text-[12px] font-mono text-white/25">No recent activity</div>
          )}
          {bottomTab === "Rewards" && (
            <div className="text-[12px] font-mono text-white/25">No rewards earned yet</div>
          )}
          {bottomTab === "Copy Trading" && (
            <div className="text-[12px] font-mono text-white/25">Copy trading — coming soon</div>
          )}
          {bottomTab === "Advanced Analytics" && (
            <div className="text-[12px] font-mono text-white/25">Advanced analytics — coming soon</div>
          )}
          {bottomTab === "Competitions" && (
            <div className="text-[12px] font-mono text-white/25">Competitions — coming soon</div>
          )}
        </div>
      </div>
    </div>
  );
}
