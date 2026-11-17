// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { run } from "./verify.mjs";

const script = fileURLToPath(new URL("./verify.mjs", import.meta.url));

/** @param {string | null} profile */
function runner(profile) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-verify-"));
  const file = path.join(dir, "profile.yml");
  if (profile !== null) fs.writeFileSync(file, profile);
  const result = spawnSync(process.execPath, [script, file], { cwd: dir, encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test("runs the commands in order and stops at the first that fails", () => {
  /** @type {string[]} */
  const seen = [];
  /** @param {string} command */
  const spawn = (command) => {
    seen.push(command);
    return { status: command === "two" ? 3 : 0 };
  };
  assert.equal(run(["one", "two", "three"], { spawn, log: () => {} }), false);
  assert.deepEqual(seen, ["one", "two"]);
  assert.equal(run(["one", "three"], { spawn, log: () => {} }), true);
});

test("says for each command whether it passed", () => {
  /** @type {string[]} */
  const lines = [];
  run(["one", "two"], { spawn: (command) => ({ status: command === "two" ? 3 : 0 }), log: (line) => lines.push(line) });
  assert.ok(lines.includes("passed: one"));
  assert.ok(lines.includes("failed (exit code 3): two"));
});

test("the exit code is 0 when every command of the profile passes", () => {
  const result = runner('verify:\n  - node -e "process.exit(0)"\n  - node -e "console.log(40 + 2)"\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /42/);
  assert.match(result.stdout, /All 2 verification commands passed/);
});

test("the exit code is 1 when a command fails, and the commands after it do not run", () => {
  const result = runner('verify:\n  - node -e "process.exit(3)"\n  - node -e "console.log(40 + 2)"\n');
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout, /42/);
  assert.match(result.stdout, /Verification failed/);
});

test("a profile with no commands passes, a missing or unreadable profile fails", () => {
  assert.equal(runner("name: example-project\n").status, 0);
  assert.equal(runner(null).status, 1);
  const unreadable = runner("verify: [npm run check]\n");
  assert.equal(unreadable.status, 1);
  assert.match(unreadable.stderr, /verify/);
});
