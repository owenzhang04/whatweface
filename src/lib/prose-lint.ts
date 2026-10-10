/**
 * CONTENT_STANDARDS rule 1: every quantitative claim lives in a structured
 * stat, so prose never carries a typed number. This finds digits and spelled
 * scale words ("two billion", "40%") in a problem page's prose: the MDX body
 * text, visible prose attributes, and the prose fields of the frontmatter.
 *
 * Component tags are blanked before checking, so <Stat>, <Cite> and props of
 * data-bound components such as <Chart> don't count. Stat labels and notes are
 * part of the sourced stat record and aren't checked.
 */

export interface Finding {
  line: number;
  column: number;
  token: string;
  message: string;
}

// Names that contain digits but aren't quantities. Each entry must be a name
// (a pollutant, a disease, a study), never a figure.
export const ALLOWED_NAMES: RegExp[] = [/\bPM2\.5\b/g];

// Component attributes that render as visible prose.
const PROSE_ATTRIBUTES: Record<string, string[]> = {
  MoreDetail: ["title"],
};

// Frontmatter keys that hold prose. Stats use `label` and `note`, so these
// keys only occur at page level and in actions.
const PROSE_FRONTMATTER_KEYS = ["description", "title", "content_note"];

const DIGITS = /\S*\d\S*/g;
const USE_A_STAT = "put the number in a stat and use <Stat id=…/>";
const SCALE_WORDS =
  /\b(?:hundreds?|thousands?|millions?|billions?|trillions?|per ?cent|dozens?)\b|%/gi;

/** Replaces text[start, end) with spaces, keeping newlines so positions stay put. */
function blank(text: string, start: number, end: number): string {
  return text.slice(0, start) + text.slice(start, end).replace(/[^\n]/g, " ") + text.slice(end);
}

function blankAll(text: string, pattern: RegExp): string {
  let out = text;
  for (const m of text.matchAll(pattern)) out = blank(out, m.index, m.index + m[0].length);
  return out;
}

function position(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  return { line, column: index - before.lastIndexOf("\n") };
}

/** Finds numbers in `text`, reporting positions relative to `offset` within `whole`. */
function scan(whole: string, text: string, offset: number, allowed: RegExp[]): Finding[] {
  let prose = text;
  for (const name of allowed) prose = blankAll(prose, name);
  const finding = (index: number, token: string, message: string): Finding => ({
    ...position(whole, offset + index),
    token,
    message,
  });
  const digits = [...prose.matchAll(DIGITS)];
  // A scale word inside a digit token ("40%") is the same number; report it once.
  const words = [...prose.matchAll(SCALE_WORDS)].filter(
    (w) => !digits.some((d) => w.index >= d.index && w.index < d.index + d[0].length),
  );
  return [
    ...digits.map((m) => finding(m.index, m[0], `digit in prose; ${USE_A_STAT}`)),
    ...words.map((m) => finding(m.index, m[0], `quantity word in prose; ${USE_A_STAT}`)),
  ];
}

interface Tag {
  start: number;
  end: number;
  name: string;
  attributes: { name: string; value: string; start: number }[];
}

// Attribute text up to the closing `>`: quoted strings and {expressions} may
// contain `>`. One level of braces is enough for props in content files.
const TAG_REST = /(?:"[^"]*"|'[^']*'|\{[^{}]*\}|[^>"'{])*>?/y;

/** Index just past the `>` that closes a tag starting its attributes at `from`. */
function tagEnd(text: string, from: number): number {
  TAG_REST.lastIndex = from;
  TAG_REST.exec(text);
  return TAG_REST.lastIndex;
}

/** Finds JSX/HTML tags and their quoted attribute values. */
function findTags(text: string): Tag[] {
  const tags: Tag[] = [];
  const opener = /<\/?([A-Za-z][\w.:-]*)/g;
  for (let m = opener.exec(text); m !== null; m = opener.exec(text)) {
    const attrsStart = opener.lastIndex;
    const end = tagEnd(text, attrsStart);
    const attributes = [
      ...text.slice(attrsStart, end).matchAll(/([A-Za-z_][\w-]*)\s*=\s*(["'])(.*?)\2/gs),
    ].map((a) => ({
      name: a[1] ?? "",
      value: a[3] ?? "",
      start: attrsStart + a.index + a[0].indexOf(a[2] ?? "") + 1,
    }));
    tags.push({ start: m.index, end, name: m[1] ?? "", attributes });
    opener.lastIndex = end;
  }
  return tags;
}

/** Splits a page into its frontmatter block and body, keeping body offsets. */
function splitFrontmatter(text: string): { frontmatter: string; bodyStart: number } {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  return m === null
    ? { frontmatter: "", bodyStart: 0 }
    : { frontmatter: m[1] ?? "", bodyStart: m[0].length };
}

interface Segment {
  text: string;
  offset: number;
}

const PROSE_KEY_LINE = new RegExp(
  `^(\\s*(?:-\\s+)?)(?:${PROSE_FRONTMATTER_KEYS.join("|")}):\\s*(.*)$`,
);

/** More-indented lines after a key: the rest of a block or multi-line scalar. */
function continuation(lines: string[], starts: number[], from: number, keyColumn: number) {
  const segments: Segment[] = [];
  for (let j = from; j < lines.length; j++) {
    const line = lines[j] ?? "";
    if (line.trim() === "" || line.length - line.trimStart().length <= keyColumn) break;
    segments.push({ text: line, offset: starts[j] ?? 0 });
  }
  return segments;
}

/** Prose values in the frontmatter, including block scalars on following lines. */
function frontmatterProse(frontmatter: string): Segment[] {
  const lines = frontmatter.split("\n");
  // Frontmatter text starts after the opening "---\n".
  const starts = lines.map((_, i) => 4 + lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0));
  return lines.flatMap((line, i) => {
    const m = PROSE_KEY_LINE.exec(line);
    if (m === null) return [];
    const [, prefix = "", value = ""] = m;
    const start = starts[i] ?? 0;
    return [
      { text: value, offset: start + line.length - value.length },
      ...continuation(lines, starts, i + 1, prefix.length),
    ];
  });
}

/** Lints one problem page (MDX source). Findings are sorted by position. */
export function lintProse(source: string, allowed: RegExp[] = ALLOWED_NAMES): Finding[] {
  const text = source.replace(/\r\n/g, "\n");
  const { frontmatter, bodyStart } = splitFrontmatter(text);
  const findings = frontmatterProse(frontmatter).flatMap((seg) =>
    scan(text, seg.text, seg.offset, allowed),
  );

  let body = blank(text, 0, bodyStart);
  body = blankAll(body, /```[\s\S]*?```/g);
  body = blankAll(body, /\{\/\*[\s\S]*?\*\/\}/g);
  body = blankAll(body, /<!--[\s\S]*?-->/g);
  body = blankAll(body, /^(?:import|export)\s.*$/gm);
  body = blankAll(body, /\]\([^)]*\)/g); // link targets
  body = blankAll(body, /&#?\w+;/g); // character entities

  for (const tag of findTags(body)) {
    const prose = PROSE_ATTRIBUTES[tag.name] ?? [];
    for (const attr of tag.attributes) {
      if (prose.includes(attr.name)) findings.push(...scan(text, attr.value, attr.start, allowed));
    }
    body = blank(body, tag.start, tag.end);
  }
  findings.push(...scan(text, body, 0, allowed));

  return findings.sort((a, b) => a.line - b.line || a.column - b.column);
}
