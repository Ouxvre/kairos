import HeroVideo from "./HeroVideo";

export function Nav() {
  return (
    <nav className="absolute inset-x-0 top-[var(--k-frame)] z-20 px-[var(--k-gutter)] pt-[calc(50*var(--u))]">
      <div className="flex flex-col items-center md:grid md:grid-cols-[1fr_auto_1fr] md:items-start">
        <div className="ks-eyebrow hidden items-center gap-[calc(36*var(--u))] md:flex">
          <a href="#capabilities" className="transition-colors hover:text-[var(--k-fg)]">
            Platform
          </a>
          <a href="#preview" className="transition-colors hover:text-[var(--k-fg)]">
            Preview
          </a>
        </div>

        <a
          href="#"
          aria-label="Kairos home"
          className="justify-self-center text-center font-serif text-[calc(34*var(--u))] leading-none tracking-[0.14em]"
        >
          KAIROS
        </a>

        <div className="hidden items-center justify-end gap-[calc(36*var(--u))] md:flex">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-[var(--k-muted)] transition-colors hover:text-[var(--k-fg)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
          <a href="/dashboard" className="ks-btn ks-btn-solid">
            Launch App
          </a>
        </div>
      </div>

      {/* mobile: CTA under wordmark */}
      <div className="flex justify-center pt-[calc(24*var(--u))] md:hidden">
        <a href="/dashboard" className="ks-btn ks-btn-solid">
          Launch App
        </a>
      </div>
    </nav>
  );
}

export function Hero() {
  return (
    <header className="relative flex h-[100dvh] min-h-[640px] flex-col justify-end overflow-hidden pb-[calc(80*var(--u))] pt-[calc(var(--k-frame)+210*var(--u))]">
      <HeroVideo />
      <div className="ks-hero-scrim" aria-hidden="true" />

      {/* left overlay: typography */}
      <div className="relative z-[3] mx-[var(--k-gutter)] flex max-w-full flex-col gap-[calc(30*var(--u))]">
        <p className="ks-eyebrow" data-reveal>
          AI-Powered &bull; Dry-Run First
        </p>

        <h1 className="ks-h1" data-reveal>
          <span className="block">Trade The</span>
          <span className="block text-[var(--k-accent)]">Opportune</span>
          <span className="block">Moment</span>
        </h1>

        <div data-reveal>
          <a href="/dashboard" className="ks-btn ks-btn-solid self-start">
            Launch App
          </a>
        </div>
      </div>

      {/* right overlay: vertical meta */}
      <div className="ks-hero-meta" aria-hidden="true">
        <p className="ks-hero-vertical">Kairos &mdash; MMXXVI</p>
        <ul className="ks-hero-stats">
          <li>Win Rate 68%</li>
          <li>Dry-Run First</li>
          <li>Binance Testnet</li>
        </ul>
      </div>

      {/* bottom: scroll cue */}
      <div className="ks-scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <span className="ks-scroll-line" />
      </div>
    </header>
  );
}
