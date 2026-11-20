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
// push is judged in the folder it runs in: the session's, or the one that a `cd`, `pushd`,
// `Set-Location` or `Push-Location` earlier in the same line moves to, and that a `cd -`, `popd`
// or `Pop-Location` moves back from, outside a subshell. Where the guard cannot tell the folder,
// it takes the session's, as it did before it followed a move.
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
// The commands of Bash and PowerShell that move the next commands to another folder, those of them
// that keep the folder they leave on a stack, and those that go back to the folder on that stack.
const MOVES = new Set(["cd", "chdir", "pushd", "set-location", "sl", "push-location"]);
const PUSHES = new Set(["pushd", "push-location"]);
const POPS = new Set(["popd", "pop-location"]);
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
 * With `subshells`, a lone `(` or `)` marks where a subshell opens and closes. With `escapes` off,
 * as PowerShell reads a line, a backslash is a character of its word.
 * @param {string} line
 * @param {{ subshells?: boolean, escapes?: boolean }} [options]
 * @returns {string[][]}
 */
export function simpleCommands(line, { subshells = false, escapes = true } = {}) {
  /** @type {string[][]} */
  const commands = [];
  /** @type {string[]} */
  let words = [];
  /** @type {string | null} */
  let word = null;
  /** @type {string | null} */
  let quote = null;
  let backticks = false;
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
    } else if (subshells && (char === "(" || char === ")")) {
      endCommand();
      commands.push([char]);
    } else if (subshells && escapes && char === "`") {
      // In Bash a pair of backticks runs a command in a subshell, as `$(…)` does.
      endCommand();
      commands.push([backticks ? ")" : "("]);
      backticks = !backticks;
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
 * Where a command that changes the folder goes, from its words after the command's name: a path,
 * `-` for the folder before the last move, or null when it names none.
 * @param {string[]} args
 * @returns {string | null}
 */
function target(args) {
  for (let index = 0; index < args.length; index += 1) {
    if (/^-(literal)?path$/i.test(args[index]) || args[index] === "--") return args[index + 1] || null;
    if (args[index] === "-" || !args[index].startsWith("-")) return args[index];
  }
  return null;
}

/**
 * The folder a path names from `dir`, or `dir` when it does not exist: there the shell's `cd`
 * fails and leaves the folder as it was.
 * @param {string} dir
 * @param {string} where
 * @param {(file: string) => boolean} [exists]
 */
export function moveTo(dir, where, exists = fs.existsSync) {
  const next = gitDirectory(dir, where.replace(/^~(?=$|[\\/])/, os.homedir()), process.platform, exists);
  return exists(next) ? next : dir;
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
  // Where the line runs now, the folder before its last move, and the stack that `pushd` keeps; a
  // folder the guard cannot tell, such as a `popd` with nothing pushed in this line, is the
  // session's.
  let dir = cwd;
  /** @type {string | null} */
  let previous = null;
  /** @type {string[]} */
  let pushed = [];
  /** @type {{ dir: string, previous: string | null, pushed: string[] }[]} */
  const outer = [];
  for (const words of simpleCommands(line, { subshells: true, escapes: !powershell })) {
    if (words.length === 1 && words[0] === "(") {
      outer.push({ dir, previous, pushed: [...pushed] });
      continue;
    }
    if (words.length === 1 && words[0] === ")") {
      ({ dir, previous, pushed } = outer.pop() ?? { dir, previous, pushed });
      continue;
    }
    const [name, ...args] = program(words);
    if (!name) continue;
    if (MOVES.has(name) || POPS.has(name)) {
      const where = POPS.has(name) ? null : target(args);
      /** @type {string} */
      let next;
      if (POPS.has(name)) next = pushed.pop() ?? cwd;
      else if (where === "-") next = previous ?? cwd;
      else if (where === null) next = cwd;
      else next = moveTo(dir, where);
      if (next !== dir) {
        if (PUSHES.has(name)) pushed.push(dir);
        previous = dir;
        dir = next;
      }
      continue;
    }
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
