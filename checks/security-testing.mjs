// The kit's own static security testing (`honsha:security-testing`): the scan for secrets over the branch's commits
// and the linters of its shell scripts and its workflow files, each a program that `checks/releases.mjs` pins. The
// kit's profile runs `--setup` in its `setup` and each other command in its `verify`; the security rules of its
// JavaScript are oxlint's, in `.oxlintrc.json`. The script is not part of the kit's interface: a project's `verify`
// cannot name the kit's folder.
//
// `--setup` installs each program for the host's platform under `node_modules/.cache/honsha-tools/`, once in each
// checkout, after `npm ci`, which empties that folder. The archive's digest is checked at the install, as npm checks a
// package's at its own, so the download is paid once in each checkout and not at each verification. A program with no
// archive pinned for the platform is named, and its command then fails on that host, which leaves it to the pipeline.
// Each other command runs one program, after asking it for its version, so that a program left from another pin fails:
//
// - `gitleaks` reads every commit from `HONSHA_BASE` to `HONSHA_HEAD`, where a pipeline sets them, and otherwise from
//   the default branch on the hosting service to `HEAD`; each merge by what it adds of its own beyond what git would
//   have merged, so that a merge of the default branch reports nothing of what other items brought, which their own
//   scans read. It reads git's attributes from no tree, so that a file of text marked binary in `.gitattributes` is
//   still read. Its findings are redacted; those whose fingerprints the checkout's `.gitleaksignore` lists are left
//   out, the file that the scan of the history reads on the default branch, and no allowance written inline is
//   honoured, as that scan honours none. Each other finding is printed by where it is, with its line masked, never by
//   its value: the pipeline's output is public.
// - `shellcheck` reads every shell script the repository tracks, known by its extension or its first line, with no rc
//   file, so that no file of the host changes its checks.
// - `actionlint` reads every workflow file, with the pinned ShellCheck on the scripts of its steps and no linter of
//   Python, which no step runs.
// - `zizmor` audits every workflow file offline, with `.github/zizmor.yml` as its configuration where it exists and
//   with none otherwise.
//
// Exit code 0 when the command finds nothing, 1 with a finding or on an error, 2 on a wrong usage.
//
//   node checks/security-testing.mjs --setup
//   node checks/security-testing.mjs gitleaks | shellcheck | actionlint | zizmor

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { IGNORE_FILE, environment, fingerprint, maskLine, parseReport, printable } from "./history-secrets.mjs";
import { readProfile } from "./profile.mjs";
import { ACTIONLINT, GITLEAKS, SHELLCHECK, ZIZMOR, archiveFor, install, programName } from "./releases.mjs";

/** @typedef {import("./releases.mjs").Release} Release */

/** The programs, by the name of their command. */
export const TOOLS = { gitleaks: GITLEAKS, shellcheck: SHELLCHECK, actionlint: ACTIONLINT, zizmor: ZIZMOR };

/** The arguments that make each program print its version. */
const VERSION_ARGS = {
  gitleaks: ["version"],
  shellcheck: ["--version"],
  actionlint: ["-version"],
  zizmor: ["--version"],
};

/** Where the setup installs the programs, from the checkout's root: a folder that git and the linters already skip. */
export const TOOLS_DIR = path.join("node_modules", ".cache", "honsha-tools");

/** The configuration of zizmor, read only where it exists. */
export const ZIZMOR_CONFIG = ".github/zizmor.yml";

/**
 * What `git log` is asked for, besides the range and `-p -U0`, which the scanner always gives. A merge is read by
 * git's remerge diff, what it holds beyond the merge that git would have made; text conversions and external diff
 * programs, which a user's git configuration can name, would change what the scanner reads.
 */
export const LOG_OPTIONS = [
  "--full-history",
  "--diff-filter=tuxdb",
  "--diff-merges=remerge",
  "--no-textconv",
  "--no-ext-diff",
];

/**
 * @typedef {{ status: number | null, stdout: string, stderr: string, error?: Error }} Result
 * @typedef {{ cwd: string, env?: NodeJS.ProcessEnv, input?: string }} ExecOptions
 * @typedef {(program: string, args: string[], options: ExecOptions) => Result} Exec
 * @typedef {{ release: Release, archive: import("./releases.mjs").Archive, platform: string }} InstallOptions
 * @typedef {(dir: string, options: InstallOptions) => Promise<string>} Installer
 * @typedef {{
 *   root: string,
 *   platform: string,
 *   arch: string,
 *   env: NodeJS.ProcessEnv,
 *   temporary: string,
 *   exec: Exec,
 *   out: (line: string) => void,
 *   err: (line: string) => void,
 * }} Context
 */

/** @type {Exec} */
const spawn = (program, args, { cwd, env = process.env, input }) => {
  const result = spawnSync(program, args, { cwd, env, input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error };
};

/**
 * Runs git and returns its output, or throws with its message.
 * @param {Context} context
 * @param {string[]} args
 * @param {string} [input]
 */
function git(context, args, input) {
  const result = context.exec("git", args, { cwd: context.root, env: environment(), input });
  if (result.error) throw new Error(`git ${args[0]} could not run: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim() || "no message"}`);
  return result.stdout;
}

/**
 * The folder of a program's install, and its path there.
 * @param {string} root
 * @param {Release} release
 * @param {string} platform
 */
export function installed(root, release, platform) {
  const dir = path.join(root, TOOLS_DIR, `${release.name}-${release.version}`);
  return { dir, program: path.join(dir, programName(release, platform)) };
}

/**
 * Installs every program that has an archive for the platform, each in a folder of its own that is emptied first, and
 * names the others. Returns the exit code.
 * @param {Context} context
 * @param {Installer} [installer]
 */
export async function setup(context, installer = install) {
  let code = 0;
  for (const release of Object.values(TOOLS)) {
    const archive = archiveFor(release, context.platform, context.arch);
    if (!archive) {
      const host = `${context.platform}-${context.arch}`;
      context.out(`${release.name} ${release.version} has no archive pinned for ${host}: its command cannot run here.`);
      continue;
    }
    const { dir, program } = installed(context.root, release, context.platform);
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
    const staging = path.join(dir, "staging");
    fs.mkdirSync(staging, { recursive: true });
    try {
      const extracted = await installer(staging, { release, archive, platform: context.platform });
      // In the same folder, so that the move keeps the mode that makes the program run.
      fs.renameSync(extracted, program);
      context.out(`${release.name} ${release.version}: installed from ${archive.file}, its SHA-256 the pinned one.`);
    } catch (error) {
      context.err(`${release.name} ${release.version}: ${error instanceof Error ? error.message : String(error)}`);
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
      code = 1;
    } finally {
      fs.rmSync(staging, { recursive: true, force: true, maxRetries: 5 });
    }
  }
  return code;
}

/**
 * The path of an installed program, once it says it is at the pinned version; or throws, saying why it cannot run.
 * @param {Context} context
 * @param {keyof typeof TOOLS} name
 */
export function ready(context, name) {
  const release = TOOLS[name];
  if (!archiveFor(release, context.platform, context.arch)) {
    const pinned = Object.keys(release.archives).join(", ");
    const host = `${context.platform}-${context.arch}`;
    throw new Error(
      `${release.name} ${release.version} is pinned for ${pinned}, not ${host}: this host cannot run it.`,
    );
  }
  const { program } = installed(context.root, release, context.platform);
  if (!fs.existsSync(program)) {
    throw new Error(`${release.name} ${release.version} is not installed: run \`node checks/verify.mjs --setup\`.`);
  }
  const result = context.exec(program, VERSION_ARGS[name], { cwd: context.root, env: environment() });
  if (result.error) throw new Error(`${release.name} could not run: ${result.error.message}`);
  if (!result.stdout.includes(release.version)) {
    throw new Error(`${release.name} says its version is ${result.stdout.trim()}, not the pinned ${release.version}.`);
  }
  return program;
}

/**
 * The paths that the repository tracks, with the mode git gives each: a link or a submodule is no file to read.
 * @param {Context} context
 */
function tracked(context) {
  return git(context, ["ls-files", "--stage", "-z"])
    .split("\0")
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf("\t");
      return { mode: line.slice(0, 6), file: line.slice(tab + 1) };
    })
    .filter((entry) => entry.mode === "100644" || entry.mode === "100755")
    .map((entry) => entry.file);
}

/** The shells that ShellCheck reads. */
const SHELLS = new Set(["sh", "bash", "dash", "ksh"]);

/** @param {string | undefined} word a program's path, or its name */
const name = (word) => word?.split("/").pop() ?? "";

/**
 * Whether a first line runs one of those shells, by its path, as `#!/bin/sh`, or through `env` after its flags and
 * variables, as `#!/usr/bin/env -S bash -e` or `#!/usr/bin/env -i PATH=/bin sh`.
 * @param {string} line
 */
export function runsShell(line) {
  if (!line.startsWith("#!")) return false;
  const words = line.slice(2).trim().split(/\s+/);
  let at = 0;
  if (name(words[0]) === "env") {
    at = 1;
    while (words[at]?.startsWith("-") || words[at]?.includes("=")) at += 1;
  }
  return SHELLS.has(name(words[at]));
}

/**
 * The shell scripts among the tracked files: by the extension `.sh` or `.bash`, or by a first line that runs a shell.
 * @param {Context} context
 */
export function shellScripts(context) {
  return tracked(context).filter((file) => {
    if (/\.(?:sh|bash)$/.test(file)) return true;
    const full = path.join(context.root, file);
    // A tracked file deleted from the working tree has no first line to read.
    if (!fs.existsSync(full)) return false;
    const fd = fs.openSync(full, "r");
    try {
      const head = Buffer.alloc(256);
      const read = fs.readSync(fd, head, 0, head.length, 0);
      return runsShell(head.subarray(0, read).toString("utf8").split(/\r?\n/)[0] ?? "");
    } finally {
      fs.closeSync(fd);
    }
  });
}

/**
 * The workflow files among the tracked files, which GitHub reads in `.github/workflows/` and not in a folder below it.
 * @param {Context} context
 */
export function workflowFiles(context) {
  return tracked(context).filter((file) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(file));
}

/**
 * Runs a linter and prints what it says. Returns the exit code.
 * @param {Context} context
 * @param {string} program
 * @param {string[]} args
 */
function lint(context, program, args) {
  const result = context.exec(program, args, { cwd: context.root, env: { ...environment(), NO_COLOR: "1" } });
  if (result.error) throw new Error(`${path.basename(program)} could not run: ${result.error.message}`);
  for (const line of result.stdout.split(/\r?\n/)) if (line) context.out(line);
  for (const line of result.stderr.split(/\r?\n/)) if (line) context.err(line);
  return result.status === 0 ? 0 : 1;
}

/** @param {Context} context */
export function shellcheck(context) {
  const files = shellScripts(context);
  if (files.length === 0) {
    context.out("The repository tracks no shell script.");
    return 0;
  }
  const code = lint(context, ready(context, "shellcheck"), ["--norc", "--color=never", "--", ...files]);
  if (code === 0) context.out(`ShellCheck ${SHELLCHECK.version} found nothing in ${files.length} scripts.`);
  return code;
}

/** @param {Context} context */
export function actionlint(context) {
  const files = workflowFiles(context);
  if (files.length === 0) {
    context.out("The repository tracks no workflow file.");
    return 0;
  }
  const linter = ready(context, "actionlint");
  const args = ["-no-color", `-shellcheck=${ready(context, "shellcheck")}`, "-pyflakes=", ...files];
  const code = lint(context, linter, args);
  if (code === 0) context.out(`actionlint ${ACTIONLINT.version} found nothing in ${files.length} workflow files.`);
  return code;
}

/** @param {Context} context */
export function zizmor(context) {
  const files = workflowFiles(context);
  if (files.length === 0) {
    context.out("The repository tracks no workflow file.");
    return 0;
  }
  const config = fs.existsSync(path.join(context.root, ZIZMOR_CONFIG)) ? ["--config", ZIZMOR_CONFIG] : ["--no-config"];
  const args = ["--offline", "--no-progress", "--color=never", ...config, "--", ...files];
  const code = lint(context, ready(context, "zizmor"), args);
  if (code === 0) context.out(`zizmor ${ZIZMOR.version} found nothing in ${files.length} workflow files.`);
  return code;
}

/**
 * The commits the scan reads: from `HONSHA_BASE` to `HONSHA_HEAD`, where a pipeline sets them, and otherwise from the
 * default branch on the hosting service, or the local one, to `HEAD`. Each end is resolved to its commit, so that no
 * value of the environment reaches the scanner as an option of git.
 * @param {Context} context
 * @param {string} defaultBranch
 */
export function range(context, defaultBranch) {
  /** @param {string} ref */
  const commit = (ref) => {
    try {
      return git(context, ["rev-parse", "--verify", "--quiet", "--end-of-options", `${ref}^{commit}`]).trim();
    } catch {
      return null;
    }
  };
  const headRef = context.env.HONSHA_HEAD || "HEAD";
  const baseRef =
    context.env.HONSHA_BASE || [`origin/${defaultBranch}`, defaultBranch].find((ref) => commit(ref)) || null;
  if (!baseRef) throw new Error(`The default branch \`${defaultBranch}\` was not found.`);
  const base = commit(baseRef);
  const head = commit(headRef);
  if (!base) throw new Error(`The range's base \`${baseRef}\` is no commit of this clone.`);
  if (!head) throw new Error(`The range's end \`${headRef}\` is no commit of this clone.`);
  return { base, head };
}

/**
 * The scanner's arguments: the range's commits with the options above, its built-in rules, findings redacted, a report
 * in JSON, no allowance written inline, and the script's own reading of the ignore file in place of the scanner's.
 *
 * The scanner reads the repository's git folder, not its working tree: in the folder it scans, it would take a
 * `.gitleaks.toml` for its rules and a `.gitleaksignore` for its ignore file, and a branch could commit either, whose
 * rules could allow everything.
 * @param {string} gitDir
 * @param {{ base: string, head: string }} commits
 * @param {string} report
 * @param {string} empty a folder that holds nothing, where the scanner would look for an ignore file
 */
export function gitleaksArgs(gitDir, { base, head }, report, empty) {
  return [
    "git",
    gitDir,
    `--log-opts=${base}..${head} ${LOG_OPTIONS.join(" ")}`,
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
 * The fingerprints that the checkout's ignore file lists: one a line, with `#` opening a line of comment.
 * @param {string} root
 */
export function readIgnored(root) {
  const file = path.join(root, IGNORE_FILE);
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  return new Set(lines.filter((line) => line !== "" && !line.startsWith("#")));
}

/**
 * Scans the branch's commits for secrets. Returns the exit code.
 * @param {Context} context
 * @param {string} defaultBranch
 */
export function gitleaks(context, defaultBranch) {
  const commits = range(context, defaultBranch);
  const count = Number(git(context, ["rev-list", "--count", `${commits.base}..${commits.head}`]).trim());
  const span = `from ${commits.base.slice(0, 12)} to ${commits.head.slice(0, 12)}`;
  if (count === 0) {
    context.out(`No commit ${span}: nothing to scan.`);
    return 0;
  }
  const program = ready(context, "gitleaks");
  const emptyTree = git(context, ["hash-object", "-t", "tree", "--stdin"], "").trim();
  const gitDir = git(context, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
  const dir = fs.mkdtempSync(path.join(context.temporary, "honsha-gitleaks-"));
  try {
    const empty = path.join(dir, "empty");
    fs.mkdirSync(empty);
    const report = path.join(dir, "report.json");
    const result = context.exec(program, gitleaksArgs(gitDir, commits, report, empty), {
      cwd: empty,
      env: { ...environment(), GIT_ATTR_SOURCE: emptyTree },
    });
    if (result.error) throw new Error(`gitleaks could not run: ${result.error.message}`);
    // gitleaks exits 0, with an empty report, when the `git log` it runs fails: at the log level it is given, an error
    // is the only thing it writes, so any line it writes fails the scan.
    if (result.status !== 0 || result.stderr.trim() !== "") {
      throw new Error(`gitleaks failed: ${result.stderr.trim() || `exit code ${result.status}`}`);
    }
    const found = parseReport(fs.readFileSync(report, "utf8"));
    const ignored = readIgnored(context.root);
    const findings = found.filter((finding) => !ignored.has(fingerprint(finding)));
    context.out(`gitleaks ${GITLEAKS.version} read ${count} commits ${span}.`);
    context.out(
      `${findings.length} findings; ${found.length - findings.length} left out, as ${IGNORE_FILE} lists them.`,
    );
    for (const finding of findings) {
      let line = null;
      try {
        line = git(context, ["show", `${finding.commit}:${finding.file}`]).split(/\r?\n/)[finding.line - 1] ?? null;
      } catch {
        line = null;
      }
      context.out("");
      context.out(printable(`${finding.rule} in ${finding.file}, line ${finding.line}, commit ${finding.commit}`));
      context.out(printable(`  fingerprint: ${fingerprint(finding)}`));
      context.out(`  line: ${line === null ? "(it could not be read)" : printable(maskLine(line, finding))}`);
    }
    return findings.length > 0 ? 1 : 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
  }
}

/** @type {Record<string, (context: Context, defaultBranch: string) => number>} */
const COMMANDS = { gitleaks, shellcheck, actionlint, zizmor };

/**
 * Runs one command, and returns the exit code.
 * @param {string[]} args
 * @param {Partial<Context>} [options]
 */
export async function main(args, options = {}) {
  /** @type {Context} */
  const context = {
    root: process.cwd(),
    platform: process.platform,
    arch: process.arch,
    env: process.env,
    temporary: os.tmpdir(),
    exec: spawn,
    out: console.log,
    err: console.error,
    ...options,
  };
  const [command, ...rest] = args;
  if (rest.length > 0 || !(command === "--setup" || Object.hasOwn(COMMANDS, command ?? ""))) {
    context.err(`Usage: node checks/security-testing.mjs --setup | ${Object.keys(COMMANDS).join(" | ")}`);
    return 2;
  }
  try {
    if (command === "--setup") return await setup(context);
    const profile = readProfile(path.join(context.root, ".hub/profile.yml"));
    return COMMANDS[command](context, profile?.defaultBranch ?? "main");
  } catch (error) {
    context.err(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main(process.argv.slice(2));
}
