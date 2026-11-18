// Refuses a push of the kit whose commits add personal content, as `checks/public.mjs` defines it.
//
// Runs as the kit's git `pre-push` hook (`.githooks/pre-push`). Git gives one line for each ref
// pushed: `<local ref> <local commit> <remote ref> <remote commit>`. The commits checked are those
// that no remote-tracking ref reaches: what is published already is not checked again. Each commit
// is checked on its own, because a push publishes the history, not only the last tree: what one
// commit adds and a later one removes is published all the same.
//
// The word list is personal and lives outside the repository; the clone's configuration names it,
// `git config honsha.words <file>`. Without it only the patterns are checked, and no file is read.
//
// The report names the commit, the file and the line, never what was found: a report gets copied
// into records, and would carry it on.
//
// `--install` sets `core.hooksPath` to `.githooks` in the clone that holds this script, unless some
// level of git's configuration sets it already. It is run when a session starts in the kit's clone
// (`.claude/settings.json`), and it never fails: a clone it cannot set keeps working without the hook.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { personal } from "./public.mjs";

const NONE = /^0+$/;

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
 * The entries of the word list the clone's configuration names: `[]` when it names none.
 * @param {string} cwd
 * @returns {string[]}
 * @throws {Error} when the setting names a file that cannot be read
 */
export function wordList(cwd) {
  let file = "";
  try {
    file = git(cwd, ["config", "--type=path", "--get", "honsha.words"]).trim();
  } catch {
    return [];
  }
  if (!file) return [];
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    throw new Error("`honsha.words` names a file that cannot be read: correct the setting, or unset it.");
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
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
 * Where a commit adds something personal: `{ where, kind }`, with `where` a file and line, a file's name, the message
 * or the identities. The text found is not returned.
 * @param {string} commit
 * @param {string} cwd
 * @param {string[]} words
 * @returns {{ where: string, kind: string }[]}
 */
export function commitFindings(commit, cwd, words) {
  /** @type {{ where: string, kind: string }[]} */
  const found = [];
  const meta = git(cwd, ["show", "-s", "--format=%an%n%ae%n%cn%n%ce%n%B", commit]).split("\n");
  for (const { kind } of personal(meta.slice(0, 4).join("\n"), words))
    found.push({ where: "its author or committer", kind });
  for (const { kind } of personal(meta.slice(4).join("\n"), words)) found.push({ where: "its message", kind });

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
      if (file) for (const { kind } of personal(file, words)) found.push({ where: "the name of a file", kind });
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
      for (const { kind } of personal(text.slice(parents), words)) found.push({ where: `${file}:${line}`, kind });
    }
    line += 1;
  }
  return found;
}

/**
 * The lines of the report on a push: empty when the push may go.
 * @param {string} input what git gives the hook
 * @param {string} cwd
 */
export function check(input, cwd) {
  const words = wordList(cwd);
  const lines = [];
  for (const commit of pushedCommits(input, cwd)) {
    const short = commit.slice(0, 7);
    for (const { where, kind } of commitFindings(commit, cwd, words)) lines.push(`${short} ${where} holds ${kind}`);
  }
  return lines;
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
  let lines;
  try {
    lines = check(fs.readFileSync(0, "utf8"), process.cwd());
  } catch (error) {
    // A git error can quote paths of the machine: only the reasons of this script are shown.
    const reason = error instanceof Error && error.message.startsWith("`honsha.words`") ? error.message : "git failed.";
    process.stderr.write(`Honsha pre-push: the check could not run: ${reason}\n`);
    return 1;
  }
  if (lines.length === 0) return 0;
  process.stderr.write(
    [
      "Honsha pre-push: these commits add personal content, which the kit must not publish:",
      ...lines.map((line) => `  ${line}`),
      "They are not published yet. The person decides how to take it out of them; a later commit does not, since the",
      "history is published too. A finding that is wrong is pushed by the person with `git push --no-verify`.",
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main();
}
