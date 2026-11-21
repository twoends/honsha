// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { HUB, WORKER, context, inHome, procedure } from "./procedure.mjs";

const script = fileURLToPath(new URL("./procedure.mjs", import.meta.url));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-procedure-"));

after(() => fs.rmSync(scratch, { recursive: true, force: true }));

/**
 * @param {string} dir
 * @param {string[]} args
 */
const git = (dir, args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: "pipe" });

/**
 * A repository in `name` with one commit of `files`, and a linked worktree of it beside it, `<name>-item`.
 * @param {string} name
 * @param {Record<string, string>} files
 */
function repository(name, files) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir);
  git(dir, ["init", "-q", "-b", "main"]);
  for (const [key, value] of [
    ["user.name", "Tester"],
    ["user.email", "tester@example.org"],
    ["commit.gpgsign", "false"],
  ]) {
    git(dir, ["config", key, value]);
  }
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  git(dir, ["add", "--all"]);
  git(dir, ["commit", "-q", "-m", "Start"]);
  const worktree = path.join(scratch, `${name}-item`);
  git(dir, ["worktree", "add", "-q", "-b", "work/item", worktree]);
  return { main: dir, worktree };
}

const project = repository("project", { "README.md": "a project\n" });
const home = repository("home", { "registry.yml": "projects: []\n", "notes/README.md": "notes\n" });

/**
 * The hook run as `hooks.json` writes it, with `input` on its standard input.
 * @param {string} input
 */
const run = (input) => spawnSync(process.execPath, [script], { input, encoding: "utf8" });

test("a session that runs as no agent gets the worker's procedure in a project and in a home's linked worktree", () => {
  assert.equal(procedure({ cwd: project.main }), WORKER);
  assert.equal(procedure({ cwd: project.worktree }), WORKER);
  assert.equal(procedure({ cwd: home.worktree }), WORKER);
  assert.equal(inHome(home.worktree), false);
});

test("a session in a home's main working tree gets the hub's procedure, from any folder of it", () => {
  assert.equal(inHome(home.main), true);
  assert.equal(procedure({ cwd: home.main }), HUB);
  assert.equal(procedure({ cwd: path.join(home.main, "notes") }), HUB);
});

test("a session that runs as an agent gets nothing, wherever it is", () => {
  for (const agent of ["honsha:worker", "honsha:hub", "example-agent"]) {
    assert.equal(procedure({ cwd: project.main, agent_type: agent }), null);
    assert.equal(procedure({ cwd: project.worktree, agent_type: agent }), null);
    assert.equal(procedure({ cwd: home.main, agent_type: agent }), null);
  }
});

test("the hook gives a line that names the agent, the file and the kit directory, then the file's body", () => {
  const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");
  for (const [file, name] of [
    [WORKER, "worker"],
    [HUB, "hub"],
  ]) {
    const text = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const body = text.slice(text.indexOf("\n---", 3) + 4).replace(/^\r?\n+/, "");
    const given = context(file);
    assert.ok(given.startsWith(`The procedure of honsha:${name}, ${file} in the kit directory ${kit}, `), given);
    assert.ok(given.endsWith(`:\n\n${body}`));
    assert.ok(!given.includes("\ndescription:"));
  }

  for (const [cwd, file] of [
    [project.worktree, WORKER],
    [home.worktree, WORKER],
    [home.main, HUB],
  ]) {
    const result = run(JSON.stringify({ hook_event_name: "SessionStart", cwd }));
    assert.equal(result.status, 0);
    assert.equal(result.stdout, context(file));
  }
  for (const input of [
    { cwd: project.main, agent_type: "honsha:worker" },
    { cwd: home.main, agent_type: "honsha:hub" },
  ]) {
    const quiet = run(JSON.stringify({ hook_event_name: "SessionStart", ...input }));
    assert.equal(quiet.status, 0);
    assert.equal(quiet.stdout, "");
  }
});

test("a hook input that cannot be read gives nothing and tells the person", () => {
  for (const input of ["", "not json", "null", "3", "[]", '[{"cwd":"."}]']) {
    const result = run(input);
    assert.equal(result.status, 1, input);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /the session lacks its procedure/);
  }
});
