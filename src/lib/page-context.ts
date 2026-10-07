import type { Action, Scale, Source } from "./schemas";
import type { ResolvedProblem } from "./stats";

export interface ProblemContext extends ResolvedProblem {
  scale: Scale;
  sources: Map<string, Source>;
  actions: Action[];
}

/**
 * MDX components (<Stat>, <Cite>, <ActionList>) read the current problem from
 * Astro.locals, which the problem page sets before rendering its content.
 */
export function problemContext(locals: App.Locals): ProblemContext {
  if (!locals.problem) {
    throw new Error("Problem components can only be used inside a problem page");
  }
  return locals.problem;
}

export function citationNumber(ctx: ProblemContext, sourceId: string): number {
  const n = ctx.citations.get(sourceId);
  if (n === undefined) {
    throw new Error(
      `Source "${sourceId}" is cited in the page but not listed in the problem's stats, ` +
        "`cites` or action evidence",
    );
  }
  return n;
}
