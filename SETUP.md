# KAIROS — Development Environment Setup Guide

This file contains complete instructions to set up the KAIROS trading platform development environment on a new machine. An AI assistant can read this file and execute all steps automatically.

---

## Prerequisites (Manual Install Required)

Before running automated setup, install these manually:

- **Node.js ≥22** — https://nodejs.org/
- **Git** — https://git-scm.com/
- **OpenCode CLI** — https://opencode.ai (installs to `~/.opencode/bin/opencode.exe`)
- **ffmpeg** (optional, for media conversion) — `winget install Gyan.FFmpeg`

---

## Automated Setup Steps

Run these commands in order after prerequisites are installed:

### 1. Clone Repository
```bash
git clone https://github.com/Ouxvre/kairos.git
cd kairos
```

### 2. Install Dependencies
```bash
npm.cmd install
```

### 3. Initialize CodeGraph Index
```bash
codegraph.cmd init
```

### 4. Install Cloudflare Skills (Global)
```bash
npx.cmd -y skills add cloudflare/skills --skill '*' --yes --global
```

### 5. Configure Cloudflare MCP Servers
Merge the following 5 Cloudflare MCP server entries into the `"mcp"` block of `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "servers": {
      "cloudflare-builds": { ... },
      "cloudflare-observability": { ... },
      "cloudflare-bindings": { ... },
      "cloudflare-docs": { ... },
      "cloudflare": { ... }
    }
  }
}
```
*Copy from existing machine or from: https://developers.cloudflare.com/agent-setup/prompt.md (OpenCode section)*

### 6. Authenticate Cloudflare MCP
```bash
& "$env:USERPROFILE\.opencode\bin\opencode.exe" mcp auth cloudflare
```
(Browser OAuth flow — complete authorization, then restart OpenCode)

### 7. Setup Environment Variables
```bash
copy .env.example .env.local
```
Then edit `.env.local` with all required values (see `.env.checklist.md`)

### 8. Verify Setup
```bash
npm.cmd run dev      # Start development server (http://localhost:3000)
npm.cmd run build    # Production build (outputs to ./out)
npm.cmd run lint     # Run ESLint
```

---

## Project Structure Overview

```
kairos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, register)
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── dashboard/     # Main dashboard pages
│   │   │   └── portfolio/     # Portfolio page
│   │   ├── api/               # API routes
│   │   │   ├── freqtrade/     # Freqtrade REST proxy
│   │   │   └── vibe-trading/  # AI Strategy Lab endpoints
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Design system (Tailwind v4)
│   ├── components/
│   │   ├── landing/           # Landing page sections
│   │   ├── dashboard/         # Dashboard components
│   │   └── auth/              # Auth components
│   └── lib/                   # Utilities & clients
├── public/assets/video/       # Hero video (kairos_hero.mp4)
├── .env.example               # Environment template
├── .env.local                 # Local environment (gitignored)
├── next.config.ts             # Next.js config (static export)
├── wrangler.jsonc             # Cloudflare Pages config
├── package.json
└── SETUP.md                   # This file
```

---

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `npm.cmd run dev` | Start dev server with Turbopack |
| `npm.cmd run build` | Build for production (static export to ./out) |
| `npm.cmd run start` | Serve last build (run build first!) |
| `npm.cmd run lint` | Run ESLint (flat config) |
| `npx.cmd wrangler pages deploy out --project-name kairos` | Deploy to Cloudflare Pages |

---

## Architecture Notes

- **Next.js 16** with App Router, React 19, Tailwind v4, TypeScript
- **Static Export** (`output: "export"`) for Cloudflare Pages hosting
- **Fonts**: Local GFS Didot (`--font-serif`), JetBrains Mono (`--font-mono`), Google Inter (`--font-sans`)
- **Animation**: Lenis smooth scroll + rAF CSS custom properties (no GSAP/Framer Motion)
- **Hero Media**: HTML5 `<video>` (mp4) — avoid animated WebP (compositor flicker)
- **Design System**: All scoped under `.kairos-web`, fluid unit `--u = max(calc(100cqw / 2360), 0.58px)`

---

## Phase Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Landing Page | ✅ Complete |
| 2 | Auth + Dashboard | ✅ Complete |
| 3 | Market Data | ✅ Complete |
| 4 | Freqtrade Integration | ✅ API proxy ready |
| 5 | Vibe-Trading AI Lab | ✅ Complete |
| 6 | News & Sentiment | Planned |
| 7 | Monetization | Planned |

---

## Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules package-lock.json
npm.cmd install
npm.cmd run build
```

### Port 3000 in Use
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Cloudflare Deploy Issues
- Ensure `npm.cmd run build` completes successfully first
- Check `out/` directory exists with `index.html`
- Verify `wrangler.jsonc` has correct `assets.directory`

### CodeGraph Not Indexing
```bash
codegraph.cmd init --force
```

---

## Important Files to Preserve (Do Not Commit)

- `.env.local` — Local secrets
- `.opencode/` — OpenCode config
- `~/.config/opencode/opencode.json` — MCP server config (per-machine)

---

## Support

- Project spec: `docs/PRD.md`
- Agent notes: `AGENTS.md`
- Cloudflare skills: `~/.agents/skills/cloudflare/`
- OpenCode config: `~/.config/opencode/opencode.json`