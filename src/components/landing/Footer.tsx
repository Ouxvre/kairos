import WaitlistForm from "./WaitlistForm";

export function Footer() {
  return (
    <footer aria-label="Footer" className="ks-footer ks-vignette flex flex-col items-center justify-between px-[var(--k-gutter)] pb-[calc(40*var(--u))] pt-[calc(120*var(--u))]">
      {/* ghost wordmark */}
      <span
        className="ks-ghost pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        KAIROS
      </span>

      <div className="relative z-[2] flex w-full max-w-[calc(640*var(--u))] flex-col items-center gap-[calc(28*var(--u))]">
        <WaitlistForm />
      </div>

      <div className="relative z-[2] mt-auto flex w-full flex-col items-center justify-between gap-[calc(16*var(--u))] border-t border-[var(--k-line)] pt-[calc(24*var(--u))] font-mono text-[length:calc(14*var(--u))] tracking-[0.18em] text-[var(--k-muted)] md:flex-row">
        <span>Kairos v0.1.0</span>
        <span>MIT License &copy; 2026</span>
      </div>
    </footer>
  );
}
