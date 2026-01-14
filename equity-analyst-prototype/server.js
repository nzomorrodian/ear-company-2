const path = require('path');
const express = require('express');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const DEFAULT_DISCOUNT = Number(process.env.DCF_DISCOUNT_RATE || 0.09);
const DEFAULT_TERMINAL_GROWTH = Number(process.env.DCF_TERMINAL_GROWTH || 0.025);
const SEC_TICKER_URL = 'https://www.sec.gov/files/company_tickers.json';
const SEC_SUBMISSION_URL = 'https://data.sec.gov/submissions';
const SEC_USER_AGENT = process.env.SEC_USER_AGENT || 'SignalForge demo contact@example.com';

let secTickerCache = { ts: 0, data: null };

app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ ok: Boolean(API_KEY), provider: 'fmp' });
});

const ensureKey = (res) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'Missing FMP_API_KEY' });
    return false;
  }
  return true;
};

const fetchJson = async (url, headers = {}) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('API error');
  return response.json();
};

const getSecTickerMap = async () => {
  if (secTickerCache.data && Date.now() - secTickerCache.ts < 24 * 60 * 60 * 1000) {
    return secTickerCache.data;
  }
  const data = await fetchJson(SEC_TICKER_URL, { 'User-Agent': SEC_USER_AGENT });
  secTickerCache = { ts: Date.now(), data };
  return data;
};

const getCikForSymbol = async (symbol) => {
  const tickers = await getSecTickerMap();
  const entries = Object.values(tickers || {});
  const match = entries.find((item) => item?.ticker?.toLowerCase() === symbol.toLowerCase());
  if (!match?.cik_str) return null;
  return String(match.cik_str).padStart(10, '0');
};

const fetchRecentFilings = async (symbol) => {
  try {
    const cik = await getCikForSymbol(symbol);
    if (!cik) return [];
    const data = await fetchJson(`${SEC_SUBMISSION_URL}/CIK${cik}.json`, { 'User-Agent': SEC_USER_AGENT });
    const recent = data?.filings?.recent;
    if (!recent) return [];
    const results = [];
    for (let i = 0; i < Math.min(recent.form.length, 4); i += 1) {
      results.push({
        form: recent.form[i],
        date: recent.filingDate[i],
        accession: recent.accessionNumber[i]
      });
    }
    return results;
  } catch (error) {
    return [];
  }
};

app.get('/api/search', async (req, res) => {
  if (!ensureKey(res)) return;
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ error: 'Missing query' });
    return;
  }

  try {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}&limit=1&apikey=${API_KEY}`;
    const data = await fetchJson(url);
    const match = data && data[0] ? data[0] : null;
    res.json({ symbol: match?.symbol || '' });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/company', async (req, res) => {
  if (!ensureKey(res)) return;
  const { symbol } = req.query;
  if (!symbol) {
    res.status(400).json({ error: 'Missing symbol' });
    return;
  }

  try {
    const profileUrl = `${BASE_URL}/profile/${encodeURIComponent(symbol)}?apikey=${API_KEY}`;
    const metricsUrl = `${BASE_URL}/key-metrics-ttm/${encodeURIComponent(symbol)}?apikey=${API_KEY}`;
    const quoteUrl = `${BASE_URL}/quote/${encodeURIComponent(symbol)}?apikey=${API_KEY}`;
    const cashflowUrl = `${BASE_URL}/cash-flow-statement/${encodeURIComponent(symbol)}?limit=5&apikey=${API_KEY}`;

    const [profile, metrics, quote] = await Promise.all([
      fetchJson(profileUrl),
      fetchJson(metricsUrl),
      fetchJson(quoteUrl)
    ]);

    const profileItem = profile?.[0] || {};
    const metricsItem = metrics?.[0] || {};
    const quoteItem = quote?.[0] || {};
    let cashflow = [];
    try {
      cashflow = await fetchJson(cashflowUrl);
    } catch (error) {
      cashflow = [];
    }

    const marketCap = quoteItem.marketCap ? `$${(quoteItem.marketCap / 1e12).toFixed(2)}T` : '--';
    const revenue = metricsItem.revenuePerShareTTM && quoteItem.sharesOutstanding
      ? `$${((metricsItem.revenuePerShareTTM * quoteItem.sharesOutstanding) / 1e9).toFixed(1)}B`
      : '--';
    const grossMargin = metricsItem.grossProfitMarginTTM
      ? `${(metricsItem.grossProfitMarginTTM * 100).toFixed(0)}%`
      : '--';

    const fcfSeries = (cashflow || [])
      .map((row) => {
        const op = Number(row.operatingCashFlow);
        const capex = Number(row.capitalExpenditure);
        if (!Number.isFinite(op) || !Number.isFinite(capex)) return null;
        return op + capex;
      })
      .filter((value) => Number.isFinite(value));

    const latestFcf = fcfSeries[0];
    const olderFcf = fcfSeries[2];
    let growth = 0.08;
    if (Number.isFinite(latestFcf) && Number.isFinite(olderFcf) && olderFcf > 0) {
      const years = 2;
      growth = Math.pow(latestFcf / olderFcf, 1 / years) - 1;
    }
    growth = Math.max(0.02, Math.min(growth, 0.18));

    let dcfValue = null;
    let sharePrice = null;
    let forecast = null;
    if (Number.isFinite(latestFcf)) {
      const discount = DEFAULT_DISCOUNT;
      const terminalGrowth = DEFAULT_TERMINAL_GROWTH;
      const years = 5;
      const forecastRows = [];
      let fcf = latestFcf;
      let pvSum = 0;
      for (let i = 1; i <= years; i += 1) {
        fcf *= (1 + growth);
        const discounted = fcf / Math.pow(1 + discount, i);
        pvSum += discounted;
        forecastRows.push([`${new Date().getFullYear() + i}`, (fcf / 1e9).toFixed(1), '--', (fcf / 1e9).toFixed(1), `${Math.round(growth * 100)}%`]);
      }
      const terminalValue = (fcf * (1 + terminalGrowth)) / (discount - terminalGrowth);
      const discountedTerminal = terminalValue / Math.pow(1 + discount, years);
      dcfValue = pvSum + discountedTerminal;
      forecast = { base: forecastRows, bull: forecastRows, bear: forecastRows };
      if (Number.isFinite(quoteItem.sharesOutstanding) && quoteItem.sharesOutstanding > 0) {
        sharePrice = dcfValue / quoteItem.sharesOutstanding;
      }
    }

    const formatMoney = (value) => {
      if (!Number.isFinite(value)) return null;
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      return `$${value.toFixed(0)}`;
    };

    const filings = await fetchRecentFilings(symbol);

    res.json({
      symbol: quoteItem.symbol || symbol,
      name: profileItem.companyName || symbol,
      summary: profileItem.description || '',
      marketCap,
      revenue,
      grossMargin,
      valuation: {
        dcf: formatMoney(dcfValue),
        share: sharePrice ? `$${sharePrice.toFixed(2)}` : null,
        ev: metricsItem.enterpriseValueToEBITDATTM ? `${metricsItem.enterpriseValueToEBITDATTM.toFixed(2)}x` : null,
        cbc: null,
        note: dcfValue ? 'DCF uses public cash flow statements with a conservative terminal growth rate.' : 'DCF not available for this symbol.'
      },
      forecast,
      peers: [],
      filings,
      sources: ['Financial Modeling Prep', 'SEC EDGAR'],
      valuationInputs: {
        discount: `${(DEFAULT_DISCOUNT * 100).toFixed(1)}%`,
        terminal: `${(DEFAULT_TERMINAL_GROWTH * 100).toFixed(1)}%`,
        growth: `${Math.round(growth * 100)}%`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Company fetch failed' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`SignalForge server running on http://${HOST}:${PORT}`);
});
