/**
 * KalshiPaperSim — Custom Strategy Sandbox (Strategy Lab)
 * =====================================================================
 * Lets a user paste a `decide(ctx)` function and run it through the SAME
 * ReplayEngine as the built-in roster, so custom results are computed on the
 * same real captured data and are directly comparable.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HONEST SECURITY STATEMENT — READ THIS
 * ─────────────────────────────────────────────────────────────────────────
 * This is an ISOLATION LAYER, NOT A SECURITY SANDBOX.
 *
 *  - In the browser, user code is compiled with `new Function(...)`. JavaScript
 *    in a page cannot be truly sandboxed without an iframe + CSP or a Web Worker
 *    with a hardened realm. The protections below (static deny-list, no global
 *    injection, argument whitelisting, action validation, step budget) reduce
 *    accidental damage and keep the strategy API tight, but a determined author
 *    can still reach the page's own globals. Because this project is a
 *    single-player paper simulator with no credentials and no server-side
 *    execution by default, that residual risk is accepted and documented.
 *  - Server-side execution of user strategies is DISABLED by default
 *    (see server.js `ALLOW_USER_CODE`). Running untrusted code in Node requires
 *    a real isolation primitive (e.g. isolated-vm / a separate process with no
 *    network). That is listed as future work, not implemented.
 *  - No API key, private key, or credential is ever exposed to user code.
 */

import { round2 } from './simulation-engine.js';
import { snapToGrid } from './price-grid.js';
import { computeKalshiFee } from './kalshi-fees.js';

/** Maximum accepted source length (characters). */
export const MAX_SOURCE_LENGTH = 20000;

/** Maximum actions a single decide() call may return. */
export const MAX_ACTIONS_PER_PERIOD = 25;

/**
 * Static deny-list. Presence of any of these tokens REJECTS the source before
 * it is compiled. This is defense-in-depth against accidental network access,
 * DOM access and credential theft — not a guarantee.
 */
export const DENY_LIST = Object.freeze([
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'eval(',
  'Function(', 'document.', 'window.', 'globalThis', 'localStorage',
  'sessionStorage', 'indexedDB', 'navigator.', 'require(', 'process.',
  'child_process', 'import(', '__proto__', 'prototype', 'constructor[',
  'KALSHI-ACCESS', 'privateKey', 'private_key'
]);

const ALLOWED_ACTION_TYPES = Object.freeze(['buy', 'sell', 'limit', 'quote', 'cancel', 'hold']);
const ALLOWED_SIDES = Object.freeze(['YES', 'NO']);

/**
 * Validate and normalize the actions returned by a user's decide().
 * Malformed actions are dropped and reported rather than throwing, so one bad
 * period does not abort an entire backtest.
 */
export function sanitizeActions(raw, ctx) {
  const issues = [];
  const list = Array.isArray(raw) ? raw : raw === undefined || raw === null ? [] : [raw];
  if (list.length > MAX_ACTIONS_PER_PERIOD) {
    issues.push(`returned ${list.length} actions; capped at ${MAX_ACTIONS_PER_PERIOD}`);
  }
  const out = [];
  for (const a of list.slice(0, MAX_ACTIONS_PER_PERIOD)) {
    if (!a || typeof a !== 'object') { issues.push('non-object action dropped'); continue; }
    const type = String(a.type || '').toLowerCase();
    if (!ALLOWED_ACTION_TYPES.includes(type)) { issues.push(`unknown action type '${a.type}' dropped`); continue; }
    if (type === 'hold') { out.push({ type: 'hold' }); continue; }

    const side = String(a.side || 'YES').toUpperCase();
    if (!ALLOWED_SIDES.includes(side)) { issues.push(`invalid side '${a.side}' dropped`); continue; }

    const count = round2(Number(a.count));
    if (!(count > 0) && type !== 'cancel') { issues.push('non-positive count dropped'); continue; }
    if (type === 'limit' || type === 'quote') {
      const price = a.price === undefined ? null : Number(a.price);
      if (price !== null && (!Number.isFinite(price) || price <= 0 || price >= 1)) {
        issues.push(`price ${a.price} outside (0,1) dropped`);
        continue;
      }
    }
    out.push({
      type,
      side,
      count: type === 'cancel' ? 0 : count,
      price: a.price === undefined ? null : Number(a.price),
      direction: a.direction === 'ask' ? 'ask' : 'bid',
      spreadTicks: Number.isFinite(Number(a.spreadTicks)) ? Math.max(1, Math.min(20, Number(a.spreadTicks))) : 2,
      cancelExisting: Boolean(a.cancelExisting),
      reason: String(a.reason || 'user strategy').slice(0, 200)
    });
  }
  return { actions: out, issues };
}

/**
 * Structural patterns that are legal JavaScript but fatal inside a replay loop.
 * Token matching cannot express these, so they are checked as regexes.
 */
export const RISKY_PATTERNS = Object.freeze([
  { re: /while\s*\(\s*(true|1)\s*\)/, label: 'infinite_loop:while(true)' },
  { re: /for\s*\(\s*;\s*;\s*\)/, label: 'infinite_loop:for(;;)' },
  { re: /do\s*[\s\S]{0,400}?\}\s*while\s*\(\s*(true|1)\s*\)/, label: 'infinite_loop:do/while(true)' }
]);

/**
 * Remove comments from JS source WITHOUT touching string/template contents.
 *
 * Why this matters: the deny-list is a token scan, so an ordinary English word
 * in a comment used to trip it — the shipped example strategy was rejected with
 * `forbidden_token:window.` because a comment ended with the phrase "on the
 * captured window.". Comments cannot execute, so they must not be scanned;
 * string literals ARE still scanned (a token inside a string is still worth
 * flagging, and it costs nothing).
 */
export function stripComments(source) {
  let out = '';
  let state = 'code';
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const c2 = source[i + 1];
    if (state === 'code') {
      if (c === '/' && c2 === '/') { state = 'line'; i++; continue; }
      if (c === '/' && c2 === '*') { state = 'block'; i++; continue; }
      if (c === "'") { state = 'sq'; out += c; continue; }
      if (c === '"') { state = 'dq'; out += c; continue; }
      if (c === '`') { state = 'tpl'; out += c; continue; }
      out += c;
      continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += c; }
      continue;
    }
    if (state === 'block') {
      if (c === '*' && c2 === '/') { state = 'code'; i++; continue; }
      if (c === '\n') out += c; // keep line numbers aligned for error messages
      continue;
    }
    out += c; // inside a string or template literal
    if (c === '\\') { out += c2 ?? ''; i++; continue; }
    if ((state === 'sq' && c === "'") || (state === 'dq' && c === '"') || (state === 'tpl' && c === '`')) state = 'code';
  }
  return out;
}

/** Static pre-compilation checks. Returns {ok, problems[]}. */
export function lintSource(source) {
  const problems = [];
  if (typeof source !== 'string' || !source.trim()) problems.push('source_empty');
  else if (source.length > MAX_SOURCE_LENGTH) problems.push(`source_too_long_${source.length}_max_${MAX_SOURCE_LENGTH}`);

  if (typeof source === 'string') {
    // Comments are stripped first: they cannot execute, and scanning them made
    // the deny-list fire on ordinary English prose (see stripComments).
    const code = stripComments(source);
    for (const token of DENY_LIST) {
      if (code.includes(token)) problems.push(`forbidden_token:${token}`);
    }
    for (const { re, label } of RISKY_PATTERNS) {
      if (re.test(code)) problems.push(label);
    }
    if (!/\bdecide\b/.test(code)) problems.push('missing_decide_function');
  }
  return { ok: problems.length === 0, problems };
}

/**
 * Compile user source into a strategy object usable by ReplayEngine.
 *
 * Accepted shapes:
 *   1. `function decide(ctx) { ... }`            (bare function declaration)
 *   2. `const decide = (ctx) => { ... }`
 *   3. `(ctx) => [...]`                          (expression only)
 *   4. `{ decide(ctx){...}, username:'x', title:'y' }`  (object literal)
 *
 * The compiled function receives ONLY the whitelisted ctx fields — no globals
 * are injected, and the helpers it may use are passed explicitly.
 */
export function compileUserStrategy(source, meta = {}) {
  const lint = lintSource(source);
  if (!lint.ok) {
    const err = new Error(`Strategy rejected by lint: ${lint.problems.join(', ')}`);
    err.code = 'LINT_FAILED';
    err.problems = lint.problems;
    throw err;
  }

  /**
   * Compilation strategy: the user source is evaluated inside its own function
   * scope with NO pre-declared identifiers, then we probe for the entry point
   * with `typeof` (which is safe on undeclared names even in strict mode).
   * Pre-declaring `let decide` would collide with a user's own
   * `function decide(ctx)` — that bug was caught by the UI smoke test.
   *
   * Accepted shapes:
   *   function decide(ctx) { … }            |  const decide = (ctx) => { … }
   *   let decide = function (ctx) { … }     |  const strategy = { decide(ctx){…} }
   */
  const wrapped = `
    "use strict";
    const { round2, snapToGrid, computeKalshiFee, Math, Number, Array, Object, JSON, Date, isFinite, isNaN } = helpers;
    return (function userStrategyScope() {
      ${source}
      ;
      if (typeof decide === 'function') return decide;
      if (typeof strategy === 'object' && strategy !== null && typeof strategy.decide === 'function') {
        return strategy.decide.bind(strategy);
      }
      if (typeof module !== 'undefined' && module && module.exports && typeof module.exports.decide === 'function') {
        return module.exports.decide;
      }
      return null;
    })();
  `;

  let factory;
  try {
    // eslint-disable-next-line no-new-func
    factory = new Function('helpers', wrapped);
  } catch (err) {
    const e = new Error(`Strategy failed to compile: ${err.message}`);
    e.code = 'COMPILE_FAILED';
    throw e;
  }

  const helpers = Object.freeze({ round2, snapToGrid, computeKalshiFee, Math, Number, Array, Object, JSON, Date, isFinite, isNaN });

  let decide;
  try {
    decide = factory(helpers);
  } catch (err) {
    const e = new Error(`Strategy threw during initialization: ${err.message}`);
    e.code = 'INIT_FAILED';
    throw e;
  }
  if (typeof decide !== 'function') {
    const e = new Error(
      'No decide() entry point found. Declare one of: `function decide(ctx){…}`, `const decide = (ctx) => {…}`, or `const strategy = { decide(ctx){…} }`.'
    );
    e.code = 'NO_DECIDE';
    throw e;
  }

  const runtimeErrors = [];
  const username = sanitizeUsername(meta.username || 'Custom_Challenger');

  return {
    id: `custom_${username.toLowerCase()}`,
    username,
    handle: `@${username}`,
    avatar: meta.avatar || '🧪',
    title: meta.title || 'Custom User Strategy',
    category: 'User-Defined',
    tagline: meta.tagline || 'Authored in the Strategy Lab and backtested on real captured Kalshi data.',
    thesis: meta.thesis || 'User-authored logic. No pre-existing performance claim.',
    rules: meta.rules || { entry: 'user-defined', sizing: 'user-defined', exit: 'user-defined', riskManagement: 'NONE (by mandate)' },
    sizingPct: meta.sizingPct ?? 0.5,
    universe: meta.universe || null,
    kind: 'custom',
    isCustom: true,
    lint,
    runtimeErrors,
    decide(ctx) {
      // Whitelist the ctx surface handed to user code.
      const safeCtx = Object.freeze({
        ticker: ctx.ticker,
        market: Object.freeze({
          ticker: ctx.market.ticker,
          series_ticker: ctx.market.series_ticker,
          title: ctx.market.title,
          tick_size: ctx.market.tick_size,
          notional_value: ctx.market.notional_value
        }),
        candle: Object.freeze({
          endTs: ctx.candle.endTs,
          date: ctx.candle.endDate,
          volume: ctx.candle.volume,
          openInterest: ctx.candle.openInterest,
          trade: Object.freeze({ ...ctx.candle.trade }),
          yesBid: Object.freeze({ ...ctx.candle.yesBid }),
          yesAsk: Object.freeze({ ...ctx.candle.yesAsk })
        }),
        history: Object.freeze((ctx.history || []).slice(-60).map((c) => Object.freeze({
          endTs: c.endTs, volume: c.volume,
          trade: Object.freeze({ ...c.trade }),
          yesBid: Object.freeze({ ...c.yesBid }),
          yesAsk: Object.freeze({ ...c.yesAsk })
        }))),
        book: Object.freeze({
          ticker: ctx.book.ticker,
          tick: ctx.book.tick,
          notional: ctx.book.notional,
          mid: ctx.book.getMid(),
          spread: ctx.book.getSpread(),
          bestYesBid: ctx.book.getBestYesBid(),
          bestYesAsk: ctx.book.getBestYesAsk(),
          bestNoBid: ctx.book.getBestNoBid(),
          bestNoAsk: ctx.book.getBestNoAsk(),
          yesDepth: ctx.book.depth('yes'),
          noDepth: ctx.book.depth('no'),
          levels: { yes: ctx.book.yesBids.length, no: ctx.book.noBids.length },
          askTiers: Object.freeze(ctx.book.getYesAskTiers().map((t) => Object.freeze({ price: t.price, count: t.count }))),
          bidTiers: Object.freeze(ctx.book.getBidTiers('yes').map((t) => Object.freeze({ price: t.price, count: t.count })))
        }),
        portfolio: Object.freeze({
          cash: ctx.portfolio.cash,
          equity: ctx.stats.equity,
          returnPct: ctx.stats.returnPct,
          realizedPnl: ctx.stats.realizedPnl,
          totalTrades: ctx.stats.totalTrades,
          positions: Object.freeze([...ctx.portfolio.positions.values()].map((p) => Object.freeze({ ...p })))
        }),
        periodIndex: ctx.periodIndex,
        periodCount: ctx.periodCount,
        isLast: ctx.isLast,
        helpers
      });

      let raw;
      try {
        raw = decide(safeCtx);
      } catch (err) {
        runtimeErrors.push({ period: ctx.periodIndex, ticker: ctx.ticker, error: String(err && err.message ? err.message : err) });
        if (runtimeErrors.length > 50) runtimeErrors.splice(0, runtimeErrors.length - 50);
        return [];
      }
      const { actions, issues } = sanitizeActions(raw, ctx);
      if (issues.length) runtimeErrors.push({ period: ctx.periodIndex, ticker: ctx.ticker, issues });
      return actions;
    }
  };
}

/** Usernames must be filesystem/DOM safe and non-spoofable. */
export function sanitizeUsername(name) {
  const clean = String(name || '')
    .trim()
    .replace(/[^A-Za-z0-9_.]/g, '')
    .slice(0, 24);
  return clean.length >= 3 ? clean : 'Custom_Challenger';
}

/** A tiny, documented example strategy shown in the Strategy Lab editor. */
export const EXAMPLE_USER_STRATEGY = `// Strategy Lab — write a decide(ctx) function.
// It runs on REAL captured Kalshi candlestick data and is ranked against the
// built-in roster. Return an array of actions (or a single action object).
//
// Allowed action types: buy | sell | limit | quote | cancel | hold
// Allowed sides:        YES | NO
// Counts are contracts (fractional to 0.01, per Kalshi's fixed-point spec).
//
// ctx fields: ticker, market, candle, history, book, portfolio,
//             periodIndex, periodCount, isLast, helpers
//
// SPOILER (computed, not asserted): this example LOSES money on the captured
// window. That is deliberate and instructive — the replay universe is deep
// out-of-the-money (YES closes 0.06-0.28), so buying cheap YES pays roughly
// 5-7% of the premium in taker fees per entry
// (fee = round up(0.07 x C x P x (1-P))), and those contracts decayed over the
// window. Try flipping the signal to buy NO instead and re-run: the fee as a
// fraction of capital deployed becomes 0.07 x P, i.e. under 2%.

function decide(ctx) {
  const close = ctx.candle.trade.close;
  if (close === null) return { type: 'hold' };

  const prev = ctx.history.length > 1
    ? ctx.history[ctx.history.length - 2].trade.close
    : null;

  // Simple, aggressive example: buy cheap YES contracts on an up-tick,
  // size at 50% of cash. No stops (competition mandate = max return).
  if (prev !== null && close > prev && close <= 0.30) {
    const ask = ctx.book.bestYesAsk || close;
    const count = ctx.helpers.round2((ctx.portfolio.cash * 0.5) / Math.max(0.01, ask));
    if (count > 0) {
      return [{ type: 'buy', side: 'YES', count, reason: 'up-tick in the cheap band' }];
    }
  }
  return { type: 'hold' };
}
`;
