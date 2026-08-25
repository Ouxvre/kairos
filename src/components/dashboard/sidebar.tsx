"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  Bot,
  ChartLine,
  LayoutDashboard,
  PanelLeft,
  Wallet,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bot", label: "Bot", icon: Bot },
  { href: "/dashboard/trades", label: "Trades", icon: ArrowLeftRight },
  { href: "/dashboard/market", label: "Market", icon: ChartLine },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`shrink-0 border-r border-white/10 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex w-full items-center gap-2 px-5 py-4 text-white/50 hover:text-white"
      >
        <PanelLeft className="size-4" />
        {!collapsed && (
          <span className="text-xs uppercase tracking-wider">Menu</span>
        )}
      </button>

      <nav className="space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
