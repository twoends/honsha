// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { BUDGET, context, split } from "./lessons.mjs";
import { scratchHome } from "./scratch-home.mjs";

const script = fileURLToPath(new URL("./lessons.mjs", import.meta.url));
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * A folder holding `files`.
 * @param {Record<string, string>} files
 */
function folder(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-lessons-"));
  made.push(dir);
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  return dir;
}

/**
 * A lessons file with a heading and `count` lessons of about `size` characters each.
 * @param {string} title
 * @param {number} count
 * @param {number} [size]
 */
function lessonsFile(title, count, size = 60) {
  const items = Array.from({ length: count }, (_, index) => `- Lesson ${index + 1}: ${"x".repeat(size)}.`);
  return `# ${title}\n\nShort preventive rules.\n\n${items.join("\n")}\n`;
}

const home = () =>
  folder({
    "lessons/tech/node.md": lessonsFile("Technology: Node.js", 2),
    "lessons/host/example-host.md": lessonsFile("Host: example-host", 1),
  });

test("a lessons file is cut into its head and its lessons, each with the lines that continue it", () => {
  const { head, items } = split("# Title\n\nIntro.\n\n- One\n  goes on.\n- Two\n");
  assert.equal(head, "# Title\n\nIntro.");
  assert.deepEqual(items, ["- One\n  goes on.", "- Two"]);
  assert.deepEqual(split("# Only a head\n"), { head: "# Only a head", items: [] });
});

test("the project's level gives the file its profile names, and nothing without one", () => {
  const project = folder({
    ".hub/profile.yml": "name: example\nlessons: LESSONS.md\n",
    "LESSONS.md": lessonsFile("Lessons", 2),
  });
  const text = context("project", { project, home: "", host: "example-host" });
  assert.match(text, /^Honsha lessons of the project:\n\nFrom LESSONS\.md:\n/);
  assert.match(text, /- Lesson 2: x+\.\n$/);
  assert.equal(context("project", { project: folder({}), home: "", host: "example-host" }), "");
  const unnamed = folder({ ".hub/profile.yml": "name: example\n" });
  assert.equal(context("project", { project: unnamed, home: "", host: "example-host" }), "");
});

test("the technologies' level gives the home's file of each technology of the stack that has one", () => {
  const project = folder({ ".hub/profile.yml": "stack: [node, postgres]\n" });
  const text = context("technologies", { project, home: home(), host: "example-host" });
  assert.match(text, /^Honsha lessons of the technologies:\n\nFrom lessons\/tech\/node\.md in the home:\n/);
  assert.match(text, /# Technology: Node\.js/);
  assert.doesNotMatch(text, /postgres\.md/);
  const none = folder({ ".hub/profile.yml": "name: example\n" });
  assert.equal(context("technologies", { project: none, home: home(), host: "example-host" }), "");
});

test("without a home, the technologies' level says why it gives nothing, and the host's level is silent", () => {
  const project = folder({ ".hub/profile.yml": "stack: [node]\n" });
  assert.equal(
    context("technologies", { project, home: "", host: "example-host" }),
    "Honsha lessons of the technologies: the plugin's setting `home` is not set on this machine, so the lessons of node are not loaded.\n",
  );
  assert.equal(context("host", { project, home: "", host: "example-host" }), "");
});

test("the host's level gives the home's file of the machine, by its name in lower case", () => {
  const text = context("host", { project: folder({}), home: home(), host: "EXAMPLE-HOST" });
  assert.match(text, /^Honsha lessons of the host:\n\nFrom lessons\/host\/example-host\.md in the home:\n/);
  assert.equal(context("host", { project: folder({}), home: home(), host: "another-host" }), "");
});

test("a home's folder that does not exist is named by the levels that need it", () => {
  const project = folder({ ".hub/profile.yml": "stack: [node]\n" });
  const wrong = path.join(folder({}), "no-such-home");
  const where = { project, home: wrong, host: "example-host" };
  assert.match(context("technologies", where), /names .*no-such-home, which is not a folder on this machine, so the/);
  assert.match(context("host", where), /which is not a folder on this machine, so the host's lessons are not loaded/);
});

test("a level over its budget gives the lessons that fit, and names the file it left in part", () => {
  const project = folder({
    ".hub/profile.yml": "lessons: LESSONS.md\n",
    "LESSONS.md": lessonsFile("Lessons", 60, 100),
  });
  const text = context("project", { project, home: "", host: "example-host" });
  assert.ok(text.length <= BUDGET, `${text.length} characters`);
  assert.match(text, /- Lesson 1: /);
  assert.doesNotMatch(text, /- Lesson 60: /);
  const file = path.join(project, "LESSONS.md").replace(/\\/g, "\\\\");
  assert.match(text, new RegExp(`Left out, past the ${BUDGET} characters .*${file}, \\d+ of its 60 lessons`));
});

test("a level gives one lesson fewer rather than leave a file it cuts unnamed", () => {
  // The room left after the lessons that fit is too short for the file's name, by a few characters.
  for (const size of [100, 105, 110, 115, 120]) {
    const project = folder({
      ".hub/profile.yml": "lessons: LESSONS.md\n",
      "LESSONS.md": lessonsFile("Lessons", 60, size),
    });
    const text = context("project", { project, home: "", host: "example-host" });
    assert.ok(text.length <= BUDGET, `${size}: ${text.length} characters`);
    assert.ok(text.includes(`${path.join(project, "LESSONS.md")}, `), `${size}: the file is not named`);
  }
});

test("the budget holds however many files a level leaves out, and however long their paths", () => {
  const deep = path.join("a-folder-with-a-long-name", "another-folder-with-a-long-name", "and-one-more-long-folder");
  /** @type {Record<string, string>} */
  const files = {};
  const stack = Array.from({ length: 80 }, (_, index) => `technology-${index + 1}`);
  for (const technology of stack) {
    files[path.join(deep, "lessons", "tech", `${technology}.md`)] = lessonsFile(technology, 20, 100);
  }
  const project = folder({ ".hub/profile.yml": `stack: [${stack.join(", ")}]\n` });
  const text = context("technologies", { project, home: path.join(folder(files), deep), host: "example-host" });
  assert.ok(text.length <= BUDGET, `${text.length} characters`);
  assert.match(text, /- Lesson 1: /);
  assert.match(
    text,
    /Left out, past the 4000 characters a level of lessons may give: .*\d+ files?\b.*\. Read them there/,
  );
});

test("a profile the reader refuses is named instead of passing in silence", () => {
  const project = folder({ ".hub/profile.yml": "stack: node\n" });
  assert.match(
    context("technologies", { project, home: home(), host: "example-host" }),
    /^Honsha lessons of the technologies: profile: `stack` must be a list .*; the lessons are not loaded\.\n$/,
  );
});

/**
 * The input of a session's start in a folder.
 * @param {string} cwd
 */
const input = (cwd) => JSON.stringify({ hook_event_name: "SessionStart", cwd });

test("the hook reads the project and the home from the platform's variables, and refuses an unknown level", () => {
  const project = folder({ ".hub/profile.yml": "stack: [node]\n" });
  execFileSync("git", ["init", "-q", project]);
  const installation = scratchHome([project], { "lessons/tech/node.md": lessonsFile("Technology: Node.js", 2) });
  made.push(installation.home);
  const env = { ...installation.env, CLAUDE_PROJECT_DIR: project };
  const given = spawnSync(process.execPath, [script, "technologies"], { env, input: input(project), encoding: "utf8" });
  assert.equal(given.status, 0, given.stderr);
  assert.match(given.stdout, /# Technology: Node\.js/);
  // Outside the installation's folders the hook gives nothing, whatever the project's profile says.
  const outside = folder({});
  execFileSync("git", ["init", "-q", outside]);
  const quiet = spawnSync(process.execPath, [script, "technologies"], { env, input: input(outside), encoding: "utf8" });
  assert.equal(quiet.status, 0, quiet.stderr);
  assert.equal(quiet.stdout, "");
  const wrong = spawnSync(process.execPath, [script, "team"], { env, encoding: "utf8" });
  assert.equal(wrong.status, 1);
  assert.match(wrong.stderr, /no level `team`/);
});
