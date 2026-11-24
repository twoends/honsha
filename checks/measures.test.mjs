import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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
 * @param {string} [more] the sections after the intent
 */
const record = (id, size, kind, more = "") => `---\nid: ${id}\nsize: ${size}\nkind: ${kind}\n---\n\n## Intent\n${more}`;
const APPROVED = "\n## Approval\n\napproved\n";

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

/**
 * A repository on `main` with two merged items whose records have the kind `kind`.
 * @param {string} [kind]
 */
function repository(kind = "gate") {
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
  write(dir, "work/2026/11/261118-1000-small.md", record("261118-1000", "small", kind));
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
  write(dir, "work/2026/11/261118-1200-full.md", record("261118-1200", "full", kind));
  commit(dir, "261118-1200", "Add the record", "2026-11-18T12:10:00Z");
  write(dir, "work/2026/11/261118-1200-full.md", record("261118-1200", "full", kind, APPROVED));
  commit(dir, "261118-1200", "Record the approval", "2026-11-18T13:10:00Z");
  write(dir, "a.md", "a, changed again\n");
  write(dir, "b.md", "b, changed\n");
  write(dir, "work/2026/11/261118-1000-small.md", `${record("261118-1000", "small", kind)}touched later\n`);
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
  assert.equal(small.newFiles, 1);
  assert.equal(small.added, 9);
  assert.equal(small.removed, 1);
  assert.equal(small.over, false);

  assert.equal(full.id, "261118-1200");
  assert.equal(full.commits, 4);
  assert.equal(full.agentMinutes, 10 + 30);
  assert.equal(full.approvalMinutes, 60);
  assert.equal(full.reviewMinutes, 20);
  assert.equal(full.existing, 2, "the earlier record it touched is left out");
  assert.equal(full.newFiles, 0);
  assert.equal(full.over, true);
  assert.match(describe(full), /2 existing files \(expected at most 1\) OVER, 0 new$/u);
});

test("an item that grew to full has its strategy and approval at the commits that open and close its gate", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-measures-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "user.email", "test@example.org"]);
  write(dir, "a.md", "a\n");
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", "Start"], "2026-11-18T09:00:00Z");

  // Created 15:00. The default branch merged in at 15:10, before the record: a merge that opened the gate would put
  // the strategy there. Work at small 15:20, stop 15:30, strategy 15:40, approval 16:40, delivered 17:10, merged 17:30.
  const id = "261118-1500";
  const file = `work/2026/11/${id}-grown.md`;
  const deviation = "\n## Deviations\n\nThe item grew from small.\n";
  git(dir, ["switch", "-q", "-c", `work/${id}-grown`]);
  git(dir, ["switch", "-q", "main"]);
  write(dir, "b.md", "b\n");
  commit(dir, "261118-1400", "Do another item", "2026-11-18T15:05:00Z");
  git(dir, ["switch", "-q", `work/${id}-grown`]);
  git(
    dir,
    ["merge", "-q", "--no-ff", "-m", `Merge the default branch\n\nWork-Item: ${id}`, "main"],
    "2026-11-18T15:10:00Z",
  );
  write(dir, file, record(id, "small", "fix"));
  write(dir, "a.md", "a, changed\n");
  commit(dir, id, "Do the work at small", "2026-11-18T15:20:00Z");
  write(dir, file, record(id, "small", "fix", "\n## Log\n\nStopped: the item outgrows small.\n"));
  commit(dir, id, "Stop", "2026-11-18T15:30:00Z");
  write(dir, file, record(id, "full", "fix", deviation));
  commit(dir, id, "Write the strategy", "2026-11-18T15:40:00Z");
  write(dir, file, record(id, "full", "fix", `${deviation}${APPROVED}`));
  commit(dir, id, "Record the approval", "2026-11-18T16:40:00Z");
  write(dir, "a.md", "a, changed again\n");
  commit(dir, id, "Finish the work", "2026-11-18T17:00:00Z");
  commit(dir, id, "Close it", "2026-11-18T17:10:00Z");
  git(dir, ["switch", "-q", "main"]);
  git(dir, ["merge", "-q", "--no-ff", "-m", `Merge work/${id}-grown`, `work/${id}-grown`], "2026-11-18T17:30:00Z");

  const grown = measure({ cwd: dir, ref: "main" }).find((item) => item.id === id);
  assert.equal(grown?.size, "full");
  assert.equal(grown?.approvalMinutes, 60);
  assert.equal(grown?.agentMinutes, 40 + 30);
  assert.equal(grown?.reviewMinutes, 20);
});

const SCRIPT = fileURLToPath(new URL("measures.mjs", import.meta.url));

/**
 * Runs the script as a command in `dir`. `--sessions` is always given, so the machine's own session files are never read.
 * @param {string} dir
 * @param {string[]} args
 */
const run = (dir, args) => execFileSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: "utf8" });

/**
 * A session folder with one response on the small item's branch and one line that cannot be read.
 * @param {string} dir
 */
function sessionFolder(dir) {
  const folder = path.join(dir, "sessions");
  const response = {
    type: "assistant",
    timestamp: "2026-11-18T10:05:00Z",
    gitBranch: "work/261118-1000-small",
    cwd: "elsewhere",
    message: {
      id: "r1",
      model: "model-a",
      usage: { input_tokens: 1, output_tokens: 7, cache_read_input_tokens: 100, cache_creation_input_tokens: 5 },
    },
  };
  write(folder, "project/session-1.jsonl", `${JSON.stringify(response)}\nnot json\n`);
  return folder;
}

test("the command reads the profile's default branch and kinds, and the session folder it is given", () => {
  const dir = repository("fix");
  // On the first commit, HEAD holds no merge: the items come only from the profile's default branch.
  git(dir, ["switch", "-q", "--detach", "main~2"]);
  const sessions = sessionFolder(fs.mkdtempSync(path.join(os.tmpdir(), "honsha-measures-sessions-")));
  write(dir, ".hub/profile.yml", "default-branch: main\nkinds:\n  fix: 1\n");

  assert.deepEqual(run(dir, ["--sessions", sessions]).split("\n"), [
    "261118-1000 small fix: agent 30 min, review 30 min; 2 commits, +9 -1; 1 existing files (expected at most 1), " +
      "1 new; 1 responses, active 1 min; model-a: 7 out, 1 in, 100 cache read, 5 cache written",
    "261118-1200 full fix: agent 40 min, approval 60 min, review 20 min; 4 commits, +14 -2; " +
      "2 existing files (expected at most 1) OVER, 0 new; no session data",
    "1 lines of the session files could not be read",
    "",
  ]);

  const report = JSON.parse(run(dir, ["--json", "--sessions", sessions]));
  assert.deepEqual(Object.keys(report), ["items", "unreadableSessionLines"]);
  assert.equal(report.unreadableSessionLines, 1);
  const [small, full] = report.items;
  assert.equal(report.items.length, 2);
  assert.deepEqual(small.usage, {
    responses: 1,
    total: { input: 1, output: 7, cacheRead: 100, cacheWrite: 5 },
    models: { "model-a": { input: 1, output: 7, cacheRead: 100, cacheWrite: 5 } },
    activeMinutes: 1,
  });
  assert.equal(full.usage, null);
  assert.equal(full.expected, 1);
  assert.equal(full.over, true);
});

test("the command falls back to the default kinds on an empty map, and reports no session data without the folder", () => {
  const dir = repository("fix");
  write(dir, ".hub/profile.yml", "default-branch: main\nkinds: {}\n");
  const missing = path.join(dir, "no-such-folder");

  const lines = run(dir, ["--sessions", missing]).split("\n");
  assert.equal(lines.length, 3, "two items, and no line on unreadable session lines");
  assert.match(lines[0], /1 existing files \(expected at most 5\), 1 new; no session data$/u);
  assert.match(lines[1], /2 existing files \(expected at most 5\), 0 new; no session data$/u);
  assert.equal(lines[2], "");

  const report = JSON.parse(run(dir, ["--json", "--sessions", missing]));
  assert.equal(report.unreadableSessionLines, null);
  assert.deepEqual(
    report.items.map((/** @type {{ expected: number, over: boolean, usage: unknown }} */ item) => [
      item.expected,
      item.over,
      item.usage,
    ]),
    [
      [5, false, null],
      [5, false, null],
    ],
  );
});
