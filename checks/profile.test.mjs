// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parseProfile, readProfile } from "./profile.mjs";

test("reads the three keys in their plain forms", () => {
  const profile = parseProfile(
    [
      "name: example-project",
      "default-branch: trunk # the name this project uses",
      "areas:",
      '  backend: { paths: ["src/**"] }',
      "verify:",
      "  - npm run check",
      "  # a comment between two commands",
      "  - 'node --test \"tests/*.mjs\"'",
      '  - "npm run lint -- --quiet" # with a comment',
      "gates:",
      "  - tests added or updated",
      "commits:",
      "  address: '@example\\.org$'",
      "lessons: MEMORY.md",
    ].join("\n"),
  );
  assert.equal(profile.defaultBranch, "trunk");
  assert.deepEqual(profile.verify, ["npm run check", 'node --test "tests/*.mjs"', "npm run lint -- --quiet"]);
  assert.equal(profile.commitsAddress, "@example\\.org$");
});

test("a profile without the keys gives nothing to run and nothing to match", () => {
  assert.deepEqual(parseProfile("name: example-project\n"), {
    defaultBranch: null,
    directCommits: false,
    verify: [],
    commitsAddress: null,
    kinds: null,
  });
  assert.deepEqual(parseProfile("verify: []\ncommits: {}\n").verify, []);
});

test("reads whether the default branch takes direct commits, and refuses any other value", () => {
  assert.equal(parseProfile("direct-commits: true\n").directCommits, true);
  assert.equal(parseProfile("direct-commits: false # a project\n").directCommits, false);
  assert.equal(parseProfile("direct-commits: 'true'\n").directCommits, true);
  for (const value of ["yes", "True", "1", ""]) {
    assert.throws(() => parseProfile(`direct-commits: ${value}\n`), /direct-commits/);
  }
});

test("reads a list that is not indented, and Windows line endings", () => {
  assert.deepEqual(parseProfile("verify:\r\n- one\r\n- two\r\nname: x\r\n").verify, ["one", "two"]);
});

test("reads the address from a map written on one line", () => {
  assert.equal(parseProfile("commits: { address: '@example\\.org$' }\n").commitsAddress, "@example\\.org$");
});

test("refuses a form it does not read, instead of passing in silence", () => {
  assert.throws(() => parseProfile("verify: [npm run check]\n"), /verify/);
  assert.throws(() => parseProfile("verify: npm run check\n"), /verify/);
  assert.throws(() => parseProfile("verify:\n  - \n"), /empty command/);
  assert.throws(() => parseProfile("commits: yes\n"), /commits/);
  assert.throws(() => parseProfile("commits:\n  address: '('\n"), /regular expression/);
});

test("a missing file is no profile", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-profile-"));
  assert.equal(readProfile(path.join(dir, "profile.yml")), null);
  fs.writeFileSync(path.join(dir, "profile.yml"), "default-branch: main\n");
  assert.equal(readProfile(path.join(dir, "profile.yml"))?.defaultBranch, "main");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("the kit's own profile is one the reader accepts", () => {
  const profile = readProfile(new URL("../.hub/profile.yml", import.meta.url));
  assert.ok(profile);
  assert.equal(profile.defaultBranch, "main");
  assert.ok(profile.verify.length > 0);
  assert.ok(profile.commitsAddress);
});

test("reads the kinds and the most existing files each may touch", () => {
  const profile = parseProfile("kinds:\n  gate: 1\n  rule: 3 # rules live in one place\nname: x\n");
  assert.deepEqual(profile.kinds, { gate: 1, rule: 3 });
  assert.deepEqual(parseProfile("kinds: {}\n").kinds, {});
});

test("refuses a kind without a whole number, and kinds in another form", () => {
  assert.throws(() => parseProfile("kinds:\n  gate: one\n"), /whole number/u);
  assert.throws(() => parseProfile("kinds: gate\n"), /must be a map/u);
});
