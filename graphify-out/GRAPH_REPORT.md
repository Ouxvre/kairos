# Graph Report - kairos  (2026-08-27)

## Corpus Check
- 106 files · ~142,302 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 715 nodes · 933 edges · 56 communities (46 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `136bda5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- OpenSpec CLI
- devDependencies
- dependencies
- Kairos Platform (PRD Product Definition)
- pair-context.tsx
- app/layout.tsx
- instructions
- .opencode/opencode.json
- graphify.js
- SIL Open Font License 1.1
- cn
- Concept: generic document/file glyph - 16x16 monochrome (#666) page with folded top-right corner and horizontal text lines
- Next.js create-next-app default static assets (vercel.svg, next.svg, window.svg, etc.)
- eslint.config.mjs
- next.config.ts
- spec-driven Workflow Schema
- postcss.config.mjs
- globe.svg - 16x16 gray (#666) globe wireframe icon (standard create-next-app boilerplate asset)
- swr.ts
- app/page.tsx
- Next.js Logo (SVG wordmark, black fill)
- workspace.tsx
- strategy-lab/page.tsx
- components.json
- BubbleScene
- shadcn/ui
- Commands
- profile-modal.tsx
- Customization & Theming
- Component Composition
- Styling & Customization
- Design: Freqtrade Integration & Error Handling
- (dashboard)/portfolio/page.tsx
- Tools
- design.md
- Global Constraints
- Registry Authoring and Addresses
- Base vs Radix
- Chat & Messaging
- Forms & Inputs
- GO LIVE — Membuka Registrasi untuk Semua Orang
- proposal.md
- ADDED Requirements
- ADDED Requirements
- ADDED Requirements
- tasks.md
- Icons
- freemium-tiered-access/spec.md
- portfolio-pnl-history-sync/spec.md
- backtest/route.ts
- vibe-trading/[...action]/route.ts
- chat/route.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 17 edges
2. `compilerOptions` - 16 edges
3. `StrategyLabPage()` - 14 edges
4. `usePair()` - 14 edges
5. `Component Composition` - 13 edges
6. `Styling & Customization` - 13 edges
7. `OpenSpec CLI` - 13 edges
8. `BubbleScene` - 12 edges
9. `shadcn/ui` - 12 edges
10. `getSupabase()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Agent Rules Block` --conceptually_related_to--> `OpenSpec CLI`  [AMBIGUOUS]
  AGENTS.md → .opencode/commands/opsx-apply.md
- `KAIROS Platform Overview (README)` --semantically_similar_to--> `Kairos Platform (PRD Product Definition)`  [INFERRED] [semantically similar]
  README.md → docs/PRD.md
- `opsx-apply Command` --semantically_similar_to--> `openspec-apply-change Skill`  [INFERRED] [semantically similar]
  .opencode/commands/opsx-apply.md → .opencode/skills/openspec-apply-change/SKILL.md
- `opsx-archive Command` --semantically_similar_to--> `openspec-archive-change Skill`  [INFERRED] [semantically similar]
  .opencode/commands/opsx-archive.md → .opencode/skills/openspec-archive-change/SKILL.md
- `opsx-explore Command` --semantically_similar_to--> `openspec-explore Skill`  [INFERRED] [semantically similar]
  .opencode/commands/opsx-explore.md → .opencode/skills/openspec-explore/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Kairos Core Feature Set** — docs_prd_dashboard, docs_prd_freqtrade, docs_prd_supabase_auth, docs_prd_binance_websocket, docs_prd_news_sentiment [EXTRACTED 1.00]
- **OFL-Licensed Bundled Web Fonts** — src_app_fonts_gfs_didot_gfs_didot, src_app_fonts_jetbrains_mono_jetbrains_mono, src_app_fonts_jetbrains_mono_ofl_sil_open_font_license [EXTRACTED 1.00]
- **OpenSpec Change Lifecycle (explore -> propose -> apply -> update -> sync -> archive)** — _opencode_commands_opsx_explore_workflow, _opencode_commands_opsx_propose_workflow, _opencode_commands_opsx_apply_workflow, _opencode_commands_opsx_update_workflow, _opencode_commands_opsx_sync_workflow, _opencode_commands_opsx_archive_workflow [EXTRACTED 1.00]

## Communities (56 total, 10 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 1 - "OpenSpec CLI"
Cohesion: 0.21
Nodes (19): OpenSpec CLI, opsx-apply Command, opsx-archive Command, opsx-explore Command, opsx-propose Command, opsx-sync Command, opsx-update Command, Fluid Workflow Model (+11 more)

### Community 2 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, shadcn, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (33): class-variance-authority, clsx, lenis, lightweight-charts, lucide-react, next, dependencies, class-variance-authority (+25 more)

### Community 4 - "Kairos Platform (PRD Product Definition)"
Cohesion: 0.24
Nodes (12): Binance WebSocket Market Data, Real-Time Dashboard, Dry-Run Paper Trading Mode, Freqtrade REST API Integration, Kairos Platform (PRD Product Definition), lightweight-charts Charting, AI News Sentiment Analysis, Supabase Authentication & User Data (+4 more)

### Community 5 - "pair-context.tsx"
Cohesion: 0.07
Nodes (48): LiveTicker(), Tick, DockBar(), Tick, useClockUTC7(), useDockTicks(), DEFAULT_PAIRS, loadActive() (+40 more)

### Community 6 - "app/layout.tsx"
Cohesion: 0.33
Nodes (4): gfsDidot, inter, jetbrainsMono, metadata

### Community 7 - "instructions"
Cohesion: 0.40
Nodes (4): instructions, $schema, docs/PRD.md, README.md

### Community 8 - ".opencode/opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 10 - "SIL Open Font License 1.1"
Cohesion: 0.67
Nodes (3): GFS Didot Font (OFL), JetBrains Mono Variable Font, SIL Open Font License 1.1

### Community 11 - "cn"
Cohesion: 0.07
Nodes (38): LoginPage(), handleSubmit(), RegisterPage(), handleSubmit(), BOTTOM_TABS, BottomTab, calendarCells(), CalendarMetric (+30 more)

### Community 19 - "swr.ts"
Cohesion: 0.11
Nodes (29): dispatch(), dynamic, GET(), json(), POST(), Action, ACTIONS, BotPage() (+21 more)

### Community 20 - "app/page.tsx"
Cohesion: 0.10
Nodes (16): FeaturePanel(), FEATURES, Footer(), GrainCanvas(), Hero(), Nav(), HeroVideo(), CARDS (+8 more)

### Community 22 - "workspace.tsx"
Cohesion: 0.10
Nodes (25): PanelFrame(), PanelFrameProps, AccountSummary(), PositionsPanel(), TABS, PickerMenu(), PickerMenuProps, getTool() (+17 more)

### Community 23 - "strategy-lab/page.tsx"
Cohesion: 0.09
Nodes (20): BacktestParams, ChatSession, EquityPoint, Factor, groupSessions(), loadActiveId(), loadSessions(), Message (+12 more)

### Community 24 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 25 - "BubbleScene"
Cohesion: 0.18
Nodes (9): BubbleBurst(), BubbleBurstProps, BubbleScene, clamp(), Config, DEFAULTS, makeEaseFn(), Phase (+1 more)

### Community 26 - "shadcn/ui"
Cohesion: 0.11
Nodes (19): Chat & Messaging → [chat.md](./rules/chat.md), CLI, Component Docs, Examples, and Usage, Component Selection, Component Structure → [composition.md](./rules/composition.md), Critical Rules, Current Project Context, Detailed References (+11 more)

### Community 27 - "Commands"
Cohesion: 0.12
Nodes (17): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, Contents, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode (+9 more)

### Community 28 - "profile-modal.tsx"
Cohesion: 0.15
Nodes (10): GeneralSection(), maskEmail(), NAV_ITEMS, ProfileModal(), ProfileModalProps, Section, shortId(), sinceDate() (+2 more)

### Community 29 - "Customization & Theming"
Cohesion: 0.14
Nodes (14): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates (+6 more)

### Community 30 - "Component Composition"
Cohesion: 0.15
Nodes (13): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Choosing between overlay components, Component Composition, Contents, Dialog, Sheet, and Drawer always need a Title (+5 more)

### Community 31 - "Styling & Customization"
Cohesion: 0.15
Nodes (13): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No manual z-index on overlay components, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal (+5 more)

### Community 32 - "Design: Freqtrade Integration & Error Handling"
Cohesion: 0.15
Nodes (12): 1. API route wrapper — `lib/freqtrade.ts`, 2. Client data layer — `lib/swr.ts`, 3. Fallback UI — `<BotOfflineFallback />`, 4. Credentials schema (hybrid), Architecture, Components, Decisions (approved), Design: Freqtrade Integration & Error Handling (+4 more)

### Community 33 - "(dashboard)/portfolio/page.tsx"
Cohesion: 0.18
Nodes (10): BOTTOM_TABS, BottomTab, CalendarMetric, CalendarView, DAY_LABELS, getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES (+2 more)

### Community 34 - "Tools"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 35 - "design.md"
Cohesion: 0.17
Nodes (11): 1. Dual-Engine Architecture (Vibe-Trading + Freqtrade), 2. Strategy Code Generation & Storage, 3. Freemium Paywall, 4. PnL Sync: Freqtrade REST API Polling vs WebSocket, 5. Database Schema: Supabase vs Local SQLite, Context, Decisions, Goals / Non-Goals (+3 more)

### Community 36 - "Global Constraints"
Cohesion: 0.18
Nodes (10): Freqtrade Integration & Error Handling — Implementation Plan, Global Constraints, Self-Review Notes, Task 1: Remove static export + env scaffolding, Task 2: Freqtrade proxy lib + catch-all API route, Task 3: SWR client layer, Task 4: Offline fallback component, Task 5: Bot control page (+2 more)

### Community 38 - "Registry Authoring and Addresses"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 39 - "Base vs Radix"
Cohesion: 0.22
Nodes (9): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Select — multiple selection and object values (base only), Slider (+1 more)

### Community 40 - "Chat & Messaging"
Cohesion: 0.22
Nodes (9): Attachments use Attachment, Chat & Messaging, Contents, Escape hatch: the scroller hooks, Message rows use Message, Message surfaces use Bubble, Scrollable threads use MessageScroller, Streaming, anchoring, and jump-to-latest are built in (+1 more)

### Community 41 - "Forms & Inputs"
Cohesion: 0.25
Nodes (8): Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup

### Community 42 - "GO LIVE — Membuka Registrasi untuk Semua Orang"
Cohesion: 0.25
Nodes (7): GO LIVE — Membuka Registrasi untuk Semua Orang, Langkah 1 — Migrasi SQL `open_registration`, Langkah 2 — Landing page, Langkah 3 — Verifikasi, Langkah 4 — Checklist manual (non-kode), Latar belakang arsitektur gate (kondisi SEBELUM go live), Rollback (kalau perlu tutup keran lagi)

### Community 43 - "proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 44 - "ADDED Requirements"
Cohesion: 0.29
Nodes (6): ADDED Requirements, Purpose, Requirement: Code Validation, Requirement: Strategy Code Generation, Scenario: Invalid strategy logic detected, Scenario: User requests strategy export

### Community 45 - "ADDED Requirements"
Cohesion: 0.29
Nodes (6): ADDED Requirements, Purpose, Requirement: Automatic Strategy Storage, Requirement: Freqtrade Hot-Reload Trigger, Scenario: Successful strategy deployment, Scenario: User deploys strategy

### Community 46 - "ADDED Requirements"
Cohesion: 0.29
Nodes (6): ADDED Requirements, Purpose, Requirement: AI Strategy Chat Interface, Requirement: Automated Backtest Execution, Scenario: User requests strategy advice, Scenario: User triggers strategy backtest

### Community 47 - "tasks.md"
Cohesion: 0.29
Nodes (6): 1. Update PRD Documentation, 2. Database Schema Additions (Supabase), 3. UI Components (Strategy Lab & Dashboard), 4. Backend Integration (Freqtrade API), 5. Portfolio PnL Sync, 6. Verification & Testing

### Community 48 - "Icons"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 49 - "freemium-tiered-access/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: Tier-Based Strategy Restriction, Scenario: Free tier user attempts 1-click deploy

### Community 50 - "portfolio-pnl-history-sync/spec.md"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Purpose, Requirement: Real-time PnL Tracking, Scenario: User opens dashboard

### Community 51 - "backtest/route.ts"
Cohesion: 0.40
Nodes (3): dynamic, GeminiResult, POST()

### Community 52 - "vibe-trading/[...action]/route.ts"
Cohesion: 0.67
Nodes (3): dynamic, json(), POST()

## Ambiguous Edges - Review These
- `OpenSpec CLI` → `Next.js Agent Rules Block`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **350 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `style`, `rsc` (+345 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `OpenSpec CLI` and `Next.js Agent Rules Block`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `shadcn/ui` connect `shadcn/ui` to `SKILL.md`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _350 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `pair-context.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07175141242937853 - nodes in this community are weakly interconnected._