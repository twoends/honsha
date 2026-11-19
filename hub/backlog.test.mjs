import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { check } from "../checks/commits.mjs";
import { backlogProblems, run } from "./backlog.mjs";
import { git, writeFiles } from "./home.mjs";
import { formatRegistry, REGISTRY } from "./projects.mjs";

// The script commits with the identity git finds, which a machine that runs the tests may not have.
Object.assign(process.env, {
  GIT_AUTHOR_NAME: "Example",
  GIT_AUTHOR_EMAIL: "example@example.org",
  GIT_COMMITTER_NAME: "Example",
  GIT_COMMITTER_EMAIL: "example@example.org",
});

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

const registry = formatRegistry([
  { name: "example", repository: "example-owner/example", paths: {}, state: "active", assessment: "261130-1200" },
]);

/**
 * A home's clone with an origin, whose default branch `main` holds the registry; and a second clone of the same
 * origin, for what another host pushes.
 */
function home() {
  const dir = temporary("honsha-backlog-");
  const origin = path.join(dir, "origin.git");
  const folder = path.join(dir, "home");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["clone", "-q", origin, folder], { stdio: "ignore" });
  writeFiles(folder, { "README.md": "Example.\n", [REGISTRY]: registry });
  git(folder, ["add", "-A"]);
  git(folder, ["commit", "-q", "-m", "Start"]);
  git(folder, ["push", "-q", "-u", "origin", "main"]);
  git(folder, ["remote", "set-head", "origin", "main"]);
  const other = path.join(dir, "other");
  execFileSync("git", ["clone", "-q", origin, other], { stdio: "ignore" });
  return { dir: folder, origin, other, start: git(folder, ["rev-parse", "HEAD"]).trim() };
}

/**
 * A record of the backlog, written to a file outside the home, as the hub drafts it.
 * @param {string} id
 * @param {Record<string, string>} [changes] front matter values that replace the ordinary ones
 * @param {string} [name] the file's name, `<id>-<slug>.md` unless given
 */
function draft(id, changes = {}, name = `${id}-export-orders.md`) {
  const values = {
    id,
    title: "Export orders as CSV",
    project: "example",
    type: "change",
    size: "small",
    kind: "feature",
    state: "idea",
    areas: "[]",
    created: "2026-12-01",
    updated: "2026-12-01",
    "requested-by": "person",
    source: "null",
    pr: "null",
    model: "null",
    effort: "null",
    checks: "[]",
    ...changes,
  };
  const front = Object.entries(values).map(([key, value]) => `${key}: ${value}`);
  const file = path.join(temporary("honsha-draft-"), name);
  fs.writeFileSync(file, `---\n${front.join("\n")}\n---\n\n## Intent\n\n> Export the orders as CSV.\n`);
  return file;
}

/**
 * The files of a folder on the origin's default branch.
 * @param {string} origin
 * @param {string} folder
 */
const listed = (origin, folder) =>
  git(origin, ["ls-tree", "--name-only", "main", `${folder}/`])
    .split("\n")
    .filter(Boolean);

/**
 * The problems the check of commits finds on the default branch, from `base` to the origin's tip.
 * @param {string} dir
 * @param {string} base
 */
function defaultBranchProblems(dir, base) {
  git(dir, ["fetch", "-q", "origin"]);
  const env = { HONSHA_BRANCH: "main", HONSHA_BASE: base, HONSHA_HEAD: "origin/main" };
  return check({ cwd: dir, env }).problems;
}

test("a first and a second capture are pushed to the default branch, and the home's working tree stays as it is", () => {
  const { dir, origin, start } = home();
  fs.writeFileSync(path.join(dir, "draft.md"), "Unsaved.\n");
  const first = run(["add", "example", draft("261201-0930")], { home: dir });
  assert.equal(first.code, 0, first.out.join("\n"));
  assert.match(first.out[0], /261201-0930 is in the backlog: backlog\/example\/261201-0930-export-orders\.md/);
  const second = run(["add", "example", draft("261201-0931", {}, "261201-0931-import-orders.md")], { home: dir });
  assert.equal(second.code, 0, second.out.join("\n"));

  assert.deepEqual(listed(origin, "backlog/example"), [
    "backlog/example/261201-0930-export-orders.md",
    "backlog/example/261201-0931-import-orders.md",
  ]);
  assert.equal(git(origin, ["rev-list", "--count", `${start}..main`]).trim(), "2");
  assert.match(
    git(origin, ["log", "-1", "--format=%B", "main"]),
    /^Capture 261201-0931 in the backlog of example\n\nBacklog: 261201-0931\n/,
  );
  assert.deepEqual(defaultBranchProblems(dir, start), []);

  assert.equal(git(dir, ["symbolic-ref", "--short", "HEAD"]).trim(), "main");
  assert.equal(git(dir, ["rev-parse", "main"]).trim(), start);
  assert.equal(git(dir, ["status", "--porcelain"]), "?? draft.md\n");
  assert.equal(git(dir, ["worktree", "list"]).trim().split("\n").length, 1);
});

test("take removes the record from the default branch, pushes, and prints it", () => {
  const { dir, origin, start } = home();
  const file = draft("261201-0930");
  run(["add", "example", file], { home: dir });
  const taken = run(["take", "example", "261201-0930"], { home: dir });
  assert.equal(taken.code, 0, taken.out.join("\n"));
  assert.equal(`${taken.out.join("\n")}\n`, fs.readFileSync(file, "utf8"));
  assert.match(
    taken.note?.join("\n") ?? "",
    /261201-0930 is taken from backlog\/example\/261201-0930-export-orders\.md/,
  );
  assert.deepEqual(listed(origin, "backlog/example"), []);
  assert.match(git(origin, ["log", "-1", "--format=%B", "main"]), /\n\nBacklog: 261201-0930\n/);
  assert.deepEqual(defaultBranchProblems(dir, start), []);
  assert.equal(git(dir, ["status", "--porcelain"]), "");

  const again = run(["take", "example", "261201-0930"], { home: dir });
  assert.equal(again.code, 1);
  assert.match(again.out[0], /No record 261201-0930 in the backlog of `example`/);
});

test("a project that is not in the registry, a file that is not a record, and a name outside backlog/ are refused", () => {
  const { dir, origin, start } = home();
  const unknown = run(["add", "other", draft("261201-0930", { project: "other" })], { home: dir });
  assert.equal(unknown.code, 1);
  assert.match(unknown.out[0], /`other` is not in the registry on the home's main/);
  assert.equal(run(["take", "other", "261201-0930"], { home: dir }).code, 1);
  assert.equal(run(["add", "../example", draft("261201-0930")], { home: dir }).code, 2);
  assert.equal(run(["take", "example", "../261201-0930"], { home: dir }).code, 2);

  const notes = path.join(temporary("honsha-draft-"), "261201-0930-notes.md");
  fs.writeFileSync(notes, "Just a note.\n");
  const failures = [
    [notes, /no front matter/],
    [draft("261201-0930", { state: "in-progress" }), /`state` is `in-progress`, not one of idea, ready, dropped/],
    [draft("261201-0930", { project: "another" }), /`project` is `another`, not example/],
    [draft("261201-0930", { kind: "" }), /`kind` is empty/],
    [draft("261201-0930", { size: "large" }), /`size` is `large`/],
    [draft("261201-0930", {}, "export-orders.md"), /the name is not 261201-0930-<slug>\.md/],
    [draft("261201-0930", {}, "261201-0930-Export.md"), /the name is not 261201-0930-<slug>\.md/],
  ];
  for (const [file, expected] of failures) {
    const result = run(["add", "example", /** @type {string} */ (file)], { home: dir });
    assert.equal(result.code, 1, String(file));
    assert.match(result.out.join("\n"), /** @type {RegExp} */ (expected));
    assert.match(result.out.join("\n"), /Nothing was captured/);
  }

  run(["add", "example", draft("261201-0930")], { home: dir });
  const twice = run(["add", "example", draft("261201-0930", {}, "261201-0930-other.md")], { home: dir });
  assert.match(twice.out[0], /in the backlog of `example` already/);
  assert.equal(git(origin, ["rev-list", "--count", `${start}..main`]).trim(), "1");
});

test("when the default branch moves before the push, the capture is committed again on the new tip", () => {
  const { dir, origin, other, start } = home();
  let pushes = 0;
  const beforePush = () => {
    pushes += 1;
    if (pushes > 1) return;
    writeFiles(other, { "settings.yml": "quiet: 22-07\n" });
    git(other, ["add", "settings.yml"]);
    git(other, ["commit", "-q", "-m", "Merged elsewhere"]);
    git(other, ["push", "-q", "origin", "main"]);
  };
  const result = run(["add", "example", draft("261201-0930")], { home: dir, beforePush });
  assert.equal(result.code, 0, result.out.join("\n"));
  assert.equal(pushes, 2);
  assert.deepEqual(
    git(origin, ["log", "--format=%s", `${start}..main`])
      .trim()
      .split("\n"),
    ["Capture 261201-0930 in the backlog of example", "Merged elsewhere"],
  );
  assert.deepEqual(listed(origin, "backlog/example"), ["backlog/example/261201-0930-export-orders.md"]);
});

test("a record is checked as the template asks, with any kind, since the project's kinds are not in the home", () => {
  const text = fs.readFileSync(draft("261201-0930", { kind: "migration", state: "ready" }), "utf8");
  assert.deepEqual(backlogProblems(text, { name: "261201-0930-export-orders.md", project: "example" }), []);
});
