import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HttpError, readBody, serveStatic } from '../lib/http.js';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'kalshi-http-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const files = {
    'index.html': '<h1>Paper desk</h1>',
    'src/app.js': 'export const publicAsset = true;',
    'src/styles.css': 'body { color: black; }',
    'src/secret.local.js': 'private scratch',
    'README.md': '# Public documentation',
    'data/history/capture.json': '{"source":"fixture"}',
    'data/reports/fills.csv': 'ticker,count\nTEST,1',
    'data/reports/ledger.jsonl': '{"kind":"fixture"}\n',
    'data/reports/review.md': '# Review',
    'docs/index.html': '<h1>Pages</h1>',
    'docs/src/app.js': 'export const pages = true;',
    'docs/data/ledger.json': '{"ledger":"fixture"}',
    'docs/data/discovered.json': '{}',
    'docs/data/sensitivity.json': '{}',
    '.git/config': 'private git fixture',
    '.git/HEAD': 'private git head fixture',
    '.env': 'private environment fixture',
    'kalshi-credentials.json': 'private credential fixture',
    'server.js': 'private server fixture',
    'data/store/competition-state.json': 'private state fixture',
    'data/store/desk-orders.jsonl': 'private orders fixture',
    'data/history/.hidden.json': 'private hidden fixture',
    'data/reports/private.key': 'private key fixture'
  };
  for (const [name, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), contents);
  }
  // Symlink targets are deliberately private but inside the same root.
  await symlink(path.join(root, 'data/store/competition-state.json'), path.join(root, 'data/reports/leak.json'));
  await symlink(path.join(root, 'data/store'), path.join(root, 'data/history/linked'));
  await symlink(path.join(root, 'docs/data/ledger.json'), path.join(root, 'data/reports/public-link.json'));
  let mutations = 0;
  const server = http.createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      if (pathname === '/body') {
        const body = await readBody(req, 32);
        mutations++;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(body));
      }
      await serveStatic(req, res, { root, pathname });
    } catch (err) {
      res.writeHead(err instanceof HttpError ? err.statusCode : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const request = (url, { method = 'GET', body, chunks, headers = {} } = {}) => new Promise((resolve, reject) => {
    if (body !== undefined && !chunks) headers = { 'Content-Length': Buffer.byteLength(body), ...headers };
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path: url, method, headers }, (res) => {
      const parts = [];
      res.on('data', (chunk) => parts.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(parts).toString() }));
    });
    req.on('error', reject);
    for (const chunk of chunks || []) req.write(chunk);
    req.end(body);
  });
  return { root, files, request, mutations: () => mutations };
}

test('HTTP serves only published browser assets and evidence with correct MIME types', async (t) => {
  const { request, files } = await fixture(t);
  for (const [url, mime] of [
    ['/', 'text/html'], ['/src/app.js', 'application/javascript'], ['/src/styles.css', 'text/css'],
    ['/README.md', 'text/markdown'], ['/data/history/capture.json', 'application/json'],
    ['/data/reports/fills.csv', 'text/csv'], ['/data/reports/ledger.jsonl', 'application/x-ndjson'],
    ['/data/reports/review.md', 'text/markdown'], ['/docs/', 'text/html'], ['/docs/src/app.js', 'application/javascript']
  ]) {
    const result = await request(url, { headers: { Host: '3000-preview.e2b.app' } });
    assert.equal(result.status, 200, url);
    assert.ok(result.headers['content-type'].startsWith(mime), url);
    assert.equal(result.headers['x-content-type-options'], 'nosniff');
    const file = url === '/' ? 'index.html' : url === '/docs/' ? 'docs/index.html' : url.slice(1);
    assert.equal(result.body, files[file]);
  }
  assert.equal((await request('/src/%61pp.js?version=1')).body, files['src/app.js']);
});

test('HTTP blocks repository internals, credentials, runtime state, traversal and symlinks', async (t) => {
  const { request } = await fixture(t);
  for (const url of [
    '/.git/config', '/.git/HEAD', '/.env', '/kalshi-credentials.json', '/server.js',
    '/data/store/competition-state.json', '/data/store/desk-orders.jsonl',
    '/data/history/.hidden.json', '/data/reports/private.key', '/src/secret.local.js',
    '/%2egit/config', '/data/history/%2e%2e%2fstore/competition-state.json',
    '/data/history/..%5cstore/competition-state.json', '/src/app.js%00',
    '/data/reports/leak.json', '/data/history/linked/competition-state.json', '/data/reports/public-link.json',
    '/docs/../.git/config', '/data/reports', '/src/missing.js', '/unknown', '//.git/config'
  ]) {
    const result = await request(url);
    assert.equal(result.status, 404, url);
    assert.equal(result.body, '404 Not Found', url);
  }
  assert.equal((await request('/src/%ZZ.js')).status, 400);
});

test('HTTP supports HEAD and rejects writes to static resources', async (t) => {
  const { request, files } = await fixture(t);
  const head = await request('/src/app.js', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.equal(Number(head.headers['content-length']), Buffer.byteLength(files['src/app.js']));
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const result = await request('/src/app.js', { method, body: 'not a write' });
    assert.equal(result.status, 405);
    assert.equal(result.headers.allow, 'GET, HEAD');
  }
  assert.equal((await request('/src/app.js')).body, files['src/app.js']);
});

test('HTTP resolves generated data assets identically in Node and Pages paths', async (t) => {
  const { request, root } = await fixture(t);
  for (const name of ['ledger', 'discovered', 'sensitivity']) {
    const node = await request(`/data/${name}.json`);
    const pages = await request(`/docs/data/${name}.json`);
    assert.equal(node.status, 200);
    assert.equal(node.body, pages.body);
  }
  await writeFile(path.join(root, 'data/ledger.json'), '{"local":true}');
  assert.equal((await request('/data/ledger.json')).body, '{"local":true}', 'a canonical data file wins if present');
});

test('HTTP body parsing accepts empty and object bodies, including chunked UTF-8', async (t) => {
  const { request, mutations } = await fixture(t);
  for (const body of ['', '{}', '{"seed":42}', '{"note":"é"}']) {
    const result = await request('/body', { method: 'POST', body });
    assert.equal(result.status, 200);
    assert.deepEqual(JSON.parse(result.body), body ? JSON.parse(body) : {});
  }
  const data = Buffer.from('{"note":"é"}');
  const result = await request('/body', { method: 'POST', chunks: [...data].map((byte) => Buffer.from([byte])) });
  assert.deepEqual(JSON.parse(result.body), { note: 'é' });
  assert.equal(mutations(), 5);
});

test('HTTP rejects malformed and non-object JSON before any mutation', async (t) => {
  const { request, mutations } = await fixture(t);
  for (const body of ['{', '  ', 'null', '[]', '"seed"', '42', 'true']) {
    const result = await request('/body', { method: 'POST', body });
    assert.equal(result.status, 400, body);
    assert.match(JSON.parse(result.body).error, /invalid_json|json_object_required/);
  }
  assert.equal(mutations(), 0);
});

test('HTTP returns a readable 413 for oversized fixed-length and chunked bodies', async (t) => {
  const { request, mutations } = await fixture(t);
  for (const opts of [{ body: 'x'.repeat(33) }, { chunks: ['x'.repeat(20), 'x'.repeat(20)] }, { body: '{"note":"' + 'é'.repeat(12) + '"}' }]) {
    const result = await request('/body', { method: 'POST', ...opts });
    assert.equal(result.status, 413);
    assert.equal(JSON.parse(result.body).error, 'payload_too_large');
  }
  const boundary = '{"a":"' + 'x'.repeat(24) + '"}';
  assert.equal(Buffer.byteLength(boundary), 32);
  assert.equal((await request('/body', { method: 'POST', body: boundary })).status, 200);
  assert.equal(mutations(), 1);
});

test('HTTP body parsing rejects aborted or failed streams rather than hanging', async () => {
  for (const event of ['aborted', 'error']) {
    const stream = new PassThrough();
    const body = readBody(stream);
    stream.write('{');
    stream.emit(event, new Error('connection failed'));
    await assert.rejects(body, event === 'aborted' ? /request_aborted/ : /connection failed/);
    stream.destroy();
  }
});
