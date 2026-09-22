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
 * 9 location(s) · 209 shipped snapshot(s) · generated 2026-09-22T17:39:52.338Z
 */

export const FORECAST_DATA = {
 "generatedAt": "2026-09-22T17:39:52.338Z",
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/30.3167,-97.7667"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:44:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 99,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T15:00:00-05:00",
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
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T00:34:24+00:00",
     "units": "us",
     "days": [
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
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-25",
       "highF": 98,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T05:42:21+00:00",
     "units": "us",
     "days": [
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
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-25",
       "highF": 98,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T11:42:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 100,
       "periodName": "Today",
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
       "probabilityOfPrecipitationPct": 0
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
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 98,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T11:42:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 100,
       "periodName": "Today",
       "startTime": "2026-09-19T11:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
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
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 98,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:32:29+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T23:44:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T23:44:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T23:44:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T05:44:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T11:46:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-20T07:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 98,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 96,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-26",
       "highF": 96,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T11:46:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 99,
       "periodName": "Today",
       "startTime": "2026-09-20T11:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 98,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 96,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-26",
       "highF": 96,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:14:53+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 100,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T16:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-26",
       "highF": 97,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T01:02:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-26",
       "highF": 97,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 98,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T05:44:40+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-26",
       "highF": 97,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 98,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T11:42:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 98,
       "periodName": "Today",
       "startTime": "2026-09-21T09:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-22",
       "highF": 98,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 97,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 97,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 98,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T22:32:39+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 99,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T17:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 98,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 98,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-27",
       "highF": 98,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T11:42:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Today",
       "startTime": "2026-09-22T07:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-28",
       "highF": 97,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-05:00",
       "endTime": "2026-09-28T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/30.3167,-97.7667",
     "forecast_url": "https://api.weather.gov/gridpoints/EWX/155,93/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T16:32:33+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "This Afternoon",
       "startTime": "2026-09-22T12:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-23",
       "highF": 100,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-24",
       "highF": 99,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 99,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-28",
       "highF": 97,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-05:00",
       "endTime": "2026-09-28T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/41.7868,-87.7522"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:51:18+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 72,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T15:00:00-05:00",
       "endTime": "2026-09-18T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 42
      },
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:51:18+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T02:51:20+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 82
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T08:46:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Today",
       "startTime": "2026-09-19T06:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 100
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 65
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T15:36:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 77,
       "periodName": "Today",
       "startTime": "2026-09-19T11:00:00-05:00",
       "endTime": "2026-09-19T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 81
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 65
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T21:01:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 68,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T00:26:04+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 68,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T02:01:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 68,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 87
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T02:51:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 68,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 87
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T04:56:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 68,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 100
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 70,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T08:36:09+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Today",
       "startTime": "2026-09-20T06:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 100
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T15:21:19+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Today",
       "startTime": "2026-09-20T11:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 95
      },
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T19:46:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 67,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T15:00:00-05:00",
       "endTime": "2026-09-20T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 100
      },
      {
       "date": "2026-09-21",
       "highF": 64,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 68,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T19:46:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 64,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 68,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 74,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T06:21:10+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 65,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T08:46:22+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 64,
       "periodName": "Today",
       "startTime": "2026-09-21T07:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 8
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T18:55:59+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 63,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T15:00:00-05:00",
       "endTime": "2026-09-21T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 66,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-27",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T09:45:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Today",
       "startTime": "2026-09-22T07:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-28",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-05:00",
       "endTime": "2026-09-28T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/41.7868,-87.7522",
     "forecast_url": "https://api.weather.gov/gridpoints/LOT/72,69/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T16:46:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 62,
       "periodName": "This Afternoon",
       "startTime": "2026-09-22T12:00:00-05:00",
       "endTime": "2026-09-22T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-05:00",
       "endTime": "2026-09-23T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-24",
       "highF": 68,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-05:00",
       "endTime": "2026-09-24T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-05:00",
       "endTime": "2026-09-25T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-05:00",
       "endTime": "2026-09-26T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-05:00",
       "endTime": "2026-09-27T18:00:00-05:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-28",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-05:00",
       "endTime": "2026-09-28T18:00:00-05:00",
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/39.8561,-104.6737"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T13:00:00-06:00",
       "endTime": "2026-09-18T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 77,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T06:46:31+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 11
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T06:46:31+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Today",
       "startTime": "2026-09-19T07:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 11
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 78,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T17:00:00-06:00",
       "endTime": "2026-09-19T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 72
      },
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 18
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 18
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 18
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:46:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 33
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 18
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T06:46:36+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-20T06:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T06:46:36+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-20T10:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-22",
       "highF": 79,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:46:38+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T13:00:00-06:00",
       "endTime": "2026-09-20T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 80,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-25",
       "highF": 81,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:46:38+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 80,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-25",
       "highF": 81,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 82,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:46:38+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 80,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-25",
       "highF": 81,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 82,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 82,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T06:46:33+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Today",
       "startTime": "2026-09-21T07:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 81,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-23",
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 76,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-26",
       "highF": 83,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 82,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T18:46:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T15:00:00-06:00",
       "endTime": "2026-09-21T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 81,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-24",
       "highF": 73,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 41
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-26",
       "highF": 84,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-27",
       "highF": 83,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T08:49:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-22T06:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-25",
       "highF": 77,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 19
      },
      {
       "date": "2026-09-26",
       "highF": 84,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 84,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-28",
       "highF": 81,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-06:00",
       "endTime": "2026-09-28T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/39.8561,-104.6737",
     "forecast_url": "https://api.weather.gov/gridpoints/BOU/74,66/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T08:49:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 81,
       "periodName": "Today",
       "startTime": "2026-09-22T11:00:00-06:00",
       "endTime": "2026-09-22T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-06:00",
       "endTime": "2026-09-23T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-24",
       "highF": 70,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-06:00",
       "endTime": "2026-09-24T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-25",
       "highF": 77,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-06:00",
       "endTime": "2026-09-25T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 19
      },
      {
       "date": "2026-09-26",
       "highF": 84,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-06:00",
       "endTime": "2026-09-26T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 84,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-06:00",
       "endTime": "2026-09-27T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-28",
       "highF": 81,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-06:00",
       "endTime": "2026-09-28T18:00:00-06:00",
       "probabilityOfPrecipitationPct": 21
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/33.9425,-118.4081"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:26:47+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 78,
       "periodName": "Today",
       "startTime": "2026-09-18T11:00:00-07:00",
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
       "highF": 77,
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
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:26:47+00:00",
     "units": "us",
     "days": [
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
       "highF": 77,
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
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:26:47+00:00",
     "units": "us",
     "days": [
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
       "highF": 77,
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
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T08:01:46+00:00",
     "units": "us",
     "days": [
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
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 72,
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
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T08:01:46+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "Today",
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
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 73,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 72,
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
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:07:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T16:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-20",
       "highF": 79,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 77,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:07:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 80,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T13:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-20",
       "highF": 79,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 77,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:07:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 79,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 77,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:07:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 79,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 77,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:07:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 79,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 77,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 78,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T09:26:20+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 76,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T09:26:20+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 76,
       "periodName": "Today",
       "startTime": "2026-09-20T09:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 78,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-26",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T19:47:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 75,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T13:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-22",
       "highF": 74,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T19:47:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-22",
       "highF": 74,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T19:47:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-22",
       "highF": 74,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 77,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 79,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T08:46:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 75,
       "periodName": "Today",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 81,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T20:47:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 74,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T14:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 75,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 79,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 80,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-27",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T06:26:46+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 77,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 79,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 79,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 81,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-28",
       "highF": 76,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/33.9425,-118.4081",
     "forecast_url": "https://api.weather.gov/gridpoints/LOX/148,41/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T15:47:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 74,
       "periodName": "Today",
       "startTime": "2026-09-22T10:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-23",
       "highF": 80,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 80,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-25",
       "highF": 80,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-26",
       "highF": 81,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-27",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-28",
       "highF": 76,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/25.7959,-80.287"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:06:53+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 88,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T16:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 67
      },
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 95
      },
      {
       "date": "2026-09-21",
       "highF": 89,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 94
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 85
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:06:53+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 95
      },
      {
       "date": "2026-09-21",
       "highF": 89,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 94
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 85
      },
      {
       "date": "2026-09-25",
       "highF": 88,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:06:53+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 95
      },
      {
       "date": "2026-09-21",
       "highF": 89,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 94
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 85
      },
      {
       "date": "2026-09-25",
       "highF": 88,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T07:56:42+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-19T07:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 66
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 92
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 87
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-24",
       "highF": 89,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T07:56:42+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 88,
       "periodName": "Today",
       "startTime": "2026-09-19T09:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 66
      },
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 92
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 87
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-24",
       "highF": 89,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:11:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 84
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:11:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 84
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:11:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 84
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:11:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 84
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:11:54+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 88,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-22",
       "highF": 89,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 84
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T08:06:49+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 89,
       "periodName": "Today",
       "startTime": "2026-09-20T07:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-22",
       "highF": 88,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 85
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 76
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T08:06:49+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 89,
       "periodName": "Today",
       "startTime": "2026-09-20T11:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      },
      {
       "date": "2026-09-21",
       "highF": 88,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-22",
       "highF": 88,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 90
      },
      {
       "date": "2026-09-23",
       "highF": 88,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 85
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 76
      },
      {
       "date": "2026-09-26",
       "highF": 89,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 77
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:17:03+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 89,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T17:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 76
      },
      {
       "date": "2026-09-21",
       "highF": 87,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 81
      },
      {
       "date": "2026-09-23",
       "highF": 87,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:17:03+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 87,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 81
      },
      {
       "date": "2026-09-23",
       "highF": 87,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:17:03+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 87,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 81
      },
      {
       "date": "2026-09-23",
       "highF": 87,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 73
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T07:57:02+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 86,
       "periodName": "Today",
       "startTime": "2026-09-21T08:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 68
      },
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 72
      },
      {
       "date": "2026-09-23",
       "highF": 86,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 88
      },
      {
       "date": "2026-09-24",
       "highF": 87,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 79
      },
      {
       "date": "2026-09-25",
       "highF": 88,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 72
      },
      {
       "date": "2026-09-26",
       "highF": 86,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 59
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T20:02:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 86,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T16:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 62
      },
      {
       "date": "2026-09-22",
       "highF": 88,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-23",
       "highF": 87,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 91
      },
      {
       "date": "2026-09-24",
       "highF": 89,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 76
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 69
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 57
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T07:56:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "Today",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 71
      },
      {
       "date": "2026-09-23",
       "highF": 86,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 61
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 45
      },
      {
       "date": "2026-09-28",
       "highF": 86,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 47
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/25.7959,-80.287",
     "forecast_url": "https://api.weather.gov/gridpoints/MFL/106,51/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T07:56:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 87,
       "periodName": "This Afternoon",
       "startTime": "2026-09-22T12:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 71
      },
      {
       "date": "2026-09-23",
       "highF": 86,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 80
      },
      {
       "date": "2026-09-24",
       "highF": 88,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-25",
       "highF": 89,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-26",
       "highF": 88,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 61
      },
      {
       "date": "2026-09-27",
       "highF": 87,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 45
      },
      {
       "date": "2026-09-28",
       "highF": 86,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 47
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/40.7829,-73.9654"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 25,
   "shippedSnapshots": 25,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:10:37+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 81,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T15:00:00-04:00",
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
       "highF": 67,
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
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:10:37+00:00",
     "units": "us",
     "days": [
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
       "highF": 67,
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
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T19:10:37+00:00",
     "units": "us",
     "days": [
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
       "highF": 67,
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
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T11:01:38+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Today",
       "startTime": "2026-09-19T07:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 67,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T11:01:38+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 71,
       "periodName": "Today",
       "startTime": "2026-09-19T08:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 89
      },
      {
       "date": "2026-09-21",
       "highF": 67,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 36
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:28:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:28:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:28:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:28:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T18:28:11+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 86
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T07:41:32+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Today",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 97
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 40
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 20
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T07:41:32+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "Today",
       "startTime": "2026-09-20T11:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 95
      },
      {
       "date": "2026-09-21",
       "highF": 68,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 40
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 20
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:08:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 70,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T14:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 71
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:08:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-27",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T18:08:16+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 54
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-24",
       "highF": 66,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-27",
       "highF": 72,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 33
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T07:38:06+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Today",
       "startTime": "2026-09-21T08:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 41
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-25",
       "highF": 65,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 42
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 43
      },
      {
       "date": "2026-09-27",
       "highF": 69,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T18:19:32+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 43
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-27",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-28",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 13
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T06:35:35+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Today",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 19
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 51
      },
      {
       "date": "2026-09-27",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-28",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 13
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/40.7829,-73.9654",
     "forecast_url": "https://api.weather.gov/gridpoints/OKX/34,45/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T06:35:35+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Today",
       "startTime": "2026-09-22T11:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 51
      },
      {
       "date": "2026-09-27",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-28",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 13
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/39.8729,-75.2437"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:10:01+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 84,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T16:00:00-04:00",
       "endTime": "2026-09-18T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-21",
       "highF": 71,
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
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:10:01+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-21",
       "highF": 71,
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
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:10:01+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 76,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-20",
       "highF": 78,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 75
      },
      {
       "date": "2026-09-21",
       "highF": 71,
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
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-23",
       "highF": 64,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 37
      },
      {
       "date": "2026-09-25",
       "highF": 69,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T08:09:39+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 78,
       "periodName": "Today",
       "startTime": "2026-09-19T06:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 40
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 42
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T08:09:39+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 78,
       "periodName": "Today",
       "startTime": "2026-09-19T07:00:00-04:00",
       "endTime": "2026-09-19T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 40
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 42
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:09:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 80,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-22",
       "highF": 67,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:09:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 80,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-22",
       "highF": 67,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:09:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 80,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-22",
       "highF": 67,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:09:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 80,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-22",
       "highF": 67,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T20:09:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 80,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 60
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-22",
       "highF": 67,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-26",
       "highF": 71,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T08:09:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Today",
       "startTime": "2026-09-20T07:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 57
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T08:09:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "Today",
       "startTime": "2026-09-20T11:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 78
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 27
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 57
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 30
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 28
      },
      {
       "date": "2026-09-26",
       "highF": 69,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:09:44+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 77,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T16:00:00-04:00",
       "endTime": "2026-09-20T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 42
      },
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T22:15:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-27",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 13
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T22:15:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-22",
       "highF": 65,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 74
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 35
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-26",
       "highF": 70,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 26
      },
      {
       "date": "2026-09-27",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 13
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T08:09:30+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-21T08:00:00-04:00",
       "endTime": "2026-09-21T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-22",
       "highF": 64,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 76
      },
      {
       "date": "2026-09-23",
       "highF": 65,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 31
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-25",
       "highF": 65,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 39
      },
      {
       "date": "2026-09-26",
       "highF": 67,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 38
      },
      {
       "date": "2026-09-27",
       "highF": 70,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 12
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T20:10:12+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 66,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 72
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
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-25",
       "highF": 67,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 24
      },
      {
       "date": "2026-09-26",
       "highF": 68,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-27",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-28",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 6
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T08:09:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Today",
       "startTime": "2026-09-22T08:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 68,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-26",
       "highF": 68,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-27",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-28",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/39.8729,-75.2437",
     "forecast_url": "https://api.weather.gov/gridpoints/PHI/48,75/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T08:09:26+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 63,
       "periodName": "Today",
       "startTime": "2026-09-22T11:00:00-04:00",
       "endTime": "2026-09-22T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 83
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-04:00",
       "endTime": "2026-09-23T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-04:00",
       "endTime": "2026-09-24T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-25",
       "highF": 68,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-04:00",
       "endTime": "2026-09-25T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-26",
       "highF": 68,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-04:00",
       "endTime": "2026-09-26T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 34
      },
      {
       "date": "2026-09-27",
       "highF": 71,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-04:00",
       "endTime": "2026-09-27T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-28",
       "highF": 72,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-04:00",
       "endTime": "2026-09-28T18:00:00-04:00",
       "probabilityOfPrecipitationPct": 9
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/33.4342,-112.0116"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T18:46:24+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 102,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T12:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 103,
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
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
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
       "highF": 102,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T22:47:56+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 103,
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
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
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
       "highF": 102,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 25
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T04:57:44+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 104,
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
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
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
       "highF": 102,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 25
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T06:32:46+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 104,
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
       "highF": 103,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 102,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T06:32:46+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 104,
       "periodName": "Today",
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
       "highF": 103,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 102,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 103,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 12
      },
      {
       "date": "2026-09-24",
       "highF": 102,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:53:08+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 104,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T16:00:00-07:00",
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
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 101,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:53:08+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 104,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T16:00:00-07:00",
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
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 101,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:53:08+00:00",
     "units": "us",
     "days": [
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
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 101,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:53:08+00:00",
     "units": "us",
     "days": [
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
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 101,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T22:53:08+00:00",
     "units": "us",
     "days": [
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
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 23
      },
      {
       "date": "2026-09-25",
       "highF": 101,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T06:32:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T06:32:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "Today",
       "startTime": "2026-09-20T08:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-21",
       "highF": 102,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 102,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 101,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-25",
       "highF": 102,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:17:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 102,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T13:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 100,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T22:51:58+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 100,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 30
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T04:26:55+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-26",
       "highF": 100,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 30
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T10:51:48+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "Today",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-22",
       "highF": 99,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 98,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 11
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 25
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-26",
       "highF": 104,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 6
      },
      {
       "date": "2026-09-27",
       "highF": 98,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T20:23:15+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 101,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T14:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-22",
       "highF": 101,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-23",
       "highF": 99,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 98,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 32
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      },
      {
       "date": "2026-09-26",
       "highF": 101,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-27",
       "highF": 99,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T10:56:14+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-23",
       "highF": 97,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 97,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-28",
       "highF": 98,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/33.4342,-112.0116",
     "forecast_url": "https://api.weather.gov/gridpoints/PSR/161,57/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T16:52:13+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 100,
       "periodName": "Today",
       "startTime": "2026-09-22T10:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-23",
       "highF": 97,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-24",
       "highF": 97,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 13
      },
      {
       "date": "2026-09-25",
       "highF": 99,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-26",
       "highF": 102,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 100,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 10
      },
      {
       "date": "2026-09-28",
       "highF": 98,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
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
     "resolvedAt": "2026-09-22T17:39:50.588Z",
     "pointsUrl": "https://api.weather.gov/points/47.4502,-122.3088"
    },
    "firstResolvedAt": "2026-09-18T13:24:29.350Z"
   },
   "what": "Point-in-time NWS gridded forecast captures (see scripts/archive-forecasts.mjs). Each snapshot is what api.weather.gov returned at captured_at — the archive is what makes a point-in-time weather strategy testable.",
   "snapshotCount": 23,
   "shippedSnapshots": 23,
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
    },
    {
     "captured_at": "2026-09-18T21:43:51.779Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:27:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-18",
       "highF": 73,
       "periodName": "This Afternoon",
       "startTime": "2026-09-18T13:00:00-07:00",
       "endTime": "2026-09-18T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-19",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-23",
       "highF": 68,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-24",
       "highF": 69,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-19T01:14:28.634Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:27:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-23",
       "highF": 68,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-24",
       "highF": 69,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 26
      }
     ]
    },
    {
     "captured_at": "2026-09-19T05:58:33.247Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-18T20:27:21+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 73,
       "periodName": "Saturday",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-23",
       "highF": 68,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-24",
       "highF": 69,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      },
      {
       "date": "2026-09-25",
       "highF": 66,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 26
      }
     ]
    },
    {
     "captured_at": "2026-09-19T11:57:03.777Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T07:25:42+00:00",
     "units": "us",
     "days": [
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
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 68,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-25",
       "highF": 64,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-19T16:32:20.844Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T07:25:42+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-19T06:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 68,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 14
      },
      {
       "date": "2026-09-24",
       "highF": 65,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-25",
       "highF": 64,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 15
      }
     ]
    },
    {
     "captured_at": "2026-09-19T23:55:31.333Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T19:55:25+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T16:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-25",
       "highF": 63,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 19
      }
     ]
    },
    {
     "captured_at": "2026-09-20T01:14:20.789Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T19:55:25+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-19",
       "highF": 72,
       "periodName": "This Afternoon",
       "startTime": "2026-09-19T14:00:00-07:00",
       "endTime": "2026-09-19T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-25",
       "highF": 63,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 19
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:08:37.599Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T19:55:25+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-25",
       "highF": 63,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 19
      },
      {
       "date": "2026-09-26",
       "highF": 65,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T03:25:39.272Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-19T19:55:25+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 73,
       "periodName": "Sunday",
       "startTime": "2026-09-20T06:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 18
      },
      {
       "date": "2026-09-25",
       "highF": 63,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 19
      },
      {
       "date": "2026-09-26",
       "highF": 65,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 7
      }
     ]
    },
    {
     "captured_at": "2026-09-20T06:22:05.531Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T03:22:25+00:00",
     "units": "us",
     "days": [
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
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 21
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-26",
       "highF": 64,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      }
     ]
    },
    {
     "captured_at": "2026-09-20T12:27:08.794Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T07:25:45+00:00",
     "units": "us",
     "days": [
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
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-26",
       "highF": 64,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      }
     ]
    },
    {
     "captured_at": "2026-09-20T16:51:23.254Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T07:25:45+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 72,
       "periodName": "Today",
       "startTime": "2026-09-20T09:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 1
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 64,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 48
      },
      {
       "date": "2026-09-26",
       "highF": 64,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 9
      }
     ]
    },
    {
     "captured_at": "2026-09-20T21:37:08.138Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:05:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T13:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-26",
       "highF": 63,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T01:11:04.414Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:05:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-20",
       "highF": 69,
       "periodName": "This Afternoon",
       "startTime": "2026-09-20T16:00:00-07:00",
       "endTime": "2026-09-20T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-26",
       "highF": 63,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      }
     ]
    },
    {
     "captured_at": "2026-09-21T06:27:33.950Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-20T20:05:57+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 71,
       "periodName": "Monday",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 56
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 49
      },
      {
       "date": "2026-09-26",
       "highF": 63,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 64,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 14
      }
     ]
    },
    {
     "captured_at": "2026-09-21T14:16:08.717Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T07:30:23+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "Today",
       "startTime": "2026-09-21T06:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 69,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 59
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 50
      },
      {
       "date": "2026-09-26",
       "highF": 62,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 5
      },
      {
       "date": "2026-09-27",
       "highF": 64,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 20
      }
     ]
    },
    {
     "captured_at": "2026-09-21T22:36:56.809Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-21T18:27:05+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-21",
       "highF": 70,
       "periodName": "This Afternoon",
       "startTime": "2026-09-21T15:00:00-07:00",
       "endTime": "2026-09-21T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 0
      },
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      },
      {
       "date": "2026-09-23",
       "highF": 66,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 8
      },
      {
       "date": "2026-09-24",
       "highF": 61,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 63
      },
      {
       "date": "2026-09-25",
       "highF": 62,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 55
      },
      {
       "date": "2026-09-26",
       "highF": 62,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 3
      },
      {
       "date": "2026-09-27",
       "highF": 63,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 17
      }
     ]
    },
    {
     "captured_at": "2026-09-22T12:39:25.395Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T06:26:59+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Tuesday",
       "startTime": "2026-09-22T06:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 29
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-25",
       "highF": 61,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-26",
       "highF": 63,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 62,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-28",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    },
    {
     "captured_at": "2026-09-22T17:39:50.588Z",
     "points_url": "https://api.weather.gov/points/47.4502,-122.3088",
     "forecast_url": "https://api.weather.gov/gridpoints/SEW/124,61/forecast",
     "forecastGenerator": "BaselineForecastGenerator",
     "updateTime": "2026-09-22T06:26:59+00:00",
     "units": "us",
     "days": [
      {
       "date": "2026-09-22",
       "highF": 68,
       "periodName": "Today",
       "startTime": "2026-09-22T09:00:00-07:00",
       "endTime": "2026-09-22T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 16
      },
      {
       "date": "2026-09-23",
       "highF": 67,
       "periodName": "Wednesday",
       "startTime": "2026-09-23T06:00:00-07:00",
       "endTime": "2026-09-23T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 2
      },
      {
       "date": "2026-09-24",
       "highF": 62,
       "periodName": "Thursday",
       "startTime": "2026-09-24T06:00:00-07:00",
       "endTime": "2026-09-24T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 70
      },
      {
       "date": "2026-09-25",
       "highF": 61,
       "periodName": "Friday",
       "startTime": "2026-09-25T06:00:00-07:00",
       "endTime": "2026-09-25T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 77
      },
      {
       "date": "2026-09-26",
       "highF": 63,
       "periodName": "Saturday",
       "startTime": "2026-09-26T06:00:00-07:00",
       "endTime": "2026-09-26T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 4
      },
      {
       "date": "2026-09-27",
       "highF": 62,
       "periodName": "Sunday",
       "startTime": "2026-09-27T06:00:00-07:00",
       "endTime": "2026-09-27T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 22
      },
      {
       "date": "2026-09-28",
       "highF": 63,
       "periodName": "Monday",
       "startTime": "2026-09-28T06:00:00-07:00",
       "endTime": "2026-09-28T18:00:00-07:00",
       "probabilityOfPrecipitationPct": 29
      }
     ]
    }
   ]
  }
 }
};
