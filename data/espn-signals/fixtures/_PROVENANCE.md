# ESPN archive fixtures — provenance

**Trust label (on every file in this directory and every row derived from
them): ESPN PUBLIC JSON — TRUSTED BUT NOT OFFICIAL.** ESPN is a public,
keyless aggregator (`site.web.api.espn.com`), **not** a league's official data
feed. These fixtures pin the response SHAPES the parser
(`scripts/archive-espn-signals.mjs`) must read; they are never settlement
inputs and never a price. Kalshi prices come only from the exchange's own API.

## How these captures were made (2026-09-21, Arena session 01a0c625)

Direct TLS egress to ESPN is blocked inside this sandbox (the same environment
that cannot reach `*.kalshi.com` — IRREGULARITIES.md #4). The captures below
were made live through the Arena page-fetch tool, which retrieves the URL's
response body as text. The full NFL scoreboard response (3 chunks) and the
first injury-team block of each league's injuries response (1088 chunks for
NFL, 109 for NBA — the responses carry every team's every player) were
returned complete-or-partially as listed.

**Convention (identical to the MLB fixture in `test/simulation.test.js`):**
every parse-relevant key/value is transcribed **verbatim** from the live
response; presentation noise the parser never reads (team `logos`/`links`
arrays, athlete `links`/`headshot` blocks, leader statistics, tickets,
geoBroadcasts, and the DraftKings odds block's affiliate URLs) is omitted.
Nothing parse-relevant is paraphrased, rounded or invented.

The first `.github/workflows/espn-signals.yml` run (a GitHub-hosted runner has
egress) re-captures the full raw responses and keeps them verbatim under
`data/espn-signals/` as the store grows; the run report
(`data/espn-signals/_espn-last-run.json`) records every URL, status and the
User-Agent sent.

| File | URL | Response `timestamp` | Captured at (UTC) | What it pins |
|---|---|---|---|---|
| `scoreboard-nfl-20260921.json` | `https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20260921` | *(the scoreboard envelope has no top-level `timestamp`; `leagues[0].season` = 2026 Regular Season)* | 2026-09-21T23:00Z | the per-event shape earlier sessions could NOT retrieve from this sandbox (IRREGULARITIES #58): `events[].competitions[].competitors[].score` (numeric **string**), `status.clock` / `status.displayClock` / `status.period`, `status.type.{id,name,state,completed,description,detail,shortDetail}` with `state: "pre"` observed live |
| `injuries-records-2026-09-21.json` (NFL block) | `https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries` | `2026-09-21T22:53:42Z` | 2026-09-21T22:53–23:05Z | the injuries envelope + one complete player record (ARI · Garrett Williams · CB · "Out") with ESPN's own status vocabulary verbatim |
| `injuries-records-2026-09-21.json` (NBA block) | `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/injuries` | `2026-09-21T23:04:41Z` | 2026-09-21T23:04–23:05Z | the same envelope in a second league + one complete player record (ATL · Henri Veesaar · C · "Out"), proving the shape is shared |

Observed `status.type.state` values in these captures: **`pre`** only
(`STATUS_SCHEDULED`). The parser accepts the documented vocabulary
`pre | in | post` and **throws on anything else** (shape-change detector,
asserted in test 131); the first captures of a live/finished game will pin
`in`/`post` rows into the store the same way.

## What is deliberately NOT here

- **No price, quote, fee or settlement.** Every trading number in this project
  comes from Kalshi's own API (`data/history/`, `src/verified-snapshot.js`).
  The scoreboard's `odds` block (DraftKings) is archived by the capture script
  as **context only** and is not read by any `decide()`.
- **No team table capture** (`{league}/_teams.json`): the per-league `teams`
  endpoints return ~17 chunks of logo/link noise per league; the first
  espn-signals workflow run captures them whole and
  `_code-map.json` (built from each contract's own `rules_primary` text +
  those tables) fills in the Kalshi↔ESPN code join with evidence rows. Codes
  the map cannot match stay **UNMAPPED** with their reason — an unmapped
  ticker is never traded.
