# SignalForge Prototype

Premium, CEO-ready prototype for an AI fundamental analyst. Includes interactive report sections, valuation models, and export flows.

## Quick start
1) Create `.env` from `.env.example` and add your Financial Modeling Prep API key.
   - Set `SEC_USER_AGENT` to your email (SEC requires a contact).
2) Install dependencies:
   ```bash
   npm install
   ```
3) Start the server:
   ```bash
   npm start
   ```
4) Open `http://localhost:3001`.

## What works
- Enter any public company symbol or name and the UI updates.
- Live data fields use Financial Modeling Prep API (profile, quote, metrics, cash flow).
- DCF valuation is computed from public cash flow statements.
- Exports: CSV (Excel), PPTX (if browser can load PptxGenJS), and printable PDF.

## Notes
- If the API is unavailable, the UI falls back to premium demo data.
- PPTX export uses a CDN-loaded library; make sure you have internet access when testing.
