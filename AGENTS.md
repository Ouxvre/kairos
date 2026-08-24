# Kairos — agent notes

Landing page (Phase 1) for an AI crypto-trading control panel. Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript. Product spec lives in `docs/PRD.md` (also wired via `opencode.json` instructions) — later phases (Supabase auth, Freqtrade proxy, market data, news) are planned, not built.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- Windows + PowerShell: `npm.ps1` is blocked by execution policy — use `npm.cmd` (or plain `npm` in cmd.exe), never `npm`.
- `npm.cmd run dev` / `build` / `start` / `lint`. No separate typecheck script — `build` runs `tsc`. Lint is bare `eslint` (flat config, `eslint.config.mjs`).
- No test framework by design (solo project, ship fast — see PRD). Verification = `build` + `lint` + visual pass.
- `npm run start` serves the last **build** — always `npm.cmd run build` before verifying prod behavior, otherwise you debug stale output.

## Structure

- `src/app/` — App Router. `layout.tsx` wires fonts + metadata + `<Analytics />` (Vercel). `globals.css` holds the whole design system, not just resets.
- `src/components/landing/` — all landing sections + animation primitives (client comps: `SmoothScroll` (Lenis), `ScrollFx`, `GrainCanvas` (three.js), `HeroVideo`).
- Fonts are **local** in `src/app/fonts/` (GFS Didot = `--font-serif`, JetBrains Mono = `--font-mono`), exposed via `@theme inline` in globals.css. Inter = `--font-sans` (Google).
- Hero media: `public/assets/video/kairos_hero.mp4` rendered as `<video autoplay muted loop playsinline>`. **Do not use an animated webp/img here** — a 5.8MB animated webp caused full-page compositor flicker (decode stalls); mp4 decodes off-thread and is smaller.

## Design system (globals.css)

- Everything scoped under `.kairos-web`; sizing uses fluid unit `--u = max(calc(100cqw / 2360), 0.58px)` (÷760 on mobile). Size type/spacing with `calc(N * var(--u))`, not px.
- Tokens: `--k-bg` (deep gold #a8862a), `--k-fg`, `--k-accent` (white), `--k-panel-*` (inverted paper panel), `--k-up/--k-down` (green/red).
- Tailwind v4 gotcha: `text-[calc(...)]` is ambiguous and silently generates **no CSS** — write `text-[length:calc(...)]`.
- Unlayered custom CSS (`.ks-*`) beats Tailwind utilities (utilities live in `@layer`). Where a bare element selector would lose (e.g. `.kairos-web a` vs `.ks-btn-solid`), bump specificity (`a.ks-btn-solid`), don't reach for `!important`.

## Animation architecture (do not reimplement with a library)

- No GSAP/Framer Motion — motion = Lenis + rAF-updated CSS custom properties + one IntersectionObserver, all in `ScrollFx.tsx`.
- Reveals: `[data-reveal]` + `.is-inview`. Above-fold elements are revealed **synchronously at mount**; IO (rootMargin `-10%` bottom) handles below-fold only — IO alone intermittently misses elements near its boundary.
- Parallax/curtain/footer-fade are CSS vars (`--py-img`, `--py`/`--clip-bottom`, `--ks-footer-opacity`) updated in one rAF-driven `update()` on scroll. Footer = `position: fixed` behind `<main class="mb-[100dvh]">` (Hermes-style reveal); `prefers-reduced-motion` short-circuits all of it.
- `GrainCanvas`: fullscreen noise shader. Its hash must stay precision-safe (no `sin`-based hashes — they degenerate into flickering stripes as `uTime` grows).

## Visual verification quirks (headless Chrome on this machine)

- Screenshot: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=<fresh-dir> --window-size=1600,1000 --screenshot=<out.png> --virtual-time-budget=10000 http://localhost:3000`. Fresh `--user-data-dir` per run avoids profile locks; writes can silently fail — check the file exists.
- Anchor URLs (`/#section`) and `--virtual-time-budget` race layout in headless — for scroll-state checks, drive CDP over `--remote-debugging-port` with a small Node script (Node ≥22 has global `WebSocket`), `window.scrollTo`, then `Page.captureScreenshot`.
- Full-page shots use a tall window (e.g. 1600×9000) — this inflates `dvh`/`vsq` units and mid-states of scroll animations, so "gaps"/clipped sections in such screenshots are often artifacts, not bugs. Compare brightness across timed captures to detect real flicker.

## PowerShell traps (this session's shell)

- Heredocs (`<<'EOF'`) don't work — pipe a here-string: `@'...'@ | command`.
- `Set-Content`/`Get-Content` without `-Encoding UTF8` corrupt non-ASCII (mangled ▶/◇ glyphs). Prefer the Write/Edit file tools for source files.
- In double-quoted strings, `$_.png` interpolates as a property access — use `${_}.png`.
- Chrome sometimes exits without writing `--screenshot` output; retry before diagnosing.
