// Refuses a push of the kit whose commits add personal content, as `checks/public.mjs` defines it.
//
// Runs as the kit's git `pre-push` hook (`.githooks/pre-push`). Git gives one line for each ref
// pushed: `<local ref> <local commit> <remote ref> <remote commit>`. The commits checked are those
// that no remote-tracking ref reaches: what is published already is not checked again. Each commit
// is checked on its own, because a push publishes the history, not only the last tree: what one
// commit adds and a later one removes is published all the same.
//
// Besides the patterns, it looks for the name of the machine's user, read from the system at each
// push: a list kept by hand would fall behind. Names that many machines share are left out.
//
// An address that the profile's `commits.address` allows is no finding: it is in the metadata of
// every commit already.
//
// The report names the commit, the file and the line, never what was found: a report gets copied
// into records, and would carry it on.
//
// `--range` checks instead each commit after HONSHA_BASE up to HONSHA_HEAD, the variables that the
// wiring of a hosting service gives (workflow, section 14.2), all that HONSHA_HEAD reaches when the
// base is all zeros, since such a push creates the branch. It runs in the kit's pipeline, where the
// commits are published already and the system's user is the runner's: so it looks for the
// patterns only, and the name stays with the hook of the clone that pushes.
//
// `--install` sets `core.hooksPath` to `.githooks` in the clone that holds this script, unless some
// level of git's configuration sets it already. It is run when a session starts in the kit's clone
// (`.claude/settings.json`), and it never fails: a clone it cannot set keeps working without the hook.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readProfile } from "./profile.mjs";
import { personal } from "./public.mjs";

const NONE = /^0+$/;
// Users that systems and pipelines create on their own: words of any text, not the name of a person.
const GENERIC = new Set(["admin", "administrator", "dev", "guest", "node", "root", "runner", "test", "ubuntu", "user"]);
// What a report says after its lines: before a push, and in a pipeline, where the commits are published already.
const CLOSING = {
  hook: [
    "They are not published yet. The person decides how to take it out of them; a later commit does not, since the",
    "history is published too. A finding that is wrong is pushed by the person with `git push --no-verify`.",
  ],
  range: [
    "They are on the hosting service already. The person decides how to take it out of them; a later commit does not,",
    "since the history is published too.",
  ],
};

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function git(cwd, args) {
  return execFileSync("git", ["-c", "core.quotePath=false", ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 1 << 28,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * The names the check looks for besides the patterns: the machine's user, unless it is short or generic.
 * @param {string} [user] the user, read from the system when not given
 * @returns {string[]}
 */
export function personalNames(user) {
  let name = user;
  try {
    name ??= os.userInfo().username;
  } catch {
    return [];
  }
  return name.length >= 3 && !GENERIC.has(name.toLowerCase()) ? [name] : [];
}

/**
 * The commits a push sends that no remote-tracking ref reaches, oldest first.
 * @param {string} input what git gives the hook
 * @param {string} cwd
 */
export function pushedCommits(input, cwd) {
  const tips = input
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[1])
    .filter((commit) => commit && !NONE.test(commit));
  if (tips.length === 0) return [];
  return git(cwd, ["rev-list", "--reverse", "--topo-order", ...tips, "--not", "--remotes"])
    .split("\n")
    .filter(Boolean);
}

/**
 * The commits after `base` up to `head`, oldest first; all that `head` reaches when `base` is all zeros.
 * @param {string} base
 * @param {string} head
 * @param {string} cwd
 */
export function rangeCommits(base, head, cwd) {
  return git(cwd, ["rev-list", "--reverse", "--topo-order", NONE.test(base) ? head : `${base}..${head}`])
    .split("\n")
    .filter(Boolean);
}

/**
 * The addresses that the profile in `cwd` allows for commits, as a pattern; null when it names none.
 * @param {string} cwd
 * @returns {RegExp | null}
 */
export function allowedAddress(cwd) {
  const address = readProfile(path.join(cwd, ".hub", "profile.yml"))?.commitsAddress;
  return address ? new RegExp(address) : null;
}

/**
 * Where a commit adds something personal: `{ where, kind }`, with `where` a file and line, a file's name, the message
 * or the identities. The text found is not returned.
 * @param {string} commit
 * @param {string} cwd
 * @param {string[]} words
 * @param {RegExp | null} [allowed] the addresses that are not personal
 * @returns {{ where: string, kind: string }[]}
 */
export function commitFindings(commit, cwd, words, allowed = null) {
  /** @type {{ where: string, kind: string }[]} */
  const found = [];
  /** @param {string} text */
  const find = (text) => personal(text, words, allowed);
  const meta = git(cwd, ["show", "-s", "--format=%an%n%ae%n%cn%n%ce%n%B", commit]).split("\n");
  for (const { kind } of find(meta.slice(0, 4).join("\n"))) found.push({ where: "its author or committer", kind });
  for (const { kind } of find(meta.slice(4).join("\n"))) found.push({ where: "its message", kind });

  // The names come from their own list: the patch names no file that is binary or empty.
  const names = git(cwd, ["show", "--format=", "--name-only", "--no-renames", "--diff-filter=d", "-z", "--cc", commit]);
  for (const name of names.split("\0").filter(Boolean)) {
    for (const { kind } of find(name)) found.push({ where: "the name of a file", kind });
  }

  // `--cc` keeps of a merge only what differs from every parent: the resolution of its conflicts.
  const patch = git(cwd, [
    "show",
    "--format=",
    "-p",
    "-U0",
    "--cc",
    "--no-renames",
    "--no-color",
    "--no-ext-diff",
    commit,
  ]);
  /** @type {string | null} */
  let file = null;
  let parents = 1;
  let line = 0;
  let previous = "";
  for (const text of patch.split("\n")) {
    const after = previous;
    previous = text;
    if (text.startsWith("diff ")) {
      file = null;
      continue;
    }
    // Only the line after `--- ` names the file: an added line may itself begin with `++ `.
    if (text.startsWith("+++ ") && after.startsWith("--- ")) {
      const name = text.slice(4).replace(/^"(.*)"$/, "$1");
      file = name === "/dev/null" ? null : name.replace(/^b\//, "");
      continue;
    }
    const hunk = /^(@@+) .*?\+(\d+)(?:,\d+)? @@+/.exec(text);
    if (hunk) {
      parents = hunk[1].length - 1;
      line = Number(hunk[2]);
      continue;
    }
    if (file === null || text.startsWith("\\") || text.length < parents) continue;
    const marks = text.slice(0, parents);
    if (marks.includes("-")) continue;
    if (marks.includes("+")) {
      for (const { kind } of find(text.slice(parents))) found.push({ where: `${file}:${line}`, kind });
    }
    line += 1;
  }
  return found;
}

/**
 * The lines of the report on some commits: empty when none adds anything personal.
 * @param {string[]} commits
 * @param {string} cwd
 * @param {string[]} words
 * @param {RegExp | null} allowed
 */
function report(commits, cwd, words, allowed) {
  const lines = [];
  for (const commit of commits) {
    const short = commit.slice(0, 7);
    for (const { where, kind } of commitFindings(commit, cwd, words, allowed)) {
      lines.push(`${short} ${where} holds ${kind}`);
    }
  }
  return lines;
}

/**
 * The lines of the report on a push: empty when the push may go.
 * @param {string} input what git gives the hook
 * @param {string} cwd
 * @param {string[]} [words] the names to look for; `personalNames()` when not given
 * @param {RegExp | null} [allowed] the addresses that are not personal; the profile's when not given
 */
export function check(input, cwd, words = personalNames(), allowed = allowedAddress(cwd)) {
  return report(pushedCommits(input, cwd), cwd, words, allowed);
}

/**
 * How many commits of a range were read, and the lines of the report on them, by the patterns only.
 * @param {string} base
 * @param {string} head
 * @param {string} cwd
 * @param {RegExp | null} [allowed] the addresses that are not personal; the profile's when not given
 */
export function checkRange(base, head, cwd, allowed = allowedAddress(cwd)) {
  const commits = rangeCommits(base, head, cwd);
  return { commits: commits.length, lines: report(commits, cwd, [], allowed) };
}

/**
 * Points git at the kit's hooks, unless a configuration already names a hooks folder.
 * @param {string} root the root of the clone
 * @returns {boolean} whether it set the configuration
 */
export function install(root) {
  try {
    git(root, ["rev-parse", "--git-dir"]);
  } catch {
    return false;
  }
  try {
    git(root, ["config", "--get", "core.hooksPath"]);
    return false;
  } catch {
    // Not set at any level: the kit's hooks can be named.
  }
  try {
    git(root, ["config", "--local", "core.hooksPath", ".githooks"]);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (process.argv.includes("--install")) {
    install(fileURLToPath(new URL("..", import.meta.url)));
    return 0;
  }
  const range = process.argv.includes("--range");
  const name = range ? "Honsha" : "Honsha pre-push";
  const cwd = process.cwd();
  /** @param {string} text */
  const fail = (text) => {
    process.stderr.write(`${name}: ${text}\n`);
    return 1;
  };
  const base = process.env.HONSHA_BASE ?? "";
  const head = process.env.HONSHA_HEAD ?? "";
  const missing = Object.entries({ HONSHA_BASE: base, HONSHA_HEAD: head }).filter(([, value]) => value === "");
  if (range && missing.length > 0) {
    // Read in a pipeline's checkout, a default range would hold nothing, and the check would pass having read nothing.
    return fail(`--range needs ${missing.map(([key]) => key).join(" and ")}, which the wiring of the checks gives.`);
  }
  let allowed;
  try {
    allowed = allowedAddress(cwd);
  } catch (error) {
    // The profile's own errors name a key; another error could quote a path of the machine.
    const own = error instanceof Error && error.message.startsWith("profile:");
    return fail(`the check could not run: ${own ? error.message : "the profile cannot be read"}.`);
  }
  let lines;
  let read = 0;
  try {
    if (range) ({ commits: read, lines } = checkRange(base, head, cwd, allowed));
    else lines = check(fs.readFileSync(0, "utf8"), cwd, personalNames(), allowed);
  } catch {
    // A git error can quote paths of the machine, so it is not shown.
    return fail("the check could not run: git failed.");
  }
  if (lines.length === 0) {
    const counted = `${read} ${read === 1 ? "commit" : "commits"}`;
    if (range) console.log(`From HONSHA_BASE to HONSHA_HEAD, ${counted} read: none adds what the patterns find.`);
    return 0;
  }
  process.stderr.write(
    [
      `${name}: these commits add personal content, which the kit must not publish:`,
      ...lines.map((line) => `  ${line}`),
      ...CLOSING[range ? "range" : "hook"],
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main();
}
