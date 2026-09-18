/**
 * KalshiPaperSim — UI component helpers
 * =====================================================================
 * Pure rendering utilities: no data fetching, no state, no side effects
 * beyond DOM writes performed by the caller. Every number rendered here is
 * passed in by src/app.js from a COMPUTED result — this module never invents
 * or defaults a performance figure.
 */

/* ------------------------------------------------------------------ *
 * Escaping & formatting
 * ------------------------------------------------------------------ */

/** Escape untrusted strings before they reach innerHTML. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function money(n, decimals = 2) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function compact(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return v.toFixed(abs < 10 ? 2 : 0);
}

export function pct(n, decimals = 2) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `${v > 0 ? '+' : ''}${v.toFixed(decimals)}%`;
}

export function signedClass(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v === 0) return 'flat';
  return v > 0 ? 'pos' : 'neg';
}

/** Kalshi prices are FixedPointDollars (4 decimals) — display them that way. */
export function price(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(4).replace(/0$/, '').replace(/0$/, '');
}

export function priceCents(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `${(v * 100).toFixed(1)}¢`;
}

export function dateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().slice(0, 10);
}

export function timeShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().slice(11, 19);
}

/* ------------------------------------------------------------------ *
 * Badges
 * ------------------------------------------------------------------ */

/** Data-source badge. The label always states what the number actually is. */
export function sourcePill(source, extra = {}) {
  const map = {
    LIVE: { cls: 'pill-live', label: 'LIVE API', title: 'Fetched from Kalshi production API at request time' },
    PROXY: { cls: 'pill-live', label: 'VIA PROXY', title: 'Fetched through this app’s server-side Kalshi proxy' },
    VERIFIED_SNAPSHOT: { cls: 'pill-snap', label: 'REAL SNAPSHOT 2026-09-17', title: 'Real Kalshi response captured 2026-09-17 (point-in-time, not live)' },
    SIMULATED: { cls: 'pill-sim', label: 'SIMULATED', title: 'Modelled by this app — not exchange data' },
    SIMULATED_AMM: { cls: 'pill-sim', label: 'SIMULATED (EVOLVING)', title: 'Modelled market-maker quotes. Seeded from the real captured book, then moved by this app\u2019s simulated feed — these prices are NOT exchange data.' },
    null: { cls: 'pill-off', label: 'UNAVAILABLE', title: 'No transport succeeded' }
  };
  // Normalize the several spellings this codebase produces for the same thing
  // (the engine emits data-source strings like "verified_snapshot_2026_09_17"
  // and re-labels a mutated book "simulated_market_maker").
  const raw = source === null || source === undefined ? null : String(source);
  let key = raw;
  if (raw && /verified_snapshot/i.test(raw)) key = 'VERIFIED_SNAPSHOT';
  else if (raw === 'simulated_market_maker') key = 'SIMULATED_AMM';
  else if (raw === 'synthetic_unpriced' || raw === 'simulation' || raw === 'synthetic') key = 'SIMULATED';
  else if (raw === 'live' || raw === 'LIVE_API') key = 'LIVE';
  else if (raw === 'proxy') key = 'PROXY';

  const info = map[key] || { cls: 'pill-muted', label: String(raw || 'UNKNOWN'), title: 'Unrecognized data source — treated as unverified' };
  return `<span class="pill ${info.cls}" title="${esc(extra.title || info.title)}"><span class="dot"></span>${esc(extra.label || info.label)}</span>`;
}

export function verdictPill(verdict) {
  const v = String(verdict || '').toUpperCase();
  if (v.includes('PROFITABLE') && !v.includes('UNPROFITABLE')) return `<span class="verdict verdict-profit">${esc(verdict)}</span>`;
  if (v.includes('UNPROFITABLE') || v.includes('LOSS')) return `<span class="verdict verdict-loss">${esc(verdict)}</span>`;
  if (v.includes('UNTESTED')) return `<span class="verdict verdict-flat">${esc(verdict)}</span>`;
  return `<span class="verdict verdict-flat">${esc(verdict || 'UNKNOWN')}</span>`;
}

export function tag(text, cls = '') {
  return `<span class="tag ${cls}">${esc(text)}</span>`;
}

/* ------------------------------------------------------------------ *
 * Leaderboard
 * ------------------------------------------------------------------ */

const PODIUM_CLS = ['gold', 'silver', 'bronze'];

export function renderPodium(rows) {
  const top = rows.filter((r) => r.qualified).slice(0, 3);
  if (!top.length) return `<div class="notice">No strategy produced a fill on this dataset, so there is nothing to rank.</div>`;
  return top
    .map((r, i) => {
      const medal = ['🥇', '🥈', '🥉'][i] || '';
      return `
      <div class="podium-card ${PODIUM_CLS[i] || ''}" data-rank="${i + 1}">
        <div class="podium-top">
          <span class="avatar">${esc(r.avatar || medal || '🤖')}</span>
          <div>
            <div class="podium-name">${esc(r.username)}</div>
            <div class="podium-handle">${esc(r.handle || `@${r.username}`)}</div>
          </div>
        </div>
        <div class="podium-ret ${signedClass(r.returnPct)}">${esc(pct(r.returnPct))}</div>
        <div class="podium-meta">
          <span>${esc(money(r.finalEquity, 0))}</span>
          <span>${esc(r.totalTrades)} trades</span>
          <span>DD ${esc(Number(r.maxDrawdownPct || 0).toFixed(2))}%</span>
        </div>
        <div class="podium-meta" style="margin-top:.3rem"><span>${esc(r.title || '')}</span></div>
      </div>`;
    })
    .join('');
}

export function renderLeaderboardRows(rows) {
  return rows
    .map((r) => {
      const rank = r.qualified ? `#${r.rank}` : '—';
      // An unranked entry has NO measurement: its capital never moved. Showing
      // "+0.00%" would present an untested design as a competitive result, so
      // the cell says unranked and the reason travels with the row (tooltip +
      // sub-line) exactly as the README does.
      const returnCell = r.qualified
        ? `<td class="num ${signedClass(r.returnPct)}"><b>${esc(pct(r.returnPct))}</b></td>`
        : `<td class="num muted" title="${esc(r.disqualificationReason || 'No executed fills — not ranked.')}" data-unranked="true"><b>unranked</b></td>`;
      const unrankedNote = r.qualified ? '' : `<span class="cell-sub">unranked — ${esc(r.disqualificationReason || 'no executed fills')}</span>`;
      return `
      <tr data-username="${esc(r.username)}">
        <td class="num">${esc(rank)}</td>
        <td>
          <div class="cell-trader">
            <span class="avatar">${esc(r.avatar || '🤖')}</span>
            <span>
              ${esc(r.username)}
              <span class="cell-sub">${esc(r.handle || '')} · ${esc(r.kind || 'algorithmic')}</span>
            </span>
          </div>
        </td>
        <td>${esc(r.title || '')}<span class="cell-sub">${esc(r.category || '')}</span>${unrankedNote}</td>
        ${returnCell}
        <td class="num">${esc(money(r.finalEquity))}</td>
        <td class="num">${esc(r.totalTrades ?? 0)}</td>
        <td class="num">${esc(r.totalTrades ? `${Number(r.winRate ?? 0).toFixed(1)}%` : '—')}</td>
        <td class="num">${esc(r.totalTrades ? `${Number(r.maxDrawdownPct ?? 0).toFixed(2)}%` : '—')}</td>
        <td class="num">${esc(money(r.feesPaid ?? 0))}</td>
        <td class="num" title="Contracts that could not fill against available depth">${esc(compact(r.unfilledContracts || 0))}</td>
        <td>${verdictPill(r.verdict)}</td>
      </tr>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ *
 * Sparkline (SVG, no library)
 * ------------------------------------------------------------------ */

export function sparkline(values, { width = 320, height = 54, baseline = null } = {}) {
  const vals = (values || []).map(Number).filter((v) => Number.isFinite(v));
  if (vals.length < 2) return `<svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pad = 3;
  const x = (i) => (i / (vals.length - 1)) * (width - pad * 2) + pad;
  const y = (v) => height - pad - ((v - min) / span) * (height - pad * 2);
  const pts = vals.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  const base = baseline !== null && Number.isFinite(Number(baseline)) ? y(Number(baseline)) : null;
  const area = `${pad},${height - pad} ${pts} ${width - pad},${height - pad}`;
  return `
  <svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Equity curve">
    ${base !== null && base >= 0 && base <= height ? `<line class="base" x1="0" x2="${width}" y1="${base.toFixed(2)}" y2="${base.toFixed(2)}"></line>` : ''}
    <polygon class="area" points="${area}"></polygon>
    <polyline class="line" points="${pts}" fill="none"></polyline>
  </svg>`;
}

/* ------------------------------------------------------------------ *
 * Attribution factor bars
 * ------------------------------------------------------------------ */

export function renderFactors(attributionOrFactors) {
  // Accepts either a plain factors array (legacy) or a whole attribution
  // object {factors, disclosures, reconciliation}.
  const isObj = Boolean(attributionOrFactors) && !Array.isArray(attributionOrFactors);
  const factors = isObj ? attributionOrFactors.factors || [] : attributionOrFactors || [];
  const disclosures = isObj ? attributionOrFactors.disclosures || [] : [];
  const rec = isObj ? attributionOrFactors.reconciliation : null;

  if (!factors.length && !disclosures.length) {
    return `<p class="muted">No attribution factors — this strategy produced no fills.</p>`;
  }

  const maxAbs = Math.max(
    ...factors.map((f) => Math.abs(Number(f.amountUsd) || 0)),
    ...disclosures.map((f) => Math.abs(Number(f.amountUsd) || 0)),
    1
  );

  const bar = (f, memo = false) => {
    const amt = Number(f.amountUsd) || 0;
    const w = Math.min(100, (Math.abs(amt) / maxAbs) * 100);
    const cls = amt > 0 ? 'bar-pos' : amt < 0 ? 'bar-neg' : 'bar-zero';
    const extra =
      f.contractsNotFilled !== undefined
        ? `<span class="muted"> · ${esc(compact(f.contractsNotFilled))} contracts not filled · ${esc(f.ordersFullyUnfilled || 0)} order(s) with no depth</span>`
        : '';
    return `
      <div class="factor${memo ? ' factor-memo' : ''}">
        <div class="factor-head">
          <span>${esc(f.factor)}${memo ? ' <span class="tag">memo · not summed</span>' : ''}</span>
          <span class="amt ${signedClass(amt)}">${amt === 0 ? 'disclosure' : esc(money(amt))}</span>
        </div>
        <div class="factor-bar ${cls}"><i style="width:${w.toFixed(1)}%"></i></div>
        <div class="factor-desc">${esc(f.description || '')}${extra}</div>
      </div>`;
  };

  const recLine = rec
    ? `<div class="notice ${rec.reconciles ? 'notice-good' : 'notice-bad'}" style="margin-top:.6rem">
         <strong>${rec.reconciles ? 'Reconciles' : 'DOES NOT RECONCILE'}</strong> —
         <code>${esc(rec.identity)}</code>:
         ${esc(money(rec.realizedPnl))} realized ${rec.unrealizedPnl >= 0 ? '+' : '−'} ${esc(money(Math.abs(rec.unrealizedPnl)))} unrealized
         − ${esc(money(rec.feesPaid))} fees = ${esc(money(rec.equityChange))}.
         Factor sum ${esc(money(rec.sumOfFactors))}, residual ${esc(money(rec.residual))}.
       </div>`
    : '';

  const memoBlock = disclosures.length
    ? `<div class="factor-memo-head">Memo items — real effects, already embedded in the factors above (summing them would double count)</div>` +
      disclosures.map((f) => bar(f, true)).join('')
    : '';

  return factors.map((f) => bar(f)).join('') + recLine + memoBlock;
}

/* ------------------------------------------------------------------ *
 * Order book ladder
 * ------------------------------------------------------------------ */

/**
 * Render one side of the book as a depth ladder.
 * @param {Array<{price:number,count:number}>} tiers sorted best-first
 * @param {'bid'|'ask'} kind
 * @param {object} [opts] { notional, showImplied }
 */
export function renderLadder(tiers, kind = 'bid', opts = {}) {
  if (!tiers || !tiers.length) return `<div class="rung-empty">No ${kind === 'bid' ? 'bids' : 'offers'} on this side.</div>`;
  const maxCount = Math.max(...tiers.map((t) => Number(t.count) || 0), 1);
  const notional = opts.notional ?? 1;
  let cum = 0;
  return tiers
    .map((t, i) => {
      const count = Number(t.count) || 0;
      cum += count;
      const w = (count / maxCount) * 100;
      const implied = kind === 'bid' ? (notional - Number(t.price)).toFixed(4) : Number(t.price).toFixed(4);
      return `
      <div class="rung ${kind} ${i === 0 ? 'best' : ''}" title="cumulative ${esc(compact(cum))} contracts">
        <i style="width:${w.toFixed(1)}%"></i>
        <span class="px">${esc(implied)}</span>
        <span>${esc(compact(count))}</span>
        <span class="muted">${esc(compact(cum))}</span>
      </div>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ *
 * Post-mortem
 * ------------------------------------------------------------------ */

export function renderPostMortem(analysis) {
  if (!analysis) return '';
  const block = (label, body) => (body ? `<h5>${esc(label)}</h5><p>${esc(body)}</p>` : '');
  const list = Array.isArray(analysis.factors) && analysis.factors.length
    ? `<h5>Computed cause factors</h5><ul class="rule-list">${analysis.factors.map((f) => `<li>${esc(typeof f === 'string' ? f : f.text || JSON.stringify(f))}</li>`).join('')}</ul>`
    : '';
  return `
    <div class="postmortem">
      ${block('Verdict', analysis.verdict)}
      ${block('Why it worked', analysis.whyItWorked)}
      ${block('Why it did not work', analysis.whyItFailed)}
      ${block('What caused the return', analysis.returnCauses || analysis.summary)}
      ${block('Honest caveats', analysis.caveats || analysis.limitations)}
      ${list}
    </div>`;
}

/* ------------------------------------------------------------------ *
 * Toasts
 * ------------------------------------------------------------------ */

export function toast(message, kind = 'info', ttl = 5200) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = esc(message);
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .25s';
    setTimeout(() => el.remove(), 260);
  }, ttl);
}

/* ------------------------------------------------------------------ *
 * Small DOM helpers
 * ------------------------------------------------------------------ */

export function $(selector, root = document) {
  return root.querySelector(selector);
}
export function $$(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}
export function setHTML(el, html) {
  if (typeof el === 'string') el = $(el);
  if (el) el.innerHTML = html;
}
export function setText(el, text) {
  if (typeof el === 'string') el = $(el);
  if (el) el.textContent = text;
}
export function on(el, event, handler, opts) {
  const node = typeof el === 'string' ? $(el) : el;
  if (node) node.addEventListener(event, handler, opts);
  return node;
}

/** External links always open safely in a new tab. */
export function link(url, label, opts = {}) {
  if (!url) return esc(label || '');
  return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer${opts.nofollow ? ' nofollow' : ''}">${esc(label || url)}</a>`;
}
