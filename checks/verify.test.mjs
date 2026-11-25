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

/**
 * @param {string | null} profile
 * @param {string[]} [flags]
 */
function runner(profile, flags = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-verify-"));
  const file = path.join(dir, "profile.yml");
  if (profile !== null) fs.writeFileSync(file, profile);
  const result = spawnSync(process.execPath, [script, ...flags, file], { cwd: dir, encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const both = [
  "verify:",
  "  - node -e \"console.log('verified')\"",
  "setup:",
  "  - node -e \"console.log('first')\"",
  "  - node -e \"console.log('second')\"",
  "",
].join("\n");

test("with --setup it runs the profile's setup commands in order, and not its verification commands", () => {
  const result = runner(both, ["--setup"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /first[^]*second/);
  assert.doesNotMatch(result.stdout, /verified/);
  assert.match(result.stdout, /All 2 setup commands passed/);
  const plain = runner(both);
  assert.match(plain.stdout, /verified/);
  assert.doesNotMatch(plain.stdout, /first/);
});

test("with --setup it stops at the first command that fails, and says so when there are none", () => {
  const failing = runner('setup:\n  - node -e "process.exit(4)"\n  - node -e "console.log(40 + 2)"\n', ["--setup"]);
  assert.equal(failing.status, 1);
  assert.doesNotMatch(failing.stdout, /42/);
  assert.match(failing.stdout, /failed \(exit code 4\)[^]*Setup failed/);
  const none = runner("verify:\n  - npm run check\n", ["--setup"]);
  assert.equal(none.status, 0);
  assert.match(none.stdout, /lists no setup commands/);
  assert.equal(runner(null, ["--setup"]).status, 1);
});

const all = [
  "verify:",
  "  - node -e \"console.log('verified')\"",
  "dynamic-testing:",
  "  - node -e \"console.log('started')\"",
  "  - node -e \"console.log('scanned')\"",
  "setup:",
  "  - node -e \"console.log('installed')\"",
  "",
].join("\n");

test("with --dynamic it runs the profile's dynamic testing commands in order, and no other list", () => {
  const result = runner(all, ["--dynamic"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /started[^]*scanned/);
  assert.doesNotMatch(result.stdout, /verified|installed/);
  assert.match(result.stdout, /All 2 dynamic testing commands passed/);
  const plain = runner(all);
  assert.match(plain.stdout, /verified/);
  assert.doesNotMatch(plain.stdout, /started|installed/);
});

test("with --dynamic it stops at the first command that fails, and says so when there are none", () => {
  const failing = runner('dynamic-testing:\n  - node -e "process.exit(2)"\n  - node -e "console.log(40 + 2)"\n', [
    "--dynamic",
  ]);
  assert.equal(failing.status, 1);
  assert.doesNotMatch(failing.stdout, /42/);
  assert.match(failing.stdout, /failed \(exit code 2\)[^]*Dynamic testing failed/);
  const none = runner("verify:\n  - npm run check\n", ["--dynamic"]);
  assert.equal(none.status, 0);
  assert.match(none.stdout, /lists no dynamic testing commands/);
  assert.equal(runner(null, ["--dynamic"]).status, 1);
});

test("refuses two flags together and a flag it does not know, and runs nothing", () => {
  for (const flags of [["--setup", "--dynamic"], ["--dynamic", "--dynamic"], ["--static"]]) {
    const result = runner(all, flags);
    assert.equal(result.status, 1, flags.join(" "));
    assert.match(result.stderr, /Usage: node checks\/verify\.mjs \[--setup \| --dynamic\]/);
    assert.doesNotMatch(result.stdout, /verified|started|installed/);
  }
});

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
