const path = require('path');
const express = require('express');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ESTATED_API_KEY;
const BASE_URL = process.env.ESTATED_BASE_URL || 'https://apis.estated.com/v4';

const ensureApiKey = (res) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'Missing ESTATED_API_KEY' });
    return false;
  }
  return true;
};

const formatAddress = (item) => {
  if (!item) return 'Unknown address';
  const addr = item.address || item;
  const line1 = addr.street || addr.line || addr.address || '';
  const city = addr.city || '';
  const state = addr.state || '';
  const zip = addr.zip || '';
  return [line1, city, state, zip].filter(Boolean).join(', ') || 'Unknown address';
};

const parsePrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toComparable = (item) => {
  const price = parsePrice(item.last_sale_price || item.sale_price || item.price);
  const sold = item.last_sale_date || item.sale_date || item.sold_date || 'recently';
  return {
    address: formatAddress(item),
    sold,
    price
  };
};

const median = (values) => {
  const list = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!list.length) return null;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 === 0 ? (list[mid - 1] + list[mid]) / 2 : list[mid];
};

app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/comps', async (req, res) => {
  if (!ensureApiKey(res)) return;
  const { address, city, state, zip } = req.query;
  if (!address || !city || !state) {
    res.status(400).json({ error: 'Missing address, city, or state' });
    return;
  }

  const url = new URL(`${BASE_URL}/comps`);
  url.search = new URLSearchParams({
    token: API_KEY,
    address,
    city,
    state,
    zip
  }).toString();

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      res.status(response.status).json({ error: 'Estated request failed' });
      return;
    }

    const data = await response.json();
    const rawComps = data.comps || data.data?.comps || data.comparables || [];
    const comps = rawComps.map(toComparable).filter((comp) => comp.price);
    const list = median(comps.map((comp) => comp.price));
    const delta = list ? Math.round(list * 0.03) : null;

    res.json({
      pricing: {
        list,
        rangeLow: list ? list - delta : null,
        rangeHigh: list ? list + delta : null
      },
      comps,
      meta: {
        count: comps.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`HomePilot AI server running on http://localhost:${PORT}`);
});
