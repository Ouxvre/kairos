import useSWR, { type SWRConfiguration } from "swr";

import type { BotConfig, ClosedTrade, OpenTrade } from "@/lib/freqtrade";

export class FtError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "FtError";
  }
}

export interface TradesPayload {
  open: OpenTrade[];
  closed: ClosedTrade[];
}

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 5000,
  refreshInterval: 5000,
  errorRetryCount: 5,
  errorRetryInterval: 5000,
};

async function ftFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const payload = await res.json();
  if (!payload.ok) throw new FtError(payload.code ?? "FTD_ERROR", payload.error);
  return payload.data as T;
}

export function useBotConfig() {
  return useSWR<BotConfig>("/api/freqtrade/status", ftFetcher, swrConfig);
}

export function useTrades() {
  return useSWR<TradesPayload>("/api/freqtrade/trades", ftFetcher, swrConfig);
}

export async function ftAction(action: string): Promise<void> {
  const res = await fetch(`/api/freqtrade/${action}`, { method: "POST" });
  const payload = await res.json();
  if (!payload.ok) throw new FtError(payload.code ?? "FTD_ERROR", payload.error);
}
