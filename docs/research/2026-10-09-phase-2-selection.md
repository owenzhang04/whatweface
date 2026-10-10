---
tags: [phase-2, selection, ranking, gbd, planetary-boundaries]
date: 2026-10-09
sources_used:
  - https://doi.org/10.1016/S0140-6736(25)01637-X
  - https://eprints.soton.ac.uk/507323/1/1-s2.0-S014067362501637X-main.pdf
  - https://publications.pik-potsdam.de/rest/items/item_32589_5/component/file_33151/content
  - https://www.planetaryhealthcheck.org/
  - https://api.worldbank.org/pip/v1/pip-grp?country=WLD&year=all&povline=3&group_by=wb&format=json
  - https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json
  - https://www.vaticannews.va/en/world/news/2026-07/fao-report-645-million-people-faced-hunger-in-2025.html
  - https://sdg.iisd.org/news/hunger-food-insecurity-down-but-regional-progress-uneven-sofi-2026/
  - https://www.unhcr.org/sites/default/files/2026-06/global-trends-report-2025.pdf
  - https://africanews.com/2026/06/12/unhcr-number-of-displaced-people-worldwide-falls-for-first-time-in-a-decade
  - https://washdata.org/report/jmp-2025-annual-report
  - https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2025
confidence: high for Individual and Earth (read from the primary reports); medium for Humanity (order is robust, figures are from summaries)
---

# Phase 2: picking the final 5 per scale

These figures exist to **rank** candidates. They are not cleared for the site. Each page re-verifies its numbers against the primary source, with locator and archive, before it ships (CONTENT_STANDARDS §9).

## Answer

| Scale | Final 5, in metric order | Left out (next in line) |
|---|---|---|
| Individual | High blood pressure; Air pollution; Smoking; High blood sugar; Low birthweight and short gestation | High BMI (#6), alcohol (#11), drug use (#21), physical inactivity (not in top 25), poor diet (split across level 3 risks), depression and anxiety (a cause, not a risk) |
| Humanity | Unsafe water and sanitation; Extreme poverty; Hunger; Infectious disease (malaria, TB, HIV); War and forced displacement | Antimicrobial resistance (no comparable "people affected" count) |
| Earth | Climate change (done); Biodiversity loss; Nitrogen and phosphorus pollution; Plastics and chemical pollution; Deforestation and land use | Freshwater disruption, ocean acidification |

Emerging (own list, not ranked by today's harm, not full pages in v1): catastrophic pandemics, advanced AI risk, nuclear war.

## Individual: GBD 2023 risk-attributable DALYs

Source: GBD 2023 Disease and Injury and Risk Factor Collaborators, *Lancet* 2025; 406: 1873–922, published 12 Oct 2025. Figure 7, "Leading 25 GBD level 3 risk factors by attributable DALYs as a percentage of total DALY counts". Read from the open-access PDF (Southampton eprints, 50 pages). Total DALYs in 2023 were 2.80 billion (2.57–3.08).

| Rank (95% UI of rank) | Level 3 risk | Share of total DALYs, 2023 |
|---|---|---|
| 1 (1–2) | High systolic blood pressure | 8.4% (6.9–10.0) |
| 2 (1–2) | Particulate matter pollution (ambient + household) | 8.2% (6.7–9.7) |
| 3 (3–6) | Smoking | 5.8% (4.8–7.1) |
| 4 (3–5) | High fasting plasma glucose | 5.8% (5.2–6.5) |
| 5 (3–6) | Low birthweight and short gestation | 5.2% (4.7–5.7) |
| 6 (3–10) | High BMI | 4.9% (2.5–7.0) |
| 11 (10–15) | High alcohol use | 2.0% (1.7–2.5) |
| 21 (17–26) | Drug use | 1.1% (0.9–1.2) |

- **Rank uncertainty overlaps.** Ranks 3–6 overlap (UI 3–6, 3–5, 3–6, 3–10), so #5 vs #6 is not statistically clean. The `/method` page should say so.
- **Level consistency.** Ranking uses GBD level 3 risks only, as in the paper's own figure. "Poor diet" is a level 2 group split across many level 3 risks (fruits 1.7%, sodium 1.4%, wholegrains 1.1%, …); its combined DALY share isn't in the main paper (Table 3 there is SEV, not DALYs). It would need the appendix or the Results tool to rank as a group.
- **Depression and anxiety** are GBD *causes*: 56.0M and 55.4M YLDs in 2023 (Table 2). Not ranked against risks, because risks and causes overlap.
- **Low birthweight and short gestation** wasn't on the shortlist. Decision 2026-10-09: follow the metric and include it.

**Data access:** OWID's `disease-burden-by-risk-factor` chart (IHME GBD 2025 release, 1990–2023) exists, but its CSV returns `403 "non-redistributable data"`. Metadata is still readable. So Individual pages cite the Lancet paper (T1), or a GBD Results tool export stored by hand. No automated fetch.

## Earth: Planetary Health Check 2025

Source: Sakschewski, Caesar et al., *Planetary Health Check 2025*, PIK / PBScience, Sept 2025 (CC BY 4.0). Table 3, printed pp. 130–131 (text extracted with `pdftotext -layout`; recheck against the rendered page before citing any value).

Zones: safe (below PB) → zone of increasing risk (PB to high-risk line) → high-risk zone.

| Boundary | Control variable | Current (PHC 2025) | PB | High-risk | Zone |
|---|---|---|---|---|---|
| Climate change | Radiative forcing | +2.97 W/m² | +1 | +1.5 | High risk |
| | CO₂ | 423 ppm | 350 | 450 | Increasing |
| Biosphere integrity | Extinctions (E/MSY) | >100 | <10 | 100 | High risk |
| | HANPP | 30% | <10% | 20% | High risk |
| Biogeochemical flows | N fixation | 165 Tg/yr | 62 | 82 | High risk |
| | P, regional (fertiliser to erodible soils) | 18.2 Tg/yr | 6.2 | 11.2 | High risk |
| Novel entities | Synthetic chemicals released without safety testing | >0% | 0% | not defined | High risk (report places it there: PDF p. 28, "existing knowledge is sufficient to place…") |
| Land-system change | Forest cover, % of original | 59% | 75% | 54% | Increasing |
| Freshwater change | Blue / green water disturbance, % land | 22.6% / 22.0% | 12.9% / 12.4% | 50% | Increasing |
| Ocean acidification | Aragonite saturation Ω | 2.84 | 2.86 | 2.50 | Increasing (newly crossed) |
| Aerosol loading | Interhemispheric AOD difference | 0.063 | 0.1 | 0.25 | Safe |
| Ozone | Stratospheric O₃ | 285.7 DU | 277 | 263 | Safe |

Four boundaries are in the high-risk zone and map to four candidates: climate, biodiversity, N/P, plastics and chemicals. The fifth slot goes to the boundary furthest into the zone of increasing risk, measured as (current − PB) / (high-risk − PB):

| Boundary | Position in increasing-risk zone |
|---|---|
| Land-system change | (75 − 59) / (75 − 54) = 0.76 |
| Freshwater (blue) | (22.6 − 12.9) / (50 − 12.9) = 0.26 |
| Ocean acidification | (2.86 − 2.84) / (2.86 − 2.50) = 0.06 |

So Deforestation and land use is #5. Within the high-risk zone, order is not fully computable: novel entities has no high-risk value and extinctions is only ">100". Proposed display order: by zone, then by this ratio where it exists, with unquantified boundaries listed last in the zone and labelled as such. (Ratios above 1 in the high-risk zone: N 5.2, climate forcing 3.9, P regional 2.4, HANPP 2.0.)

## Humanity: people directly affected

Order matters more than exact values here. The gap between the 5th pick and the next candidate is large.

| Candidate | Definition | Figure | Year | Source | Verified |
|---|---|---|---|---|---|
| Unsafe water and sanitation | Without safely managed drinking water / sanitation | 2.1 bn / 3.4 bn | 2024 | WHO/UNICEF JMP 2025 update | Summaries only |
| Extreme poverty | Below $3.00/day (2021 PPP) | 824,298,368 (10.12%) | 2024 | World Bank PIP API | **API called 2026-10-09** |
| Hunger | Prevalence of undernourishment | 645 M (7.8%) | 2025 | FAO SOFI 2026 (July 2026) | Summaries only |
| Infectious disease | Malaria cases (TB, HIV add more) | 282 M cases | 2024 | WHO World Malaria Report 2025 | Summaries only |
| War and forced displacement | Forcibly displaced (UNHCR mandate) | 117.8 M | end 2025 | UNHCR Global Trends 2025 (June 2026) | Summaries only |
| Antimicrobial resistance | — | No "people affected" count; GRAM reports deaths | 2021 | GRAM, *Lancet* 2024 | Not checked |

- **Definition sensitivity.** "Safely managed" is a high bar. Using "basic" access instead would shrink the water figure a lot, which could change the order within the top 5. Each page must state its definition in the stat label.
- **Infectious disease** combines three diseases with different measures: malaria incidence (cases/year), HIV prevalence (people living with), TB incidence. The page needs one headline definition. Malaria cases alone already exceed displacement.
- **Poverty revision.** WDI `SI.POV.DDAY` for 2024 now reads 10.1% (`lastupdated` 2026-10-08). DATA.md recorded 10.4% on 2026-10-06. PIP gives 10.12%. Use PIP for the headcount.
- PIP also returns 2025 and 2026 rows. These are nowcasts. Cite only years with `estimate_type: actual`.
