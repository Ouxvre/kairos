const CARDS = [
  {
    tag: "AI Research Engine",
    title: "Strategy Lab",
    points: ["Natural language backtest", "460+ alpha factors", "Factor discovery & analysis"],
    href: "/dashboard/strategy-lab",
    cta: "Open Lab",
  },
  {
    tag: "Binance Stream",
    title: "Live Market",
    points: ["WebSocket price feed", "Candlestick charts", "24h change tracking"],
    href: "/dashboard/market",
    cta: "Open Market",
  },
  {
    tag: "LLM Analysis",
    title: "News Sentiment",
    points: ["Bullish / bearish badges", "Cached article history", "Market mood widget"],
    href: "/dashboard/news",
    cta: "Read Signals",
  },
];

export function PlatformCards() {
  return (
    <section id="capabilities" aria-label="Platform capabilities" className="px-[var(--k-gutter)] pb-[calc(120*var(--u))] pt-[calc(140*var(--u))]">
      <div className="flex flex-col items-center gap-[calc(30*var(--u))] text-center" data-reveal>
        <p className="ks-eyebrow">The Platform</p>
        <h2 className="ks-h2 max-w-[calc(1100*var(--u))]">
          One Panel For The Whole Market
        </h2>
      </div>

      <div className="mt-[calc(90*var(--u))] grid gap-[calc(30*var(--u))] md:grid-cols-3">
        {CARDS.map((card, i) => (
          <a
            key={card.title}
            href={card.href}
            className="ks-card ks-noise ks-vignette flex aspect-[627/547] flex-col justify-between rounded-[calc(6*var(--u))] border border-[var(--k-line)] bg-white/[0.03] p-[calc(40*var(--u))]"
            data-reveal
            data-reveal-delay={String(i % 3)}
          >
            <span className="ks-arc" aria-hidden="true" />

            <div className="relative z-[2] flex h-full flex-col justify-between">
              <div>
                <p className="ks-eyebrow">{card.tag}</p>
                <h3 className="ks-h3 mt-[calc(18*var(--u))] text-[var(--k-accent)]">
                  {card.title}
                </h3>
              </div>

              <ul className="ks-body flex flex-col gap-[calc(12*var(--u))] uppercase">
                {card.points.map((p) => (
                  <li key={p} className="flex items-center gap-[calc(12*var(--u))]">
                    <span aria-hidden="true" className="text-[var(--k-accent)]">/</span>
                    {p}
                  </li>
                ))}
              </ul>

              <span className="ks-btn mt-[calc(20*var(--u))] self-start">
                {card.cta}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
