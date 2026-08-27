# Graph Report - kairos  (2026-08-24)

## Corpus Check
- Corpus is ~23,584 words - fits in a single context window. You may not need a graph.

## Summary
- 134 nodes · 140 edges · 22 communities (11 shown, 11 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 1% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.92)
- Token cost: 49,250 input · 9,700 output

## Community Hubs (Navigation)
- TypeScript Compiler Options
- OpenSpec Workflow Tooling
- Lint and Type Dev Dependencies
- Next.js Core Dependencies
- Kairos Product Vision
- TypeScript Path Patterns
- Root Layout and Fonts
- OpenCode Agent Instructions
- Graphify Plugin Registration
- Graphify Plugin Script
- Font Licensing OFL
- Next.js Agent Rules Docs
- Boilerplate File Icon
- Boilerplate Window Icon
- ESLint Flat Config
- Next.js Config
- OpenSpec Project Schema
- PostCSS Config
- Public Asset Serving Convention
- Vercel Logomark Asset
- Next.js Logo Asset

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `OpenSpec CLI` - 13 edges
3. `include` - 7 edges
4. `Kairos Platform (PRD Product Definition)` - 7 edges
5. `opsx-apply Command` - 6 edges
6. `openspec-apply-change Skill` - 6 edges
7. `scripts` - 5 edges
8. `opsx-archive Command` - 5 edges
9. `openspec-archive-change Skill` - 5 edges
10. `openspec-sync-specs Skill` - 5 edges

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
- **OpenSpec Change Lifecycle (explore -> propose -> apply -> update -> sync -> archive)** — _opencode_commands_opsx_explore_workflow, _opencode_commands_opsx_propose_workflow, _opencode_commands_opsx_apply_workflow, _opencode_commands_opsx_update_workflow, _opencode_commands_opsx_sync_workflow, _opencode_commands_opsx_archive_workflow [EXTRACTED 1.00]
- **Kairos Core Feature Set** — docs_prd_dashboard, docs_prd_freqtrade, docs_prd_supabase_auth, docs_prd_binance_websocket, docs_prd_news_sentiment [EXTRACTED 1.00]
- **OFL-Licensed Bundled Web Fonts** — src_app_fonts_gfs_didot_gfs_didot, src_app_fonts_jetbrains_mono_jetbrains_mono, src_app_fonts_jetbrains_mono_ofl_sil_open_font_license [EXTRACTED 1.00]

## Communities (22 total, 11 thin omitted)

### Community 0 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 1 - "OpenSpec Workflow Tooling"
Cohesion: 0.24
Nodes (18): OpenSpec CLI, opsx-apply Command, opsx-archive Command, opsx-explore Command, opsx-propose Command, opsx-sync Command, opsx-update Command, Fluid Workflow Model (+10 more)

### Community 2 - "Lint and Type Dev Dependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 3 - "Next.js Core Dependencies"
Cohesion: 0.12
Nodes (15): next, dependencies, next, react, react-dom, name, private, scripts (+7 more)

### Community 4 - "Kairos Product Vision"
Cohesion: 0.24
Nodes (12): Binance WebSocket Market Data, Real-Time Dashboard, Dry-Run Paper Trading Mode, Freqtrade REST API Integration, Kairos Platform (PRD Product Definition), lightweight-charts Charting, AI News Sentiment Analysis, Supabase Authentication & User Data (+4 more)

### Community 5 - "TypeScript Path Patterns"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 6 - "Root Layout and Fonts"
Cohesion: 0.33
Nodes (4): gfsDidot, inter, jetbrainsMono, metadata

### Community 7 - "OpenCode Agent Instructions"
Cohesion: 0.40
Nodes (4): instructions, $schema, docs/PRD.md, README.md

### Community 8 - "Graphify Plugin Registration"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 10 - "Font Licensing OFL"
Cohesion: 0.67
Nodes (3): GFS Didot Font (OFL), JetBrains Mono Variable Font, SIL Open Font License 1.1

## Ambiguous Edges - Review These
- `OpenSpec CLI` → `Next.js Agent Rules Block`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **68 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `eslintConfig`, `nextConfig`, `$schema` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `OpenSpec CLI` and `Next.js Agent Rules Block`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `devDependencies` connect `Lint and Type Dev Dependencies` to `Next.js Core Dependencies`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `TypeScript Compiler Options` to `TypeScript Path Patterns`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `eslintConfig` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Compiler Options` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Lint and Type Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Next.js Core Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._