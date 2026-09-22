#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time MLB Pre-Game Model Probability Archive
 * =====================================================================
 * ROADMAP "Next #3(c)" — the owner's MLB model's PRE-GAME probability
 * (MasterSite S14, buffedlizard55-lab/MLB-Prediction-model-backtest),
 * captured BEFORE first pitch, so a KXMLBGAME strategy can trade an
 * independent estimate against the exchange's own price — the same
 * architecture as ForecastEdge_Weather (NWS forecast vs KXHIGHNY price).
 *
 * THE INPUT CONTRACT (two real sources, one rule)
 *
 * 1. `--ingest <snapshots.jsonl>` — PRE-GAME SNAPSHOTS (tradable). One JSON
 *    object per line, produced by running the model before first pitch:
 *      { "capturedAt": ISO-8601 UTC,   // when the model produced this number
 *        "gamePk": 823570,             // official MLB Stats API game id
 *        "firstPitchAt": ISO-8601,     // the schedule's official gameDate
 *        "pHome": 0.58,                // the model's P(home win), 0..1
 *        "total": 8.7,                 // optional: expected total runs
 *        "model": { "repo": "...", "commit": "sha", "command": "..." },
 *        "source": "https://..." }
 *    A row is TIMELY (a pre-game signal) only when capturedAt < firstPitchAt.
 *    Anything else is rejected or flagged untimely — never silently taken.
 *
 * 2. `--from-walkforward <predictions.csv>` — the model's OWN walk-forward
 *    predictions (its `backtest` command writes this CSV). These are REAL
 *    model outputs but they are computed AFTER the games: every ingested row
 *    carries `timely: false` and `mode: "walk-forward measurement"`. They can
 *    never be read as a pre-game signal (src/mlb-pregame-store.js refuses
 *    them) — they exist so "the model was right / wrong" can be MEASURED
 *    against the exchange's recorded prices in the store.
 *
 * WHY THIS ARCHIVE IS NOT YET FED BY A SCHEDULED MODEL RUN
 *   Verified against the model repository's own CLI on 2026-09-21 (README +
 *   mlb_predict/cli.py read in full through the GitHub API): the model exposes
 *   `collect / collect-statcast / collect-probables / build-dataset /
 *   build-pitcher-features / backtest / demo / ingest-page / ingest-scores` —
 *   its `backtest` writes per-game walk-forward predictions — but it has NO
 *   `predict` command that prints today's slate with a capture instant. The
 *   missing piece is in THAT repository, not this one. Until it exists, this
 *   archive accepts the two sources above and publishes `--plan` (the exact
 *   command chain a runner with egress would execute). Nothing here invents a
 *   probability: no snapshot, no signal, the strategy abstains.
 *
 * USAGE
 *   node scripts/archive-mlb-pregame.mjs --ingest FILE.jsonl   # pre-game rows
 *   node scripts/archive-mlb-pregame.mjs --from-walkforward predictions.csv
 *   node scripts/archive-mlb-pregame.mjs --verify              # offline audit
 *   node scripts/archive-mlb-pregame.mjs --plan                # print the plan
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'mlb-pregame');
const PRED_DIR = path.join(DATA_DIR, 'predictions');
const ASSUMPTION_FILE = path.join(DATA_DIR, '_assumption.json');
const LAST_RUN_FILE = path.join(DATA_DIR, '_mlb-pregame-last-run.json');

export const ASSUMPTION = {
  what: "Point-in-time snapshot of the owner's MLB Monte Carlo model (MasterSite S14, MLB-Prediction-model-backtest): its own pre-game P(home win) per official gamePk.",
  knowableFrom: 'the capture instant the snapshot was recorded (capturedAt) — the model run\'s own timestamp, never this archive\'s write time',
  timelyRule: 'a row is a PRE-GAME signal only when capturedAt < firstPitchAt. Walk-forward rows (mode "walk-forward measurement") are computed after their games and carry timely:false — real data, never a tradable pre-game signal.',
  modelRepo: 'https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest',
  modelCliStatus: 'No `predict` subcommand exists in the model CLI as of 2026-09-21 (verified by reading mlb_predict/cli.py through the GitHub API). The plan below is the exact chain that becomes runnable the moment the model can emit today\'s slate.',
  jargon: {
    pHome: "the model's calibrated probability that the home team wins (logistic blend of Monte Carlo sim_p_home + correlation-filtered features)",
    gamePk: 'the official MLB Stats API game id — the same id data/mlb-signals/ archives'
  }
};

export function plan() {
  return {
    assumption: ASSUMPTION,
    steps: [
      'git clone https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest',
      'cd MLB-Prediction-model-backtest && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt',
      'scripts/sync_sources.sh   # vendors MLB-PBP + StatcastMLB (the model\'s two official-data upstreams)',
      'PYTHONPATH=. python -m mlb_predict collect --start <season start> --end <yesterday>',
      'PYTHONPATH=. python -m mlb_predict collect-probables --start <today> --end <today>',
      'PYTHONPATH=. python -m mlb_predict build-dataset && PYTHONPATH=. python -m mlb_predict build-pitcher-features',
      'PYTHONPATH=. python -m mlb_predict backtest --season <year> --with-pitcher-features   # walk-forward predictions.csv (measurement rows)',
      'MISSING: a `predict` command that emits {capturedAt, gamePk, pHome} for TODAY\'s slate before first pitch. Add it to mlb_predict/cli.py (its WinModel.predict(df) already exists), then:',
      'PYTHONPATH=. python -m mlb_predict predict --date <today> --jsonl > snapshots.jsonl && node scripts/archive-mlb-pregame.mjs --ingest snapshots.jsonl'
    ],
    workflow: '.github/workflows/mlb-pregame-signals.yml (runs what exists today: the walk-forward measurement chain; the snapshot step activates when the model gains `predict`)'
  };
}

function isoToSeconds(iso) {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function todayOf(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 1));
}

/**
 * Append one row to the date store for its game day. Idempotent per
 * (gamePk, capturedAt, pHome): re-ingesting the same snapshot never
 * duplicates. Returns { accepted, rejected, untimely }.
 */
export function appendPrediction(row, { mode = 'pre-game snapshot' } = {}) {
  const problems = [];
  if (!row || typeof row !== 'object') problems.push('not an object');
  const capT = row && isoToSeconds(row.capturedAt);
  const firstT = row && isoToSeconds(row.firstPitchAt);
  if (!row || !Number.isFinite(capT)) problems.push('capturedAt must be ISO-8601');
  if (!row || !Number.isFinite(firstT)) problems.push('firstPitchAt must be ISO-8601');
  if (!row || !Number.isFinite(Number(row.gamePk))) problems.push('gamePk must be a number');
  const p = row && Number(row.pHome);
  if (!(p >= 0 && p <= 1)) problems.push('pHome must be in [0,1]');
  if (problems.length) return { accepted: false, rejected: true, problems };
  const timely = capT < firstT;
  const date = todayOf(row.firstPitchAt);
  const file = path.join(PRED_DIR, `${date}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {
    what: "Point-in-time rows of the owner's MLB model output (MasterSite S14)",
    date, predictions: {}
  };
  const predictions = { ...prev.predictions };
  const pk = String(Number(row.gamePk));
  const slot = predictions[pk] || { gamePk: Number(row.gamePk), firstPitchAt: row.firstPitchAt, rows: [] };
  const rows = [...slot.rows];
  const exists = rows.some((r) => r.capturedAt === row.capturedAt && r.pHome === p);
  if (!exists) {
    rows.push({
      capturedAt: row.capturedAt,
      pHome: p,
      total: Number.isFinite(Number(row.total)) ? Number(row.total) : null,
      side: row.side != null ? String(row.side) : null,
      timely,
      mode,
      model: row.model && typeof row.model === 'object' ? row.model : null,
      source: row.source != null ? String(row.source) : null
    });
    rows.sort((a, b) => (a.capturedAt < b.capturedAt ? -1 : 1));
  }
  predictions[pk] = { ...slot, firstPitchAt: row.firstPitchAt, rows };
  writeJson(file, {
    ...prev,
    what: prev.what,
    modelRepo: ASSUMPTION.modelRepo,
    knowableFrom: ASSUMPTION.knowableFrom,
    timelyRule: ASSUMPTION.timelyRule,
    last_ingested_at: new Date().toISOString(),
    predictions
  });
  writeJson(ASSUMPTION_FILE, ASSUMPTION);
  return { accepted: !exists, rejected: false, untimely: !timely };
}

/** Ingest a JSONL file of pre-game snapshot rows (contract above). */
export function ingestSnapshotsFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const report = { file, mode: 'pre-game snapshot', accepted: 0, duplicates: 0, rejected: 0, untimely: 0, problems: [] };
  let lineNo = 0;
  for (const line of text.split('\n')) {
    lineNo += 1;
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    let row;
    try {
      row = JSON.parse(s);
    } catch (e) {
      report.rejected += 1;
      report.problems.push({ line: lineNo, error: `invalid JSON: ${e.message}` });
      continue;
    }
    const r = appendPrediction(row, { mode: 'pre-game snapshot' });
    if (r.rejected) {
      report.rejected += 1;
      report.problems.push({ line: lineNo, problems: r.problems });
    } else if (!r.accepted) {
      report.duplicates += 1;
    } else {
      report.accepted += 1;
      if (r.untimely) report.untimely += 1;
    }
  }
  return report;
}

/**
 * Ingest the model's walk-forward predictions.csv. The exact columns come
 * from the model's own `backtest` output (cli.py prints
 * "predictions -> <csv>"); expected headers include game date/id and its
 * predicted home-win probability. Rows that cannot be bound to a gamePk +
 * firstPitchAt from this repository's OFFICIAL MLB schedule archive
 * (data/mlb-signals/) are REJECTED with the reason — never guessed.
 */
export function ingestWalkForwardCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n').filter((l) => l.trim().length);
  const report = { file, mode: 'walk-forward measurement', accepted: 0, duplicates: 0, rejected: 0, untimely: 0, problems: [], headers: null };
  if (!lines.length) return report;
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  report.headers = headers;
  const idx = (name) => headers.indexOf(name);
  // The model's CSV column names (backtest.py writes them). A change in the
  // model repo that renames a column is caught here, loudly.
  const cGamePk = idx('game_pk') >= 0 ? idx('game_pk') : idx('gamePk');
  const cDate = idx('game_date') >= 0 ? idx('game_date') : idx('date');
  const cP = idx('p_home') >= 0 ? idx('p_home') : (idx('pred') >= 0 ? idx('pred') : idx('pHome'));
  const cTotal = idx('pred_total') >= 0 ? idx('pred_total') : idx('total');
  if (cP < 0) {
    report.problems.push({ error: `no probability column found in headers: ${headers.join(', ')}` });
    report.rejected = lines.length - 1;
    return report;
  }
  // First pitch comes from the OFFICIAL schedule archive when present.
  const firstPitchByPk = new Map();
  const gamesDir = path.join(ROOT, 'data', 'mlb-signals', 'games');
  if (fs.existsSync(gamesDir)) {
    for (const f of fs.readdirSync(gamesDir)) {
      const store = JSON.parse(fs.readFileSync(path.join(gamesDir, f), 'utf8'));
      for (const g of Object.values(store.games || {})) firstPitchByPk.set(Number(g.gamePk), g.gameDate);
    }
  }
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const gamePk = cGamePk >= 0 ? Number(cols[cGamePk]) : NaN;
    const firstPitchAt = Number.isFinite(gamePk) ? firstPitchByPk.get(gamePk) || null : null;
    const dateText = cDate >= 0 ? cols[cDate] : null;
    const pHome = Number(cols[cP]);
    if (!Number.isFinite(gamePk) || !firstPitchAt) {
      report.rejected += 1;
      report.problems.push({
        line: i + 1,
        error: 'NO_OFFICIAL_FIRST_PITCH_FOR_GAMEPK',
        gamePk: Number.isFinite(gamePk) ? gamePk : cols[cGamePk] ?? null,
        date: dateText
      });
      continue;
    }
    // Walk-forward rows are computed after the fact: capturedAt = now (when
    // this CSV was ingested) is AFTER firstPitchAt — untimely by construction.
    const r = appendPrediction(
      {
        capturedAt: new Date().toISOString(),
        gamePk,
        firstPitchAt,
        pHome,
        total: cTotal >= 0 && Number.isFinite(Number(cols[cTotal])) ? Number(cols[cTotal]) : null,
        model: { repo: ASSUMPTION.modelRepo, mode: 'walk-forward (backtest output)' },
        source: file
      },
      { mode: 'walk-forward measurement' }
    );
    if (r.rejected) {
      report.rejected += 1;
      report.problems.push({ line: i + 1, problems: r.problems });
    } else if (!r.accepted) report.duplicates += 1;
    else {
      report.accepted += 1;
      if (!r.untimely) report.untimely += 0; // walk-forward is always untimely
    }
  }
  writeJson(ASSUMPTION_FILE, ASSUMPTION);
  return report;
}

/** Offline audit of the store. */
export function verify() {
  const problems = [];
  const summary = { dateFiles: 0, rows: 0, timely: 0, untimely: 0 };
  if (!fs.existsSync(ASSUMPTION_FILE)) problems.push('missing _assumption.json (no capture has run)');
  if (fs.existsSync(PRED_DIR)) {
    for (const f of fs.readdirSync(PRED_DIR)) {
      summary.dateFiles += 1;
      const d = JSON.parse(fs.readFileSync(path.join(PRED_DIR, f), 'utf8'));
      for (const p of Object.values(d.predictions || {})) {
        for (const r of p.rows || []) {
          summary.rows += 1;
          const capT = isoToSeconds(r.capturedAt);
          const firstT = isoToSeconds(p.firstPitchAt || r.firstPitchAt);
          if (!Number.isFinite(capT) || !Number.isFinite(firstT)) problems.push(`${f}: row with unparseable timestamps`);
          const timely = capT < firstT;
          if (r.timely === timely) summary.timely += timely ? 1 : 0;
          else problems.push(`${f}: row.timely (${r.timely}) disagrees with timestamps (${timely})`);
          if (!timely) summary.untimely += 1;
          if (!(r.pHome >= 0 && r.pHome <= 1)) problems.push(`${f}: pHome out of range`);
        }
      }
    }
  }
  return { ok: problems.length === 0, problems, summary };
}

/* ─────────────────────── CLI ─────────────────────── */

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const out = (() => {
    if (args.includes('--plan')) return plan();
    if (args.includes('--verify')) return verify();
    const ingest = args.find((a) => a === '--ingest') ? args[args.indexOf('--ingest') + 1] : null;
    if (ingest) return ingestSnapshotsFile(ingest);
    const wf = args.find((a) => a === '--from-walkforward') ? args[args.indexOf('--from-walkforward') + 1] : null;
    if (wf) return ingestWalkForwardCsv(wf);
    return { error: 'usage: --ingest FILE.jsonl | --from-walkforward predictions.csv | --verify | --plan', plan: plan() };
  })();
  writeJson(LAST_RUN_FILE, { ranAt: new Date().toISOString(), result: out });
  console.log(JSON.stringify(out, null, 1));
  process.exit(out && out.ok === false || out && out.error ? 1 : 0);
}
