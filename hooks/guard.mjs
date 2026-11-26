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
// for sure: its first word is `cd` or `pushd` (in PowerShell also `Set-Location`, `sl`, `chdir` or
// `Push-Location`), with one path to a folder that the tool's shell cannot read as another folder
// (no wildcard, variable or leading `~`, and `..` only at the start of a relative path; in Bash an
// absolute path or one whose first part is `.` or `..`, and on Windows no `..` at all), followed by
// `&&` (in PowerShell also by `;`), and every later command is one of a few programs that cannot
// move a shell. Any other line is judged in the session's folder.
//
// It judges only in a session of the installation's folders, and in one whose folder it cannot place because the
// installation cannot be read (`hooks/place.mjs`); anywhere else it lets every command through.
//
// The guard matches the text of a command. It stops a mistake; it is not a security boundary: a
// command hidden in a script or an alias gets past it. It never gets in a session's way by
// failing: a command it cannot read is let through.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { readProfile } from "../checks/profile.mjs";
import { placeOf, readInput } from "./place.mjs";

const SERVICES = fileURLToPath(new URL("../services/", import.meta.url));
const WRAPPERS = new Set(["command", "env", "exec", "nice", "nohup", "sudo", "time"]);
// The moves a line may begin with, in each tool's shell.
const LEADS = {
  bash: new Set(["cd", "pushd"]),
  powershell: new Set(["cd", "chdir", "sl", "set-location", "pushd", "push-location"]),
};
// Programs that run in a process of their own, so they cannot move the shell that starts them: the
// only commands a followed line may hold after its move. Anything else, a builtin, a keyword, a
// script block or an assignment, could move the shell where the guard cannot see it.
const STILL = new Set(["git", "gh", "node", "npm", "npx"]);
const JOINS = new Set([";", "&&", "||", "|", "&"]);
// What may stand right before a `>` or `<` as part of its redirection: a file descriptor as digits, or the `&` of `&>`;
// in the reading with braces (`judge`), also a `{…}` that names the variable of a new descriptor.
const DESCRIPTOR = String.raw`(?:\d+|&)`;
const BRACED = String.raw`(?:\d+|&|\{.*\})`;
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
 * A redirection is a word of its own, also when it is glued to the word before it, as Bash reads it;
 * unquoted digits glued before it are its file descriptor, and with `braces` so is a `{…}`, which is
 * otherwise a word of its own.
 * With `marks`, what separates them comes between them as a list of one word: `;`, `&&`, `||`,
 * `|`, `&`, a new line as `;`, and `(`, `)` or a backtick where a subshell may open or close.
 * With `escapes` off, as PowerShell reads a line, a backslash is a character of its word.
 * @param {string} line
 * @param {{ marks?: boolean, escapes?: boolean, braces?: boolean }} [options]
 * @returns {string[][]}
 */
export function simpleCommands(line, { marks = false, escapes = true, braces = false } = {}) {
  /** @type {string[][]} */
  const commands = [];
  /** @type {string[]} */
  let words = [];
  /** @type {string | null} */
  let word = null;
  /** @type {string | null} */
  let quote = null;
  // oxlint-disable-next-line security/detect-non-literal-regexp -- built from the constants above
  const descriptor = new RegExp(`^${braces ? BRACED : DESCRIPTOR}$`);
  // Whether the word so far holds a quoted or escaped character: Bash then never reads its digits as a file descriptor.
  let literal = false;
  /** Whether the word so far belongs to the redirection that begins right after it. @param {string} text */
  const joins = (text) => descriptor.test(text) && (!literal || text.startsWith("{"));
  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
    literal = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) commands.push(words);
    words = [];
  };
  // The last character when it was a `>` or `<` outside quotes and escapes. An `&` right after one
  // belongs to the redirection, as in `2>&1`, and so does a `|` after `>`, as in `>|file`; an `&`
  // right before a `>` begins one, as in `&>file`. None of them ends the command.
  let redirection = "";
  const text = withoutHereDocuments(line);
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const after = redirection;
    redirection = "";
    if (quote) {
      if (char === quote) quote = null;
      else if (escapes && char === "\\" && quote === '"' && '"\\$`'.includes(text[index + 1]))
        word += text[(index += 1)];
      else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      word ??= "";
      literal = true;
    } else if (escapes && char === "\\" && index + 1 < text.length) {
      word = (word ?? "") + text[(index += 1)];
      literal = true;
    } else if ((char === "&" && after) || (char === "|" && after === ">")) {
      word = (word ?? "") + char;
    } else if (char === "&" && text[index + 1] === ">") {
      endWord();
      word = char;
    } else if (char === "\n" || ";|&()`".includes(char)) {
      endCommand();
      if (marks) {
        const pair = (char === "&" || char === "|") && text[index + 1] === char;
        commands.push([pair ? char + text[(index += 1)] : char === "\n" ? ";" : char]);
      }
    } else if (/\s/.test(char)) {
      endWord();
    } else if ((char === ">" || char === "<") && word !== null && !after && !joins(word)) {
      // A redirection begins here, and the text before it is a word of its own, unless that text belongs to the
      // redirection (`joins`). PowerShell keeps a `>` in a word without quotes, `main>x`, and begins a redirection
      // after one in quotes, `"main">x`; the guard reads both the Bash way, so in PowerShell too `main>x` is `main`.
      endWord();
      word = char;
      redirection = char;
    } else {
      word = (word ?? "") + char;
      if (char === ">" || char === "<") redirection = char;
    }
  }
  endCommand();
  return commands;
}

/**
 * The words of a simple command from its program on, with the program reduced to its name. `braces`
 * is the reading of `simpleCommands` that gave the words.
 * @param {string[]} words
 * @param {boolean} [braces]
 * @returns {string[]}
 */
function program(words, braces = false) {
  // A redirection is neither the program nor an argument: `2>&1`, `>file`, `&>file`, and `>`, `>&`,
  // `>|` or `&>` with the file as the next word. It may stand before the program as well as after it.
  const prefix = braces ? BRACED : DESCRIPTOR;
  // oxlint-disable-next-line security/detect-non-literal-regexp -- built from the constants above
  const alone = new RegExp(String.raw`^${prefix}?(>>|>\||>&?|<&?)$`);
  // oxlint-disable-next-line security/detect-non-literal-regexp -- built from the constants above
  const redirection = new RegExp(`^${prefix}?[<>]`);
  let start = 0;
  while (start < words.length) {
    const word = words[start];
    if (alone.test(word)) start += 2;
    else if (redirection.test(word) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(word) || WRAPPERS.has(word)) start += 1;
    else break;
  }
  if (start >= words.length) return [];
  const file = words[start].replace(/\\/g, "/").split("/").pop() ?? "";
  const name = file.replace(/\.exe$/i, "").toLowerCase();
  const rest = [];
  for (let index = start + 1; index < words.length; index += 1) {
    if (alone.test(words[index])) index += 1;
    else if (!redirection.test(words[index])) rest.push(words[index]);
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
  // oxlint-disable-next-line security/detect-unsafe-regex -- linear: its optional part opens with `/`
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
      // oxlint-disable-next-line security/detect-non-literal-regexp -- the kit's own patterns
      for (const pattern of list) patterns.push(new RegExp(pattern));
    } catch {
      // A piece without the file, or with one that cannot be read, lists no command.
    }
  }
  return patterns;
}

/**
 * The one folder that the words after a move's name name: a lone path, or in PowerShell the one
 * after `-Path` or `-LiteralPath`; null for any other form, such as an option, `-`, a stack's
 * position or no target.
 * @param {string[]} args
 * @param {boolean} powershell
 * @returns {string | null}
 */
function target(args, powershell) {
  if (args.length === 1 && !/^[-+]/.test(args[0])) return args[0];
  if (powershell && args.length === 2 && /^-(literal)?path$/i.test(args[0])) return args[1];
  return null;
}

/**
 * The path a move's target names from `dir` as the tool's shell reads it, or null when the guard
 * gives up on it. It gives up where the shell could read the same words as another folder: a
 * wildcard, a variable or a leading `~` expand; a name that ends in a dot or a space is cut by
 * Windows and kept by Git Bash; in Bash a relative path is first looked for along `CDPATH`, unless
 * its first part is `.` or `..`; a path that begins with `//` may name a network share; and Git Bash
 * resolves a path in its own tree, where drive C: is the folder `/c`, the rest goes through its
 * mounts, and the session's folder may itself be written through one, such as `/tmp`. It also gives
 * up on a `..` anywhere but at the start of a relative path, one rule for every path, since a `..`
 * after a named part is entered through a link by a shell that follows links. So on Windows a Bash
 * path is read only without `..`: an absolute path that ends on a drive, `/c/rest`, or a relative one
 * such as `./rest`.
 * @param {string} dir
 * @param {string} where
 * @param {boolean} powershell
 * @param {string} [platform]
 * @returns {string | null}
 */
export function readPath(dir, where, powershell, platform = process.platform) {
  const windows = platform === "win32";
  const paths = windows ? path.win32 : path.posix;
  if (!/^[\p{L}\p{N} _.~\-/\\:]+$/u.test(where) || where.startsWith("~")) return null;
  const parts = where.split(/[\\/]/);
  if (parts.some((part) => part !== "." && part !== ".." && /[. ]$/.test(part))) return null;
  const named = parts.findIndex((part) => part !== "..");
  if (named >= 0 && parts.slice(named).includes("..")) return null;
  if (powershell) {
    // A colon only in a drive that begins an absolute path: `C:rest` starts from the drive's own folder.
    const rest = windows ? where.replace(/^[A-Za-z]:(?=[\\/])/, "") : where;
    if (rest.includes(":") || (!windows && rest.includes("\\"))) return null;
    return paths.resolve(dir, where);
  }
  if (where.includes("\\") || where.includes(":") || where.startsWith("//")) return null;
  if (!where.startsWith("/") && !/^\.\.?(\/|$)/.test(where)) return null;
  if (!windows) return paths.resolve(dir, where);
  if (parts.includes("..")) return null;
  if (!where.startsWith("/")) return paths.resolve(dir, where);
  // oxlint-disable-next-line security/detect-unsafe-regex -- linear: its optional part opens with `/`
  const drive = /^\/([a-z])(?:\/(.*))?$/.exec(path.posix.resolve(where));
  return drive ? paths.resolve(`${drive[1].toUpperCase()}:\\`, drive[2] ?? "") : null;
}

/**
 * The folder a move goes to from `dir`, or null when the guard cannot be sure of it: the path is one
 * that `readPath` gives up on, or not a folder the shell may enter, so the move fails, or it names
 * another folder when `..` is read through the real folder rather than through `dir` as written, as
 * a shell that resolves links does.
 * @param {string} dir
 * @param {string} where
 * @param {boolean} powershell
 */
export function moveTo(dir, where, powershell) {
  const next = readPath(dir, where, powershell);
  if (next === null) return null;
  try {
    const real = readPath(fs.realpathSync.native(dir), where, powershell);
    if (real === null || fs.realpathSync.native(real) !== fs.realpathSync.native(next)) return null;
    if (!fs.statSync(next).isDirectory()) return null;
    fs.accessSync(next, fs.constants.X_OK);
    return next;
  } catch {
    return null;
  }
}

/**
 * The folder the rest of a line runs in when it begins by moving there for sure, or null: its first
 * word is a move with one path to a folder, joined by `&&` (in PowerShell also by `;`) to a rest
 * whose every command is one of `STILL`.
 * @param {string[][]} items the line's simple commands and the marks between them
 * @param {string} cwd
 * @param {boolean} powershell
 */
function lead(items, cwd, powershell) {
  const [first, join, ...rest] = items;
  if (!first || !join || (join[0] !== "&&" && !(powershell && join[0] === ";"))) return null;
  const name = powershell ? first[0].toLowerCase() : first[0];
  if (!(powershell ? LEADS.powershell : LEADS.bash).has(name)) return null;
  const where = target(first.slice(1), powershell);
  if (where === null) return null;
  const still = rest.every((words) =>
    words.length === 1 && JOINS.has(words[0]) ? true : STILL.has(powershell ? words[0].toLowerCase() : words[0]),
  );
  return still ? moveTo(cwd, where, powershell) : null;
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
  // Bash reads a `{…}` right before a redirection as the variable of a new descriptor or as a word, by a rule on what
  // it holds that the guard does not follow: a line that holds one is judged both ways, and refused if either refuses.
  /** @param {boolean} braces */
  const read = (braces) => simpleCommands(line, { marks: true, escapes: !powershell, braces });
  const readings = [{ braces: false, items: read(false) }];
  const braced = read(true);
  if (JSON.stringify(braced) !== JSON.stringify(readings[0].items)) readings.push({ braces: true, items: braced });
  for (const { braces, items } of readings) {
    const dir = lead(items, cwd, powershell) ?? cwd;
    for (const words of items) {
      const [name, ...args] = program(words, braces);
      if (!name) continue;
      if (name === "git") {
        const reason = judgeGit(args, dir);
        if (reason) return reason;
      }
      const text = [name, ...args].join(" ");
      if (patterns.some((pattern) => pattern.test(text))) return REASONS.merge();
    }
  }
  return null;
}

function main() {
  const input = readInput();
  if (input?.hook_event_name !== "PreToolUse" || typeof input.tool_input?.command !== "string") return 0;
  // Before the command is read: outside the installation's folders the guard refuses nothing (`hooks/place.mjs`).
  const at = placeOf(input);
  if (at.kind === "outside") return 0;
  const powershell = input.tool_name === "PowerShell";
  const reason = judge(input.tool_input.command, { cwd: input.cwd || ".", powershell });
  if (!reason) return 0;
  const why = at.kind === "unknown" ? ` It judged this folder as a project's, since ${at.reason}.` : "";
  process.stderr.write(`${reason}${why}\n`);
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main();
  } catch {
    // Never fail the session because of this hook.
  }
}
