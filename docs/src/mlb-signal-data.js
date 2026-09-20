/**
 * KalshiPaperSim — Point-in-Time MLB Game-State Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/mlb-signals/, which
 * scripts/archive-mlb-signals.mjs grows from the official MLB Stats API
 * (statsapi.mlb.com/api/v1/schedule — MLB Advanced Media) on the mlb-signals
 * workflow schedule.
 *
 * Each state row is VERBATIM what the archive derived from the official
 * response at captured_at — the point-in-time record an MLB strategy is
 * allowed to read. Read it only through src/mlb-signal-store.js, which
 * refuses any row captured AFTER the decision time (the anti-lookahead rule).
 *
 * NO ARCHIVE YET — no captures exist; every MLB-signal-dependent strategy abstains until the archive exists. · generated 2026-09-20T05:18:31.773Z
 */

export const MLB_SIGNAL_DATA = {
 "generatedAt": "2026-09-20T05:18:31.773Z",
 "present": false,
 "endpoint": "https://statsapi.mlb.com/api/v1/schedule",
 "droppedOldestDates": 0,
 "teams": {
  "url": "https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026&fields=teams%2Cid%2Cname%2Cabbreviation%2CteamName%2ClocationName%2CshortName%2CfranchiseName%2CclubName%2Ccopyright",
  "captured_at": "2026-09-20T03:05:00.000Z",
  "last_confirmed_at": "2026-09-20T03:05:00.000Z",
  "teams": [
   {
    "id": 108,
    "name": "Los Angeles Angels",
    "abbreviation": "LAA",
    "teamName": "Angels",
    "locationName": "Anaheim",
    "shortName": "LA Angels",
    "franchiseName": "Los Angeles",
    "clubName": "Angels"
   },
   {
    "id": 109,
    "name": "Arizona Diamondbacks",
    "abbreviation": "AZ",
    "teamName": "D-backs",
    "locationName": "Phoenix",
    "shortName": "Arizona",
    "franchiseName": "Arizona",
    "clubName": "Diamondbacks"
   },
   {
    "id": 110,
    "name": "Baltimore Orioles",
    "abbreviation": "BAL",
    "teamName": "Orioles",
    "locationName": "Baltimore",
    "shortName": "Baltimore",
    "franchiseName": "Baltimore",
    "clubName": "Orioles"
   },
   {
    "id": 111,
    "name": "Boston Red Sox",
    "abbreviation": "BOS",
    "teamName": "Red Sox",
    "locationName": "Boston",
    "shortName": "Boston",
    "franchiseName": "Boston",
    "clubName": "Red Sox"
   },
   {
    "id": 112,
    "name": "Chicago Cubs",
    "abbreviation": "CHC",
    "teamName": "Cubs",
    "locationName": "Chicago",
    "shortName": "Chi Cubs",
    "franchiseName": "Chicago",
    "clubName": "Cubs"
   },
   {
    "id": 113,
    "name": "Cincinnati Reds",
    "abbreviation": "CIN",
    "teamName": "Reds",
    "locationName": "Cincinnati",
    "shortName": "Cincinnati",
    "franchiseName": "Cincinnati",
    "clubName": "Reds"
   },
   {
    "id": 114,
    "name": "Cleveland Guardians",
    "abbreviation": "CLE",
    "teamName": "Guardians",
    "locationName": "Cleveland",
    "shortName": "Cleveland",
    "franchiseName": "Cleveland",
    "clubName": "Guardians"
   },
   {
    "id": 115,
    "name": "Colorado Rockies",
    "abbreviation": "COL",
    "teamName": "Rockies",
    "locationName": "Denver",
    "shortName": "Colorado",
    "franchiseName": "Colorado",
    "clubName": "Rockies"
   },
   {
    "id": 116,
    "name": "Detroit Tigers",
    "abbreviation": "DET",
    "teamName": "Tigers",
    "locationName": "Detroit",
    "shortName": "Detroit",
    "franchiseName": "Detroit",
    "clubName": "Tigers"
   },
   {
    "id": 117,
    "name": "Houston Astros",
    "abbreviation": "HOU",
    "teamName": "Astros",
    "locationName": "Houston",
    "shortName": "Houston",
    "franchiseName": "Houston",
    "clubName": "Astros"
   },
   {
    "id": 118,
    "name": "Kansas City Royals",
    "abbreviation": "KC",
    "teamName": "Royals",
    "locationName": "Kansas City",
    "shortName": "Kansas City",
    "franchiseName": "Kansas City",
    "clubName": "Royals"
   },
   {
    "id": 119,
    "name": "Los Angeles Dodgers",
    "abbreviation": "LAD",
    "teamName": "Dodgers",
    "locationName": "Los Angeles",
    "shortName": "LA Dodgers",
    "franchiseName": "Los Angeles",
    "clubName": "Dodgers"
   },
   {
    "id": 120,
    "name": "Washington Nationals",
    "abbreviation": "WSH",
    "teamName": "Nationals",
    "locationName": "Washington",
    "shortName": "Washington",
    "franchiseName": "Washington",
    "clubName": "Nationals"
   },
   {
    "id": 121,
    "name": "New York Mets",
    "abbreviation": "NYM",
    "teamName": "Mets",
    "locationName": "Flushing",
    "shortName": "NY Mets",
    "franchiseName": "New York",
    "clubName": "Mets"
   },
   {
    "id": 133,
    "name": "Athletics",
    "abbreviation": "ATH",
    "teamName": "Athletics",
    "locationName": "Sacramento",
    "shortName": "Athletics",
    "franchiseName": "Athletics",
    "clubName": "Athletics"
   },
   {
    "id": 134,
    "name": "Pittsburgh Pirates",
    "abbreviation": "PIT",
    "teamName": "Pirates",
    "locationName": "Pittsburgh",
    "shortName": "Pittsburgh",
    "franchiseName": "Pittsburgh",
    "clubName": "Pirates"
   },
   {
    "id": 135,
    "name": "San Diego Padres",
    "abbreviation": "SD",
    "teamName": "Padres",
    "locationName": "San Diego",
    "shortName": "San Diego",
    "franchiseName": "San Diego",
    "clubName": "Padres"
   },
   {
    "id": 136,
    "name": "Seattle Mariners",
    "abbreviation": "SEA",
    "teamName": "Mariners",
    "locationName": "Seattle",
    "shortName": "Seattle",
    "franchiseName": "Seattle",
    "clubName": "Mariners"
   },
   {
    "id": 137,
    "name": "San Francisco Giants",
    "abbreviation": "SF",
    "teamName": "Giants",
    "locationName": "San Francisco",
    "shortName": "San Francisco",
    "franchiseName": "San Francisco",
    "clubName": "Giants"
   },
   {
    "id": 138,
    "name": "St. Louis Cardinals",
    "abbreviation": "STL",
    "teamName": "Cardinals",
    "locationName": "St. Louis",
    "shortName": "St. Louis",
    "franchiseName": "St. Louis",
    "clubName": "Cardinals"
   },
   {
    "id": 139,
    "name": "Tampa Bay Rays",
    "abbreviation": "TB",
    "teamName": "Rays",
    "locationName": "St. Petersburg",
    "shortName": "Tampa Bay",
    "franchiseName": "Tampa Bay",
    "clubName": "Rays"
   },
   {
    "id": 140,
    "name": "Texas Rangers",
    "abbreviation": "TEX",
    "teamName": "Rangers",
    "locationName": "Arlington",
    "shortName": "Texas",
    "franchiseName": "Texas",
    "clubName": "Rangers"
   },
   {
    "id": 141,
    "name": "Toronto Blue Jays",
    "abbreviation": "TOR",
    "teamName": "Blue Jays",
    "locationName": "Toronto",
    "shortName": "Toronto",
    "franchiseName": "Toronto",
    "clubName": "Blue Jays"
   },
   {
    "id": 142,
    "name": "Minnesota Twins",
    "abbreviation": "MIN",
    "teamName": "Twins",
    "locationName": "Minneapolis",
    "shortName": "Minnesota",
    "franchiseName": "Minnesota",
    "clubName": "Twins"
   },
   {
    "id": 143,
    "name": "Philadelphia Phillies",
    "abbreviation": "PHI",
    "teamName": "Phillies",
    "locationName": "Philadelphia",
    "shortName": "Philadelphia",
    "franchiseName": "Philadelphia",
    "clubName": "Phillies"
   },
   {
    "id": 144,
    "name": "Atlanta Braves",
    "abbreviation": "ATL",
    "teamName": "Braves",
    "locationName": "Atlanta",
    "shortName": "Atlanta",
    "franchiseName": "Atlanta",
    "clubName": "Braves"
   },
   {
    "id": 145,
    "name": "Chicago White Sox",
    "abbreviation": "CWS",
    "teamName": "White Sox",
    "locationName": "Chicago",
    "shortName": "Chi White Sox",
    "franchiseName": "Chicago",
    "clubName": "White Sox"
   },
   {
    "id": 146,
    "name": "Miami Marlins",
    "abbreviation": "MIA",
    "teamName": "Marlins",
    "locationName": "Miami",
    "shortName": "Miami",
    "franchiseName": "Miami",
    "clubName": "Marlins"
   },
   {
    "id": 147,
    "name": "New York Yankees",
    "abbreviation": "NYY",
    "teamName": "Yankees",
    "locationName": "Bronx",
    "shortName": "NY Yankees",
    "franchiseName": "New York",
    "clubName": "Yankees"
   },
   {
    "id": 158,
    "name": "Milwaukee Brewers",
    "abbreviation": "MIL",
    "teamName": "Brewers",
    "locationName": "Milwaukee",
    "shortName": "Milwaukee",
    "franchiseName": "Milwaukee",
    "clubName": "Brewers"
   }
  ]
 },
 "dates": {}
};
