import type { Problem, Source } from "./schemas";

export interface ProblemEntry {
  id: string;
  data: Problem;
}

export interface SourceEntry {
  id: string;
  data: Source;
}

export interface CitationReport {
  errors: string[];
  warnings: string[];
}

const STALE_AFTER_YEARS = 5;

/**
 * Cross-collection citation rules that a single-entry schema can't express
 * (CONTENT_STANDARDS §1 rules 2, 3 and 5, plus the CLAUDE.md rule that every
 * number on the site points to a T1/T2 source).
 */
export function checkCitations(
  problems: ProblemEntry[],
  sources: SourceEntry[],
  currentYear: number,
): CitationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = new Map(sources.map((s) => [s.data.id, s.data]));

  for (const s of sources) {
    const fileId = s.id.split("/").pop();
    if (fileId !== s.data.id) {
      errors.push(`source file "${s.id}" declares id "${s.data.id}"; they must match`);
    }
  }

  for (const { id, data } of problems) {
    for (const stat of data.stats) {
      const where = `${id}: stat "${stat.id}"`;
      const source = byId.get(stat.source);
      if (!source) {
        errors.push(`${where} cites unknown source "${stat.source}"`);
        continue;
      }
      if (source.tier === 3) {
        const role = stat.id === data.headline ? "headline stat" : "stat";
        errors.push(`${where} is a ${role} from T3 source "${source.id}"; numbers need T1/T2`);
      }
      if (stat.as_of !== undefined && currentYear - stat.as_of > STALE_AFTER_YEARS) {
        warnings.push(`${where} is from ${stat.as_of}, more than ${STALE_AFTER_YEARS} years old`);
      }
    }
    for (const action of data.actions) {
      if (action.evidence !== null && !byId.has(action.evidence)) {
        errors.push(`${id}: action "${action.title}" cites unknown source "${action.evidence}"`);
      }
    }
  }

  return { errors, warnings };
}

export function assertCitations(report: CitationReport): void {
  for (const w of report.warnings) console.warn(`[citations] ${w}`);
  if (report.errors.length > 0) {
    throw new Error(
      `Citation check failed:\n${report.errors.map((e) => `  - ${e}`).join("\n")}\n` +
        "Fix the source references (see docs/CONTENT_STANDARDS.md).",
    );
  }
}
