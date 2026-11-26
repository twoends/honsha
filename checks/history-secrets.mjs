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
// The scanner is gitleaks, at the version that `checks/releases.mjs` pins, with its built-in rules. The script
// downloads the archive for the host's platform and refuses to extract or run it unless its SHA-256 is the pinned one,
// so that a release replaced after the pin fails. It runs the scanner on every commit of every ref, and on each merge
// against its first parent, which a plain `git log -p` leaves out, so that what a merge adds of its own is read. The
// findings are redacted, and the scanner reads no configuration and no ignore file: the script reads the default
// branch's. It honours no allowance written inline in the history either, since no review has read one there. The
// scanner sends nothing out. A line that it writes on its error output fails the scan, though it exits 0: it does so,
// with an empty report, when the `git log` it runs fails.
//
// It leaves out the findings whose fingerprints `.gitleaksignore` lists on the default branch, where an item under the
// security review put them, and prints the others by commit: once for each commit, whether the default branch holds it
// and the refs that reach it, which tell a branch or a tag from a ref such as a pull request's, which someone outside
// the project can add; under it, each of its findings by rule, file and line, with its fingerprint and its line read
// from the mirror, with the value found and every run of characters that could be a value masked. It never prints a
// value, a commit's author or the remote's address, which can hold a credential, nor a control character of the
// history: what it prints reaches a session's transcript, which leaves the host.
//
// The scan of a branch's commits, `checks/security-testing.mjs gitleaks`, runs the scanner with the functions here:
// its arguments, its run, its ignore list and a finding's lines, so that both scans keep the same guards.
//
// Everything it downloads or makes is in a temporary folder outside the clone, deleted when it ends, on an error too:
// it changes nothing in the clone and installs nothing. Exit code 0 when it finds nothing, 1 with findings, and 2 on an
// error or on a platform with no pinned archive.
//
//   node checks/history-secrets.mjs

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { GITLEAKS as SCANNER, archiveFor, checkVersion, install, spawn } from "./releases.mjs";

/**
 * @typedef {import("./releases.mjs").Exec} Exec
 * @typedef {import("./releases.mjs").ExecOptions} ExecOptions
 */

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
 * A text with its control, format and line-separating characters written as escapes: a path, a ref or a line that the
 * history holds could otherwise drive the terminal, add lines to the report or hide part of it.
 * @param {string} text
 */
export const printable = (text) =>
  text.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, (char) => `\\u{${(char.codePointAt(0) ?? 0).toString(16)}}`);

/**
 * The lines of a program's output that hold something, each printable: what a linter, git or the scanner writes can
 * quote what a file or the history holds.
 * @param {string} text
 */
export const printableLines = (text) =>
  text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map(printable);

/**
 * What a program wrote on its error output, line by line, printable and with the credential of any address hidden.
 * @param {string} text
 */
export const errorText = (text) => printableLines(anonymous(text)).join("\n");

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
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${errorText(result.stderr) || "no message"}`);
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
 * The fingerprints that the text of an ignore file lists: one a line, with `#` opening a line of comment, as the
 * scanner reads it.
 * @param {string} text
 */
export function ignoreList(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  return new Set(lines.filter((line) => line !== "" && !line.startsWith("#")));
}

/**
 * The fingerprints that the ignore file lists on the default branch.
 * @param {string} mirror
 * @param {string | null} branch
 */
export function readIgnored(mirror, branch) {
  return ignoreList((branch ? attempt(mirror, ["show", `${branch}:${IGNORE_FILE}`]) : null) ?? "");
}

/**
 * The scanner's arguments: its built-in rules, the history that a git folder holds, findings redacted, a report in
 * JSON, no allowance written inline, and the script's decisions in place of the scanner's own, whatever the status a
 * finding would give.
 *
 * The scanner reads a git folder, the mirror or a checkout's, and not a working tree: in the folder it scans, it would
 * take a `.gitleaks.toml` for its rules and a `.gitleaksignore` for its ignore file, and a branch could commit either,
 * whose rules could allow everything.
 * @param {string} gitDir
 * @param {string[]} logOptions what `git log` is asked for, besides `-p -U0`, which the scanner always gives
 * @param {string} report
 * @param {string} empty a folder that holds nothing, where the scanner would look for an ignore file
 */
export function scannerArgs(gitDir, logOptions, report, empty) {
  return [
    "git",
    gitDir,
    `--log-opts=${logOptions.join(" ")}`,
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
 * Runs the scanner, and throws unless it ran clean: on an error of its start, an exit code other than 0, or any line on
 * its error output. gitleaks exits 0, with an empty report, when the `git log` it runs fails; at the log level its
 * arguments give, an error is the only thing it writes, so a line there is a failed scan, not one that found nothing.
 * @param {string} program
 * @param {string[]} args
 * @param {ExecOptions} options
 * @param {Exec} exec
 */
export function runScanner(program, args, options, exec) {
  const result = exec(program, args, options);
  if (result.error) throw new Error(`${SCANNER.name} could not run: ${result.error.message}`);
  const message = errorText(result.stderr);
  if (result.status !== 0 || message !== "") {
    throw new Error(`${SCANNER.name} failed: ${message || `exit code ${result.status}`}`);
  }
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
  // oxlint-disable-next-line security/detect-non-literal-regexp -- a sticky copy of the constant `RUN`
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
 * The lines that report one finding: where it is, its fingerprint, and its line, masked.
 * @param {Finding} finding
 * @param {string | null} line the line as the commit holds it, or null when it cannot be read
 */
export function findingLines(finding, line) {
  return [
    printable(`${finding.rule} in ${finding.file}, line ${finding.line}`),
    printable(`  fingerprint: ${fingerprint(finding)}`),
    `  line: ${line === null ? "(it could not be read)" : printable(maskLine(line, finding))}`,
  ];
}

/**
 * The lines that report a commit's findings: the commit, whether the default branch holds it and the refs that reach
 * it, once however many findings it has, since those refs are all named; then each of its findings.
 * @param {string} mirror
 * @param {string} commit
 * @param {Finding[]} findings
 * @param {Set<string>} onDefault
 */
export function commitLines(mirror, commit, findings, onDefault) {
  return [
    printable(`commit ${commit}`),
    `  on the default branch: ${onDefault.has(commit) ? "yes" : "no"}`,
    printable(`  reached by: ${reachedBy(mirror, commit)}`),
    ...findings.flatMap((finding) => findingLines(finding, lineOf(mirror, finding)).map((line) => `  ${line}`)),
  ];
}

/**
 * How the scanner is installed and run, which a test replaces.
 * @typedef {{
 *   install: (dir: string, archive: import("./releases.mjs").Archive, platform: string) => Promise<string>,
 *   exec: Exec,
 * }} Scanner
 */

/** @type {Scanner} */
export const gitleaks = {
  install: (dir, archive, platform) => install(dir, { release: SCANNER, archive, platform }),
  exec: spawn,
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
  const archive = archiveFor(SCANNER, platform, arch);
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
    checkVersion(SCANNER, program, scanner.exec, { cwd: dir, env: environment() });
    const mirror = makeMirror(clone, dir);
    const history = readHistory(mirror);
    const empty = path.join(dir, "empty");
    fs.mkdirSync(empty);
    const report = path.join(dir, "report.json");
    const args = scannerArgs(mirror, LOG_OPTIONS, report, empty);
    runScanner(program, args, { cwd: empty, env: environment() }, scanner.exec);
    const ignored = readIgnored(mirror, history.branch);
    const found = parseReport(fs.readFileSync(report, "utf8"));
    const findings = found.filter((finding) => !ignored.has(fingerprint(finding)));

    out(
      `${SCANNER.name} ${SCANNER.version} read ${history.refs} refs and ${history.commits} commits of the clone's remote.`,
    );
    const left = found.length - findings.length;
    const branch = history.branch?.replace(/^refs\/heads\//, "") ?? "no default branch";
    out(`${findings.length} findings; ${left} left out, as ${IGNORE_FILE} on ${branch} lists them.`);
    for (const [commit, ofCommit] of Map.groupBy(findings, (finding) => finding.commit)) {
      out("");
      for (const line of commitLines(mirror, commit, ofCommit, history.onDefault)) out(line);
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
