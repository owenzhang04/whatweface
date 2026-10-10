import type { Problem, Source } from "./schemas";

export interface ProblemEntry {
  id: string;
  data: Problem;
}

export interface SourceEntry {
  id: string;
  data: Source;
}

export interface ContentReport {
  errors: string[];
  warnings: string[];
}

const STALE_AFTER_YEARS = 5;

/**
 * Rules that a single-entry schema can't express because they span entries or
 * collections: CONTENT_STANDARDS §1 rules 2, 3 and 5, the CLAUDE.md rule that
 * every number on the site points to a T1/T2 source, and each problem's place
 * in its scale (folder and rank).
 */
export function checkContent(
  problems: ProblemEntry[],
  sources: SourceEntry[],
  currentYear: number,
): ContentReport {
  const report: ContentReport = { errors: [], warnings: [] };
  const byId = new Map(sources.map((s) => [s.data.id, s.data]));

  for (const s of sources) {
    const fileId = s.id.split("/").pop();
    if (fileId !== s.data.id) {
      report.errors.push(`source file "${s.id}" declares id "${s.data.id}"; they must match`);
    }
  }
  for (const problem of problems) checkProblemCitations(problem, byId, currentYear, report);
  checkPlacement(problems, report);
  return report;
}

function checkProblemCitations(
  { id, data }: ProblemEntry,
  byId: ReadonlyMap<string, Source>,
  currentYear: number,
  report: ContentReport,
): void {
  for (const stat of data.stats) {
    const where = `${id}: stat "${stat.id}"`;
    const source = byId.get(stat.source);
    if (!source) {
      report.errors.push(`${where} cites unknown source "${stat.source}"`);
      continue;
    }
    if (source.tier === 3) {
      const role = stat.id === data.headline ? "headline stat" : "stat";
      report.errors.push(`${where} is a ${role} from T3 source "${source.id}"; numbers need T1/T2`);
    }
    const stale = stat.as_of !== undefined && currentYear - stat.as_of > STALE_AFTER_YEARS;
    if (stale && !stat.historical) {
      report.warnings.push(
        `${where} is from ${stat.as_of}, more than ${STALE_AFTER_YEARS} years old`,
      );
    }
  }
  for (const cite of data.cites) {
    if (!byId.has(cite)) report.errors.push(`${id}: prose cites unknown source "${cite}"`);
  }
  for (const action of data.actions) {
    if (action.evidence !== null && !byId.has(action.evidence)) {
      report.errors.push(
        `${id}: action "${action.title}" cites unknown source "${action.evidence}"`,
      );
    }
  }
}

/** A problem lives at problems/<scale>/<slug>.mdx, and no two in a scale share a rank. */
function checkPlacement(problems: ProblemEntry[], report: ContentReport): void {
  const ranked = new Map<string, string>();
  for (const { id, data } of problems) {
    const [folder, slug, ...rest] = id.split("/");
    if (folder !== data.scale || !slug || rest.length > 0) {
      report.errors.push(
        `problem "${id}" must live in src/content/problems/${data.scale}/<slug>.mdx`,
      );
    }
    if (data.rank === undefined) continue;
    const key = `${data.scale} #${data.rank}`;
    const holder = ranked.get(key);
    if (holder) report.errors.push(`problems "${holder}" and "${id}" both claim rank ${key}`);
    else ranked.set(key, id);
  }
}

export function assertContent(report: ContentReport): void {
  for (const w of report.warnings) console.warn(`[content] ${w}`);
  if (report.errors.length > 0) {
    throw new Error(
      `Content check failed:\n${report.errors.map((e) => `  - ${e}`).join("\n")}\n` +
        "Fix the content (see docs/CONTENT_STANDARDS.md).",
    );
  }
}
