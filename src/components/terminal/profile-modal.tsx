"use client";

import { useState, useRef, useEffect } from "react";
import { X, Copy, ExternalLink } from "lucide-react";
import type { User } from "@supabase/supabase-js";

/* ── Types ──────────────────────────────────── */

type Section = "General" | "Wallets" | "Activity" | "Trading" | "Invites" | "Danger Zone";

const NAV_ITEMS: { label: Section; icon: string }[] = [
  { label: "General",     icon: "⊙" },
  { label: "Wallets",     icon: "◈" },
  { label: "Activity",    icon: "▦" },
  { label: "Trading",     icon: "⚡" },
  { label: "Invites",     icon: "⊕" },
  { label: "Danger Zone", icon: "⚠" },
];

interface ProfileModalProps {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

/* ── Helpers ─────────────────────────────────── */

function maskEmail(email?: string) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  const masked = local.slice(0, 2) + "***";
  return `${masked}@${domain}`;
}

function shortId(id?: string) {
  if (!id) return "—";
  return id.slice(0, 8) + "…";
}

function sinceDate(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

/* ── Modal ───────────────────────────────────── */

export function ProfileModal({ user, onLogout, onClose }: ProfileModalProps) {
  const [section, setSection] = useState<Section>("General");
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const copyId = () => {
    navigator.clipboard.writeText(user?.id ?? "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const initials = (user?.email ?? "?")[0].toUpperCase();

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.15s ease" }}
    >
      <div
        className="relative flex w-[820px] max-w-[95vw] h-[560px] max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
          animation: "fadeSlideIn 0.18s ease",
        }}
      >
        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-6 h-6 flex items-center justify-center rounded text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
        >
          <X className="size-3.5" />
        </button>

        {/* ── Left sidebar ── */}
        <aside className="w-[190px] shrink-0 flex flex-col py-4" style={{ background: "#0a0a0c", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 mb-4 text-[12px] font-semibold text-white/80 tracking-wide">
            Settings
          </div>

          <nav className="flex flex-col gap-0.5 px-2">
            {NAV_ITEMS.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => setSection(label)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[12px] transition-colors text-left ${
                  section === label
                    ? "bg-white/[0.07] text-white"
                    : "text-white/40 hover:text-white/65 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-[12px] opacity-60 font-mono w-4 text-center">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          {/* Docs link */}
          <div className="mt-auto px-3 pb-1">
            <button className="flex items-center gap-2 px-3 py-2 rounded text-[11px] text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-colors w-full">
              <span className="font-mono text-[12px]">□</span>
              Docs
              <ExternalLink className="size-3 ml-auto opacity-50" />
            </button>
          </div>
        </aside>

        {/* ── Main content — no scrollbar ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {section === "General" && (
            <GeneralSection user={user} onLogout={onLogout} onClose={onClose} copied={copied} onCopyId={copyId} initials={initials} />
          )}
          {section !== "General" && (
            <PlaceholderSection label={section} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── General section ─────────────────────────── */

function GeneralSection({ user, onLogout, onClose, copied, onCopyId, initials }: {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
  copied: boolean;
  onCopyId: () => void;
  initials: string;
}) {
  return (
    <div className="p-7 flex flex-col gap-6">

      {/* ACCOUNT */}
      <div>
        <SectionLabel>Account</SectionLabel>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-2 text-lg font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.25) 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "rgba(199,210,254,0.9)",
            }}
          >
            {initials}
          </div>
          <span className="text-[11px] text-white/40 font-mono">
            {user?.email?.split("@")[0] ?? "user"}
          </span>
        </div>

        {/* Fields */}
        <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <Row label="NAME">
            <span className="text-[12px] text-white/65 font-mono">{user?.email?.split("@")[0] ?? "—"}</span>
            <button className="ml-2 text-[10px] font-mono uppercase tracking-wider transition-colors text-white/30 hover:text-white/60">Edit</button>
          </Row>
          <Row label="EMAIL">
            <span className="text-[12px] text-white/65 font-mono">{maskEmail(user?.email)}</span>
          </Row>
          <Row label="ID">
            <span className="text-[11px] text-white/40 font-mono">{shortId(user?.id)}</span>
            <button onClick={onCopyId} className="ml-1.5 text-white/20 hover:text-white/45 transition-colors" title="Copy ID">
              <Copy className="size-3" />
            </button>
            {copied && <span className="ml-1 text-[10px] text-emerald-400/80 font-mono">Copied!</span>}
          </Row>
          <Row label="SINCE" last>
            <span className="text-[12px] text-white/65 font-mono">{sinceDate(user?.created_at)}</span>
          </Row>
        </div>
      </div>

      {/* SIGN-IN METHODS */}
      <div>
        <SectionLabel>Sign-in Methods</SectionLabel>
        <p className="text-[11px] text-white/25 mb-3">Add another way to sign in to this account</p>
        <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <SignInRow icon="G" label="Google" connected />
          <SignInRow icon="@" label={`Email  ${user?.email ?? ""}`} connected last />
        </div>
      </div>

      {/* LANGUAGE */}
      <div>
        <SectionLabel>Language</SectionLabel>
        <div className="flex items-center justify-between px-4 py-2.5 rounded-md" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25">Display Language</span>
          <div className="flex items-center gap-1.5 text-[12px] text-white/55">
            English
            <span className="text-white/20 text-[10px]">▾</span>
          </div>
        </div>
      </div>

      {/* CONNECTED ACCOUNTS */}
      <div>
        <SectionLabel>Connected Accounts</SectionLabel>
        <div className="rounded-md overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <ConnectedRow icon="🎮" label="Discord" />
          <ConnectedRow icon="✈" label="Telegram" action="Log in with Telegram" last />
        </div>
      </div>

      {/* Logout */}
      <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => { onClose(); onLogout(); }}
          className="px-4 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-colors"
          style={{ border: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.05)", color: "rgba(252,165,165,0.65)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(252,165,165,0.9)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(252,165,165,0.65)"; }}
        >
          Log out
        </button>
      </div>

    </div>
  );
}

/* ── Shared sub-components ───────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.22)" }}>
      {children}
    </div>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{
        background: "rgba(255,255,255,0.015)",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function SignInRow({ icon, label, connected, last }: { icon: string; label: string; connected?: boolean; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{
        background: "rgba(255,255,255,0.015)",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="size-1.5 rounded-full" style={{ background: connected ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.2)" }} />
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {icon}
        </div>
        <span className="text-[12px] font-mono" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      </div>
      {connected && (
        <button className="text-[10px] font-mono uppercase tracking-wider transition-colors" style={{ color: "rgba(248,113,113,0.5)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.9)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.5)"; }}
        >
          Unlink
        </button>
      )}
    </div>
  );
}

function ConnectedRow({ icon, label, action, last }: { icon: string; label: string; action?: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{
        background: "rgba(255,255,255,0.015)",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="size-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
        <span className="text-sm">{icon}</span>
        <span className="text-[12px] font-mono" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      </div>
      <button
        className="text-[10px] font-mono uppercase tracking-wider transition-colors px-2.5 py-1 rounded"
        style={action ? { background: "rgba(14,165,233,0.12)", color: "rgba(125,211,252,0.8)", border: "1px solid rgba(14,165,233,0.2)" } : { color: "rgba(255,255,255,0.35)" }}
      >
        {action ?? "Connect"}
      </button>
    </div>
  );
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-[12px] font-mono" style={{ color: "rgba(255,255,255,0.18)" }}>
      {label} — coming soon
    </div>
  );
}
