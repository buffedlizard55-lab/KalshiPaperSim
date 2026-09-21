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
 * 3 date file(s) · 33 game(s) · 84 state row(s) · generated 2026-09-21T14:16:10.909Z
 */

export const MLB_SIGNAL_DATA = {
 "generatedAt": "2026-09-21T14:16:10.909Z",
 "present": true,
 "endpoint": "https://statsapi.mlb.com/api/v1/schedule",
 "droppedOldestDates": 0,
 "teams": {
  "url": "https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026&fields=teams%2Cid%2Cname%2Cabbreviation%2CteamName%2ClocationName%2CshortName%2CfranchiseName%2CclubName%2Ccopyright",
  "captured_at": "2026-09-20T05:25:27.222Z",
  "last_confirmed_at": "2026-09-21T08:11:17.017Z",
  "teams": [
   {
    "id": 108,
    "abbreviation": "LAA",
    "name": "Los Angeles Angels",
    "teamName": "Angels",
    "locationName": "Anaheim",
    "shortName": "LA Angels",
    "franchiseName": "Los Angeles",
    "clubName": "Angels"
   },
   {
    "id": 109,
    "abbreviation": "AZ",
    "name": "Arizona Diamondbacks",
    "teamName": "D-backs",
    "locationName": "Phoenix",
    "shortName": "Arizona",
    "franchiseName": "Arizona",
    "clubName": "Diamondbacks"
   },
   {
    "id": 110,
    "abbreviation": "BAL",
    "name": "Baltimore Orioles",
    "teamName": "Orioles",
    "locationName": "Baltimore",
    "shortName": "Baltimore",
    "franchiseName": "Baltimore",
    "clubName": "Orioles"
   },
   {
    "id": 111,
    "abbreviation": "BOS",
    "name": "Boston Red Sox",
    "teamName": "Red Sox",
    "locationName": "Boston",
    "shortName": "Boston",
    "franchiseName": "Boston",
    "clubName": "Red Sox"
   },
   {
    "id": 112,
    "abbreviation": "CHC",
    "name": "Chicago Cubs",
    "teamName": "Cubs",
    "locationName": "Chicago",
    "shortName": "Chi Cubs",
    "franchiseName": "Chicago",
    "clubName": "Cubs"
   },
   {
    "id": 113,
    "abbreviation": "CIN",
    "name": "Cincinnati Reds",
    "teamName": "Reds",
    "locationName": "Cincinnati",
    "shortName": "Cincinnati",
    "franchiseName": "Cincinnati",
    "clubName": "Reds"
   },
   {
    "id": 114,
    "abbreviation": "CLE",
    "name": "Cleveland Guardians",
    "teamName": "Guardians",
    "locationName": "Cleveland",
    "shortName": "Cleveland",
    "franchiseName": "Cleveland",
    "clubName": "Guardians"
   },
   {
    "id": 115,
    "abbreviation": "COL",
    "name": "Colorado Rockies",
    "teamName": "Rockies",
    "locationName": "Denver",
    "shortName": "Colorado",
    "franchiseName": "Colorado",
    "clubName": "Rockies"
   },
   {
    "id": 116,
    "abbreviation": "DET",
    "name": "Detroit Tigers",
    "teamName": "Tigers",
    "locationName": "Detroit",
    "shortName": "Detroit",
    "franchiseName": "Detroit",
    "clubName": "Tigers"
   },
   {
    "id": 117,
    "abbreviation": "HOU",
    "name": "Houston Astros",
    "teamName": "Astros",
    "locationName": "Houston",
    "shortName": "Houston",
    "franchiseName": "Houston",
    "clubName": "Astros"
   },
   {
    "id": 118,
    "abbreviation": "KC",
    "name": "Kansas City Royals",
    "teamName": "Royals",
    "locationName": "Kansas City",
    "shortName": "Kansas City",
    "franchiseName": "Kansas City",
    "clubName": "Royals"
   },
   {
    "id": 119,
    "abbreviation": "LAD",
    "name": "Los Angeles Dodgers",
    "teamName": "Dodgers",
    "locationName": "Los Angeles",
    "shortName": "LA Dodgers",
    "franchiseName": "Los Angeles",
    "clubName": "Dodgers"
   },
   {
    "id": 120,
    "abbreviation": "WSH",
    "name": "Washington Nationals",
    "teamName": "Nationals",
    "locationName": "Washington",
    "shortName": "Washington",
    "franchiseName": "Washington",
    "clubName": "Nationals"
   },
   {
    "id": 121,
    "abbreviation": "NYM",
    "name": "New York Mets",
    "teamName": "Mets",
    "locationName": "Flushing",
    "shortName": "NY Mets",
    "franchiseName": "New York",
    "clubName": "Mets"
   },
   {
    "id": 133,
    "abbreviation": "ATH",
    "name": "Athletics",
    "teamName": "Athletics",
    "locationName": "Sacramento",
    "shortName": "Athletics",
    "franchiseName": "Athletics",
    "clubName": "Athletics"
   },
   {
    "id": 134,
    "abbreviation": "PIT",
    "name": "Pittsburgh Pirates",
    "teamName": "Pirates",
    "locationName": "Pittsburgh",
    "shortName": "Pittsburgh",
    "franchiseName": "Pittsburgh",
    "clubName": "Pirates"
   },
   {
    "id": 135,
    "abbreviation": "SD",
    "name": "San Diego Padres",
    "teamName": "Padres",
    "locationName": "San Diego",
    "shortName": "San Diego",
    "franchiseName": "San Diego",
    "clubName": "Padres"
   },
   {
    "id": 136,
    "abbreviation": "SEA",
    "name": "Seattle Mariners",
    "teamName": "Mariners",
    "locationName": "Seattle",
    "shortName": "Seattle",
    "franchiseName": "Seattle",
    "clubName": "Mariners"
   },
   {
    "id": 137,
    "abbreviation": "SF",
    "name": "San Francisco Giants",
    "teamName": "Giants",
    "locationName": "San Francisco",
    "shortName": "San Francisco",
    "franchiseName": "San Francisco",
    "clubName": "Giants"
   },
   {
    "id": 138,
    "abbreviation": "STL",
    "name": "St. Louis Cardinals",
    "teamName": "Cardinals",
    "locationName": "St. Louis",
    "shortName": "St. Louis",
    "franchiseName": "St. Louis",
    "clubName": "Cardinals"
   },
   {
    "id": 139,
    "abbreviation": "TB",
    "name": "Tampa Bay Rays",
    "teamName": "Rays",
    "locationName": "St. Petersburg",
    "shortName": "Tampa Bay",
    "franchiseName": "Tampa Bay",
    "clubName": "Rays"
   },
   {
    "id": 140,
    "abbreviation": "TEX",
    "name": "Texas Rangers",
    "teamName": "Rangers",
    "locationName": "Arlington",
    "shortName": "Texas",
    "franchiseName": "Texas",
    "clubName": "Rangers"
   },
   {
    "id": 141,
    "abbreviation": "TOR",
    "name": "Toronto Blue Jays",
    "teamName": "Blue Jays",
    "locationName": "Toronto",
    "shortName": "Toronto",
    "franchiseName": "Toronto",
    "clubName": "Blue Jays"
   },
   {
    "id": 142,
    "abbreviation": "MIN",
    "name": "Minnesota Twins",
    "teamName": "Twins",
    "locationName": "Minneapolis",
    "shortName": "Minnesota",
    "franchiseName": "Minnesota",
    "clubName": "Twins"
   },
   {
    "id": 143,
    "abbreviation": "PHI",
    "name": "Philadelphia Phillies",
    "teamName": "Phillies",
    "locationName": "Philadelphia",
    "shortName": "Philadelphia",
    "franchiseName": "Philadelphia",
    "clubName": "Phillies"
   },
   {
    "id": 144,
    "abbreviation": "ATL",
    "name": "Atlanta Braves",
    "teamName": "Braves",
    "locationName": "Atlanta",
    "shortName": "Atlanta",
    "franchiseName": "Atlanta",
    "clubName": "Braves"
   },
   {
    "id": 145,
    "abbreviation": "CWS",
    "name": "Chicago White Sox",
    "teamName": "White Sox",
    "locationName": "Chicago",
    "shortName": "Chi White Sox",
    "franchiseName": "Chicago",
    "clubName": "White Sox"
   },
   {
    "id": 146,
    "abbreviation": "MIA",
    "name": "Miami Marlins",
    "teamName": "Marlins",
    "locationName": "Miami",
    "shortName": "Miami",
    "franchiseName": "Miami",
    "clubName": "Marlins"
   },
   {
    "id": 147,
    "abbreviation": "NYY",
    "name": "New York Yankees",
    "teamName": "Yankees",
    "locationName": "Bronx",
    "shortName": "NY Yankees",
    "franchiseName": "New York",
    "clubName": "Yankees"
   },
   {
    "id": 158,
    "abbreviation": "MIL",
    "name": "Milwaukee Brewers",
    "teamName": "Brewers",
    "locationName": "Milwaukee",
    "shortName": "Milwaukee",
    "franchiseName": "Milwaukee",
    "clubName": "Brewers"
   }
  ]
 },
 "dates": {
  "2026-09-19": {
   "date": "2026-09-19",
   "what": "Point-in-time official MLB game state for this US-Eastern calendar date: one state row per CHANGE of (status, inning, inning state, runs, winner), each with the capture instant it was first seen; captures[] lists every run that read this date so staleness at any past time is measurable. Team codes are the official MLB abbreviations. Read only through src/mlb-signal-store.js (no row after the decision time is ever returned).",
   "source": {
    "endpoint": "https://statsapi.mlb.com/api/v1/schedule",
    "copyright": "Copyright 2026 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
    "terms": "http://gdx.mlb.com/components/copyright.txt",
    "urls": [
     "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-19&endDate=2026-09-20&hydrate=linescore%2CprobablePitcher%2Cteam&fields=dates%2Cdate%2Cgames%2CgamePk%2CgameDate%2CofficialDate%2CgameType%2CdoubleHeader%2CgameNumber%2Cstatus%2CabstractGameState%2CdetailedState%2CcodedGameState%2CstatusCode%2Cteams%2Caway%2Chome%2Cteam%2Cid%2Cabbreviation%2Cname%2Cscore%2CisWinner%2CprobablePitcher%2CfullName%2Clinescore%2CcurrentInning%2CcurrentInningOrdinal%2CinningState%2CinningHalf%2CisTopInning%2CscheduledInnings%2Cruns%2Cvenue%2Ccopyright"
    ]
   },
   "captures": [
    "2026-09-20T05:25:27.223Z",
    "2026-09-20T16:38:14.587Z",
    "2026-09-20T19:02:18.772Z",
    "2026-09-20T21:34:33.247Z",
    "2026-09-20T23:27:53.812Z",
    "2026-09-21T01:33:29.925Z",
    "2026-09-21T02:33:47.477Z"
   ],
   "games": {
    "822843": {
     "gamePk": 822843,
     "gameDate": "2026-09-19T23:05:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 141,
      "abbreviation": "TOR",
      "name": "Toronto Blue Jays"
     },
     "home": {
      "id": 140,
      "abbreviation": "TEX",
      "name": "Texas Rangers"
     },
     "venue": "Globe Life Field",
     "probablePitchers": {
      "away": {
       "id": 667755,
       "fullName": "José Soriano"
      },
      "home": {
       "id": 615698,
       "fullName": "Cal Quantrill"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 2,
        "home": 6
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "822921": {
     "gamePk": 822921,
     "gameDate": "2026-09-19T20:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 111,
      "abbreviation": "BOS",
      "name": "Boston Red Sox"
     },
     "home": {
      "id": 139,
      "abbreviation": "TB",
      "name": "Tampa Bay Rays"
     },
     "venue": "Tropicana Field",
     "probablePitchers": {
      "away": {
       "id": 678394,
       "fullName": "Brayan Bello"
      },
      "home": {
       "id": 642547,
       "fullName": "Freddy Peralta"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 1,
        "home": 2
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823003": {
     "gamePk": 823003,
     "gameDate": "2026-09-19T23:15:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 120,
      "abbreviation": "WSH",
      "name": "Washington Nationals"
     },
     "home": {
      "id": 138,
      "abbreviation": "STL",
      "name": "St. Louis Cardinals"
     },
     "venue": "Busch Stadium",
     "probablePitchers": {
      "away": {
       "id": 674841,
       "fullName": "Andrew Alvarez"
      },
      "home": {
       "id": 700241,
       "fullName": "Michael McGreevy"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 11,
       "inningState": "Bottom",
       "runs": {
        "away": 8,
        "home": 5
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "823249": {
     "gamePk": 823249,
     "gameDate": "2026-09-20T00:40:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 146,
      "abbreviation": "MIA",
      "name": "Miami Marlins"
     },
     "home": {
      "id": 135,
      "abbreviation": "SD",
      "name": "San Diego Padres"
     },
     "venue": "Petco Park",
     "probablePitchers": {
      "away": {
       "id": 691587,
       "fullName": "Eury Pérez"
      },
      "home": {
       "id": 663554,
       "fullName": "Casey Mize"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 10,
       "inningState": "Bottom",
       "runs": {
        "away": 6,
        "home": 7
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823330": {
     "gamePk": 823330,
     "gameDate": "2026-09-19T22:40:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 118,
      "abbreviation": "KC",
      "name": "Kansas City Royals"
     },
     "home": {
      "id": 134,
      "abbreviation": "PIT",
      "name": "Pittsburgh Pirates"
     },
     "venue": "PNC Park",
     "probablePitchers": {
      "away": {
       "id": 702070,
       "fullName": "Noah Cameron"
      },
      "home": {
       "id": 696149,
       "fullName": "Bubba Chandler"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 5,
        "home": 6
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823571": {
     "gamePk": 823571,
     "gameDate": "2026-09-19T20:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 143,
      "abbreviation": "PHI",
      "name": "Philadelphia Phillies"
     },
     "home": {
      "id": 121,
      "abbreviation": "NYM",
      "name": "New York Mets"
     },
     "venue": "Citi Field",
     "probablePitchers": {
      "away": {
       "id": 691725,
       "fullName": "Andrew Painter"
      },
      "home": {
       "id": 681035,
       "fullName": "Christian Scott"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 3,
        "home": 10
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823899": {
     "gamePk": 823899,
     "gameDate": "2026-09-20T01:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 137,
      "abbreviation": "SF",
      "name": "San Francisco Giants"
     },
     "home": {
      "id": 119,
      "abbreviation": "LAD",
      "name": "Los Angeles Dodgers"
     },
     "venue": "UNIQLO Field at Dodger Stadium",
     "probablePitchers": {
      "away": {
       "id": 805074,
       "fullName": "Yunior Marte"
      },
      "home": {
       "id": 669373,
       "fullName": "Tarik Skubal"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 4,
        "home": 10
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823976": {
     "gamePk": 823976,
     "gameDate": "2026-09-20T01:38:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 142,
      "abbreviation": "MIN",
      "name": "Minnesota Twins"
     },
     "home": {
      "id": 108,
      "abbreviation": "LAA",
      "name": "Los Angeles Angels"
     },
     "venue": "Angel Stadium",
     "probablePitchers": {
      "away": {
       "id": 657746,
       "fullName": "Joe Ryan"
      },
      "home": {
       "id": 672282,
       "fullName": "Reid Detmers"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Final",
       "detailedState": "Game Over",
       "codedGameState": "O",
       "inning": 11,
       "inningState": "Bottom",
       "runs": {
        "away": 5,
        "home": 6
       },
       "winner": "home",
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 11,
       "inningState": "Bottom",
       "runs": {
        "away": 5,
        "home": 6
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824137": {
     "gamePk": 824137,
     "gameDate": "2026-09-19T23:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 144,
      "abbreviation": "ATL",
      "name": "Atlanta Braves"
     },
     "home": {
      "id": 117,
      "abbreviation": "HOU",
      "name": "Houston Astros"
     },
     "venue": "Daikin Park",
     "probablePitchers": {
      "away": {
       "id": 656550,
       "fullName": "Grant Holmes"
      },
      "home": {
       "id": 669713,
       "fullName": "Hayden Wesneski"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 6,
        "home": 3
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824304": {
     "gamePk": 824304,
     "gameDate": "2026-09-20T00:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 136,
      "abbreviation": "SEA",
      "name": "Seattle Mariners"
     },
     "home": {
      "id": 115,
      "abbreviation": "COL",
      "name": "Colorado Rockies"
     },
     "venue": "Coors Field",
     "probablePitchers": {
      "away": {
       "id": 682243,
       "fullName": "Bryce Miller"
      },
      "home": {
       "id": 500779,
       "fullName": "Jose Quintana"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 3,
        "home": 5
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824380": {
     "gamePk": 824380,
     "gameDate": "2026-09-19T22:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 133,
      "abbreviation": "ATH",
      "name": "Athletics"
     },
     "home": {
      "id": 114,
      "abbreviation": "CLE",
      "name": "Cleveland Guardians"
     },
     "venue": "Progressive Field",
     "probablePitchers": {
      "away": {
       "id": 682052,
       "fullName": "Jacob Lopez"
      },
      "home": {
       "id": 676440,
       "fullName": "Tanner Bibee"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 6,
        "home": 12
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824461": {
     "gamePk": 824461,
     "gameDate": "2026-09-19T22:40:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 112,
      "abbreviation": "CHC",
      "name": "Chicago Cubs"
     },
     "home": {
      "id": 113,
      "abbreviation": "CIN",
      "name": "Cincinnati Reds"
     },
     "venue": "Great American Ball Park",
     "probablePitchers": {
      "away": {
       "id": 571510,
       "fullName": "Matthew Boyd"
      },
      "home": {
       "id": 666157,
       "fullName": "Nick Lodolo"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 5,
        "home": 2
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824545": {
     "gamePk": 824545,
     "gameDate": "2026-09-19T18:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 116,
      "abbreviation": "DET",
      "name": "Detroit Tigers"
     },
     "home": {
      "id": 145,
      "abbreviation": "CWS",
      "name": "Chicago White Sox"
     },
     "venue": "Rate Field",
     "probablePitchers": {
      "away": {
       "id": 695549,
       "fullName": "Jackson Jobe"
      },
      "home": {
       "id": 680732,
       "fullName": "Sean Burke"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 1,
        "home": 3
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824788": {
     "gamePk": 824788,
     "gameDate": "2026-09-19T20:05:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 158,
      "abbreviation": "MIL",
      "name": "Milwaukee Brewers"
     },
     "home": {
      "id": 110,
      "abbreviation": "BAL",
      "name": "Baltimore Orioles"
     },
     "venue": "Oriole Park at Camden Yards",
     "probablePitchers": {
      "away": {
       "id": 688107,
       "fullName": "Robert Gasser"
      },
      "home": {
       "id": 669432,
       "fullName": "Trevor Rogers"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 1,
        "home": 0
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "825029": {
     "gamePk": 825029,
     "gameDate": "2026-09-20T00:10:00Z",
     "officialDate": "2026-09-19",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 147,
      "abbreviation": "NYY",
      "name": "New York Yankees"
     },
     "home": {
      "id": 109,
      "abbreviation": "AZ",
      "name": "Arizona Diamondbacks"
     },
     "venue": "Chase Field",
     "probablePitchers": {
      "away": {
       "id": 693645,
       "fullName": "Cam Schlittler"
      },
      "home": {
       "id": 694297,
       "fullName": "Brandon Pfaadt"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-21T02:33:47.477Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 3,
        "home": 5
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    }
   }
  },
  "2026-09-20": {
   "date": "2026-09-20",
   "what": "Point-in-time official MLB game state for this US-Eastern calendar date: one state row per CHANGE of (status, inning, inning state, runs, winner), each with the capture instant it was first seen; captures[] lists every run that read this date so staleness at any past time is measurable. Team codes are the official MLB abbreviations. Read only through src/mlb-signal-store.js (no row after the decision time is ever returned).",
   "source": {
    "endpoint": "https://statsapi.mlb.com/api/v1/schedule",
    "copyright": "Copyright 2026 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
    "terms": "http://gdx.mlb.com/components/copyright.txt",
    "urls": [
     "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-19&endDate=2026-09-20&hydrate=linescore%2CprobablePitcher%2Cteam&fields=dates%2Cdate%2Cgames%2CgamePk%2CgameDate%2CofficialDate%2CgameType%2CdoubleHeader%2CgameNumber%2Cstatus%2CabstractGameState%2CdetailedState%2CcodedGameState%2CstatusCode%2Cteams%2Caway%2Chome%2Cteam%2Cid%2Cabbreviation%2Cname%2Cscore%2CisWinner%2CprobablePitcher%2CfullName%2Clinescore%2CcurrentInning%2CcurrentInningOrdinal%2CinningState%2CinningHalf%2CisTopInning%2CscheduledInnings%2Cruns%2Cvenue%2Ccopyright",
     "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-20&endDate=2026-09-21&hydrate=linescore%2CprobablePitcher%2Cteam&fields=dates%2Cdate%2Cgames%2CgamePk%2CgameDate%2CofficialDate%2CgameType%2CdoubleHeader%2CgameNumber%2Cstatus%2CabstractGameState%2CdetailedState%2CcodedGameState%2CstatusCode%2Cteams%2Caway%2Chome%2Cteam%2Cid%2Cabbreviation%2Cname%2Cscore%2CisWinner%2CprobablePitcher%2CfullName%2Clinescore%2CcurrentInning%2CcurrentInningOrdinal%2CinningState%2CinningHalf%2CisTopInning%2CscheduledInnings%2Cruns%2Cvenue%2Ccopyright"
    ]
   },
   "captures": [
    "2026-09-20T05:25:27.223Z",
    "2026-09-20T16:38:14.587Z",
    "2026-09-20T19:02:18.772Z",
    "2026-09-20T21:34:33.247Z",
    "2026-09-20T23:27:53.812Z",
    "2026-09-21T01:33:29.925Z",
    "2026-09-21T02:33:47.477Z",
    "2026-09-21T08:11:17.018Z"
   ],
   "games": {
    "822844": {
     "gamePk": 822844,
     "gameDate": "2026-09-20T18:35:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 141,
      "abbreviation": "TOR",
      "name": "Toronto Blue Jays"
     },
     "home": {
      "id": 140,
      "abbreviation": "TEX",
      "name": "Texas Rangers"
     },
     "venue": "Globe Life Field",
     "probablePitchers": {
      "away": {
       "id": 693686,
       "fullName": "Spencer Miles"
      },
      "home": {
       "id": 594798,
       "fullName": "Jacob deGrom"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 2,
       "inningState": "Middle",
       "runs": {
        "away": 1,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 7,
        "home": 2
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 7,
        "home": 2
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "822922": {
     "gamePk": 822922,
     "gameDate": "2026-09-20T17:40:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 111,
      "abbreviation": "BOS",
      "name": "Boston Red Sox"
     },
     "home": {
      "id": 139,
      "abbreviation": "TB",
      "name": "Tampa Bay Rays"
     },
     "venue": "Tropicana Field",
     "probablePitchers": {
      "away": {
       "id": 663776,
       "fullName": "Patrick Sandoval"
      },
      "home": {
       "id": 643377,
       "fullName": "Griffin Jax"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 5,
       "inningState": "Bottom",
       "runs": {
        "away": 0,
        "home": 5
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 1,
        "home": 5
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823001": {
     "gamePk": 823001,
     "gameDate": "2026-09-20T18:15:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 120,
      "abbreviation": "WSH",
      "name": "Washington Nationals"
     },
     "home": {
      "id": 138,
      "abbreviation": "STL",
      "name": "St. Louis Cardinals"
     },
     "venue": "Busch Stadium",
     "probablePitchers": {
      "away": {
       "id": 663623,
       "fullName": "Jake Irvin"
      },
      "home": {
       "id": 687273,
       "fullName": "Quinn Mathews"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 3,
       "inningState": "Bottom",
       "runs": {
        "away": 1,
        "home": 2
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 3,
        "home": 5
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823247": {
     "gamePk": 823247,
     "gameDate": "2026-09-20T20:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 146,
      "abbreviation": "MIA",
      "name": "Miami Marlins"
     },
     "home": {
      "id": 135,
      "abbreviation": "SD",
      "name": "San Diego Padres"
     },
     "venue": "Petco Park",
     "probablePitchers": {
      "away": {
       "id": 645261,
       "fullName": "Sandy Alcantara"
      },
      "home": {
       "id": 621111,
       "fullName": "Walker Buehler"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 6,
       "inningState": "Middle",
       "runs": {
        "away": 0,
        "home": 4
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 3,
        "home": 7
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823329": {
     "gamePk": 823329,
     "gameDate": "2026-09-20T17:35:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 118,
      "abbreviation": "KC",
      "name": "Kansas City Royals"
     },
     "home": {
      "id": 134,
      "abbreviation": "PIT",
      "name": "Pittsburgh Pirates"
     },
     "venue": "PNC Park",
     "probablePitchers": {
      "away": {
       "id": 608379,
       "fullName": "Michael Wacha"
      },
      "home": {
       "id": 669199,
       "fullName": "Lake Bachar"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 5,
       "inningState": "End",
       "runs": {
        "away": 1,
        "home": 1
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 3,
        "home": 4
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823570": {
     "gamePk": 823570,
     "gameDate": "2026-09-20T17:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 143,
      "abbreviation": "PHI",
      "name": "Philadelphia Phillies"
     },
     "home": {
      "id": 121,
      "abbreviation": "NYM",
      "name": "New York Mets"
     },
     "venue": "Citi Field",
     "probablePitchers": {
      "away": {
       "id": 650911,
       "fullName": "Cristopher Sánchez"
      },
      "home": {
       "id": 804636,
       "fullName": "Jonah Tong"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 6,
       "inningState": "Bottom",
       "runs": {
        "away": 4,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 7,
        "home": 2
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "823896": {
     "gamePk": 823896,
     "gameDate": "2026-09-20T20:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 137,
      "abbreviation": "SF",
      "name": "San Francisco Giants"
     },
     "home": {
      "id": 119,
      "abbreviation": "LAD",
      "name": "Los Angeles Dodgers"
     },
     "venue": "UNIQLO Field at Dodger Stadium",
     "probablePitchers": {
      "away": {
       "id": 683363,
       "fullName": "Matt Wilkinson"
      },
      "home": {
       "id": 676263,
       "fullName": "Jack Dreyer"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 6,
       "inningState": "Top",
       "runs": {
        "away": 1,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 1,
        "home": 3
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "823975": {
     "gamePk": 823975,
     "gameDate": "2026-09-20T20:07:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 142,
      "abbreviation": "MIN",
      "name": "Minnesota Twins"
     },
     "home": {
      "id": 108,
      "abbreviation": "LAA",
      "name": "Los Angeles Angels"
     },
     "venue": "Angel Stadium",
     "probablePitchers": {
      "away": {
       "id": 665152,
       "fullName": "Dean Kremer"
      },
      "home": {
       "id": 696270,
       "fullName": "Ryan Johnson"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 5,
       "inningState": "Middle",
       "runs": {
        "away": 3,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 8,
        "home": 0
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824139": {
     "gamePk": 824139,
     "gameDate": "2026-09-20T18:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 144,
      "abbreviation": "ATL",
      "name": "Atlanta Braves"
     },
     "home": {
      "id": 117,
      "abbreviation": "HOU",
      "name": "Houston Astros"
     },
     "venue": "Daikin Park",
     "probablePitchers": {
      "away": {
       "id": 527048,
       "fullName": "Martín Pérez"
      },
      "home": {
       "id": 686613,
       "fullName": "Hunter Brown"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 3,
       "inningState": "Middle",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 4,
        "home": 2
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824300": {
     "gamePk": 824300,
     "gameDate": "2026-09-20T19:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 136,
      "abbreviation": "SEA",
      "name": "Seattle Mariners"
     },
     "home": {
      "id": 115,
      "abbreviation": "COL",
      "name": "Colorado Rockies"
     },
     "venue": "Coors Field",
     "probablePitchers": {
      "away": {
       "id": 807739,
       "fullName": "Kade Anderson"
      },
      "home": {
       "id": 608372,
       "fullName": "Tomoyuki Sugano"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "Warmup",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 2,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 2,
        "home": 1
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824381": {
     "gamePk": 824381,
     "gameDate": "2026-09-20T17:40:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 133,
      "abbreviation": "ATH",
      "name": "Athletics"
     },
     "home": {
      "id": 114,
      "abbreviation": "CLE",
      "name": "Cleveland Guardians"
     },
     "venue": "Progressive Field",
     "probablePitchers": {
      "away": {
       "id": 678022,
       "fullName": "Jack Perkins"
      },
      "home": {
       "id": 668909,
       "fullName": "Gavin Williams"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Delayed Start",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 8,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 1
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 1
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824462": {
     "gamePk": 824462,
     "gameDate": "2026-09-20T17:40:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 112,
      "abbreviation": "CHC",
      "name": "Chicago Cubs"
     },
     "home": {
      "id": 113,
      "abbreviation": "CIN",
      "name": "Cincinnati Reds"
     },
     "venue": "Great American Ball Park",
     "probablePitchers": {
      "away": {
       "id": 656849,
       "fullName": "David Peterson"
      },
      "home": {
       "id": 695076,
       "fullName": "Rhett Lowder"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 5,
       "inningState": "Top",
       "runs": {
        "away": 5,
        "home": 1
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 9,
        "home": 1
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "824546": {
     "gamePk": 824546,
     "gameDate": "2026-09-20T18:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 116,
      "abbreviation": "DET",
      "name": "Detroit Tigers"
     },
     "home": {
      "id": 145,
      "abbreviation": "CWS",
      "name": "Chicago White Sox"
     },
     "venue": "Rate Field",
     "probablePitchers": {
      "away": {
       "id": 675512,
       "fullName": "Troy Melton"
      },
      "home": {
       "id": 663436,
       "fullName": "Davis Martin"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T05:25:27.223Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T16:38:14.587Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Preview",
       "detailedState": "Delayed Start",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-20T23:27:53.812Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 4,
       "inningState": "End",
       "runs": {
        "away": 0,
        "home": 4
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-21T01:33:29.925Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 1,
        "home": 8
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    },
    "824789": {
     "gamePk": 824789,
     "gameDate": "2026-09-20T23:20:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 158,
      "abbreviation": "MIL",
      "name": "Milwaukee Brewers"
     },
     "home": {
      "id": 110,
      "abbreviation": "BAL",
      "name": "Baltimore Orioles"
     },
     "venue": "Oriole Park at Camden Yards",
     "probablePitchers": {
      "away": {
       "id": 694819,
       "fullName": "Jacob Misiorowski"
      },
      "home": {
       "id": 687064,
       "fullName": "Brandon Young"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-20T23:27:53.812Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 1,
       "inningState": "Bottom",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-21T01:33:29.925Z",
       "last_seen_at": "2026-09-21T01:33:29.925Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 7,
       "inningState": "Bottom",
       "runs": {
        "away": 3,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-21T02:33:47.477Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Bottom",
       "runs": {
        "away": 3,
        "home": 0
       },
       "winner": "away",
       "url_ref": 0
      }
     ]
    },
    "825028": {
     "gamePk": 825028,
     "gameDate": "2026-09-20T20:10:00Z",
     "officialDate": "2026-09-20",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 147,
      "abbreviation": "NYY",
      "name": "New York Yankees"
     },
     "home": {
      "id": 109,
      "abbreviation": "AZ",
      "name": "Arizona Diamondbacks"
     },
     "venue": "Chase Field",
     "probablePitchers": {
      "away": {
       "id": 701542,
       "fullName": "Will Warren"
      },
      "home": {
       "id": 669203,
       "fullName": "Corbin Burnes"
      }
     },
     "firstCapturedAt": "2026-09-20T05:25:27.223Z",
     "states": [
      {
       "captured_at": "2026-09-20T05:25:27.223Z",
       "last_seen_at": "2026-09-20T16:38:14.587Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T19:02:18.772Z",
       "last_seen_at": "2026-09-20T19:02:18.772Z",
       "abstractGameState": "Preview",
       "detailedState": "Pre-Game",
       "codedGameState": "P",
       "inning": 1,
       "inningState": "Top",
       "runs": {
        "away": 0,
        "home": 0
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T21:34:33.247Z",
       "last_seen_at": "2026-09-20T21:34:33.247Z",
       "abstractGameState": "Live",
       "detailedState": "In Progress",
       "codedGameState": "I",
       "inning": 5,
       "inningState": "Top",
       "runs": {
        "away": 4,
        "home": 1
       },
       "winner": null,
       "url_ref": 0
      },
      {
       "captured_at": "2026-09-20T23:27:53.812Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Final",
       "detailedState": "Final",
       "codedGameState": "F",
       "inning": 9,
       "inningState": "Top",
       "runs": {
        "away": 4,
        "home": 8
       },
       "winner": "home",
       "url_ref": 0
      }
     ]
    }
   }
  },
  "2026-09-21": {
   "date": "2026-09-21",
   "what": "Point-in-time official MLB game state for this US-Eastern calendar date: one state row per CHANGE of (status, inning, inning state, runs, winner), each with the capture instant it was first seen; captures[] lists every run that read this date so staleness at any past time is measurable. Team codes are the official MLB abbreviations. Read only through src/mlb-signal-store.js (no row after the decision time is ever returned).",
   "source": {
    "endpoint": "https://statsapi.mlb.com/api/v1/schedule",
    "copyright": "Copyright 2026 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
    "terms": "http://gdx.mlb.com/components/copyright.txt",
    "urls": [
     "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-20&endDate=2026-09-21&hydrate=linescore%2CprobablePitcher%2Cteam&fields=dates%2Cdate%2Cgames%2CgamePk%2CgameDate%2CofficialDate%2CgameType%2CdoubleHeader%2CgameNumber%2Cstatus%2CabstractGameState%2CdetailedState%2CcodedGameState%2CstatusCode%2Cteams%2Caway%2Chome%2Cteam%2Cid%2Cabbreviation%2Cname%2Cscore%2CisWinner%2CprobablePitcher%2CfullName%2Clinescore%2CcurrentInning%2CcurrentInningOrdinal%2CinningState%2CinningHalf%2CisTopInning%2CscheduledInnings%2Cruns%2Cvenue%2Ccopyright"
    ]
   },
   "captures": [
    "2026-09-21T08:11:17.018Z"
   ],
   "games": {
    "823169": {
     "gamePk": 823169,
     "gameDate": "2026-09-22T01:45:00Z",
     "officialDate": "2026-09-21",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 142,
      "abbreviation": "MIN",
      "name": "Minnesota Twins"
     },
     "home": {
      "id": 137,
      "abbreviation": "SF",
      "name": "San Francisco Giants"
     },
     "venue": "Oracle Park",
     "probablePitchers": {
      "away": {
       "id": 805673,
       "fullName": "Zebby Matthews"
      },
      "home": {
       "id": 694918,
       "fullName": "Blade Tidwell"
      }
     },
     "firstCapturedAt": "2026-09-21T08:11:17.018Z",
     "states": [
      {
       "captured_at": "2026-09-21T08:11:17.018Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      }
     ]
    },
    "824221": {
     "gamePk": 824221,
     "gameDate": "2026-09-21T22:40:00Z",
     "officialDate": "2026-09-21",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 120,
      "abbreviation": "WSH",
      "name": "Washington Nationals"
     },
     "home": {
      "id": 116,
      "abbreviation": "DET",
      "name": "Detroit Tigers"
     },
     "venue": "Comerica Park",
     "probablePitchers": {
      "away": {
       "id": 687792,
       "fullName": "DJ Herz"
      },
      "home": {
       "id": 689981,
       "fullName": "River Ryan"
      }
     },
     "firstCapturedAt": "2026-09-21T08:11:17.018Z",
     "states": [
      {
       "captured_at": "2026-09-21T08:11:17.018Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      }
     ]
    },
    "824787": {
     "gamePk": 824787,
     "gameDate": "2026-09-21T22:35:00Z",
     "officialDate": "2026-09-21",
     "gameType": "R",
     "doubleHeader": "N",
     "gameNumber": 1,
     "away": {
      "id": 141,
      "abbreviation": "TOR",
      "name": "Toronto Blue Jays"
     },
     "home": {
      "id": 110,
      "abbreviation": "BAL",
      "name": "Baltimore Orioles"
     },
     "venue": "Oriole Park at Camden Yards",
     "probablePitchers": {
      "away": {
       "id": 702056,
       "fullName": "Trey Yesavage"
      },
      "home": {
       "id": 669358,
       "fullName": "Shane Baz"
      }
     },
     "firstCapturedAt": "2026-09-21T08:11:17.018Z",
     "states": [
      {
       "captured_at": "2026-09-21T08:11:17.018Z",
       "last_seen_at": "2026-09-21T08:11:17.018Z",
       "abstractGameState": "Preview",
       "detailedState": "Scheduled",
       "codedGameState": "S",
       "inning": null,
       "inningState": null,
       "runs": {
        "away": null,
        "home": null
       },
       "winner": null,
       "url_ref": 0
      }
     ]
    }
   }
  }
 }
};
