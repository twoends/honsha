// Refuses the shell commands by which a session would merge, push to the default branch, force a
// push or skip the hooks of a push.
//
// Runs as a PreToolUse hook on the shell tools (see hooks.json). It reads the command the session
// is about to run and exits with code 2, and one line of reason, when the command:
//   - pushes to the default branch of the project, or pushes every branch;
//   - deletes the default branch;
//   - forces a push;
//   - skips the hooks of a push, which may check what it publishes;
//   - merges a pull request, by one of the commands that the piece of a hosting service lists
//     (`services/<name>/merge-commands.json`).
//
// The rules about pushes are plain git and hold on any hosting service. The default branch is
// `default-branch` of `.hub/profile.yml`; `main` and `master` when the profile does not say. A
// push is judged in the session's folder, or in another one when the line begins by moving there
// for sure: a `cd` or `pushd` (in PowerShell also `Set-Location`, `sl`, `chdir` or
// `Push-Location`) to one folder that exists, followed by `&&` (in PowerShell also by `;`), with
// nothing after it that could move again: another such command, a subshell, a brace group, a
// shell keyword, or a script or a string the line runs. A line the guard cannot follow so is
// judged in the session's folder.
//
// The guard matches the text of a command. It stops a mistake; it is not a security boundary: a
// command hidden in a script or an alias gets past it. It never gets in a session's way by
// failing: a command it cannot read is let through.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readProfile } from "../checks/profile.mjs";

const SERVICES = fileURLToPath(new URL("../services/", import.meta.url));
const WRAPPERS = new Set(["command", "env", "exec", "nice", "nohup", "sudo", "time"]);
// The moves a line may begin with, in each tool's shell.
const LEADS = {
  bash: new Set(["cd", "pushd"]),
  powershell: new Set(["cd", "chdir", "sl", "set-location", "pushd", "push-location"]),
};
// What, after that move, could take the line to another folder: the moves of both shells, what runs a
// script or a string, and the keywords and braces of a compound command.
const UNFOLLOWED = new Set([
  ...LEADS.powershell,
  "popd",
  "pop-location",
  "source",
  ".",
  "eval",
  "invoke-expression",
  "iex",
  "invoke-command",
  "icm",
  "{",
  "}",
  "!",
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "foreach",
  "while",
  "until",
  "do",
  "done",
  "case",
  "esac",
  "select",
  "function",
]);
const GIT_OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"]);
const PUSH_OPTIONS_WITH_VALUE = new Set(["-o", "--push-option", "--receive-pack", "--exec", "--repo"]);

const REASONS = {
  /** @param {string} branch */
  default: (branch) =>
    `Honsha guard: this push would update the default branch \`${branch}\`. The default branch changes only through pull requests, and the person merges them.`,
  /** @param {string} branch */
  delete: (branch) =>
    `Honsha guard: this push would delete the default branch \`${branch}\`. The default branch changes only through pull requests.`,
  every: () =>
    "Honsha guard: this push sends every branch, the default branch among them. The default branch changes only through pull requests, and the person merges them.",
  force: () =>
    "Honsha guard: this push is forced. A session never force-pushes: a work branch only grows, and a mistake is corrected by a new commit.",
  hooks: () =>
    "Honsha guard: this push skips the repository's hooks (`--no-verify`). A session never skips them: a hook that refuses a push says what to correct first.",
  merge: () =>
    "Honsha guard: this command merges a pull request. The person merges; a session stops once the pull request is open.",
};

/**
 * The text of a command line without the bodies of its here-documents.
 * @param {string} line
 */
function withoutHereDocuments(line) {
  const kept = [];
  /** @type {string | null} */
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
 * With `marks`, what separates them comes between them as a list of one word: `;`, `&&`, `||`,
 * `|`, `&`, a new line as `;`, and `(`, `)` or a backtick where a subshell may open or close.
 * With `escapes` off, as PowerShell reads a line, a backslash is a character of its word.
 * @param {string} line
 * @param {{ marks?: boolean, escapes?: boolean }} [options]
 * @returns {string[][]}
 */
export function simpleCommands(line, { marks = false, escapes = true } = {}) {
  /** @type {string[][]} */
  const commands = [];
  /** @type {string[]} */
  let words = [];
  /** @type {string | null} */
  let word = null;
  /** @type {string | null} */
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
      else if (escapes && char === "\\" && quote === '"' && '"\\$`'.includes(text[index + 1]))
        word += text[(index += 1)];
      else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      word ??= "";
    } else if (escapes && char === "\\" && index + 1 < text.length) {
      word = (word ?? "") + text[(index += 1)];
    } else if (char === "\n" || ";|&()`".includes(char)) {
      endCommand();
      if (marks) {
        const pair = (char === "&" || char === "|") && text[index + 1] === char;
        commands.push([pair ? char + text[(index += 1)] : char === "\n" ? ";" : char]);
      }
    } else if (/\s/.test(char)) {
      endWord();
    } else {
      word = (word ?? "") + char;
    }
  }
  endCommand();
  return commands;
}

/**
 * The words of a simple command from its program on, with the program reduced to its name.
 * @param {string[]} words
 * @returns {string[]}
 */
function program(words) {
  let start = 0;
  while (start < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[start]) || WRAPPERS.has(words[start]))) {
    start += 1;
  }
  if (start >= words.length) return [];
  const file = words[start].replace(/\\/g, "/").split("/").pop() ?? "";
  const name = file.replace(/\.exe$/i, "").toLowerCase();
  const rest = [];
  for (let index = start + 1; index < words.length; index += 1) {
    // A redirection is not an argument: `2>`, `>file`, and `>` with the file as the next word.
    if (/^\d*(>>?|<)$/.test(words[index])) index += 1;
    else if (!/^\d*(>>?|<)/.test(words[index])) rest.push(words[index]);
  }
  return [name, ...rest];
}

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function git(cwd, args) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/**
 * The names the default branch of the repository in `cwd` can have.
 * @param {string} cwd
 */
function defaultBranches(cwd) {
  const top = git(cwd, ["rev-parse", "--show-toplevel"]);
  let profile = null;
  try {
    profile = readProfile(path.join(top || cwd, ".hub", "profile.yml"));
  } catch {
    // A profile the reader refuses names no branch.
  }
  const named = profile?.defaultBranch ?? null;
  return named ? [named] : ["main", "master"];
}

/**
 * The directory that `git -C dir` works in, from `base`. Git Bash rewrites `/c/rest` to `C:/rest` before `git` runs,
 * but the guard sees the command as written; PowerShell rewrites nothing, and there `/c/rest` is a folder `c` at the
 * root of the current drive. So the Git Bash reading is taken only when the plain one does not exist.
 * @param {string} base
 * @param {string} dir
 * @param {string} [platform]
 * @param {(file: string) => boolean} [exists]
 */
export function gitDirectory(base, dir, platform = process.platform, exists = fs.existsSync) {
  const paths = platform === "win32" ? path.win32 : path.posix;
  const plain = paths.resolve(base, dir);
  const drive = /^\/([A-Za-z])(?:\/(.*))?$/.exec(dir);
  if (platform !== "win32" || !drive || exists(plain)) return plain;
  return paths.resolve(`${drive[1].toUpperCase()}:/`, drive[2] ?? "");
}

/**
 * The reason to refuse a `git` command, or null. `args` are the words after `git`.
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string | null}
 */
function judgeGit(args, cwd) {
  let dir = cwd;
  let index = 0;
  while (index < args.length && args[index].startsWith("-")) {
    if (args[index] === "-C" && index + 1 < args.length) dir = gitDirectory(dir, args[index + 1]);
    index += GIT_OPTIONS_WITH_VALUE.has(args[index]) ? 2 : 1;
  }
  if (args[index] !== "push") return null;

  const positional = [];
  let every = false;
  let deletes = false;
  let tagsOnly = false;
  for (index += 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      positional.push(...args.slice(index + 1));
      break;
    }
    if (!arg.startsWith("-")) positional.push(arg);
    else if (/^--force($|-with-lease|-if-includes)/.test(arg) || /^-[A-Za-z]*f/.test(arg)) return REASONS.force();
    else if (arg === "--no-verify") return REASONS.hooks();
    else if (arg === "--all" || arg === "--branches" || arg === "--mirror") every = true;
    else if (arg === "--tags") tagsOnly = true;
    else if (arg === "--delete" || /^-[A-Za-z]*d/.test(arg)) deletes = true;
    else if (PUSH_OPTIONS_WITH_VALUE.has(arg)) index += 1;
  }
  if (every) return REASONS.every();

  const refspecs = positional.slice(1);
  if (refspecs.some((refspec) => refspec.startsWith("+"))) return REASONS.force();
  const defaults = defaultBranches(dir);
  const current = () => git(dir, ["symbolic-ref", "--short", "-q", "HEAD"]);
  // A refspec with an empty source, `:main`, deletes its destination.
  const targets =
    refspecs.length > 0
      ? refspecs.map((refspec) => {
          const colon = refspec.indexOf(":");
          return { destination: refspec.slice(colon + 1), deletion: deletes || colon === 0 };
        })
      : tagsOnly
        ? []
        : [{ destination: "HEAD", deletion: false }];
  for (const { destination, deletion } of targets) {
    const branch = (destination === "HEAD" ? current() : destination).replace(/^refs\/heads\//, "");
    if (defaults.includes(branch)) return deletion ? REASONS.delete(branch) : REASONS.default(branch);
  }
  return null;
}

/**
 * The patterns of the commands that merge a pull request, from the piece of every hosting service.
 * @param {string} [services]
 */
function mergePatterns(services = SERVICES) {
  /** @type {RegExp[]} */
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

/**
 * The one folder that the words after a move's name name: a lone path, or the one after `-Path` or
 * `-LiteralPath`; null for any other form, such as an option, `-`, a stack's position or no target.
 * @param {string[]} args
 * @returns {string | null}
 */
function target(args) {
  if (args.length === 1 && !/^[-+]/.test(args[0])) return args[0];
  if (args.length === 2 && /^-(literal)?path$/i.test(args[0])) return args[1];
  return null;
}

/**
 * The folder a path names from `dir`, or null when it does not exist: there the move fails, or the
 * shell finds the folder another way.
 * @param {string} dir
 * @param {string} where
 * @param {(file: string) => boolean} [exists]
 */
export function moveTo(dir, where, exists = fs.existsSync) {
  const next = gitDirectory(dir, where.replace(/^~(?=$|[\\/])/, os.homedir()), process.platform, exists);
  return exists(next) ? next : null;
}

/**
 * The folder the rest of a line runs in when it begins by moving there for sure, or null: its first
 * command is a move to one folder that exists, joined by `&&` (in PowerShell also by `;`) to the
 * rest, in which nothing could move again.
 * @param {string[][]} items the line's simple commands and the marks between them
 * @param {string} cwd
 * @param {boolean} powershell
 */
function lead(items, cwd, powershell) {
  const [first, join, ...rest] = items;
  if (!first || !join || (join[0] !== "&&" && !(powershell && join[0] === ";"))) return null;
  const [name, ...args] = program(first);
  if (!(powershell ? LEADS.powershell : LEADS.bash).has(name)) return null;
  const where = target(args);
  if (where === null) return null;
  const opens = rest.some((words) => words.length === 1 && ["(", ")", "`"].includes(words[0]));
  if (opens || rest.some((words) => UNFOLLOWED.has(program(words)[0] ?? ""))) return null;
  return moveTo(cwd, where);
}

/**
 * The reason to refuse the command line, or null when the guard lets it through. `powershell`
 * reads the line as the PowerShell tool runs it, where a backslash belongs to a path.
 * @param {string} line
 * @param {{ cwd?: string, services?: string, powershell?: boolean }} [options]
 * @returns {string | null}
 */
export function judge(line, { cwd = ".", services, powershell = false } = {}) {
  const patterns = mergePatterns(services);
  const items = simpleCommands(line, { marks: true, escapes: !powershell });
  const dir = lead(items, cwd, powershell) ?? cwd;
  for (const words of items) {
    const [name, ...args] = program(words);
    if (!name) continue;
    if (name === "git") {
      const reason = judgeGit(args, dir);
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
  const powershell = input.tool_name === "PowerShell";
  const reason = judge(input.tool_input.command, { cwd: input.cwd || ".", powershell });
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
