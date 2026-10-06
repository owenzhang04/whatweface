# What We Face

A website about the biggest problems we have faced, are facing, and will face, at three scales:

- **Individual**: a person's life and health
- **Humanity**: people and societies
- **Earth**: the planet's systems

Each problem gets a short, plain-language page: how big it is (every number cited), where it's heading, what works, and what you can do about it.

**Status:** planning complete, nothing built yet. See [docs/PLAN.md](docs/PLAN.md).

## Principles

- **Every number is cited.** Primary or reputable-aggregator sources only, archived, with the exact table or page. Unsourced numbers fail the build.
- **Judgment is labeled.** Anything editorial carries an *Editorial* badge.
- **Weight, then agency.** Each page shows the scale of the problem, then what is being done and what the reader can do.
- **Accessible.** WCAG 2.2 AA, light and dark themes, reduced-motion support, and a data table behind every chart.

## Docs

| Doc | What's in it |
|---|---|
| [PLAN.md](docs/PLAN.md) | Stack, repo layout, phases, exit criteria |
| [DESIGN.md](docs/DESIGN.md) | Visual direction, color tokens (with measured contrast), type, motion, page template, accessibility |
| [CONTENT_STANDARDS.md](docs/CONTENT_STANDARDS.md) | Source tiers, citation format, editorial policy, writing style, review checklist |
| [DATA.md](docs/DATA.md) | Data refresh pipeline and verified endpoints |
| [PROBLEMS.md](docs/PROBLEMS.md) | v1 candidate problems and ranking metrics per scale |
| [DECISIONS.md](docs/DECISIONS.md) | Decision log |
| [KICKOFF_PROMPT.md](docs/KICKOFF_PROMPT.md) | Prompt to start Phase 1 with Claude Code |
| [research/](docs/research/) | Market research |

## Stack

Astro + TypeScript + MDX, plain CSS, Observable Plot (build-time SVG), Pagefind, Cloudflare Pages.

## License

- Code: [MIT](LICENSE)
- Written content (`src/content/`, `docs/`): [CC BY 4.0](LICENSE-CONTENT)
- Third-party data in `data/` keeps its original license; see [DATA.md](docs/DATA.md#licensing).

## Corrections

Found a wrong or outdated number? Open an issue with the page, the claim, and a better source.
