import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { attribute, describeUsage, readResponses, sessionsDir } from "./sessions.mjs";

const ROOT = "C:\\Projects\\example";

/**
 * A line of a session file for one response.
 * @param {{ id: string, at: string, branch?: string, cwd?: string, model?: string, output?: number }} response
 */
function line({ id, at, branch = "main", cwd = ROOT, model = "model-a", output = 10 }) {
  return JSON.stringify({
    type: "assistant",
    timestamp: at,
    gitBranch: branch,
    cwd,
    message: {
      id,
      model,
      usage: { input_tokens: 1, output_tokens: output, cache_read_input_tokens: 100, cache_creation_input_tokens: 5 },
    },
  });
}

function sessions() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-sessions-"));
  const project = path.join(dir, "C--Projects-example");
  fs.mkdirSync(path.join(project, "session-1", "subagents"), { recursive: true });
  fs.writeFileSync(
    path.join(project, "session-1.jsonl"),
    [
      JSON.stringify({ type: "user", message: { content: "not counted" } }),
      // One response streamed on two lines: the last one counts.
      line({ id: "r1", at: "2026-11-18T10:05:00Z", branch: "work/261118-1000-small", output: 3 }),
      line({ id: "r1", at: "2026-11-18T10:05:10Z", branch: "work/261118-1000-small", output: 7 }),
      line({ id: "r2", at: "2026-11-18T10:06:00Z", branch: "work/261118-1000-small", model: "model-b", output: 20 }),
      // On the default branch, in the repository's folder, inside the full item's window only.
      line({ id: "r3", at: "2026-11-18T12:30:00Z" }),
      // On the default branch at a time no window holds.
      line({ id: "r4", at: "2026-11-18T09:00:00Z" }),
      // On the default branch inside a window, but in another folder.
      line({ id: "r5", at: "2026-11-18T12:31:00Z", cwd: "C:\\Projects\\other" }),
      '{"type":"assistant", not json',
      JSON.stringify({ type: "assistant", timestamp: "2026-11-18T10:07:00Z", message: { content: "no id, no usage" } }),
    ].join("\n"),
  );
  // A subagent on the full item's branch, in another folder: the branch is enough.
  fs.writeFileSync(
    path.join(project, "session-1", "subagents", "agent-x.jsonl"),
    line({ id: "r6", at: "2026-11-18T13:00:00Z", branch: "work/261118-1200-full", cwd: "C:\\elsewhere", output: 50 }),
  );
  return dir;
}

const WINDOWS = [
  { id: "261118-1000", created: Date.parse("2026-11-18T10:00:00Z"), delivered: Date.parse("2026-11-18T10:30:00Z") },
  { id: "261118-1200", created: Date.parse("2026-11-18T12:00:00Z"), delivered: Date.parse("2026-11-18T13:40:00Z") },
];

test("the session folder follows CLAUDE_CONFIG_DIR", () => {
  assert.equal(sessionsDir({ CLAUDE_CONFIG_DIR: "/config" }), path.join("/config", "projects"));
});

test("a missing folder gives no data", () => {
  assert.equal(readResponses(path.join(os.tmpdir(), "honsha-no-such-folder")), null);
});

test("reads one response per message, skips what it cannot read, and attributes by branch, then by window", () => {
  const read = readResponses(sessions());
  assert.ok(read);
  assert.equal(read.responses.length, 6);
  assert.equal(read.skipped, 2);

  const usage = attribute(read.responses, WINDOWS, "c:/projects/example/");
  const small = usage.get("261118-1000");
  const full = usage.get("261118-1200");
  assert.ok(small && full);

  assert.equal(small.responses, 2);
  assert.equal(small.output, 7 + 20, "the streamed response counts once, with its last line");
  assert.equal(small.input, 2);
  assert.equal(small.cacheRead, 200);
  assert.equal(small.cacheWrite, 10);
  assert.deepEqual(small.models, { "model-a": 7, "model-b": 20 });
  assert.equal(small.activeMinutes, 2);

  assert.equal(full.responses, 2, "the subagent by its branch, r3 by the window; r4 and r5 are left out");
  assert.equal(full.output, 10 + 50);
  assert.equal(usage.size, 2);
  assert.match(describeUsage(small), /^2 responses, 27 output and 2 input tokens, .*model-b, model-a; active 2 min$/u);
});

test("a response on the default branch that two windows hold is left out", () => {
  const read = readResponses(sessions());
  assert.ok(read);
  const overlapping = [
    ...WINDOWS,
    { id: "261118-1215", created: Date.parse("2026-11-18T12:15:00Z"), delivered: Date.parse("2026-11-18T12:45:00Z") },
  ];
  assert.equal(attribute(read.responses, overlapping, ROOT).get("261118-1200")?.responses, 1);
});
