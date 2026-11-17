// Refuses the shell commands by which a session would merge, push to the default branch or
// force a push.
//
// Runs as a PreToolUse hook on the shell tools (see hooks.json). It reads the command the session
// is about to run and exits with code 2, and one line of reason, when the command:
//   - pushes to the default branch of the project, or pushes every branch;
//   - forces a push;
//   - merges a pull request, by one of the commands that the piece of a hosting service lists
//     (`services/<name>/merge-commands.json`).
//
// The rules about pushes are plain git and hold on any hosting service. The default branch is
// `default-branch` of `.hub/profile.yml`; `main` and `master` when the profile does not say.
//
// The guard matches the text of a command. It stops a mistake; it is not a security boundary: a
// command hidden in a script or an alias gets past it. It never gets in a session's way by
// failing: a command it cannot read is let through.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readProfile } from "../checks/profile.mjs";

const SERVICES = fileURLToPath(new URL("../services/", import.meta.url));
const WRAPPERS = new Set(["command", "env", "exec", "nice", "nohup", "sudo", "time"]);
const GIT_OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"]);
const PUSH_OPTIONS_WITH_VALUE = new Set(["-o", "--push-option", "--receive-pack", "--exec", "--repo"]);

const REASONS = {
  default: (branch) =>
    `Honsha guard: this push would update the default branch \`${branch}\`. The default branch changes only through pull requests, and the person merges them.`,
  every: () =>
    "Honsha guard: this push sends every branch, the default branch among them. The default branch changes only through pull requests, and the person merges them.",
  force: () =>
    "Honsha guard: this push is forced. A session never force-pushes: a work branch only grows, and a mistake is corrected by a new commit.",
  merge: () =>
    "Honsha guard: this command merges a pull request. The person merges; a session stops once the pull request is open.",
};

/** The text of a command line without the bodies of its here-documents. */
function withoutHereDocuments(line) {
  const kept = [];
  let until = null;
  for (const text of line.split(/\r?\n/)) {
    if (until !== null) {
      if (text.trim() === until) until = null;
      continue;
    }
    kept.push(text);
    const start = /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/.exec(text.replace(/<<</g, ""));
    if (start) until = start[2];
  }
  return kept.join("\n");
}

/**
 * Splits a command line into its simple commands, each a list of words. Quotes are honoured, so
 * the text of a message is one word; variables and other expansions are left as they are written.
 */
export function simpleCommands(line) {
  const commands = [];
  let words = [];
  let word = null;
  let quote = null;
  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) commands.push(words);
    words = [];
  };
  const text = withoutHereDocuments(line);
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === "\\" && quote === '"' && '"\\$`'.includes(text[index + 1])) word += text[(index += 1)];
      else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      word ??= "";
    } else if (char === "\\" && index + 1 < text.length) {
      word = (word ?? "") + text[(index += 1)];
    } else if (char === "\n" || ";|&()`".includes(char)) {
      endCommand();
    } else if (/\s/.test(char)) {
      endWord();
    } else {
      word = (word ?? "") + char;
    }
  }
  endCommand();
  return commands;
}

/** The words of a simple command from its program on, with the program reduced to its name. */
function program(words) {
  let start = 0;
  while (start < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[start]) || WRAPPERS.has(words[start]))) {
    start += 1;
  }
  if (start >= words.length) return [];
  const name = words[start]
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(/\.exe$/i, "")
    .toLowerCase();
  const rest = [];
  for (let index = start + 1; index < words.length; index += 1) {
    // A redirection is not an argument: `2>`, `>file`, and `>` with the file as the next word.
    if (/^\d*(>>?|<)$/.test(words[index])) index += 1;
    else if (!/^\d*(>>?|<)/.test(words[index])) rest.push(words[index]);
  }
  return [name, ...rest];
}

function git(cwd, args) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/** The names the default branch of the repository in `cwd` can have. */
function defaultBranches(cwd) {
  const top = git(cwd, ["rev-parse", "--show-toplevel"]);
  let named = null;
  try {
    named = readProfile(path.join(top || cwd, ".hub", "profile.yml"))?.defaultBranch ?? null;
  } catch {
    // A profile the reader refuses names no branch.
  }
  return named ? [named] : ["main", "master"];
}

/** The reason to refuse a `git` command, or null. `args` are the words after `git`. */
function judgeGit(args, cwd) {
  let dir = cwd;
  let index = 0;
  while (index < args.length && args[index].startsWith("-")) {
    if (args[index] === "-C" && index + 1 < args.length) dir = path.resolve(dir, args[index + 1]);
    index += GIT_OPTIONS_WITH_VALUE.has(args[index]) ? 2 : 1;
  }
  if (args[index] !== "push") return null;

  const positional = [];
  let every = false;
  let tagsOnly = false;
  for (index += 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      positional.push(...args.slice(index + 1));
      break;
    }
    if (!arg.startsWith("-")) positional.push(arg);
    else if (/^--force($|-with-lease|-if-includes)/.test(arg) || /^-[A-Za-z]*f/.test(arg)) return REASONS.force();
    else if (arg === "--all" || arg === "--branches" || arg === "--mirror") every = true;
    else if (arg === "--tags") tagsOnly = true;
    else if (PUSH_OPTIONS_WITH_VALUE.has(arg)) index += 1;
  }
  if (every) return REASONS.every();

  const refspecs = positional.slice(1);
  if (refspecs.some((refspec) => refspec.startsWith("+"))) return REASONS.force();
  const defaults = defaultBranches(dir);
  const current = () => git(dir, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const destinations =
    refspecs.length > 0
      ? refspecs.map((refspec) => (refspec.includes(":") ? refspec.slice(refspec.indexOf(":") + 1) : refspec))
      : tagsOnly
        ? []
        : ["HEAD"];
  for (const destination of destinations) {
    const branch = (destination === "HEAD" ? current() : destination).replace(/^refs\/heads\//, "");
    if (defaults.includes(branch)) return REASONS.default(branch);
  }
  return null;
}

/** The patterns of the commands that merge a pull request, from the piece of every hosting service. */
function mergePatterns(services = SERVICES) {
  const patterns = [];
  if (!fs.existsSync(services)) return patterns;
  for (const name of fs.readdirSync(services)) {
    try {
      const list = JSON.parse(fs.readFileSync(path.join(services, name, "merge-commands.json"), "utf8")).merge;
      for (const pattern of list) patterns.push(new RegExp(pattern));
    } catch {
      // A piece without the file, or with one that cannot be read, lists no command.
    }
  }
  return patterns;
}

/** The reason to refuse the command line, or null when the guard lets it through. */
export function judge(line, { cwd = ".", services } = {}) {
  const patterns = mergePatterns(services);
  for (const words of simpleCommands(line)) {
    const [name, ...args] = program(words);
    if (!name) continue;
    if (name === "git") {
      const reason = judgeGit(args, cwd);
      if (reason) return reason;
    }
    const text = [name, ...args].join(" ");
    if (patterns.some((pattern) => pattern.test(text))) return REASONS.merge();
  }
  return null;
}

function main() {
  const input = JSON.parse(fs.readFileSync(0, "utf8"));
  if (input.hook_event_name !== "PreToolUse" || typeof input.tool_input?.command !== "string") return 0;
  const reason = judge(input.tool_input.command, { cwd: input.cwd || "." });
  if (!reason) return 0;
  process.stderr.write(`${reason}\n`);
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main();
  } catch {
    // Never fail the session because of this hook.
  }
}
