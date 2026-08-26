"use client";

import {
  CandlestickChart,
  ListOrdered,
  Layers,
  Zap,
  Newspaper,
  ArrowLeftRight,
  DollarSign,
  Bot,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  label: string;
  icon: LucideIcon;
  category?: string;
}

export const TOOLS: Tool[] = [
  // Top group (no category)
  { id: "chart", label: "Chart", icon: CandlestickChart },
  { id: "orderbook", label: "Order Book", icon: ListOrdered },
  { id: "positions", label: "Positions", icon: Layers },
  { id: "orders", label: "Orders", icon: ListOrdered },
  { id: "execution", label: "Execution", icon: Zap },

  // Info group
  { id: "news", label: "News", icon: Newspaper, category: "Info" },
  { id: "trades", label: "Trades", icon: ArrowLeftRight, category: "Info" },
  { id: "crypto-price", label: "Crypto Price", icon: DollarSign, category: "Info" },
  { id: "account", label: "Account", icon: Wallet, category: "Info" },

  // Tools group
  { id: "automation", label: "Automation", icon: Bot, category: "Tools" },
];

export function getTool(id: string | null): Tool | undefined {
  if (!id) return undefined;
  return TOOLS.find((t) => t.id === id);
}

// Group tools preserving order: undefined category first, then Info, Tools
export function getToolGroups(): { label?: string; items: Tool[] }[] {
  const groups: { label?: string; items: Tool[] }[] = [];
  const order: (string | undefined)[] = [undefined, "Info", "Tools"];

  for (const cat of order) {
    const items = TOOLS.filter((t) => t.category === cat);
    if (items.length) groups.push({ label: cat, items });
  }

  return groups;
}
