# Design

Direction: **"Observatory at night."** The site reads like the output of an instrument measuring something too large to look at directly. Weight comes from restraint, not shock: big plain numbers, a lot of empty space, quiet type, slow motion.

Approved 2026-10-06.

## 1. Principles

1. **The number is the image.** No stock photography, no disaster imagery. Each problem's headline stat, set huge, is the visual.
2. **One accent.** Ember is used only for the key number and calls to action. If everything is highlighted, nothing is.
3. **Instrument, not ornament.** Thin grid lines and monospace metadata read as futuristic. No glows, neon, gradients or glassmorphism.
4. **Weight, then agency.** Every page moves from "this is how big it is" to "this is what is being done, and what you can do".
5. **Accessible by construction.** Color never carries meaning alone, and every chart has a table.

## 2. Color tokens

Dark is the default. Light is a full theme, not an afterthought: long-form light-on-dark text is harder for some readers, e.g. people with astigmatism. Default follows `prefers-color-scheme`; a toggle overrides it and is remembered (localStorage, wrapped in try/catch).

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0B0C0E` | `#F4F2ED` | Page background (warm near-black; pure black causes halation) |
| `--surface` | `#15171B` | `#FFFFFF` | Cards, panels, expanded sections |
| `--line` | `#262A31` | `#D6D3CC` | Decorative 1px grid lines and dividers only |
| `--text` | `#E8E6E1` | `#16171A` | Body text |
| `--muted` | `#8A8F98` | `#5A5E66` | Metadata, labels, interactive borders |
| `--ember` | `#E2683C` | `#B4441A` | Headline number, CTAs, focus ring |
| `--scale-individual` | `#D9B48F` sand | `#8A5A2B` | Individual scale tint |
| `--scale-humanity` | `#A99BF0` violet | `#5B4BB0` | Humanity scale tint |
| `--scale-earth` | `#6FC2B0` teal | `#1F6E60` | Earth scale tint |

Measured contrast (WCAG 2.x), 2026-10-06:

| | text | muted | ember | sand | violet | teal |
|---|---|---|---|---|---|---|
| dark `--bg` | 15.69 | 6.02 | 5.85 | 10.13 | 8.05 | 9.34 |
| dark `--surface` | 14.39 | 5.52 | 5.37 | 9.29 | 7.38 | 8.56 |
| light `--bg` | 16.02 | 5.82 | 4.96 | 5.25 | 6.10 | 5.43 |
| light `--surface` | 17.92 | 6.51 | 5.55 | 5.87 | 6.82 | 6.07 |

All text pairs pass AA (4.5:1); body text passes AAA (7:1). `--line` is ~1.3:1, so it is decorative only. Input and button borders use `--muted` (≥5.5:1, above the 3:1 non-text minimum).

Scale tints appear only in each scale's section header, its small icon, and its chart strokes. They never fill large areas.

## 3. Typography

| Role | Font | Size (desktop / mobile) | Notes |
|---|---|---|---|
| Body | Geist Sans | 19px / 18px, line-height 1.6 | Max ~68ch line length |
| Headline stat | Geist Sans, weight 300 | `clamp(4rem, 12vw, 10rem)` | Tabular numerals |
| H1 | Geist Sans, weight 500 | `clamp(2.25rem, 5vw, 3.5rem)` | |
| H2 | Geist Sans, weight 500 | 1.75rem | |
| Metadata, labels, data | Geist Mono | 0.8125rem, letter-spacing 0.04em, uppercase | The "instrument readout" voice |

- Geist is SIL Open Font License. Self-host the variable WOFF2 files: no third-party font requests, `font-display: swap`.
- Use `font-variant-numeric: tabular-nums` for all data.
- Sizes are in `rem` so browser font settings work.

## 4. Layout

- 12-column grid, max width 1200px, 16px side gutter on mobile, 32px on desktop.
- A faint background grid (`--line`, every 8rem) sits behind content on the home and scale pages, not on problem pages, where reading comes first.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
- No horizontal scroll at 320px width or at 400% zoom (WCAG reflow).

## 5. Motion

- Only fades and short upward translates (≤12px), 400–600ms, ease-out, triggered once on scroll.
- The headline number may count up once on first view (≤1.2s).
- `prefers-reduced-motion: reduce` disables all of it, including the counter. Content is never hidden behind animation: it renders visible, and JS adds the animation.
- No parallax, no autoplay video, nothing that flashes.

## 6. Site map

```
/                        Home: one-sentence premise, three scales, a few headline numbers
/individual              Scale page: ranked list of 5 problems + the ranking metric explained
/humanity
/earth
/<scale>/<problem>       Problem page
/method                  How we choose, rank, cite. Source tiers, editorial policy
/sources                 Every source, searchable
/about                   Who made it, why, contact, corrections policy
/accessibility           Accessibility statement and how to report issues
```

## 7. Problem page template

```
┌──────────────────────────────────────────────────────────────┐
│ SCALE 02 / HUMANITY · ACTIVE · IMPROVING · REVIEWED 2026-10  │  ← mono metadata strip
│                                                              │
│ Extreme poverty                                              │  ← H1
│ [content note, if any]                                       │
│                                                              │
│ XXX,XXX,XXX                                                  │  ← headline stat, ember
│ people live on less than $3.00 a day.  [source ↗]            │
│ That is one in N people alive.          DERIVED              │  ← derived stat
│                                                              │
│ What it is          (≈150 words, plain language)             │
│ How big it is       chart + "Show data table" + caption      │
│ Where it's heading  trend, computed from the series          │
│ What works          what has been tried, with evidence       │
│ What you can do     Do · Give · Advocate · Learn · Share     │
│ ▸ More detail       expandable depth                         │
│ Sources             numbered, tier-labeled, archived links   │
└──────────────────────────────────────────────────────────────┘
```

The numbers in the mockup are placeholders, not sourced figures.

Components: `MetaStrip`, `HeadlineStat`, `DerivedStat`, `EditorialBadge`, `ContentNote`, `Chart` (+ `DataTable`), `TrendIndicator`, `ActionList`, `SourceList`, `ScaleNav`, `ThemeToggle`, `ShareCard`.

## 8. Charts

- Observable Plot, rendered to SVG **at build time**. No chart JS shipped to the browser.
- Each chart has a `<title>`/`<desc>`, a one-sentence text summary of what it shows, and a "Show data table" disclosure with the same data.
- Lines are distinguished by direct labels and dash patterns, not color alone.
- Axes start at zero unless there is a stated reason, given in the caption.
- The caption names the source, `as_of`, and license.

## 9. Accessibility

Target: **WCAG 2.2 AA**, with AAA contrast for body text.

- Semantic HTML landmarks; one H1 per page; logical heading order.
- Skip link to main content; visible focus ring (2px `--ember`, 2px offset) on everything focusable.
- All interactions work by keyboard; nothing depends on hover.
- Theme toggle and disclosures are real `<button>`s with `aria-expanded` / `aria-pressed`.
- Text alternatives: charts (see §8), icons labeled or `aria-hidden`.
- Counters use `aria-live="off"`, so screen readers aren't spammed. The static number is what gets announced.
- Readable at 200% zoom with no loss; reflows at 320px.
- `lang="en"` and abbreviations expanded on first use.
- CI runs axe-core on every page (Playwright) and Lighthouse (accessibility score must be 100, performance ≥ 95).
- Manual check before launch: VoiceOver (macOS + iOS), keyboard-only pass, 200% zoom pass.

## 10. Share cards

One Open Graph image per problem, generated at build time: dark background, scale tint line, headline number, problem name, `whatweface.org`. Same restraint as the site.
