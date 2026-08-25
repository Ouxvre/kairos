"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";

import { User } from "@supabase/supabase-js";

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
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-serif text-white">KAIROS</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-wider text-white/60 hover:text-white border border-white/10 px-3 py-1 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 p-6 min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            <a href="/dashboard" className="block px-3 py-2 text-white rounded-lg bg-white/10">Dashboard</a>
            <a href="#" className="block px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Bot</a>
            <a href="#" className="block px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Trades</a>
            <a href="#" className="block px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Market</a>
            <a href="#" className="block px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg">News</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
