// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { check, install } from "./pushed.mjs";

const kit = fileURLToPath(new URL("..", import.meta.url));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-pushed-"));
after(() => fs.rmSync(scratch, { recursive: true, force: true }));

// The repositories of the tests see none of the machine's git configuration: neither a hooks folder nor a word list.
const emptyConfig = path.join(scratch, "empty.gitconfig");
fs.writeFileSync(emptyConfig, "");
process.env.GIT_CONFIG_GLOBAL = emptyConfig;
process.env.GIT_CONFIG_NOSYSTEM = "1";

// The samples are put together here, so that this file holds none of what it looks for.
const folder = ["C:", "Users", "someone", "project"].join("\\");
const address = ["someone", "mail.provider.io"].join("@");
const NONE = "0".repeat(40);

let count = 0;

/**
 * @param {string} cwd
 * @param {string[]} args
 */
const git = (cwd, args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/** A clone with a first commit on its remote, and a work branch checked out. */
function clone() {
  const base = path.join(scratch, `case-${(count += 1)}`);
  fs.mkdirSync(base);
  git(base, ["init", "-q", "--bare", "remote.git"]);
  git(base, ["init", "-q", "-b", "main", "work"]);
  const dir = path.join(base, "work");
  for (const [key, value] of [
    ["user.name", "Tester"],
    ["user.email", "tester@example.org"],
    ["commit.gpgsign", "false"],
    ["core.autocrlf", "false"],
  ]) {
    git(dir, ["config", key, value]);
  }
  git(dir, ["remote", "add", "origin", "../remote.git"]);
  commit(dir, { "README.md": "a kit\n" }, "Start");
  git(dir, ["push", "-q", "origin", "main"]);
  git(dir, ["switch", "-q", "-c", "work/item"]);
  return dir;
}

/**
 * Writes the files, removes those given as null, and commits.
 * @param {string} dir
 * @param {Record<string, string | null>} files
 * @param {string} message
 * @param {string[]} [options]
 */
function commit(dir, files, message, options = []) {
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(dir, name);
    if (content === null) fs.rmSync(file);
    else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
    }
  }
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", ...options, "-m", message]);
  return git(dir, ["rev-parse", "HEAD"]);
}

/**
 * What git gives the hook for a push of the current branch.
 * @param {string} dir
 */
const input = (dir) => `refs/heads/work/item ${git(dir, ["rev-parse", "HEAD"])} refs/heads/work/item ${NONE}\n`;

/** @param {string} sha */
const short = (sha) => sha.slice(0, 7);

test("lets a push through when its commits add nothing personal", () => {
  const dir = clone();
  commit(dir, { "notes.md": "plain text\n" }, "Add notes");
  assert.deepEqual(check(input(dir), dir), []);
});

test("refuses a line that holds a path into a user's folder, naming commit, file and line but not the text", () => {
  const dir = clone();
  const added = commit(dir, { "docs/notes.md": `first\nsee ${folder}\n` }, "Add notes");
  const report = check(input(dir), dir);
  assert.deepEqual(report, [`${short(added)} docs/notes.md:2 holds a path into a user's folder`]);
  assert.ok(!report.join("\n").includes("someone"));
});

test("refuses the case of a closing commit whose record quotes such a path", () => {
  const dir = clone();
  const record = "work/2026/11/261118-0000-item.md";
  commit(dir, { [record]: "## Verification\n\npending\n" }, "Write the record");
  const closing = commit(
    dir,
    { [record]: `## Verification\n\nThe checker read ${folder}\\.honsha-checker.diff\n` },
    "Close the record",
  );
  assert.deepEqual(check(input(dir), dir), [`${short(closing)} ${record}:3 holds a path into a user's folder`]);
});

test("refuses what one commit adds and a later one of the same push removes", () => {
  const dir = clone();
  const added = commit(dir, { "notes.md": `${address}\n` }, "Add notes");
  commit(dir, { "notes.md": "nothing\n" }, "Take the address out");
  assert.deepEqual(check(input(dir), dir), [`${short(added)} notes.md:1 holds an e-mail address`]);
});

test("checks the message, the identities and the names of files", () => {
  const dir = clone();
  const message = commit(dir, { "a.md": "a\n" }, `Add a\n\nAsked by ${address}`);
  const identity = commit(dir, { "b.md": "b\n" }, "Add b", [`--author=Someone <${address}>`]);
  const name = commit(dir, { [`notes-for-${address}.md`]: "c\n" }, "Add c");
  const empty = commit(dir, { [`empty-for-${address}.txt`]: "", [`image-for-${address}.png`]: "\0\x01" }, "Add d");
  commit(dir, { [`notes-for-${address}.md`]: null }, "Remove c");
  assert.deepEqual(check(input(dir), dir), [
    `${short(message)} its message holds an e-mail address`,
    `${short(identity)} its author or committer holds an e-mail address`,
    `${short(name)} the name of a file holds an e-mail address`,
    `${short(empty)} the name of a file holds an e-mail address`,
    `${short(empty)} the name of a file holds an e-mail address`,
  ]);
});

test("does not check again what a remote already holds, nor a deleted branch", () => {
  const dir = clone();
  commit(dir, { "old.md": `${folder}\n` }, "Published before the hook");
  git(dir, ["push", "-q", "origin", "work/item"]);
  commit(dir, { "new.md": "plain\n" }, "Add new");
  assert.deepEqual(check(input(dir), dir), []);
  assert.deepEqual(check(`(delete) ${NONE} refs/heads/work/item ${git(dir, ["rev-parse", "HEAD"])}\n`, dir), []);
});

test("checks of a merge only the resolution of its conflicts", () => {
  const dir = clone();
  commit(dir, { "f.md": "branch\n" }, "Change f on the branch");
  git(dir, ["switch", "-q", "main"]);
  commit(dir, { "f.md": "main\n", "g.md": `${folder}\n` }, "Change f on main");
  git(dir, ["push", "-q", "origin", "main"]);
  git(dir, ["switch", "-q", "work/item"]);
  try {
    git(dir, ["merge", "-q", "main"]);
  } catch {
    // The conflict on f.md is expected; it is resolved below.
  }
  fs.writeFileSync(path.join(dir, "f.md"), `resolved\n${address}\n`);
  git(dir, ["add", "f.md", "g.md"]);
  git(dir, ["commit", "-q", "--no-edit"]);
  const merge = git(dir, ["rev-parse", "HEAD"]);
  assert.deepEqual(check(input(dir), dir), [`${short(merge)} f.md:2 holds an e-mail address`]);
});

test("matches the word list the clone names, and refuses a list that cannot be read without naming it", () => {
  const dir = clone();
  const added = commit(dir, { "notes.md": "made for Zorblat\n" }, "Add notes");
  assert.deepEqual(check(input(dir), dir), [], "no list set");
  const list = path.join(scratch, `words-${count}.txt`);
  fs.writeFileSync(list, "# names\n\n  zorblat  \n");
  git(dir, ["config", "honsha.words", list]);
  assert.deepEqual(check(input(dir), dir), [`${short(added)} notes.md:1 holds a word from the personal list`]);
  git(dir, ["config", "honsha.words", path.join(scratch, "missing.txt")]);
  assert.throws(
    () => check(input(dir), dir),
    (error) => error instanceof Error && error.message.includes("honsha.words") && !error.message.includes(scratch),
  );
});

test("install names the kit's hooks once, and leaves a hooks folder already set", () => {
  const dir = clone();
  assert.equal(install(dir), true);
  assert.equal(git(dir, ["config", "--get", "core.hooksPath"]), ".githooks");
  git(dir, ["config", "core.hooksPath", "elsewhere"]);
  assert.equal(install(dir), false);
  assert.equal(git(dir, ["config", "--get", "core.hooksPath"]), "elsewhere");
  const outside = fs.mkdtempSync(path.join(scratch, "plain-"));
  assert.equal(install(outside), false);
});

test("the hook, once installed, stops the push and lets a clean one through", () => {
  const dir = clone();
  // The copy keeps the mode the checkout gave the hook, so on Linux this also tries the mode committed.
  for (const file of [".githooks/pre-push", "checks/pushed.mjs", "checks/public.mjs"]) {
    fs.mkdirSync(path.join(dir, path.dirname(file)), { recursive: true });
    fs.copyFileSync(path.join(kit, file), path.join(dir, file));
  }
  commit(dir, {}, "Add the hook", ["--allow-empty"]);
  assert.equal(install(dir), true);

  commit(dir, { "notes.md": `${folder}\n` }, "Add notes");
  assert.throws(
    () => git(dir, ["push", "-q", "origin", "work/item"]),
    (error) => error instanceof Error && /personal content/.test(String(Reflect.get(error, "stderr"))),
  );
  assert.equal(git(dir, ["ls-remote", "origin", "refs/heads/work/item"]), "");

  git(dir, ["reset", "-q", "--hard", "HEAD~1"]);
  git(dir, ["push", "-q", "origin", "work/item"]);
  assert.notEqual(git(dir, ["ls-remote", "origin", "refs/heads/work/item"]), "");
});
