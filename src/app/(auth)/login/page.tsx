"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const identifier = (data.get("identifier") as string).trim();
    const password = data.get("password") as string;

    try {
      const supabase = getSupabase();

      if (identifier.includes("@")) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        if (authError) throw authError;
      } else {
        const { data: profile, error: lookupError } = (await supabase
          .from("profiles")
          .select("email")
          .eq("username", identifier)
          .single()) as unknown as { data: { email: string } | null; error: Error | null };

        if (lookupError || !profile?.email) {
          throw new Error("Invalid username or password");
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });
        if (authError) throw authError;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-10">
        <h1 className="font-serif text-4xl leading-tight">
          Welcome back, trader. <br /> Log in to your account below.
        </h1>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Button type="button" variant="outline" className="w-full" onClick={() => alert("Google Sign In — coming soon")}>
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t after:border-border">
            <span className="bg-accent relative z-10 px-2 text-muted-foreground">Or</span>
          </div>

          <Input
            name="identifier"
            type="text"
            placeholder="Email or username"
            required
            autoComplete="username"
            className="bg-transparent"
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="bg-transparent pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in…" : "Log In"}
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p>
            New to Kairos?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <p>
            Trouble logging in?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset — coming soon"); }} className="underline underline-offset-4">
              Reset your password
            </a>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
