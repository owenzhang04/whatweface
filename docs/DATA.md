# Data pipeline

## Decision

**No live data feeds in v1. Use scheduled refresh instead.** Most important numbers (deaths by cause, poverty, biodiversity) are published once a year or less, so a real-time feed would show the same figure for months. Only a few metrics actually move monthly or faster: CO₂ ppm, temperature anomaly, sea ice extent.

The site is fully static. Datasets live in the repo, refreshed by a scheduled job that opens a pull request so every number change is reviewed.

```
GitHub Action (weekly cron)
  → scripts/fetch-data.ts pulls each dataset in data/datasets.yaml
  → writes data/series/<provider>/<id>.csv + .meta.json
  → if anything changed: opens PR "Data refresh YYYY-MM-DD" with a diff summary
  → you review + merge → Cloudflare Pages rebuilds
```

Live updates can be added later for the 2–3 fast-moving metrics (as a small client-side fetch or a Cloudflare Worker) without changing the architecture. Not before v1 ships.

## Layout

```
data/
  datasets.yaml              # registry: id, provider, endpoint, parser, cadence, source id
  series/
    owid/<slug>.csv
    owid/<slug>.meta.json    # OWID metadata incl. primary citation
    noaa/co2-mlo-monthly.csv
    nasa/gistemp-global.csv
    worldbank/<indicator>.csv
scripts/
  fetch-data.ts              # one fetcher per provider, retries with backoff (3 attempts)
  check-staleness.ts         # warns when a series hasn't updated within its expected cadence
```

Fetch rules:
- Retries live in the script (3 attempts, exponential backoff). A failed provider doesn't block the others; the PR body lists failures.
- Never overwrite a series with an empty or malformed response. Validate row count and the expected columns first.
- Record `fetched_at` and the provider's own `last_updated` in `.meta.json`.

## Endpoints

| Provider | Endpoint | Format | Status |
|---|---|---|---|
| Our World in Data, chart CSV | `https://ourworldindata.org/grapher/<slug>.csv?csvType=filtered&country=~OWID_WRL` | CSV: `Entity,Code,Year,<value>` | **Verified 2026-10-06** (`life-expectancy` → World 2023 = 73.1694) |
| Our World in Data, metadata | `https://ourworldindata.org/grapher/<slug>.metadata.json` | JSON incl. `chart.citation`, `chart.originalChartUrl` | **Verified 2026-10-06**. Slug must be exact; a wrong slug returns `404 {"status":404}` |
| NOAA GML, Mauna Loa CO₂ monthly | `https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt` | Whitespace text, `#` comments; cols: year, month, decimal date, average, deseasonalized, ndays, sdev, unc | **Verified 2026-10-06** (Aug 2026 = 427.55 ppm) |
| NASA GISTEMP v4, global land-ocean | `https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv` | CSV, first line is a title; `***` = missing. Anomaly °C vs 1951–1980 | **Verified 2026-10-06** (Aug 2026 = 1.40) |
| World Bank API | `https://api.worldbank.org/v2/country/WLD/indicator/<id>?format=json` | JSON `[meta, rows]`; rows have `date`, `value` | **Verified 2026-10-06** (`SI.POV.DDAY` → 10.4% for 2024, at $3.00/day 2021 PPP) |
| IHME GBD Results | GBD Results tool (account required) | CSV export | **Unverified.** Check terms of use: IHME data is free for non-commercial use with attribution. Likely a manual download, stored with its citation, not an automated fetch |
| NSIDC sea ice index | — | — | Unverified, needed only if sea ice gets a page |
| UNHCR refugee statistics API | — | — | Unverified, needed for displacement |

## Licensing

- OWID charts and data they produce: CC BY 4.0. Some underlying third-party data has its own license; check `.meta.json` before redrawing.
- NOAA and NASA: US government works, public domain. Credit them anyway.
- World Bank: CC BY 4.0.
- IHME GBD: non-commercial terms. Fine for this site, but no ads or paid tiers while using it.

Every chart's caption names the source and license.
