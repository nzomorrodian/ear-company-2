const companyForm = document.getElementById('companyForm');
const companyInput = document.getElementById('companyInput');
const quickPicks = Array.from(document.querySelectorAll('.quick-picks .chip'));
const analysisStatus = document.getElementById('analysisStatus');
const dataStatus = document.getElementById('dataStatus');
const runButton = companyForm.querySelector('button[type="submit"]');
const runDemo = document.getElementById('runDemo');
const dataSources = document.getElementById('dataSources');
const analysisTimeline = Array.from(document.querySelectorAll('.timeline-step'));

const companyName = document.getElementById('companyName');
const companySummary = document.getElementById('companySummary');
const marketCap = document.getElementById('marketCap');
const revenue = document.getElementById('revenue');
const grossMargin = document.getElementById('grossMargin');
const upside = document.getElementById('upside');
const moatBar = document.getElementById('moatBar');
const pricingBar = document.getElementById('pricingBar');

const businessModel = document.getElementById('businessModel');
const industry = document.getElementById('industry');
const tamList = document.getElementById('tamList');
const competition = document.getElementById('competition');
const competitors = document.getElementById('competitors');
const marketShare = document.getElementById('marketShare');
const majorPlayers = document.getElementById('majorPlayers');
const forces = document.getElementById('forces');
const moat = document.getElementById('moat');
const moatTags = document.getElementById('moatTags');
const durability = document.getElementById('durability');
const disruption = document.getElementById('disruption');
const differentiation = document.getElementById('differentiation');
const aiDisruption = document.getElementById('aiDisruption');
const disruptionDifficulty = document.getElementById('disruptionDifficulty');
const sentiment = document.getElementById('sentiment');
const reviews = document.getElementById('reviews');
const filings = document.getElementById('filings');

const forecastTable = document.getElementById('forecastTable');
const dcfValue = document.getElementById('dcfValue');
const sharePrice = document.getElementById('sharePrice');
const evEbitda = document.getElementById('evEbitda');
const cbcValue = document.getElementById('cbcValue');
const valuationNote = document.getElementById('valuationNote');
const dcfDiscount = document.getElementById('dcfDiscount');
const dcfTerminal = document.getElementById('dcfTerminal');
const dcfGrowth = document.getElementById('dcfGrowth');
const modelDrivers = document.getElementById('modelDrivers');
const peerMultiples = document.getElementById('peerMultiples');

const scenarioButtons = Array.from(document.querySelectorAll('.toggle .chip'));

const exportModal = document.getElementById('exportModal');
const openExport = document.getElementById('openExport');
const closeExport = document.getElementById('closeExport');
const modalExcel = document.getElementById('modalExcel');
const modalDeck = document.getElementById('modalDeck');
const modalPdf = document.getElementById('modalPdf');
const exportExcel = document.getElementById('exportExcel');
const exportDeck = document.getElementById('exportDeck');
const openPdf = document.getElementById('openPdf');

const pdfModal = document.getElementById('pdfModal');
const closePdf = document.getElementById('closePdf');
const pdfPageOne = document.getElementById('pdfPageOne');
const pdfPageTwo = document.getElementById('pdfPageTwo');
const downloadPdf = document.getElementById('downloadPdf');

const toast = document.getElementById('toast');

const DATASETS = {
  nvidia: {
    name: 'NVIDIA Corporation (NVDA)',
    summary: 'Design leader in accelerated computing and AI infrastructure. Dominant CUDA ecosystem, growing data center revenue, and expanding software attach.',
    marketCap: '$2.45T',
    revenue: '$78.3B',
    grossMargin: '74%',
    upside: '+18%',
    bars: { moat: 86, pricing: 78 },
    businessModel: 'Revenue splits across data center, gaming, and professional visualization, with software and networking as fast-growing attach. The CUDA platform locks in developers and enterprise buyers.',
    industry: 'AI compute infrastructure with secular demand from hyperscalers, enterprise inference, and edge deployments.',
    tam: ['AI infrastructure TAM: $260B by 2027', 'Inference workloads growing 45% YoY', 'Cloud GPU capacity < demand by 30%'],
    competition: 'Primary competition from AMD, Intel, and custom silicon. NVIDIA wins with full-stack platform, developer tooling, and supply priority.',
    competitors: ['AMD', 'Intel', 'Google TPU', 'Amazon Trainium', 'Custom ASICs'],
    forces: [
      { label: 'Threat of new entrants', value: 'Low' },
      { label: 'Supplier power', value: 'Medium' },
      { label: 'Buyer power', value: 'Medium' },
      { label: 'Threat of substitutes', value: 'Medium' },
      { label: 'Rivalry', value: 'High' }
    ],
    moat: 'CUDA ecosystem, scale manufacturing partnerships, and software libraries create multi-year switching costs.',
    moatTags: ['CUDA lock-in', 'Developer tooling', 'Supply leverage', 'Software attach'],
    durability: 'Moat durability is strong for 3-5 years, with risk from hyperscaler in-house chips and open-source compiler stacks.',
    disruption: 'A disruptor would target cost-effective inference, open-source tooling, and integrated cloud + silicon bundles. Execution difficulty is high due to ecosystem inertia.',
    sentiment: 'Developers praise performance, while buyers note supply constraints and pricing pressure.',
    reviews: [
      '"CUDA is still the gold standard for production AI workloads." - ML Engineer',
      '"Pricing is steep, but performance wins." - Data Center Buyer',
      '"Ecosystem depth saves weeks of integration time." - Product Lead'
    ],
    forecast: {
      base: [
        ['2024', '78.3', '34.2', '43.7', '56%'],
        ['2025', '96.5', '42.8', '51.2', '57%'],
        ['2026', '112.9', '52.1', '58.9', '58%'],
        ['2027', '128.4', '59.4', '66.2', '58%'],
        ['2028', '141.7', '65.2', '72.3', '57%']
      ],
      bull: [
        ['2024', '78.3', '34.2', '43.7', '56%'],
        ['2025', '103.2', '47.5', '55.8', '58%'],
        ['2026', '124.8', '59.4', '66.2', '59%'],
        ['2027', '148.5', '72.1', '78.9', '60%'],
        ['2028', '168.4', '83.4', '89.7', '60%']
      ],
      bear: [
        ['2024', '78.3', '34.2', '43.7', '56%'],
        ['2025', '88.4', '37.9', '46.1', '55%'],
        ['2026', '96.6', '41.2', '49.0', '54%'],
        ['2027', '104.2', '44.5', '52.1', '53%'],
        ['2028', '110.8', '46.8', '53.4', '52%']
      ]
    },
    valuation: {
      dcf: '$2.89T',
      share: '$128.40',
      ev: '1.35x',
      cbc: '$2.62T',
      note: 'Base case implies 18% upside with strong sensitivity to AI capex cycles.'
    }
  },
  apple: {
    name: 'Apple Inc. (AAPL)',
    summary: 'Ecosystem-driven hardware and services leader with premium pricing, strong installed base, and rising services mix.',
    marketCap: '$2.75T',
    revenue: '$383.3B',
    grossMargin: '45%',
    upside: '+12%',
    bars: { moat: 82, pricing: 74 },
    businessModel: 'High-margin hardware paired with recurring services revenue from App Store, iCloud, and AppleCare.',
    industry: 'Premium consumer electronics and services, with durable device replacement cycles and ecosystem lock-in.',
    tam: ['Services TAM: $1.2T by 2028', 'Wearables TAM: $180B', 'Installed base: 2.2B active devices'],
    competition: 'Samsung and Google challenge hardware share, but Apple maintains ecosystem stickiness and premium share.',
    competitors: ['Samsung', 'Google', 'Huawei', 'Microsoft'],
    forces: [
      { label: 'Threat of new entrants', value: 'Low' },
      { label: 'Supplier power', value: 'Medium' },
      { label: 'Buyer power', value: 'Low' },
      { label: 'Threat of substitutes', value: 'Medium' },
      { label: 'Rivalry', value: 'High' }
    ],
    moat: 'Brand equity, hardware-software integration, and services ecosystem reinforce premium pricing and retention.',
    moatTags: ['Ecosystem lock-in', 'Brand loyalty', 'Services attach', 'Premium pricing'],
    durability: 'Moat durability remains high with expanding services mix and sticky ecosystem bundles.',
    disruption: 'A disruptor would need a full-stack ecosystem with hardware, OS, and services to break lock-in. Difficulty is very high.',
    sentiment: 'Customers love product quality, but express concerns about pricing and upgrade cadence.',
    reviews: [
      '"Everything just works together." - Enterprise IT',
      '"Expensive, but resale value is strong." - Consumer Review',
      '"Services make the device feel complete." - Analyst Note'
    ],
    forecast: {
      base: [
        ['2024', '383.3', '90.8', '98.1', '26%'],
        ['2025', '401.5', '95.4', '102.3', '26%'],
        ['2026', '420.2', '101.1', '108.8', '26%'],
        ['2027', '439.8', '107.2', '114.9', '26%'],
        ['2028', '458.5', '111.8', '119.4', '26%']
      ],
      bull: [
        ['2024', '383.3', '90.8', '98.1', '26%'],
        ['2025', '412.5', '99.2', '107.3', '26%'],
        ['2026', '446.1', '108.3', '116.8', '26%'],
        ['2027', '480.7', '118.2', '127.4', '26%'],
        ['2028', '515.9', '127.6', '137.3', '27%']
      ],
      bear: [
        ['2024', '383.3', '90.8', '98.1', '26%'],
        ['2025', '392.1', '92.3', '99.2', '25%'],
        ['2026', '401.4', '94.1', '100.8', '25%'],
        ['2027', '409.8', '95.5', '101.9', '25%'],
        ['2028', '417.3', '96.4', '102.6', '25%']
      ]
    },
    valuation: {
      dcf: '$3.05T',
      share: '$197.40',
      ev: '1.15x',
      cbc: '$2.88T',
      note: 'Services mix expansion keeps cash flow resilient in the base case.'
    }
  },
  microsoft: {
    name: 'Microsoft Corporation (MSFT)',
    summary: 'Cloud and enterprise software leader with durable ARR, Azure momentum, and AI copilots across the stack.',
    marketCap: '$3.1T',
    revenue: '$236.6B',
    grossMargin: '69%',
    upside: '+15%',
    bars: { moat: 88, pricing: 80 },
    businessModel: 'Recurring revenue across productivity, cloud infrastructure, and enterprise apps, with strong cross-sell.',
    industry: 'Cloud infrastructure and enterprise software with growing AI copilots and platform services.',
    tam: ['Cloud TAM: $1.8T by 2030', 'AI productivity TAM: $320B', 'Enterprise ARR: $160B+'],
    competition: 'AWS and Google Cloud compete on infrastructure, while Microsoft wins on enterprise distribution and suite bundles.',
    competitors: ['AWS', 'Google Cloud', 'Salesforce', 'Oracle'],
    forces: [
      { label: 'Threat of new entrants', value: 'Low' },
      { label: 'Supplier power', value: 'Medium' },
      { label: 'Buyer power', value: 'Medium' },
      { label: 'Threat of substitutes', value: 'Low' },
      { label: 'Rivalry', value: 'High' }
    ],
    moat: 'Enterprise relationships, integrated suite, and migration costs create durable switching barriers.',
    moatTags: ['Enterprise lock-in', 'Cloud scale', 'AI copilot', 'Distribution'],
    durability: 'Moat durability is strong with AI copilots deepening platform dependence.',
    disruption: 'A disruptor would need to unbundle suites with superior AI-native UX and migration tooling. Difficulty high.',
    sentiment: 'Customers appreciate reliability, with ongoing requests for cost optimization and transparency.',
    reviews: [
      '"Azure integrations saved our migration timeline." - CIO',
      '"Copilot adoption is strong in knowledge teams." - Ops Lead',
      '"Pricing is complex but value is clear." - Finance Director'
    ],
    forecast: {
      base: [
        ['2024', '236.6', '98.1', '81.4', '34%'],
        ['2025', '258.3', '108.5', '91.2', '35%'],
        ['2026', '280.5', '119.2', '101.6', '36%'],
        ['2027', '303.8', '130.7', '112.8', '37%'],
        ['2028', '327.4', '141.3', '123.9', '38%']
      ],
      bull: [
        ['2024', '236.6', '98.1', '81.4', '34%'],
        ['2025', '270.4', '115.2', '97.5', '36%'],
        ['2026', '301.9', '130.6', '112.7', '37%'],
        ['2027', '337.5', '148.2', '129.4', '38%'],
        ['2028', '373.2', '165.8', '145.1', '39%']
      ],
      bear: [
        ['2024', '236.6', '98.1', '81.4', '34%'],
        ['2025', '249.1', '101.2', '84.1', '34%'],
        ['2026', '261.4', '104.1', '86.5', '33%'],
        ['2027', '272.8', '106.9', '88.9', '33%'],
        ['2028', '283.2', '109.4', '90.7', '32%']
      ]
    },
    valuation: {
      dcf: '$3.48T',
      share: '$470.20',
      ev: '1.42x',
      cbc: '$3.12T',
      note: 'Azure AI momentum supports premium valuation across scenarios.'
    }
  }
};

DATASETS.blackrock = {
  name: 'BlackRock, Inc. (BLK)',
  summary: 'Largest asset manager globally with scale in ETFs, institutional mandates, and the Aladdin analytics platform.',
  marketCap: '$120B',
  revenue: '$18.6B',
  grossMargin: '45%',
  upside: '+11%',
  bars: { moat: 78, pricing: 70 },
  businessModel: 'Asset-based fees from iShares ETFs, active, and multi-asset mandates, plus technology subscriptions (Aladdin), advisory/OCIO, and cash management. Scale lowers unit costs while distribution breadth sustains flows.',
  industry: 'Global asset management and wealth platforms as passive, model portfolios, and alternatives gain share within retirement, RIA, and institutional channels.',
  tam: [
    'Global AUM: $120T+ with mid-single-digit growth',
    'ETF market growing ~12% YoY with rising retail adoption',
    'Retirement + RIA channels expanding model portfolio demand'
  ],
  marketShare: 'Approx. ~7% of global AUM, #1 in ETFs with ~30%+ U.S. ETF share, and leading institutional outsourcer/OCIO provider.',
  majorPlayers: [
    'Vanguard (low-fee index leader)',
    'State Street (ETF scale + institutional)',
    'Fidelity (retail + active + brokerage)',
    'JPMorgan AM (bank distribution)',
    'Capital Group (active long-only)',
    'Blackstone (alternatives heavyweight)'
  ],
  competition: 'Competition centers on Vanguard and State Street in passive, with Fidelity, JPMorgan AM, and alternatives managers competing for institutional and wealth share.',
  competitors: ['Vanguard', 'State Street', 'Fidelity', 'JPMorgan AM', 'Blackstone', 'Invesco'],
  forces: [
    { label: 'Threat of new entrants', value: 'Low' },
    { label: 'Supplier power', value: 'Low' },
    { label: 'Buyer power', value: 'High' },
    { label: 'Threat of substitutes', value: 'Medium' },
    { label: 'Rivalry', value: 'High' }
  ],
  moat: 'The iShares ecosystem (liquidity + shelf placement) and Aladdin risk/portfolio stack create switching costs, data feedback loops, and an embedded distribution moat across institutional and wealth channels.',
  moatTags: ['iShares scale', 'Aladdin platform', 'Institutional distribution', 'Data advantage', 'OCIO stickiness'],
  durability: 'Moat durability is solid over 5+ years as Aladdin renewals, OCIO mandates, and ETF shelf placement reinforce scale. Fee pressure is the primary erosion risk.',
  disruption: 'A disruptor would need ETF liquidity scale plus a credible replacement for Aladdin’s risk and workflow stack. Difficulty is high due to multi-year contracts and embedded investment ops.',
  differentiation: [
    'Aladdin embedded across trading, risk, and compliance workflows',
    'iShares breadth + liquidity attracts adviser shelf placement',
    'Global institutional distribution and OCIO trust',
    'Product breadth across passive, active, and alternatives',
    'Operational scale lowers unit cost and improves margins'
  ],
  aiDisruption: 'Build an AI-native asset management stack: automated portfolio construction + direct indexing, AI risk/attribution engine, and compliance tooling, paired with a digital RIA distribution channel.',
  disruptionDifficulty: 'Difficulty: very high. Requires multi-year performance record, regulatory approvals, distribution depth, and data scale to displace entrenched workflows.',
  sentiment: 'Institutional clients value stability and breadth, while fee pressure and transparency in risk attribution are consistent requests.',
  reviews: [
    '"Aladdin is deeply embedded in our workflow and hard to replace." - Asset allocator',
    '"iShares is the default ETF shelf for many advisors." - RIA lead',
    '"Fees keep compressing, but the breadth of solutions is unmatched." - Portfolio manager',
    '"Operational reporting and risk tooling are best-in-class." - Chief Risk Officer'
  ],
  filings: [
    { form: '10-K', date: '2024-02-15' },
    { form: '10-Q', date: '2024-05-02' },
    { form: '10-Q', date: '2024-08-01' },
    { form: '8-K', date: '2024-10-15' }
  ],
  forecast: {
    base: [
      ['2024', '18.6', '7.2', '5.4', '39%', 'ETF net inflows stabilize'],
      ['2025', '19.4', '7.6', '5.7', '39%', 'Aladdin + advisory growth'],
      ['2026', '20.3', '8.1', '6.1', '40%', 'Operating leverage kicks in'],
      ['2027', '21.1', '8.5', '6.4', '40%', 'Fee pressure offsets mix shift'],
      ['2028', '22.0', '8.9', '6.7', '41%', 'Alternatives + tech scale']
    ],
    bull: [
      ['2024', '18.6', '7.2', '5.4', '39%', 'Risk-on flows return'],
      ['2025', '20.1', '8.0', '6.0', '40%', 'ETF share gains'],
      ['2026', '21.8', '8.8', '6.7', '40%', 'Aladdin upsell accelerates'],
      ['2027', '23.5', '9.5', '7.3', '40%', 'Alt mix expands margins'],
      ['2028', '25.0', '10.2', '7.9', '41%', 'Scale benefits compound']
    ],
    bear: [
      ['2024', '18.6', '7.2', '5.4', '39%', 'Soft markets'],
      ['2025', '18.9', '7.2', '5.2', '38%', 'Fee compression'],
      ['2026', '19.2', '7.3', '5.2', '38%', 'Outflows in active'],
      ['2027', '19.5', '7.4', '5.3', '38%', 'Margin flat'],
      ['2028', '19.8', '7.5', '5.3', '38%', 'Limited recovery']
    ]
  },
  modelDrivers: [
    'AUM growth 5-6% CAGR with higher mix in ETFs and model portfolios',
    'Fee rate compression of ~2-4 bps, offset by tech/advisory revenue',
    'Aladdin + advisory growth 10-12% with strong renewal rates',
    'Operating margin expands to ~40% as scale benefits accrue',
    'Buybacks reduce share count ~2% annually in base case'
  ],
  peerMultiples: [
    'BlackRock: 16x P/E, 12x EV/EBITDA (illustrative)',
    'State Street: 9x P/E, 7x EV/EBITDA',
    'T. Rowe: 10x P/E, 8x EV/EBITDA',
    'Invesco: 8x P/E, 7x EV/EBITDA',
    'JPM AM (implied): 12x P/E, 9x EV/EBITDA'
  ],
  valuation: {
    dcf: '$130B',
    share: '$935.10',
    ev: '0.92x',
    cbc: '$118B',
    note: 'Illustrative demo model using public estimates with stable fee rates, modest net inflows, and continued Aladdin growth.'
  },
  sources: ['Public filings', 'Earnings releases', 'Industry reports (demo)'],
  valuationInputs: {
    discount: '9.0%',
    terminal: '2.5%',
    growth: '7%'
  }
};

DATASETS.schwab = {
  name: 'Charles Schwab Corporation (SCHW)',
  summary: 'Retail and institutional brokerage leader with diversified revenue from net interest and asset-based fees.',
  marketCap: '$110B',
  revenue: '$19.0B',
  grossMargin: '52%',
  upside: '+14%',
  bars: { moat: 72, pricing: 64 },
  businessModel: 'Net interest income, advisory fees, trading services, and banking products across retail investors.',
  industry: 'Brokerage and wealth management with competitive pricing and digital-first client acquisition.',
  tam: ['US investable assets: $50T+', 'RIA assets growing 8% YoY', 'Retirement rollover tailwinds'],
  competition: 'Fidelity and Vanguard compete aggressively on pricing and platform features.',
  competitors: ['Fidelity', 'Vanguard', 'Robinhood', 'Interactive Brokers'],
  forces: [
    { label: 'Threat of new entrants', value: 'Medium' },
    { label: 'Supplier power', value: 'Low' },
    { label: 'Buyer power', value: 'High' },
    { label: 'Threat of substitutes', value: 'Medium' },
    { label: 'Rivalry', value: 'High' }
  ],
  moat: 'Scale in custody, advisor platform stickiness, and client trust.',
  moatTags: ['Scale', 'Advisor platform', 'Trust'],
  durability: 'Moat durability is moderate with ongoing pricing pressure.',
  disruption: 'Low-cost digital challengers could erode margins. Difficulty medium.',
  sentiment: 'Customers appreciate platform stability, but want more modern UX.',
  reviews: [
    '"Reliable platform with deep research tools." - Investor',
    '"Interface could be more modern." - Retail client'
  ],
  forecast: defaultDataset.forecast,
  valuation: {
    dcf: '$120B',
    share: '$78.40',
    ev: '0.88x',
    cbc: '$108B',
    note: 'Base case assumes rates normalize and asset growth remains steady.'
  }
};

DATASETS.amazon = {
  name: 'Amazon.com, Inc. (AMZN)',
  summary: 'E-commerce and cloud leader with AWS profitability and expanding logistics + advertising flywheel.',
  marketCap: '$1.8T',
  revenue: '$574.8B',
  grossMargin: '46%',
  upside: '+20%',
  bars: { moat: 84, pricing: 70 },
  businessModel: 'Retail, marketplace fees, AWS, and ads create diversified revenue with strong cash generation.',
  industry: 'Global e-commerce and cloud infrastructure with increasing ad monetization.',
  tam: ['Global retail TAM: $28T', 'Cloud TAM: $1.8T', 'Ads TAM: $900B'],
  competition: 'Walmart, Alibaba, and cloud peers compete on price and speed.',
  competitors: ['Walmart', 'Alibaba', 'Microsoft Azure', 'Google Cloud'],
  forces: [
    { label: 'Threat of new entrants', value: 'Low' },
    { label: 'Supplier power', value: 'Medium' },
    { label: 'Buyer power', value: 'Medium' },
    { label: 'Threat of substitutes', value: 'Medium' },
    { label: 'Rivalry', value: 'High' }
  ],
  moat: 'Logistics scale, Prime ecosystem, and AWS stickiness.',
  moatTags: ['Prime ecosystem', 'Logistics scale', 'AWS lock-in'],
  durability: 'Moat durability is strong with multi-sided platform effects.',
  disruption: 'A disruptor would need logistics scale and cloud infrastructure at massive capex. Difficulty very high.',
  sentiment: 'Customers love delivery speed and breadth; sellers cite fee pressure.',
  reviews: [
    '"Prime delivery is unmatched." - Consumer',
    '"Marketplace fees are rising." - Seller'
  ],
  forecast: defaultDataset.forecast,
  valuation: {
    dcf: '$2.05T',
    share: '$194.20',
    ev: '1.10x',
    cbc: '$1.92T',
    note: 'Base case driven by AWS margin recovery and ads growth.'
  }
};

DATASETS.meta = {
  name: 'Meta Platforms, Inc. (META)',
  summary: 'Global social platform leader with strong ad targeting and growing AI-driven engagement.',
  marketCap: '$1.25T',
  revenue: '$149.9B',
  grossMargin: '80%',
  upside: '+17%',
  bars: { moat: 80, pricing: 72 },
  businessModel: 'Advertising-driven revenue across Facebook, Instagram, and WhatsApp, with Reality Labs as a long-term bet.',
  industry: 'Digital advertising with shift to AI recommendation and commerce.',
  tam: ['Global ad spend: $1.1T', 'Short-form video growing 20% YoY', 'Messaging commerce expanding'],
  competition: 'Google, TikTok, and Amazon compete for digital ad budgets.',
  competitors: ['Google', 'TikTok', 'Amazon Ads', 'Snap'],
  forces: [
    { label: 'Threat of new entrants', value: 'Medium' },
    { label: 'Supplier power', value: 'Low' },
    { label: 'Buyer power', value: 'Medium' },
    { label: 'Threat of substitutes', value: 'High' },
    { label: 'Rivalry', value: 'High' }
  ],
  moat: 'Network effects, scale in ad targeting, and AI-driven engagement loops.',
  moatTags: ['Network effects', 'Ad targeting', 'AI engagement'],
  durability: 'Moat durability is strong with continued product velocity and scale.',
  disruption: 'A disruptor would need to capture attention at scale with a new social format. Difficulty high.',
  sentiment: 'Advertisers value ROI, while users cite privacy and content concerns.',
  reviews: [
    '"Best ROI among major platforms." - Advertiser',
    '"Engagement is strong, but content moderation is uneven." - Analyst'
  ],
  forecast: defaultDataset.forecast,
  valuation: {
    dcf: '$1.42T',
    share: '$515.30',
    ev: '1.28x',
    cbc: '$1.28T',
    note: 'Base case assumes stable ad pricing and AI engagement gains.'
  }
};

const defaultDataset = DATASETS.nvidia;
let currentDataset = defaultDataset;

const SIMULATED_MODE = true;
const DATA_API_ENABLED = window.location.protocol.startsWith('http') && !SIMULATED_MODE;

const timelineOrder = ['connect', 'collect', 'model', 'synthesize'];

const resetTimeline = () => {
  analysisTimeline.forEach((item) => {
    item.classList.remove('active', 'done');
  });
};

const advanceTimeline = (step) => {
  resetTimeline();
  const index = timelineOrder.indexOf(step);
  analysisTimeline.forEach((item) => {
    const stepIndex = timelineOrder.indexOf(item.dataset.step);
    if (stepIndex < index) item.classList.add('done');
    if (stepIndex === index) item.classList.add('active');
  });
};

const simulateTimelineFlow = () => {
  advanceTimeline('connect');
  setTimeout(() => advanceTimeline('collect'), 450);
  setTimeout(() => advanceTimeline('model'), 900);
  setTimeout(() => advanceTimeline('synthesize'), 1350);
};

const formatList = (items, target) => {
  target.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    target.appendChild(li);
  });
};

const formatPills = (items, target) => {
  target.innerHTML = '';
  items.forEach((item) => {
    const span = document.createElement('span');
    span.textContent = item;
    target.appendChild(span);
  });
};

const formatForces = (items) => {
  forces.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'force';
    div.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    forces.appendChild(div);
  });
};

const formatReviews = (items) => {
  reviews.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'sentiment';
    div.textContent = item;
    reviews.appendChild(div);
  });
};

const formatFilings = (items) => {
  if (!filings) return;
  filings.innerHTML = '';
  if (!items || !items.length) {
    filings.textContent = 'No recent filings found.';
    return;
  }
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'filing';
    div.innerHTML = `<span>${item.form}</span><span>${item.date}</span>`;
    filings.appendChild(div);
  });
};

const renderForecast = (rows) => {
  forecastTable.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'table-row header';
  header.innerHTML = '<span>Year</span><span>Revenue ($B)</span><span>EBITDA ($B)</span><span>FCF ($B)</span><span>EBITDA Margin</span><span>Notes</span>';
  forecastTable.appendChild(header);

  rows.forEach((row) => {
    const div = document.createElement('div');
    div.className = 'table-row';
    div.innerHTML = `<span>${row[0]}</span><span>${row[1]}</span><span>${row[2]}</span><span>${row[3]}</span><span>${row[4]}</span><span>${row[5] || 'Base case'}</span>`;
    forecastTable.appendChild(div);
  });
};

const renderPdf = (dataset) => {
  pdfPageOne.innerHTML = `
    <h4>${dataset.name}</h4>
    <p><strong>Investment thesis:</strong> ${dataset.summary}</p>
    <p><strong>Business model:</strong> ${dataset.businessModel}</p>
    <p><strong>Moat:</strong> ${dataset.moat}</p>
    <p><strong>Differentiation:</strong> ${(dataset.differentiation || []).slice(0, 2).join('; ')}</p>
    <p><strong>Key risks:</strong> ${dataset.disruption}</p>
    <p><strong>AI disruption:</strong> ${dataset.aiDisruption || 'N/A'}</p>
    <p><strong>Valuation:</strong> DCF ${dataset.valuation.dcf}, CBCV ${dataset.valuation.cbc}</p>
  `;
  pdfPageTwo.innerHTML = `
    <h4>Financial snapshot</h4>
    <p><strong>Market cap:</strong> ${dataset.marketCap}</p>
    <p><strong>Revenue:</strong> ${dataset.revenue}</p>
    <p><strong>Gross margin:</strong> ${dataset.grossMargin}</p>
    <p><strong>DCF value:</strong> ${dataset.valuation.dcf}</p>
    <p><strong>Implied share price:</strong> ${dataset.valuation.share}</p>
    <p><strong>Peer multiple:</strong> ${dataset.valuation.ev}</p>
    <p><strong>Customer-based value:</strong> ${dataset.valuation.cbc}</p>
  `;
};

const applyDataset = (dataset) => {
  currentDataset = dataset;
  companyName.textContent = dataset.name;
  companySummary.textContent = dataset.summary;
  marketCap.textContent = dataset.marketCap;
  revenue.textContent = dataset.revenue;
  grossMargin.textContent = dataset.grossMargin;
  upside.textContent = dataset.upside;
  moatBar.style.width = `${dataset.bars.moat}%`;
  pricingBar.style.width = `${dataset.bars.pricing}%`;

  businessModel.textContent = dataset.businessModel;
  industry.textContent = dataset.industry;
  formatList(dataset.tam, tamList);
  if (marketShare) marketShare.textContent = dataset.marketShare || '';
  if (majorPlayers) formatList(dataset.majorPlayers || [], majorPlayers);
  competition.textContent = dataset.competition;
  formatPills(dataset.competitors, competitors);
  formatForces(dataset.forces);
  moat.textContent = dataset.moat;
  formatPills(dataset.moatTags, moatTags);
  durability.textContent = dataset.durability;
  disruption.textContent = dataset.disruption;
  if (differentiation) formatList(dataset.differentiation || [], differentiation);
  if (aiDisruption) aiDisruption.textContent = dataset.aiDisruption || '';
  if (disruptionDifficulty) disruptionDifficulty.textContent = dataset.disruptionDifficulty || '';
  sentiment.textContent = dataset.sentiment;
  formatReviews(dataset.reviews);
  formatFilings(dataset.filings || []);

  scenarioButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scenario === 'base');
  });
  renderForecast(dataset.forecast.base);
  dcfValue.textContent = dataset.valuation.dcf;
  sharePrice.textContent = dataset.valuation.share;
  evEbitda.textContent = dataset.valuation.ev;
  cbcValue.textContent = dataset.valuation.cbc;
  valuationNote.textContent = dataset.valuation.note;
  if (modelDrivers) formatList(dataset.modelDrivers || [], modelDrivers);
  if (peerMultiples) formatList(dataset.peerMultiples || [], peerMultiples);
  if (dataSources) {
    dataSources.innerHTML = '';
    (dataset.sources || []).forEach((source) => {
      const span = document.createElement('span');
      span.textContent = source;
      dataSources.appendChild(span);
    });
  }
  if (dataset.valuationInputs) {
    dcfDiscount.textContent = dataset.valuationInputs.discount || dcfDiscount.textContent;
    dcfTerminal.textContent = dataset.valuationInputs.terminal || dcfTerminal.textContent;
    dcfGrowth.textContent = dataset.valuationInputs.growth || dcfGrowth.textContent;
  }

  renderPdf(dataset);
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
};

const normalizeKey = (value) => value.toLowerCase().replace(/[^a-z]/g, '');

const createGenericDataset = (name) => ({
  name: `${name} (Public Company)`,
  summary: 'Scaled public company with diversified revenue streams and strong analyst coverage.',
  marketCap: '$120B',
  revenue: '$24.6B',
  grossMargin: '46%',
  upside: '+10%',
  bars: { moat: 72, pricing: 66 },
  businessModel: 'Recurring and transactional revenue across core products, services, and adjacent growth bets.',
  industry: 'Large addressable market with moderate growth and competitive differentiation driven by distribution.',
  tam: ['TAM: $180B+ with mid-single-digit growth', 'Top 5 players control 60% share', 'Regulation creates moderate barriers'],
  marketShare: 'Top 3 player with mid-single-digit share and scale advantages in key channels.',
  majorPlayers: [
    'Major incumbent A (scale leader)',
    'Major incumbent B (price leader)',
    'Challenger C (digital-first)'
  ],
  competition: 'Competitive intensity is medium with a few scaled incumbents and niche specialists.',
  competitors: ['Major incumbent A', 'Major incumbent B', 'Fast-growing challenger'],
  forces: [
    { label: 'Threat of new entrants', value: 'Medium' },
    { label: 'Supplier power', value: 'Medium' },
    { label: 'Buyer power', value: 'Medium' },
    { label: 'Threat of substitutes', value: 'Medium' },
    { label: 'Rivalry', value: 'High' }
  ],
  moat: 'Distribution reach, product breadth, and switching costs drive durable positioning.',
  moatTags: ['Distribution', 'Switching costs', 'Brand equity'],
  durability: 'Moat durability is moderate, supported by scale and customer stickiness.',
  disruption: 'A disruptor would target underserved segments with a lower-cost, modern stack. Difficulty medium.',
  differentiation: [
    'Scale distribution and pricing',
    'Workflow integration and switching costs',
    'Brand trust with enterprise buyers'
  ],
  aiDisruption: 'AI-native vertical stack with lower-cost workflows and automation-led onboarding.',
  disruptionDifficulty: 'Difficulty: medium. Distribution and regulatory hurdles remain the primary barriers.',
  sentiment: 'Customer feedback highlights reliability with demand for better pricing transparency.',
  reviews: [
    '"Stable performance with room for UX improvement." - Customer review',
    '"Strong support and onboarding." - Buyer feedback'
  ],
  filings: [],
  forecast: defaultDataset.forecast,
  modelDrivers: [
    'Revenue growth 5-8% with stable pricing',
    'Margins expand 100-200 bps from operating leverage',
    'Working capital stable, capex steady'
  ],
  peerMultiples: [
    'Incumbent A: 12x EV/EBITDA',
    'Incumbent B: 10x EV/EBITDA',
    'Challenger C: 14x EV/EBITDA'
  ],
  sources: ['Financial Modeling Prep', 'SEC EDGAR', 'Public earnings'],
  valuationInputs: {
    discount: '9.0%',
    terminal: '2.5%',
    growth: '8%'
  },
  valuation: {
    dcf: '$140B',
    share: '$82.40',
    ev: '0.95x',
    cbc: '$132B',
    note: 'Base case reflects steady growth with margin expansion from operating leverage.'
  }
});

const resolveDataset = (value) => {
  const key = normalizeKey(value);
  if (['nvidia', 'nvda'].includes(key)) return DATASETS.nvidia;
  if (['apple', 'aapl'].includes(key)) return DATASETS.apple;
  if (['microsoft', 'msft'].includes(key)) return DATASETS.microsoft;
  if (['blackrock', 'blk'].includes(key)) return DATASETS.blackrock;
  if (['schwab', 'charlesschwab', 'schw'].includes(key)) return DATASETS.schwab;
  if (['amazon', 'amzn'].includes(key)) return DATASETS.amazon;
  if (['meta', 'facebook', 'meta platforms', 'meta platforms inc', 'meta platforms inc'].includes(key)) return DATASETS.meta;
  if (!value) return defaultDataset;
  return createGenericDataset(value);
};

const normalizeSymbol = (value) => value.toUpperCase().replace(/[^A-Z]/g, '');

const fetchWithTimeout = async (url, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const fetchCompanyData = async (value) => {
  const query = value.trim();
  if (!query) return null;

  let symbol = normalizeSymbol(query);
  if (symbol.length < 2) {
    const searchRes = await fetchWithTimeout(`/api/search?query=${encodeURIComponent(query)}`);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    symbol = normalizeSymbol(searchData?.symbol || '');
  }

  if (!symbol) return null;
  const response = await fetchWithTimeout(`/api/company?symbol=${encodeURIComponent(symbol)}`);
  if (!response.ok) return null;
  return response.json();
};

const applyApiDataset = (data, fallbackName) => {
  const name = data?.name || fallbackName || 'Public Company';
  const dataset = createGenericDataset(name);
  dataset.name = `${name} (${data.symbol})`;
  dataset.marketCap = data.marketCap || dataset.marketCap;
  dataset.revenue = data.revenue || dataset.revenue;
  dataset.grossMargin = data.grossMargin || dataset.grossMargin;
  dataset.summary = data.summary || dataset.summary;
  dataset.competitors = data.peers?.length ? data.peers : dataset.competitors;
  dataset.tam = data.tam?.length ? data.tam : dataset.tam;
  dataset.valuation = data.valuation || dataset.valuation;
  dataset.forecast = data.forecast || dataset.forecast;
  dataset.sources = data.sources || dataset.sources;
  dataset.valuationInputs = data.valuationInputs || dataset.valuationInputs;
  dataset.filings = data.filings || dataset.filings;
  return dataset;
};

const handleCompanySubmit = async (event) => {
  event.preventDefault();
  const value = companyInput.value.trim();
  if (!value) return;

  if (analysisStatus) analysisStatus.textContent = 'Analyzing...';
  if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>checking...</strong>';
  if (SIMULATED_MODE) {
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>simulated public data</strong>';
    simulateTimelineFlow();
  } else {
    advanceTimeline('connect');
  }
  if (runButton) {
    runButton.disabled = true;
    runButton.textContent = 'Analyzing...';
  }

  if (DATA_API_ENABLED) {
    try {
      const data = await fetchCompanyData(value);
      if (data) {
        advanceTimeline('collect');
        const dataset = applyApiDataset(data, value);
        applyDataset(dataset);
        showToast(`Live data loaded for ${dataset.name}`);
        if (analysisStatus) analysisStatus.textContent = 'Live data loaded.';
        if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>connected</strong>';
        advanceTimeline('model');
        setTimeout(() => advanceTimeline('synthesize'), 600);
        if (runButton) {
          runButton.disabled = false;
          runButton.textContent = 'Run analysis';
        }
        return;
      }
    } catch (error) {
      // Fall back to local datasets if API fails.
    }
  }

  const dataset = resolveDataset(value);
  applyDataset(dataset);
  if (SIMULATED_MODE) {
    showToast(`Simulated analysis loaded for ${dataset.name}.`);
    if (analysisStatus) analysisStatus.textContent = 'Simulated analysis ready.';
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>simulated public data</strong>';
  } else if (!DATA_API_ENABLED) {
    showToast(`Demo data loaded for ${dataset.name}. Run the local server for live data.`);
    if (analysisStatus) analysisStatus.textContent = 'Demo data loaded.';
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>disabled</strong>';
    advanceTimeline('synthesize');
  } else {
    showToast(`Analysis refreshed for ${dataset.name}`);
    if (analysisStatus) analysisStatus.textContent = 'Demo data loaded (live data unavailable).';
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>unavailable</strong>';
    advanceTimeline('synthesize');
  }
  if (runButton) {
    runButton.disabled = false;
    runButton.textContent = 'Run analysis';
    return;
  }
  if (runButton) {
    runButton.disabled = false;
    runButton.textContent = 'Run analysis';
  }
};

companyForm.addEventListener('submit', handleCompanySubmit);

scenarioButtons.forEach((button) => {
  button.addEventListener('click', () => {
    scenarioButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const scenario = button.dataset.scenario;
    renderForecast(currentDataset.forecast[scenario]);
    showToast(`${scenario.toUpperCase()} case applied`);
  });
});

quickPicks.forEach((button) => {
  button.addEventListener('click', () => {
    const symbol = button.dataset.symbol;
    companyInput.value = symbol;
    companyForm.requestSubmit();
  });
});

const createCsv = (dataset) => {
  const rows = [['Year', 'Revenue', 'EBITDA', 'FCF', 'Margin']];
  dataset.forecast.base.forEach((row) => rows.push(row));
  return rows.map((row) => row.join(',')).join('\n');
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportExcelFile = () => {
  const csv = createCsv(currentDataset);
  downloadFile(csv, 'xyz-company-model.csv', 'text/csv');
  showToast('Excel model downloaded (CSV)');
};

const exportDeckFile = () => {
  if (typeof window.PptxGenJS === 'function') {
    const pptx = new window.PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    const slide = pptx.addSlide();
    slide.addText('XYZ Company', { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 36, color: 'FFFFFF' });
    slide.addText(currentDataset.name, { x: 0.6, y: 1.2, w: 12, h: 0.6, fontSize: 22, color: 'E6C08A' });
    slide.addText(currentDataset.summary, { x: 0.6, y: 2, w: 12, h: 1.5, fontSize: 16, color: 'EAE7E2' });
    const slide2 = pptx.addSlide();
    slide2.addText('Valuation Summary', { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 28, color: 'FFFFFF' });
    slide2.addText(`DCF: ${currentDataset.valuation.dcf}`, { x: 0.8, y: 1.4, w: 5, h: 0.5, fontSize: 18, color: 'E6C08A' });
    slide2.addText(`Share Price: ${currentDataset.valuation.share}`, { x: 0.8, y: 2.1, w: 6, h: 0.5, fontSize: 18, color: 'E6C08A' });
    slide2.addText(`Peer Multiple: ${currentDataset.valuation.ev}`, { x: 0.8, y: 2.8, w: 6, h: 0.5, fontSize: 18, color: 'E6C08A' });
    slide2.addText(`Customer-based value: ${currentDataset.valuation.cbc}`, { x: 0.8, y: 3.5, w: 8, h: 0.5, fontSize: 18, color: 'E6C08A' });
    pptx.writeFile({ fileName: 'xyz-company-deck.pptx' });
    showToast('Deck downloaded (.pptx)');
    return;
  }

  const deck = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>XYZ Company Deck</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #0f1115; color: #f4f2ee; }
      .slide { min-height: 100vh; padding: 60px; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1); }
      h1, h2 { margin: 0 0 16px; }
      .muted { color: #a7a2a0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 24px; }
      .card { background: #171a20; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
    </style>
  </head>
  <body>
    <section class="slide">
      <h1>${currentDataset.name}</h1>
      <p class="muted">${currentDataset.summary}</p>
      <div class="grid">
        <div class="card"><strong>Market cap</strong><p>${currentDataset.marketCap}</p></div>
        <div class="card"><strong>Revenue</strong><p>${currentDataset.revenue}</p></div>
        <div class="card"><strong>Gross margin</strong><p>${currentDataset.grossMargin}</p></div>
        <div class="card"><strong>DCF value</strong><p>${currentDataset.valuation.dcf}</p></div>
      </div>
    </section>
    <section class="slide">
      <h2>Business model</h2>
      <p>${currentDataset.businessModel}</p>
      <h2>Industry & TAM</h2>
      <ul>${currentDataset.tam.map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>
    <section class="slide">
      <h2>Competitive landscape</h2>
      <p>${currentDataset.competition}</p>
      <ul>${currentDataset.competitors.map((item) => `<li>${item}</li>`).join('')}</ul>
      <h2>Moat</h2>
      <p>${currentDataset.moat}</p>
    </section>
    <section class="slide">
      <h2>Valuation summary</h2>
      <ul>
        <li>DCF: ${currentDataset.valuation.dcf}</li>
        <li>Implied share price: ${currentDataset.valuation.share}</li>
        <li>Peer multiple: ${currentDataset.valuation.ev}</li>
        <li>Customer-based value: ${currentDataset.valuation.cbc}</li>
      </ul>
      <p class="muted">${currentDataset.valuation.note}</p>
    </section>
  </body>
</html>`;
  downloadFile(deck, 'xyz-company-deck.html', 'text/html');
  showToast('Deck downloaded (HTML)');
};

const openExportModal = () => exportModal.classList.add('open');
const closeExportModal = () => exportModal.classList.remove('open');

openExport.addEventListener('click', openExportModal);
closeExport.addEventListener('click', closeExportModal);

exportExcel.addEventListener('click', exportExcelFile);
exportDeck.addEventListener('click', exportDeckFile);

modalExcel.addEventListener('click', exportExcelFile);
modalDeck.addEventListener('click', exportDeckFile);

const openPdfModal = () => pdfModal.classList.add('open');
const closePdfModal = () => pdfModal.classList.remove('open');

openPdf.addEventListener('click', openPdfModal);
modalPdf.addEventListener('click', openPdfModal);
closePdf.addEventListener('click', closePdfModal);

const downloadPdfFile = () => {
  const html = `
    <html>
      <head><title>XYZ Company Summary</title></head>
      <body style="font-family: Arial, sans-serif;">
        ${pdfPageOne.innerHTML}
        <hr />
        ${pdfPageTwo.innerHTML}
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (!win) {
    showToast('Popup blocked. Please allow popups to print.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  showToast('Use your browser to save as PDF');
};

downloadPdf.addEventListener('click', downloadPdfFile);

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

const runBlkDemo = () => {
  companyInput.value = 'BLK';
  showToast('Running BlackRock demo');
  if (analysisStatus) analysisStatus.textContent = 'Demo running...';
  if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>simulated public data</strong>';
  simulateTimelineFlow();
  applyDataset(resolveDataset('BLK'));

  setTimeout(() => scrollToSection('report'), 1200);
  setTimeout(() => scrollToSection('model'), 2400);
  setTimeout(() => scrollToSection('export'), 3600);
  setTimeout(() => openExportModal(), 4400);
  setTimeout(() => {
    closeExportModal();
    openPdfModal();
  }, 6000);
  setTimeout(() => {
    closePdfModal();
    if (analysisStatus) analysisStatus.textContent = 'Demo complete.';
  }, 8000);
};

window.runBlkDemo = runBlkDemo;

const runAutoDemoIfRequested = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'blk') {
    setTimeout(runBlkDemo, 600);
  }
};

if (runDemo) {
  runDemo.addEventListener('click', runBlkDemo);
}

const checkLiveData = async () => {
  if (!DATA_API_ENABLED) return;
  try {
    const res = await fetchWithTimeout('/api/health');
    if (!res.ok) throw new Error('No health');
    const payload = await res.json();
    if (payload?.ok) {
      if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>connected</strong>';
      return;
    }
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>missing API key</strong>';
  } catch (error) {
    if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>unavailable</strong>';
  }
};

applyDataset(defaultDataset);
if (SIMULATED_MODE) {
  if (dataStatus) dataStatus.innerHTML = 'Live data: <strong>simulated public data</strong>';
} else {
  checkLiveData();
}
runAutoDemoIfRequested();

const pageDemo = document.body?.dataset?.demo;
if (pageDemo === 'blk') {
  setTimeout(runBlkDemo, 800);
}
