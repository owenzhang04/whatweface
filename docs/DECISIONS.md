# Decisions

Append-only. Newest at the bottom.

| Date | Decision | Why |
|---|---|---|
| 2026-10-06 | Name: **What We Face**. Repo `owenzhang04/whatweface`, public | Covers past, present and future; plain for a general audience; `.org` and `.com` both free |
| 2026-10-06 | Facts: explicitly cited data with source tiers; build fails on unsourced numbers. Editorial content allowed but always badged | Credibility is what makes the weight land |
| 2026-10-06 | No live feeds in v1; weekly scheduled refresh via reviewed PRs | Most key metrics update yearly; static is more robust. Live can be added for 2–3 fast metrics later |
| 2026-10-06 | Status: `Overcome` / `Active` / `Emerging`, plus a data-computed Trend: `Improving` / `Stable` / `Worsening` | "Ongoing" alone hides direction |
| 2026-10-06 | Stack: Astro + TS + MDX, plain CSS tokens, Observable Plot (build-time SVG), Pagefind, Cloudflare Pages | Content site; schema validation enforces citation rules; free, scalable hosting |
| 2026-10-06 | Visual direction "Observatory at night" (see DESIGN.md), dark default + full light theme | Weight through restraint; light theme for readability |
| 2026-10-06 | Accessibility target WCAG 2.2 AA, AAA contrast for body | |
| 2026-10-06 | Ranking: within each scale by its own metric (Individual: DALYs; Humanity: people affected; Earth: planetary boundary transgression). Never across scales | Metrics aren't comparable across scales |
| 2026-10-06 | v1 = 5 problems per scale, 15 total | Shippable; fully cited pages are slow to write |
| 2026-10-06 | Audience: general public, ~grade 9 reading level, depth in expandable sections | |
| 2026-10-06 | Domain: buy `whatweface.org` at launch (Phase 4); skip `.com` unless traffic justifies it | No revenue; `pages.dev` is free until there's something to point at |
| 2026-10-06 | License: code MIT (`LICENSE`); written content and original data compilations CC BY 4.0 (`LICENSE-CONTENT`). Third-party data keeps its own license (see DATA.md) | Open reuse with attribution, matching OWID/World Bank |
| 2026-10-06 | Content collections live in `src/content.config.ts`, the current Astro location (`src/content/config.ts` is deprecated). Zod schemas sit in `src/lib/schemas.ts` so Vitest can test them without Astro | Astro 7 deprecates the old path |
| 2026-10-06 | Cross-collection citation rules (source exists, T1/T2 only for **every** stat, action evidence exists) run in `src/lib/citations.ts` from every page that loads content, so `astro build` fails. `pnpm test:gate` proves it against a real build in CI | One-entry Zod schemas can't see the sources collection |
| 2026-10-06 | Disclosures ("Show data table", "More detail") use native `<details>`/`<summary>` instead of a `<button aria-expanded>` | Works without JS, exposes expanded state natively. DESIGN §9 asked for buttons; this keeps content visible without JS |
| 2026-10-06 | Tooling: TypeScript pinned to `~6.0` (typescript-eslint and `@astrojs/check` don't support 7 yet); `linkedom` gives Plot a DOM at build time; fonts are Geist v1.7.2 variable WOFF2 from the vercel/geist-font release, with `OFL.txt` | Approved 2026-10-06 |
| 2026-10-06 | Climate page: headline is the latest Mauna Loa monthly CO₂ with NOAA's stated uncertainty; derived "times the 1750 level" uses IPCC AR6 WGI Ch. 2 (278.3 ± 2.9 ppm); the chart is GISTEMP annual means vs 1951–1980. No range is shown for recent temperatures because NASA's uncertainty ensemble covers 1880–2020 | Every number traces to a T1 source with an archived copy |
| 2026-10-06 | The Trend label isn't shown until Phase 3 defines the threshold. `TrendIndicator` exists but nothing passes it a value | A trend typed by hand would break the "computed from data" rule |
