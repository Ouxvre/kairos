"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

type JoinResult = { queue_position: number; already: boolean };

type Status =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done"; result: JoinResult }
  | { kind: "error"; message: string };

export default function WaitlistForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company") ?? "").trim()) return;
    const email = String(data.get("email") ?? "").trim();
    setStatus({ kind: "busy" });
    try {
      const { data: rows, error } = (await getSupabase().rpc(
        "join_waitlist",
        { p_email: email } as never
      )) as unknown as { data: JoinResult[] | null; error: Error | null };
      if (error || !rows?.length) throw error ?? new Error("empty");
      setStatus({ kind: "done", result: rows[0] });
      form.reset();
    } catch {
      setStatus({
        kind: "error",
        message: "Couldn't reach the list. Check your connection and try again.",
      });
    }
  }

  const done = status.kind === "done";
  const busy = status.kind === "busy";

  return (
    <>
      <p className="ks-eyebrow text-center">
        Limited &bull; Dry-Run &bull; First Access
      </p>
      <h2 className="ks-h2 text-center">
        Join <span className="text-[var(--k-accent)]">The Waitlist</span>
      </h2>
      <p className="ks-body text-center max-w-[calc(560*var(--u))]">
        Seats open in waves. Leave your email and be there the moment the gate
        lifts.
      </p>

      {done ? (
        <div
          className="flex flex-col items-center gap-[calc(16*var(--u))]"
          aria-live="polite"
        >
          {status.result.already ? (
            <p className="ks-h3">Already on the list &#10003;</p>
          ) : (
            <>
              <p className="ks-h2">
                You&apos;re #{status.result.queue_position}
              </p>
              <p className="ks-body">Your moment is reserved.</p>
            </>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[calc(640*var(--u))] flex-col gap-[calc(16*var(--u))] md:flex-row md:items-stretch mx-auto"
        >
          <div className="ks-hp" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <input
            className="ks-input flex-1"
            type="email"
            name="email"
            placeholder="you@moment.com"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            disabled={busy}
          />
          <button
            type="submit"
            className="ks-btn ks-btn-solid shrink-0"
            disabled={busy}
          >
            {busy ? "Joining\u2026" : "Reserve My Spot"}
          </button>
        </form>
      )}

      {status.kind === "error" && (
        <p
          className="font-mono text-[length:calc(16*var(--u))] tracking-[0.14em] text-[var(--k-down)] text-center"
          role="alert"
        >
          {status.message}
        </p>
      )}
    </>
  );
}
