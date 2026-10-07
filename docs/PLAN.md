# Plan

Goal for v1: **15 fully cited problem pages (5 per scale), live at whatweface.org, passing the accessibility and citation gates.**

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro (latest stable) + TypeScript (strict) | Content-first, no JS by default, content collections validate frontmatter with Zod, so citation rules fail the build |
| Content | MDX in `src/content/problems/`, YAML in `src/content/sources/` | Pull-request reviewable |
| Styling | Plain CSS, custom properties (tokens in `src/styles/tokens.css`) | Small, strict palette; no framework needed |
| Charts | Observable Plot, rendered to SVG at build time | Accessible, no client JS |
| Search | Pagefind | Static search, no server |
| Tests | Vitest (schema, derived-stat math, fetch parsers), Playwright + @axe-core/playwright, Lighthouse CI | Accessibility and correctness are gated in CI |
| Link checks | lychee (weekly GitHub Action) | Dead citations open an issue |
| Hosting | Cloudflare Pages (`*.pages.dev` until launch) | Free, unlimited static bandwidth, global CDN |
| Domain | `whatweface.org` via Cloudflare Registrar, bought at Phase 4 | ~$8.50 first year, $11.20 renewal (verify at purchase) |
| Analytics | Cloudflare Web Analytics | Free, cookieless, no consent banner needed |
| Package manager | pnpm | |

## Repo layout (target)

```
src/
  content.config.ts         # collections; schemas live in lib/schemas.ts (see CONTENT_STANDARDS.md)
  content/
    problems/<scale>/<slug>.mdx
    sources/<id>.yaml
  components/               # MetaStrip, HeadlineStat, Chart, ActionList, ... (DESIGN.md §7)
  layouts/
  lib/                      # derived-stat helpers, trend computation, series loader
  pages/
  styles/tokens.css
data/                       # see DATA.md
scripts/                    # fetch-data.ts, lint-content.ts, check-staleness.ts
tests/
.github/workflows/          # ci.yml, data-refresh.yml, link-check.yml
docs/
```

## Phases

### Phase 0: Planning (done 2026-10-06)
Repo, planning docs, decisions log, kickoff prompt.

### Phase 1: Skeleton with one real page (done 2026-10-06, PR #2)
Build the whole pipeline end to end with **one** fully real problem: **Climate change** (Earth). Its data sources (NOAA CO₂, NASA GISTEMP) are already verified.

- Astro + TS scaffold, pnpm, strict tsconfig, ESLint/Prettier
- Content schemas for problems and sources, with the build-failing rules from CONTENT_STANDARDS §1
- Design tokens, both themes, theme toggle, self-hosted Geist
- Layout, site map routes (stub pages for the rest), skip link, focus styles
- Problem page template with all components
- Derived-stat helpers + unit tests
- One chart (CO₂ or temperature) with data table
- CI: typecheck, Vitest, build, Playwright + axe on every route, Lighthouse CI
- Deploy to Cloudflare Pages preview

**Status 2026-10-06:** exit criteria met. CI is green, and the Cloudflare Pages preview is live at `https://phase-1-skeleton.whatweface.pages.dev`; the Playwright + axe suite also passes against it (`BASE_URL=<url> pnpm test:e2e`). Deferred from this phase, on purpose: the computed Trend label (needs the threshold, Phase 3), share cards (Phase 4), the headline count-up and scroll fades (optional per DESIGN §5), `scripts/lint-content.ts` (rule 1 is followed by hand for now: the climate prose has no digits), and Do/Give/Advocate actions for climate (need effectiveness evidence, Phase 2).

**Exit criteria:** the climate page passes CI (axe 0 violations, Lighthouse a11y 100 / perf ≥ 95), works in both themes, reflows at 320px, and every number on it traces to an archived T1/T2 source. Removing a source from a stat makes the build fail.

### Phase 2: Content (the long phase)
- Source the shortlists in PROBLEMS.md; pick the final 5 per scale by metric
- Write the remaining 14 pages to the review checklist
- `/method`, `/sources`, `/about`, `/accessibility` pages

Honest estimate: a fully cited page takes 2–4 hours to research, write and review. 14 pages ≈ 30–55 hours. That is the bulk of the project. Ship pages to the preview as each one passes review, not all at the end.

### Phase 3: Data pipeline
- `data/datasets.yaml` registry + fetchers (OWID, NOAA, NASA, World Bank) with retry and validation
- Weekly data-refresh Action that opens a PR
- Trend computation from series (Improving / Stable / Worsening, with the threshold documented on `/method`)
- Staleness warnings, weekly lychee link check
- Live counter (optional, per CONTENT_STANDARDS §4)

### Phase 4: Launch
- Buy `whatweface.org`; connect to Cloudflare Pages; HTTPS; `www` → apex redirect
- Share cards (OG images), sitemap, robots.txt, meta descriptions
- Manual accessibility pass (VoiceOver macOS + iOS, keyboard only, 200% zoom)
- Cloudflare Web Analytics
- Distribution: Show HN, r/InternetIsBeautiful, r/dataisbeautiful, a few teachers (see research note)

### After v1 (not scheduled)
"Solved before" strip, more problems, live fast-moving metrics, translations. Each needs a reason backed by usage data before it starts.

## Out of scope for v1
Accounts, comments, newsletter, CMS, donations through the site, ads, translations.
