// Run with: node --test hooks/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { stamp } from "./record-effort.mjs";

const script = fileURLToPath(new URL("./record-effort.mjs", import.meta.url));
const template = fileURLToPath(new URL("../templates/record.md", import.meta.url));

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-test-"));
  const record = path.join(root, "repo", "work", "2026", "11", "261116-1432-export-orders.md");
  fs.mkdirSync(path.dirname(record), { recursive: true });
  fs.copyFileSync(template, record);
  return { root, record };
}

/**
 * @param {unknown} input
 * @param {NodeJS.ProcessEnv} [env]
 */
function hook(input, env = {}) {
  const result = spawnSync(process.execPath, [script], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    env: { ...process.env, CLAUDE_EFFORT: "", ...env },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

/**
 * @param {string} file
 * @param {Record<string, unknown>} [extra]
 */
const edited = (file, extra = {}) => ({
  hook_event_name: "PostToolUse",
  session_id: "s1",
  tool_name: "Edit",
  tool_input: { file_path: file },
  effort: { level: "high" },
  ...extra,
});

/**
 * @param {string} file
 * @param {string} name
 */
function key(file, name) {
  const line = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}:`));
  assert.ok(line, `${file} has no \`${name}\` key`);
  return line.slice(name.length + 2);
}

/** @param {string} text */
const strip = (text) =>
  text
    .split("\n")
    .filter((line) => !line.startsWith("effort:"))
    .join("\n");

test("writes the effort level of the edit into the record", () => {
  const { record } = sandbox();
  const out = hook(edited(record));
  assert.equal(key(record, "effort"), "high");
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /`effort: high`/);
});

test("changes nothing else in the record", () => {
  const { record } = sandbox();
  const before = fs.readFileSync(record, "utf8");
  hook(edited(record));
  assert.equal(strip(fs.readFileSync(record, "utf8")), strip(before));
  assert.equal(key(record, "model"), key(template, "model"));
});

test("the last edit wins", () => {
  const { record } = sandbox();
  hook(edited(record));
  hook(edited(record, { session_id: "s2", effort: { level: "low" } }));
  assert.equal(key(record, "effort"), "low");
});

test("is silent when the record already holds the level", () => {
  const { record } = sandbox();
  hook(edited(record));
  assert.equal(hook(edited(record)), "");
});

test("falls back to CLAUDE_EFFORT when the input has no effort", () => {
  const { record } = sandbox();
  hook(edited(record, { effort: undefined }), { CLAUDE_EFFORT: "medium" });
  assert.equal(key(record, "effort"), "medium");
});

test("writes null when the model has no effort level", () => {
  const { record } = sandbox();
  hook(edited(record));
  hook(edited(record, { effort: undefined }));
  assert.equal(key(record, "effort"), "null");
});

test("skips an edit made inside a subagent", () => {
  const { record } = sandbox();
  assert.equal(hook(edited(record, { agent_id: "agent-1", agent_type: "general-purpose" })), "");
  assert.equal(key(record, "effort"), key(template, "effort"));
});

test("ignores files that are not records", () => {
  const { root, record } = sandbox();
  const elsewhere = path.join(root, "repo", "docs", "notes.md");
  fs.mkdirSync(path.dirname(elsewhere), { recursive: true });
  fs.copyFileSync(template, elsewhere);
  const noKey = path.join(path.dirname(record), "261116-1500-no-key.md");
  const noKeyText = "---\ntitle: x\n---\n\neffort: not front matter\n";
  fs.writeFileSync(noKey, noKeyText);
  assert.equal(hook(edited(elsewhere)), "");
  assert.equal(hook(edited(noKey)), "");
  assert.equal(fs.readFileSync(elsewhere, "utf8"), fs.readFileSync(template, "utf8"));
  assert.equal(fs.readFileSync(noKey, "utf8"), noKeyText);
});

test("ignores other hook events", () => {
  const { record } = sandbox();
  assert.equal(hook(edited(record, { hook_event_name: "PreToolUse" })), "");
  assert.equal(key(record, "effort"), key(template, "effort"));
});

test("keeps Windows line endings", () => {
  const { record } = sandbox();
  fs.writeFileSync(record, fs.readFileSync(record, "utf8").replace(/\r?\n/g, "\r\n"));
  hook(edited(record));
  const text = fs.readFileSync(record, "utf8");
  assert.match(text, /\r\neffort: high\r\n/);
  assert.equal(text.replace(/\r\n/g, "").includes("\n"), false);
});

// A path written with backslashes is a path only on Windows.
test("accepts a Windows path", { skip: process.platform !== "win32" }, () => {
  const { record } = sandbox();
  hook(edited(record.replace(/\//g, "\\")));
  assert.equal(key(record, "effort"), "high");
});

test("resolves a relative path against the working directory of the session", () => {
  const { root, record } = sandbox();
  const repo = path.join(root, "repo");
  hook(edited(path.relative(repo, record), { cwd: repo }));
  assert.equal(key(record, "effort"), "high");
});

test("touches only the front matter", () => {
  const body = "\neffort: in the body\n";
  assert.equal(
    stamp(`---\nmodel: null\neffort: null\n---\n${body}`, "max"),
    `---\nmodel: null\neffort: max\n---\n${body}`,
  );
});

test("never fails on input it does not understand", () => {
  const { record } = sandbox();
  assert.equal(hook("not json"), "");
  assert.equal(hook({}), "");
  assert.equal(hook(edited(path.join(path.dirname(record), "261116-1432-missing.md"))), "");
  hook(edited(record, { effort: { level: "not a level" } }));
  assert.equal(key(record, "effort"), "null");
});
