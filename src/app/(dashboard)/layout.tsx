"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/dashboard/sidebar";

import type { User } from "@supabase/supabase-js";

const TICKER = [
  "BTC/USDT $67,240 ▲ 2.1%",
  "ETH/USDT $3,512 ▲ 1.4%",
  "SOL/USDT $184.20 ▼ 0.8%",
  "BNB/USDT $598.10 ▲ 0.6%",
  "Market cap $2.41T ▲ 1.2%",
  "Fear & Greed: 72 — Greed",
].join("　·　");

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--k-bg)]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--k-bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-black/30 px-4 backdrop-blur-md md:px-6">
        <div className="text-lg font-serif tracking-wide text-white">KAIROS</div>

        {/* Bot status indicator */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-red-300">
          <span className="size-1.5 rounded-full bg-red-400" />
          Bot stopped
        </span>

        {/* News / market ticker */}
        <div className="relative hidden min-w-0 flex-1 overflow-hidden md:block" aria-hidden="true">
          <div className="k-ticker-track text-xs text-white/50">
            <span className="whitespace-nowrap pr-12">{TICKER}</span>
            <span className="whitespace-nowrap pr-12">{TICKER}</span>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-white/60 sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-white/60 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
