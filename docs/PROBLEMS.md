# Problems: v1 candidates

**Status: draft for sign-off.** v1 ships **5 problems per scale (15 total)**. Each scale has a shortlist of 7–8; the final 5 are chosen by that scale's ranking metric once the data is sourced in Phase 2.

No figures appear here on purpose: every number gets sourced to the standard in `CONTENT_STANDARDS.md` before it's written down.

## Ranking

Decision (2026-10-06): **rank within each scale by that scale's own stated metric.** Scales are never ranked against each other, because deaths, people affected and planetary boundaries are not comparable.

Within a scale:
- **Active** problems are ranked by the metric.
- **Emerging** problems can't be ranked by today's harm (that's what makes them emerging). They're listed after the ranked ones, ordered by expert risk estimates where these exist, and labeled as estimates (Editorial).
- **Overcome** problems are not ranked. They appear in a separate "Solved before" strip (see open questions).

The `/method` page explains all of this in plain language.

## Individual: a person's life and health

**Metric:** disability-adjusted life years (DALYs) lost per year, globally, as attributed by IHME Global Burden of Disease. DALYs count both early death and years lived in poor health, so mental health shows up properly.

Caveat to explain on the page: GBD *risk factors* (blood pressure, tobacco) and *causes* (depressive disorders) are separate lists that overlap. The page states which list each number comes from.

| Candidate | GBD list | Status | Why it's on the shortlist |
|---|---|---|---|
| High blood pressure | Risk factor | Active | Leading attributable risk factor for death in recent GBD rounds; mostly symptomless; cheap to detect |
| Tobacco use | Risk factor | Active | Very large attributable burden; clear individual and policy actions |
| Poor diet | Risk factor | Active | Large attributable burden; everyday choices |
| High blood sugar / diabetes | Risk factor | Active | Rising burden |
| Depression and anxiety | Cause | Active | Leading causes of years lived with disability |
| Alcohol use | Risk factor | Active | Large burden in young adults |
| Physical inactivity | Risk factor | Active | Common, cheap individual action |
| Drug use / overdose | Risk factor + cause | Active | Severe in some regions; sensitive-topic rules apply |

## Humanity: people and societies

**Metric:** number of people directly affected right now (e.g. living in extreme poverty, forcibly displaced, undernourished). Each page states exactly how "affected" is defined for its number.

| Candidate | Status | Source to use | Why |
|---|---|---|---|
| Extreme poverty | Active | World Bank PIP ($3.00/day, 2021 PPP) | Defines access to everything else; long falling trend that has slowed |
| Hunger and food insecurity | Active | FAO *State of Food Security and Nutrition* (SOFI) | Large and measurable |
| War and forced displacement | Active | UNHCR Global Trends; UCDP for conflict deaths | Rising in recent years |
| Unsafe water and sanitation | Active | WHO/UNICEF Joint Monitoring Programme | Large, solvable |
| Infectious disease (malaria, TB, HIV) | Active | WHO World Malaria / Global TB reports; UNAIDS | Big killers with proven, fundable fixes |
| Antimicrobial resistance | Active / emerging | GRAM study (*The Lancet*) | Growing; most people haven't heard of it |
| Catastrophic pandemics | Emerging | Expert estimates; Covid-19 as reference | Low-probability, very-high-impact |
| Advanced AI risk | Emerging | Expert surveys (label as estimates) | High uncertainty, high stakes; handle carefully |
| Nuclear war | Emerging | Stockpile data (FAS, SIPRI); nuclear winter studies | Low-probability, civilization-scale |

## Earth: the planet's systems

**Metric:** how far the Earth system has moved past its safe limit, using the **planetary boundaries** framework (Rockström et al. 2009; Richardson et al. 2023, *Science Advances*; Potsdam Institute Planetary Health Check updates). One framework for the whole scale, so the ranking is consistent.

| Candidate | Boundary | Status | Why |
|---|---|---|---|
| Climate change | Climate change | Active | The best-measured; fed by NOAA CO₂ and NASA temperature series |
| Biodiversity loss | Biosphere integrity | Active | Among the furthest past their boundary |
| Deforestation and land use | Land-system change | Active | Directly linked to the two above |
| Nitrogen and phosphorus pollution | Biogeochemical flows | Active | Far past its boundary, almost invisible to the public |
| Plastics and chemical pollution | Novel entities | Active | Ubiquitous; hard to quantify, so be honest about uncertainty |
| Freshwater disruption | Freshwater change | Active | Groundwater and drought |
| Ocean acidification | Ocean acidification | Active | Recently assessed as crossed (verify in Phase 2) |
| Ozone depletion | Stratospheric ozone | **Overcome** (recovering) | The Montreal Protocol success story; candidate for "Solved before" |

## Overcome: "solved before" candidates

Examples showing that problems this size have been solved:
- Smallpox (eradicated, declared 1980)
- Ozone depletion (Montreal Protocol, recovering)
- Lead in gasoline (phased out worldwide)
- Child mortality (not solved, but massively reduced. That's an Active/Improving case, not Overcome)

## Open questions

1. **"Solved before" in v1?** Recommended: ship v1 with 15 ranked problems, then add the strip in v1.1. It doesn't count toward the 5 per scale.
2. **Air pollution:** it fits Individual (personal exposure, a top GBD risk factor), Humanity and Earth (aerosol loading). Pick one home and cross-link it.
3. **Emerging problems in the 5:** can an emerging problem take one of the 5 slots per scale, or should emerging problems sit in their own list? Recommended: own list, so the ranked 5 stay purely data-driven.
