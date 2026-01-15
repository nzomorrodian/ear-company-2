const path = require('path');
const express = require('express');
const fs = require('fs');
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
const SEC_ARCHIVES_BASE = 'https://www.sec.gov/Archives/edgar/data';
const SEC_XBRL_FACTS = 'https://data.sec.gov/api/xbrl/companyfacts';
const SEC_RATE_LIMIT_MS = Number(process.env.SEC_RATE_LIMIT_MS || 140);
const MAX_PEER_LOOKUPS = Number(process.env.MAX_PEER_LOOKUPS || 60);
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const SIC_CACHE_PATH = path.join(__dirname, 'sec-sic-cache.json');

let secTickerCache = { ts: 0, data: null };
let secSubmissionCache = new Map();
let sicCache = null;
let yahooCache = new Map();
let irCache = new Map();

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

const fetchSecJson = async (url) => fetchJson(url, { 'User-Agent': SEC_USER_AGENT });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchText = async (url, headers = {}) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('API error');
  return response.text();
};

const getSecTickerMap = async () => {
  if (secTickerCache.data && Date.now() - secTickerCache.ts < 24 * 60 * 60 * 1000) {
    return secTickerCache.data;
  }
  const data = await fetchSecJson(SEC_TICKER_URL);
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

const loadSicCache = () => {
  if (sicCache) return sicCache;
  try {
    const raw = fs.readFileSync(SIC_CACHE_PATH, 'utf-8');
    sicCache = JSON.parse(raw);
  } catch (error) {
    sicCache = { byCik: {}, bySic: {} };
  }
  return sicCache;
};

const saveSicCache = () => {
  if (!sicCache) return;
  fs.writeFileSync(SIC_CACHE_PATH, JSON.stringify(sicCache, null, 2));
};

const getSubmission = async (cik) => {
  if (secSubmissionCache.has(cik)) return secSubmissionCache.get(cik);
  const payload = await fetchSecJson(`${SEC_SUBMISSION_URL}/CIK${cik}.json`);
  secSubmissionCache.set(cik, payload);
  return payload;
};

const getSicForCik = async (cik, fallbackName, ticker) => {
  const cache = loadSicCache();
  if (cache.byCik[cik]) return cache.byCik[cik];
  const submission = await getSubmission(cik);
  const record = {
    cik,
    ticker: (submission?.tickers && submission.tickers[0]) || ticker || '',
    name: submission?.name || fallbackName || '',
    sic: submission?.sic || null,
    sicDescription: submission?.sicDescription || ''
  };
  cache.byCik[cik] = record;
  if (record.sic) {
    cache.bySic[record.sic] = cache.bySic[record.sic] || [];
    if (!cache.bySic[record.sic].find((item) => item.cik === record.cik)) {
      cache.bySic[record.sic].push({
        cik: record.cik,
        ticker: record.ticker,
        name: record.name
      });
    }
  }
  saveSicCache();
  return record;
};

const fetchRecentFilings = async (symbol) => {
  try {
    const cik = await getCikForSymbol(symbol);
    if (!cik) return [];
    const data = await fetchSecJson(`${SEC_SUBMISSION_URL}/CIK${cik}.json`);
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

const getFilingsByForm = (recent, formType, limit = 3) => {
  const results = [];
  if (!recent?.form?.length) return results;
  for (let i = 0; i < recent.form.length; i += 1) {
    if (recent.form[i] !== formType) continue;
    results.push({
      form: recent.form[i],
      date: recent.filingDate[i],
      accession: recent.accessionNumber[i],
      primaryDoc: recent.primaryDocument[i]
    });
    if (results.length >= limit) break;
  }
  return results;
};

const getFilingIndex = async (cik, accession) => {
  const acc = accession.replace(/-/g, '');
  const url = `${SEC_ARCHIVES_BASE}/${Number(cik)}/${acc}/index.json`;
  return fetchSecJson(url);
};

const collectExhibits = async (cik, filings) => {
  const exhibits = [];
  for (const filing of filings) {
    try {
      await sleep(SEC_RATE_LIMIT_MS);
      const index = await getFilingIndex(cik, filing.accession);
      const items = index?.directory?.item || [];
      items.forEach((item) => {
        if (!item?.name) return;
        const desc = String(item?.description || '').toLowerCase();
        const isExhibit = String(item?.name || '').toLowerCase().includes('ex');
        if (!isExhibit) return;
        const isPresentation = desc.includes('presentation');
        const isTranscript = desc.includes('transcript');
        const label = isTranscript ? 'Transcript' : isPresentation ? 'Presentation' : 'Exhibit';
        exhibits.push({
          label,
          description: item.description || item.name,
          url: `${SEC_ARCHIVES_BASE}/${Number(cik)}/${filing.accession.replace(/-/g, '')}/${item.name}`
        });
      });
    } catch (error) {
      continue;
    }
  }
  return exhibits.slice(0, 8);
};

const pickFactSeries = (facts, tag, unit) => {
  const source = facts?.['us-gaap'] || facts;
  if (!source?.[tag]?.units) return [];
  const units = source[tag].units;
  const unitKey = unit || Object.keys(units)[0];
  if (!unitKey) return [];
  return units[unitKey] || [];
};

const pickLatest = (facts, tag, unit) => {
  const series = pickFactSeries(facts, tag, unit);
  if (!series.length) return null;
  const sorted = series.slice().sort((a, b) => new Date(b.end) - new Date(a.end));
  return sorted[0]?.val ?? null;
};

const isAnnualFrame = (frame) => Boolean(frame && /^(CY|FY)\\d{4}$/.test(frame));

const buildYearSeries = (facts, tag, unit, yearsCount = 5) => {
  const series = pickFactSeries(facts, tag, unit);
  const filtered = series.filter((item) => item?.fy);
  const byYear = new Map();
  filtered.forEach((item) => {
    const year = String(item.fy);
    const prev = byYear.get(year);
    const isBetter = !prev
      || (isAnnualFrame(item.frame) && !isAnnualFrame(prev.frame))
      || new Date(item.end) > new Date(prev.end);
    if (isBetter) {
      byYear.set(year, item);
    }
  });
  const years = Array.from(byYear.keys()).sort();
  const selected = years.slice(-yearsCount).map((year) => ({ year, val: byYear.get(year).val }));
  return selected;
};

const toBillions = (val) => (Number.isFinite(val) ? val / 1e9 : null);

const formatNumber = (val) => {
  if (!Number.isFinite(val)) return null;
  return val.toFixed(1);
};

const formatPercent = (val) => {
  if (!Number.isFinite(val)) return null;
  return `${(val * 100).toFixed(1)}%`;
};

const buildFinancialsFromFacts = (facts) => {
  const revenueCandidates = [
    buildYearSeries(facts, 'RevenueFromContractWithCustomerExcludingAssessedTax', 'USD'),
    buildYearSeries(facts, 'Revenues', 'USD'),
    buildYearSeries(facts, 'SalesRevenueNet', 'USD')
  ];
  const revenue = revenueCandidates.reduce((best, series) => (series.length > best.length ? series : best), []);

  const gross = buildYearSeries(facts, 'GrossProfit', 'USD');
  const opIncome = buildYearSeries(facts, 'OperatingIncomeLoss', 'USD');
  const netIncome = buildYearSeries(facts, 'NetIncomeLoss', 'USD');
  const eps = buildYearSeries(facts, 'EarningsPerShareDiluted', 'USD/shares');

  const assets = buildYearSeries(facts, 'Assets', 'USD');
  const liabilities = buildYearSeries(facts, 'Liabilities', 'USD');
  const cash = buildYearSeries(facts, 'CashAndCashEquivalentsAtCarryingValue', 'USD');
  const debtLong = buildYearSeries(facts, 'LongTermDebtNoncurrent', 'USD');
  const debtCurrent = buildYearSeries(facts, 'DebtCurrent', 'USD');

  const ocf = buildYearSeries(facts, 'NetCashProvidedByUsedInOperatingActivities', 'USD');
  const capex = buildYearSeries(facts, 'PaymentsToAcquirePropertyPlantAndEquipment', 'USD');

  const years = revenue.map((item) => `FY${item.year}`);
  const headers = ['$ Billions', ...years];

  const byYear = (series) => years.map((yearLabel) => {
    const year = yearLabel.replace('FY', '');
    const found = series.find((item) => item.year === year);
    return found ? formatNumber(toBillions(found.val)) : '--';
  });

  const addDebt = years.map((yearLabel) => {
    const year = yearLabel.replace('FY', '');
    const long = debtLong.find((item) => item.year === year)?.val || 0;
    const current = debtCurrent.find((item) => item.year === year)?.val || 0;
    const total = long + current;
    return total ? formatNumber(toBillions(total)) : '--';
  });

  const fcfRaw = years.map((yearLabel) => {
    const year = yearLabel.replace('FY', '');
    const ocfVal = ocf.find((item) => item.year === year)?.val;
    const capexVal = capex.find((item) => item.year === year)?.val;
    if (!Number.isFinite(ocfVal) || !Number.isFinite(capexVal)) return null;
    return toBillions(ocfVal - Math.abs(capexVal));
  });
  const fcfSeries = fcfRaw.map((val) => (Number.isFinite(val) ? formatNumber(val) : '--'));

  return {
    headers,
    revenue,
    gross,
    opIncome,
    netIncome,
    eps,
    assets,
    liabilities,
    cash,
    debt: addDebt,
    ocf,
    capex,
    fcf: fcfSeries,
    fcfRaw
  };
};

const buildKpis = (financials) => {
  const headers = ['KPI', ...financials.headers.slice(1), '5Y CAGR'];
  const revenue = financials.revenue.map((item) => item.val);
  const first = revenue[0];
  const last = revenue[revenue.length - 1];
  const cagr = Number.isFinite(first) && Number.isFinite(last)
    ? Math.pow(last / first, 1 / Math.max(revenue.length - 1, 1)) - 1
    : null;
  const revenueRow = ['Revenue ($B)', ...financials.headers.slice(1).map((label) => {
    const year = label.replace('FY', '');
    const found = financials.revenue.find((item) => item.year === year);
    return found ? formatNumber(toBillions(found.val)) : '--';
  }), cagr ? formatPercent(cagr) : '--'];

  const marginRow = (label, numeratorSeries) => {
    const values = financials.headers.slice(1).map((yearLabel) => {
      const year = yearLabel.replace('FY', '');
      const rev = financials.revenue.find((item) => item.year === year)?.val;
      const num = numeratorSeries.find((item) => item.year === year)?.val;
      if (!Number.isFinite(rev) || !Number.isFinite(num)) return '--';
      return formatPercent(num / rev);
    });
    return [label, ...values, '--'];
  };

  const kpiRows = [
    revenueRow,
    marginRow('Gross Margin', financials.gross),
    marginRow('Operating Margin', financials.opIncome),
    marginRow('Net Margin', financials.netIncome),
    ['Free Cash Flow ($B)', ...financials.fcf, '--']
  ];

  return { headers, rows: kpiRows };
};

const estimateMarketData = (facts) => {
  const dei = facts?.dei || {};
  const usGaap = facts?.['us-gaap'] || {};
  const shares = pickLatest(dei, 'EntityCommonStockSharesOutstanding', 'shares')
    || pickLatest(usGaap, 'WeightedAverageNumberOfDilutedSharesOutstanding', 'shares');
  const publicFloat = pickLatest(dei, 'EntityPublicFloat', 'USD');
  const marketCap = pickLatest(dei, 'MarketCapitalization', 'USD')
    || pickLatest(dei, 'EntityMarketValueOfCommonStock', 'USD');
  const floatValue = Number.isFinite(publicFloat) ? publicFloat : Number.isFinite(marketCap) ? marketCap : null;
  if (Number.isFinite(shares) && Number.isFinite(floatValue) && shares > 0) {
    const price = floatValue / shares;
    return { price, marketCap: floatValue, shares };
  }
  return { price: null, marketCap: floatValue, shares: shares || null };
};

const fetchYahooQuote = async (symbol) => {
  const cacheKey = symbol.toUpperCase();
  const cached = yahooCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
  const url = `${YAHOO_QUOTE_URL}?symbols=${encodeURIComponent(cacheKey)}`;
  const payload = await fetchJson(url);
  const quote = payload?.quoteResponse?.result?.[0];
  const data = quote ? {
    price: quote.regularMarketPrice,
    time: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
    currency: quote.currency,
    marketCap: quote.marketCap
  } : null;
  yahooCache.set(cacheKey, { ts: Date.now(), data });
  return data;
};

const parseRssItems = (xml, limit = 5) => {
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of blocks.slice(0, limit)) {
    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1];
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    if (!title && !link) continue;
    items.push({
      title: title ? title.replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '',
      link: link ? link.replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '',
      pubDate: pubDate ? pubDate.trim() : ''
    });
  }
  return items;
};

const IR_SOURCES = {
  AAPL: { name: 'Apple Investor Relations', url: 'https://investor.apple.com', rss: 'https://investor.apple.com/rss' },
  BLK: { name: 'BlackRock Investor Relations', url: 'https://ir.blackrock.com', rss: 'https://ir.blackrock.com/rss' },
  CPRT: { name: 'Copart Investor Relations', url: 'https://ir.copart.com', rss: 'https://ir.copart.com/rss' },
  IDXX: { name: 'IDEXX Investor Relations', url: 'https://investors.idexx.com', rss: 'https://investors.idexx.com/rss' }
};

const fetchIrUpdates = async (symbol) => {
  const key = symbol.toUpperCase();
  const cached = irCache.get(key);
  if (cached && Date.now() - cached.ts < 30 * 60 * 1000) return cached.data;
  const source = IR_SOURCES[key];
  if (!source) return { source: null, items: [] };
  let items = [];
  try {
    const xml = await fetchText(source.rss);
    items = parseRssItems(xml, 5);
  } catch (error) {
    items = [];
  }
  const data = { source, items };
  irCache.set(key, { ts: Date.now(), data });
  return data;
};
const computeDcf = (fcfSeries, sharesOutstanding) => {
  const points = fcfSeries.filter((val) => Number.isFinite(val));
  if (!points.length) return null;
  const latest = points[points.length - 1] * 1e9;
  const older = points.length > 2 ? points[points.length - 3] * 1e9 : null;
  let growth = 0.06;
  if (Number.isFinite(older) && older > 0) {
    growth = Math.pow(latest / older, 1 / 2) - 1;
  }
  growth = Math.max(0.01, Math.min(growth, 0.12));
  const discount = 0.09;
  const terminalGrowth = 0.025;
  const years = 5;
  let pvSum = 0;
  let fcf = latest;
  for (let i = 1; i <= years; i += 1) {
    fcf *= (1 + growth);
    pvSum += fcf / Math.pow(1 + discount, i);
  }
  const terminalValue = (fcf * (1 + terminalGrowth)) / (discount - terminalGrowth);
  const discountedTerminal = terminalValue / Math.pow(1 + discount, years);
  const enterpriseValue = pvSum + discountedTerminal;
  const impliedPrice = sharesOutstanding ? enterpriseValue / sharesOutstanding : null;
  return {
    discount,
    terminalGrowth,
    growth,
    value: enterpriseValue,
    impliedPrice
  };
};

const buildSecAnalysisData = async (symbol) => {
  const cik = await getCikForSymbol(symbol);
  if (!cik) {
    const error = new Error('CIK not found');
    error.code = 404;
    throw error;
  }

  const submission = await getSubmission(cik);
  const facts = await fetchSecJson(`${SEC_XBRL_FACTS}/CIK${cik}.json`);

  const sicRecord = await getSicForCik(cik, submission?.name, symbol);
  const peers = await buildPeersFromSic(sicRecord?.sic, cik, 5);

  const financials = buildFinancialsFromFacts(facts?.facts || {});
  const kpis = buildKpis(financials);
  const marketData = estimateMarketData(facts?.facts || {});
  const dcf = computeDcf(financials.fcfRaw || [], marketData.shares);

  const filingsRecent = submission?.filings?.recent || null;
  const tenKs = getFilingsByForm(filingsRecent, '10-K', 2);
  const tenQs = getFilingsByForm(filingsRecent, '10-Q', 2);
  const eightKs = getFilingsByForm(filingsRecent, '8-K', 2);
  const exhibits = await collectExhibits(cik, eightKs);

  return {
    ticker: symbol.toUpperCase(),
    name: submission?.name || symbol.toUpperCase(),
    cik,
    sic: sicRecord?.sic || null,
    industry: sicRecord?.sicDescription || '',
    price: marketData.price,
    marketCap: marketData.marketCap,
    sharesOutstanding: marketData.shares,
    dcf: dcf ? {
      impliedPrice: dcf.impliedPrice,
      discount: dcf.discount,
      terminalGrowth: dcf.terminalGrowth,
      growth: dcf.growth,
      value: dcf.value
    } : null,
    peers,
    kpis,
    financials: {
      headers: financials.headers,
      incomeStatement: [
        ['Revenue', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.revenue.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Gross Profit', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.gross.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Operating Income', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.opIncome.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Net Income', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.netIncome.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['EPS (Diluted)', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.eps.find((item) => item.year === year);
          return found ? `$${Number(found.val).toFixed(2)}` : '--';
        })]
      ],
      balanceSheet: [
        ['Total Assets', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.assets.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Total Liabilities', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.liabilities.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Cash & Equivalents', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.cash.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Total Debt', ...financials.debt]
      ],
      cashFlow: [
        ['Operating Cash Flow', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.ocf.find((item) => item.year === year);
          return found ? formatNumber(toBillions(found.val)) : '--';
        })],
        ['Capital Expenditures', ...financials.headers.slice(1).map((yearLabel) => {
          const year = yearLabel.replace('FY', '');
          const found = financials.capex.find((item) => item.year === year);
          if (!found) return '--';
          return `(${formatNumber(toBillions(Math.abs(found.val)))})`;
        })],
        ['Free Cash Flow', ...financials.fcf]
      ]
    },
    filings: {
      tenKs,
      tenQs,
      eightKs,
      exhibits
    }
  };
};

const buildPeersFromSic = async (sic, excludeCik, limit = 5) => {
  if (!sic) return [];
  const cache = loadSicCache();
  cache.bySic[sic] = cache.bySic[sic] || [];
  const peers = cache.bySic[sic].filter((item) => item.cik !== excludeCik);
  if (peers.length >= limit) return peers.slice(0, limit);

  const tickers = await getSecTickerMap();
  const entries = Object.values(tickers || {});
  let lookups = 0;
  for (const entry of entries) {
    if (peers.length >= limit) break;
    if (lookups >= MAX_PEER_LOOKUPS) break;
    const cik = String(entry.cik_str).padStart(10, '0');
    if (cik === excludeCik) continue;
    if (cache.byCik[cik]?.sic === sic) {
      peers.push(cache.byCik[cik]);
      continue;
    }
    await sleep(SEC_RATE_LIMIT_MS);
    const record = await getSicForCik(cik, entry.title, entry.ticker);
    lookups += 1;
    if (record?.sic === sic) {
      peers.push(record);
    }
  }
  cache.bySic[sic] = peers;
  saveSicCache();
  return peers.slice(0, limit);
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

app.get('/api/sec-analysis', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    res.status(400).json({ error: 'Missing symbol' });
    return;
  }

  try {
    const payload = await buildSecAnalysisData(symbol);
    res.json(payload);
  } catch (error) {
    if (error.code === 404) {
      res.status(404).json({ error: 'CIK not found' });
      return;
    }
    res.status(500).json({ error: 'SEC analysis failed' });
  }
});

app.get('/api/web-report', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    res.status(400).json({ error: 'Missing symbol' });
    return;
  }

  try {
    const secData = await buildSecAnalysisData(symbol);
    let yahooQuote = null;
    try {
      yahooQuote = await fetchYahooQuote(symbol);
    } catch (error) {
      yahooQuote = null;
    }
    let irData = null;
    try {
      irData = await fetchIrUpdates(symbol);
    } catch (error) {
      irData = null;
    }

    const price = yahooQuote?.price ?? secData.price;
    const marketCap = yahooQuote?.marketCap ?? secData.marketCap;
    const sources = {
      sec: {
        tenKs: secData.filings?.tenKs || [],
        tenQs: secData.filings?.tenQs || [],
        eightKs: secData.filings?.eightKs || [],
        exhibits: secData.filings?.exhibits || []
      },
      ir: irData?.source || null,
      irItems: irData?.items || [],
      yahoo: yahooQuote || null
    };

    res.json({
      ...secData,
      price,
      marketCap,
      priceSource: yahooQuote?.price ? 'yahoo' : 'sec',
      sources
    });
  } catch (error) {
    if (error.code === 404) {
      res.status(404).json({ error: 'CIK not found' });
      return;
    }
    res.status(500).json({ error: 'Web report failed' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`SignalForge server running on http://${HOST}:${PORT}`);
});
