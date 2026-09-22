/** Node-only HTTP boundary helpers; no market or strategy computations. */
import path from 'node:path';
import { realpath, open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Empty bodies retain the API's defaults; every nonempty body must be an object. */
export function readBody(req, limitBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const fail = (err) => {
      if (done) return;
      done = true;
      chunks.length = 0;
      reject(err);
    };
    req.on('data', (chunk) => {
      if (done) return; // Drain oversized requests without destroying the response socket.
      size += chunk.length;
      if (size > limitBytes) return fail(new HttpError(413, 'payload_too_large'));
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (done) return;
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const body = raw ? JSON.parse(raw) : {};
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return fail(new HttpError(400, 'json_object_required'));
        }
        done = true;
        resolve(body);
      } catch {
        fail(new HttpError(400, 'invalid_json'));
      } finally {
        chunks.length = 0;
      }
    });
    req.on('aborted', () => fail(new HttpError(400, 'request_aborted')));
    req.on('error', fail);
  });
}

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jsonl': 'application/x-ndjson; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8',
  '.csv': 'text/csv; charset=UTF-8'
};
const PUBLIC_DOCUMENTS = new Set(['README.md', 'ROADMAP.md', 'VERIFICATION.md', 'IRREGULARITIES.md', 'SENSITIVITY.md']);
const PUBLIC_DATA_DIRS = new Set([
  'discovered', 'espn-signals', 'history', 'fda-signals', 'forecasts',
  'form4-signals', 'ledger', 'mlb-pregame', 'mlb-signals', 'reports'
]);
const PUBLIC_DATA_FILES = new Set(['ledger.json', 'discovered.json', 'sensitivity.json', 'settlements.json']);
const DATA_EXTENSIONS = new Set(['.json', '.jsonl', '.csv', '.md']);

function isPublic(relative) {
  const parts = relative.split('/');
  if (parts.some((part) => !part || part.startsWith('.') || part.includes('\\') || part.includes('\0'))) return false;
  if (parts[0] === 'docs') parts.shift();
  const name = parts.join('/');
  if (name === 'index.html' || PUBLIC_DOCUMENTS.has(name)) return true;
  if (parts[0] === 'src' && parts.length === 2) return ['.js', '.css'].includes(path.extname(name)) && !name.endsWith('.local.js');
  if (parts[0] !== 'data' || !DATA_EXTENSIONS.has(path.extname(name))) return false;
  return (parts.length === 2 && PUBLIC_DATA_FILES.has(parts[1])) ||
    (parts.length >= 3 && PUBLIC_DATA_DIRS.has(parts[1]));
}

function textResponse(res, status, text, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=UTF-8', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(text);
}

/**
 * Serve only browser assets and intentionally published evidence, never the repo
 * as a whole. Canonical-path equality rejects symlink files AND symlink parents.
 * Generated ledger/summary assets live in docs/data in this repository; expose
 * them at data/ too so the Node app and Pages resolve the same browser URLs.
 */
export async function serveStatic(req, res, { root, pathname }) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return textResponse(res, 405, '405 Method Not Allowed', { Allow: 'GET, HEAD' });
  }
  let relative;
  try {
    relative = decodeURIComponent(pathname).replace(/^\//, '');
  } catch {
    return textResponse(res, 400, '400 Bad Request');
  }
  if (!relative) relative = 'index.html';
  if (relative === 'docs/') relative = 'docs/index.html';
  if (!isPublic(relative)) return textResponse(res, 404, '404 Not Found');

  let handle;
  try {
    const canonicalRoot = await realpath(root);
    let file = path.join(canonicalRoot, relative);
    try {
      const canonicalFile = await realpath(file);
      if (canonicalFile !== file) return textResponse(res, 404, '404 Not Found');
    } catch (err) {
      if (err.code !== 'ENOENT' || !/^data\/(ledger|discovered|sensitivity)\.json$/.test(relative)) throw err;
      file = path.join(canonicalRoot, 'docs', relative);
      if (await realpath(file) !== file) return textResponse(res, 404, '404 Not Found');
    }
    handle = await open(file, 'r');
    const stats = await handle.stat();
    if (!stats.isFile()) return textResponse(res, 404, '404 Not Found');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)],
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();
    await pipeline(handle.createReadStream({ autoClose: false }), res);
  } catch (err) {
    if (res.destroyed) return; // Client disconnected during a streamed response.
    if (res.headersSent) return res.destroy();
    const missing = ['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(err.code);
    textResponse(res, missing ? 404 : 500, missing ? '404 Not Found' : '500 Internal Server Error');
  } finally {
    if (handle) await handle.close();
  }
}
