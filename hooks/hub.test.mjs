import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { context, isHub } from "./hub.mjs";

const hook = fileURLToPath(new URL("hub.mjs", import.meta.url));
const agent = fs.readFileSync(new URL("../agents/hub.md", import.meta.url), "utf8");

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/**
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  const identity = ["-c", "user.name=Example", "-c", "user.email=example@example.org"];
  return execFileSync("git", ["-C", dir, ...identity, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * A repository with one commit, holding `files`.
 * @param {Record<string, string>} files
 */
function repository(files) {
  const dir = temporary("honsha-hub-");
  git(dir, ["init", "-q", "-b", "main"]);
  for (const [file, text] of Object.entries({ "README.md": "Example.\n", ...files })) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", "Start"]);
  return dir;
}

const home = repository({ "registry.yml": "projects: []\n", "docs/notes.md": "Notes.\n" });
const worktree = path.join(temporary("honsha-hub-worktree-"), "item");
git(home, ["worktree", "add", "-q", "-b", "work/261201-0930-example", worktree]);
const project = repository({});

/**
 * What the hook prints, and its exit code, for the platform's input.
 * @param {unknown} input
 */
function run(input) {
  const result = spawnSync(process.execPath, [hook], { input: JSON.stringify(input), encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

test("a session in a home's own folder, as no agent, is the hub, from its root or a folder inside it", () => {
  assert.equal(isHub({ cwd: home }), true);
  assert.equal(isHub({ cwd: path.join(home, "docs") }), true);
});

test("a session in a worktree of the home, in another repository, outside git or as an agent is not the hub", () => {
  assert.equal(isHub({ cwd: worktree }), false);
  assert.equal(isHub({ cwd: project }), false);
  assert.equal(isHub({ cwd: temporary("honsha-hub-plain-") }), false);
  assert.equal(isHub({ cwd: home, agent: "honsha:hub" }), false);
  assert.equal(isHub({ cwd: home, agent: "honsha:worker" }), false);
  assert.equal(isHub({}), false);
});

test("the hook gives the agent's body without its front matter, and names the file and the kit directory", () => {
  const text = context();
  assert.match(text, /^The hub's procedure, agents\/hub\.md in the kit directory .+:\n\nYou are the hub/);
  assert.ok(agent.startsWith("---\n"));
  assert.ok(text.endsWith(agent.slice(agent.indexOf("\n---\n") + "\n---\n".length).replace(/^\n+/, "")));
  assert.doesNotMatch(text, /^model: /m);
});

test("run as the platform runs it, the hook prints the procedure for the hub alone, and nothing on no input", () => {
  assert.deepEqual(run({ cwd: home, hook_event_name: "SessionStart", source: "startup" }), {
    code: 0,
    out: context(),
    err: "",
  });
  assert.deepEqual(run({ cwd: worktree, hook_event_name: "SessionStart" }), { code: 0, out: "", err: "" });
  assert.deepEqual(run({ cwd: home, agent_type: "honsha:hub" }), { code: 0, out: "", err: "" });
  const empty = spawnSync(process.execPath, [hook], { input: "", encoding: "utf8" });
  assert.deepEqual([empty.status, empty.stdout], [0, ""]);
});
