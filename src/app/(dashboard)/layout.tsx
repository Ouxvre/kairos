"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { TopNav } from "@/components/terminal/top-nav";

import type { User } from "@supabase/supabase-js";

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    /* tinggi dikunci ke viewport (bukan min-h-screen) — kalau tidak, grid
       terminal memanjangkan halaman alih-alih menyusutkan baris atas */
    <div className="h-dvh bg-[#0a0a0a] flex flex-col overflow-hidden">
      <TopNav user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}