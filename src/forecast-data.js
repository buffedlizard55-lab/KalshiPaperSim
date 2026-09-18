/**
 * KalshiPaperSim — Point-in-Time Forecast Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/forecasts/*.json,
 * which scripts/archive-forecasts.mjs grows from the official NWS API
 * (api.weather.gov) on the weather-signals workflow schedule.
 *
 * Each snapshot is VERBATIM what api.weather.gov returned at captured_at —
 * the point-in-time record a weather strategy is allowed to read. Read it
 * only through src/forecast-store.js, which refuses any snapshot captured
 * AFTER the decision time (the anti-lookahead rule).
 *
 * 9 location(s) · 38 shipped snapshot(s) · generated 2026-09-18T18:06:12.305Z
 */

export const FORECAST_DATA = {
 "generatedAt": "2026-09-18T18:06:12.305Z",
 "present": true,
 "locations": {
  "austin-camp-mabry": {
   "location": {
    "key": "austin-camp-mabry",
    "city": "Austin (Camp Mabry)",
    "series": "KXHIGHAUS",
    "latitude": 30.3167,
    "longitude": -97.7667,
    "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
    "resolved": {
     "gridId": "EWX",
     "gridX": 155,
     "gridY": 93,
     "forecastZone": "https://api.weather.gov/zones/forecast/TXZ192",
     "county": "https://api.weather.gov/zones/county/TXC453",
     "relativeLocation": "Austin, TX",
     "timeZone": "America/Chicago",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/30.3167,-97.7667"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:46:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 100,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:46:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 100,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:46:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 100,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T15:46:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-18T11:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 100,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    }
   ]
  },
  "chicago-midway": {
   "location": {
    "key": "chicago-midway",
    "city": "Chicago (Midway)",
    "series": "KXHIGHCHI",
    "latitude": 41.7868,
    "longitude": -87.7522,
    "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
    "resolved": {
     "gridId": "LOT",
     "gridX": 72,
     "gridY": 69,
     "forecastZone": "https://api.weather.gov/zones/forecast/ILZ104",
     "county": "https://api.weather.gov/zones/county/ILC031",
     "relativeLocation": "Chicago, IL",
     "timeZone": "America/Chicago",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/41.7868,-87.7522"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T07:41:14+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-19",
       "highF": 74,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 97
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-21",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 62
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 67,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T07:41:14+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-18T07:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-19",
       "highF": 74,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 97
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-21",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 62
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 67,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T07:41:14+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-19",
       "highF": 74,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 97
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-21",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 62
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 67,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T16:36:14+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-18T11:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-19",
       "highF": 74,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 97
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-21",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 62
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 67,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    }
   ]
  },
  "denver-den": {
   "location": {
    "key": "denver-den",
    "city": "Denver (DEN)",
    "series": "KXHIGHDEN",
    "latitude": 39.8561,
    "longitude": -104.6737,
    "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
    "resolved": {
     "gridId": "BOU",
     "gridX": 74,
     "gridY": 66,
     "forecastZone": "https://api.weather.gov/zones/forecast/COZ040",
     "county": "https://api.weather.gov/zones/county/COC031",
     "relativeLocation": "Denver, CO",
     "timeZone": "America/Denver",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/39.8561,-104.6737"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:46:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-06:00",
       "endTime": "2026-09-18T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-19",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 68
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 52
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 81,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:46:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-06:00",
       "endTime": "2026-09-18T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-19",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 68
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 52
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 81,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:46:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "Today",
       "startTime": "2026-09-18T07:00:00-06:00",
       "endTime": "2026-09-18T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-19",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 68
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 52
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 81,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T15:59:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "Today",
       "startTime": "2026-09-18T10:00:00-06:00",
       "endTime": "2026-09-18T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 55
      },
      {
       "date": "2026-09-19",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 68
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 52
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 81,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    }
   ]
  },
  "los-angeles-lax": {
   "location": {
    "key": "los-angeles-lax",
    "city": "Los Angeles (LAX)",
    "series": "KXHIGHLAX",
    "latitude": 33.9425,
    "longitude": -118.4081,
    "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
    "resolved": {
     "gridId": "LOX",
     "gridX": 148,
     "gridY": 41,
     "forecastZone": "https://api.weather.gov/zones/forecast/CAZ366",
     "county": "https://api.weather.gov/zones/county/CAC037",
     "relativeLocation": "Los Angeles, CA",
     "timeZone": "America/Los_Angeles",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/33.9425,-118.4081"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:11:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 73,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 76,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:11:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 73,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 76,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:11:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 79,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 73,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 76,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T15:47:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 79,
       "periodName": "Today",
       "startTime": "2026-09-18T09:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 73,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 76,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    }
   ]
  },
  "miami-mia": {
   "location": {
    "key": "miami-mia",
    "city": "Miami (MIA)",
    "series": "KXHIGHMIA",
    "latitude": 25.7959,
    "longitude": -80.287,
    "points_url": "https://api.weather.gov/points/25.7959,-80.287",
    "resolved": {
     "gridId": "MFL",
     "gridX": 106,
     "gridY": 51,
     "forecastZone": "https://api.weather.gov/zones/forecast/FLZ074",
     "county": "https://api.weather.gov/zones/county/FLC086",
     "relativeLocation": "Miami Springs, FL",
     "timeZone": "America/New_York",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/25.7959,-80.287"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:02:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 64
      },
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:02:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 64
      },
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:02:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-18T09:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 64
      },
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T12:02:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 64
      },
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      }
     ]
    }
   ]
  },
  "nyc-central-park": {
   "location": {
    "key": "nyc-central-park",
    "city": "New York (Central Park)",
    "series": "KXHIGHNY",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
    "resolved": {
     "gridId": "OKX",
     "gridX": 34,
     "gridY": 45,
     "forecastZone": "https://api.weather.gov/zones/forecast/NYZ072",
     "county": "https://api.weather.gov/zones/county/NYC061",
     "relativeLocation": "New York, NY",
     "timeZone": "America/New_York",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/40.7829,-73.9654"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 6,
   "shippedSnapshots": 6,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T03:19:26.166Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-17T18:41:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      },
      {
       "date": "2026-09-21",
       "highF": 69,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 46
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 41
      },
      {
       "date": "2026-09-23",
       "highF": 63,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      }
     ]
    },
    {
     "captured_at": "2026-09-18T05:40:44.875Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-17T18:41:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      },
      {
       "date": "2026-09-21",
       "highF": 69,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 46
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 41
      },
      {
       "date": "2026-09-23",
       "highF": 63,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:16:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-18T07:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 66,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:16:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 66,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T09:16:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-18T09:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 66,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T15:03:34+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-18T11:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 66,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 43
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      }
     ]
    }
   ]
  },
  "philadelphia-phl": {
   "location": {
    "key": "philadelphia-phl",
    "city": "Philadelphia (PHL)",
    "series": "KXHIGHPHIL",
    "latitude": 39.8729,
    "longitude": -75.2437,
    "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
    "resolved": {
     "gridId": "PHI",
     "gridX": 48,
     "gridY": 75,
     "forecastZone": "https://api.weather.gov/zones/forecast/PAZ070",
     "county": "https://api.weather.gov/zones/county/PAC045",
     "relativeLocation": "Philadelphia, PA",
     "timeZone": "America/New_York",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/39.8729,-75.2437"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T08:09:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 85,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 67
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-22",
       "highF": 66,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T08:09:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 85,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 67
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-22",
       "highF": 66,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T08:09:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 85,
       "periodName": "Today",
       "startTime": "2026-09-18T09:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 67
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-22",
       "highF": 66,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T08:09:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 85,
       "periodName": "Today",
       "startTime": "2026-09-18T11:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 67
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-22",
       "highF": 66,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      }
     ]
    }
   ]
  },
  "phoenix-phx": {
   "location": {
    "key": "phoenix-phx",
    "city": "Phoenix (PHX)",
    "series": "KXHIGHTPHX",
    "latitude": 33.4342,
    "longitude": -112.0116,
    "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
    "resolved": {
     "gridId": "PSR",
     "gridX": 161,
     "gridY": 57,
     "forecastZone": "https://api.weather.gov/zones/forecast/AZZ543",
     "county": "https://api.weather.gov/zones/county/AZC013",
     "relativeLocation": "Phoenix, AZ",
     "timeZone": "America/Phoenix",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/33.4342,-112.0116"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T11:03:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 103,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T11:03:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 103,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T11:03:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 102,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 103,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T11:03:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 102,
       "periodName": "Today",
       "startTime": "2026-09-18T07:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 103,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    }
   ]
  },
  "seattle-sea": {
   "location": {
    "key": "seattle-sea",
    "city": "Seattle (Sea-Tac)",
    "series": "KXHIGHTSEA",
    "latitude": 47.4502,
    "longitude": -122.3088,
    "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
    "resolved": {
     "gridId": "SEW",
     "gridX": 124,
     "gridY": 61,
     "forecastZone": "https://api.weather.gov/zones/forecast/WAZ316",
     "county": "https://api.weather.gov/zones/county/WAC033",
     "relativeLocation": "SeaTac, WA",
     "timeZone": "America/Los_Angeles",
     "resolvedAt": "2026-09-18T17:06:49.920Z",
     "pointsUrl": "https://api.weather.gov/points/47.4502,-122.3088"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-18T13:24:29.350Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:26:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 73,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:28:58.995Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:26:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 73,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T13:44:48.504Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:26:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 73,
       "periodName": "Today",
       "startTime": "2026-09-18T06:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    },
    {
     "captured_at": "2026-09-18T17:06:49.920Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T06:26:28+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 73,
       "periodName": "Today",
       "startTime": "2026-09-18T08:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      }
     ]
    }
   ]
  }
 }
};
