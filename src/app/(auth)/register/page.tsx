"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase/client";

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <Check className={`h-3.5 w-3.5 ${met ? "text-primary" : "opacity-30"}`} />
      <span className={met ? "" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showJoinLink, setShowJoinLink] = useState(false);
  const [loading, setLoading] = useState(false);

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setShowJoinLink(false);

    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(data.entries()) as Record<string, string>;

    if (!data.get("agreeTerms")) {
      setError("You must agree to the Terms & Privacy Policy");
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!Object.values(rules).every(Boolean)) {
      setError("Password does not meet all requirements");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const email = values.email.trim();

      const { data: seat, error: gateError } = (await supabase.rpc(
        "claim_waitlist_seat",
        { p_email: email } as never
      )) as unknown as { data: number | null; error: Error | null };
      if (gateError) throw gateError;
      if (seat !== 1) {
        setShowJoinLink(seat === 0);
        throw new Error(
          seat === 0
            ? "This email isn't on the waitlist yet. Reserve your spot first."
            : seat === 3
              ? "You're on the list, but your access hasn't been unlocked yet. Seats open in waves — we'll let you know."
              : "The waitlist slot for this email has already been used."
        );
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            username: values.username,
          },
        },
      });
      if (authError) {
        try {
          await supabase.rpc("release_waitlist_seat", { p_email: email } as never);
        } catch {
          /* best effort */
        }
        throw authError;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-8">
        <h1 className="font-serif text-4xl leading-tight">
          Create your account. <br /> Start mastering the moment.
        </h1>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            {showJoinLink && (
              <>
                {" "}
                <Link
                  href="/#waitlist"
                  className="font-medium underline underline-offset-4"
                >
                  Join the waitlist
                </Link>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Button type="button" variant="outline" className="w-full" onClick={() => alert("Google Sign Up — coming soon")}>
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t after:border-border">
            <span className="bg-accent relative z-10 px-2 text-muted-foreground">Or</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="firstName" placeholder="First name" required autoComplete="given-name" className="bg-transparent" />
            <Input name="lastName" placeholder="Last name" required autoComplete="family-name" className="bg-transparent" />
          </div>

          <Input name="username" placeholder="Username" required autoComplete="username" className="bg-transparent" />
          <Input name="email" type="email" placeholder="Email address" required autoComplete="email" className="bg-transparent" />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {password.length > 0 && (
            <ul className="grid grid-cols-2 gap-1 pl-1">
              <Requirement met={rules.length} label="8+ characters" />
              <Requirement met={rules.uppercase} label="Uppercase letter" />
              <Requirement met={rules.number} label="Number" />
              <Requirement met={rules.special} label="Special character" />
            </ul>
          )}

          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              required
              autoComplete="new-password"
              className="bg-transparent pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="agreeTerms"
              required
              className="mt-0.5 size-4 accent-[#171308]"
            />
            <span>
              I agree to the{" "}
              <a href="#" className="underline underline-offset-4">Terms</a> &{" "}
              <a href="#" className="underline underline-offset-4">Privacy Policy</a>
            </span>
          </label>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
