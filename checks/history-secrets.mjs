// Scans for secrets every commit of every ref that a repository's hosting service serves; its command is in the kit's
// interface (interface, Commands). A session runs it in a clone of the repository, at an assessment and at the periodic
// review (`honsha:security-testing`, The history).
//
// A scan in `verify` reads one branch. This one reads the history that anyone who can read the repository can fetch:
// branches, tags, and the refs a service keeps beside them, such as those of pull requests, which keep the commits of a
// branch after it is deleted. So it makes a mirror clone of the remote the clone fetches from, `origin` or the only
// remote, borrowing the clone's objects so that only what the clone lacks is fetched; the clone's own refs, which a
// fetch with pruning would change, are not touched.
//
// The scanner is gitleaks, at the version pinned below with its built-in rules. The script downloads the archive for
// the host's platform and refuses to extract or run it unless its SHA-256 is the pinned one, so that a release replaced
// after the pin fails. It runs the scanner on every commit of every ref, and on each merge against its first parent,
// which a plain `git log -p` leaves out, so that what a merge adds of its own is read. The findings are redacted, and
// the scanner reads no configuration and no ignore file: the script reads the default branch's. It honours no
// allowance written inline in the history either, since no review has read one there. The scanner sends nothing out.
//
// It leaves out the findings whose fingerprints `.gitleaksignore` lists on the default branch, where an item under the
// security review put them, and prints each other one by commit, file, line and rule, with its fingerprint, whether the
// default branch holds its commit, the refs that reach it, which tell a branch or a tag from a ref such as a pull
// request's, which someone outside the project can add, and its line read from the mirror, with the value found and
// every run of characters that could be a value masked. It never prints a value, a commit's author or the remote's
// address, which can hold a credential, nor a control character of the history: what it prints reaches a session's
// transcript, which leaves the host.
//
// Everything it downloads or makes is in a temporary folder outside the clone, deleted when it ends, on an error too:
// it changes nothing in the clone and installs nothing. Exit code 0 when it finds nothing, 1 with findings, and 2 on an
// error or on a platform with no pinned archive.
//
//   node checks/history-secrets.mjs

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * The scanner, pinned as `honsha:dependencies` says: a version released at least 7 days before it was taken, and the
 * SHA-256 of each archive the kit's hosts run, from the release's checksums file, which matches the digests that the
 * release lists. A new version is a work item of the kit.
 */
export const SCANNER = {
  name: "gitleaks",
  version: "8.30.1",
  /** @type {Record<string, { file: string, sha256: string }>} by `<platform>-<arch>`, as Node.js names them */
  archives: {
    "darwin-arm64": {
      file: "gitleaks_8.30.1_darwin_arm64.tar.gz",
      sha256: "b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5",
    },
    "darwin-x64": {
      file: "gitleaks_8.30.1_darwin_x64.tar.gz",
      sha256: "dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709",
    },
    "linux-arm64": {
      file: "gitleaks_8.30.1_linux_arm64.tar.gz",
      sha256: "e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080",
    },
    "linux-x64": {
      file: "gitleaks_8.30.1_linux_x64.tar.gz",
      sha256: "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb",
    },
    "win32-arm64": {
      file: "gitleaks_8.30.1_windows_arm64.zip",
      sha256: "b95f5e4f5c425cedca7ee203d9afd29597e692c4924a12ed42f970537c72cc0f",
    },
    "win32-x64": {
      file: "gitleaks_8.30.1_windows_x64.zip",
      sha256: "d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e",
    },
  },
};

const RELEASE = `https://github.com/gitleaks/gitleaks/releases/download/v${SCANNER.version}/`;

/** The scanner's ignore file, read on the default branch. */
export const IGNORE_FILE = ".gitleaksignore";

/**
 * What the scanner asks `git log` for, besides `-p -U0`, which it always gives. `--all` takes every ref of the mirror.
 * A merge is read against its first parent, so that what it adds of its own, as in resolving a conflict, is read; the
 * findings of the branch it brings are then reported again under it. `--diff-merges=remerge` would show the merge's own
 * part alone, but the scanner names a file of a conflict it shows `b/<path>`, which no commit holds. Text conversions
 * and external diff programs, which a user's git configuration can name, would change what the scanner reads.
 */
export const LOG_OPTIONS = [
  "--all",
  "--full-history",
  "--diff-filter=tuxdb",
  "--diff-merges=first-parent",
  "--no-textconv",
  "--no-ext-diff",
];

/** Variables that would point git at another repository than the one each command names. */
const GIT_LOCATION = [
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_NAMESPACE",
];

/**
 * The environment of git and of the scanner: no other repository, no configuration of the scanner's own, and no
 * replacement of a commit by another, which the refs `refs/replace/` would make and the mirror takes: the scanner reads
 * each commit as it is.
 */
export function environment() {
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (GIT_LOCATION.includes(name) || name.startsWith("GITLEAKS_")) delete env[name];
  }
  env.GIT_NO_REPLACE_OBJECTS = "1";
  return env;
}

/** Hides the credential that an address may hold, as in `https://user:token@host/…`. */
const anonymous = (/** @type {string} */ text) => text.replace(/:\/\/[^/\s@]+@/g, "://***@");

/**
 * Runs git, and throws with its message alone: the command line, which an error of Node.js would quote, holds the
 * remote's address.
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  const result = spawnSync("git", ["-C", dir, ...args], {
    encoding: "utf8",
    env: environment(),
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw new Error(`git ${args[0]} could not run: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${anonymous(result.stderr.trim()) || "no message"}`);
  return result.stdout;
}

/**
 * @param {string} dir
 * @param {string[]} args
 */
function attempt(dir, args) {
  try {
    return git(dir, args);
  } catch {
    return null;
  }
}

/**
 * The pinned archive for a platform, or nothing for one the pin does not cover.
 * @param {string} platform
 * @param {string} arch
 */
export function archiveFor(platform, arch) {
  return Object.hasOwn(SCANNER.archives, `${platform}-${arch}`) ? SCANNER.archives[`${platform}-${arch}`] : undefined;
}

/**
 * The system's `tar`. Git for Windows puts ahead of Windows's own on the path a GNU tar that reads no zip archive, the
 * form of the scanner's Windows release, so on Windows it is called by its path.
 * @param {string} platform
 * @param {NodeJS.ProcessEnv} [env]
 */
export function tarProgram(platform, env = process.env) {
  return platform === "win32" ? path.join(env.SystemRoot ?? env.windir ?? "C:\\Windows", "System32", "tar.exe") : "tar";
}

/** @param {string} url */
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The download of ${url} failed: ${response.status} ${response.statusText}.`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Extracts one file of an archive, the program alone, so that no other entry of the archive is written.
 * @param {string} archive
 * @param {string} dir
 * @param {string} member
 * @param {string} platform
 */
function extract(archive, dir, member, platform) {
  const result = spawnSync(tarProgram(platform), ["-xf", archive, "-C", dir, member], { encoding: "utf8" });
  if (result.error) throw new Error(`tar could not run: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`tar failed on ${path.basename(archive)}: ${result.stderr.trim()}`);
}

/**
 * Downloads an archive of the scanner into a folder, checks its SHA-256, and extracts the program from it only if the
 * digest is the pinned one. Returns the program's path.
 * @param {string} dir
 * @param {{
 *   archive: { file: string, sha256: string },
 *   platform: string,
 *   fetchBytes?: (url: string) => Promise<Buffer>,
 *   unpack?: (archive: string, dir: string, member: string, platform: string) => void,
 * }} options
 */
export async function install(dir, { archive, platform, fetchBytes = download, unpack = extract }) {
  const bytes = await fetchBytes(RELEASE + archive.file);
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  if (digest !== archive.sha256) {
    throw new Error(
      `${archive.file} has the SHA-256 ${digest}, not the pinned ${archive.sha256}: it is neither extracted nor run.`,
    );
  }
  const file = path.join(dir, archive.file);
  fs.writeFileSync(file, bytes);
  const member = platform === "win32" ? `${SCANNER.name}.exe` : SCANNER.name;
  unpack(file, dir, member, platform);
  const program = path.join(dir, member);
  if (!fs.existsSync(program)) throw new Error(`${archive.file} holds no ${member}.`);
  return program;
}

/**
 * The remote that the clone fetches from: `origin`, or the only remote it has.
 * @param {string} clone
 */
function remoteOf(clone) {
  const remotes = git(clone, ["remote"]).split(/\r?\n/).filter(Boolean);
  if (remotes.includes("origin")) return "origin";
  if (remotes.length === 1) return remotes[0];
  if (remotes.length === 0)
    throw new Error("The clone has no remote: the history its hosting service serves is unknown.");
  throw new Error(`The clone has no remote named origin, and ${remotes.length} others: ${remotes.join(", ")}.`);
}

/**
 * Makes in `dir` a mirror clone of the clone's remote, which holds every ref the remote serves. It borrows the clone's
 * objects, unless the clone is shallow or partial and lacks some of them.
 *
 * The repository's own attributes could mark a file of text `binary` or `-diff`, and `git log -p` would then give no
 * patch for it: the mirror's `info/attributes`, which take precedence, leave `diff` unspecified for every file with
 * `!diff`, so that git tells text from binary by the content alone. `-diff`, which unsets it, would hide every patch.
 * @param {string} clone the clone's top folder, or its git folder when it is bare
 * @param {string} dir
 */
export function makeMirror(clone, dir) {
  const url = git(clone, ["remote", "get-url", remoteOf(clone)]).trim();
  const shallow = git(clone, ["rev-parse", "--is-shallow-repository"]).trim() === "true";
  const partial = Boolean(attempt(clone, ["config", "--get", "extensions.partialclone"])?.trim());
  const objects = git(clone, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
  const borrow = shallow || partial ? [] : ["--reference", objects];
  const mirror = path.join(dir, "mirror.git");
  // From the clone's folder, as git itself reads a remote given as a relative path; after `--`, so that no address is
  // read as an option.
  git(clone, ["clone", "--mirror", "--quiet", ...borrow, "--", url, mirror]);
  fs.mkdirSync(path.join(mirror, "info"), { recursive: true });
  fs.writeFileSync(path.join(mirror, "info", "attributes"), "* !diff\n");
  return mirror;
}

/**
 * The refs that reach a commit: its branches and tags, at most five named, or, when none reaches it, every other ref
 * that does, such as those a service keeps for pull requests, which someone outside the project can add. All of those
 * are named, since whether each is a stranger's decides what the finding does.
 * @param {string} mirror
 * @param {string} commit
 */
export function reachedBy(mirror, commit) {
  const refs = git(mirror, ["for-each-ref", "--contains", commit, "--format=%(refname)"])
    .split(/\r?\n/)
    .filter(Boolean);
  const own = refs.filter((ref) => ref.startsWith("refs/heads/") || ref.startsWith("refs/tags/"));
  if (own.length === 0) return `no branch or tag, only ${refs.join(", ")}`;
  return own.slice(0, 5).join(", ") + (own.length > 5 ? `, and ${own.length - 5} more` : "");
}

/**
 * What the mirror holds: its default branch, the number of its refs and of the commits they reach, and the commits the
 * default branch holds.
 * @param {string} mirror
 */
export function readHistory(mirror) {
  const head = attempt(mirror, ["symbolic-ref", "-q", "HEAD"])?.trim() ?? "";
  const refs = git(mirror, ["for-each-ref", "--format=%(refname)"]).split(/\r?\n/).filter(Boolean);
  const branch = head && refs.includes(head) ? head : null;
  const commits = refs.length > 0 ? Number(git(mirror, ["rev-list", "--all", "--count"]).trim()) : 0;
  const onDefault = new Set(branch ? git(mirror, ["rev-list", branch]).split(/\r?\n/).filter(Boolean) : []);
  return { branch, refs: refs.length, commits, onDefault };
}

/**
 * The fingerprints that the ignore file lists on the default branch: one a line, with `#` opening a line of comment, as
 * the scanner reads it.
 * @param {string} mirror
 * @param {string | null} branch
 */
export function readIgnored(mirror, branch) {
  const text = branch ? attempt(mirror, ["show", `${branch}:${IGNORE_FILE}`]) : null;
  const lines = (text ?? "").split(/\r?\n/).map((line) => line.trim());
  return new Set(lines.filter((line) => line !== "" && !line.startsWith("#")));
}

/**
 * The scanner's arguments: its built-in rules, the history of the mirror, findings redacted, a report in JSON, and the
 * script's decisions in place of the scanner's own, whatever the status a finding would give.
 * @param {string} mirror
 * @param {string} report
 * @param {string} empty a folder that holds nothing, where the scanner would look for an ignore file
 */
export function scannerArgs(mirror, report, empty) {
  return [
    "git",
    mirror,
    `--log-opts=${LOG_OPTIONS.join(" ")}`,
    "--redact=100",
    "--ignore-gitleaks-allow",
    `--gitleaks-ignore-path=${empty}`,
    "--report-format=json",
    `--report-path=${report}`,
    "--exit-code=0",
    "--no-banner",
    "--no-color",
    "--log-level=error",
  ];
}

/**
 * @typedef {{ commit: string, file: string, line: number, rule: string, match: string, secret: string }} Finding
 */

/**
 * The findings of a report, with the fields the script reads and no other: the author and the commit's message stay in
 * the report, which the script deletes.
 * @param {string} text
 * @returns {Finding[]}
 */
export function parseReport(text) {
  const report = JSON.parse(text || "[]");
  if (!Array.isArray(report)) throw new Error("The scanner's report is not a list of findings.");
  return report.map((entry) => {
    const finding = {
      commit: String(entry.Commit ?? ""),
      file: String(entry.File ?? ""),
      line: Number(entry.StartLine),
      rule: String(entry.RuleID ?? ""),
      match: String(entry.Match ?? ""),
      secret: String(entry.Secret ?? ""),
    };
    if (
      !/^[0-9a-f]{40,64}$/.test(finding.commit) ||
      !Number.isInteger(finding.line) ||
      !finding.file ||
      !finding.rule
    ) {
      throw new Error("The scanner's report holds a finding without a commit, a file, a line or a rule.");
    }
    return finding;
  });
}

/** @param {Finding} finding */
export const fingerprint = (finding) => `${finding.commit}:${finding.file}:${finding.rule}:${finding.line}`;

/** A run of the characters that names and encoded values are made of. */
const RUN = /[A-Za-z0-9+/=_.~-]+/g;
const WORD = /^[A-Za-z]{1,20}$/;
const REDACTED = "REDACTED";
const LONGEST = 300;

/** @param {string} word */
const changesOfCase = (word) =>
  [...word].filter((char, index) => index > 0 && char < "a" !== word[index - 1] < "a").length;

/**
 * Whether a run reads as a name, `api_key`, `credentialId` or `Content-Type`, and not as a value: letters only, in
 * words of at most 20 letters joined by `_`, `-` or `.`, with at most four changes of case, at most 40 characters in
 * all. A digit or a character of an encoding, `+`, `/`, `=` or `~`, makes a value, and so do the many changes of case
 * of a random string.
 * @param {string} run
 */
export function isName(run) {
  if (run.length > 40) return false;
  const words = run.split(/[_.-]/).filter(Boolean);
  return words.every((word) => WORD.test(word)) && words.reduce((sum, word) => sum + changesOfCase(word), 0) <= 4;
}

/**
 * The parts of a run, split at each `=` that more of the run follows, as in `KEY=value`, with their places in the
 * line. The padding that ends an encoded value, `==`, splits nothing.
 * @param {string} run
 * @param {number} offset
 * @returns {Array<[string, number]>}
 */
function parts(run, offset) {
  /** @type {Array<[string, number]>} */
  const found = [];
  let start = 0;
  for (let index = 0; index < run.length - 1; index++) {
    if (run[index] === "=" && run[index + 1] !== "=") {
      found.push([run.slice(start, index), offset + start]);
      start = index + 1;
    }
  }
  found.push([run.slice(start), offset + start]);
  return found;
}

/**
 * Where the value that the scanner found lies in the line: after what precedes it in the redacted match, up to what
 * follows it there, or to the end of its run when nothing does. Null when the line does not show the match.
 * @param {string} line
 * @param {Finding} finding
 * @returns {Array<[number, number]> | null}
 */
function valueSpans(line, finding) {
  if (finding.secret && finding.secret !== REDACTED) {
    // A report that is not redacted: every place the value stands.
    const spans = [];
    for (let at = line.indexOf(finding.secret); at >= 0; at = line.indexOf(finding.secret, at + 1)) {
      spans.push(/** @type {[number, number]} */ ([at, at + finding.secret.length]));
    }
    return spans.length > 0 ? spans : null;
  }
  const cut = finding.match.indexOf(REDACTED);
  if (cut < 0) return null;
  const before = finding.match.slice(0, cut).split(/\r?\n/).at(-1) ?? "";
  const after = finding.match.slice(cut + REDACTED.length).split(/\r?\n/)[0] ?? "";
  // The whole match is the value: its form, a digit or a long run, is what the runs that are not names catch.
  if (!before && !after) return [];
  // Nothing precedes it: everything up to what follows it.
  if (!before) {
    const end = line.indexOf(after);
    return end > 0 ? [[0, end]] : null;
  }
  // Every place that what precedes it stands, since the line can hold it more than once, as an empty value first.
  const run = new RegExp(RUN.source, "y");
  /** @type {Array<[number, number]>} */
  const spans = [];
  for (let at = line.indexOf(before); at >= 0; at = line.indexOf(before, at + 1)) {
    const start = at + before.length;
    let end = -1;
    if (after) end = line.indexOf(after, start);
    else {
      run.lastIndex = start;
      const found = run.exec(line);
      if (found) end = start + found[0].length;
    }
    if (end > start) spans.push([start, end]);
  }
  return spans.length > 0 ? spans : null;
}

/**
 * The line with the value found and every run that is not a name masked, cut at 300 characters; a run with no letter
 * and no digit, such as `//`, holds no value and stays. Where the line does not show the match, every run of four
 * characters or more is masked too.
 * @param {string} line
 * @param {Finding} finding
 */
export function maskLine(line, finding) {
  const masked = Array.from({ length: line.length }, () => false);
  /** @param {number} start @param {number} end */
  const hide = (start, end) => masked.fill(true, start, end);
  const spans = valueSpans(line, finding);
  for (const [start, end] of spans ?? []) hide(start, end);
  for (const run of line.matchAll(RUN)) {
    for (const [part, at] of parts(run[0], run.index)) {
      if (!/[A-Za-z0-9]/.test(part)) continue;
      if (!isName(part) || (spans === null && part.length >= 4)) hide(at, at + part.length);
    }
  }
  const text = line
    .split("")
    .map((char, index) => (masked[index] ? "*" : char))
    .join("");
  return text.length > LONGEST ? `${text.slice(0, LONGEST)}…` : text;
}

/**
 * The line of a finding as the commit holds it, or null when it cannot be read.
 * @param {string} mirror
 * @param {Finding} finding
 */
function lineOf(mirror, finding) {
  const text = attempt(mirror, ["show", `${finding.commit}:${finding.file}`]);
  return text?.split(/\r?\n/)[finding.line - 1] ?? null;
}

/**
 * A text with its control, format and line-separating characters written as escapes: a path, a ref or a line that the
 * history holds could otherwise drive the terminal, add lines to the report or hide part of it.
 * @param {string} text
 */
export const printable = (text) =>
  text.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, (char) => `\\u{${(char.codePointAt(0) ?? 0).toString(16)}}`);

/**
 * The lines that report one finding.
 * @param {string} mirror
 * @param {Finding} finding
 * @param {Set<string>} onDefault
 * @param {Map<string, string>} [reached] the refs that reach each commit already read: many findings can share one
 */
export function describe(mirror, finding, onDefault, reached = new Map()) {
  const line = lineOf(mirror, finding);
  if (!reached.has(finding.commit)) reached.set(finding.commit, reachedBy(mirror, finding.commit));
  return [
    printable(`${finding.rule} in ${finding.file}, line ${finding.line}, commit ${finding.commit}`),
    printable(`  fingerprint: ${fingerprint(finding)}`),
    `  on the default branch: ${onDefault.has(finding.commit) ? "yes" : "no"}`,
    printable(`  reached by: ${reached.get(finding.commit)}`),
    `  line: ${line === null ? "(it could not be read)" : printable(maskLine(line, finding))}`,
  ];
}

/**
 * The scanner's three actions, which a test replaces.
 * @typedef {{
 *   install: (dir: string, archive: { file: string, sha256: string }, platform: string) => Promise<string>,
 *   version: (program: string) => string,
 *   run: (program: string, args: string[], cwd: string) => void,
 * }} Scanner
 */

/** @type {Scanner} */
export const gitleaks = {
  install: (dir, archive, platform) => install(dir, { archive, platform }),
  version: (program) => {
    const result = spawnSync(program, ["version"], { encoding: "utf8", env: environment() });
    if (result.error) throw new Error(`${SCANNER.name} could not run: ${result.error.message}`);
    return result.stdout.trim();
  },
  run: (program, args, cwd) => {
    const result = spawnSync(program, args, { cwd, encoding: "utf8", env: environment(), maxBuffer: 64 * 1024 * 1024 });
    if (result.error) throw new Error(`${SCANNER.name} could not run: ${result.error.message}`);
    if (result.status !== 0)
      throw new Error(`${SCANNER.name} failed: ${anonymous(result.stderr.trim()) || "no message"}`);
  },
};

/**
 * Whether a path lies inside a folder, or is it.
 * @param {string} inner
 * @param {string} outer
 */
function within(inner, outer) {
  const relative = path.relative(path.resolve(outer), path.resolve(inner));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/**
 * Scans the history of the repository whose clone holds `cwd`, and returns the exit code.
 * @param {{
 *   cwd?: string,
 *   platform?: string,
 *   arch?: string,
 *   temporary?: string,
 *   scanner?: Scanner,
 *   out?: (line: string) => void,
 *   err?: (line: string) => void,
 * }} [options]
 */
export async function scan({
  cwd = process.cwd(),
  platform = process.platform,
  arch = process.arch,
  temporary = os.tmpdir(),
  scanner = gitleaks,
  out = console.log,
  err = console.error,
} = {}) {
  const archive = archiveFor(platform, arch);
  if (!archive) {
    err(
      `${SCANNER.name} ${SCANNER.version} is pinned for ${Object.keys(SCANNER.archives).join(", ")}, not ${platform}-${arch}.`,
    );
    return 2;
  }
  let dir = null;
  try {
    if (attempt(cwd, ["rev-parse", "--git-dir"]) === null) throw new Error(`${cwd} is not in a git repository.`);
    const clone = (
      attempt(cwd, ["rev-parse", "--show-toplevel"]) ?? git(cwd, ["rev-parse", "--absolute-git-dir"])
    ).trim();
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    dir = fs.mkdtempSync(path.join(temporary, "honsha-history-"));
    if (within(dir, clone) || within(dir, common)) throw new Error(`The temporary folder ${dir} is inside the clone.`);

    const program = await scanner.install(dir, archive, platform);
    const version = scanner.version(program);
    if (!version.includes(SCANNER.version)) {
      throw new Error(`${SCANNER.name} says its version is ${version}, not the pinned ${SCANNER.version}.`);
    }
    const mirror = makeMirror(clone, dir);
    const history = readHistory(mirror);
    const empty = path.join(dir, "empty");
    fs.mkdirSync(empty);
    const report = path.join(dir, "report.json");
    scanner.run(program, scannerArgs(mirror, report, empty), empty);
    const ignored = readIgnored(mirror, history.branch);
    const found = parseReport(fs.readFileSync(report, "utf8"));
    const findings = found.filter((finding) => !ignored.has(fingerprint(finding)));

    out(
      `${SCANNER.name} ${SCANNER.version} read ${history.refs} refs and ${history.commits} commits of the clone's remote.`,
    );
    const left = found.length - findings.length;
    const branch = history.branch?.replace(/^refs\/heads\//, "") ?? "no default branch";
    out(`${findings.length} findings; ${left} left out, as ${IGNORE_FILE} on ${branch} lists them.`);
    const reached = new Map();
    for (const finding of findings) {
      out("");
      for (const line of describe(mirror, finding, history.onDefault, reached)) out(line);
    }
    return findings.length > 0 ? 1 : 0;
  } catch (error) {
    err(error instanceof Error ? error.message : String(error));
    return 2;
  } finally {
    if (dir) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  if (process.argv.length > 2) {
    console.error("Usage: node checks/history-secrets.mjs");
    process.exitCode = 2;
  } else {
    process.exitCode = await scan();
  }
}
