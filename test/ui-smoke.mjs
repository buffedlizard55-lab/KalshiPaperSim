/**
 * UI smoke test — runs src/app.js against a minimal DOM stub in Node.
 * Purpose: catch import errors, typos, undefined helpers and render exceptions
 * across BOTH runtime modes without needing a browser.
 * Not a browser test: innerHTML is stored as a string, not parsed.
 */

const elements = new Map();
const written = new Map();

class El {
  constructor(sel) {
    this.selector = sel;
    this._html = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.href = '';
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.listeners = {};
    this.classList = {
      _s: new Set(),
      add: (c) => this.classList._s.add(c),
      remove: (c) => this.classList._s.delete(c),
      toggle: (c, force) => {
        const on = force === undefined ? !this.classList._s.has(c) : Boolean(force);
        if (on) this.classList._s.add(c); else this.classList._s.delete(c);
        return on;
      },
      contains: (c) => this.classList._s.has(c)
    };
  }
  set innerHTML(v) { this._html = String(v); written.set(this.selector, this._html); }
  get innerHTML() { return this._html; }
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  removeEventListener() {}
  appendChild(c) { this.children.push(c); return c; }
  remove() {}
  click() { (this.listeners.click || []).forEach((f) => f({ target: this })); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  focus() {}
}

function el(sel) {
  if (!elements.has(sel)) elements.set(sel, new El(sel));
  return elements.get(sel);
}

const TABS = ['leaderboard', 'strategies', 'markets', 'memory', 'lab', 'research', 'verification', 'irregularities'];

globalThis.document = {
  querySelector: (sel) => el(sel),
  getElementById: (id) => el(`#${id}`),
  createElement: (tag) => new El(`<${tag}>`),
  querySelectorAll: (sel) => {
    if (sel === '.tab') return TABS.map((t) => { const e = el(`.tab:${t}`); e.dataset.tab = t; return e; });
    if (sel === '.panel') return TABS.map((t) => el(`#panel-${t}`));
    return [];
  },
  body: new El('body'),
  addEventListener() {}
};

globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() };
})();

globalThis.location = { protocol: 'http:', host: 'localhost:3000', href: 'http://localhost:3000/' };
globalThis.confirm = () => true;
globalThis.alert = () => {};
globalThis.URL.createObjectURL = () => 'blob:stub';
globalThis.URL.revokeObjectURL = () => {};
globalThis.Blob = class { constructor(parts) { this.parts = parts; } };

// fetch fails => forces STATIC mode (the harsher path: everything computed locally).
// EXCEPTION: the offline reports under data/reports/ are read straight off disk.
// They are static JSON files the page is expected to render, so serving them here
// is what the browser would do over HTTP - and it lets the Research tab be tested
// with its real generated content instead of its "report unavailable" fallback.
const FORCE = process.env.FORCE_MODE || 'static';
const { readFileSync: readDiskFile, existsSync: diskExists } = await import('node:fs');
globalThis.fetch = async (url) => {
  const m = /(?:^|\/)data\/reports\/([A-Za-z0-9._-]+)$/.exec(String(url));
  if (m) {
    const full = new URL(`../data/reports/${m[1]}`, import.meta.url);
    if (diskExists(full)) {
      const text = readDiskFile(full, 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => 'not found' };
  }
  if (FORCE === 'static') throw new Error('static mode: no server');
  throw new Error(`unexpected fetch in static smoke test: ${url}`);
};

const errors = [];
process.on('unhandledRejection', (e) => errors.push(`unhandledRejection: ${e?.message || e}`));

await import('../src/app.js');

// Give boot() time to finish all async rendering.
await new Promise((r) => setTimeout(r, 4000));

const want = [
  '#pillMode', '#pillData', '#pillFeed', '#provenanceText',
  '#competitionLede', '#podium', '#leaderboardTable tbody', '#unrankedList',
  '#humanLeaderboard', '#strategyCards', '#marketList', '#marketHeader',
  '#ladderYesBid', '#ladderNoBid', '#competitionWindow', '#calendarStrip',
  '#regimeList', '#memoryLog', '#verificationBody', '#irregularityBody', '#labLint'
];

let fail = 0;
console.log(`\n=== UI smoke (${FORCE} mode) ===`);
for (const sel of want) {
  const v = written.get(sel) ?? el(sel).textContent ?? '';
  const len = String(v).length;
  const ok = len > 0;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${sel.padEnd(28)} ${len} chars`);
}

// Content assertions that matter for the "no hallucinated numbers" requirement.
const lb = written.get('#leaderboardTable tbody') || '';
const checks = [
  ['leaderboard has rows', /<tr/.test(lb)],
  ['leaderboard shows FeeArb_PremiumBuyer', lb.includes('FeeArb_PremiumBuyer')],
  ['leaderboard shows a computed return', /[-+]\d+\.\d+%/.test(lb)],
  ['unranked block populated (YieldVulture untested)', (written.get('#unrankedList') || '').includes('YieldVulture_Arb')],
  ['strategy cards rendered', (written.get('#strategyCards') || '').includes('s-card')],
  ['provenance mentions capture date', (written.get('#provenanceText') || '').includes('2026-09-17')],
  ['provenance says NOT live quotes', /not live quotes/i.test(written.get('#provenanceText') || '')],
  ['verification body lists V01', (written.get('#verificationBody') || '').includes('V01')],
  ['verification body links docs.kalshi.com', (written.get('#verificationBody') || '').includes('docs.kalshi.com')],
  ['irregularities rendered', (written.get('#irregularityBody') || '').includes('severity')],
  ['calendar has 52 weeks', ((written.get('#calendarStrip') || '').match(/class="week/g) || []).length === 52],
  ['market ladder rendered', (written.get('#ladderYesBid') || '').includes('rung')],
  ['feed pill labelled', /SIMULATED|LIVE/.test(written.get('#pillFeed') || '')],
];
console.log('\n=== content checks ===');
for (const [name, ok] of checks) {
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${name}`);
}

/* ---------------- interaction phase ---------------- */
console.log('\n=== interactions ===');
const interact = [];

// 1. Strategy Lab: compile + run a custom strategy entirely in "browser" context.
el('#labSource').value = `function decide(ctx) {
  const close = ctx.candle.trade.close;
  if (close === null) return { type: 'hold' };
  if (close <= 0.25) {
    const count = ctx.helpers.round2((ctx.portfolio.cash * 0.9) / Math.max(0.01, 1 - close));
    if (count > 0) return [{ type: 'buy', side: 'NO', count, reason: 'smoke test NO buy' }];
  }
  return { type: 'hold' };
}`;
el('#labUsername').value = 'Smoke_Tester';
el('#btnLabRun').click();
await new Promise((r) => setTimeout(r, 2500));
const lab = written.get('#labOutput') || '';
interact.push(['lab ran and produced a return', /class="podium-ret/.test(lab)]);
interact.push(['lab shows attribution factors', lab.includes('factor-head')]);
interact.push(['lab shows generated post-mortem', lab.includes('postmortem')]);
interact.push(['lab did not error', !lab.includes('Run rejected')]);

// 2. Lab rejects forbidden code (static deny-list).
el('#labSource').value = `function decide(ctx){ fetch('https://evil.example'); return {type:'hold'}; }`;
el('#btnLabRun').click();
await new Promise((r) => setTimeout(r, 600));
const lab2 = written.get('#labOutput') || '';
interact.push(['lab rejects fetch() via lint', /lint failed|forbidden_token/.test(el('#labLint').textContent + lab2)]);

// 3. Trade ticket: estimate then place a paper order for a registered user.
el('#regUsername').value = 'Smoke_Traderr';
el('#regCapital').value = '50000';
el('#btnRegister').click();
await new Promise((r) => setTimeout(r, 900));
interact.push(['registration succeeded', (written.get('#registerResult') || '').includes('Smoke_Traderr')]);

el('#tkTrader').value = 'Smoke_Traderr';
el('#tkSide').value = 'NO';
el('#tkCount').value = '250';
el('#tkQuote').click();
await new Promise((r) => setTimeout(r, 900));
const tr = written.get('#ticketResult') || '';
interact.push(['ticket estimate rendered', tr.includes('VWAP')]);
interact.push(['ticket shows fee formula', tr.includes('round up') || tr.includes('fee_multiplier')]);

el('#tkSubmit').click();
await new Promise((r) => setTimeout(r, 900));
const tr2 = written.get('#ticketResult') || '';
interact.push(['paper order recorded', /Paper order recorded|BUY NO|no depth/i.test(tr2)]);

// 4. Oversized order must be disclosed as unfilled, never invented.
el('#tkCount').value = '900000';
el('#tkQuote').click();
await new Promise((r) => setTimeout(r, 900));
const tr3 = written.get('#ticketResult') || '';
interact.push(['oversized order reports unfilled', /Unfilled/.test(tr3) && !/NaN/.test(tr3)]);

// 5. Research tab: switch to it and confirm it renders from the real report files.
el('.tab:research').click();
await new Promise((r) => setTimeout(r, 1500));
const sweepHtml = written.get('#researchSweep') || '';
const ledgerHtml = written.get('#researchLedger') || '';
const liqHtml = written.get('#researchLiquidity') || '';
interact.push(['research stats rendered from the ledger', /Public sources logged/.test(written.get('#researchStats') || '') && /Sweep variants replayed/.test(written.get('#researchStats') || '')]);
interact.push(['research stats disclose the capture method', /search excerpt/.test(written.get('#researchStats') || '')]);
interact.push(['research sweep table shows the measured distributions', sweepHtml.includes('panic_fade') && sweepHtml.includes('Median')]);
interact.push(['research sweep table labels the depth mode', /captured|modelled/.test(sweepHtml)]);
interact.push(['research liquidity table shows a real ticker and its impact', /KX[A-Z0-9-]+/.test(liqHtml) && /1,000-contract buy/.test(liqHtml)]);
interact.push(['research tab renders measured liquidity with impact', liqHtml.includes('1,000-contract buy') || liqHtml.includes('contracts')]);
interact.push(['research ledger shows capture method per source', /read in full|search excerpt/.test(ledgerHtml)]);
interact.push(['research ledger cites numbered sources with URLs', /R0\d/.test(ledgerHtml) && /https:\/\//.test(ledgerHtml)]);
interact.push(['research gaps name the blocker and the way to close it', /Blocked by:/.test(written.get('#researchGaps') || '') && /To close it:/.test(written.get('#researchGaps') || '')]);
interact.push(['research reports link the raw JSON', (written.get('#researchReports') || '').includes('.json')]);
interact.push(['research stats state no source number is reused', /no source(?:&#39;|')s performance number is reused/i.test(written.get('#researchStats') || '')]);

// 6. Calendar advance + re-run competition with a different seed.
el('#btnAdvance').click();
await new Promise((r) => setTimeout(r, 900));
interact.push(['week advanced', (written.get('#competitionWindow') || '').includes('Weeks')]);

el('#ctlSeed').value = '424242';
el('#btnRerun').click();
await new Promise((r) => setTimeout(r, 2500));
interact.push(['re-run produced a leaderboard', /<tr/.test(written.get('#leaderboardTable tbody') || '')]);

for (const [name, ok] of interact) {
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${name}`);
}

if (errors.length) {
  fail += errors.length;
  console.log('\n=== async errors ===');
  errors.forEach((e) => console.log('✗', e));
}

console.log(`\n${fail === 0 ? 'PASS' : `FAIL (${fail} problem(s))`}`);
process.exit(fail === 0 ? 0 : 1);
