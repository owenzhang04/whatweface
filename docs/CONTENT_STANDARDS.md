# Content standards

Every number on the site is data, not prose. If a number cannot be traced to a source, it does not ship.

## 1. Rules

| # | Rule | Enforced by |
|---|---|---|
| 1 | Every quantitative claim lives in a structured `stats` entry (value, unit, year, source). No numbers typed loose in body text. | Schema + lint (`scripts/lint-content.ts` flags digits in prose that aren't stat references) |
| 2 | Every stat references a source in the registry. | Schema: build fails |
| 3 | Headline numbers must come from Tier 1 or Tier 2 sources. | Schema: build fails |
| 4 | If the source gives a range or confidence interval, show the range. | Review checklist |
| 5 | Every stat has an `as_of` year. Stats older than 5 years warn at build time. | Build warning |
| 6 | Every source has an archived copy (Wayback Machine). | Schema: build fails |
| 7 | Anything that is judgment, not data, is marked **Editorial** on the page. | Schema field `editorial: true` → visible badge |
| 8 | Contested claims state the consensus and the main disagreement, citing both. | Review checklist |
| 9 | Citation URLs are checked weekly. Broken links open a GitHub issue. | CI (lychee) |
| 10 | Each problem page shows `last_reviewed`. Pages not reviewed in 12 months show a notice. | Build + template |

## 2. Source tiers

| Tier | What counts | Allowed for |
|---|---|---|
| **T1: primary** | Peer-reviewed papers; official statistics and UN agencies (WHO, UN DESA, UNHCR, FAO, UNICEF, World Bank); IPCC; IHME Global Burden of Disease; NOAA, NASA, Copernicus; national statistics offices | Everything, including headline numbers |
| **T2: reputable aggregator** | Our World in Data; Gapminder; Planetary Health Check. Cite the aggregator **and** the primary source it lists (OWID's `.metadata.json` includes the primary citation) | Everything, including headline numbers |
| **T3: context** | Quality journalism (Reuters, AP, FT, BBC, The Economist); established NGO reports (Amnesty, MSF, WWF) | Context, examples, quotes. **Never** headline numbers |
| **Banned** | Wikipedia, blogs, Medium/Substack without credentials, content farms, AI-generated text, press releases without underlying data | Nothing. Follow the link to the real source instead |

## 3. Source record

Every source in `src/content/sources/*.yaml`:

```yaml
id: worldbank-pip-2026            # kebab-case, unique
tier: 1                           # 1 | 2 | 3
publisher: World Bank
title: Poverty and Inequality Platform
year: 2026
url: https://...
archived_url: https://web.archive.org/web/...
accessed: 2026-10-06
locator: "Indicator SI.POV.DDAY, World aggregate"   # table, page, figure, or indicator id
via: owid                          # optional: aggregator it was reached through
license: CC BY 4.0                 # if known; needed for charts that redraw data
```

## 4. Stat record

Inside each problem's frontmatter:

```yaml
stats:
  - id: headcount
    label: People living on less than $3.00 a day
    value: 000000000              # placeholder; or omit and use `series` for fetched data
    range: [000000000, 000000000] # optional; required if the source gives one
    unit: people
    as_of: 2024
    source: worldbank-pip-2026
    series: worldbank/SI.POV.DDAY # optional: link to a fetched dataset (see DATA.md)
```

The value above is a placeholder showing the format, not a real figure.

### Derived stats

Human-scale conversions ("one death every 7 seconds", "your city emptied twice a year") are computed at build time from a sourced stat, never typed by hand.

```yaml
derived:
  - id: per-second
    from: deaths
    formula: per_interval          # built-in helpers: per_interval, share_of_population, multiple_of
    label: "one death every {n} seconds"
```

Derived stats always show a small "Derived" label linking to the method.

### The live counter

The optional "since you opened this page" counter is an estimate: annual rate ÷ seconds per year × seconds elapsed. It must be labeled **Estimate** and link to the method. Only use it when the underlying rate is T1/T2 and less than 3 years old.

## 5. Editorial content

These parts are judgment and are always badged **Editorial**:
- Which problems are on the site, and the wording of their framing
- The "Why it matters" narrative (beyond the cited numbers)
- Action recommendations without evidence of effectiveness

Editorial content is allowed. Editorial content dressed up as data is not.

## 6. Actions ("What you can do")

Each problem lists 3–6 actions, grouped:

| Kind | Example |
|---|---|
| **Do** | Personal behavior: get blood pressure checked, register as an organ donor |
| **Give** | Donate: prefer charities with independent evaluation (GiveWell, Giving What We Can, Animal Charity Evaluators) |
| **Advocate** | Contact a representative, support a specific policy (name it, cite why) |
| **Learn** | One great primary resource, not a link dump |
| **Share** | The page's share card |

Each action has an `evidence` field: a source id showing it works, or `null`. `null` shows the **Editorial** badge. Never link to a petition or charity without checking it is legitimate and active.

## 7. Writing style

- General public, around a grade 9 reading level. Check with a readability tool (Flesch–Kincaid) during review.
- Plain words. Short sentences. Define every acronym on first use.
- Lead each page with the one fact that matters most.
- No hype, no despair porn, no "we're all doomed". The goal is weight, not hopelessness: every page ends with what is being done and what the reader can do.
- Name trade-offs and uncertainty honestly.
- Depth goes in expandable "More detail" sections so the main page stays short.

## 8. Sensitive topics

Pages on suicide, self-harm, addiction, abuse or eating disorders:
- Show a content note at the top (`content_note` field).
- Show helpline links (findahelpline.com plus region-specific lines) above the fold.
- Follow WHO/safe-messaging guidelines for suicide reporting: no method details, and include hope and help-seeking.

## 9. Review checklist (per problem, before merge)

- [ ] Every number traces to a source with `locator` filled in
- [ ] Headline stat is T1/T2, has range if available, `as_of` within 5 years
- [ ] All sources archived
- [ ] Editorial parts badged
- [ ] Actions checked live, evidence attached or badged
- [ ] Reading level ≈ grade 9 for the main body
- [ ] Sensitive-topic rules applied if relevant
- [ ] `last_reviewed` set
