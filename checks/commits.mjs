// Checks the commits of a work branch, or of the default branch, against the rules every project shares and the
// profile. Its command is in the kit's interface (interface, Commands).
//
// Run from the root of the project. For every commit a work branch adds to the default branch:
//   - the message ends with the trailer `Work-Item: <id>`, where <id> is the one in the name of
//     the branch, `work/<id>-<slug>`; a `Work-Item` line that git does not read as a trailer, being
//     outside the message's last paragraph, is named as such;
//   - the author and committer addresses match `commits.address` of the profile, when it is set;
//   - for an item whose record says full at the last commit, the approval gate is read from the
//     history, in the record as each commit holds it. The commits made while the record states
//     trivial or small are a smaller item's, and free. The gate opens at the first commit whose
//     record states another size, or that holds no record, and closes with the first commit from
//     there whose record holds a written approval; every commit inside it changes only the record.
//     When a commit before the gate changes another file, the item grew after its work began, and
//     the record at the commit that opens the gate holds a written "Deviations" that says why. A
//     record that only a merge made full has no commit where the item grew: every commit is then
//     inside a gate that never closes. A merge is not looked at: what it brings is the default
//     branch's.
//
// On the default branch itself, its own commits are read, those of its first parents: a merge brings a pull
// request, whose commits were checked on its branch, and any other commit was pushed there directly. The only
// direct commit accepted is a capture of the backlog (workflow, The backlog): the trailer `Backlog: <id>`, and one
// record added or removed under `backlog/<project>/`, named by that identifier. This reading assumes that pull
// requests are merged with a merge commit: a squashed or rebased one would look like a direct commit.
//
// The branch and the two ends of its commits are read from git. A hosting service often checks
// out something other than the branch itself, so its wiring gives them in three environment
// variables: HONSHA_BRANCH (the name of the branch), HONSHA_BASE and HONSHA_HEAD (the commit
// before the first of the range, and the last one).
//
// The commits are read from `git log`, and a message can hold the byte that separates them there. When what was read
// is not the list of commits that `git rev-list` gives for the same range, in its order, the check reads no further
// and fails with a line that says so.
//
// The exit code is 1 when a commit breaks a rule. An address is never printed.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readProfile } from "./profile.mjs";
import { WORK_BRANCH, approved, parseRecord, recordPath, sections, written } from "./record.mjs";

const FIELD = "\x1f";
const RECORD = "\x1d";
const VALUE = "\x1e";
const WORK_ITEM_LINE = /^Work-Item:/im;
const STRAY =
  "a `Work-Item` line that git does not read as a trailer: git reads trailers only in the message's last paragraph, " +
  "so it goes there with the other trailers and no blank line between them";
const CAPTURE = /^backlog\/[a-z0-9][a-z0-9-]*\/(\d{6}-\d{4})-[^/]+\.md$/;
// The sizes whose work needs no approval: an item that grows from one keeps the commits it made at it.
const SMALLER = ["trivial", "small"];
const GREW = "the record becomes full here, after work committed at a smaller size, and holds no deviation";
const FORGED = "a commit message holds the byte that separates the commits in git's output, so they cannot be read";

/**
 * Where a full item's approval gate lies among its commits, read from its record as each commit holds it.
 * `records` are those texts in the order of the commits, merges left out, with "" for a commit that holds no record.
 * `opens` is the index of the first record that states a size other than trivial or small, or is no record at all;
 * `closes` is the index of the first record from there that holds a written approval, so that an approval in a record
 * of a smaller size closes nothing. Either is -1 when there is no such record, and `closes` is -1 too when the gate
 * does not open.
 * The records are read only as far as the gate's close, so a caller may give them lazily.
 * @param {Iterable<string>} records
 * @returns {{ opens: number, closes: number }}
 */
export function approvalGate(records) {
  let opens = -1;
  let index = 0;
  for (const text of records) {
    if (opens < 0 && !SMALLER.includes(parseRecord(text)?.fields.get("size")?.value ?? "")) opens = index;
    if (opens >= 0 && approved(text)) return { opens, closes: index };
    index += 1;
  }
  return { opens, closes: -1 };
}

/**
 * Why a commit is not a capture of the backlog, or null when it is one.
 * @param {string[]} ids the values of the commit's `Backlog` trailer
 * @param {string[]} changes the lines of `git diff-tree --name-status`, each `<status>\t<path>`
 */
export function notCapture(ids, changes) {
  if (ids.length !== 1) return ids.length === 0 ? "no `Backlog` trailer" : "more than one `Backlog` trailer";
  if (changes.length !== 1) return `changes ${changes.length} files, not one record under backlog/`;
  const [status, file = ""] = changes[0].split("\t");
  if (status !== "A" && status !== "D") return `changes ${file} other than by adding or removing it`;
  if (CAPTURE.exec(file)?.[1] !== ids[0]) return `${file} is not backlog/<project>/${ids[0]}-<slug>.md`;
  return null;
}

/**
 * The values of one trailer key, as a field of `git log` gives them.
 * @param {string} field
 */
const values = (field) =>
  field
    .split(VALUE)
    .map((value) => value.trim())
    .filter(Boolean);

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function attempt(cwd, args) {
  try {
    return git(cwd, args);
  } catch {
    return "";
  }
}

/**
 * Returns `{ commits, problems, note }` for the repository in `cwd`: how many commits were read,
 * one line for each rule a commit breaks, and a remark when there was nothing to check.
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv }} [options]
 * @returns {{ commits: number, problems: string[], note?: string }}
 */
export function check({ cwd = ".", env = process.env } = {}) {
  const profile = readProfile(path.join(cwd, ".hub", "profile.yml"));
  const defaultBranch = profile?.defaultBranch ?? "main";
  const head = env.HONSHA_HEAD || "HEAD";
  const base =
    env.HONSHA_BASE ||
    [`origin/${defaultBranch}`, defaultBranch].find((ref) => attempt(cwd, ["rev-parse", "--verify", "--quiet", ref]));
  if (!base) return { commits: 0, problems: [`the default branch \`${defaultBranch}\` was not found`] };

  const branch = env.HONSHA_BRANCH || attempt(cwd, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const onDefault = branch === defaultBranch;
  // The separators are written as git's own escapes and come back as the characters themselves.
  const format = [
    "%H",
    "%P",
    "%ae",
    "%ce",
    "%s",
    "%(trailers:key=Work-Item,valueonly,separator=%x1e)",
    "%(trailers:key=Backlog,valueonly,separator=%x1e)",
    // The raw message comes last, so that whatever it holds cannot shift the fields before it.
    "%B",
  ].join("%x1f");
  const range = [...(onDefault ? ["--first-parent"] : []), `${base}..${head}`];
  const commits = git(cwd, ["log", "--reverse", `--format=${format}%x1d`, ...range])
    .split(RECORD)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, parents = "", author, committer, subject, items = "", backlog = "", ...message] = entry.split(FIELD);
      const merge = parents.includes(" ");
      const stray = WORK_ITEM_LINE.test(message.join(FIELD));
      return { hash, merge, author, committer, subject, items: values(items), backlog: values(backlog), stray };
    });
  // A message may hold the byte that ends an entry, and what follows it would be read as a commit of its own: one that
  // reaches git as an argument, or one that names another commit, such as an approval, where it is not. So the entries
  // must be the commits that git lists for the range, in its order, before any of them is read further.
  const listed = git(cwd, ["rev-list", "--reverse", ...range])
    .split("\n")
    .filter(Boolean);
  if (commits.length !== listed.length || commits.some((commit, index) => commit.hash !== listed[index]))
    return { commits: listed.length, problems: [FORGED] };
  if (commits.length === 0)
    return { commits: 0, problems: [], note: "The branch adds no commit to the default branch." };

  /** @type {string[]} */
  const problems = [];
  if (onDefault) {
    for (const commit of commits) {
      if (commit.merge) continue;
      const changes = git(cwd, [
        "diff-tree",
        "--no-commit-id",
        "--name-status",
        "-r",
        "--root",
        "--end-of-options",
        commit.hash,
      ])
        .split("\n")
        .filter(Boolean);
      const why = notCapture(commit.backlog, changes);
      if (why) problems.push(`${commit.hash.slice(0, 7)} ${commit.subject}: a direct commit, not a capture: ${why}`);
    }
    return { commits: commits.length, problems };
  }
  const id = WORK_BRANCH.exec(branch)?.[1];
  if (!id) problems.push(`the branch \`${branch || "(none)"}\` is not named work/<id>-<slug>`);
  // oxlint-disable-next-line security/detect-non-literal-regexp -- the project's own profile's
  const address = profile?.commitsAddress ? new RegExp(profile.commitsAddress) : null;
  for (const commit of commits) {
    /** @param {string} problem */
    const say = (problem) => problems.push(`${commit.hash.slice(0, 7)} ${commit.subject}: ${problem}`);
    if (commit.items.length === 0 && commit.stray) say(STRAY);
    else if (commit.items.length === 0) say("no `Work-Item` trailer");
    else if (id && commit.items.some((item) => item !== id)) say(`\`Work-Item\` is not ${id}, the one of the branch`);
    if (address && !address.test(commit.author)) say("the author address does not match `commits.address`");
    if (address && !address.test(commit.committer)) say("the committer address does not match `commits.address`");
  }
  const record = recordPath(branch);
  const text = record ? attempt(cwd, ["show", `${head}:${record}`]) : "";
  if (record && parseRecord(text)?.fields.get("size")?.value === "full") {
    const own = commits.filter((commit) => !commit.merge);
    /** @param {{ hash: string }} commit */
    const recordAt = (commit) => attempt(cwd, ["show", "--end-of-options", `${commit.hash}:${record}`]);
    /** @param {{ hash: string }} commit */
    const others = (commit) =>
      git(cwd, ["diff-tree", "--no-commit-id", "--name-only", "-r", "--root", "--end-of-options", commit.hash])
        .split("\n")
        .filter((file) => file !== "" && file !== record);
    /** @param {{ hash: string, subject: string }} commit @param {string} problem */
    const name = (commit, problem) => problems.push(`${commit.hash.slice(0, 7)} ${commit.subject}: ${problem}`);
    const gate = approvalGate(own.values().map(recordAt));
    if (gate.opens > 0 && own.slice(0, gate.opens).some((commit) => others(commit).length > 0)) {
      const opening = own[gate.opens];
      const deviations = sections(parseRecord(recordAt(opening))?.body ?? "").find(
        (section) => section.name === "Deviations",
      );
      if (!written(deviations)) name(opening, GREW);
    }
    // No commit opens the gate when only a merge made the record full: the whole branch is then read as inside it.
    const inside = own.slice(Math.max(gate.opens, 0), gate.closes < 0 ? own.length : gate.closes + 1);
    for (const commit of inside) {
      const files = others(commit);
      if (files.length > 0) name(commit, `changes ${files.join(", ")} before the approval is committed`);
    }
  }
  return { commits: commits.length, problems };
}

function main() {
  const { commits, problems, note } = check();
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) {
    console.error(`\nThe commits of the branch break ${problems.length === 1 ? "a rule" : "the rules"} above.`);
    return 1;
  }
  console.log(note ?? `The ${commits} commits of the branch follow the rules.`);
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
