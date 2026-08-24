# Kairos — AI-Powered Crypto Trading Platform Spec

## Problem Statement

A crypto trader wants a centralized, premium web platform to automate crypto trading using an AI-powered bot, monitor live market data, and stay informed with real-time news enhanced by AI sentiment analysis — all from a single dashboard. Existing solutions either require deep technical knowledge (running Freqtrade CLI alone), have poor UX (FreqUI is functional but basic), or charge exorbitant fees (commercial trading platforms). The user needs a personal-first platform that can eventually scale to a subscription-based SaaS.

## Solution

Build **Kairos** — a Next.js web application that serves as a premium control panel and dashboard wrapping around Freqtrade (an open-source Python crypto trading bot). The platform provides:

- A stunning landing page that communicates value and converts visitors to users
- Supabase-powered authentication for user management
- A real-time dashboard showing portfolio stats, bot status, live prices, and news
- Full control over a Freqtrade bot instance (start/stop, view trades, monitor P&L) via its REST API
- Live crypto market data streamed via Binance WebSocket
- A news aggregator with AI-powered sentiment analysis (bullish/bearish/neutral) using LLM APIs

The initial deployment targets **personal use** on localhost/VPS with a single Freqtrade instance in **dry-run (paper trading) mode** against Binance Testnet. Public launch happens only after the platform is fully validated.

## User Stories

### Landing Page & Branding

1. As a visitor, I want to see a visually stunning landing page with dark crypto-themed design, so that I immediately understand this is a premium trading platform.
2. As a visitor, I want to see a scrolling crypto price ticker on the landing page, so that the site feels alive and connected to the market.
3. As a visitor, I want to see clearly presented feature cards (AI Trading, Live Market, News Analysis, Portfolio), so that I understand what the platform offers before signing up.
4. As a visitor, I want to see a "How It Works" section explaining the platform flow, so that I understand the onboarding process.
5. As a visitor, I want a prominent "Start Trading" call-to-action button, so that I can easily navigate to the registration/login page.
6. As a visitor, I want the landing page to be fully responsive on mobile and desktop, so that I can access it from any device.

### Authentication

7. As a user, I want to register with email and password, so that I can create my account.
8. As a user, I want to log in with email and password, so that I can access my dashboard.
9. As a user, I want to be redirected to the login page if I try to access the dashboard without being authenticated, so that the platform is secure.
10. As a logged-in user, I want to log out from the dashboard, so that my session is ended securely.
11. As a user, I want the auth pages to have a premium design consistent with the landing page, so that the experience feels cohesive.

### Dashboard

12. As a trader, I want to see an overview dashboard as my home screen, so that I can quickly assess my trading status at a glance.
13. As a trader, I want to see stat cards showing total balance, daily P&L, win rate, and number of open trades, so that I understand my current performance.
14. As a trader, I want a collapsible sidebar navigation with links to Dashboard, Bot, Trades, Market, and News sections, so that I can navigate the platform efficiently.
15. As a trader, I want a top bar showing my user info, a bot status indicator (running/stopped), and a news ticker, so that critical info is always visible.
16. As a trader, I want the dashboard to use a dark theme with glassmorphism effects, so that the interface feels modern and premium.

### AI Trading Bot (Freqtrade)

17. As a trader, I want to see the current bot status (running/stopped/error) on the dashboard, so that I know if my bot is actively trading.
18. As a trader, I want to start the bot from the web dashboard, so that I don't need to use a terminal.
19. As a trader, I want to stop the bot from the web dashboard, so that I can pause trading when needed.
20. As a trader, I want to reload the bot configuration from the dashboard, so that strategy changes take effect without restarting.
21. As a trader, I want to see a list of currently open trades with pair, entry price, current price, and unrealized P&L, so that I can monitor active positions.
22. As a trader, I want to see a history of closed trades with entry/exit details, profit/loss, and duration, so that I can review past performance.
23. As a trader, I want to force-exit a specific trade from the dashboard, so that I can manually close a position if needed.
24. As a trader, I want to see cumulative profit charts (daily/weekly/monthly), so that I can visualize performance trends.
25. As a trader, I want to see performance stats per trading pair, so that I know which pairs are most profitable.
26. As a trader, I want the bot to run in dry-run (paper trading) mode by default, so that no real money is at risk during testing.

### Market Data

27. As a trader, I want to see real-time crypto prices (BTC, ETH, and other major coins) updating live on my dashboard, so that I stay informed about market movements.
28. As a trader, I want to see a candlestick or line chart for any trading pair, so that I can do basic visual analysis.
29. As a trader, I want to select different trading pairs from a dropdown, so that I can view data for specific assets.
30. As a trader, I want to see 24h change percentage with color coding (green/red), so that I can quickly identify trending coins.
31. As a trader, I want market data to update via WebSocket (not polling), so that prices are as real-time as possible with minimal latency.

### News & AI Sentiment

32. As a trader, I want to see a feed of the latest crypto news articles, so that I stay informed about market-moving events.
33. As a trader, I want each news article to display a sentiment badge (Bullish/Bearish/Neutral), so that I can quickly gauge market sentiment.
34. As a trader, I want the sentiment analysis to be powered by an LLM (Claude or GPT), so that the analysis is intelligent and contextual.
35. As a trader, I want news to be cached in the database, so that the page loads fast and doesn't hit API rate limits.
36. As a trader, I want a market sentiment overview widget on the dashboard, so that I can see the overall mood at a glance.
37. As a trader, I want a breaking news ticker in the top bar, so that urgent market news catches my attention.

## Implementation Decisions

### Architecture

- **Two-service architecture**: Next.js web app (Kairos) communicates with Freqtrade (Python) via REST API. They are completely decoupled.
- **Next.js API routes act as proxies** to the Freqtrade API, ensuring Freqtrade credentials (username/password) never reach the browser client.
- **Supabase** handles all user-facing data: authentication, user profiles, news article cache, and platform settings. Freqtrade maintains its own SQLite database for trade data.

### Trading Bot (Freqtrade)

- Freqtrade runs as a Docker container with the REST API server enabled (`api_server.enabled: true`).
- Initial configuration uses **dry-run mode** against **Binance Testnet** — no real money involved.
- Strategy uses **Freqtrade's built-in sample strategies** initially; custom strategies come later.
- CORS is configured on Freqtrade to accept requests from the Next.js dev server origin.
- Authentication to Freqtrade API uses username/password, with JWT tokens managed server-side in Next.js API routes.

### Market Data

- **Binance WebSocket API** streams real-time price data directly to the browser (public endpoint, no API key needed for market data).
- **lightweight-charts** (TradingView's open-source library) renders candlestick and line charts.
- Initial REST call fetches current prices; WebSocket maintains live updates thereafter.

### News & Sentiment

- External news API (likely CryptoPanic, final choice TBD) provides raw news articles.
- Articles are cached in Supabase PostgreSQL to avoid rate limits and enable historical browsing.
- LLM API (Claude or OpenAI, final choice TBD) performs sentiment analysis on article titles/summaries.
- Sentiment is computed asynchronously and stored alongside the article in the database.
- LLM is used **only for news analysis**, never for trade execution decisions.

### Frontend

- Next.js 16 with App Router (route groups for auth vs dashboard layouts)
- Tailwind CSS v4 (already configured in project)
- Dark theme as default with crypto-aesthetic design (gradients, glassmorphism, micro-animations)

### Database Schema (Supabase)

```sql
-- News articles cache with sentiment
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source TEXT,
  url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMPTZ,
  sentiment_score REAL,          -- -1.0 (bearish) to 1.0 (bullish)
  sentiment_label TEXT,          -- 'bullish' | 'bearish' | 'neutral'
  raw_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User preferences / settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  freqtrade_url TEXT DEFAULT 'http://localhost:8080',
  preferred_pairs TEXT[] DEFAULT '{BTC/USDT,ETH/USDT}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Freqtrade API Contract (Key Endpoints Used)

| Kairos Feature | Freqtrade Endpoint      | Method |
| -------------- | ----------------------- | ------ |
| Bot status     | `/api/v1/show_config`   | GET    |
| Start bot      | `/api/v1/start`         | POST   |
| Stop bot       | `/api/v1/stop`          | POST   |
| Reload config  | `/api/v1/reload_config` | POST   |
| Open trades    | `/api/v1/status`        | GET    |
| Trade history  | `/api/v1/trades`        | GET    |
| Force exit     | `/api/v1/forceexit`     | POST   |
| Profit summary | `/api/v1/profit`        | GET    |
| Daily profit   | `/api/v1/daily`         | GET    |
| Balance        | `/api/v1/balance`       | GET    |
| Performance    | `/api/v1/performance`   | GET    |
| Health check   | `/api/v1/ping`          | GET    |

## Testing Decisions

- **Test external behavior, not implementation details**: Tests should verify what the user sees and interacts with, not internal function calls or state management.
- **Browser-based visual verification** for all UI phases — confirm rendering, responsiveness, and animations by inspecting the running dev server.
- **Build verification** (`npm run build`) after each phase to ensure no TypeScript or build errors.
- **Lint verification** (`npm run lint`) to maintain code quality.
- **API integration tests**: Verify Next.js API routes correctly proxy to Freqtrade by running both services and testing the flow end-to-end.
- **Auth flow tests**: Manual verification that login/register/logout/route-protection all work correctly with Supabase.
- No unit test framework is being introduced initially — this is a solo project prioritizing shipping speed. Tests can be added when moving toward public launch.

## Out of Scope

- **Forex trading** — removed entirely; crypto only
- **Backtesting UI** — removed from the web platform (Freqtrade has built-in backtesting via CLI)
- **Live trading with real money** — only paper trading / dry-run for now
- **Custom strategy builder** — users cannot create strategies from the web UI; strategies are Python files managed directly in Freqtrade
- **Multi-user bot management** — one Freqtrade instance serves one user (the owner). Multi-tenant architecture is future work.
- **Mobile app** — web-only, though responsive design ensures mobile browser usability
- **Payment / subscription system** — no payment integration until public launch
- **Copy trading / social trading** — not in scope
- **Telegram bot integration** — Freqtrade supports it natively, but Kairos doesn't manage it
- **Legal / regulatory compliance** (OJK, Bappebti) — needs research before public launch
- **HTTPS / SSL** — development runs on HTTP; production deployment will handle SSL at the reverse proxy level

## Further Notes

- **Project name "Kairos"** comes from Greek, meaning "the opportune moment" — fitting for a trading platform.
- The current workspace (`d:\kairos\kairos`) already has a Next.js 16 project initialized with React 19, Tailwind CSS v4, and TypeScript. The codebase is currently the default create-next-app boilerplate.
- **Development phases** are intentionally sequential: Landing Page → Auth + Dashboard → Market Data → Bot Integration → News. Each phase produces a working, visually complete increment.
- **Docker Desktop** needs to be installed on the developer's Windows machine before Phase 4 (Freqtrade integration).
- **Supabase project** needs to be created (free tier) before Phase 2 (Auth).
- The developer is a **solo fullstack developer** who actively trades crypto, which informs the UX priorities and feature selection.
- **Security concern noted**: When moving to public launch, API key storage, Freqtrade credential management, and multi-tenant isolation will need thorough security review. This was flagged during the grilling session as a knowledge gap.
