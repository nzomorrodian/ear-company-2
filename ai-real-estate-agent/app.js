const steps = Array.from(document.querySelectorAll('.panel-step'));
const stepButtons = Array.from(document.querySelectorAll('.step'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const panelProgress = document.getElementById('panelProgress');
const panelStepLabel = document.getElementById('panelStepLabel');
const summaryGoal = document.getElementById('summaryGoal');
const summaryTimeline = document.getElementById('summaryTimeline');
const summaryRange = document.getElementById('summaryRange');
const summaryNext = document.getElementById('summaryNext');
const summaryProgress = document.getElementById('summaryProgress');

const heroStart = document.getElementById('heroStart');
const heroTour = document.getElementById('heroTour');
const startNow = document.getElementById('startNow');
const pricingCta = document.getElementById('pricingCta');

const assistantThread = document.getElementById('assistantThread');
const assistantInput = document.getElementById('assistantInput');
const assistantSend = document.getElementById('assistantSend');

const runComps = document.getElementById('runComps');
const compsList = document.getElementById('compsList');
const listPrice = document.getElementById('listPrice');
const priceRange = document.getElementById('priceRange');
const confidenceBar = document.getElementById('confidenceBar');

const headline = document.getElementById('headline');
const description = document.getElementById('description');
const listingPreview = document.getElementById('listingPreview');
const refreshCopy = document.getElementById('refreshCopy');

const offerCards = Array.from(document.querySelectorAll('.offer-card'));
const offerNote = document.getElementById('offerNote');

const chips = Array.from(document.querySelectorAll('.chip'));

const state = {
  step: 0,
  upgrades: new Set(),
  compsRun: false,
  offer: null,
  remotePricing: null
};

const scrollToPrototype = () => {
  const section = document.getElementById('prototype');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

const setStep = (nextStep) => {
  const stepIndex = Math.min(Math.max(nextStep, 0), steps.length - 1);
  state.step = stepIndex;
  steps.forEach((step, idx) => {
    step.classList.toggle('active', idx === stepIndex);
  });
  stepButtons.forEach((button, idx) => {
    button.classList.toggle('active', idx === stepIndex);
  });
  prevBtn.disabled = stepIndex === 0;
  nextBtn.textContent = stepIndex === steps.length - 1 ? 'Finish' : 'Next step';
  const progress = ((stepIndex + 1) / steps.length) * 100;
  panelProgress.style.width = `${progress}%`;
  panelStepLabel.textContent = `Step ${stepIndex + 1} of ${steps.length}`;
  summaryProgress.style.width = `${progress}%`;
  updateSummary();
};

const updateSummary = () => {
  const goal = document.getElementById('goal').value;
  const timeline = document.getElementById('timeline').value || 'Choose a timeline';
  summaryGoal.textContent = goal;
  summaryTimeline.textContent = timeline;
  summaryRange.textContent = priceRange.textContent;
  summaryNext.textContent = state.step < 2 ? 'Approve comps' : 'Launch listing';
};

const addBubble = (text, kind) => {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${kind}`;
  bubble.textContent = text;
  assistantThread.appendChild(bubble);
  assistantThread.scrollTop = assistantThread.scrollHeight;
};

const respondToAssistant = (text) => {
  const lower = text.toLowerCase();
  let reply = 'I can help with pricing, listing prep, and next steps.';
  if (lower.includes('price')) reply = 'I will run comps and estimate a strong list range.';
  if (lower.includes('timeline')) reply = 'We can tailor the schedule and handle tasks week by week.';
  if (lower.includes('offer')) reply = 'I will summarize each offer and recommend the strongest.';
  if (lower.includes('staging')) reply = 'I can suggest low-cost upgrades that boost value.';
  setTimeout(() => addBubble(reply, 'bot'), 450);
};

const handleAssistantSend = () => {
  const text = assistantInput.value.trim();
  if (!text) return;
  addBubble(text, 'user');
  assistantInput.value = '';
  respondToAssistant(text);
};

const generatePrice = () => {
  const beds = Number(document.getElementById('beds').value || 3);
  const baths = Number(document.getElementById('baths').value || 2);
  const condition = document.getElementById('condition').value;
  const base = 520000 + beds * 38000 + baths * 22000;
  const conditionBoost = condition === 'Move-in ready' ? 45000 : condition === 'Light updates' ? 20000 : -15000;
  const upgradeBoost = state.upgrades.size * 6000;
  const list = Math.round(base + conditionBoost + upgradeBoost);
  const rangeLow = list - 18000;
  const rangeHigh = list + 18000;
  return {
    list,
    rangeLow,
    rangeHigh
  };
};

const formatPrice = (value) => {
  if (!Number.isFinite(value)) return '--';
  return `$${Math.round(value).toLocaleString()}`;
};

const updatePricingUI = () => {
  const pricing = state.remotePricing || generatePrice();
  listPrice.textContent = formatPrice(pricing.list);
  priceRange.textContent = `${formatPrice(pricing.rangeLow)} - ${formatPrice(pricing.rangeHigh)}`;
  const confidence = state.compsRun ? 88 : 62;
  confidenceBar.style.width = `${confidence}%`;
  summaryRange.textContent = priceRange.textContent;
};

const renderComps = (comps, pricing) => {
  const fallback = [
    { address: '118 Maple Ave', sold: '2 weeks ago', price: pricing.list - 12000 },
    { address: '401 Oak St', sold: '1 month ago', price: pricing.list + 9000 },
    { address: '74 Pine Ct', sold: '3 months ago', price: pricing.list - 21000 }
  ];
  const list = comps && comps.length ? comps : fallback;
  compsList.innerHTML = '';
  list.forEach((comp) => {
    const card = document.createElement('div');
    card.className = 'comp-card';
    card.innerHTML = `
      <div>
        <strong>${comp.address}</strong>
        <span>Sold ${comp.sold}</span>
      </div>
      <div>${formatPrice(comp.price)}</div>
    `;
    compsList.appendChild(card);
  });
};

const runCompsFlow = () => {
  state.compsRun = false;
  state.remotePricing = null;
  runComps.disabled = true;
  runComps.textContent = 'Pulling comps...';
  compsList.innerHTML = '<div class="comp-card">Loading recent sales...</div>';
  confidenceBar.style.width = '40%';

  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const stateCode = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();

  const params = new URLSearchParams({
    address,
    city,
    state: stateCode,
    zip
  });

  fetch(`/api/comps?${params.toString()}`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch comps');
      return response.json();
    })
    .then((data) => {
      if (!data || !data.pricing) throw new Error('Missing pricing data');
      state.compsRun = true;
      state.remotePricing = data.pricing;
      updatePricingUI();
      renderComps(data.comps || [], state.remotePricing);
      runComps.disabled = false;
      runComps.textContent = 'Re-run comps';
      addBubble('Comps are in. I suggest the highlighted price range.', 'bot');
    })
    .catch(() => {
      state.compsRun = true;
      const pricing = generatePrice();
      updatePricingUI();
      renderComps([], pricing);
      runComps.disabled = false;
      runComps.textContent = 'Re-run comps';
      addBubble('Comps could not be fetched. Showing a local estimate instead.', 'bot');
    });
};

const generateListingCopy = () => {
  const address = document.getElementById('address').value || 'your home';
  const city = document.getElementById('city').value || '';
  const stateCode = document.getElementById('state').value || '';
  const beds = document.getElementById('beds').value || '3';
  const baths = document.getElementById('baths').value || '2';
  const upgrades = [...state.upgrades].join(', ') || 'fresh finishes';
  const title = `Warm ${beds}-bed home with ${upgrades}`;
  const location = [city, stateCode].filter(Boolean).join(', ') || 'a quiet neighborhood';
  const body = `Tucked in ${location}, ${address} offers ${beds} bedrooms and ${baths} baths with ${upgrades}. Enjoy bright living spaces, thoughtful updates, and a welcoming flow that makes hosting easy. Move-in ready and priced to attract motivated buyers.`;
  headline.value = title;
  description.value = body;
  listingPreview.textContent = body;
};

const updateOfferNote = (offer) => {
  if (!offer) {
    offerNote.textContent = 'AI tip: Offer A maximizes price, Offer C is fastest.';
    return;
  }
  const notes = {
    A: 'Offer A maximizes price with strong terms and a clean close.',
    B: 'Offer B is lower price, but the 21-day close keeps things moving.',
    C: 'Offer C is cash with the fastest close, good for a quick exit.'
  };
  offerNote.textContent = notes[offer];
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const label = chip.dataset.chip;
    chip.classList.toggle('active');
    if (state.upgrades.has(label)) {
      state.upgrades.delete(label);
    } else {
      state.upgrades.add(label);
    }
    updatePricingUI();
    generateListingCopy();
  });
});

stepButtons.forEach((button) => {
  button.addEventListener('click', () => setStep(Number(button.dataset.step)));
});

prevBtn.addEventListener('click', () => setStep(state.step - 1));
nextBtn.addEventListener('click', () => {
  if (state.step === steps.length - 1) {
    scrollToPrototype();
    return;
  }
  setStep(state.step + 1);
});

[heroStart, heroTour, startNow, pricingCta].forEach((btn) => {
  if (!btn) return;
  btn.addEventListener('click', scrollToPrototype);
});

assistantSend.addEventListener('click', handleAssistantSend);
assistantInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAssistantSend();
  }
});

runComps.addEventListener('click', runCompsFlow);
refreshCopy.addEventListener('click', generateListingCopy);

['goal', 'timeline', 'address', 'city', 'state', 'zip', 'beds', 'baths', 'condition'].forEach((id) => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('input', () => {
    updatePricingUI();
    generateListingCopy();
    updateSummary();
  });
});

offerCards.forEach((card) => {
  card.addEventListener('click', () => {
    offerCards.forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    state.offer = card.dataset.offer;
    updateOfferNote(state.offer);
  });
});

updatePricingUI();
generateListingCopy();
setStep(0);
updateSummary();
