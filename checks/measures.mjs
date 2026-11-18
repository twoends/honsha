// Prints the measures of every work item merged into the default branch, from git alone.
//
//   node checks/measures.mjs [--json] [--sessions <folder>]
//
// An item is found from its merge commit on the default branch: the commits the merge brings in
// carry the trailer `Work-Item: <id>`, or the merge's subject names the branch `work/<id>-<slug>`.
// Its record, as merged, gives its size and kind. The times are those of commits:
//   - created: the identifier is the creation time in UTC;
//   - strategy and approval: the first two commits, for a full item;
//   - delivered: the item's last commit, the closing commit;
//   - merged: the merge commit.
// The size of the change is its diff from the merge base: lines, and files counted apart as
// existing (changed, deleted or renamed) or new. Records under `work/` are left out of the files.
// An item is over its expectation when it changed more existing files than the profile's
// `kinds` allow for its kind; a profile with no kinds, or an empty map, gets the default ones.
// Only items merged with a merge commit are found. Where the platform's session files are on the
// machine, each item also gets the tokens, models and active minutes of the sessions that worked on
// it (`checks/sessions.mjs`). Nothing here fails: it is a report.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readProfile } from "./profile.mjs";
import { attribute, describeUsage, readResponses, sessionsDir } from "./sessions.mjs";

/** The kinds a project has when its profile names none. */
export const DEFAULT_KINDS = { feature: 10, fix: 5, upkeep: 5, change: 10 };

const ID = /work\/(\d{6}-\d{4})-/;
const TRAILER = /^Work-Item:\s*(\d{6}-\d{4})\s*$/m;

/**
 * @typedef {{ id: string, size: string | null, kind: string | null, commits: number, added: number, removed: number,
 *   existing: number, newFiles: number, created: number, delivered: number, agentMinutes: number, approvalMinutes: number | null, reviewMinutes: number,
 *   expected: number | null, over: boolean }} Measure
 */

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 26 });
}

/**
 * The creation time an identifier `YYMMDD-HHMM` stands for, in UTC.
 * @param {string} id
 */
export function createdAt(id) {
  const [, yy, mo, dd, hh, mi] = /^(\d\d)(\d\d)(\d\d)-(\d\d)(\d\d)$/.exec(id) ?? [];
  return Date.UTC(2000 + Number(yy), Number(mo) - 1, Number(dd), Number(hh), Number(mi));
}

/**
 * A key of the record's front matter, or null.
 * @param {string} text
 * @param {string} key
 */
function frontMatter(text, key) {
  const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
  const line = new RegExp(`^${key}:\\s*([^#\\r\\n]*)`, "m").exec(head);
  const value = line?.[1].trim() ?? "";
  return value === "" || value === "null" ? null : value;
}

/** @param {number} from @param {number} to */
const minutes = (from, to) => Math.max(0, Math.round((to - from) / 60000));

/**
 * The measures of every item merged into `ref`, oldest first.
 * @param {{ cwd?: string, ref?: string, kinds?: Record<string, number> }} [options]
 * @returns {Measure[]}
 */
export function measure({ cwd = ".", ref = "HEAD", kinds = DEFAULT_KINDS } = {}) {
  const merges = git(cwd, ["log", "--first-parent", "--merges", "--reverse", "--format=%H %ct %s", ref])
    .split("\n")
    .filter(Boolean);
  /** @type {Measure[]} */
  const found = [];
  for (const mergeLine of merges) {
    const [merge, mergedTime, ...subject] = mergeLine.split(" ");
    const commits = git(cwd, ["log", "--reverse", "--format=%ct%x1f%B%x1e", `${merge}^1..${merge}^2`])
      .split("\x1e")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [time, body] = entry.split("\x1f");
        return { time: Number(time) * 1000, body: body ?? "" };
      });
    const id = commits.map((commit) => TRAILER.exec(commit.body)?.[1]).find(Boolean) ?? ID.exec(subject.join(" "))?.[1];
    if (!id || commits.length === 0) continue;

    const recordPath = git(cwd, ["ls-tree", "-r", "--name-only", merge, "work/"])
      .split("\n")
      .find((file) => file.includes(`/${id}-`) && file.endsWith(".md"));
    const record = recordPath ? git(cwd, ["show", `${merge}:${recordPath}`]) : "";
    const size = frontMatter(record, "size");
    const kind = frontMatter(record, "kind");

    const base = git(cwd, ["merge-base", `${merge}^1`, `${merge}^2`]).trim();
    let added = 0;
    let removed = 0;
    for (const row of git(cwd, ["diff", "--numstat", base, `${merge}^2`])
      .split("\n")
      .filter(Boolean)) {
      const [plus, minus] = row.split("\t");
      added += Number(plus) || 0;
      removed += Number(minus) || 0;
    }
    const files = git(cwd, ["diff", "--name-status", base, `${merge}^2`])
      .split("\n")
      .filter(Boolean)
      .map((row) => row.split("\t"))
      .filter(([, file]) => !(file ?? "").startsWith("work/"));
    const newFiles = files.filter(([status]) => status.startsWith("A")).length;
    const existing = files.length - newFiles;

    const created = createdAt(id);
    const delivered = commits[commits.length - 1].time;
    const full = size === "full" && commits.length >= 3;
    const strategy = commits[0].time;
    const approval = full ? commits[1].time : null;
    const agentMinutes =
      approval === null ? minutes(created, delivered) : minutes(created, strategy) + minutes(approval, delivered);
    const expected = kind !== null && kind in kinds ? kinds[kind] : null;
    found.push({
      id,
      size,
      kind,
      commits: commits.length,
      added,
      removed,
      existing,
      newFiles,
      created,
      delivered,
      agentMinutes,
      approvalMinutes: approval === null ? null : minutes(strategy, approval),
      reviewMinutes: minutes(delivered, Number(mergedTime) * 1000),
      expected,
      over: expected !== null && existing > expected,
    });
  }
  return found;
}

/** @param {Measure} item */
export function describe(item) {
  const approval = item.approvalMinutes === null ? "" : `, approval ${item.approvalMinutes} min`;
  const expectation = item.expected === null ? "" : ` (expected at most ${item.expected})`;
  return (
    `${item.id} ${item.size ?? "-"} ${item.kind ?? "-"}: agent ${item.agentMinutes} min${approval}, ` +
    `review ${item.reviewMinutes} min; ${item.commits} commits, +${item.added} -${item.removed}; ` +
    `${item.existing} existing files${expectation}${item.over ? " OVER" : ""}, ${item.newFiles} new`
  );
}

function main() {
  const profile = readProfile();
  const listed = profile?.kinds;
  const kinds = listed && Object.keys(listed).length > 0 ? listed : DEFAULT_KINDS;
  const ref = profile?.defaultBranch ?? "HEAD";
  const items = measure({ ref, kinds });
  const option = process.argv.indexOf("--sessions");
  const read = readResponses(option > 0 ? process.argv[option + 1] : sessionsDir());
  const usage = read ? attribute(read.responses, items, git(".", ["rev-parse", "--show-toplevel"]).trim()) : null;
  if (process.argv.includes("--json")) {
    const withUsage = items.map((item) => ({ ...item, usage: usage?.get(item.id) ?? null }));
    process.stdout.write(`${JSON.stringify(withUsage, null, 2)}\n`);
    return;
  }
  for (const item of items) {
    const sessions = usage?.get(item.id);
    process.stdout.write(`${describe(item)}; ${sessions ? describeUsage(sessions) : "no session data"}\n`);
  }
  if (read && read.skipped > 0) process.stdout.write(`${read.skipped} lines of the session files could not be read\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
