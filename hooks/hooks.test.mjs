// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { context as hubContext } from "./hub.mjs";
import { BUDGET, LEVELS } from "./lessons.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
/** @param {string} file */
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const hooks = JSON.parse(read("hooks/hooks.json")).hooks;
const handlers = Object.values(hooks)
  .flat()
  .flatMap((group) => group.hooks);

test("every file a hook refers to exists", () => {
  const text = handlers.map((handler) => [handler.command, ...(handler.args ?? [])].join(" ")).join(" ");
  const files = [...text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)].map((match) => match[1]);
  assert.ok(files.length > 0);
  for (const file of files) assert.ok(fs.existsSync(`${root}/${file}`), file);
});

/** The files a session and the checker receive when they start: the parts of the core rules, and the template. */
const given = [
  ...fs
    .readdirSync(`${root}/rules`)
    .filter((name) => name.endsWith(".md"))
    .map((name) => `rules/${name}`),
  "templates/record.md",
].toSorted();

/**
 * What a hook prints, run as `hooks.json` writes it.
 * @param {{ command: string, args?: string[] }} handler
 */
function output(handler) {
  assert.equal(handler.command, "node");
  const args = (handler.args ?? []).map((arg) => arg.replace("${CLAUDE_PLUGIN_ROOT}", root.replace(/[\\/]$/, "")));
  return execFileSync(process.execPath, args, { encoding: "utf8" });
}

/**
 * The files a list of hooks give, with what follows each file, in order.
 * @param {any[]} list
 */
const files = (list) => list.map((handler) => handler.args.slice(1).join(" ")).toSorted();

const RULES = "${CLAUDE_PLUGIN_ROOT}/hooks/rules.mjs";
const LESSONS = "${CLAUDE_PLUGIN_ROOT}/hooks/lessons.mjs";
const HUB = "${CLAUDE_PLUGIN_ROOT}/hooks/hub.mjs";
const start = hooks.SessionStart.flatMap((/** @type {any} */ group) => group.hooks);
const rulesAtStart = start.filter((/** @type {any} */ handler) => handler.args?.[0] === RULES);

test("each part of the core rules, and the template, has a hook at a session's start and one for the checker alone", () => {
  assert.ok(hooks.SessionStart.every((/** @type {any} */ group) => group.matcher === undefined));
  assert.equal(hooks.SubagentStart.length, 1);
  const [checker] = hooks.SubagentStart;
  assert.equal(checker.matcher, "^honsha:checker$");
  for (const handler of checker.hooks) assert.equal(handler.args?.[0], RULES);
  assert.deepEqual(files(rulesAtStart), given);
  assert.deepEqual(
    files(checker.hooks),
    given.map((file) => `${file} --subagent`),
  );
});

test("each level of lessons and the hub's procedure have a hook at a session's start, and nothing else does", () => {
  const lessons = start.filter((/** @type {any} */ handler) => handler.args?.[0] === LESSONS);
  assert.deepEqual(files(lessons), LEVELS.toSorted());
  const hub = start.filter((/** @type {any} */ handler) => handler.args?.[0] === HUB);
  assert.equal(hub.length, 1);
  assert.equal(rulesAtStart.length + lessons.length + hub.length, start.length);
});

test("the opening of the core rules names each of their other parts", () => {
  const named = [...read("rules/core.md").matchAll(/`(rules\/[\w-]+\.md)`/g)].map((match) => match[1]);
  const parts = given.filter((file) => file.startsWith("rules/") && file !== "rules/core.md");
  assert.deepEqual([...new Set(named)].toSorted(), parts);
});

// Claude Code replaces a hook's output over 10,000 characters with a file path and a short preview, which would take
// that part out of the context without a word: a part that reaches PART is split into two topics, never shortened.
// TOTAL is what every session pays at start, a choice rather than a limit of the platform: it is raised by a work item
// that says why, or answered by moving a rule that only some situations need into a skill. The lessons count at their
// budget, since their files are the installation's and the hook that gives them keeps each level under it.
// A session in a home's own folder, the hub, also receives the hub's procedure: only that session pays for it, so it
// is counted on top of TOTAL, at the budget of its file, as the lessons are counted at theirs.
const PART = 9000;
const TOTAL = 25000;
const HUB_FILE = 6000;

test("each hook gives its whole file under the limit for one output, and a session's start stays under the total", () => {
  let total = 0;
  for (const handler of rulesAtStart) {
    const [, file] = handler.args;
    const text = output(handler);
    assert.ok(text.endsWith(read(file)), file);
    assert.ok(text.length < PART, `${file}: ${text.length} characters`);
    total += text.length;
  }
  const lessons = LEVELS.length * BUDGET;
  assert.ok(total + lessons <= TOTAL, `${total} characters of rules and ${lessons} of lessons at a session's start`);
  const hub = hubContext().length;
  assert.ok(hub < PART, `the hub's procedure: ${hub} characters`);
  assert.ok(total + lessons + hub <= TOTAL + HUB_FILE, `${total + lessons + hub} characters at the hub's start`);
  for (const handler of hooks.SubagentStart.flatMap((/** @type {any} */ group) => group.hooks)) {
    const [, file] = handler.args;
    const { hookEventName, additionalContext } = JSON.parse(output(handler)).hookSpecificOutput;
    assert.equal(hookEventName, "SubagentStart");
    assert.ok(additionalContext.endsWith(read(file)), file);
    assert.ok(additionalContext.length < PART, `${file}: ${additionalContext.length} characters`);
  }
});

test("a part that cannot be read fails its hook with a message, so that the person sees it is missing", () => {
  const args = [`${root}/hooks/rules.mjs`, "rules/missing.md"];
  const options = { encoding: /** @type {const} */ ("utf8"), stdio: /** @type {any} */ (["ignore", "pipe", "pipe"]) };
  assert.throws(
    () => execFileSync(process.execPath, args, options),
    (/** @type {any} */ error) => {
      assert.equal(error.status, 1);
      assert.equal(error.stdout, "");
      assert.match(error.stderr, /rules\/missing\.md could not be read, so the session lacks that part/);
      return true;
    },
  );
});

test("the template has the front matter keys of the workflow, in order", () => {
  const frontMatter = read("templates/record.md").split("---")[1];
  const keys = frontMatter
    .split("\n")
    .filter((line) => /^[a-z-]+:/.test(line))
    .map((line) => line.split(":")[0]);
  assert.deepEqual(keys, [
    "id",
    "title",
    "project",
    "type",
    "size",
    "kind",
    "state",
    "areas",
    "created",
    "updated",
    "requested-by",
    "source",
    "pr",
    "model",
    "effort",
    "checks",
  ]);
  const spec = read("docs/01-specs/WORKFLOW.md").split("### Front matter")[1].split("```")[1];
  const specKeys = spec
    .split("\n")
    .filter((line) => /^[a-z-]+:/.test(line))
    .map((line) => line.split(":")[0]);
  assert.deepEqual(keys, specKeys);
});
