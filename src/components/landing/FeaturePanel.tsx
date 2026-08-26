const FEATURES = [
  {
    n: "#1",
    title: "Strategy Lab",
    body: "AI‑powered strategy research, backtesting, and factor discovery via natural‑language chat. 460+ alpha factors, quantlib engine.",
    glyph: "🧪",
  },
  {
    n: "#2",
    title: "Live Market",
    body: "Binance WebSocket streams push sub-second prices into candlestick charts. No polling, no stale ticks.",
    glyph: "~",
  },
  {
    n: "#3",
    title: "Portfolio Pulse",
    body: "Total balance, daily P&L, win rate and open exposure rendered as glass stat cards on your home screen.",
    glyph: "%",
  },
  {
    n: "#4",
    title: "Trade Ledger",
    body: "Every open and closed position with entry, exit, duration and per-pair performance — reviewable in one ledger.",
    glyph: "=",
  },
  {
    n: "#5",
    title: "News Sentiment",
    body: "Headlines scored by an LLM into bullish, bearish or neutral badges. Cached so the feed loads instantly.",
    glyph: "*",
  },
  {
    n: "#6",
    title: "Dry-Run First",
    body: "Paper trading against Binance testnet by default. The engine learns while your capital stays untouched.",
    glyph: "◇",
  },
];

export function FeaturePanel() {
  return (
    <div className="ks-curtain" data-curtain>
      <section
        aria-label="Feature details"
        className="ks-panel ks-noise relative bg-[var(--k-panel-bg)] text-[var(--k-panel-fg)]"
      >
        {/* sticky side badge */}
        <div className="pointer-events-none absolute left-[calc(24*var(--u))] top-[calc(var(--k-frame)+180*var(--u))] z-10 hidden lg:block">
          <p
            className="sticky top-[calc(160*var(--u))] font-mono text-[length:calc(16*var(--u))] tracking-[0.5em] text-[var(--k-panel-muted)]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            KAIROS &bull; SYSTEM PANEL
          </p>
        </div>

        <div className="px-[var(--k-gutter)] py-[calc(140*var(--u))]">
          <div className="flex flex-col items-start gap-[calc(30*var(--u))]" data-reveal>
            <p className="ks-eyebrow !text-[var(--k-panel-muted)]">Under The Hood</p>
            <h2 className="ks-h2 max-w-[calc(1200*var(--u))] text-balance">
              Six Systems. One Opportune Moment.
            </h2>
          </div>

          <div className="mt-[calc(150*var(--u))] grid gap-x-[calc(40*var(--u))] gap-y-[calc(150*var(--u))] md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <article key={f.n} data-reveal data-reveal-delay={String(i % 3)}>
                <p className="font-mono text-[length:calc(18*var(--u))] tracking-[0.22em] text-[var(--k-panel-muted)]">
                  {f.n}
                </p>
                <h3 className="ks-h3 mt-[calc(14*var(--u))]">{f.title}</h3>

                <div
                  className="ks-art mt-[calc(24*var(--u))] flex aspect-[666/574] items-center justify-center rounded-[calc(6*var(--u))] border border-[var(--k-panel-line)] bg-black/[0.04]"
                >
                  <span
                    data-parallax
                    aria-hidden="true"
                    className="flex items-center justify-center font-serif text-[length:clamp(48px,calc(140*var(--u)),140px)] text-[var(--k-accent)] opacity-70"
                    style={{ height: "100%", width: "100%" }}
                  >
                    {f.glyph}
                  </span>
                </div>

                <p
                  className="ks-body mt-[calc(20*var(--u))] uppercase"
                  style={{ fontSize: "calc(17 * var(--u))", color: "var(--k-panel-muted)" }}
                >
                  {f.body}
                </p>
              </article>
            ))}
          </div>

          {/* giant wordmark stopper — bleeds off both edges like the reference */}
          <div
            data-reveal
            aria-hidden="true"
            className="mx-[calc(-1*var(--k-gutter))] -mb-[calc(140*var(--u))] mt-[calc(200*var(--u))] flex select-none justify-center overflow-hidden font-serif text-[length:26vw] leading-none tracking-[0.06em] text-[var(--k-panel-fg)] [text-box:trim-both_cap_alphabetic]"
          >
            <span className="whitespace-nowrap">KAIROS</span>
          </div>
        </div>
      </section>
    </div>
  );
}
