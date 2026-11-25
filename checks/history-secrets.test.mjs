import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import {
  IGNORE_FILE,
  LOG_OPTIONS,
  SCANNER,
  archiveFor,
  fingerprint,
  install,
  isName,
  makeMirror,
  maskLine,
  parseReport,
  readHistory,
  readIgnored,
  scan,
  scannerArgs,
  tarProgram,
} from "./history-secrets.mjs";

// The fixture commits with the identity git finds, which a machine that runs the tests may not have.
Object.assign(process.env, {
  GIT_AUTHOR_NAME: "Jane Roe",
  GIT_AUTHOR_EMAIL: "jane.roe@example.org",
  GIT_COMMITTER_NAME: "Jane Roe",
  GIT_COMMITTER_EMAIL: "jane.roe@example.org",
});

// Fake values in the forms that scanners look for. None is a credential.
const VALUES = {
  main: "ghp_FAKEtokenOnTheDefaultBranch0123456789",
  pull: "FAKEsecretKeptByAPullRequest0123",
  tag: "FAKEsecretOnlyInATag0123456789",
  merge: "FAKEsecretAddedByAMerge0123456789",
};

// Every folder the tests make is in one, deleted at the end.
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-history-test-"));
after(() => fs.rmSync(ROOT, { recursive: true, force: true, maxRetries: 5 }));

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(ROOT, prefix));

/**
 * @param {string} dir
 * @param {string[]} args
 */
const git = (dir, args) =>
  execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/**
 * @param {string} dir
 * @param {string} file
 * @param {string} text
 */
const write = (dir, file, text) => fs.writeFileSync(path.join(dir, file), text);

/**
 * @param {string} dir
 * @param {string} message
 */
function commit(dir, message) {
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", message]);
  return git(dir, ["rev-parse", "HEAD"]);
}

/**
 * A repository served as a remote, `origin.git`, and a clone of it, which holds its branches and tags. The remote's
 * history: on `main`, a value committed and then removed, and a merge whose resolution of a conflict adds a value; a
 * branch deleted from the remote whose commit a pull request's ref keeps; a commit that only a tag reaches; another
 * branch with an ignore file of its own; and on `main` the ignore file, which lists one fingerprint.
 */
function fixture() {
  const root = temporary("honsha-history-fixture-");
  const origin = path.join(root, "origin.git");
  const work = path.join(root, "work");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["init", "-q", "-b", "main", work]);
  git(work, ["remote", "add", "origin", origin]);

  write(work, "config.env", `TOKEN=${VALUES.main}\n`);
  const added = commit(work, "Add the configuration");
  fs.rmSync(path.join(work, "config.env"));
  commit(work, "Remove the configuration");

  git(work, ["checkout", "-q", "-b", "feature"]);
  write(work, "secret.txt", `key = ${VALUES.pull}\n`);
  const pulled = commit(work, "Add a key");
  git(work, ["push", "-q", "origin", "feature"]);
  git(origin, ["update-ref", "refs/pull/1/head", pulled]);
  git(work, ["push", "-q", "origin", "--delete", "feature"]);

  git(work, ["checkout", "-q", "--detach", "main"]);
  write(work, "tagged.txt", `secret = ${VALUES.tag}\n`);
  const tagged = commit(work, "Add a tagged file");
  git(work, ["tag", "v1"]);
  git(work, ["push", "-q", "origin", "v1"]);

  git(work, ["checkout", "-q", "main"]);
  write(work, "app.txt", "x = 1\n");
  commit(work, "Add the application");
  git(work, ["checkout", "-q", "-b", "other"]);
  write(work, "app.txt", "x = 2\n");
  commit(work, "Change the application on a branch");
  git(work, ["checkout", "-q", "main"]);
  write(work, "app.txt", "x = 3\n");
  commit(work, "Change the application on main");
  try {
    git(work, ["merge", "-q", "other"]);
  } catch {
    // The conflict is the point: its resolution adds a line that neither parent holds.
  }
  write(work, "app.txt", `x = 4\nresolved = ${VALUES.merge}\n`);
  git(work, ["add", "app.txt"]);
  git(work, ["commit", "-q", "--no-edit"]);
  const merge = git(work, ["rev-parse", "HEAD"]);

  const listed = `${added}:config.env:generic-api-key:1`;
  git(work, ["checkout", "-q", "-b", "stale"]);
  write(work, IGNORE_FILE, `${pulled}:secret.txt:generic-api-key:1\n`);
  commit(work, "List a finding on another branch");
  git(work, ["push", "-q", "origin", "stale"]);
  git(work, ["checkout", "-q", "main"]);
  write(work, IGNORE_FILE, `# No secret: a test's value, and why.\n${listed}\n\n`);
  commit(work, "List a finding");
  git(work, ["push", "-q", "origin", "main"]);

  // As over a network, so that the clone holds only what its refs reach: a local clone copies every object.
  const clone = path.join(root, "clone");
  execFileSync("git", ["clone", "-q", "--no-local", origin, clone], { stdio: "ignore" });
  return { root, origin, clone, added, pulled, tagged, merge, listed };
}

const shared = fixture();

/** @param {string} dir */
const refsOf = (dir) => git(dir, ["for-each-ref", "--format=%(refname) %(objectname)"]);

test("the pin covers Windows, Linux and macOS on x64 and arm64, and refuses another platform", () => {
  for (const platform of ["win32", "linux", "darwin"]) {
    for (const arch of ["x64", "arm64"]) {
      const archive = archiveFor(platform, arch);
      assert.ok(archive, `${platform}-${arch}`);
      const name = { win32: "windows", linux: "linux", darwin: "darwin" }[platform];
      const form = platform === "win32" ? "zip" : "tar.gz";
      assert.equal(archive.file, `gitleaks_${SCANNER.version}_${name}_${arch}.${form}`);
      assert.match(archive.sha256, /^[0-9a-f]{64}$/);
    }
  }
  assert.equal(archiveFor("linux", "ia32"), undefined);
  assert.equal(archiveFor("freebsd", "x64"), undefined);
  assert.equal(archiveFor("constructor", ""), undefined);
});

test("a platform with no pinned archive exits 2 before anything is downloaded or made", async () => {
  const temp = temporary("honsha-history-temp-");
  /** @type {string[]} */
  const errors = [];
  let installed = false;
  const code = await scan({
    cwd: shared.clone,
    platform: "freebsd",
    arch: "x64",
    temporary: temp,
    scanner: {
      install: async () => {
        installed = true;
        return "";
      },
      version: () => "",
      run: () => {},
    },
    out: () => {},
    err: (line) => errors.push(line),
  });
  assert.equal(code, 2);
  assert.match(errors.join("\n"), /not freebsd-x64/);
  assert.equal(installed, false);
  assert.deepEqual(fs.readdirSync(temp), []);
});

test("Windows's own tar extracts the archive, not one that comes first on the path", () => {
  assert.equal(tarProgram("win32", { SystemRoot: "C:\\Windows" }), path.join("C:\\Windows", "System32", "tar.exe"));
  assert.equal(tarProgram("linux", {}), "tar");
  assert.equal(tarProgram("darwin", {}), "tar");
});

test("an archive whose checksum differs stops before anything is written or extracted", async () => {
  const dir = temporary("honsha-history-install-");
  let unpacked = false;
  await assert.rejects(
    install(dir, {
      archive: SCANNER.archives["linux-x64"],
      platform: "linux",
      fetchBytes: async () => Buffer.from("not the archive"),
      unpack: () => {
        unpacked = true;
      },
    }),
    /neither extracted nor run/,
  );
  assert.equal(unpacked, false);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test("an archive with the pinned checksum is fetched from the release and its program alone extracted", async () => {
  const bytes = Buffer.from("an archive");
  const archive = { file: "scanner.zip", sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
  for (const [platform, member] of [
    ["win32", "gitleaks.exe"],
    ["linux", "gitleaks"],
  ]) {
    const dir = temporary("honsha-history-install-");
    /** @type {string[]} */
    const urls = [];
    /** @type {string[]} */
    const members = [];
    const program = await install(dir, {
      archive,
      platform,
      fetchBytes: async (url) => {
        urls.push(url);
        return bytes;
      },
      unpack: (file, into, name) => {
        assert.equal(fs.readFileSync(file, "utf8"), "an archive");
        members.push(name);
        fs.writeFileSync(path.join(into, name), "");
      },
    });
    assert.deepEqual(urls, [`https://github.com/gitleaks/gitleaks/releases/download/v${SCANNER.version}/scanner.zip`]);
    assert.deepEqual(members, [member]);
    assert.equal(program, path.join(dir, member));
  }
});

test("the mirror holds every ref the remote serves, a pull request's with a deleted branch's commit, and borrows the clone's objects", () => {
  const before = refsOf(shared.clone);
  assert.throws(() => git(shared.clone, ["cat-file", "-e", shared.pulled]));
  const mirror = makeMirror(shared.clone, temporary("honsha-history-mirror-"));
  const refs = refsOf(mirror);
  assert.match(refs, new RegExp(`^refs/pull/1/head ${shared.pulled}$`, "m"));
  assert.match(refs, /^refs\/tags\/v1 /m);
  assert.doesNotMatch(refs, /^refs\/heads\/feature /m);
  git(mirror, ["cat-file", "-e", shared.pulled]);
  assert.ok(fs.existsSync(path.join(mirror, "objects", "info", "alternates")));
  assert.equal(refsOf(shared.clone), before);

  const history = readHistory(mirror);
  assert.equal(history.branch, "refs/heads/main");
  assert.equal(history.refs, refs.split("\n").length);
  assert.equal(history.commits, Number(git(mirror, ["rev-list", "--all", "--count"])));
  assert.ok(history.onDefault.has(shared.added) && history.onDefault.has(shared.merge));
  assert.ok(!history.onDefault.has(shared.pulled) && !history.onDefault.has(shared.tagged));
});

test("the scanner reads what a merge adds of its own, as a conflict's resolution, which `git log -p` leaves out", () => {
  const mirror = makeMirror(shared.clone, temporary("honsha-history-mirror-"));
  const line = `+resolved = ${VALUES.merge}`;
  const merge = LOG_OPTIONS.filter((option) => option !== "--all");
  assert.ok(git(mirror, ["log", "-p", "-U0", ...merge, "-1", shared.merge]).includes(line));
  assert.ok(git(mirror, ["log", "-p", "-U0", ...LOG_OPTIONS]).includes(line));
  assert.ok(!git(mirror, ["log", "-p", "-U0", "--all"]).includes(line));
  const args = scannerArgs(mirror, "report.json", "empty");
  assert.ok(args.includes(`--log-opts=${LOG_OPTIONS.join(" ")}`));
  assert.ok(args.includes("--redact=100") && args.includes("--ignore-gitleaks-allow"));
  assert.ok(!args.some((arg) => arg.startsWith("--config")));
});

test("the ignore file is read on the default branch, not on another branch or in the clone's working tree", () => {
  write(shared.clone, IGNORE_FILE, `${shared.listed}\n${shared.tagged}:tagged.txt:generic-api-key:1\n`);
  const mirror = makeMirror(shared.clone, temporary("honsha-history-mirror-"));
  assert.deepEqual([...readIgnored(mirror, "refs/heads/main")], [shared.listed]);
  assert.deepEqual([...readIgnored(mirror, null)], []);
  git(shared.clone, ["checkout", "-q", "--", IGNORE_FILE]);
});

test("a name is shown, and a run that could be a value is not", () => {
  for (const name of ["api_key", "credentialId", "Content-Type", "TOKEN", "aws.secret", "--force", "__init__"]) {
    assert.ok(isName(name), name);
  }
  for (const value of ["ghp_abc123", "dGVzdA==", "a/b", "x_".repeat(21), "kQzPwLmNoPq", "abcdefghijklmnopqrstu"]) {
    assert.ok(!isName(value), value);
  }
});

test("a line shows its names, and masks the value found and every run that could be one", () => {
  const finding = { commit: "a".repeat(40), file: "f", line: 1, rule: "r", match: "", secret: "REDACTED" };
  const quoted = maskLine(`const credentialId = "AKIA1234EXAMPLE5678"; // also s3cr3t`, {
    ...finding,
    match: `credentialId = "REDACTED"`,
  });
  assert.equal(quoted, `const credentialId = "*******************"; // also ******`);
  assert.equal(
    maskLine("password: letmeinplease", { ...finding, match: "password: REDACTED" }),
    "password: *************",
  );
  assert.equal(maskLine("export TOKEN", { ...finding, match: "REDACTED" }), "export TOKEN");
  // A line that does not show the match: every run of four characters or more.
  assert.equal(maskLine("the key is here", { ...finding, match: "other REDACTED" }), "the key is ****");
  // A report that is not redacted: the value, wherever it stands.
  assert.equal(
    maskLine("pass=hunterhunter", { ...finding, match: "pass=hunterhunter", secret: "hunterhunter" }),
    "pass=************",
  );
  const long = maskLine(`name ${"word ".repeat(100)}`, { ...finding, match: "REDACTED" });
  assert.equal(long.length, 301);
  assert.ok(long.endsWith("…"));
});

test("a report holds a finding by commit, file, line and rule, or is refused", () => {
  const entry = { Commit: "b".repeat(40), File: "a.txt", StartLine: 3, RuleID: "rule", Match: "m", Secret: "s" };
  const [finding] = parseReport(JSON.stringify([entry]));
  assert.equal(fingerprint(finding), `${"b".repeat(40)}:a.txt:rule:3`);
  assert.deepEqual(parseReport(""), []);
  assert.throws(() => parseReport(JSON.stringify([{ ...entry, Commit: "not a commit" }])), /without a commit/);
  assert.throws(() => parseReport("{}"), /not a list/);
});

/**
 * A scanner that installs nothing and writes the given findings to its report, as gitleaks writes them, with the
 * author, the commit's message and the value besides what the script reads.
 * @param {object[]} findings
 * @param {{ runs?: string[] }} [seen] where each run's folder is written
 */
function fakeScanner(findings, seen = {}) {
  return {
    install: async () => "gitleaks",
    version: () => `${SCANNER.version}\n`,
    /** @param {string} program @param {string[]} args @param {string} cwd */
    run: (program, args, cwd) => {
      seen.runs?.push(cwd);
      const report = args.find((arg) => arg.startsWith("--report-path="))?.slice("--report-path=".length) ?? "";
      fs.writeFileSync(report, JSON.stringify(findings));
    },
  };
}

/**
 * @param {string} at the commit
 * @param {string} file
 * @param {string} rule
 * @param {string} value
 * @param {string} match
 * @param {number} [line]
 */
const reported = (at, file, rule, value, match, line = 1) => ({
  Description: "A secret",
  StartLine: line,
  EndLine: line,
  Match: match,
  Secret: value,
  File: file,
  Commit: at,
  Author: "Jane Roe",
  Email: "jane.roe@example.org",
  Message: "Add the configuration",
  RuleID: rule,
  Fingerprint: `${at}:${file}:${rule}:${line}`,
});

test("the findings are printed by where they are, with no value, no unmasked line and no author, and exit 1", async () => {
  const temp = temporary("honsha-history-temp-");
  /** @type {string[]} */
  const runs = [];
  /** @type {string[]} */
  const lines = [];
  const code = await scan({
    cwd: shared.clone,
    platform: "linux",
    arch: "x64",
    temporary: temp,
    scanner: fakeScanner(
      [
        reported(shared.added, "config.env", "github-pat", VALUES.main, `TOKEN=${VALUES.main}`),
        reported(shared.pulled, "secret.txt", "generic-api-key", "REDACTED", "key = REDACTED"),
        reported(shared.tagged, "tagged.txt", "generic-api-key", "REDACTED", "secret = REDACTED"),
        reported(shared.merge, "app.txt", "generic-api-key", "REDACTED", "resolved = REDACTED", 2),
        reported(shared.added, "config.env", "generic-api-key", "REDACTED", "TOKEN=REDACTED"),
      ],
      { runs },
    ),
    out: (line) => lines.push(line),
    err: (line) => lines.push(line),
  });
  const output = lines.join("\n");
  assert.equal(code, 1);
  assert.match(
    output,
    new RegExp(`^gitleaks ${SCANNER.version.replaceAll(".", "\\.")} read \\d+ refs and \\d+ commits`, "m"),
  );
  assert.match(output, /^4 findings; 1 left out, as \.gitleaksignore on main lists them\.$/m);
  assert.match(output, new RegExp(`^github-pat in config\\.env, line 1, commit ${shared.added}$`, "m"));
  assert.match(output, new RegExp(`^  fingerprint: ${shared.pulled}:secret\\.txt:generic-api-key:1$`, "m"));
  assert.match(output, /^ {2}line: TOKEN=\*+$/m);
  assert.match(output, /^ {2}line: key = \*+$/m);
  assert.match(output, /^ {2}line: resolved = \*+$/m);
  assert.equal(output.match(/on the default branch: yes/g)?.length, 2);
  assert.equal(output.match(/on the default branch: no/g)?.length, 2);
  for (const value of [...Object.values(VALUES), "Jane", "jane.roe", "Add the configuration", shared.origin]) {
    assert.ok(!output.includes(value), value);
  }
  assert.equal(runs.length, 1);
  assert.ok(runs[0].startsWith(temp));
  assert.deepEqual(fs.readdirSync(temp), []);
});

test("no finding exits 0, and the temporary folder is deleted", async () => {
  const temp = temporary("honsha-history-temp-");
  /** @type {string[]} */
  const lines = [];
  const code = await scan({
    cwd: shared.clone,
    platform: "win32",
    arch: "arm64",
    temporary: temp,
    scanner: fakeScanner([]),
    out: (line) => lines.push(line),
    err: (line) => lines.push(line),
  });
  assert.equal(code, 0);
  assert.match(lines.join("\n"), /^0 findings; 0 left out/m);
  assert.deepEqual(fs.readdirSync(temp), []);
});

test("an error exits 2, and the temporary folder is deleted all the same", async () => {
  const temp = temporary("honsha-history-temp-");
  /** @type {string[]} */
  const errors = [];
  const failing = {
    ...fakeScanner([]),
    run: () => {
      throw new Error("gitleaks failed: no message");
    },
  };
  const options = {
    platform: "linux",
    arch: "x64",
    temporary: temp,
    out: () => {},
    err: (/** @type {string} */ line) => errors.push(line),
  };
  assert.equal(await scan({ ...options, cwd: shared.clone, scanner: failing }), 2);
  assert.match(errors.join("\n"), /gitleaks failed/);
  assert.deepEqual(fs.readdirSync(temp), []);

  const alone = temporary("honsha-history-alone-");
  execFileSync("git", ["init", "-q", alone]);
  assert.equal(await scan({ ...options, cwd: alone, scanner: fakeScanner([]) }), 2);
  assert.match(errors.join("\n"), /has no remote/);
  assert.deepEqual(fs.readdirSync(temp), []);

  const version = { ...fakeScanner([]), version: () => "8.0.0" };
  assert.equal(await scan({ ...options, cwd: shared.clone, scanner: version }), 2);
  assert.match(errors.join("\n"), /not the pinned/);
  assert.deepEqual(fs.readdirSync(temp), []);
});
