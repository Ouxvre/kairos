export function Footer() {
  return (
    <footer aria-label="Footer" className="ks-footer ks-vignette flex flex-col justify-between px-[var(--k-gutter)] pb-[calc(40*var(--u))] pt-[calc(180*var(--u))]">
      {/* ghost wordmark */}
      <span
        className="ks-ghost pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        KAIROS
      </span>

      <div className="relative z-[2] flex flex-col items-center gap-[calc(30*var(--u))] text-center" data-reveal>
        <p className="ks-eyebrow">Personal &bull; Dry-Run &bull; Open Core</p>
        <h2 className="ks-h2">Master The Moment.</h2>
        <p className="ks-body max-w-[calc(560*var(--u))] uppercase">
          Chronos is market noise. Kairos is edge. Deploy the engine, watch
          the panel, and let the bot take the moment.
        </p>
        <a href="/dashboard" className="ks-btn ks-btn-solid mt-[calc(10*var(--u))]">
          Start Trading
        </a>
      </div>

      <div className="relative z-[2] mt-[calc(120*var(--u))] flex flex-col items-center justify-between gap-[calc(16*var(--u))] border-t border-[var(--k-line)] pt-[calc(24*var(--u))] font-mono text-[length:calc(14*var(--u))] tracking-[0.18em] text-[var(--k-muted)] md:flex-row">
        <span>Kairos v0.1.0</span>
        <span>MIT License &copy; 2026</span>
      </div>
    </footer>
  );
}
