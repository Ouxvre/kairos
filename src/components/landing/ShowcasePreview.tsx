const TICKER = [
  { pair: "BTC/USDT", price: "67,412.50", chg: "+1.24%", up: true },
  { pair: "ETH/USDT", price: "3,521.18", chg: "+2.87%", up: true },
  { pair: "SOL/USDT", price: "184.02", chg: "-0.62%", up: false },
  { pair: "BNB/USDT", price: "592.44", chg: "+0.41%", up: true },
  { pair: "XRP/USDT", price: "0.6231", chg: "-1.08%", up: false },
  { pair: "DOGE/USDT", price: "0.1582", chg: "+3.15%", up: true },
];

const STATS = [
  { label: "Total Balance", value: "$12,480.22" },
  { label: "Daily P&L", value: "+2.34%", up: true },
  { label: "Win Rate", value: "68%" },
  { label: "Open Trades", value: "3" },
];

/* ponytail: candle bars are static divs — swap for lightweight-charts in Phase 3 */
const CANDLES = [42, 58, 36, 64, 50, 72, 45, 60, 38, 68, 54, 76, 48, 62, 40, 70];

function TickerRow() {
  return (
    <div className="flex shrink-0 items-center">
      {TICKER.map((t) => (
        <span
          key={t.pair}
          className="flex items-baseline gap-[calc(14*var(--u))] px-[calc(30*var(--u))] font-mono text-[length:calc(16*var(--u))] tracking-[0.12em]"
        >
          <span className="text-[var(--k-muted)]">{t.pair}</span>
          <span>{t.price}</span>
          <span className={t.up ? "text-[var(--k-up)]" : "text-[var(--k-down)]"}>
            {t.chg}
          </span>
        </span>
      ))}
    </div>
  );
}

export function ShowcasePreview() {
  return (
    <section id="preview" aria-label="Dashboard preview" className="relative z-10 px-[var(--k-edge)] pt-[calc(60*var(--u))]">
      <div data-reveal>
        {/* window chrome */}
        <div className="ks-noise overflow-hidden rounded-[calc(8*var(--u))] border border-[var(--k-line)] bg-[#101218]">
          <div className="flex items-center gap-[10px] border-b border-[var(--k-line)] px-[calc(24*var(--u))] py-[calc(16*var(--u))]">
            <span className="size-[calc(10*var(--u))] rounded-full bg-[#f87171]" />
            <span className="size-[calc(10*var(--u))] rounded-full bg-[#d4af37]" />
            <span className="size-[calc(10*var(--u))] rounded-full bg-[#34d399]" />
            <span className="mx-auto rounded-full border border-[var(--k-line)] px-[calc(28*var(--u))] py-[calc(6*var(--u))] font-mono text-[length:calc(14*var(--u))] tracking-[0.18em] text-[var(--k-muted)]">
              app.kairos/dashboard
            </span>
            <span className="w-[calc(52*var(--u))]" />
          </div>

          {/* mock dashboard */}
          <div className="flex min-h-[calc(760*var(--u))]">
            {/* sidebar */}
            <div className="hidden w-[calc(64*var(--u))] flex-col items-center gap-[calc(26*var(--u))] border-r border-[var(--k-line)] py-[calc(28*var(--u))] md:flex">
              <span className="font-serif text-[length:calc(20*var(--u))] text-[var(--k-accent)]">K</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`size-[calc(22*var(--u))] rounded-[calc(4*var(--u))] ${
                    i === 0 ? "bg-[var(--k-accent)]/80" : "bg-white/[0.07]"
                  }`}
                />
              ))}
            </div>

            <div className="flex-1 p-[calc(32*var(--u))]">
              {/* stat cards */}
              <div className="grid grid-cols-2 gap-[calc(18*var(--u))] lg:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[calc(6*var(--u))] border border-[var(--k-line)] bg-white/[0.03] p-[calc(20*var(--u))]"
                  >
                    <p className="font-mono text-[length:calc(13*var(--u))] tracking-[0.2em] text-[var(--k-muted)]">
                      {s.label}
                    </p>
                    <p
                      className={`mt-[calc(10*var(--u))] font-serif text-[length:clamp(18px,calc(34*var(--u)),34px)] ${
                        s.up === undefined
                          ? ""
                          : s.up
                            ? "text-[var(--k-up)]"
                            : "text-[var(--k-down)]"
                      }`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* chart area */}
              <div className="mt-[calc(18*var(--u))] rounded-[calc(6*var(--u))] border border-[var(--k-line)] bg-white/[0.02] p-[calc(20*var(--u))]">
                <div className="flex items-baseline justify-between font-mono text-[length:calc(13*var(--u))] tracking-[0.2em] text-[var(--k-muted)]">
                  <span>BTC/USDT &bull; 1H</span>
                  <span className="text-[var(--k-up)]">+1.24%</span>
                </div>
                <div className="mt-[calc(18*var(--u))] flex h-[calc(300*var(--u))] items-end gap-[calc(12*var(--u))]">
                  {CANDLES.map((h, i) => {
                    const up = i % 3 !== 1;
                    return (
                      <div key={i} className="flex h-full flex-1 items-end">
                        <div
                          className={`w-full rounded-t-[2px] ${up ? "bg-[var(--k-up)]/70" : "bg-[var(--k-down)]/70"}`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* strategy lab status strip */}
              <div className="mt-[calc(18*var(--u))] flex items-center justify-between rounded-[calc(6*var(--u))] border border-[var(--k-line)] bg-white/[0.03] px-[calc(20*var(--u))] py-[calc(16*var(--u))] font-mono text-[length:calc(14*var(--u))] tracking-[0.16em]">
                <span className="flex items-center gap-[calc(12*var(--u))]">
                  <span className="relative flex size-[calc(10*var(--u))]">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex size-[calc(10*var(--u))] rounded-full bg-indigo-400" />
                  </span>
                  Strategy Lab &bull; AI Agent Active
                </span>
                <span className="hidden text-[var(--k-muted)] sm:inline">
                  Backtest Engine: Ready
                </span>
              </div>
            </div>
          </div>

          {/* live ticker marquee */}
          <div className="ks-ticker border-t border-[var(--k-line)] py-[calc(14*var(--u))]">
            <div className="ks-ticker-track">
              <TickerRow />
              <TickerRow />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
