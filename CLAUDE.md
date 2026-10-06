# What We Face

Static site about the world's biggest problems at three scales (individual, humanity, earth). Public repo `owenzhang04/whatweface`.

## Read first
- `docs/PLAN.md`: stack, phases, current phase's exit criteria
- `docs/CONTENT_STANDARDS.md`: before writing or editing any problem content
- `docs/DESIGN.md`: before touching UI
- `docs/DECISIONS.md`: what's already decided. Don't reopen these without a reason; append new decisions

## Hard rules
- No number goes on the site without a stat entry pointing to a T1/T2 source (T3 for context only). Never invent, estimate or "round from memory" a figure. If a source can't be found and verified, leave the stat out and say so.
- Verify endpoints by calling them before documenting or depending on them (record the verification date in `docs/DATA.md`).
- Editorial content must be badged. Don't present judgment as data.
- Colors only through tokens in `src/styles/tokens.css`; any new pair must meet the contrast table in DESIGN.md §2.
- Charts render at build time and always have a data table.
- Accessibility tests (axe, Lighthouse) must pass before merging. Don't disable a rule to make CI green.
- Respect `prefers-reduced-motion`; content never depends on animation or JS to be visible.
- No new dependencies, features, or pages beyond the current phase without asking.

## Workflow
- Feature branches + PRs into `main`. Commit after each working step.
- Public repo: never commit secrets, `.env`, or personal data.
- `pnpm` for everything. `pnpm check` (typecheck + lint + test) before pushing.
