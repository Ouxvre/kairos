"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { PAIRS, fetchTickers, formatPrice, type Ticker24h } from "@/lib/market/binance";
import { PairIcon } from "./pair-icon";

/* ── Types ────────────────────────────────────── */

interface PairState {
  pair: string;
  pairs: string[];
  contractsDocked: boolean;
  setPair: (p: string) => void;
  addPair: (p: string) => void;
  removePair: (p: string) => void;
  toggleContractsDocked: () => void;
  openSearch: () => void;
}

const PairContext = createContext<PairState | null>(null);

export function usePair(): PairState {
  const ctx = useContext(PairContext);
  if (!ctx) throw new Error("usePair must be used within PairProvider");
  return ctx;
}

/* ── Persistence ──────────────────────────────── */

const LIST_KEY = "kairos-terminal-pairs";
const ACTIVE_KEY = "kairos-terminal-active-pair";
const CONTRACTS_DOCK_KEY = "kairos-terminal-contracts-docked";
const DEFAULT_PAIRS = [...PAIRS];

function loadPairs(): string[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : null;
    /* boleh kosong — user boleh menghapus semua pair */
    return parsed ?? DEFAULT_PAIRS;
  } catch {
    return DEFAULT_PAIRS;
  }
}

function loadActive(pairs: string[]): string {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw && pairs.includes(raw) ? raw : (pairs[0] ?? "");
  } catch {
    return pairs[0] ?? "";
  }
}

const normalize = (s: string) =>
  s.trim().toUpperCase().replace(/\/?USDT$/, "").replace(/[^A-Z0-9]/g, "");

/* ── Provider ─────────────────────────────────── */

export function PairProvider({ children }: { children: ReactNode }) {
  /* lazy init: reads localStorage on first render; this tree is client-only
     (auth-gated), so there is no SSR/hydration mismatch */
  const [pairs, setPairs] = useState(loadPairs);
  const [pair, setPairState] = useState(() => loadActive(loadPairs()));
  const [contractsDocked, setContractsDocked] = useState<boolean>(() => {
    try { return localStorage.getItem(CONTRACTS_DOCK_KEY) === "true"; } catch { return false; }
  });
  const [searchOpen, setSearchOpen] = useState(false);

  const setPair = useCallback((p: string) => {
    setPairState(p);
    try {
      localStorage.setItem(ACTIVE_KEY, p);
    } catch {}
  }, []);

  const addPair = useCallback(
    (raw: string) => {
      const sym = normalize(raw);
      if (!sym || sym.length > 10) return;
      setPairs((prev) => {
        const next = prev.includes(sym) ? prev : [...prev, sym];
        try {
          localStorage.setItem(LIST_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      setPair(sym);
    },
    [setPair],
  );

  const removePair = useCallback(
    (p: string) => {
      setPairs((prev) => {
        const next = prev.filter((x) => x !== p);
        try {
          localStorage.setItem(LIST_KEY, JSON.stringify(next));
        } catch {}
        setPairState((active) => {
          if (active !== p) return active;
          const fallback = next[0] ?? "";
          try {
            localStorage.setItem(ACTIVE_KEY, fallback);
          } catch {}
          return fallback;
        });
        return next;
      });
    },
    [],
  );

  const toggleContractsDocked = useCallback(() => {
    setContractsDocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CONTRACTS_DOCK_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  /* ⌘K / Ctrl+K opens search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Listen for cross-tree toggle event (no longer needed — keeping for forward compat) */

  const value = useMemo(
    () => ({ pair, pairs, contractsDocked, setPair, addPair, removePair, toggleContractsDocked, openSearch }),
    [pair, pairs, contractsDocked, setPair, addPair, removePair, toggleContractsDocked, openSearch],
  );

  return (
    <PairContext.Provider value={value}>
      {children}
      {searchOpen && <PairSearch onClose={() => setSearchOpen(false)} />}
    </PairContext.Provider>
  );
}

/* ── Search modal ─────────────────────────────── */

function PairSearch({ onClose }: { onClose: () => void }) {
  const { pairs, setPair, addPair } = usePair();
  const [query, setQuery] = useState("");
  const [tickers, setTickers] = useState<Record<string, Ticker24h> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    let alive = true;
    fetchTickers()
      .then((t) => {
        if (alive && Object.keys(t).length > 0) setTickers(t);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const q = normalize(query);
  const allSymbols = tickers ? Object.keys(tickers) : [...PAIRS];

  let results: string[];
  if (!q) {
    if (tickers) {
      results = Object.values(tickers)
        .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
        .slice(0, 20)
        .map((t) => t.symbol.replace(/USDT$/, ""));
    } else {
      results = [...PAIRS];
    }
  } else {
    results = allSymbols.filter((s) => s.includes(q)).slice(0, 200);
    if (tickers) {
      results.sort(
        (a, b) =>
          Math.abs(tickers[b]?.priceChangePercent ?? 0) -
          Math.abs(tickers[a]?.priceChangePercent ?? 0),
      );
    }
  }

  const exactExists = pairs.includes(q);
  const exactInAll = allSymbols.includes(q);
  const canAddCustom = q.length >= 2 && q.length <= 10 && !exactExists && !exactInAll;

  const commit = (sym: string) => {
    if (pairs.includes(sym)) setPair(sym);
    else addPair(sym);
    onClose();
  };

  const freshResults = results.filter((p) => !pairs.includes(p));

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 pt-[12vh] backdrop-blur-sm"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[520px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#161618] shadow-2xl shadow-black/90">
        {/* Search header */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3">
          <Search className="size-4 text-white/30" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") {
                if (canAddCustom) commit(q);
                else if (freshResults.length === 1) commit(freshResults[0]);
                else if (results.length === 1) commit(results[0]);
              }
            }}
            placeholder="Search pair… (e.g. BTC, ETH, SOL, PEPE, SUI)"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25 font-mono"
          />
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/30">
            ESC
          </kbd>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto p-2 scrollbar-none">
          {/* pairs already in workspace */}
          {pairs.length > 0 && (
            <>
              <div className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
                Your pairs ({pairs.length})
              </div>
              {pairs
                .filter((p) => !q || p.includes(q))
                .map((p) => (
                  <PairRow
                    key={p}
                    symbol={p}
                    ticker={tickers?.[p]}
                    added
                    onSelect={() => commit(p)}
                  />
                ))}
            </>
          )}

          {/* results / top movers */}
          {freshResults.length > 0 && (
            <>
              <div className="px-2 pb-1 pt-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
                {!q ? "Top movers · 24h" : `Markets (${freshResults.length})`}
              </div>
              {freshResults.map((p) => (
                <PairRow
                  key={p}
                  symbol={p}
                  ticker={tickers?.[p]}
                  onSelect={() => commit(p)}
                />
              ))}
            </>
          )}

          {/* custom symbol */}
          {canAddCustom && (
            <button
              onClick={() => commit(q)}
              className="mt-1 flex w-full items-center justify-between rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2 text-left text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex items-center gap-2.5 font-mono">
                <PairIcon symbol={q} size={22} />
                {q}/USDT
              </span>
              <span className="font-mono text-[10.5px] text-blue-400/80">+ add custom</span>
            </button>
          )}

          {q && freshResults.length === 0 && pairs.filter((p) => p.includes(q)).length === 0 && !canAddCustom && (
            <div className="px-2 py-8 text-center font-mono text-[11.5px] text-white/25">
              No pairs found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/20 px-4 py-2 text-[10px] font-mono text-white/25">
          <span>
            {tickers
              ? `${Object.keys(tickers).length} USDT markets live on Binance`
              : "Connecting to Binance…"}
          </span>
          <span>Press ↵ to select</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PairRow({
  symbol,
  ticker,
  added = false,
  onSelect,
}: {
  symbol: string;
  ticker?: Ticker24h;
  added?: boolean;
  onSelect: () => void;
}) {
  const isPos = (ticker?.priceChangePercent ?? 0) >= 0;

  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
    >
      <PairIcon symbol={symbol} size={22} />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-[12.5px] font-medium text-white/85 group-hover:text-white">
          {symbol}
          <span className="text-white/25">/USDT</span>
        </span>
      </span>

      {ticker ? (
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[12px] text-white/60">
            ${formatPrice(ticker.lastPrice)}
          </span>
          <span
            className={`w-16 text-right font-mono text-[11px] font-medium ${
              isPos ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPos ? "+" : ""}
            {ticker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="h-3 w-14 animate-pulse rounded bg-white/[0.05]" />
          <span className="h-3 w-10 animate-pulse rounded bg-white/[0.05]" />
        </div>
      )}

      <span
        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
          added
            ? "text-white/20 group-hover:text-white/40"
            : "text-blue-400/60 group-hover:bg-blue-500/15 group-hover:text-blue-300"
        }`}
      >
        {added ? "select" : "+ add"}
      </span>
    </button>
  );
}
