// Checks the commits of a work branch against the rules every project shares and the profile.
//
//   node <kit directory>/checks/commits.mjs
//
// Run from the root of the project. For every commit the branch adds to the default branch:
//   - the message ends with the trailer `Work-Item: <id>`, where <id> is the one in the name of
//     the branch, `work/<id>-<slug>`;
//   - the author and committer addresses match `commits.address` of the profile, when it is set;
//   - for a full item, every commit up to and including the one that writes the approval into the
//     record changes only the record, so that the approval gate can be read from the history. The
//     size is read from the record as the last commit holds it. A merge is not looked at: what it
//     brings is the default branch's.
//
// The branch and the two ends of its commits are read from git. A hosting service often checks
// out something other than the branch itself, so its wiring gives them in three environment
// variables: HONSHA_BRANCH (the name of the branch), HONSHA_BASE and HONSHA_HEAD (the commit
// before the first of the range, and the last one).
//
// The exit code is 1 when a commit breaks a rule. An address is never printed.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readProfile } from "./profile.mjs";
import { WORK_BRANCH, approved, parseRecord, recordPath } from "./record.mjs";

const FIELD = "\x1f";
const RECORD = "\x1d";
const VALUE = "\x1e";

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

  // The separators are written as git's own escapes and come back as the characters themselves.
  const format = ["%H", "%P", "%ae", "%ce", "%s", "%(trailers:key=Work-Item,valueonly,separator=%x1e)"].join("%x1f");
  const commits = git(cwd, ["log", "--reverse", `--format=${format}%x1d`, `${base}..${head}`])
    .split(RECORD)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, parents = "", author, committer, subject, trailers = ""] = entry.split(FIELD);
      const items = trailers
        .split(VALUE)
        .map((value) => value.trim())
        .filter(Boolean);
      return { hash, merge: parents.includes(" "), author, committer, subject, items };
    });
  if (commits.length === 0)
    return { commits: 0, problems: [], note: "The branch adds no commit to the default branch." };

  const problems = [];
  const branch = env.HONSHA_BRANCH || attempt(cwd, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const id = WORK_BRANCH.exec(branch)?.[1];
  if (!id) problems.push(`the branch \`${branch || "(none)"}\` is not named work/<id>-<slug>`);
  const address = profile?.commitsAddress ? new RegExp(profile.commitsAddress) : null;
  for (const commit of commits) {
    /** @param {string} problem */
    const say = (problem) => problems.push(`${commit.hash.slice(0, 7)} ${commit.subject}: ${problem}`);
    if (commit.items.length === 0) say("no `Work-Item` trailer");
    else if (id && commit.items.some((item) => item !== id)) say(`\`Work-Item\` is not ${id}, the one of the branch`);
    if (address && !address.test(commit.author)) say("the author address does not match `commits.address`");
    if (address && !address.test(commit.committer)) say("the committer address does not match `commits.address`");
  }
  const record = recordPath(branch);
  const text = record ? attempt(cwd, ["show", `${head}:${record}`]) : "";
  if (record && parseRecord(text)?.fields.get("size")?.value === "full") {
    for (const commit of commits) {
      if (commit.merge) continue;
      const others = git(cwd, ["diff-tree", "--no-commit-id", "--name-only", "-r", "--root", commit.hash])
        .split("\n")
        .filter((file) => file !== "" && file !== record);
      if (others.length > 0) {
        const files = others.join(", ");
        problems.push(
          `${commit.hash.slice(0, 7)} ${commit.subject}: changes ${files} before the approval is committed`,
        );
      }
      if (approved(attempt(cwd, ["show", `${commit.hash}:${record}`]))) break;
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
