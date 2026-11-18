// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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

// Claude Code replaces hook output over 10,000 characters with a file path and a short preview,
// which would silently take the rules out of the session's context.
test("what a session receives at start stays under the limit for hook output", () => {
  const command = hooks.SessionStart[0].hooks[0].command;
  assert.match(command, /rules\/core\.md/);
  assert.match(command, /templates\/record\.md/);
  const size = read("rules/core.md").length + read("templates/record.md").length + command.length + root.length;
  assert.ok(size < 9000, `${size} characters`);
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
  const spec = read("docs/01-specs/WORKFLOW.md").split("### 4.1 Front matter")[1].split("```")[1];
  const specKeys = spec
    .split("\n")
    .filter((line) => /^[a-z-]+:/.test(line))
    .map((line) => line.split(":")[0]);
  assert.deepEqual(keys, specKeys);
});

// A SubagentStart hook adds context only from JSON, and the platform cuts what is over 10,000 characters to a file
// path and a preview, which would leave the checker without the rules it checks against.
test("the checker alone receives the core rules and the template when it starts, under the limit", () => {
  const groups = hooks.SubagentStart;
  assert.equal(groups.length, 1);
  assert.equal(groups[0].matcher, "^honsha:checker$");
  const [handler] = groups[0].hooks;
  assert.deepEqual(handler.args, ["${CLAUDE_PLUGIN_ROOT}/hooks/checker-rules.mjs"]);
  const output = execFileSync(process.execPath, [`${root}/hooks/checker-rules.mjs`], { encoding: "utf8" });
  const { hookEventName, additionalContext } = JSON.parse(output).hookSpecificOutput;
  assert.equal(hookEventName, "SubagentStart");
  assert.ok(additionalContext.includes(read("rules/core.md")));
  assert.ok(additionalContext.includes(read("templates/record.md")));
  assert.ok(additionalContext.length < 10000, `${additionalContext.length} characters`);
});
