// Checks the shape of a work item's record: the one whose identifier the branch names.
//
//   node <kit directory>/checks/record.mjs
//
// Run from the root of the project. The record is `work/<yyyy>/<mm>/<id>-<slug>.md` for the branch
// `work/<id>-<slug>`; the profile gives the kinds. What is checked:
//   - the front matter has the keys of the record template, with the values its comments allow,
//     a `kind` among the profile's kinds or the default ones, and the identifier of the branch;
//   - every section is one the item's size keeps, and appears once; the intent is quoted;
//   - at `in-progress`: every section the size keeps before Verification is written, the approval
//     of a full item and the headings of its scope among them;
//   - at `done`: every section the size keeps is written, `pr` and `model` are set,
//     and a small or full item ends with a checker report whose verdict is `pass`.
// What a size keeps is read from the template's comments, so that it is written in one place;
// the template is the one in the kit directory, beside this script's folder.
//
// The branch comes from HONSHA_BRANCH when a hosting service checks out something else. A branch
// that is not a work branch has no record to check. The exit code is 1 when the record breaks a
// rule, with one line for each.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { DEFAULT_KINDS } from "./measures.mjs";
import { readProfile } from "./profile.mjs";

export const WORK_BRANCH = /^work\/((\d{2})(\d{2})\d{2}-\d{4})-([^/]+)$/;
const SIZES = ["trivial", "small", "full"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
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
 * The problems of a record, one line each.
 * @param {string} text
 * @param {{ file: string, id: string, kinds: Record<string, number>, template?: ReturnType<typeof readTemplate> }} options
 */
export function checkRecord(text, { file, id, kinds, template = readTemplate(fs.readFileSync(TEMPLATE, "utf8")) }) {
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
    const entries = checks.more.map((line) => /^\s*-\s*\{\s*due:\s*(\S+?),\s*what:\s*(.+?)\s*\}\s*$/.exec(line));
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
    const due = state === "done" ? allowed : state === "in-progress" ? allowed.slice(0, verification) : [];
    for (const section of due) {
      const name = section.names[size];
      if (!section.optional && !written(named.get(name))) say(`section "${name}" is not written`);
      const below = named.get(name)?.subsections ?? [];
      if (size === "full" && named.has(name)) {
        for (const sub of section.subsections) if (!below.includes(sub)) say(`"${name}" has no "${sub}"`);
      }
    }
  }

  const intent = named.get("Intent");
  if (!intent) say('section "Intent" is missing');
  else if (!intent.text.split(/\r?\n/).some((line) => /^>\s*\S/.test(line) && !/^>\s*…\s*$/.test(line))) {
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
  }
  return problems;
}

/**
 * The verdict of the report kept in full: the last report that lists the acceptance criteria, since earlier ones
 * keep only their verdict and findings and may come after it; or the last report when none lists them.
 * @param {string} verification
 */
function lastReport(verification) {
  const reports = verification
    .split(/^(?=###\s+Checker report)/m)
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
 * Returns `{ file, problems, note }` for the repository in `cwd`.
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv }} [options]
 * @returns {{ file: string | null, problems: string[], note?: string }}
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
  const listed = readProfile(path.join(cwd, ".hub", "profile.yml"))?.kinds;
  const kinds = listed && Object.keys(listed).length > 0 ? listed : DEFAULT_KINDS;
  return { file, problems: checkRecord(fs.readFileSync(path.join(cwd, file), "utf8"), { file, id, kinds }) };
}

function main() {
  const { file, problems, note } = check();
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) {
    console.error(`\nThe record breaks ${problems.length === 1 ? "a rule" : "the rules"} above.`);
    return 1;
  }
  console.log(note ?? `The record ${file} has the shape the rules ask for.`);
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
