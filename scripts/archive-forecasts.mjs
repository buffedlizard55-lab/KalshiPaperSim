#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time NWS Forecast Archive
 * =====================================================================
 * ROADMAP item #3 (weather markets): "an archived point-in-time forecast
 * (no archive = no honest test)".
 *
 * WHY THIS EXISTS
 *   A weather strategy can only be tested honestly if the FORECAST IT READS is
 *   the one that existed at decision time. Re-reading today's NWS forecast for
 *   a past date returns the OBSERVATION-shaped forecast of a day that already
 *   happened — a lookahead that would make any "forecast edge" up. So this job
 *   captures the official NWS gridded forecast several times a day and appends
 *   each capture, time-stamped, to a store the replay can query point-in-time.
 *
 * WHAT IT CAPTURES (official, free, no key):
 *   GET https://api.weather.gov/points/{lat},{lon}
 *     -> properties.forecast  (the gridded NDFD forecast for that exact point)
 *   GET {properties.forecast}
 *     -> properties.periods[]  {name, startTime, endTime, isDaytime,
 *                               temperature, temperatureUnit,
 *                               probabilityOfPrecipitation, ...}
 *   api.weather.gov terms require a identifying User-Agent, sent on every call.
 *   Verified shape 2026-09-18 (see VERIFICATION.md): daytime periods carry the
 *   daily HIGH in °F for Central Park (grid OKX 34,45), e.g. "Sunny, with a
 *   high near 80" -> temperature 80, isDaytime true.
 *
 * WHAT IT STORES
 *   data/forecasts/<city>.json — append-only snapshots:
 *     { captured_at, points_url, forecast_url, updateTime, units,
 *       days: [{ date, highF, periodName, startTime, endTime }] }
 *   plus a bounded tail (oldest snapshots dropped, with a trims[] ledger —
 *   the same never-silently-rewrite rule the candlestick store follows).
 *
 * POINT-IN-TIME RULE (enforced by src/forecast-store.js, not by intention)
 *   A query for "the forecast for date D as known at time T" returns data only
 *   from the newest snapshot with captured_at <= T. No snapshot => no trade:
 *   a strategy without its signal abstains rather than guessing.
 *
 * BASIS MISMATCH, STATED UP FRONT (IRREGULARITIES.md)
 *   KXHIGHNY settles on The Weather Company data for New York City (CLINYC) —
 *   the market's own rules — while this archive holds the NWS point forecast
 *   for Central Park. They are different providers; the strategy trades the
 *   GAP between the market price and the NWS forecast, and the mismatch is a
 *   real source of noise, not a bug to hide.
 *
 * USAGE
 *   node scripts/archive-forecasts.mjs             # capture now, append store
 *   node scripts/archive-forecasts.mjs --verify    # offline audit of the store
 *   node scripts/archive-forecasts.mjs --dry-run   # no network, print plan
 *
 * NOTE ON THE SANDBOX: api.weather.gov is not reachable from the build
 * container (only github.com egress works there). This script runs from the
 * GitHub-hosted workflow (.github/workflows/weather-signals.yml).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'forecasts');
const REQUEST_FILE = path.join(DATA_DIR, '_forecast-request.json');
const USER_AGENT = 'KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim)';
/** Keep the newest N snapshots per city (8/day x 90 days ≈ 720; headroom). */
const MAX_SNAPSHOTS = 1000;

/**
 * Locations tracked by the archive. Each maps a Kalshi weather series to the
 * NWS point that represents the same measurement location. NYC Central Park:
 * the KXHIGHNY rules name "New York City (CLINYC)" — Central Park — and the
 * coordinates below resolve (verified 2026-09-18) to NWS gridpoint OKX/34,45,
 * forecastZone NYZ072 (Manhattan), relativeLocation New York, NY.
 */
export const FORECAST_LOCATIONS = Object.freeze([
  {
    key: 'nyc-central-park',
    series: 'KXHIGHNY',
    city: 'New York (Central Park)',
    latitude: 40.7829,
    longitude: -73.9654,
    pointsUrl: 'https://api.weather.gov/points/40.7829,-73.9654',
    verifiedNote: 'points response captured 2026-09-18: grid OKX 34,45, zone NYZ072, relativeLocation New York NY'
  }
]);

function parseArgs(argv) {
  const args = { verify: false, dryRun: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'verify') args.verify = v !== 'false';
    else if (k === 'dry-run') args.dryRun = v !== 'false';
    else if (k === 'help' || k === 'h') args.help = true;
  }
  return args;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' } });
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status} ${res.statusText}` };
  try {
    return { ok: true, json: await res.json() };
  } catch (err) {
    return { ok: false, status: res.status, error: `unparseable JSON: ${err.message}` };
  }
}

/** The local calendar date (YYYY-MM-DD) of a local ISO timestamp. */
function localDateOf(isoLocal) {
  return String(isoLocal).slice(0, 10);
}

/**
 * Reduce NWS periods to one row per local day: the daytime period's temperature
 * is the forecast HIGH for that day. Only isDaytime periods with °F and a full
 * day/half-day window are kept; "This Afternoon" style periods are legitimate
 * same-day highs.
 */
export function extractDailyHighs(periods) {
  const days = {};
  for (const p of periods || []) {
    if (!p || p.isDaytime !== true) continue;
    if (String(p.temperatureUnit || '').toUpperCase() !== 'F') continue;
    const t = Number(p.temperature);
    if (!Number.isFinite(t)) continue;
    const date = localDateOf(p.startTime);
    if (!date) continue;
    // A day can appear as "Today" and later again as a named day; keep the
    // LATEST period in the file order (NWS updates refine earlier rows).
    days[date] = {
      date,
      highF: t,
      periodName: p.name || null,
      startTime: p.startTime,
      endTime: p.endTime,
      probabilityOfPrecipitationPct: p.probabilityOfPrecipitation?.value ?? null
    };
  }
  return Object.values(days).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function storePath(loc) {
  return path.join(DATA_DIR, `${loc.key}.json`);
}

function readStore(loc) {
  const p = storePath(loc);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`Corrupt forecast store ${p}: ${err.message} — refusing to guess its contents`);
  }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

/** Offline audit: structure, point-in-time ordering, no future-dated capture. */
export function verifyStore() {
  let problems = 0;
  for (const loc of FORECAST_LOCATIONS) {
    const store = readStore(loc);
    if (!store) {
      console.log(`• ${loc.key}: no store yet (nothing archived)`);
      continue;
    }
    const snaps = store.snapshots || [];
    let last = '';
    let ordered = true;
    for (const s of snaps) {
      if (s.captured_at < last) ordered = false;
      last = s.captured_at;
      for (const d of s.days || []) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Number.isFinite(Number(d.highF))) {
          console.log(`  ✗ ${loc.key}: malformed day row ${JSON.stringify(d)}`);
          problems += 1;
        }
      }
    }
    console.log(
      `${ordered ? '✓' : '✗'} ${loc.key}: ${snaps.length} snapshot(s), ` +
        `${snaps.reduce((a, s) => a + (s.days || []).length, 0)} day-row(s), ` +
        `first=${snaps[0]?.captured_at || '—'}, last=${snaps[snaps.length - 1]?.captured_at || '—'}, ` +
        `trims=${(store.trims || []).length}${ordered ? '' : ' — CAPTURED_AT ORDER VIOLATION'}`
    );
    if (!ordered) problems += 1;
  }
  return problems === 0 ? 0 : 1;
}

async function captureLocation(loc) {
  const pointsRes = await getJson(loc.pointsUrl);
  if (!pointsRes.ok) {
    console.error(`✗ ${loc.key}: points lookup failed — ${pointsRes.error}`);
    return { ok: false };
  }
  const forecastUrl = pointsRes.json?.properties?.forecast;
  if (!forecastUrl) {
    console.error(`✗ ${loc.key}: points response carries no properties.forecast`);
    return { ok: false };
  }
  const fcRes = await getJson(forecastUrl);
  if (!fcRes.ok) {
    console.error(`✗ ${loc.key}: forecast fetch failed — ${fcRes.error}`);
    return { ok: false };
  }
  const periods = fcRes.json?.properties?.periods || [];
  const days = extractDailyHighs(periods);
  if (days.length === 0) {
    console.error(`✗ ${loc.key}: forecast carried no usable daytime °F periods`);
    return { ok: false };
  }
  return { ok: true, forecastUrl, properties: fcRes.json.properties, days };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
    return 0;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (args.verify) return verifyStore();

  const capturedAt = new Date().toISOString();
  for (const loc of FORECAST_LOCATIONS) {
    if (args.dryRun) {
      console.log(`[dry-run] would GET ${loc.pointsUrl} then its properties.forecast`);
      continue;
    }
    const res = await captureLocation(loc);
    if (!res.ok) continue;
    const snapshot = {
      captured_at: capturedAt,
      points_url: loc.pointsUrl,
      forecast_url: res.forecastUrl,
      forecastGenerator: res.properties.forecastGenerator || null,
      updateTime: res.properties.updateTime || null,
      units: res.properties.units || null,
      days: res.days
    };
    let store = readStore(loc) || {
      location: { key: loc.key, city: loc.city, series: loc.series, latitude: loc.latitude, longitude: loc.longitude, points_url: loc.pointsUrl },
      what: 'Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.',
      snapshots: []
    };
    const previous = store.snapshots[store.snapshots.length - 1];
    store.snapshots.push(snapshot);
    if (store.snapshots.length > MAX_SNAPSHOTS) {
      const dropped = store.snapshots.length - MAX_SNAPSHOTS;
      store.snapshots = store.snapshots.slice(-MAX_SNAPSHOTS);
      store.trims = [...(store.trims || []), { at: capturedAt, dropped, kept: store.snapshots.length, reason: `bounded to the newest ${MAX_SNAPSHOTS} snapshots` }];
    }
    writeJson(storePath(loc), store);
    const changed = previous ? snapshot.days.filter((d) => !(previous.days || []).some((p) => p.date === d.date && p.highF === d.highF)) : snapshot.days;
    console.log(
      `✓ ${loc.key}: snapshot #${store.snapshots.length} at ${capturedAt} — ${snapshot.days.length} day(s) ` +
        `[${snapshot.days[0].date} → ${snapshot.days[snapshot.days.length - 1].date}], ` +
        `${changed.length} day-row(s) changed vs previous capture` +
        (previous ? '' : ' (first capture for this location)')
    );
    for (const d of snapshot.days) console.log(`    ${d.date}  high ${d.highF}°F  (${d.periodName || '?'})`);
  }

  // The repo-tracked request file documents what runs; keep its heartbeat fresh.
  if (!args.dryRun) {
    const reqPath = REQUEST_FILE;
    let req = {};
    try {
      req = JSON.parse(fs.readFileSync(reqPath, 'utf8'));
    } catch {
      req = {};
    }
    req.last_run = { at: capturedAt, locations: FORECAST_LOCATIONS.map((l) => l.key), workflow: '.github/workflows/weather-signals.yml' };
    writeJson(reqPath, req);
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code));
}
