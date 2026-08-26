"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ponytail: mock data — wire to /api/v1/balance + /api/v1/profit proxy when Freqtrade integration lands */
export function AccountSummary() {
  return (
    <div className="flex h-full flex-col p-2">
      <Card size="sm" className="flex-1 justify-between gap-2 rounded-lg bg-[#161618] py-2.5 ring-white/[0.08]">
      <CardContent>
        <p className="pb-0.5 text-[10px] font-medium uppercase tracking-wider text-white/25">
          Total Balance
        </p>
        <p className="font-mono text-[15px] leading-none font-medium text-white">
          $12,450.80
          <span className="ml-1 text-[10px] text-white/35">USDT</span>
        </p>
        <p className="pt-1.5 font-mono text-[11px] text-emerald-400">
          +$124.50 <span className="text-emerald-400/70">(+2.4%)</span>
          <span className="pl-1 text-white/20">today</span>
        </p>
      </CardContent>
      <CardContent className="flex items-center justify-between border-t border-white/[0.06] pt-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/90">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          Freqtrade Active
        </span>
        <Badge
          variant="outline"
          className="h-4 border-amber-400/25 bg-amber-400/10 px-1.5 font-mono text-[9px] tracking-wide text-amber-300"
        >
          DRY-RUN
        </Badge>
      </CardContent>
      </Card>
    </div>
  );
}
