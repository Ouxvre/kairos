"use client";

import { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";

/* ─── Types ─────────────────────────────────────────────────── */
type CalendarMetric = "PNL" | "VOLUME";
type CalendarView   = "CALENDAR" | "CHART";
type BottomTab =
  | "Positions"
  | "Activity"
  | "Rewards"
  | "Copy Trading"
  | "Advanced Analytics"
  | "Competitions";

/* ─── Constants ─────────────────────────────────────────────── */
const PLATFORM_STATS = [
  { label: "PORTFOLIO",   value: "$0.00" },
  { label: "POSITIONS",   value: "$0.00" },
  { label: "POLYMARKET",  value: "$0.00" },
  { label: "PREDICT.FUN", value: "$0.00" },
  { label: "PF POINTS",  value: "0"     },
  { label: "KALSHI",      value: "—"     },
];

const BOTTOM_TABS: BottomTab[] = [
  "Positions", "Activity", "Rewards",
  "Copy Trading", "Advanced Analytics", "Competitions",
];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const DAY_LABELS = ["S","M","T","W","T","F","S"];

/* ─── Helpers ───────────────────────────────────────────────── */
function calendarCells(y: number, m: number): (number | null)[] {
  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ═══════════════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════════════ */
export default function PortfolioPage() {
  const today = new Date();

  const [calView,   setCalView]   = useState<CalendarView>("CALENDAR");
  const [calMetric, setCalMetric] = useState<CalendarMetric>("PNL");
  const [bottomTab, setBottomTab] = useState<BottomTab>("Positions");
  const [calYear,   setCalYear]   = useState(today.getFullYear());
  const [calMonth,  setCalMonth]  = useState(today.getMonth());
  const [username,  setUsername]  = useState("trader");

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { username?: string; first_name?: string } | undefined;
      setUsername(meta?.username || meta?.first_name || data.user?.email?.split("@")[0] || "trader");
    }).catch(() => {});
  }, []);

  const cells = useMemo(() => calendarCells(calYear, calMonth), [calYear, calMonth]);

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

  /* chunk cells into rows */
  const rows = useMemo(() => {
    const r: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) r.push(cells.slice(i, i + 7));
    return r;
  }, [cells]);

  /* ─── render ─────────────────────────────────────────────── */
  return (
    /* scrollable page — NOT full-height terminal */
    <div className="flex-1 overflow-y-auto bg-[#0d0d0d] text-white font-mono">
      {/* subtle background grid */}
      <div
        className="min-h-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%), " +
            "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.03) 0%, transparent 40%)",
        }}
      >
        {/* ═══ PAGE HEADER ════════════════════════════════════════ */}
        <div className="border-b border-white/[0.06] bg-[#111113]">
          <div className="px-6 py-3">
            <h1 className="text-[14px] font-semibold text-white mb-3">Portfolio</h1>

            {/* Stats row */}
            <div className="flex items-center gap-0 rounded-lg border border-white/[0.07] bg-[#0d0d0d] overflow-hidden">

              {/* Username chip */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-r border-white/[0.07] shrink-0">
                <span className="flex items-center gap-1.5 text-[11px] text-white/70">
                  {username}
                  <span className="w-4 h-4 rounded-full bg-indigo-500/50 border border-indigo-400/30 flex items-center justify-center text-[8px] text-indigo-200 shrink-0">
                    {username[0]?.toUpperCase() ?? "?"}
                  </span>
                </span>
              </div>

              {/* Platform stats */}
              <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none">
                {PLATFORM_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-2 px-4 py-2.5 shrink-0 ${
                      i < PLATFORM_STATS.length - 1 ? "border-r border-white/[0.06]" : ""
                    }`}
                  >
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</span>
                    <span className="text-[12px] font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Icons */}
              <div className="flex items-center gap-0.5 px-2 border-l border-white/[0.07]">
                <button className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                  <RefreshCw className="size-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                  <Download className="size-3.5" />
                </button>
              </div>

              {/* Total PnL + Volume */}
              <div className="flex items-center border-l border-white/[0.07] shrink-0">
                <div className="px-4 py-2.5">
                  <div className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">TOTAL PNL</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-white">$0.00</span>
                    <span className="text-[10px] text-white/30">0.00%</span>
                  </div>
                </div>
                <div className="w-px bg-white/[0.07] h-8" />
                <div className="px-4 py-2.5">
                  <div className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">VOLUME</div>
                  <span className="text-[12px] font-semibold text-white">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══════════════════════════════════════ */}
        <div className="px-6 py-4">

          {/* ── Metrics + Calendar side by side ─────────────────── */}
          <div className="flex gap-3 mb-3" style={{ minHeight: 300 }}>

            {/* LEFT: Metrics card */}
            <div
              className="shrink-0 rounded-lg border border-white/[0.07] bg-[#111113] overflow-hidden"
              style={{ width: 260 }}
            >
              <div className="px-4 pt-3 pb-1">
                <span className="text-[9px] text-white/30 uppercase tracking-widest">Metrics</span>
              </div>

              {/* Win Rate */}
              <div className="px-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[28px] font-semibold text-white leading-none">0.0%</div>
                    <div className="text-[9px] text-white/30 mt-1 uppercase tracking-wide">Win Rate</div>
                  </div>
                  <div className="text-right pb-0.5">
                    <div className="text-[13px] text-white/55">$0.00</div>
                    <div className="text-[9px] text-white/30 mt-0.5">0W / 0L</div>
                  </div>
                </div>
              </div>

              {/* Metric pairs */}
              {[
                ["Realized PnL", "$0.00", "Unrealized PnL", "$0.00"],
                ["Open Positions", "0",    "At Risk",         "$0.00"],
                ["Open Value",    "$0.00", "Volume",          "$0.00"],
              ].map(([l1, v1, l2, v2], i) => (
                <div key={i} className="grid grid-cols-2 px-4 py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-[9px] text-white/30 uppercase mb-0.5">{l1}</div>
                    <div className="text-[12px] text-white/65">{v1}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/30 uppercase mb-0.5">{l2}</div>
                    <div className="text-[12px] text-white/65">{v2}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Calendar card */}
            <div className="flex-1 rounded-lg border border-white/[0.07] bg-[#111113] overflow-hidden flex flex-col">

              {/* Calendar top bar */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4" style={{ height: 36 }}>
                <div className="flex items-center h-full gap-0">
                  {(["CALENDAR","CHART"] as CalendarView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setCalView(v)}
                      className={`px-3 h-full text-[11px] font-medium transition-colors border-b-2 ${
                        calView === v
                          ? "text-white border-white/50"
                          : "text-white/35 border-transparent hover:text-white/55"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  {/* PNL/VOLUME toggle */}
                  <div className="flex items-center border border-white/[0.09] rounded overflow-hidden">
                    {(["PNL","VOLUME"] as CalendarMetric[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setCalMetric(m)}
                        className={`px-2.5 py-0.5 text-[10px] transition-colors ${
                          calMetric === m ? "bg-white/10 text-white" : "text-white/30 hover:text-white/55"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {/* ALL text */}
                  <span className="text-[9px] text-white/30 uppercase tracking-wide pl-2">ALL ↓</span>
                </div>
              </div>

              {/* Calendar body */}
              {calView === "CALENDAR" ? (
                <div className="flex-1 p-4 flex flex-col gap-2">

                  {/* Month nav */}
                  <div className="flex items-center gap-3 mb-1">
                    <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <span className="text-[12px] text-white/60 min-w-20 text-center">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </span>
                    <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7">
                    {DAY_LABELS.map((d, i) => (
                      <div key={i} className="text-center text-[10px] text-white/20 uppercase py-1 tracking-wide">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="flex flex-col gap-px">
                    {rows.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-7 gap-px" style={{ minHeight: 44 }}>
                        {row.map((day, ci) => {
                          if (day === null) {
                            return (
                              <div key={`e-${ri}-${ci}`} className="rounded-sm border border-white/[0.025] bg-white/[0.006]" />
                            );
                          }
                          const tod = isToday(day);
                          return (
                            <div
                              key={day}
                              className={`flex flex-col items-start justify-start p-1.5 rounded-sm border transition-colors cursor-default hover:bg-white/[0.04] ${
                                tod
                                  ? "border-white/[0.20] bg-white/[0.05]"
                                  : "border-white/[0.04] bg-white/[0.012]"
                              }`}
                            >
                              <span className={`text-[10px] leading-none ${tod ? "text-white" : "text-white/40"}`}>
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
                      <span key={l} className="flex items-center gap-1.5 text-[9px] text-white/30">
                        <span className={`w-1.5 h-1.5 rounded-full ${c}`} />
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[11px] text-white/20">
                    Cumulative PnL chart — available with live data
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom tabs card ─────────────────────────────────── */}
          <div className="rounded-lg border border-white/[0.07] bg-[#111113] overflow-hidden">

            {/* Tab bar */}
            <div className="flex items-stretch border-b border-white/[0.07]" style={{ height: 36 }}>
              <div className="flex items-stretch flex-1 min-w-0 overflow-x-auto scrollbar-none">
                {BOTTOM_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setBottomTab(tab)}
                    className={`px-3 shrink-0 text-[11px] font-medium transition-colors border-b-2 ${
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
              <div className="flex items-center gap-1.5 px-3 shrink-0 border-l border-white/[0.07]">
                <button className="text-[9px] text-white/40 hover:text-white/65 uppercase tracking-widest transition-colors whitespace-nowrap">
                  HIDE HISTORY
                </button>
                <div className="w-px h-4 bg-white/[0.08]" />
                <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] text-[9px] text-white/40 hover:text-white/65 transition-colors">
                  STATUS <ChevronDown className="size-2.5 opacity-60" />
                </button>
                <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] text-[9px] text-white/40 hover:text-white/65 transition-colors">
                  CATEGORY <ChevronDown className="size-2.5 opacity-60" />
                </button>
                <div className="flex items-center gap-1.5 border border-white/[0.08] rounded bg-white/[0.02] px-2 py-0.5">
                  <Search className="size-2.5 text-white/25 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search markets..."
                    className="bg-transparent text-[9px] text-white/55 placeholder:text-white/25 outline-none w-24"
                  />
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex items-center justify-center" style={{ minHeight: 120 }}>
              {bottomTab === "Positions" && (
                <div className="text-center py-8">
                  <div className="text-[12px] text-white/30 mb-1">No open positions</div>
                  <div className="text-[10px] text-blue-400/50 cursor-pointer hover:text-blue-400/70 transition-colors">
                    Place a trade to see active positions
                  </div>
                </div>
              )}
              {bottomTab === "Activity"           && <div className="text-[11px] text-white/20 py-8">No recent activity</div>}
              {bottomTab === "Rewards"            && <div className="text-[11px] text-white/20 py-8">No rewards earned yet</div>}
              {bottomTab === "Copy Trading"       && <div className="text-[11px] text-white/20 py-8">Copy trading — coming soon</div>}
              {bottomTab === "Advanced Analytics" && <div className="text-[11px] text-white/20 py-8">Advanced analytics — coming soon</div>}
              {bottomTab === "Competitions"       && <div className="text-[11px] text-white/20 py-8">Competitions — coming soon</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
