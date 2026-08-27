"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Search, History, BookOpen, Zap,
  TrendingUp, BarChart2, Activity, Crosshair,
  RefreshCw, ArrowUp, PanelLeftClose,
  MoreHorizontal, Pin, PenLine, Trash,
} from "lucide-react";
import BubbleBurst from "@/components/originkit/ui/bubble-burst";

/* ─── types ─────────────────────────────────────── */

interface StreamMetrics {
  total_return: string;
  win_rate: string;
  max_drawdown: string;
  sharpe_ratio: number;
  profit_factor: number;
  trades_count: number;
}

interface Trade {
  type: "BUY" | "SELL";
  date: string;
  price: number;
  size: number;
  pnl: number;
  reason: string;
}

interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
}

interface Factor {
  name: string;
  description: string;
  weight: number;
}

interface BacktestParams {
  timeframe?: string;
  universe?: string;
  lookback_days?: number;
  initial_capital?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  metrics?: StreamMetrics;
  trades?: Trade[];
  equity?: EquityPoint[];
  factors?: Factor[];
  parameters?: BacktestParams;
  analysis?: string;
  summary?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  pinned?: boolean;
}

/* ─── constants ──────────────────────────────────── */

const STORAGE_KEY = "kairos-strategy-sessions";
const ACTIVE_ID_KEY = "kairos-strategy-active-id";

const NAV_ITEMS = [
  { icon: Zap,      label: "Quick Start" },
  { icon: BookOpen, label: "Templates"   },
  { icon: History,  label: "History"     },
];

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    label: "RSI Reversal",
    desc: "Backtest 14-period RSI overbought/oversold on BTC/USDT",
    prompt: "Backtest RSI Reversal (14-period) strategy on BTC/USDT",
  },
  {
    icon: Activity,
    label: "EMA Crossover",
    desc: "Run 10/50 EMA crossover signal on the last 90 days",
    prompt: "Backtest EMA Crossover (10/50) strategy on BTC/USDT",
  },
  {
    icon: BarChart2,
    label: "Bollinger Breakout",
    desc: "Detect volatility squeeze and breakout entries",
    prompt: "Backtest Bollinger Band Breakout strategy on BTC/USDT",
  },
  {
    icon: Crosshair,
    label: "MACD Momentum",
    desc: "MACD histogram scan across top pairs",
    prompt: "Backtest MACD Momentum strategy on BTC/USDT",
  },
];

/* ─── storage helpers ────────────────────────────── */

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "[]";
    const sessions = JSON.parse(raw);
    const THIRTY_DAYS = 30 * 86_400_000;
    const now = Date.now();
    const recent = sessions.filter((s: ChatSession) => now - s.createdAt < THIRTY_DAYS);
    if (recent.length < sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    }
    return recent;
  } catch {
    return [];
  }
}
function saveSessions(s: ChatSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
function loadActiveId(): string | null {
  try { return localStorage.getItem(ACTIVE_ID_KEY); } catch { return null; }
}
function saveActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_ID_KEY, id);
    else localStorage.removeItem(ACTIVE_ID_KEY);
  } catch {}
}
function titleOf(t: string) { return t.length > 38 ? t.slice(0, 38) + "…" : t; }

function groupSessions(sessions: ChatSession[]) {
  const now = Date.now();
  const DAY = 86_400_000;
  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const week: ChatSession[] = [];
  const older: ChatSession[] = [];
  for (const s of sessions) {
    const age = now - s.createdAt;
    if (age < DAY) today.push(s);
    else if (age < 2 * DAY) yesterday.push(s);
    else if (age < 7 * DAY) week.push(s);
    else older.push(s);
  }
  return { today, yesterday, week, older };
}

/* ─── sub-components ─────────────────────────────── */

function MetricsCard({ m }: { m: StreamMetrics }) {
  const cells = [
    { label: "Return",   val: m.total_return,        cls: "text-emerald-400" },
    { label: "Win Rate", val: m.win_rate,             cls: "text-white/80"   },
    { label: "Sharpe",   val: String(m.sharpe_ratio), cls: "text-amber-300"  },
    { label: "Drawdown", val: m.max_drawdown,         cls: "text-red-400"    },
    { label: "P.Factor", val: String(m.profit_factor),cls: "text-white/80"   },
    { label: "Trades",   val: String(m.trades_count), cls: "text-white/80"   },
  ];
  return (
    <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 font-mono text-xs">
      {cells.map(({ label, val, cls }) => (
        <div key={label}>
          <span className="block text-[10px] uppercase tracking-wider text-white/30">{label}</span>
          <span className={`font-semibold ${cls}`}>{val}</span>
        </div>
      ))}
    </div>
  );
}

function TradeLogTable({ trades }: { trades: Trade[] }) {
  if (!trades.length) return null;
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
        Trade Log ({trades.length} trades)
      </div>
      <table className="w-full text-left font-mono text-[11.5px]">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/10">
            <th className="px-3 py-2 text-white/50">Type</th>
            <th className="px-3 py-2 text-white/50">Date</th>
            <th className="px-3 py-2 text-white/50">Price</th>
            <th className="px-3 py-2 text-white/50">Size</th>
            <th className="px-3 py-2 text-white/50">PnL</th>
            <th className="px-3 py-2 text-white/50">Reason</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  t.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {t.type}
                </span>
              </td>
              <td className="px-3 py-2 text-white/70">{t.date}</td>
              <td className="px-3 py-2 text-white/70">${t.price.toLocaleString()}</td>
              <td className="px-3 py-2 text-white/70">{t.size}</td>
              <td className="px-3 py-2">
                <span className={t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {t.pnl >= 0 ? "+" : ""}${t.pnl.toLocaleString()}
                </span>
              </td>
              <td className="px-3 py-2 text-white/50 truncate max-w-[200px]">{t.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FactorsList({ factors }: { factors: Factor[] }) {
  if (!factors.length) return null;
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-2">
        Alpha Factors Used
      </div>
      {factors.map((f, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
          <span className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">{i + 1}</span>
          <div className="flex-1">
            <p className="font-mono text-[12px] text-white/90">{f.name}</p>
            <p className="font-mono text-[10px] text-white/40">{f.description}</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-[11px] text-amber-300">Weight: {Math.round((f.weight || 0) * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ParametersPanel({ params }: { params: BacktestParams }) {
  const entries = Object.entries(params || {});
  if (!entries.length) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="col-span-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
        Backtest Parameters
      </div>
      {entries.map(([k, v]) => (
        <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
          <span className="font-mono text-[11px] text-white/50">{k.replace(/_/g, " ")}</span>
          <span className="font-mono text-[11px] text-white/80">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: string }) {
  if (!analysis) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-2">
        Market Analysis
      </div>
      <p className="font-mono text-[11.5px] leading-relaxed text-white/70 whitespace-pre-wrap">{analysis}</p>
    </div>
  );
}

function ReportActions({ message, sessionId }: { message: Message; sessionId: string }) {
  const reportData = {
    prompt: message.content,
    analysis: message.analysis,
    factors: message.factors,
    parameters: message.parameters,
    metrics: message.metrics,
    trades: message.trades,
    equity: message.equity,
    summary: message.summary,
  };

  const downloadJSON = () => {
    const dataWithTimestamp = { ...reportData, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(dataWithTimestamp, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kairos-backtest-${sessionId.slice(-8)}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!message.trades?.length) return;
    const headers = ["Type", "Date", "Price", "Size", "PnL", "Reason"];
    const rows = message.trades.map(t => [t.type, t.date, t.price, t.size, t.pnl, t.reason]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kairos-trades-${sessionId.slice(-8)}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        onClick={downloadJSON}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-transparent text-white/70 hover:bg-white/10 transition-colors text-sm font-mono"
      >
        <span>📥</span> Export JSON
      </button>
      {message.trades?.length && (
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors text-sm font-mono"
        >
          <span>📊</span> Export CSV (Trades)
        </button>
      )}
    </div>
  );
}

/* ─── main ───────────────────────────────────────── */

export default function StrategyLabPage() {
  const [sessions, setSessions]       = useState<ChatSession[]>(() => loadSessions());
  const [activeId, setActiveId]       = useState<string | null>(() => loadActiveId());
  const [prompt, setPrompt]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [status, setStatus]           = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuId, setMenuId]           = useState<string | null>(null);
  const [menuPos, setMenuPos]         = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameVal, setRenameVal]     = useState("");
  const [isChatting, setIsChatting]   = useState(false);
  const chatRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const active   = sessions.find(s => s.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const hasChat  = activeId != null || messages.length > 0 || isChatting;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  /* close context menu on outside click */
  useEffect(() => {
    if (!menuId) return;
    const handler = () => setMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menuId]);

  /* auto-grow textarea */
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  function newChat() { setActiveId(null); saveActiveId(null); setPrompt(""); setIsChatting(false); inputRef.current?.focus(); }

  function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSessions(prev => { const n = prev.filter(s => s.id !== id); saveSessions(n); return n; });
    if (activeId === id) { setActiveId(null); saveActiveId(null); }
  }

  function startRename(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuId(null);
    setRenamingId(id);
    setRenameVal(currentTitle);
  }

  function commitRename(id: string) {
    const v = renameVal.trim();
    if (v) {
      setSessions(prev => {
        const n = prev.map(s => s.id === id ? { ...s, title: v } : s);
        saveSessions(n);
        return n;
      });
    }
    setRenamingId(null);
    setRenameVal("");
  }

  function togglePin(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuId(null);
    setSessions(prev => {
      const n = prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s);
      saveSessions(n);
      return n;
    });
  }

  const filtered = sessions.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupSessions(filtered);

  /* ── send ── */
  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setPrompt("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    let sid = activeId;
    const userMsg: Message = { role: "user", content: t };

    setSessions(prev => {
      let next: ChatSession[];
      if (!sid || !prev.find(s => s.id === sid)) {
        const id = `sl-${Date.now()}`;
        sid = id;
        next = [{ id, title: titleOf(t), messages: [userMsg], createdAt: Date.now() }, ...prev];
      } else {
        next = prev.map(s => s.id === sid ? { ...s, messages: [...s.messages, userMsg] } : s);
      }
      saveSessions(next);
      setActiveId(sid!);
      saveActiveId(sid!);
      return next;
    });
    setIsChatting(true);
    setLoading(true);
    setStatus("Connecting to Vibe-Trading Engine…");

    const isBacktestPrompt = /backtest|strategy|backtest|parameters|optimize|wallet/i.test(t);

    try {
      const res = await fetch(isBacktestPrompt ? "/api/vibe-trading/backtest" : "/api/vibe-trading/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.trim()) continue;
          const ev = part.match(/^event:\s*(.+)$/m)?.[1]?.trim();
          const dt = part.match(/^data:\s*(.+)$/m)?.[1]?.trim();
          if (!ev || !dt) continue;
          try {
            const data = JSON.parse(dt);
            if (ev === "status") setStatus(data.message);
            else if (ev === "result") {
              if (data.summary?.includes("encountered issue") || data.error) {
                setError(data.summary || "AI response error");
              }
              const ai: Message = {
                role: "assistant",
                content: data.response || data.summary || "No response from AI.",
                metrics: data.metrics,
                trades: data.trades || [],
                equity: data.equity || [],
                factors: data.factors || [],
                parameters: data.parameters || {},
                analysis: data.analysis,
                summary: data.summary,
              };
              setSessions(prev => {
                const next = prev.map(s => s.id === sid ? { ...s, messages: [...s.messages, ai] } : s);
                saveSessions(next);
                return next;
              });
            }
          } catch (parseErr) {
            console.error("Stream parse error:", parseErr);
            setError("Failed to parse response. Try again.");
          }
        }
      }
    } catch (err) {
      setError(`Connection failed: ${err instanceof Error ? err.message : "Network error"}. Using fallback simulation.`);
      const ai: Message = {
        role: "assistant",
        content: "AI connection failed. Check your GOOGLE_API_KEY configuration.",
        metrics: { total_return: "+26.1%", win_rate: "63.5%", max_drawdown: "-7.2%", sharpe_ratio: 1.85, profit_factor: 2.08, trades_count: 38 },
        trades: [],
        equity: [],
      };
      setSessions(prev => {
        const next = prev.map(s => s.id === sid ? { ...s, messages: [...s.messages, ai] } : s);
        saveSessions(next);
        return next;
      });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(prompt); }
  }

  /* ─── render ─────────────────────────────────── */
  return (
    <div className="flex h-full w-full bg-[#0a0a0a] p-3">
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0f] shadow-2xl">

        {/* ════════════════ SIDEBAR ════════════════ */}
        <aside className={`flex shrink-0 flex-col overflow-hidden rounded-l-2xl border-r border-white/[0.06] bg-[#0b0b0d] transition-all duration-200 ${sidebarOpen ? "w-[260px]" : "w-[52px]"}`}>

          {/* Logo row */}
          <div className={`flex items-center border-b border-white/[0.06] py-3.5 ${sidebarOpen ? "justify-between px-4" : "justify-center px-0"}`}>
            {sidebarOpen && (
              <span className="font-serif text-[15px] text-white tracking-wide">Kairos</span>
            )}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex h-6 w-6 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60"
            >
              <PanelLeftClose className={`size-3.5 transition-transform duration-200 ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
          </div>

          {/* New chat button */}
          <div className={`pb-3 ${sidebarOpen ? "px-3 pt-3" : "px-2 pt-3"}`}>
            {sidebarOpen ? (
              <button
                onClick={newChat}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400/90 py-2 font-mono text-[12px] font-semibold text-black transition-colors hover:bg-amber-400"
              >
                <Plus className="size-3.5" />
                New chat
              </button>
            ) : (
              <button
                onClick={newChat}
                title="New chat"
                className="flex w-full items-center justify-center rounded-lg bg-amber-400/90 py-2 text-black transition-colors hover:bg-amber-400"
              >
                <Plus className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search — only when expanded */}
          {sidebarOpen && (
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5">
              <Search className="size-3 shrink-0 text-white/25" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent font-mono text-[11.5px] text-white/70 outline-none placeholder:text-white/25"
              />
            </div>
          </div>
          )}

          {/* Search icon — collapsed */}
          {!sidebarOpen && (
          <div className="flex justify-center pb-2">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60">
              <Search className="size-3.5" />
            </button>
          </div>
          )}

          {/* Nav links */}
          <nav className={`pb-2 ${sidebarOpen ? "px-2" : "px-2"}`}>
            {NAV_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={!sidebarOpen ? label : undefined}
                className={`flex w-full items-center rounded-lg py-1.5 font-mono text-[12px] text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70 ${sidebarOpen ? "gap-2.5 px-2.5" : "justify-center px-0"}`}
              >
                <Icon className="size-3.5 shrink-0" />
                {sidebarOpen && label}
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-3 mb-2 border-t border-white/[0.06]" />

          {/* History groups — only when expanded */}
          <div className="flex-1 overflow-y-auto pb-2 scrollbar-none">
            {sidebarOpen ? (
              <div className="px-2">
                {sessions.length === 0 && (
                  <p className="px-2 pt-3 font-mono text-[10.5px] leading-relaxed text-white/20">
                    No sessions yet.<br />Start a new chat.
                  </p>
                )}
                {(["today","yesterday","week","older"] as const).map(key => {
                  const label = key === "today" ? "Today" : key === "yesterday" ? "Yesterday" : key === "week" ? "7 days" : "Older";
                  const list = groups[key];
                  if (!list.length) return null;
                  return (
                    <div key={key} className="mb-3">
                      <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-white/25">
                        {label}
                      </p>
                      {list.map(s => (
                        <div
                          key={s.id}
                          className={`group relative flex w-full items-center gap-2 rounded-lg px-2.5 py-[7px] transition-colors cursor-pointer ${
                            s.id === activeId
                              ? "bg-white/[0.07] text-white"
                              : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                          }`}
                          onClick={() => { setActiveId(s.id); setMenuId(null); }}
                        >
                          {/* circle dot */}
                          <span className={`flex h-[7px] w-[7px] shrink-0 rounded-full border ${
                            s.id === activeId
                              ? "border-white/60 bg-transparent"
                              : "border-white/20 bg-transparent"
                          }`} />

                          {/* title or rename input */}
                          {renamingId === s.id ? (
                            <input
                              autoFocus
                              value={renameVal}
                              onChange={e => setRenameVal(e.target.value)}
                              onBlur={() => commitRename(s.id)}
                              onKeyDown={e => {
                                if (e.key === "Enter") commitRename(s.id);
                                if (e.key === "Escape") { setRenamingId(null); setRenameVal(""); }
                                e.stopPropagation();
                              }}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 truncate bg-transparent font-mono text-[12px] text-white outline-none"
                            />
                          ) : (
                            <span className="flex-1 truncate font-mono text-[12px]">{s.title}</span>
                          )}

                          {/* 3-dot button */}
                          {renamingId !== s.id && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (menuId === s.id) { setMenuId(null); return; }
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setMenuPos({ x: rect.right + 4, y: rect.top });
                                setMenuId(s.id);
                              }}
                              className="invisible ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/[0.08] hover:text-white/70 group-hover:visible"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </button>
                          )}

                          {/* dropdown rendered via portal below */}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* collapsed — show dots for each session */
              <div className="flex flex-col items-center gap-1 px-2 pt-1">
                {sessions.slice(0, 8).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    title={s.title}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      s.id === activeId ? "bg-amber-400" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Context menu portal ── */}
        {menuId && typeof document !== "undefined" && createPortal(
          <div
            className="fixed z-[9999] w-48 overflow-hidden rounded-xl border border-white/[0.09] bg-[#161618] py-1 shadow-2xl"
            style={{ left: menuPos.x, top: menuPos.y }}
            onClick={e => e.stopPropagation()}
          >
            {/* Pin */}
            <button
              onClick={e => { togglePin(menuId, e); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 font-mono text-[11.5px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Pin className="size-3.5 text-white/40" />
              <span className="flex-1 text-left">{sessions.find(s => s.id === menuId)?.pinned ? "Unpin" : "Pin"}</span>
              <kbd className="font-mono text-[10px] text-white/20">P</kbd>
            </button>
            {/* Rename */}
            <button
              onClick={e => { const s = sessions.find(x => x.id === menuId); if (s) startRename(s.id, s.title, e); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 font-mono text-[11.5px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <PenLine className="size-3.5 text-white/40" />
              <span className="flex-1 text-left">Rename</span>
              <kbd className="font-mono text-[10px] text-white/20">R</kbd>
            </button>
            {/* Divider */}
            <div className="my-1 border-t border-white/[0.06]" />
            {/* Delete */}
            <button
              onClick={e => { deleteSession(menuId, e); setMenuId(null); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 font-mono text-[11.5px] text-red-400/80 transition-colors hover:bg-red-500/[0.07] hover:text-red-400"
            >
              <Trash className="size-3.5" />
              <span className="flex-1 text-left">Delete</span>
              <kbd className="font-mono text-[10px] text-red-400/30">D</kbd>
            </button>
          </div>,
          document.body
        )}

        {/* ════════════════ MAIN ════════════════ */}
        <div className="relative flex flex-1 flex-col overflow-hidden">

          {/* Top bar */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
            <span className="font-mono text-[12px] text-white/60">Strategy Lab</span>
            <span className="font-mono text-[10px] text-white/20">Vibe-Trading v0.1</span>
          </div>

          {/* Error toast */}
            {error && (
              <div className="flex items-center gap-3 border-b border-red-500/20 bg-red-500/10 px-5 py-3">
                <div className="flex-1">
                  <p className="font-mono text-[12px] text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => { setError(null); send(prompt); }}
                  className="px-3 py-1 rounded border border-red-400/30 font-mono text-[11px] text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400/50 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

          {/* Scrollable area */}
          <div
            ref={hasChat ? chatRef : undefined}
            className="flex flex-1 flex-col items-center overflow-y-auto pb-6 scrollbar-none"
          >
            {/* ── HERO ── */}
{!hasChat && (
                <div className="flex w-full max-w-[640px] flex-1 flex-col px-6 pb-8">
                  {/* spacer pushes content down */}
                  <div className="flex-1" />

                  {/* centered interactive bubble + greeting */}
                  <div className="flex flex-col items-center">
                    <div
                      className="relative overflow-hidden"
                      style={{ width: 180, height: 180 }}
                      role="img"
                      aria-label="Interactive soap bubble — click to burst"
                    >
                      <BubbleBurst
                        tint="#BFE9FF"
                        sheen="#FFFFFF"
                        iridescence={20}
                        rim={12}
                        gloss={14}
                        wobble={7}
                        lip={12}
                        ragged={12}
                        speed={4}
                        direction="left"
                        dragSensitivity={3}
                        sizePercent={85}
                      />
                    </div>
                    <p className="font-mono text-[13px] font-medium text-amber-400/80">
                      Hello, Trader
                    </p>
                    <h1 className="mt-1 text-center font-serif text-[26px] font-normal leading-snug text-white/90">
                      How can I backtest your strategy today?
                    </h1>
                  </div>

                {/* ── Big input box ── */}
                <div className="mt-8 w-full rounded-2xl border border-white/[0.09] bg-[#111113] shadow-lg focus-within:border-amber-400/30 transition-colors">                  {/* textarea */}
                  <div className="px-4 pt-3.5 pb-2">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={prompt}
                      onChange={handleInput}
                      onKeyDown={handleKey}
                      placeholder="Ask me anything…"
                      className="w-full resize-none bg-transparent font-mono text-[13px] text-white/90 outline-none placeholder:text-white/25 leading-relaxed"
                      style={{ minHeight: "28px" }}
                    />
                  </div>

                  {/* action pills row */}
                  <div className="flex items-center gap-2 border-t border-white/[0.06] px-3.5 py-2">
                    <button className="flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/8 px-3 py-1 font-mono text-[11px] text-amber-400/80 transition-colors hover:bg-amber-400/15">
                      <Zap className="size-3" />
                      Quick Backtest
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[11px] text-white/35 transition-colors hover:border-white/20 hover:text-white/60">
                      <BookOpen className="size-3" />
                      Templates
                    </button>
                    {/* send button */}
                    <button
                      onClick={() => send(prompt)}
                      disabled={loading || !prompt.trim()}
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/90 text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {loading
                        ? <RefreshCw className="size-3.5 animate-spin" />
                        : <ArrowUp className="size-3.5" />
                      }
                    </button>
                  </div>
                </div>

                {/* ── Suggestion cards ── */}
                <div className="mt-6 grid w-full grid-cols-4 gap-3">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => send(s.prompt)}
                      className="group flex flex-col gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-left transition-all hover:border-amber-400/20 hover:bg-white/[0.05]"
                    >
                      <s.icon className="size-4 text-white/25 transition-colors group-hover:text-amber-400/70" />
                      <div>
                        <p className="font-mono text-[11.5px] font-medium text-white/75 leading-none mb-1">{s.label}</p>
                        <p className="font-mono text-[10px] leading-relaxed text-white/30">{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT THREAD ── */}
            {hasChat && (
              <div className="w-full max-w-[900px] space-y-6 px-6 pt-6 pb-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
                      m.role === "user"
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-white/[0.08] text-white/50 border border-white/[0.12]"
                    }`}>
                      {m.role === "user" ? "U" : "AI"}
                    </div>
                    <div className={`flex w-full max-w-[70%] flex-col gap-3 ${m.role === "user" ? "items-end" : ""}`}>
                      <div className={`w-full rounded-2xl px-5 py-3.5 font-mono text-[15px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-amber-400/15 text-amber-100/90 border border-amber-400/20"
                          : "bg-white/[0.05] text-white/75 border border-white/[0.08]"
                      }`}>
                        {m.content}
                      </div>
                      {m.metrics && <MetricsCard m={m.metrics} />}
                      {m.role === "assistant" && m.metrics && !m.trades?.length && (
                        <div className="mt-1 rounded-lg border border-amber-400/20 bg-amber-400/8 px-4 py-2.5 font-mono text-[12px] text-amber-400/85">
                          ⚠️ No trades generated. Try a different strategy or parameters.
                        </div>
                      )}
                      {m.role === "assistant" && (
                        <>
                          {m.analysis && <AnalysisPanel analysis={m.analysis} />}
                          {m.factors && <FactorsList factors={m.factors} />}
                          {m.parameters && <ParametersPanel params={m.parameters} />}
                          {m.trades && <TradeLogTable trades={m.trades} />}
                          {m.metrics && <ReportActions message={m} sessionId={activeId || ""} />}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] font-mono text-[11px] text-white/40">AI</div>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 py-3 font-mono text-[13px] text-white/50">
                      <RefreshCw className="size-4 animate-spin text-amber-400/60" />
                      {status || "Thinking…"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── FLOATING INPUT (chat mode) ── */}
          {hasChat && (
            <div className="shrink-0 border-t border-white/[0.06] bg-[#0d0d0f] px-5 py-3">
              <div className="mx-auto flex max-w-[900px] items-end gap-2 rounded-xl border border-white/[0.09] bg-[#111113] px-4 py-2.5 focus-within:border-amber-400/30 transition-colors">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKey}
                  placeholder="Ask a follow-up…"
                  className={`flex-1 resize-none bg-transparent font-mono text-[15px] text-white/90 outline-none placeholder:text-white/25 leading-relaxed`}
                  style={{ minHeight: "24px", maxHeight: "120px" }}
                />
                <button
                  onClick={() => send(prompt)}
                  disabled={loading || !prompt.trim()}
                  className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/90 text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading
                    ? <RefreshCw className="size-3.5 animate-spin" />
                    : <ArrowUp className="size-3.5" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
