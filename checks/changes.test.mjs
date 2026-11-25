// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { RECORD, judge, shown } from "./changes.mjs";

const script = fileURLToPath(new URL("./changes.mjs", import.meta.url));
const WORK = "work/2026/11/261124-1626-push-only-verified-work.md";
const BACKLOG = "backlog/example-shop/261125-0900-export-orders.md";
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/** A repository with a record, a file of code and a commit of each, that reads no configuration but its own. */
function repository() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-changes-"));
  made.push(dir);
  const empty = path.join(dir, "no-config");
  fs.writeFileSync(empty, "");
  /**
   * @param {string[]} args
   * @param {string} [input]
   */
  const git = (args, input) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      input,
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: empty,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Worker",
        GIT_AUTHOR_EMAIL: "worker@example.org",
        GIT_COMMITTER_NAME: "Worker",
        GIT_COMMITTER_EMAIL: "worker@example.org",
      },
    }).trim();
  /**
   * Writes each file, or deletes it when its text is null, and commits; returns the commit.
   * @param {Record<string, string | null>} files
   */
  const commit = (files) => {
    for (const [file, text] of Object.entries(files)) {
      const at = path.join(dir, file);
      if (text === null) fs.rmSync(at);
      else {
        fs.mkdirSync(path.dirname(at), { recursive: true });
        fs.writeFileSync(at, text);
      }
    }
    git(["add", "-A", "--", "."]);
    git(["commit", "-q", "--allow-empty", "-m", "Change"]);
    return git(["rev-parse", "HEAD"]);
  };
  git(["init", "-q", "-b", "main", "."]);
  fs.writeFileSync(path.join(dir, ".gitignore"), "no-config\n");
  const start = commit({ ".gitignore": "no-config\n", [WORK]: "# Record\n", "src/app.js": "export {};\n" });
  return { dir, git, commit, start };
}

/**
 * The script's exit code and output, run from `dir`.
 * @param {string} dir
 * @param {string[]} args
 */
function run(dir, args) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: "utf8" });
  return { status: result.status, output: result.stdout + result.stderr };
}

test("a record is a work item's or one of a backlog, and nothing else", () => {
  for (const file of [WORK, BACKLOG]) assert.match(file, RECORD);
  for (const file of [
    "work/README.md",
    "work/2026/11/notes.txt",
    "work/2026/11/261124-1626-push-only-verified-work.md.orig",
    "work/2026/11/sub/261124-1626-x.md",
    "backlog/example-shop/notes.md",
    "backlog/Example/261125-0900-export-orders.md",
    "src/work/2026/11/261124-1626-x.md",
    "registry.yml",
  ]) {
    assert.doesNotMatch(file, RECORD, file);
  }
});

test("commits that change, add or delete only records exit 0", () => {
  const { dir, commit, start } = repository();
  const changed = commit({ [WORK]: "# Record\n\n## Log\n" });
  assert.equal(run(dir, [start, changed]).status, 0);
  const added = commit({ [BACKLOG]: "# Captured\n" });
  const deleted = commit({ [BACKLOG]: null });
  assert.equal(run(dir, [changed, added]).status, 0);
  assert.equal(run(dir, [added, deleted]).status, 0);
  assert.equal(run(dir, [start, deleted]).status, 0);
  assert.equal(judge([start, deleted], dir).only, true);
});

test("commits that change no file at all exit 0", () => {
  const { dir, commit, start } = repository();
  const nothing = commit({});
  const { status, output } = run(dir, [start, nothing]);
  assert.equal(status, 0);
  assert.match(output, /No file differs/);
});

test("a change to any other file exits 1 and names it", () => {
  const { dir, commit, start } = repository();
  const both = commit({ [WORK]: "# Record, again\n", "src/app.js": "export const a = 1;\n" });
  const { status, output } = run(dir, [start, both]);
  assert.equal(status, 1);
  assert.match(output, /^src\/app\.js is not a record/);
});

test("a file's name is printed with no command to the runner in it", () => {
  assert.equal(shown("src/app-1_v2.js"), "src/app-1_v2.js");
  assert.equal(shown('a b#[]:;="\n'), "a%20b%23%5B%5D%3A%3B%3D%22%0A");
  assert.equal(shown("è"), "%C3%A8");
  const { dir, git, start } = repository();
  // Built without the working tree, where this system may refuse such names.
  const blob = git(["hash-object", "-w", "--stdin"], "code\n");
  const entries = git(["ls-tree", "-z", start]);
  for (const name of [
    "!\n::set-output name=verify::false\n!",
    "::notice::Only records",
    "##[set-output name=verify;]false",
    "x\r##[add-mask]y",
  ]) {
    const tree = git(["mktree", "-z"], `${entries}100644 blob ${blob}\t${name}\0`);
    const head = git(["commit-tree", tree, "-p", start, "-m", "Change"]);
    const { status, output } = run(dir, [start, head]);
    assert.equal(status, 1, name);
    assert.match(output, /is not a record/, name);
    for (const line of output.split(/\r?\n|\r/)) {
      assert.ok(!line.startsWith("::") && !line.includes("##["), JSON.stringify(line));
    }
  }
});

test("a file under work/ that is not a record exits 1", () => {
  const { dir, commit, start } = repository();
  const notes = commit({ "work/2026/11/notes.txt": "notes\n" });
  assert.equal(run(dir, [start, notes]).status, 1);
});

test("a file moved into work/ or out of it counts by both its paths, and exits 1", () => {
  const { dir, git, commit, start } = repository();
  git(["mv", "src/app.js", "work/2026/11/261124-1700-moved-code.md"]);
  const into = commit({});
  assert.equal(run(dir, [start, into]).status, 1);
  fs.mkdirSync(path.join(dir, "docs"));
  git(["mv", WORK, "docs/record.md"]);
  const out = commit({});
  assert.equal(run(dir, [into, out]).status, 1);
});

test("a merge that brings another file exits 1", () => {
  const { dir, git, commit, start } = repository();
  git(["checkout", "-q", "-b", "work/261124-1626-push-only-verified-work"]);
  const record = commit({ [WORK]: "# Record\n\n## Strategy\n" });
  git(["checkout", "-q", "main"]);
  commit({ "src/app.js": "export const b = 2;\n" });
  git(["checkout", "-q", "work/261124-1626-push-only-verified-work"]);
  git(["merge", "-q", "--no-edit", "main"]);
  const merged = git(["rev-parse", "HEAD"]);
  assert.equal(run(dir, [record, merged]).status, 1);
  assert.equal(run(dir, [start, record]).status, 0);
});

test("whatever it cannot tell exits 1: no earlier tip, a commit the clone lacks, an argument that is no commit", () => {
  const { dir, commit, start } = repository();
  const head = commit({ [WORK]: "# Record, again\n" });
  const cases = [
    { args: ["", head], says: /not a commit's identifier/ },
    { args: ["0".repeat(40), head], says: /no earlier tip/ },
    { args: ["1234567890abcdef1234567890abcdef12345678", head], says: /git cannot compare/ },
    { args: ["--output=changed.txt", head], says: /not a commit's identifier/ },
    { args: ["HEAD~1", "HEAD"], says: /not a commit's identifier/ },
    { args: [start.toUpperCase(), head], says: /not a commit's identifier/ },
    { args: [start], says: /Usage/ },
    { args: [start, head, head], says: /Usage/ },
  ];
  for (const { args, says } of cases) {
    const { status, output } = run(dir, args);
    assert.equal(status, 1, args.join(" "));
    assert.match(output, says, args.join(" "));
  }
  assert.equal(fs.existsSync(path.join(dir, "changed.txt")), false);
});
