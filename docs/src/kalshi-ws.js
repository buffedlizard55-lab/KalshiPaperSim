/**
 * KalshiPaperSim — Kalshi WebSocket Feed Manager
 * =====================================================================
 * Verified protocol details (https://docs.kalshi.com/getting_started/quick_start_websockets):
 *
 *  Connection URL (recommended): wss://external-api-ws.kalshi.com/trade-api/ws/v2
 *  Legacy also-supported host  : wss://api.elections.kalshi.com/trade-api/ws/v2
 *  Demo                        : wss://external-api-ws.demo.kalshi.co/trade-api/ws/v2
 *
 *  Authentication: REQUIRED at handshake via
 *    KALSHI-ACCESS-KEY / KALSHI-ACCESS-SIGNATURE / KALSHI-ACCESS-TIMESTAMP
 *    signature = RSA-PSS(SHA-256) over  timestamp + "GET" + "/trade-api/ws/v2"
 *
 *  Subscribe command shape (verbatim from the docs):
 *    {"id":1,"cmd":"subscribe","params":{"channels":["ticker"]}}
 *    {"id":2,"cmd":"subscribe","params":{"channels":["orderbook_delta"],
 *                                        "market_tickers":["KXFUT24-LSV"]}}
 *
 *  Channels:
 *    public market data : ticker, trade, market_lifecycle_v2,
 *                         multivariate_market_lifecycle, multivariate
 *    private            : orderbook_delta, fill, market_positions,
 *                         communications, order_group_updates
 *
 *  Message envelope: { id?, type, msg } where type is e.g. "ticker",
 *    "orderbook_snapshot", "orderbook_delta", "trade", "error".
 *    Error shape (verbatim): {"id":123,"type":"error","msg":{"code":2,"msg":"Params required"}}
 *
 *  Lifecycle: "Handle Disconnects: Implement reconnection logic with
 *              exponential backoff."
 *
 * ARCHITECTURE (why three modes exist)
 * ------------------------------------
 *  A browser CANNOT set handshake headers, so it can never talk to Kalshi's
 *  WebSocket directly. Therefore:
 *    mode 'upstream' — Node only. Connects to Kalshi with signed headers and
 *                       relays messages to browser clients.
 *    mode 'relay'    — Browser. Connects to OUR server's /ws/feed endpoint.
 *    mode 'sim'      — Local simulation feed. Used when no credentials or no
 *                       network path exist, and always labelled SIMULATED.
 */

import { KALSHI_ENDPOINTS, WS_CHANNELS, WS_SIGN_PATH } from './kalshi-config.js';
import { dollarsToNumber } from './price-grid.js';

export const FEED_MODE = Object.freeze({ UPSTREAM: 'upstream', RELAY: 'relay', SIM: 'sim' });

/** Build the documented subscribe command. */
export function subscribeMessage(id, channels, marketTickers = null) {
  const params = { channels: Array.isArray(channels) ? channels : [channels] };
  if (marketTickers && marketTickers.length) params.market_tickers = marketTickers;
  return { id, cmd: 'subscribe', params };
}

/** Parse a raw WS payload into a normalized internal event. */
export function parseFeedMessage(raw) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { type: 'unparseable', raw: String(raw).slice(0, 300), at: new Date().toISOString() };
  }
  const type = data && data.type;
  // Documented wire shape nests the payload: {"id":..,"type":"ticker","msg":{...}}.
  // Fall back to the envelope itself so a flat payload still parses (the ticker
  // lives at msg.market_ticker in the documented shape).
  const msg = (data && data.msg) || (data && typeof data === 'object' ? data : {});

  switch (type) {
    case 'ticker':
      // Verified field names from the docs' processing example:
      //   data["msg"]["market_ticker"], data["msg"]["yes_bid_dollars"],
      //   data["msg"]["yes_ask_dollars"]
      return {
        type: 'ticker',
        id: data.id ?? null,
        ticker: msg.market_ticker || msg.ticker || null,
        yesBid: dollarsToNumber(msg.yes_bid_dollars ?? msg.yes_bid),
        yesAsk: dollarsToNumber(msg.yes_ask_dollars ?? msg.yes_ask),
        lastPrice: dollarsToNumber(msg.last_price_dollars ?? msg.last_price),
        volume: dollarsToNumber(msg.volume_fp ?? msg.volume),
        ts: msg.ts || msg.timestamp || Date.now(),
        raw: msg
      };
    case 'orderbook_snapshot':
    case 'orderbook_delta':
      return {
        type,
        id: data.id ?? null,
        ticker: msg.market_ticker || null,
        yesDollars: msg.yes_dollars || msg.orderbook_fp?.yes_dollars || null,
        noDollars: msg.no_dollars || msg.orderbook_fp?.no_dollars || null,
        clientOrderId: msg.client_order_id ?? null,
        raw: msg
      };
    case 'trade':
      return {
        type: 'trade',
        id: data.id ?? null,
        ticker: msg.market_ticker || null,
        price: dollarsToNumber(msg.price_dollars ?? msg.price),
        size: dollarsToNumber(msg.size_fp ?? msg.size),
        side: msg.outcome_side || msg.side || null,
        ts: msg.ts || null,
        raw: msg
      };
    case 'market_lifecycle_v2':
    case 'price_level_structure_updated':
      return { type, id: data.id ?? null, ticker: msg.market_ticker || null, raw: msg };
    case 'error':
      return { type: 'error', id: data.id ?? null, code: msg.code ?? null, message: msg.msg ?? '', raw: msg };
    case 'subscribed':
    case 'ok':
      return { type: 'subscribed', id: data.id ?? null, raw: msg };
    default:
      return { type: type || 'unknown', id: data?.id ?? null, raw: msg };
  }
}

/** Exponential backoff schedule (ms) with jitter-free determinism for tests. */
export function backoffDelay(attempt, { base = 500, cap = 30000, factor = 2 } = {}) {
  const a = Math.max(0, Number(attempt) || 0);
  return Math.min(cap, base * Math.pow(factor, a));
}

/**
 * Browser-side feed client. Connects to OUR relay endpoint (same origin, so it
 * works behind the Arena preview proxy and on GitHub Pages when a relay is
 * available). Falls back to the local simulation feed.
 */
export class RelayFeedClient {
  /**
   * @param {object} [opts]
   * @param {string} [opts.url='/ws/feed']
   * @param {string[]} [opts.channels]
   * @param {string[]} [opts.tickers]
   * @param {(event:object)=>void} [opts.onEvent]
   * @param {(status:object)=>void} [opts.onStatus]
   */
  constructor(opts = {}) {
    this.url = opts.url || '/ws/feed';
    this.channels = opts.channels || ['ticker'];
    this.tickers = opts.tickers || [];
    this.onEvent = opts.onEvent || (() => {});
    this.onStatus = opts.onStatus || (() => {});
    this.mode = FEED_MODE.SIM;
    this.ws = null;
    this.attempt = 0;
    this.maxAttempts = opts.maxAttempts ?? 6;
    this.reconnectTimer = null;
    this.closedByUser = false;
    this.messageCount = 0;
    this.lastMessageAt = null;
    this.statusHistory = [];
  }

  _status(patch) {
    const s = {
      mode: this.mode,
      connected: Boolean(this.ws && this.ws.readyState === 1),
      attempt: this.attempt,
      messages: this.messageCount,
      lastMessageAt: this.lastMessageAt,
      url: this.url,
      at: new Date().toISOString(),
      ...patch
    };
    this.statusHistory.push(s);
    if (this.statusHistory.length > 50) this.statusHistory.shift();
    this.onStatus(s);
    return s;
  }

  connect() {
    this.closedByUser = false;
    if (typeof WebSocket !== 'function') {
      this.mode = FEED_MODE.SIM;
      return this._status({ reason: 'websocket_unavailable_in_this_runtime', degraded: true });
    }
    try {
      // Same-origin relative URL keeps this working behind HTTP proxies.
      const wsUrl = this.url.startsWith('ws') ? this.url : `${typeof location !== 'undefined' && location.protocol === 'https:' ? 'wss:' : 'ws:'}//${typeof location !== 'undefined' ? location.host : 'localhost:3000'}${this.url}`;
      this.ws = new WebSocket(wsUrl);
    } catch (err) {
      this.mode = FEED_MODE.SIM;
      return this._status({ reason: `construct_failed: ${err.message}`, degraded: true });
    }

    this.ws.onopen = () => {
      this.attempt = 0;
      this.mode = FEED_MODE.RELAY;
      this._status({ event: 'open' });
      try {
        this.ws.send(JSON.stringify(subscribeMessage(1, this.channels, this.tickers.length ? this.tickers : null)));
      } catch { /* ignore */ }
    };

    this.ws.onmessage = (ev) => {
      this.messageCount += 1;
      this.lastMessageAt = new Date().toISOString();
      const parsed = parseFeedMessage(ev.data);
      if (parsed.type === 'feed_status') {
        this._status({ upstream: parsed.raw });
        return;
      }
      this.onEvent(parsed);
    };

    this.ws.onerror = () => this._status({ event: 'error' });

    this.ws.onclose = (ev) => {
      this.ws = null;
      this._status({ event: 'close', code: ev.code, reason: ev.reason });
      if (this.closedByUser) return;
      if (this.attempt < this.maxAttempts) {
        const delay = backoffDelay(this.attempt);
        this.attempt += 1;
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
      } else {
        this.mode = FEED_MODE.SIM;
        this._status({ degraded: true, reason: 'relay_unreachable_after_backoff', note: 'Fell back to the local simulation feed. This is NOT live Kalshi data.' });
      }
    };
    return this._status({ event: 'connecting' });
  }

  subscribe(channels, tickers) {
    this.channels = channels || this.channels;
    this.tickers = tickers || this.tickers;
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(subscribeMessage(Date.now() % 100000, this.channels, this.tickers.length ? this.tickers : null)));
    }
  }

  disconnect() {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.ws) {
      try { this.ws.close(1000, 'client disconnect'); } catch { /* noop */ }
      this.ws = null;
    }
    this.mode = FEED_MODE.SIM;
    return this._status({ event: 'disconnected_by_user' });
  }
}

/**
 * Node-side upstream manager. Connects to Kalshi with signed headers and
 * forwards normalized events to a callback (used by the server relay).
 *
 * Credentials are read from the environment ONLY (src/kalshi-auth.js). If they
 * are absent, the manager refuses to connect and reports the reason — it never
 * pretends to be live.
 */
export class UpstreamFeedManager {
  /**
   * @param {object} opts
   * @param {object} opts.credentials  { configured, keyId, privateKeyPem, environment }
   * @param {string[]} [opts.channels]
   * @param {string[]} [opts.tickers]
   * @param {(event:object)=>void} [opts.onEvent]
   * @param {(status:object)=>void} [opts.onStatus]
   * @param {(conn:object)=>object} [opts.connectImpl] injectable for tests
   */
  constructor(opts) {
    this.credentials = opts.credentials || { configured: false };
    this.channels = opts.channels || ['ticker'];
    this.tickers = opts.tickers || [];
    this.onEvent = opts.onEvent || (() => {});
    this.onStatus = opts.onStatus || (() => {});
    this.connectImpl = opts.connectImpl || null;
    this.conn = null;
    this.attempt = 0;
    this.maxAttempts = opts.maxAttempts ?? 8;
    this.closedByUser = false;
    this.timer = null;
    this.subId = 1;
    this.stats = { messages: 0, connectedAt: null, lastMessageAt: null, errors: [] };
  }

  get url() {
    const env = this.credentials.environment === 'demo' ? 'demo' : 'production';
    return KALSHI_ENDPOINTS.websocket[env];
  }

  _status(patch) {
    const s = {
      mode: FEED_MODE.UPSTREAM,
      url: this.url,
      connected: Boolean(this.conn && !this.conn.closed),
      credentialsConfigured: Boolean(this.credentials.configured),
      attempt: this.attempt,
      ...this.stats,
      at: new Date().toISOString(),
      ...patch
    };
    this.onStatus(s);
    return s;
  }

  async connect() {
    if (!this.credentials.configured) {
      return this._status({
        refused: true,
        reason: 'no_credentials',
        detail:
          'Kalshi WebSocket connections require authenticated handshake headers (KALSHI-ACCESS-KEY / -SIGNATURE / -TIMESTAMP). ' +
          'Set KALSHI_API_KEY_ID and KALSHI_API_PRIVATE_KEY (or KALSHI_API_PRIVATE_KEY_PATH) in the server environment to enable the live feed. ' +
          `Signature is RSA-PSS(SHA-256) over timestamp + "GET" + "${WS_SIGN_PATH}". ` +
          'Source: https://docs.kalshi.com/getting_started/quick_start_websockets',
        channelsAvailableWhenAuthenticated: WS_CHANNELS
      });
    }
    if (!this.connectImpl) {
      return this._status({ refused: true, reason: 'connect_impl_unavailable', detail: 'ws-lite connectUpstream was not injected (browser context).' });
    }

    try {
      // Sign at handshake time using the documented message.
      const { buildWsAuthHeaders } = await import('./kalshi-auth.js');
      const { headers } = buildWsAuthHeaders({
        keyId: this.credentials.keyId,
        privateKeyPem: this.credentials.privateKeyPem
      });
      this.conn = await this.connectImpl(this.url, { headers, timeoutMs: 15000 });
      this.attempt = 0;
      this.stats.connectedAt = new Date().toISOString();

      this.conn.on('message', (raw) => {
        this.stats.messages += 1;
        this.stats.lastMessageAt = new Date().toISOString();
        const parsed = parseFeedMessage(raw);
        if (parsed.type === 'error') {
          this.stats.errors.push({ at: parsed.at || new Date().toISOString(), code: parsed.code, message: parsed.message });
          if (this.stats.errors.length > 20) this.stats.errors.shift();
        }
        this.onEvent(parsed);
      });
      this.conn.on('close', () => {
        this.conn = null;
        this._status({ event: 'closed' });
        this._scheduleReconnect();
      });
      this.conn.on('error', (err) => {
        this.stats.errors.push({ at: new Date().toISOString(), message: String(err && err.message ? err.message : err) });
        this._status({ event: 'error' });
      });

      this.conn.sendJSON(subscribeMessage(this.subId++, this.channels, this.tickers.length ? this.tickers : null));
      return this._status({ event: 'connected' });
    } catch (err) {
      this.conn = null;
      this._status({ event: 'connect_failed', reason: String(err && err.message ? err.message : err) });
      this._scheduleReconnect();
      return null;
    }
  }

  _scheduleReconnect() {
    if (this.closedByUser) return;
    if (this.attempt >= this.maxAttempts) {
      this._status({ gaveUp: true, reason: 'max_reconnect_attempts_reached' });
      return;
    }
    const delay = backoffDelay(this.attempt);
    this.attempt += 1;
    this.timer = setTimeout(() => { this.connect(); }, delay);
  }

  disconnect() {
    this.closedByUser = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.conn) {
      try { this.conn.close(1000, 'manager shutdown'); } catch { /* noop */ }
      this.conn = null;
    }
    return this._status({ event: 'disconnected' });
  }
}
