// Checks the shape of a work item's record: the one whose identifier the branch names. Its command is in the kit's
// interface (interface, Commands).
//
// Run from the root of the project. The record is `work/<yyyy>/<mm>/<id>-<slug>.md` for the branch
// `work/<id>-<slug>`; the profile gives the kinds, whether the project is public, and the paths
// whose change calls for the security review. What is checked:
//   - the front matter has the keys of the record template, with the values its comments allow,
//     a `kind` among the profile's kinds or the default ones, and the identifier of the branch; an
//     entry of `checks` may take several lines, as a formatter writes a long one;
//   - every section is one the item's size keeps, and appears once; the intent is quoted, or, in a
//     public project, quotes nothing;
//   - at `in-progress`: every section the size keeps before Verification is written, the approval
//     of a full item and the headings of its scope among them;
//   - at `done`: every section the size keeps is written, `pr` and `model` are set,
//     and a small or full item ends with a checker report whose verdict is `pass`;
//   - at `done`, at every size, the trivial one included, which no checker reads: when the branch
//     changes a path under the profile's `security-review`, the verification holds a security
//     review report. Only that it is there: a finding the person accepted leaves its verdict
//     `fail`, and only the checker reads "Deviations".
// What a size keeps is read from the template's comments, so that it is written in one place;
// the template is the one in the kit directory, beside this script's folder.
//
// The branch's changed files are read only when the profile lists paths under `security-review`,
// with renames split into a deletion and an addition, so that a file moved out of a listed path
// counts by its old path. Those that match are named at any state, since the review is due before
// delivery. When they cannot be read the check fails: a review it cannot tell is due must not pass
// in silence.
//
// The branch comes from HONSHA_BRANCH when a hosting service checks out something else, and the two
// ends of its changes from HONSHA_BASE and HONSHA_HEAD, as for `checks/commits.mjs`; otherwise they
// are the default branch, as last fetched where there is a remote, and HEAD. A branch that is not a
// work branch has no record to check. The exit code is 1 when the record breaks a rule, with one
// line for each.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { DEFAULT_KINDS, readProfile } from "./profile.mjs";

export const WORK_BRANCH = /^work\/((\d{2})(\d{2})\d{2}-\d{4})-([^/]+)$/;
const SIZES = ["trivial", "small", "full"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
// A quote line that says nothing: the template's placeholder, or a bare `>`.
const EMPTY_QUOTE = /^>\s*(?:…\s*)?$/;
// The heading of a security review's report below Verification; like a checker report's, it may name the commit read.
const REVIEW_REPORT = /^Security review report\b/;
const TEMPLATE = new URL("../templates/record.md", import.meta.url);

/**
 * The record's path from the root of the project, with forward slashes, for a work branch; null for another branch.
 * @param {string} branch
 */
export function recordPath(branch) {
  const match = WORK_BRANCH.exec(branch);
  if (!match) return null;
  const [, id, year, month, slug] = match;
  return `work/20${year}/${month}/${id}-${slug}.md`;
}

/**
 * The front matter as raw values by key, and the body after it; null when the text has no front matter.
 * A key's value holds its continuation lines, so that a block list stays with its key.
 * @param {string} text
 */
export function parseRecord(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(text);
  if (!match) return null;
  /** @type {Map<string, { value: string, comment: string, more: string[] }>} */
  const fields = new Map();
  /** @type {{ value: string, comment: string, more: string[] } | null} */
  let last = null;
  for (const line of match[1].split(/\r?\n/)) {
    const top = /^([a-z][\w-]*):\s*(.*)$/.exec(line);
    if (top) {
      const [, value, comment = ""] = /^(.*?)(?:\s+#\s*(.*))?$/.exec(top[2]) ?? [];
      last = { value: unquote(value ?? ""), comment, more: [] };
      if (fields.has(top[1])) fields.set(`${top[1]} (again)`, last);
      else fields.set(top[1], last);
    } else if (last && line.trim() !== "") last.more.push(line);
  }
  return { fields, body: match[2] };
}

/**
 * The entries of a list in the front matter, each with its lines joined by single spaces: an entry starts at a line
 * that begins with `- `. A formatter writes a mapping in braces that passes its width over several lines, with a comma
 * after its last value, and an entry so written is the same value as one on a single line. A line goes on the entry
 * before it only while that entry's braces are open: after a closed one it is an entry of its own, read and judged as
 * one.
 * @param {string[]} lines the lines that follow the list's key
 */
export function entriesOf(lines) {
  /** @type {string[]} */
  const entries = [];
  for (const line of lines) {
    const text = line.trim();
    const last = entries.at(-1);
    if (text.startsWith("- ") || last === undefined || last.endsWith("}")) entries.push(text);
    else entries[entries.length - 1] = `${last} ${text}`;
  }
  return entries;
}

/** @param {string} raw */
function unquote(raw) {
  const text = raw.trim();
  if (/^'.*'$/.test(text) || /^".*"$/.test(text)) return text.slice(1, -1);
  return text;
}

/**
 * The `##` sections of a body, outside fenced code, with their text and their `###` headings.
 * @param {string} body
 */
export function sections(body) {
  /** @type {{ name: string, text: string, subsections: string[] }[]} */
  const found = [];
  let fence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const heading = fence ? null : /^(#{2,3})\s+(.*?)\s*$/.exec(line);
    if (heading?.[1] === "##") found.push({ name: heading[2], text: "", subsections: [] });
    else if (found.length > 0) {
      const current = found[found.length - 1];
      if (heading) current.subsections.push(heading[2]);
      current.text += `${line}\n`;
    }
  }
  return found;
}

/**
 * Whether a section holds something beyond comments and blank lines.
 * @param {{ text: string } | undefined} section
 */
export function written(section) {
  return section !== undefined && section.text.replace(/<!--[\s\S]*?-->/g, "").trim() !== "";
}

/**
 * Whether a record's text has its approval written.
 * @param {string} text
 */
export function approved(text) {
  const record = parseRecord(text);
  return record !== null && written(sections(record.body).find((section) => section.name === "Approval"));
}

/**
 * What the template asks for: the front matter keys with the values their comments list, and for each section the
 * name it has at each size that keeps it, whether it is only there when there is something to say, and the headings
 * below it in the full shape. Throws when a section's comment is not in a form this reads.
 * @param {string} text
 */
export function readTemplate(text) {
  const record = parseRecord(text);
  if (!record) throw new Error("template: no front matter");
  /** @type {Map<string, string[] | null>} */
  const keys = new Map();
  for (const [key, { comment }] of record.fields) {
    const choices = /^[\w-]+(?:\s*\|\s*[\w-]+)+$/.test(comment) ? comment.split("|").map((word) => word.trim()) : null;
    keys.set(key, choices);
  }
  const size = `(?:${SIZES.join("|")})`;
  const label = new RegExp(`\\b(${size}(?: and ${size})*):`, "g");
  const lead = new RegExp(`^(${size}(?: and ${size})*)\\b`);
  const kept = sections(record.body).map(({ name, text: content, subsections }) => {
    const comment = /<!--([\s\S]*?)-->/.exec(content)?.[1].replace(/\s+/g, " ").trim() ?? "";
    /** @type {Record<string, string>} */
    const names = {};
    const labels = [...comment.matchAll(label)];
    if (/^Every size\b/i.test(comment)) {
      for (const each of SIZES) names[each] = name;
    } else if (labels.length > 0) {
      labels.forEach((match, index) => {
        const clause = comment.slice((match.index ?? 0) + match[0].length, labels[index + 1]?.index).trim();
        if (/^delete\b/i.test(clause)) return;
        const renamed = /rename the section "([^"]+)"/i.exec(clause)?.[1];
        for (const each of match[1].split(" and ")) names[each] = renamed ?? name;
      });
    } else {
      const sizes = lead.exec(comment)?.[1];
      if (!sizes) throw new Error(`template: the comment of section "${name}" does not say which sizes keep it`);
      for (const each of sizes.split(" and ")) names[each] = name;
    }
    return { name, names, optional: /\bonly if any\b/i.test(comment), subsections };
  });
  return { keys, sections: kept };
}

/**
 * Whether a path from the project's root, with forward slashes as git names it, matches a pattern of the profile's
 * `security-review`. `*` stands for any characters inside one name and `?` for one character other than `/`; `**` as
 * a whole name stands for zero or more folders, and inside a name reads as `*`. A pattern without `/` matches at the
 * root only. Every other character stands for itself.
 *
 * Node's `path.matchesGlob` is not used: its `*` and `**` skip a name that begins with a dot, and a file of secrets
 * often has one, as `.env` or a folder `.secrets` does.
 * @param {string} file
 * @param {string} pattern
 */
export function matches(file, pattern) {
  return expression(pattern).test(file);
}

/**
 * The regular expression source of one name of a pattern, which never crosses a `/`.
 * @param {string} name
 */
function inside(name) {
  return name
    .split(/(\*+|\?)/)
    .map((part) =>
      part.startsWith("*") ? "[^/]*" : part === "?" ? "[^/]" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
}

/**
 * The regular expression that a pattern of `security-review` stands for.
 * @param {string} pattern
 */
function expression(pattern) {
  // Two `**` in a row are one: each already stands for any number of folders.
  const names = pattern.split("/").filter((name, index, all) => name !== "**" || all[index - 1] !== "**");
  let source = "";
  names.forEach((name, index) => {
    const first = index === 0;
    const last = index === names.length - 1;
    if (name === "**") {
      // Each form keeps the `/` that separates it from its neighbours, and stands for no folder at all too.
      if (first && last) source += ".*";
      else if (first) source += "(?:[^/]*/)*";
      else if (last) source += "(?:/.*)?";
      else source += "(?:/[^/]*)*";
    } else {
      if (!first && !(index === 1 && names[0] === "**")) source += "/";
      source += inside(name);
    }
  });
  return new RegExp(`^${source}$`, "s");
}

/**
 * Up to three paths by name, then how many more.
 * @param {string[]} paths
 */
function briefly(paths) {
  const items = paths.length > 3 ? [...paths.slice(0, 3), `${paths.length - 3} more`] : paths;
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * The problems of a record, one line each. `public` is whether the project is public, as its profile says, or null
 * where the profile is not at hand: the intent may then quote the person or restate the request. `due` is the
 * branch's changed paths that match the profile's `security-review`.
 * @param {string} text
 * @param {{ file: string, id: string, kinds: Record<string, number>, public?: boolean | null, due?: string[],
 *   template?: ReturnType<typeof readTemplate> }} options
 */
export function checkRecord(
  text,
  { file, id, kinds, public: open = false, due = [], template = readTemplate(fs.readFileSync(TEMPLATE, "utf8")) },
) {
  /** @type {string[]} */
  const problems = [];
  /** @param {string} problem */
  const say = (problem) => problems.push(`${file}: ${problem}`);
  const record = parseRecord(text);
  if (!record) {
    say("no front matter between two `---` lines");
    return problems;
  }
  const { fields } = record;
  /** @param {string} key */
  const value = (key) => fields.get(key)?.value ?? "";

  for (const key of fields.keys()) {
    if (key.endsWith(" (again)")) say(`\`${key.replace(" (again)", "")}\` is written twice`);
    else if (!template.keys.has(key)) say(`\`${key}\` is not a key of the record template`);
  }
  for (const [key, choices] of template.keys) {
    if (!fields.has(key)) say(`\`${key}\` is missing`);
    else if (choices && !choices.includes(value(key)))
      say(`\`${key}\` is \`${value(key)}\`, not one of ${choices.join(", ")}`);
  }
  if (fields.has("id") && value("id") !== id) say(`\`id\` is \`${value("id")}\`, not ${id}, the one of the branch`);
  for (const key of ["title", "project"]) if (fields.has(key) && value(key) === "") say(`\`${key}\` is empty`);
  for (const key of ["created", "updated"]) {
    if (fields.has(key) && !DATE.test(value(key))) say(`\`${key}\` is not a date YYYY-MM-DD`);
  }
  if (fields.has("kind") && !(value("kind") in kinds)) {
    say(`\`kind\` is \`${value("kind")}\`, not one of ${Object.keys(kinds).join(", ")}`);
  }
  if (fields.has("areas") && !/^\[.*\]$/.test(value("areas"))) say("`areas` is not a list in brackets");
  const checks = fields.get("checks");
  if (checks) {
    const entries = entriesOf(checks.more).map((entry) =>
      /^-\s*\{\s*due:\s*(\S+?),\s*what:\s*(.+?),?\s*\}$/.exec(entry),
    );
    if (checks.value !== "[]" && !(checks.value === "" && entries.length > 0)) {
      say("`checks` is neither `[]` nor a list of `{ due: YYYY-MM-DD, what: … }`");
    } else if (entries.some((entry) => !entry || !DATE.test(entry[1]))) {
      say("an entry of `checks` is not `{ due: YYYY-MM-DD, what: … }`");
    }
  }
  if (fields.has("pr") && !/^(null|[1-9]\d*)$/.test(value("pr"))) say("`pr` is neither null nor a number");

  const size = value("size");
  const state = value("state");
  const found = sections(record.body);
  // A section written twice is reported once below; the first one is the one read.
  const named = new Map(found.toReversed().map((section) => [section.name, section]));
  if (SIZES.includes(size)) {
    const allowed = template.sections.filter((section) => section.names[size]);
    const names = new Set(allowed.map((section) => section.names[size]));
    const seen = new Set();
    for (const { name } of found) {
      if (!names.has(name)) say(`section "${name}" is not one a ${size} item keeps`);
      else if (seen.has(name)) say(`section "${name}" appears twice`);
      else if (
        allowed.some((section) => section.optional && section.names[size] === name) &&
        !written(named.get(name))
      ) {
        say(`section "${name}" is empty, and is kept only when there is something to say`);
      }
      seen.add(name);
    }
    // Once work has started, what comes before the verification is written; at `done`, everything is.
    const verification = allowed.findIndex((section) => section.name === "Verification");
    const owed = state === "done" ? allowed : state === "in-progress" ? allowed.slice(0, verification) : [];
    for (const section of owed) {
      const name = section.names[size];
      if (!section.optional && !written(named.get(name))) say(`section "${name}" is not written`);
      const below = named.get(name)?.subsections ?? [];
      if (size === "full" && named.has(name)) {
        for (const sub of section.subsections) if (!below.includes(sub)) say(`"${name}" has no "${sub}"`);
      }
    }
  }

  const intent = named.get("Intent");
  const lines = intent?.text.split(/\r?\n/) ?? [];
  if (!intent) say('section "Intent" is missing');
  else if (open === null) {
    // Either form is right for some project, so only an intent that says nothing is wrong for every one.
    const said = intent.text
      .replace(/<!--[\s\S]*?-->/g, "")
      .split(/\r?\n/)
      .some((line) => line.trim() !== "" && !EMPTY_QUOTE.test(line));
    if (!said) say("the intent is not written");
  } else if (open) {
    // The rules ask a public project to restate the request: a quote would publish the person's words.
    if (lines.some((line) => line.startsWith(">"))) say("the intent quotes the person in a public project");
  } else if (!lines.some((line) => line.startsWith(">") && !EMPTY_QUOTE.test(line))) {
    say("the intent is not quoted");
  }
  if (state === "done") {
    if (!/^[1-9]\d*$/.test(value("pr"))) say("a done item has no `pr`");
    if (value("model") === "" || value("model") === "null") say("a done item has no `model`");
    if (size === "small" || size === "full") {
      const verification = named.get("Verification")?.text ?? "";
      const verdict = lastReport(verification);
      if (verdict === null) say("the verification has no checker report with a verdict");
      else if (verdict !== "pass") say(`the checker report kept in full has the verdict \`${verdict}\`, not \`pass\``);
    }
    const reviewed = named.get("Verification")?.subsections.some((heading) => REVIEW_REPORT.test(heading)) ?? false;
    if (due.length > 0 && !reviewed) {
      const paths = due.length === 1 ? "a path" : "paths";
      say(
        `the branch changes ${paths} under \`security-review\` (${briefly(due)}), and the verification has no security review report`,
      );
    }
  }
  return problems;
}

/**
 * The verdict of the checker report kept in full: the last one that lists the acceptance criteria, since earlier ones
 * keep only their verdict and findings and may come after it; or the last one when none lists them. Every `###`
 * heading ends the report before it, so that the verdict of a security review report is never read as the checker's.
 * @param {string} verification
 */
function lastReport(verification) {
  const reports = verification
    .split(/^(?=###\s)/m)
    .filter((part) => /^###\s+Checker report/.test(part))
    .map((part) => ({
      full: /\*\*Acceptance criteria\*\*/.test(part),
      verdict: /\*\*Verdict:\*\*\s*`?(\w+)/.exec(part)?.[1],
    }))
    .filter((report) => report.verdict);
  const full = reports.filter((report) => report.full);
  const chosen = (full.length > 0 ? full : reports).at(-1);
  return chosen?.verdict ?? null;
}

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function attempt(cwd, args) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/**
 * The paths the branch changes, a moved file by its old path and its new one; or why git could not list them.
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} env
 * @param {string} defaultBranch
 * @returns {{ files: string[] } | { why: string }}
 */
function changes(cwd, env, defaultBranch) {
  const head = env.HONSHA_HEAD || "HEAD";
  const base =
    env.HONSHA_BASE ||
    [`origin/${defaultBranch}`, defaultBranch].find((ref) => attempt(cwd, ["rev-parse", "--verify", "--quiet", ref]));
  if (!base) return { why: `the default branch \`${defaultBranch}\` was not found` };
  const range = `${base}...${head}`;
  try {
    const names = execFileSync(
      "git",
      ["diff", "--name-only", "--no-renames", "-z", "--end-of-options", range, "--"],
      // A branch may change many files: past the default buffer, their names would not be read at all.
      { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
    );
    return { files: names.split("\0").filter(Boolean) };
  } catch {
    return { why: `git could not compare \`${range}\`` };
  }
}

/**
 * Returns `{ file, problems, note }` for the repository in `cwd`, and `due`, the branch's changed paths that match
 * the profile's `security-review`, when the profile lists any.
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv }} [options]
 * @returns {{ file: string | null, problems: string[], note?: string, due?: string[] }}
 */
export function check({ cwd = ".", env = process.env } = {}) {
  const branch = env.HONSHA_BRANCH || attempt(cwd, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const file = recordPath(branch);
  if (!file)
    return {
      file: null,
      problems: [],
      note: `The branch \`${branch || "(none)"}\` is not a work branch: no record to check.`,
    };
  const id = WORK_BRANCH.exec(branch)?.[1] ?? "";
  if (!fs.existsSync(path.join(cwd, file))) {
    const folder = path.join(cwd, path.dirname(file));
    const others = fs.existsSync(folder) ? fs.readdirSync(folder).filter((name) => name.startsWith(`${id}-`)) : [];
    const also = others.length > 0 ? `; ${path.dirname(file)} holds ${others.join(", ")}` : "";
    return { file, problems: [`${file}: there is no record for the branch${also}`] };
  }
  const profile = readProfile(path.join(cwd, ".hub", "profile.yml"));
  const listed = profile?.kinds;
  const kinds = listed && Object.keys(listed).length > 0 ? listed : DEFAULT_KINDS;
  const text = fs.readFileSync(path.join(cwd, file), "utf8");
  const options = { file, id, kinds, public: profile?.public ?? false };
  const patterns = profile?.securityReview ?? [];
  if (patterns.length === 0) return { file, problems: checkRecord(text, options) };
  const changed = changes(cwd, env, profile?.defaultBranch ?? "main");
  if ("why" in changed) {
    const unread = `${file}: the branch's changed files could not be read (${changed.why}), so whether the security review is due cannot be told`;
    return { file, problems: [...checkRecord(text, options), unread], due: [] };
  }
  const expressions = patterns.map(expression);
  const due = changed.files.filter((changedFile) => expressions.some((pattern) => pattern.test(changedFile)));
  return { file, problems: checkRecord(text, { ...options, due }), due };
}

function main() {
  const { file, problems, note, due = [] } = check();
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) {
    console.error(`\nThe record breaks ${problems.length === 1 ? "a rule" : "the rules"} above.`);
    return 1;
  }
  console.log(note ?? `The record ${file} has the shape the rules ask for.`);
  if (due.length > 0) {
    const paths = `${due.length} ${due.length === 1 ? "path" : "paths"}`;
    console.log(
      `The branch changes ${paths} under \`security-review\` in the profile: ${briefly(due)}. The security review is due before delivery (\`honsha:security-review\`).`,
    );
  }
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
