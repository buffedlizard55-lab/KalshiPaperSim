/** Integration checks against a running Node server; never submits a valid mutation. */
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const base = process.env.HTTP_BASE_URL || 'http://127.0.0.1:3000';
const request = (pathname, options = {}) => fetch(new URL(pathname, base), {
  ...options, signal: AbortSignal.timeout(10000)
});

// --wait is for CI, where the server warms the deterministic replay before listening.
if (process.argv.includes('--wait')) {
  const deadline = Date.now() + 120000;
  for (;;) {
    try {
      if ((await request('/api/health')).ok) break;
    } catch { /* startup is still in progress */ }
    if (Date.now() >= deadline) throw new Error('Server did not become healthy within 120 seconds');
    await delay(500);
  }
}

const health = await request('/api/health');
assert.equal(health.status, 200);
assert.equal((await health.json()).service, 'KalshiPaperSim');
const stateBefore = await (await request('/api/state')).json();
assert.equal(stateBefore.ok, true);

for (const pathname of ['/', '/src/app.js', '/data/ledger.json', '/data/reports/flights.json']) {
  const response = await request(pathname);
  assert.equal(response.status, 200, pathname);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  await response.arrayBuffer();
}
const ledger = await (await request('/data/ledger.json')).text();
const pagesLedger = await (await request('/docs/data/ledger.json')).text();
assert.equal(ledger, pagesLedger, 'Node and Pages expose the same generated ledger');

for (const pathname of ['/.git/HEAD', '/.git/config', '/.env', '/server.js', '/data/store/competition-state.json']) {
  const response = await request(pathname);
  assert.equal(response.status, 404, pathname);
  await response.text();
}
for (const [body, expected] of [['{', 400], ['null', 400], ['[]', 400], ['x'.repeat(2 * 1024 * 1024 + 1), 413]]) {
  const response = await request('/api/reset', { method: 'POST', body });
  assert.equal(response.status, expected, 'invalid reset must be rejected');
  assert.equal((await response.json()).ok, false);
}
const stateAfter = await (await request('/api/state')).json();
assert.deepEqual(stateAfter.state, stateBefore.state, 'rejected reset requests must not modify competition state');

const head = await request('/src/styles.css', { method: 'HEAD' });
assert.equal(head.status, 200);
assert.ok(Number(head.headers.get('content-length')) > 0);
assert.equal(await head.text(), '');
console.log('PASS: live Node HTTP boundary, generated ledger parity, and rejected-reset state preservation');
