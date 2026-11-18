import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createdAt, describe, measure } from "./measures.mjs";

/**
 * Runs git in `dir` with the commit times set to `when`, so that the measured intervals are known.
 * @param {string} dir
 * @param {string[]} args
 * @param {string} [when]
 */
function git(dir, args, when = "2026-11-18T10:00:00Z") {
  return execFileSync("git", args, {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when },
  });
}

/**
 * @param {string} dir
 * @param {string} file
 * @param {string} text
 */
function write(dir, file, text) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
}

/**
 * @param {string} id
 * @param {string} size
 * @param {string} kind
 */
const record = (id, size, kind) => `---\nid: ${id}\nsize: ${size}\nkind: ${kind}\n---\n\n## Intent\n`;

/**
 * Commits everything with the trailer of `id`.
 * @param {string} dir
 * @param {string} id
 * @param {string} subject
 * @param {string} when
 */
function commit(dir, id, subject, when) {
  git(dir, ["add", "-A"], when);
  git(dir, ["commit", "-q", "--allow-empty", "-m", `${subject}\n\nWork-Item: ${id}`], when);
}

function repository() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-measures-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "user.email", "test@example.org"]);
  write(dir, "a.md", "a\n");
  write(dir, "b.md", "b\n");
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", "Start"], "2026-11-18T09:00:00Z");

  // A small item: created 10:00, delivered 10:30, merged 11:00; changes one existing file, adds one.
  git(dir, ["switch", "-q", "-c", "work/261118-1000-small"]);
  write(dir, "work/2026/11/261118-1000-small.md", record("261118-1000", "small", "gate"));
  write(dir, "a.md", "a, changed\n");
  write(dir, "c.md", "new\n");
  commit(dir, "261118-1000", "Do the small item", "2026-11-18T10:20:00Z");
  commit(dir, "261118-1000", "Close it", "2026-11-18T10:30:00Z");
  git(dir, ["switch", "-q", "main"]);
  git(
    dir,
    ["merge", "-q", "--no-ff", "-m", "Merge work/261118-1000-small", "work/261118-1000-small"],
    "2026-11-18T11:00:00Z",
  );

  // A full item: created 12:00, strategy 12:10, approval 13:10, delivered 13:40, merged 14:00; changes two existing
  // files, which is over the one a gate is expected to touch.
  git(dir, ["switch", "-q", "-c", "work/261118-1200-full"]);
  write(dir, "work/2026/11/261118-1200-full.md", record("261118-1200", "full", "gate"));
  commit(dir, "261118-1200", "Add the record", "2026-11-18T12:10:00Z");
  write(dir, "work/2026/11/261118-1200-full.md", `${record("261118-1200", "full", "gate")}approved\n`);
  commit(dir, "261118-1200", "Record the approval", "2026-11-18T13:10:00Z");
  write(dir, "a.md", "a, changed again\n");
  write(dir, "b.md", "b, changed\n");
  commit(dir, "261118-1200", "Do the full item", "2026-11-18T13:30:00Z");
  commit(dir, "261118-1200", "Close it", "2026-11-18T13:40:00Z");
  git(dir, ["switch", "-q", "main"]);
  git(
    dir,
    ["merge", "-q", "--no-ff", "-m", "Merge work/261118-1200-full", "work/261118-1200-full"],
    "2026-11-18T14:00:00Z",
  );
  return dir;
}

test("an identifier stands for its creation time in UTC", () => {
  assert.equal(createdAt("261118-1103"), Date.UTC(2026, 10, 18, 11, 3));
});

test("measures every merged item from git, and marks the one over its kind's expectation", () => {
  const items = measure({ cwd: repository(), ref: "main", kinds: { gate: 1 } });
  assert.equal(items.length, 2);
  const [small, full] = items;

  assert.equal(small.id, "261118-1000");
  assert.equal(small.agentMinutes, 30);
  assert.equal(small.approvalMinutes, null);
  assert.equal(small.reviewMinutes, 30);
  assert.equal(small.existing, 1);
  assert.equal(small.over, false);

  assert.equal(full.id, "261118-1200");
  assert.equal(full.commits, 4);
  assert.equal(full.agentMinutes, 10 + 30);
  assert.equal(full.approvalMinutes, 60);
  assert.equal(full.reviewMinutes, 20);
  assert.equal(full.existing, 2);
  assert.equal(full.over, true);
  assert.match(describe(full), /2 existing files \(expected at most 1\) OVER$/u);
});
