const TICKERS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "BNB/USDT", "DOGE/USDT"];

import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      {/* Left: form on gold panel */}
      <section className="bg-accent text-accent-foreground flex flex-col p-6 md:p-10">
        <Link href="/" className="font-serif text-xl tracking-[0.22em]">
          KAIROS
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-muted-foreground">
          By using Kairos, you acknowledge that you have read and agree to our{" "}
          <a href="#" className="underline underline-offset-4">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4">
            Privacy Policy
          </a>
          . Trading involves risk; dry-run mode is enabled by default.
        </p>
      </section>

      {/* Right: hero media + market chips */}
      <section className="hidden lg:flex flex-col gap-5 bg-[#171308] p-4">
        <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg">
          <video
            src="/assets/video/kairos_hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171308]/70 via-transparent to-transparent" />
        </div>

        <p className="text-center text-xs uppercase tracking-[0.32em] text-[#ece5d3]/70">
          Master the moment
        </p>

        <div className="mb-4 flex flex-wrap justify-center gap-3 px-10">
          {TICKERS.map((t) => (
            <span
              key={t}
              className="rounded-md border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white/80"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
