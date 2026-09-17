/**
 * KalshiPaperSim — Minimal RFC 6455 WebSocket layer (zero dependencies)
 * =====================================================================
 * Provides:
 *   1. `attachWebSocketServer(httpServer, opts)` — accept browser connections
 *      on a path (used for the live-feed relay at /ws/feed).
 *   2. `connectUpstream(url, opts)` — a WebSocket CLIENT that can send custom
 *      HTTP headers during the handshake.
 *
 * WHY A CUSTOM CLIENT IS REQUIRED (verified constraint)
 * -----------------------------------------------------
 * Kalshi's WebSocket requires authenticated headers at handshake time:
 *   KALSHI-ACCESS-KEY / KALSHI-ACCESS-SIGNATURE / KALSHI-ACCESS-TIMESTAMP
 *   "WebSocket connections require authentication during the connection
 *    handshake."  https://docs.kalshi.com/getting_started/quick_start_websockets
 * The browser WebSocket API cannot set request headers, so a browser can NEVER
 * connect to Kalshi's WebSocket directly. A server-side relay is mandatory.
 * Recorded as IRREGULARITIES.md #3.
 *
 * Implemented subsets (documented limitations):
 *   - Text and binary frames, single-frame and continuation-fragmented messages.
 *   - Ping/pong and close control frames.
 *   - Payload lengths up to 2^53-1 (64-bit length parsed via hi/lo 32-bit words).
 *   - NO permessage-deflate extension (negotiated extensions are ignored).
 *   - NO automatic reconnect here; reconnection/backoff lives in the caller
 *     (src/kalshi-ws.js) because the docs say: "Implement reconnection logic
 *     with exponential backoff."
 */

import crypto from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import { EventEmitter } from 'node:events';

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // RFC 6455 magic string

const OP = Object.freeze({ CONT: 0x0, TEXT: 0x1, BIN: 0x2, CLOSE: 0x8, PING: 0x9, PONG: 0xa });

/** Compute Sec-WebSocket-Accept from the client's Sec-WebSocket-Key. */
export function acceptKey(key) {
  return crypto.createHash('sha1').update(String(key) + WS_GUID).digest('base64');
}

/* ------------------------------------------------------------------ *
 * Frame codec
 * ------------------------------------------------------------------ */

/**
 * Encode a frame. Server->client frames MUST NOT be masked (RFC 6455 §5.1).
 * @param {Buffer|string} payload
 * @param {number} opcode
 * @param {boolean} [mask] set true for client->server frames
 */
export function encodeFrame(payload, opcode = OP.TEXT, mask = false) {
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload), 'utf8');
  const len = data.length;
  let header;

  if (len < 126) {
    header = Buffer.alloc(2);
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    // Write the 64-bit length as hi/lo 32-bit words.
    header.writeUInt32BE(Math.floor(len / 2 ** 32), 2);
    header.writeUInt32BE(len >>> 0, 6);
  }
  header[0] = 0x80 | opcode; // FIN + opcode

  if (mask) {
    const maskKey = crypto.randomBytes(4);
    header[1] |= 0x80;
    const masked = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i++) masked[i] = data[i] ^ maskKey[i & 3];
    return Buffer.concat([header, maskKey, masked]);
  }
  return Buffer.concat([header, data]);
}

/**
 * Incremental frame parser. Feed it bytes; it emits complete messages.
 * Handles fragmentation (continuation frames) and control frames interleaved.
 */
export class FrameParser extends EventEmitter {
  constructor({ expectMasked = true } = {}) {
    super();
    this.buffer = Buffer.alloc(0);
    this.expectMasked = expectMasked;
    this.fragOp = null;
    this.fragChunks = [];
  }

  feed(chunk) {
    this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;
    for (;;) {
      const frame = this._tryParse();
      if (!frame) break;
      this._handle(frame);
    }
  }

  _tryParse() {
    const buf = this.buffer;
    if (buf.length < 2) return null;
    const b0 = buf[0];
    const b1 = buf[1];
    const fin = (b0 & 0x80) !== 0;
    const rsv = (b0 & 0x70) >>> 4;
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let offset = 2;

    if (rsv !== 0) {
      this.emit('error', new Error('Non-zero RSV bits: no extensions negotiated'));
      this.buffer = Buffer.alloc(0);
      return null;
    }
    if (this.expectMasked && !masked) {
      this.emit('error', new Error('Client frame was not masked (RFC 6455 requires masking)'));
      this.buffer = Buffer.alloc(0);
      return null;
    }

    if (len === 126) {
      if (buf.length < offset + 2) return null;
      len = buf.readUInt16BE(offset);
      offset += 2;
    } else if (len === 127) {
      if (buf.length < offset + 8) return null;
      const hi = buf.readUInt32BE(offset);
      const lo = buf.readUInt32BE(offset + 4);
      if (hi > 0x00100000) {
        this.emit('error', new Error('Frame length exceeds supported maximum'));
        this.buffer = Buffer.alloc(0);
        return null;
      }
      len = hi * 2 ** 32 + lo;
      offset += 8;
    }

    let maskKey = null;
    if (masked) {
      if (buf.length < offset + 4) return null;
      maskKey = buf.subarray(offset, offset + 4);
      offset += 4;
    }
    if (buf.length < offset + len) return null;

    let payload = buf.subarray(offset, offset + len);
    if (maskKey) {
      const out = Buffer.allocUnsafe(len);
      for (let i = 0; i < len; i++) out[i] = payload[i] ^ maskKey[i & 3];
      payload = out;
    }
    this.buffer = buf.subarray(offset + len);
    return { fin, opcode, payload };
  }

  _handle({ fin, opcode, payload }) {
    switch (opcode) {
      case OP.PING:
        this.emit('ping', payload);
        break;
      case OP.PONG:
        this.emit('pong', payload);
        break;
      case OP.CLOSE: {
        let code = null;
        let reason = '';
        if (payload.length >= 2) {
          code = payload.readUInt16BE(0);
          reason = payload.subarray(2).toString('utf8');
        }
        this.emit('close', { code, reason });
        break;
      }
      case OP.CONT:
        this.fragChunks.push(payload);
        if (fin) {
          const full = Buffer.concat(this.fragChunks);
          this.fragChunks = [];
          this.emit('message', this.fragOp === OP.BIN ? full : full.toString('utf8'), { binary: this.fragOp === OP.BIN });
          this.fragOp = null;
        }
        break;
      case OP.TEXT:
      case OP.BIN:
        if (fin) {
          this.emit('message', opcode === OP.BIN ? payload : payload.toString('utf8'), { binary: opcode === OP.BIN });
        } else {
          this.fragOp = opcode;
          this.fragChunks = [payload];
        }
        break;
      default:
        this.emit('error', new Error(`Unknown opcode 0x${opcode.toString(16)}`));
    }
  }
}

/* ------------------------------------------------------------------ *
 * Server side
 * ------------------------------------------------------------------ */

/**
 * Attach a WebSocket endpoint to an existing http.Server.
 * @param {http.Server} server
 * @param {object} opts
 * @param {string} [opts.path='/ws']
 * @param {(conn:ServerConnection, req:object)=>void} [opts.onConnection]
 * @returns {{clients:Set<ServerConnection>, broadcast:(data:string)=>number, closeAll:()=>void}}
 */
export function attachWebSocketServer(server, opts = {}) {
  const path = opts.path || '/ws';
  const clients = new Set();

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname !== path) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }
    const key = req.headers['sec-websocket-key'];
    if (!key || String(req.headers.upgrade || '').toLowerCase() !== 'websocket') {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    socket.setNoDelay(true);
    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey(key)}`,
        '\r\n'
      ].join('\r\n')
    );

    const conn = new ServerConnection(socket, { url, req });
    clients.add(conn);
    if (head && head.length) conn.parser.feed(head);

    conn.on('close', () => clients.delete(conn));
    if (typeof opts.onConnection === 'function') {
      try {
        opts.onConnection(conn, req);
      } catch (err) {
        conn.send(JSON.stringify({ type: 'error', msg: { code: -1, msg: String(err && err.message ? err.message : err) } }));
      }
    }
  });

  return {
    clients,
    broadcast(data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      let n = 0;
      for (const c of clients) {
        if (!c.closed) {
          c.send(payload);
          n++;
        }
      }
      return n;
    },
    closeAll() {
      for (const c of [...clients]) c.close(1001, 'server shutdown');
    }
  };
}

export class ServerConnection extends EventEmitter {
  constructor(socket, meta = {}) {
    super();
    this.socket = socket;
    this.meta = meta;
    this.closed = false;
    this.parser = new FrameParser({ expectMasked: true });
    this.id = crypto.randomBytes(6).toString('hex');
    this.connectedAt = new Date().toISOString();

    this.parser.on('message', (data, info) => this.emit('message', data, info));
    this.parser.on('ping', (p) => this._raw(encodeFrame(p, OP.PONG)));
    this.parser.on('pong', () => this.emit('pong'));
    this.parser.on('error', (err) => {
      this.emit('error', err);
      this.close(1002, 'protocol error');
    });
    this.parser.on('close', ({ code, reason }) => {
      this.emit('clientClose', { code, reason });
      this.close(1000, 'closing');
    });

    socket.on('data', (chunk) => this.parser.feed(chunk));
    socket.on('error', (err) => this.emit('error', err));
    socket.on('close', () => {
      if (!this.closed) {
        this.closed = true;
        this.emit('close');
      }
    });
  }

  _raw(buf) {
    if (this.closed || this.socket.destroyed) return false;
    try {
      this.socket.write(buf);
      return true;
    } catch {
      return false;
    }
  }

  send(data) {
    return this._raw(encodeFrame(data, OP.TEXT, false));
  }

  ping() {
    return this._raw(encodeFrame(Buffer.alloc(0), OP.PING, false));
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    this.closed = true;
    try {
      const payload = Buffer.alloc(2 + Buffer.byteLength(reason));
      payload.writeUInt16BE(code, 0);
      payload.write(reason, 2);
      this.socket.write(encodeFrame(payload, OP.CLOSE, false));
      this.socket.end();
    } catch {
      /* socket already gone */
    }
    this.emit('close');
  }
}

/* ------------------------------------------------------------------ *
 * Client side (supports custom handshake headers — required by Kalshi)
 * ------------------------------------------------------------------ */

/**
 * Open a WebSocket connection to a wss:// URL with custom headers.
 * @param {string} url   wss://host/path
 * @param {object} [opts]
 * @param {object} [opts.headers]      extra handshake headers (Kalshi auth)
 * @param {string[]} [opts.protocols]
 * @param {number} [opts.timeoutMs=10000]
 * @returns {Promise<ClientConnection>}
 */
export function connectUpstream(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isSecure = parsed.protocol === 'wss:';
    const lib = isSecure ? https : http;
    const key = crypto.randomBytes(16).toString('base64');

    const headers = {
      Connection: 'Upgrade',
      Upgrade: 'websocket',
      'Sec-WebSocket-Version': '13',
      'Sec-WebSocket-Key': key,
      ...(opts.headers || {})
    };
    if (opts.protocols && opts.protocols.length) headers['Sec-WebSocket-Protocol'] = opts.protocols.join(', ');

    const req = lib.request({
      protocol: parsed.protocol === 'wss:' ? 'https:' : 'http:',
      hostname: parsed.hostname,
      port: parsed.port || (isSecure ? 443 : 80),
      path: `${parsed.pathname}${parsed.search || ''}`,
      method: 'GET',
      headers,
      timeout: opts.timeoutMs ?? 10000
    });

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      try { req.destroy(); } catch { /* noop */ }
      reject(err);
    };

    req.on('error', fail);
    req.on('timeout', () => fail(new Error('websocket handshake timeout')));

    req.on('upgrade', (res, socket, head) => {
      if (settled) return;
      settled = true;
      const got = res.headers['sec-websocket-accept'];
      if (got !== acceptKey(key)) {
        try { socket.destroy(); } catch { /* noop */ }
        reject(new Error('Sec-WebSocket-Accept mismatch'));
        return;
      }
      socket.setNoDelay(true);
      const conn = new ClientConnection(socket, { url, status: res.statusCode, headers: res.headers });
      if (head && head.length) conn.parser.feed(head);
      resolve(conn);
    });

    req.on('response', (res) => {
      // Server answered with a normal HTTP response instead of upgrading.
      let body = '';
      res.on('data', (d) => { body += d.toString('utf8').slice(0, 500); });
      res.on('end', () => fail(new Error(`handshake rejected: HTTP ${res.statusCode} ${body.slice(0, 200)}`)));
    });

    req.end();
  });
}

export class ClientConnection extends EventEmitter {
  constructor(socket, meta = {}) {
    super();
    this.socket = socket;
    this.meta = meta;
    this.closed = false;
    // Client->server frames MUST be masked.
    this.parser = new FrameParser({ expectMasked: false });
    this.connectedAt = new Date().toISOString();

    this.parser.on('message', (data, info) => this.emit('message', data, info));
    this.parser.on('ping', (p) => this._raw(encodeFrame(p, OP.PONG, true)));
    this.parser.on('pong', () => this.emit('pong'));
    this.parser.on('error', (err) => this.emit('error', err));
    this.parser.on('close', (info) => {
      this.emit('remoteClose', info);
      this.close(1000, 'closing');
    });

    socket.on('data', (c) => this.parser.feed(c));
    socket.on('error', (err) => this.emit('error', err));
    socket.on('close', () => {
      if (!this.closed) {
        this.closed = true;
        this.emit('close', { code: null, reason: 'socket closed' });
      }
    });
  }

  _raw(buf) {
    if (this.closed || this.socket.destroyed) return false;
    try {
      this.socket.write(buf);
      return true;
    } catch {
      return false;
    }
  }

  send(data) {
    return this._raw(encodeFrame(data, OP.TEXT, true));
  }

  sendJSON(obj) {
    return this.send(JSON.stringify(obj));
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    this.closed = true;
    try {
      const payload = Buffer.alloc(2 + Buffer.byteLength(reason));
      payload.writeUInt16BE(code, 0);
      payload.write(reason, 2);
      this.socket.write(encodeFrame(payload, OP.CLOSE, true));
      this.socket.end();
    } catch {
      /* noop */
    }
    this.emit('close', { code, reason });
  }
}

export const WS_OPCODES = OP;
