// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { check } from "./commits.mjs";

const script = fileURLToPath(new URL("./commits.mjs", import.meta.url));
const ID = "261116-1432";
const BRANCH = `work/${ID}-export-orders`;
const INSIDE = "worker@example.org";
const OUTSIDE = "someone@elsewhere.example";
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * A repository with one commit on `main`, on a new work branch, that reads no configuration but its own.
 * @param {{ profile?: string | null, branch?: string }} [options]
 */
function repository({ profile = "default-branch: main\n", branch = BRANCH } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-commits-"));
  made.push(dir);
  const empty = path.join(dir, "no-config");
  fs.writeFileSync(empty, "");
  /** @param {string[]} args */
  const git = (args, address = INSIDE, committer = address) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: empty,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Worker",
        GIT_AUTHOR_EMAIL: address,
        GIT_COMMITTER_NAME: "Worker",
        GIT_COMMITTER_EMAIL: committer,
      },
    }).trim();
  /**
   * @param {string} subject
   * @param {string} [trailer]
   * @param {string} [address]
   * @param {string} [committer]
   */
  const commit = (subject, trailer, address, committer) =>
    git(["commit", "-q", "--allow-empty", "-m", subject, ...(trailer ? ["-m", trailer] : [])], address, committer);
  git(["init", "-q", "-b", "main", "."]);
  if (profile !== null) {
    fs.mkdirSync(path.join(dir, ".hub"));
    fs.writeFileSync(path.join(dir, ".hub", "profile.yml"), profile);
    git(["add", ".hub"]);
  }
  commit("Start the project");
  git(["checkout", "-q", "-b", branch]);
  return { dir, git, commit };
}

const quiet = { ...process.env, HONSHA_BRANCH: "", HONSHA_BASE: "", HONSHA_HEAD: "" };
/**
 * @param {string} dir
 * @param {NodeJS.ProcessEnv} [env]
 */
const run = (dir, env = {}) => check({ cwd: dir, env: { ...quiet, ...env } });

test("passes when every commit of the branch carries the trailer of the branch", () => {
  const { dir, commit } = repository();
  commit("Add the record", `Work-Item: ${ID}`);
  commit("Add the export", `Work-Item: ${ID}\nCo-Authored-By: A Model <model@example.org>`);
  assert.deepEqual(run(dir), { commits: 2, problems: [] });
});

test("names the commit that has no trailer, and the one with the trailer of another item", () => {
  const { dir, commit, git } = repository();
  commit("Add the record", `Work-Item: ${ID}`);
  commit("Add the export");
  commit("Add the button", "Work-Item: 261116-0900");
  const { problems } = run(dir);
  assert.equal(problems.length, 2);
  assert.match(
    problems[0],
    new RegExp(`^${git(["rev-parse", "--short=7", "HEAD~1"])} Add the export: no .Work-Item. trailer`),
  );
  assert.match(problems[1], /Add the button: .Work-Item. is not 261116-1432/);
});

test("says when the `Work-Item` line stands outside the last paragraph, where git reads no trailer", () => {
  const { dir, commit } = repository();
  commit("Add the record", `Work-Item: ${ID}\n\nCo-Authored-By: A Model <model@example.org>`);
  commit("Add the export", `Work-Item: ${ID}\nCo-Authored-By: A Model <model@example.org>`);
  const { problems } = run(dir);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /Add the record: a .Work-Item. line that git does not read as a trailer: git reads trailers only in the message's last paragraph/,
  );
});

test("says the same of a `Work-Item` line left in the subject's paragraph", () => {
  const { dir, commit } = repository();
  commit(`Add the record\nWork-Item: ${ID}`);
  const { problems } = run(dir);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /a .Work-Item. line that git does not read as a trailer/);
});

test("a branch that is not a work branch fails as soon as it adds a commit", () => {
  const { dir, commit } = repository({ branch: "patch-1" });
  assert.deepEqual(run(dir).problems, []);
  assert.match(run(dir).note ?? "", /no commit/);
  commit("Add the export", `Work-Item: ${ID}`);
  assert.match(run(dir).problems[0], /`patch-1` is not named work\/<id>-<slug>/);
});

test("checks author and committer against the pattern of the profile, and prints no address", () => {
  const { dir, commit } = repository({ profile: "default-branch: main\ncommits:\n  address: '@example\\.org$'\n" });
  commit("Add the record", `Work-Item: ${ID}`);
  commit("Add the export", `Work-Item: ${ID}`, OUTSIDE);
  commit("Add the button", `Work-Item: ${ID}`, INSIDE, OUTSIDE);
  const { problems } = run(dir);
  assert.equal(problems.length, 3);
  assert.match(problems[0], /Add the export: the author address/);
  assert.match(problems[1], /Add the export: the committer address/);
  assert.match(problems[2], /Add the button: the committer address/);
  assert.ok(problems.every((problem) => !problem.includes("@")));
});

test("without a pattern, or without a profile, addresses are not checked", () => {
  for (const profile of ["default-branch: main\n", null]) {
    const { dir, commit } = repository({ profile });
    commit("Add the export", `Work-Item: ${ID}`, OUTSIDE);
    assert.deepEqual(run(dir).problems, []);
  }
});

test("after the default branch is merged in, only the commits of the branch are checked", () => {
  const { dir, commit, git } = repository();
  commit("Add the export", `Work-Item: ${ID}`);
  git(["checkout", "-q", "main"]);
  commit("Merge the work of another item");
  git(["checkout", "-q", BRANCH]);
  git(["merge", "-q", "--no-ff", "main", "-m", "Merge the default branch", "-m", `Work-Item: ${ID}`]);
  assert.deepEqual(run(dir), { commits: 2, problems: [] });
});

test("reads the branch and the range from the environment when the checkout is not on the branch", () => {
  const { dir, commit, git } = repository();
  commit("Add the record", `Work-Item: ${ID}`);
  commit("Add the export");
  const base = git(["rev-parse", "main"]);
  const head = git(["rev-parse", "HEAD~1"]);
  git(["checkout", "-q", "--detach", "main"]);
  assert.match(run(dir).note ?? "", /no commit/);
  assert.deepEqual(run(dir, { HONSHA_BRANCH: BRANCH, HONSHA_BASE: base, HONSHA_HEAD: head }), {
    commits: 1,
    problems: [],
  });
});

test("the exit code is 1 with the commit named, and 0 when the rules are followed", () => {
  const { dir, commit } = repository();
  commit("Add the record", `Work-Item: ${ID}`);
  const passed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(passed.status, 0, passed.stderr);
  commit("Add the export");
  const failed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Add the export: no .Work-Item. trailer/);
});

/**
 * Writes a file of the repository and stages it.
 * @param {string} dir
 * @param {(args: string[]) => string} git
 * @param {string} file
 * @param {string} text
 */
function put(dir, git, file, text) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
  git(["add", file]);
}

const RECORD = `work/2026/11/${ID}-export-orders.md`;
/**
 * @param {string} size
 * @param {string} approval
 */
const record = (size, approval) =>
  `---\nid: ${ID}\nsize: ${size}\nstate: in-progress\n---\n\n## Intent\n\n> Export the orders.\n\n## Approval\n\n${approval}`;

test("for a full item, a commit up to the approval that changes another file than the record is named", () => {
  const { dir, git } = repository();
  put(dir, git, RECORD, record("full", ""));
  put(dir, git, "export.js", "export {};\n");
  git(["commit", "-q", "-m", "Write the strategy", "-m", `Work-Item: ${ID}`]);
  put(dir, git, RECORD, record("full", "Approved in the chat.\n"));
  git(["commit", "-q", "-m", "Record the approval", "-m", `Work-Item: ${ID}`]);
  put(dir, git, "export.js", "export const orders = [];\n");
  git(["commit", "-q", "-m", "Add the export", "-m", `Work-Item: ${ID}`]);
  const { problems } = run(dir);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Write the strategy: changes export\.js before the approval is committed$/);
});

test("for a full item, the commits after the approval and a merge of the default branch are free", () => {
  const { dir, git } = repository();
  put(dir, git, RECORD, record("full", ""));
  git(["commit", "-q", "-m", "Write the strategy", "-m", `Work-Item: ${ID}`]);
  git(["checkout", "-q", "main"]);
  put(dir, git, "other.js", "export {};\n");
  git(["commit", "-q", "-m", "Merge the work of another item"]);
  git(["checkout", "-q", BRANCH]);
  git(["merge", "-q", "--no-ff", "main", "-m", "Merge the default branch", "-m", `Work-Item: ${ID}`]);
  put(dir, git, RECORD, record("full", "Approved in the chat.\n"));
  git(["commit", "-q", "-m", "Record the approval", "-m", `Work-Item: ${ID}`]);
  put(dir, git, "export.js", "export {};\n");
  git(["commit", "-q", "-m", "Add the export", "-m", `Work-Item: ${ID}`]);
  assert.deepEqual(run(dir), { commits: 4, problems: [] });
});

test("a small item changes other files from its first commit", () => {
  const { dir, git } = repository();
  put(dir, git, RECORD, record("small", ""));
  put(dir, git, "export.js", "export {};\n");
  git(["commit", "-q", "-m", "Add the export", "-m", `Work-Item: ${ID}`]);
  assert.deepEqual(run(dir), { commits: 1, problems: [] });
});

test("on the default branch, merges and captures of the backlog pass, and any other direct commit is named", () => {
  const { dir, git } = repository();
  git(["checkout", "-q", "main"]);
  const start = git(["rev-parse", "HEAD"]);
  const capture = "backlog/example/261201-0930-export-orders.md";
  put(dir, git, capture, "A record.\n");
  git(["commit", "-q", "-m", "Capture 261201-0930 in the backlog of example", "-m", "Backlog: 261201-0930"]);
  git(["checkout", "-q", BRANCH]);
  put(dir, git, "export.js", "export {};\n");
  git(["commit", "-q", "-m", "Add the export", "-m", `Work-Item: ${ID}`]);
  git(["checkout", "-q", "main"]);
  git(["merge", "-q", "--no-ff", BRANCH, "-m", "Merge pull request #1"]);
  git(["rm", "-q", capture]);
  git(["commit", "-q", "-m", "Take 261201-0930 from the backlog of example", "-m", "Backlog: 261201-0930"]);
  const passed = git(["rev-parse", "HEAD"]);
  const env = { HONSHA_BRANCH: "main", HONSHA_BASE: start, HONSHA_HEAD: passed };
  assert.deepEqual(run(dir, env), { commits: 3, problems: [] });

  put(dir, git, "README.md", "Pushed straight to main.\n");
  git(["commit", "-q", "-m", "Edit the readme"]);
  put(dir, git, "backlog/example/261201-0931-import-orders.md", "A record.\n");
  put(dir, git, "settings.yml", "quiet: 22-07\n");
  git(["commit", "-q", "-m", "Capture 261201-0931 with a setting", "-m", "Backlog: 261201-0931"]);
  put(dir, git, "backlog/example/261201-0931-import-orders.md", "Another record.\n");
  git(["commit", "-q", "-m", "Rewrite 261201-0931 in the backlog", "-m", "Backlog: 261201-0931"]);
  put(dir, git, "backlog/example/261201-0932-other.md", "A record.\n");
  git(["commit", "-q", "-m", "Capture 261201-0932 under another name", "-m", "Backlog: 261201-0933"]);
  const { problems } = run(dir, { ...env, HONSHA_HEAD: git(["rev-parse", "HEAD"]) });
  assert.equal(problems.length, 4);
  assert.match(problems[0], /Edit the readme: a direct commit, not a capture: no `Backlog` trailer$/);
  assert.match(problems[1], /with a setting: .*changes 2 files, not one record under backlog\/$/);
  assert.match(
    problems[2],
    /Rewrite 261201-0931 .*: changes backlog\/example\/261201-0931-import-orders\.md other than/,
  );
  assert.match(
    problems[3],
    /under another name: .*261201-0932-other\.md is not backlog\/<project>\/261201-0933-<slug>\.md$/,
  );
});
