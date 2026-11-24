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
    verify: [],
    setup: [],
    commitsAddress: null,
    kinds: null,
    public: false,
    stack: [],
    lessons: null,
    securityReview: [],
  });
  assert.deepEqual(parseProfile("verify: []\ncommits: {}\n").verify, []);
});

test("reads the setup commands as the verification commands, one on each line, apart from them", () => {
  const text = 'setup:\n  - npm ci --prefix app\n  - "npm run build" # then the build\nverify:\n  - npm test\n';
  const profile = parseProfile(text);
  assert.deepEqual(profile.setup, ["npm ci --prefix app", "npm run build"]);
  assert.deepEqual(profile.verify, ["npm test"]);
  assert.deepEqual(parseProfile("setup: []\n").setup, []);
});

test("reads the stack, inline or as a list, and the file of the project's lessons", () => {
  const inline = parseProfile("stack: [node, 'postgres', docker] # the tools\nlessons: MEMORY.md\n");
  assert.deepEqual(inline.stack, ["node", "postgres", "docker"]);
  assert.equal(inline.lessons, "MEMORY.md");
  assert.deepEqual(parseProfile("stack:\n  - node\n  - c++\n").stack, ["node", "c++"]);
  assert.deepEqual(parseProfile("stack: []\n").stack, []);
});

test("refuses a stack that is not a list, a technology that could leave the lessons' folder, and an empty lessons", () => {
  assert.throws(() => parseProfile("stack: node\n"), /`stack` must be a list/);
  for (const technology of ["../secrets", "a/b", ".hidden"]) {
    assert.throws(() => parseProfile(`stack: [${technology}]\n`), /is not the name of a technology/);
  }
  assert.throws(() => parseProfile("lessons:\n"), /`lessons` must name a file/);
  for (const file of ["../LESSONS.md", "docs/../../x.md", "/etc/lessons.md", "C:/lessons.md", "\\\\server\\x.md"]) {
    assert.throws(() => parseProfile(`lessons: '${file}'\n`), /`lessons` must name a file inside the project/, file);
  }
  assert.equal(parseProfile("lessons: docs/lessons.md\n").lessons, "docs/lessons.md");
});

test("reads whether the project is public, and refuses any other value", () => {
  assert.equal(parseProfile("public: true\n").public, true);
  assert.equal(parseProfile("public: false # a private project\n").public, false);
  for (const value of ["yes", "1", ""]) {
    assert.throws(() => parseProfile(`public: ${value}\n`), /`public` must be true or false/);
  }
});

test("refuses a profile that declares direct commits, whatever their value", () => {
  for (const value of ["true", "false # a project", "'true'", '"false"', "yes", ""]) {
    assert.throws(
      () => parseProfile(`default-branch: main\ndirect-commits: ${value}\n`),
      /`direct-commits` no longer exists: the default branch changes only through pull requests/,
    );
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
  assert.throws(() => parseProfile("setup: [npm ci]\n"), /`setup` must be a list/);
  assert.throws(() => parseProfile("setup: npm ci\n"), /`setup` must be a list/);
  assert.throws(() => parseProfile("setup:\n  - \n"), /`setup` holds an empty command/);
  // An indented line that is no item would end the list there, and the commands after it would not run.
  assert.throws(() => parseProfile("setup:\n  npm ci --prefix app\n"), /`setup` must be a list/);
  assert.throws(() => parseProfile("verify:\n  - npm test\n  npm run lint\n"), /`verify` must be a list/);
  assert.deepEqual(parseProfile("verify:\n  - npm test\n  # a note\n\ngates:\n  - one\n").verify, ["npm test"]);
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

test("the profile's template is one the reader accepts, with every key the reader reads", () => {
  const profile = readProfile(new URL("../templates/profile.yml", import.meta.url));
  assert.deepEqual(profile, {
    defaultBranch: "main",
    verify: ["npm run check"],
    setup: ["npm ci --ignore-scripts"],
    commitsAddress: "@example\\.org$",
    kinds: { feature: 10, fix: 5, upkeep: 5 },
    public: false,
    stack: ["node", "postgres", "docker"],
    lessons: "LESSONS.md",
    securityReview: [],
  });
});

test("the kit's own profile is one the reader accepts", () => {
  const profile = readProfile(new URL("../.hub/profile.yml", import.meta.url));
  assert.ok(profile);
  assert.equal(profile.defaultBranch, "main");
  assert.ok(profile.verify.length > 0);
  assert.deepEqual(profile.setup, ["npm ci --ignore-scripts"]);
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

test("reads the paths whose change calls for the security review, quoted or bare, one on each line", () => {
  const text = [
    "security-review:",
    '  - "deploy/**"',
    "  # the keys",
    "  - '**/*.pem'",
    "  - .env # at the root only",
    "name: x",
  ].join("\n");
  assert.deepEqual(parseProfile(text).securityReview, ["deploy/**", "**/*.pem", ".env"]);
  assert.deepEqual(parseProfile("security-review: []\n").securityReview, []);
  assert.deepEqual(parseProfile("name: x\n").securityReview, []);
});

test("refuses a form of `security-review` it does not read, and a pattern that would match nothing in silence", () => {
  for (const form of [
    "security-review: deploy/**\n",
    "security-review: [deploy/**]\n",
    "security-review:\n  deploy/**\n",
  ]) {
    assert.throws(
      () => parseProfile(form),
      /`security-review` must be a list with one path pattern on each line/,
      form,
    );
  }
  for (const empty of ['  - ""\n', "  - ''\n", "  - \n"]) {
    assert.throws(() => parseProfile(`security-review:\n${empty}`), /`security-review` holds an empty pattern/, empty);
  }
  for (const pattern of ["deploy/[ab]*", "deploy/*.{yml,yaml}", "deploy]", "deploy\\x"]) {
    assert.throws(
      () => parseProfile(`security-review:\n  - '${pattern}'\n`),
      /holds `\[`, `\]`, `\{`, `\}` or a backslash/,
      pattern,
    );
  }
  assert.throws(() => parseProfile("security-review:\n  - '!deploy/**'\n"), /begins with `!`/);
  for (const pattern of [
    "/deploy/**",
    "./deploy/**",
    "deploy/../secrets",
    "..",
    "deploy/",
    "deploy//x",
    "deploy/./x",
  ]) {
    assert.throws(
      () => parseProfile(`security-review:\n  - '${pattern}'\n`),
      new RegExp(
        `\`${pattern.replace(/[.*/]/g, "\\$&")}\` in \`security-review\` is not a path from the project's root`,
      ),
      pattern,
    );
  }
});
