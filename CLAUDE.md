# CLAUDE.md

## Project Overview

Multi-product innovation portfolio repository containing three independent prototypes:

1. **Ear Translation Device** (`/index.html`) — Real-time translation earpiece landing page with live speech-to-text demo
2. **SignalForge Equity Analyst** (`/equity-analyst-prototype/`) — AI fundamental analyst with DCF valuation, SEC filings, and export tools
3. **HomePilot AI Real Estate Agent** (`/ai-real-estate-agent/`) — AI home seller intake wizard with comps pricing

## Tech Stack

- **Language:** JavaScript (CommonJS, vanilla DOM)
- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla HTML/CSS/JS + Tailwind CSS (CDN)
- **Dependencies:** dotenv, express, node-fetch (shared across prototypes)
- **No build tools** — no webpack, TypeScript, or Babel

## Repository Structure

```
/                           # Root: Ear landing page (index.html)
/equity-analyst-prototype/  # SignalForge — port 3001
/ai-real-estate-agent/      # HomePilot — port 3000
/Italy Trip/                # Static photo site (GitHub Pages)
/docs/                      # Published Italy Trip pages
/.github/workflows/         # CI: publish-italy-trip.yml
```

Each prototype is self-contained with its own `package.json`, `server.js`, `app.js`, `index.html`, and `.env.example`.

## Running the Projects

### SignalForge (Equity Analyst)

```bash
cd equity-analyst-prototype
npm install
cp .env.example .env   # Set FMP_API_KEY
npm start              # http://localhost:3001
```

### HomePilot (Real Estate Agent)

```bash
cd ai-real-estate-agent
npm install
cp .env.example .env   # Set ESTATED_API_KEY
npm start              # http://localhost:3000
```

Both prototypes include demo/fallback data when API keys are not configured.

## Code Conventions

- **Style:** camelCase for variables/functions, UPPERCASE for constants
- **Functions:** Arrow functions with async/await for API calls
- **Architecture:** Single-file per concern (one HTML, one JS, one CSS per project)
- **Error handling:** try/catch in fetch wrappers with fallback demo data
- **State management:** Plain JavaScript objects (no framework)
- **UI pattern:** Direct DOM manipulation via `getElementById` / `querySelector`

## API Endpoints

### SignalForge Server (`equity-analyst-prototype/server.js`)

- `GET /api/health` — API status
- `GET /api/search?q=` — Company ticker search
- `GET /api/company?ticker=` — Profile + financials
- `GET /api/sec-analysis?ticker=` — SEC filing analysis
- `GET /api/web-report?ticker=` — Web research report

### HomePilot Server (`ai-real-estate-agent/server.js`)

- `GET /api/health` — Server status
- `GET /api/comps?address=` — Comparable property lookup

## Environment Variables

### SignalForge

| Variable | Description |
|----------|-------------|
| `FMP_API_KEY` | Financial Modeling Prep API key |
| `PORT` | Server port (default: 3001) |
| `SEC_USER_AGENT` | SEC EDGAR request identifier |
| `DCF_DISCOUNT_RATE` | DCF discount rate (default: 0.09) |
| `DCF_TERMINAL_GROWTH` | Terminal growth rate (default: 0.025) |

### HomePilot

| Variable | Description |
|----------|-------------|
| `ESTATED_API_KEY` | Estated property data API key |
| `PORT` | Server port (default: 3000) |

## Testing & Linting

No test framework or linter is currently configured. There are no automated tests.

## Key Notes

- Prototypes are independent — changes in one should not affect others
- Client-side export (CSV, PPTX, PDF) uses CDN-loaded libraries in the browser
- Backend servers are stateless API proxies with in-memory caching
- SEC API requests are rate-limited (140ms minimum between calls)
- `sec-sic-cache.json` is a committed cache file for SIC industry codes
- Never commit `.env` files — they contain API keys
