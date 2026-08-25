export const PAIRS = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE"] as const;
export type Pair = (typeof PAIRS)[number];

export const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
export type Interval = (typeof INTERVALS)[number];

const REST = "https://data-api.binance.vision/api/v3";
const WS_STREAMS = "wss://data-stream.binance.vision:9443/stream";

export const symbolOf = (pair: string) => `${pair}USDT`;

export type Kline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Stats24h = {
  last: number;
  changePct: number;
  high: number;
  low: number;
  quoteVolume: number;
};

type KlinesResponse = [number, string, string, string, string, ...unknown[]][];

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 500,
): Promise<Kline[]> {
  const res = await fetch(
    `${REST}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`klines ${res.status}`);
  const rows = (await res.json()) as KlinesResponse;
  return rows.map((k) => ({
    time: k[0] / 1000,
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
  }));
}

export async function fetch24h(symbol: string): Promise<Stats24h> {
  const res = await fetch(`${REST}/ticker/24hr?symbol=${symbol}`);
  if (!res.ok) throw new Error(`ticker ${res.status}`);
  const d = (await res.json()) as Record<string, string>;
  return {
    last: +d.lastPrice,
    changePct: +d.priceChangePercent,
    high: +d.highPrice,
    low: +d.lowPrice,
    quoteVolume: +d.quoteVolume,
  };
}

type KlineMsg = { e: "kline"; k: { t: number; o: string; h: string; l: string; c: string } };
type MiniTickerMsg = {
  e: "24hrMiniTicker";
  s: string;
  c: string;
  o: string;
  h: string;
  l: string;
  q: string;
};
type StreamData = KlineMsg | MiniTickerMsg;

export function openStream(
  streams: string[],
  onMessage: (data: StreamData) => void,
): () => void {
  let ws: WebSocket | null = null;
  let attempt = 0;
  let closed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(`${WS_STREAMS}?streams=${streams.join("/")}`);
    ws.onopen = () => {
      attempt = 0;
    };
    ws.onmessage = (event) => {
      const m = JSON.parse(event.data as string) as { stream?: string; data?: StreamData };
      if (m.data) onMessage(m.data);
    };
    ws.onclose = () => {
      if (closed) return;
      timer = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15000));
    };
  };
  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    ws?.close();
  };
}

export function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(4);
}

export const formatCompact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
