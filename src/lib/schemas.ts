import { z } from "astro/zod";

const kebabId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case");
const isoDate = z.coerce.date();

export const SCALES = ["individual", "humanity", "earth"] as const;
export const STATUSES = ["Overcome", "Active", "Emerging"] as const;
export const ACTION_KINDS = ["Do", "Give", "Advocate", "Learn", "Share"] as const;
export const DERIVED_FORMULAS = ["per_interval", "share_of_population", "multiple_of"] as const;

// Rule 6: every source has an archived copy.
export const sourceSchema = z.strictObject({
  id: kebabId,
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  publisher: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int(),
  url: z.url(),
  archived_url: z
    .url()
    .refine((u) => u.startsWith("https://web.archive.org/web/"), "must be a Wayback Machine URL"),
  accessed: isoDate,
  locator: z.string().min(1),
  via: z.string().optional(),
  license: z.string().optional(),
});

// Rule 2: every stat references a source. A stat either carries a typed value
// or points at a fetched series; series stats take their year from the data.
export const statSchema = z
  .strictObject({
    id: kebabId,
    label: z.string().min(1),
    value: z.number().optional(),
    range: z.tuple([z.number(), z.number()]).optional(),
    // For sources that state "value ± uncertainty" rather than a range.
    uncertainty: z.number().positive().optional(),
    unit: z.string().min(1),
    as_of: z.number().int().optional(),
    // A fixed past reference point (e.g. a pre-industrial level), exempt from the staleness warning.
    historical: z.boolean().default(false),
    source: kebabId,
    series: z.string().optional(),
    // With `series`: compare against the point this many years before the latest.
    offset_years: z.number().int().positive().optional(),
    note: z.string().optional(),
  })
  .refine((s) => s.value !== undefined || s.series !== undefined, {
    message: "a stat needs either `value` or `series`",
  })
  .refine((s) => s.series !== undefined || s.as_of !== undefined, {
    message: "a stat with a typed value needs `as_of`",
    path: ["as_of"],
  })
  .refine((s) => s.range === undefined || s.uncertainty === undefined, {
    message: "give either `range` or `uncertainty`, not both",
  })
  .refine((s) => s.range === undefined || s.range[0] <= s.range[1], {
    message: "range must be [low, high]",
    path: ["range"],
  });

export const derivedSchema = z.strictObject({
  id: kebabId,
  from: kebabId,
  formula: z.enum(DERIVED_FORMULAS),
  // Second operand for share_of_population / multiple_of: another stat id.
  of: kebabId.optional(),
  // Time unit N is expressed in for per_interval ("one death every N seconds").
  per: z.enum(["second", "minute", "hour", "day"]).default("second"),
  label: z.string().includes("{n}", { message: "label must contain {n}" }),
});

export const actionSchema = z.strictObject({
  kind: z.enum(ACTION_KINDS),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.url().optional(),
  // Rule: a source id showing the action works, or null (shown as Editorial).
  evidence: kebabId.nullable(),
});

export const problemSchema = z
  .strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    scale: z.enum(SCALES),
    status: z.enum(STATUSES),
    rank: z.number().int().min(1).optional(),
    last_reviewed: isoDate,
    content_note: z.string().optional(),
    headline: kebabId,
    stats: z.array(statSchema).min(1),
    // Sources cited in prose with <Cite>, in addition to those behind stats.
    cites: z.array(kebabId).default([]),
    derived: z.array(derivedSchema).default([]),
    actions: z.array(actionSchema).default([]),
  })
  .superRefine((p, ctx) => {
    const statIds = new Set(p.stats.map((s) => s.id));
    if (!statIds.has(p.headline)) {
      ctx.addIssue({
        code: "custom",
        path: ["headline"],
        message: `headline "${p.headline}" is not a stat id`,
      });
    }
    p.derived.forEach((d, i) => {
      for (const ref of [d.from, d.of]) {
        if (ref !== undefined && !statIds.has(ref)) {
          ctx.addIssue({
            code: "custom",
            path: ["derived", i],
            message: `derived "${d.id}" refers to unknown stat "${ref}"`,
          });
        }
      }
    });
  });

export type Source = z.infer<typeof sourceSchema>;
export type Stat = z.infer<typeof statSchema>;
export type Derived = z.infer<typeof derivedSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Problem = z.infer<typeof problemSchema>;
export type Scale = (typeof SCALES)[number];
