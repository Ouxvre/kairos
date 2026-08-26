"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ProfileModal } from "./profile-modal";

const NAV_LINKS = [
  { label: "Terminal", href: "/dashboard" },
  { label: "Bot", href: "/dashboard/bot" },
  { label: "Trades", href: "/dashboard/trades" },
  { label: "Portfolio", href: "/dashboard/portfolio" },
];

interface TopNavProps {
  user: User | null;
  onLogout: () => void;
}

export function TopNav({ user, onLogout }: TopNavProps) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  const initials = (user?.email ?? "?")[0].toUpperCase();

  return (
    <>
      <header className="relative flex h-12 shrink-0 items-center border-b border-white/[0.08] bg-[#0a0a0a] px-3 z-50">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="font-serif text-base text-white tracking-wide shrink-0 pr-2">
            KAIROS
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-colors rounded-md ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search — truly centered via absolute */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-white/40 text-[13px] w-72 cursor-pointer hover:border-white/20 transition-colors">
          <Search className="size-3.5" />
          <span>Search...</span>
          <kbd className="ml-auto text-[11px] font-mono border border-white/10 rounded px-1.5 py-0.5 leading-none bg-white/[0.04]">
            ⌘K
          </kbd>
        </div>

        {/* Right: Bell + Avatar */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-white/35 hover:text-white/65 hover:bg-white/[0.05] transition-colors">
            <Bell className="size-4" />
          </button>

          <button
            onClick={() => setShowProfile(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/50 to-purple-600/50 border border-indigo-400/30 flex items-center justify-center text-[13px] font-semibold text-indigo-200 hover:border-indigo-400/60 transition-colors shrink-0"
            title={user?.email}
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Profile / Settings modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          onLogout={onLogout}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
