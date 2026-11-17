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
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/** A repository with one commit on `main`, on a new work branch, that reads no configuration but its own. */
function repository({ profile = "default-branch: main\n", branch = BRANCH } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-commits-"));
  made.push(dir);
  const empty = path.join(dir, "no-config");
  fs.writeFileSync(empty, "");
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

test("a branch that is not a work branch fails as soon as it adds a commit", () => {
  const { dir, commit } = repository({ branch: "patch-1" });
  assert.deepEqual(run(dir).problems, []);
  assert.match(run(dir).note, /no commit/);
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
  assert.match(run(dir).note, /no commit/);
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
