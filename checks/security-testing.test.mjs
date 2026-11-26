import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import { ACTIONLINT, GITLEAKS, SHELLCHECK, ZIZMOR } from "./releases.mjs";
import {
  LOG_OPTIONS,
  TOOLS,
  ZIZMOR_CONFIG,
  actionlint,
  gitleaks,
  installed,
  main,
  range,
  ready,
  setup,
  workflowFiles,
  zizmor,
} from "./security-testing.mjs";

// The fixture commits with the identity git finds, which a machine that runs the tests may not have.
Object.assign(process.env, {
  GIT_AUTHOR_NAME: "Jane Roe",
  GIT_AUTHOR_EMAIL: "jane.roe@example.org",
  GIT_COMMITTER_NAME: "Jane Roe",
  GIT_COMMITTER_EMAIL: "jane.roe@example.org",
});

// Every folder the tests make is in one, deleted at the end.
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-security-testing-test-"));
after(() => fs.rmSync(ROOT, { recursive: true, force: true, maxRetries: 5 }));

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(ROOT, prefix));

/**
 * @param {string} dir
 * @param {string[]} args
 */
const git = (dir, args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();

/**
 * @param {string} dir
 * @param {string} file
 * @param {string} text
 */
function write(dir, file, text) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
}

/** A repository with one commit on `main`. */
function repository() {
  const dir = temporary("honsha-security-testing-repo-");
  git(dir, ["init", "-q", "-b", "main"]);
  write(dir, "readme.txt", "start\n");
  git(dir, ["add", "."]);
  git(dir, ["commit", "-q", "-m", "start"]);
  return dir;
}

/**
 * @typedef {import("./releases.mjs").ExecOptions} ExecOptions
 * @typedef {(name: string, args: string[], options: ExecOptions) => { status: number, stdout?: string, stderr?: string }} Fake
 */

/**
 * A context on a repository, whose programs are the given fake and whose git is the real one.
 * @param {string} root
 * @param {{ platform?: string, arch?: string, env?: NodeJS.ProcessEnv, program?: Fake }} [options]
 */
function context(root, { platform = process.platform, arch = process.arch, env = {}, program } = {}) {
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  const err = [];
  /** @type {Array<{ name: string, args: string[], options: ExecOptions }>} */
  const calls = [];
  /** @type {import("./releases.mjs").Exec} */
  const exec = (file, args, options) => {
    if (file === "git") {
      const result = spawnSync("git", args, { ...options, encoding: "utf8" });
      return { status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error };
    }
    const name = path.basename(file).replace(/\.exe$/, "");
    calls.push({ name, args, options });
    const versions = { gitleaks: GITLEAKS, shellcheck: SHELLCHECK, actionlint: ACTIONLINT, zizmor: ZIZMOR };
    if (Object.hasOwn(versions, name) && args.length === 1 && /^-*version$/.test(args[0])) {
      return {
        status: 0,
        stdout: `${name} ${versions[/** @type {keyof typeof versions} */ (name)].version}\n`,
        stderr: "",
      };
    }
    const result = program ? program(name, args, options) : { status: 0 };
    return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  };
  /** @type {import("./security-testing.mjs").Context} */
  const made = {
    root,
    platform,
    arch,
    env,
    temporary: ROOT,
    exec,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context: made, out, err, calls };
}

/**
 * A path as the system names it, so that a short name of Windows and git's long one compare equal.
 * @param {string} file
 */
const real = (file) => fs.realpathSync.native(file);

/**
 * Puts an empty file where the setup would install each program.
 * @param {string} root
 */
function installAll(root) {
  for (const release of Object.values(TOOLS)) {
    const { dir, program } = installed(root, release, process.platform);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(program, "");
  }
}

/**
 * A repository with one commit on the branch `work` beyond `main`, which adds a file, and every program in its place.
 * @param {string} [file]
 * @param {string} [text]
 */
function branch(file = "a.txt", text = "a\n") {
  const root = repository();
  const base = git(root, ["rev-parse", "HEAD"]);
  git(root, ["switch", "-q", "-c", "work"]);
  write(root, file, text);
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "work"]);
  installAll(root);
  return { root, base, head: git(root, ["rev-parse", "HEAD"]) };
}

test("the setup installs each program pinned for the host, names the others, and fails on a refused archive", async () => {
  const root = temporary("honsha-security-testing-setup-");
  const run = context(root, { platform: "win32", arch: "arm64" });
  /** @type {string[]} */
  const installs = [];
  const code = await setup(run.context, async (dir, { release, archive, platform }) => {
    installs.push(`${release.name} ${archive.file} ${platform}`);
    if (release.name === "actionlint") throw new Error("the archive's SHA-256 is not the pinned one");
    fs.mkdirSync(path.join(dir, "inner"));
    fs.writeFileSync(path.join(dir, "inner", `${release.name}.exe`), "");
    return path.join(dir, "inner", `${release.name}.exe`);
  });
  assert.equal(code, 1);
  assert.deepEqual(installs, [
    `gitleaks ${GITLEAKS.archives["win32-arm64"].file} win32`,
    `actionlint ${ACTIONLINT.archives["win32-arm64"].file} win32`,
  ]);
  const gitleaksDir = installed(root, GITLEAKS, "win32").dir;
  assert.deepEqual(fs.readdirSync(gitleaksDir), ["gitleaks.exe"]);
  assert.equal(fs.existsSync(installed(root, ACTIONLINT, "win32").dir), false);
  assert.match(run.out.join("\n"), /shellcheck 0\.11\.0 has no archive pinned for win32-arm64/);
  assert.match(run.out.join("\n"), /zizmor \S+ has no archive pinned for win32-arm64/);
  assert.match(run.err.join("\n"), /actionlint \S+: the archive's SHA-256 is not the pinned one/);
});

test("a program runs only once installed, pinned for the host, and at the pinned version", () => {
  const root = temporary("honsha-security-testing-ready-");
  assert.throws(
    () => ready(context(root).context, "zizmor"),
    /is not installed: run `node checks\/verify\.mjs --setup`/,
  );
  assert.throws(() => ready(context(root, { platform: "freebsd" }).context, "zizmor"), /not freebsd-\S+: this host/);
  installAll(root);
  assert.equal(ready(context(root).context, "zizmor"), installed(root, ZIZMOR, process.platform).program);
  const other = context(root);
  other.context.exec = () => ({ status: 0, stdout: "zizmor 0.1.0\n", stderr: "" });
  assert.throws(() => ready(other.context, "zizmor"), /says its version is zizmor 0\.1\.0, not the pinned/);
});

test("the workflow files are those in `.github/workflows/` itself", () => {
  const root = repository();
  for (const file of [
    ".github/workflows/a.yml",
    ".github/workflows/b.yaml",
    ".github/workflows/sub/c.yml",
    ".github/workflows/notes.md",
    ".github/actionlint.yaml",
  ]) {
    write(root, file, "name: x\n");
  }
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "workflows"]);
  assert.deepEqual(workflowFiles(context(root).context), [".github/workflows/a.yml", ".github/workflows/b.yaml"]);
});

test("each linter runs offline on its files, with the pinned programs and no file of the host, and fails on a finding", () => {
  const { root } = branch(".github/workflows/a.yml", "name: a\n");
  const shellcheckPath = installed(root, SHELLCHECK, process.platform).program;

  const clean = context(root);
  assert.equal(actionlint(clean.context), 0);
  assert.equal(zizmor(clean.context), 0);
  const runs = clean.calls.filter((call) => !(call.args[0] ?? "").endsWith("version"));
  assert.deepEqual(
    runs.map((call) => [call.name, call.args]),
    [
      ["actionlint", ["-no-color", `-shellcheck=${shellcheckPath}`, "-pyflakes=", ".github/workflows/a.yml"]],
      ["zizmor", ["--offline", "--no-progress", "--color=never", "--no-config", "--", ".github/workflows/a.yml"]],
    ],
  );
  assert.ok(runs.every((call) => call.options.env?.NO_COLOR === "1" && call.options.cwd === root));

  write(root, ZIZMOR_CONFIG, "rules: {}\n");
  const finding = context(root, {
    program: (name) => ({ status: name === "zizmor" ? 12 : 1, stdout: `${name}: a finding\n`, stderr: "" }),
  });
  assert.equal(zizmor(finding.context), 1);
  assert.deepEqual(finding.calls.at(-1)?.args.slice(3, 5), ["--config", ZIZMOR_CONFIG]);
  assert.equal(actionlint(finding.context), 1);
  assert.deepEqual(finding.out, ["zizmor: a finding", "actionlint: a finding"]);
});

test("what a linter or git writes is printed line by line, with its control characters escaped", () => {
  const { root } = branch(".github/workflows/a.yml", "name: a\n");
  const [escape, bidi] = [0x1b, 0x20_2e].map((code) => String.fromCodePoint(code));
  const run = context(root, {
    program: () => ({
      status: 1,
      stdout: `a.yml:1: run: echo ${escape}[2J\n\n  hidden${bidi}\n`,
      stderr: `${escape}]0\n`,
    }),
  });
  assert.equal(zizmor(run.context), 1);
  assert.deepEqual(run.out, [String.raw`a.yml:1: run: echo \u{1b}[2J`, String.raw`  hidden\u{202e}`]);
  assert.deepEqual(run.err, [String.raw`\u{1b}]0`]);

  const failing = context(root).context;
  failing.exec = () => ({ status: 128, stdout: "", stderr: `fatal: a ref ${escape}[2J\nhint: another line\n` });
  assert.throws(
    () => workflowFiles(failing),
    (error) =>
      error instanceof Error && error.message === "git ls-files failed: fatal: a ref \\u{1b}[2J\nhint: another line",
  );
});

test("a repository with nothing for a linter passes without running it", () => {
  const root = repository();
  const run = context(root);
  assert.equal(actionlint(run.context), 0);
  assert.equal(zizmor(run.context), 0);
  assert.deepEqual(run.calls, []);
});

test("the range is the pipeline's where it sets it, and otherwise from the default branch to HEAD", () => {
  const root = repository();
  const base = git(root, ["rev-parse", "HEAD"]);
  git(root, ["switch", "-q", "-c", "work"]);
  write(root, "a.txt", "a\n");
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "a"]);
  const head = git(root, ["rev-parse", "HEAD"]);
  assert.deepEqual(range(context(root).context, "main"), { base, head });
  assert.deepEqual(range(context(root, { env: { HONSHA_BASE: base, HONSHA_HEAD: "HEAD~1" } }).context, "main"), {
    base,
    head: base,
  });
  assert.throws(() => range(context(root).context, "trunk"), /default branch `trunk` was not found/);
  // A value of the environment is a commit, or nothing: never an option of git.
  for (const value of ["--output=x", "0000000000000000000000000000000000000000"]) {
    assert.throws(() => range(context(root, { env: { HONSHA_BASE: value } }).context, "main"), /is no commit/);
  }
});

/**
 * A scanner that writes the given findings to its report and ends as told.
 * @param {object[]} findings
 * @param {string} [stderr]
 * @returns {Fake}
 */
const scanner =
  (findings, stderr = "") =>
  (name, args) => {
    const report = args.find((arg) => arg.startsWith("--report-path="))?.slice("--report-path=".length) ?? "";
    fs.writeFileSync(report, JSON.stringify(findings));
    return { status: 0, stderr };
  };

test("the scanner reads the range from the git folder, redacted, with its own rules and no inline allowance", () => {
  const { root, base, head } = branch();
  const run = context(root, { program: scanner([]) });
  assert.equal(gitleaks(run.context, "main"), 0);
  const call = run.calls.find((each) => each.name === "gitleaks" && each.args[0] === "git");
  assert.ok(call);
  assert.equal(real(call.args[1]), real(path.join(root, ".git")));
  assert.equal(call.args[2], `--log-opts=${base}..${head} ${LOG_OPTIONS.join(" ")}`);
  assert.ok(LOG_OPTIONS.includes("--diff-merges=remerge"));
  const empty = call.options.cwd;
  for (const arg of ["--redact=100", "--ignore-gitleaks-allow", `--gitleaks-ignore-path=${empty}`, "--exit-code=0"]) {
    assert.ok(call.args.includes(arg), arg);
  }
  assert.ok(!call.args.some((arg) => arg.startsWith("--config")));
  assert.equal(call.options.env?.GIT_DIR, undefined);
  assert.equal(call.options.env?.GIT_NO_REPLACE_OBJECTS, "1");
});

test("the findings are printed by where they are, never by their value, the listed ones left out, and exit 1", () => {
  const root = repository();
  git(root, ["switch", "-q", "-c", "work"]);
  // A fake value in the form of a personal access token, made here so that no line of this file holds one.
  const value = "ghp_" + "FAKE".repeat(9);
  write(root, "config.env", `TOKEN=${value}\n`);
  write(root, "other.env", `TOKEN=${value}\n`);
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "fake values"]);
  const commit = git(root, ["rev-parse", "HEAD"]);
  write(root, ".gitleaksignore", `# The test's own fake value.\n${commit}:other.env:github-pat:1\n`);
  installAll(root);
  const emptyTree = git(root, ["hash-object", "-t", "tree", "--stdin"]);

  // A finding as gitleaks reports it, redacted.
  const finding = (/** @type {string} */ file) => ({
    Commit: commit,
    File: file,
    StartLine: 1,
    RuleID: "github-pat",
    Match: "TOKEN=REDACTED",
    Secret: "REDACTED",
  });
  const run = context(root, { program: scanner([finding("config.env"), finding("other.env")]) });
  assert.equal(gitleaks(run.context, "main"), 1);
  assert.deepEqual(run.out.slice(1), [
    "1 findings; 1 left out, as .gitleaksignore lists them.",
    "",
    "github-pat in config.env, line 1",
    `  fingerprint: ${commit}:config.env:github-pat:1`,
    `  line: TOKEN=${"*".repeat(value.length)}`,
  ]);
  assert.match(run.out[0], /read 1 commits from/);
  assert.ok(!run.out.join("\n").includes(value));
  const scan = run.calls.find((call) => call.name === "gitleaks" && call.args[0] === "git");
  assert.ok(scan);
  assert.equal(scan.options.env?.GIT_ATTR_SOURCE, emptyTree);
  assert.equal(real(scan.args[1]), real(path.join(root, ".git")));
  assert.equal(path.basename(scan.options.cwd), "empty");
  assert.deepEqual(
    fs.readdirSync(ROOT).filter((name) => name.startsWith("honsha-gitleaks-")),
    [],
    "the scan's temporary folder is deleted",
  );

  // With no ignore file, nothing is left out.
  fs.rmSync(path.join(root, ".gitleaksignore"));
  const unlisted = context(root, { program: scanner([finding("config.env"), finding("other.env")]) });
  assert.equal(gitleaks(unlisted.context, "main"), 1);
  assert.equal(unlisted.out[1], "2 findings; 0 left out, as .gitleaksignore lists them.");
});

test("a scanner that writes an error fails the scan, though it exits 0 with an empty report, and exits 1", async () => {
  const { root } = branch();
  const failing = context(root, { program: scanner([], "ERR [git] fatal: Invalid revision range\n") });
  assert.equal(await main(["gitleaks"], failing.context), 1);
  assert.deepEqual(failing.err, ["gitleaks failed: ERR [git] fatal: Invalid revision range"]);
  assert.deepEqual(failing.out, [], "no line reads as a scan that found nothing");
  // A control character that git's message quotes from the history is printed as an escape.
  assert.throws(
    () =>
      gitleaks(
        context(root, { program: scanner([], `ERR [git] fatal: bad ref ${String.fromCodePoint(0x1b)}[2J\n`) }).context,
        "main",
      ),
    /^Error: gitleaks failed: ERR \[git\] fatal: bad ref \\u\{1b\}\[2J$/,
  );
});

test("no commit in the range passes without running the scanner", () => {
  const root = repository();
  const run = context(root);
  assert.equal(gitleaks(run.context, "main"), 0);
  assert.match(run.out.join("\n"), /^No commit from \S+ to \S+: nothing to scan\.$/);
  assert.deepEqual(run.calls, []);
});

test("a wrong usage exits 2, and an error exits 1 with its message", async () => {
  for (const args of [[], ["nope"], ["gitleaks", "extra"], ["--setup", "--setup"]]) {
    /** @type {string[]} */
    const err = [];
    assert.equal(await main(args, { err: (line) => err.push(line) }), 2, args.join(" "));
    assert.equal(err.join("\n"), "Usage: node checks/security-testing.mjs --setup | gitleaks | actionlint | zizmor");
  }
  const root = temporary("honsha-security-testing-no-repository-");
  /** @type {string[]} */
  const err = [];
  assert.equal(await main(["gitleaks"], { root, err: (line) => err.push(line), env: {} }), 1);
  assert.match(err.join("\n"), /^The default branch `main` was not found\.$/);
});
