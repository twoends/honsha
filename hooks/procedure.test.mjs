// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { HUB, WORKER, context, procedure } from "./procedure.mjs";
import { scratchHome } from "./scratch-home.mjs";

const script = fileURLToPath(new URL("./procedure.mjs", import.meta.url));
const scratch = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "honsha-procedure-")));
/** @type {(() => void)[]} */
const cleanups = [() => fs.rmSync(scratch, { recursive: true, force: true })];
after(() => cleanups.forEach((cleanup) => cleanup()));

const identity = ["-c", "user.name=Tester", "-c", "user.email=tester@example.org", "-c", "commit.gpgsign=false"];
/**
 * @param {string} dir
 * @param {string[]} args
 */
const git = (dir, args) => execFileSync("git", ["-C", dir, ...identity, ...args], { encoding: "utf8", stdio: "pipe" });

/**
 * A linked worktree of a repository, beside the scratch folder's others.
 * @param {string} dir
 * @param {string} name
 */
function worktree(dir, name) {
  const linked = path.join(scratch, name);
  git(dir, ["worktree", "add", "-q", "-b", `work/${name}`, linked]);
  return linked;
}

const project = path.join(scratch, "project");
fs.mkdirSync(project);
git(project, ["init", "-q", "-b", "main"]);
git(project, ["commit", "-q", "--allow-empty", "-m", "Start"]);
const projectItem = worktree(project, "project-item");
const installation = scratchHome([project], { "notes/README.md": "notes\n" });
cleanups.push(installation.remove);
const { home, env } = installation;
const homeItem = worktree(home, "home-item");
const outside = path.join(scratch, "outside");
fs.mkdirSync(outside);
git(outside, ["init", "-q", "-b", "main"]);

/**
 * The hook run as `hooks.json` writes it, with `input` on its standard input and the scratch home as its setting.
 * @param {string} input
 */
const run = (input) => spawnSync(process.execPath, [script], { input, encoding: "utf8", env, cwd: outside });

test("a session that runs as no agent gets the hub's procedure in the home and the worker's in its other folders", () => {
  assert.equal(procedure({}, { kind: "home" }), HUB);
  assert.equal(procedure({}, { kind: "home-worktree" }), WORKER);
  assert.equal(procedure({}, { kind: "project" }), WORKER);
  assert.equal(procedure({}, { kind: "outside" }), null);
  assert.equal(procedure({}, { kind: "unknown", reason: "no home" }), null);
});

test("a session that runs as an agent gets nothing, wherever it is", () => {
  for (const agent of ["honsha:worker", "honsha:hub", "example-agent"]) {
    for (const kind of /** @type {const} */ (["home", "home-worktree", "project"])) {
      assert.equal(procedure({ agent_type: agent }, { kind }), null);
    }
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
});

test("as a hook it places the session by its folder: the hub's in the home, the worker's in a worktree or a project", () => {
  for (const [cwd, file] of [
    [home, HUB],
    [path.join(home, "notes"), HUB],
    [homeItem, WORKER],
    [project, WORKER],
    [projectItem, WORKER],
  ]) {
    const result = run(JSON.stringify({ hook_event_name: "SessionStart", cwd }));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, context(file), cwd);
  }
  for (const input of [
    { cwd: project, agent_type: "honsha:worker" },
    { cwd: home, agent_type: "honsha:hub" },
    { cwd: outside },
    { cwd: scratch },
  ]) {
    const quiet = run(JSON.stringify({ hook_event_name: "SessionStart", ...input }));
    assert.equal(quiet.status, 0);
    assert.equal(quiet.stdout, "");
  }
});

test("a hook input that cannot be read gives nothing, and tells the person in the installation's folders", () => {
  for (const input of ["", "not json", "null", "3", "[]", '[{"cwd":"."}]']) {
    const inHome = spawnSync(process.execPath, [script], { input, encoding: "utf8", env, cwd: home });
    assert.equal(inHome.status, 1, input);
    assert.equal(inHome.stdout, "");
    assert.match(inHome.stderr, /the session lacks its procedure/);
    const elsewhere = run(input);
    assert.equal(elsewhere.status, 0, input);
    assert.equal(elsewhere.stdout + elsewhere.stderr, "");
  }
});
