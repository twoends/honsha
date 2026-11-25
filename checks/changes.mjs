// Tells whether the commits from one commit to another change only records, so that the wiring of a hosting service
// can leave out the setup and the verification commands on a later push to a pull request's branch that changes
// nothing else (workflow, Checks on pull requests and on the default branch).
//
//   node checks/changes.mjs <base> <head>
//
// Run from the root of the project, with the branch's tip before the push and after it, as commit identifiers in
// hexadecimal. A record is a work item's, `work/<yyyy>/<mm>/<id>-<slug>.md`, or one of a home's backlog,
// `backlog/<project>/<id>-<slug>.md`. The files are those that differ between the two commits, with renames split into
// a deletion and an addition, so that a file moved into `work/` counts by its old path too.
//
// The exit code is 0 when every such file is a record, or none differs, and 1 otherwise. It is 1 also whenever the
// answer is not sure: when an argument is not a commit's identifier, when the base is all zeros, as a service gives
// where the branch had no earlier tip, and when git cannot compare the two, as for a commit the clone lacks. A wiring
// that leaves the verification out only on 0 runs everything when in doubt. It names the first file outside the
// records, never what a file holds.
//
// It is not part of the kit's interface: a service's wiring runs it from the kit at the commit the wiring was read
// from, and no project names it.

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** The path of a record from the project's root: a work item's, or one of a home's backlog. */
export const RECORD = /^(?:work\/\d{4}\/\d{2}|backlog\/[a-z0-9][a-z0-9-]*)\/\d{6}-\d{4}-[^/]+\.md$/;
// Checked before git sees an argument, so that none can be read as an option.
const COMMIT = /^[0-9a-f]{7,64}$/;
const NONE = /^0+$/;

/**
 * The files that differ between two commits, by their paths from the project's root, a rename as its two paths.
 * @param {string} base
 * @param {string} head
 * @param {string} [cwd]
 */
export function changedFiles(base, head, cwd = ".") {
  const listed = execFileSync("git", ["diff", "--no-renames", "--name-only", "-z", base, head, "--"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  return listed.split("\0").filter(Boolean);
}

/**
 * Whether the commits from the first argument to the second change only records, with the line that says so.
 * @param {string[]} args
 * @param {string} [cwd]
 * @returns {{ only: boolean, line: string }}
 */
export function judge(args, cwd = ".") {
  const runs = "the setup and the verification commands run.";
  if (args.length !== 2) return { only: false, line: `Usage: node checks/changes.mjs <base> <head>; ${runs}` };
  const [base = "", head = ""] = args;
  if (!COMMIT.test(base) || !COMMIT.test(head)) {
    return { only: false, line: `An argument is not a commit's identifier in hexadecimal: ${runs}` };
  }
  if (NONE.test(base)) return { only: false, line: `The branch had no earlier tip: ${runs}` };
  /** @type {string[]} */
  let files;
  try {
    files = changedFiles(base, head, cwd);
  } catch {
    return { only: false, line: `git cannot compare ${base} with ${head}: ${runs}` };
  }
  const other = files.find((file) => !RECORD.test(file));
  if (other !== undefined) return { only: false, line: `${other} is not a record: ${runs}` };
  if (files.length === 0) return { only: true, line: `No file differs from ${base} to ${head}.` };
  return { only: true, line: `The ${files.length} files that differ from ${base} to ${head} are records.` };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { only, line } = judge(process.argv.slice(2));
  console.log(line);
  process.exitCode = only ? 0 : 1;
}
