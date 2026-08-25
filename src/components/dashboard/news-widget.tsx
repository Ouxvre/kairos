"use client";

import { Newspaper } from "lucide-react";

export function NewsWidget() {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-lg text-white">
          <Newspaper className="size-4 text-white/60" />
          Market News
        </h2>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
          Phase 5
        </span>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
            <div className="h-2 w-1/3 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/40">
        CryptoPanic feed with AI sentiment badges lands in Phase 5.
      </p>
    </section>
  );
}
