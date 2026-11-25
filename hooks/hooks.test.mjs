// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { BUDGET, LEVELS } from "./lessons.mjs";
import { BUDGET as MODELS } from "./models.mjs";
import { trees } from "./place.mjs";
import { HUB, WORKER, context } from "./procedure.mjs";
import { scratchHome } from "./scratch-home.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
/** @param {string} file */
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const hooks = JSON.parse(read("hooks/hooks.json")).hooks;
const handlers = Object.values(hooks)
  .flat()
  .flatMap((group) => group.hooks);
// The hooks act only in an installation's folders, so the kit's clone is a project of a scratch home for these tests.
const installation = scratchHome([trees(root)?.main ?? root]);
after(installation.remove);

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
 * What a hook prints, run as `hooks.json` writes it, with `input` as the hook's input: by default a session in the
 * kit's clone, a project of the scratch home.
 * @param {{ command: string, args?: string[] }} handler
 * @param {object} [input]
 * @param {NodeJS.ProcessEnv} [env]
 */
function output(handler, input = { hook_event_name: "SessionStart", cwd: root }, env = installation.env) {
  assert.equal(handler.command, "node");
  const args = (handler.args ?? []).map((arg) => arg.replace("${CLAUDE_PLUGIN_ROOT}", root.replace(/[\\/]$/, "")));
  return execFileSync(process.execPath, args, { encoding: "utf8", input: JSON.stringify(input), env });
}

/**
 * The files a list of hooks give, with what follows each file, in order.
 * @param {any[]} list
 */
const files = (list) => list.map((handler) => handler.args.slice(1).join(" ")).toSorted();

const RULES = "${CLAUDE_PLUGIN_ROOT}/hooks/rules.mjs";
const LESSONS = "${CLAUDE_PLUGIN_ROOT}/hooks/lessons.mjs";
const PROCEDURE = "${CLAUDE_PLUGIN_ROOT}/hooks/procedure.mjs";
const MODEL_MAP = "${CLAUDE_PLUGIN_ROOT}/hooks/models.mjs";
const start = hooks.SessionStart.flatMap((/** @type {any} */ group) => group.hooks);
const rulesAtStart = start.filter((/** @type {any} */ handler) => handler.args?.[0] === RULES);
const procedures = start.filter((/** @type {any} */ handler) => handler.args?.[0] === PROCEDURE);
const maps = start.filter((/** @type {any} */ handler) => handler.args?.[0] === MODEL_MAP);

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

test("each level of lessons, the models and the procedure have a hook at a session's start, and nothing else starts there", () => {
  const lessons = start.filter((/** @type {any} */ handler) => handler.args?.[0] === LESSONS);
  assert.deepEqual(files(lessons), LEVELS.toSorted());
  assert.equal(maps.length, 1);
  assert.deepEqual(maps[0].args, [MODEL_MAP]);
  assert.equal(procedures.length, 1);
  assert.deepEqual(procedures[0].args, [PROCEDURE]);
  assert.equal(rulesAtStart.length + lessons.length + maps.length + procedures.length, start.length);
});

test("the opening of the core rules names each of their other parts", () => {
  const named = [...read("rules/core.md").matchAll(/`(rules\/[\w-]+\.md)`/g)].map((match) => match[1]);
  const parts = given.filter((file) => file.startsWith("rules/") && file !== "rules/core.md");
  assert.deepEqual([...new Set(named)].toSorted(), parts);
});

// Claude Code replaces a hook's output over 10,000 characters with a file path and a short preview, which would take
// that part out of the context without a word: a part that reaches PART is split into two topics, never shortened.
// TOTAL is what every session pays at start, a choice rather than a limit of the platform: it is raised by a work item
// that says why, or answered by moving a rule that only some situations need into a skill. The lessons and the models
// count at their budgets, since their files are the installation's and their hooks keep each output under it. The
// total holds the procedure too that a session which runs as no agent receives, the hub's in the home's main working tree and
// the worker's in its worktrees and the projects, as a session started as that agent receives the same file as its
// system prompt: a session receives one of the two, and each counts at its file's budget, so that the file can grow to
// that budget without reaching the total.
const PART = 9000;
const TOTAL = 31750;

test("each hook gives its whole file under the limit for one output, and a session's start stays under the total", () => {
  let total = 0;
  for (const handler of rulesAtStart) {
    const [, file] = handler.args;
    const text = output(handler);
    assert.ok(text.endsWith(read(file)), file);
    assert.ok(text.length < PART, `${file}: ${text.length} characters`);
    total += text.length;
  }
  const lessons = LEVELS.length * BUDGET + MODELS;
  // The kit's clone is a project of the scratch home, so a session in it that runs as no agent gets the worker's.
  assert.equal(output(procedures[0], { hook_event_name: "SessionStart", cwd: root }), context(WORKER));
  for (const file of [WORKER, HUB]) {
    const procedure = context(file);
    assert.ok(procedure.length < PART, `${file}: ${procedure.length} characters`);
    const listed = new RegExp(`"${file.replace(/[./]/g, "\\$&")}": (\\d+)`).exec(read("checks/budgets.test.mjs"));
    const budget = Number(listed?.[1]);
    assert.ok(budget > 0, `the budget of ${file} in checks/budgets.test.mjs`);
    const counted = procedure.slice(0, procedure.indexOf("\n\n") + 2).length + budget;
    assert.ok(
      total + lessons + counted <= TOTAL,
      `${total} characters of rules, ${lessons} of lessons and models and ${counted} of ${file} at a session's start`,
    );
  }
  for (const handler of hooks.SubagentStart.flatMap((/** @type {any} */ group) => group.hooks)) {
    const [, file] = handler.args;
    const input = { hook_event_name: "SubagentStart", agent_type: "honsha:checker", cwd: root };
    const { hookEventName, additionalContext } = JSON.parse(output(handler, input)).hookSpecificOutput;
    assert.equal(hookEventName, "SubagentStart");
    assert.ok(additionalContext.endsWith(read(file)), file);
    assert.ok(additionalContext.length < PART, `${file}: ${additionalContext.length} characters`);
  }
});

test("outside the installation's folders no hook at a session's start gives anything", () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-outside-"));
  try {
    execFileSync("git", ["init", "-q", outside]);
    const elsewhere = path.join(os.tmpdir(), "honsha-no-such-folder");
    for (const handler of start) {
      for (const cwd of [outside, elsewhere]) {
        assert.equal(output(handler, { hook_event_name: "SessionStart", cwd }), "", handler.args.join(" "));
      }
    }
  } finally {
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

test("where the installation cannot be read, the opening part says so in its place, and no other hook gives anything", () => {
  const unset = { ...process.env, CLAUDE_PLUGIN_OPTION_HOME: "" };
  for (const handler of start) {
    const text = output(handler, undefined, unset);
    if (handler.args[1] === "rules/core.md") {
      assert.match(text, /^Honsha: the plugin's setting `home` is not set on this machine, so the kit cannot tell/);
    } else assert.equal(text, "", handler.args.join(" "));
  }
});

test("a part that cannot be read fails its hook with a message, so that the person sees it is missing", () => {
  const args = [`${root}/hooks/rules.mjs`, "rules/missing.md"];
  const options = {
    encoding: /** @type {const} */ ("utf8"),
    input: JSON.stringify({ hook_event_name: "SessionStart", cwd: root }),
    env: installation.env,
  };
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
