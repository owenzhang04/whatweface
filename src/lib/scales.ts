import type { Scale } from "./schemas";

export interface ScaleInfo {
  slug: Scale;
  number: string;
  name: string;
  summary: string;
  metric: string;
}

// Ranking metrics are the decisions recorded in docs/PROBLEMS.md and docs/DECISIONS.md.
export const SCALE_INFO: Record<Scale, ScaleInfo> = {
  individual: {
    slug: "individual",
    number: "01",
    name: "Individual",
    summary: "A person's life and health.",
    metric:
      "Ranked by disability-adjusted life years (DALYs) lost per year worldwide, from the " +
      "Institute for Health Metrics and Evaluation's Global Burden of Disease study. DALYs count " +
      "both early death and years lived in poor health.",
  },
  humanity: {
    slug: "humanity",
    number: "02",
    name: "Humanity",
    summary: "People and societies.",
    metric:
      "Ranked by the number of people directly affected right now. Each page states exactly how " +
      "“affected” is defined for its number.",
  },
  earth: {
    slug: "earth",
    number: "03",
    name: "Earth",
    summary: "The planet's systems.",
    metric:
      "Ranked by how far the Earth system has moved past its safe limit, using the planetary " +
      "boundaries framework.",
  },
};

export const SCALE_LIST = Object.values(SCALE_INFO);
