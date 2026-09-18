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
 * 1 location(s) · 2 shipped snapshot(s) · generated 2026-09-18T12:51:11.960Z
 */

export const FORECAST_DATA = {
 "generatedAt": "2026-09-18T12:51:11.960Z",
 "present": true,
 "locations": {
  "nyc-central-park": {
   "location": {
    "key": "nyc-central-park",
    "city": "New York (Central Park)",
    "series": "KXHIGHNY",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "points_url": "https://api.weather.gov/points/40.7829,-73.9654"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 2,
   "shippedSnapshots": 2,
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
    }
   ]
  }
 }
};
