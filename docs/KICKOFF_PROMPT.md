# Kickoff prompt: Phase 1

Paste this into a new Claude Code session started in this repo (`cd ~/Projects/whatweface && claude`).

---

```
We're starting Phase 1 of What We Face. Read CLAUDE.md, then docs/PLAN.md, docs/DESIGN.md,
docs/CONTENT_STANDARDS.md, docs/DATA.md and docs/DECISIONS.md in full before doing anything.
Decisions in DECISIONS.md are settled. Don't re-ask them.

Goal: Phase 1 from PLAN.md. The full pipeline, end to end, with ONE real problem page:
Climate change (Earth scale).

Work on a branch `phase-1-skeleton`. Commit after each step below once it works.

1. Scaffold Astro (latest stable) + TypeScript strict + MDX with pnpm. Add ESLint, Prettier,
   Vitest, Playwright, @axe-core/playwright. Add a `pnpm check` script (typecheck + lint + test).
2. Content collections with Zod schemas for `problems` and `sources`, implementing every
   "Schema: build fails" rule in CONTENT_STANDARDS.md §1. Write tests proving that a stat with
   no source, a headline stat from a T3 source, and a source with no archived_url each fail.
3. Design tokens (both themes, exact hex values from DESIGN.md §2), theme toggle that follows
   prefers-color-scheme and remembers an override (localStorage in try/catch), self-hosted
   Geist Sans + Mono (check the license file ships with the fonts).
4. Base layout and all routes from DESIGN.md §6. Pages other than the climate page are honest
   stubs ("Coming soon"), not lorem ipsum. Skip link, focus ring, landmarks.
5. Problem page template with the components in DESIGN.md §7, and derived-stat helpers in
   src/lib with unit tests.
6. Climate change page with real data: fetch NOAA Mauna Loa monthly CO2 and NASA GISTEMP
   using the verified endpoints in DATA.md (re-verify them first). Store as CSV in data/series/.
   One build-time Observable Plot chart with a data table. Every number cited per
   CONTENT_STANDARDS. Create the Wayback archive links for each source. If you can't verify
   a number from a primary source, leave it out and tell me.
7. GitHub Actions CI: pnpm check, build, Playwright + axe on every route in both themes,
   Lighthouse CI (a11y = 100, perf >= 95).
8. Tell me what I need to do to connect Cloudflare Pages (I'll do the dashboard steps), then
   confirm the preview deploy works.

Stop and ask me before: adding dependencies not named in PLAN.md, changing any design token,
or anything in "Out of scope". When Phase 1's exit criteria in PLAN.md are met, show me the
evidence (CI run, preview URL, the failing-build test), open a PR, and update PLAN.md
and DECISIONS.md.
```
