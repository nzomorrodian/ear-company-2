# HomePilot AI

AI real estate agent for home sellers. This repo is a front-end prototype that walks a seller through intake, pricing, listing, showings, offers, and closing.

## What is included
- Single-page web app with a guided intake flow
- Live comps/pricing endpoint (Estated) with a small backend proxy
- Integration placeholders for MLS, scheduling, and e-sign

## How to run
1) Create a `.env` file from `.env.example` and add your Estated API key.
2) Install dependencies:
   ```bash
   npm install
   ```
3) Start the local server:
   ```bash
   npm start
   ```
4) Open `http://localhost:3000` in your browser.

Note: The comps button uses `/api/comps` and needs the server running so your API key stays private.

## Assumptions (can change later)
- Web app first
- Flat fee pricing
- Real service integrations (MLS, comps providers, scheduling)

## Next steps
- Confirm the data providers for MLS and listing syndication
- Add authentication and seller dashboard
- Connect showing + e-sign integrations
- Add offer intake and document workflow
