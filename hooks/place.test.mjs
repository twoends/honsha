// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { formatRegistry } from "../hub/projects.mjs";
import { inside, place, trees, unknown } from "./place.mjs";
import { scratchHome } from "./scratch-home.mjs";

const scratch = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "honsha-place-")));
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
 * A repository in `name` with one commit, and a linked worktree of it beside it, `<name>-item`.
 * @param {string} name
 */
function repository(name) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "index.js"), "\n");
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["add", "--all"]);
  git(dir, ["commit", "-q", "-m", "Start"]);
  const worktree = path.join(scratch, `${name}-item`);
  git(dir, ["worktree", "add", "-q", "-b", "work/item", worktree]);
  return { main: dir, worktree };
}

const project = repository("project");
const other = repository("other");
const installation = scratchHome([project.main]);
cleanups.push(installation.remove);
const { home } = installation;
git(home, ["worktree", "add", "-q", "-b", "work/home-item", path.join(scratch, "home-item")]);
const homeItem = path.join(scratch, "home-item");
const host = os.hostname();
const outside = path.join(scratch, "outside");
fs.mkdirSync(outside);

test("a folder's working tree and main working tree are read from its `.git`, in a linked worktree too", () => {
  assert.deepEqual(trees(project.main), { top: project.main, main: project.main });
  assert.deepEqual(trees(path.join(project.main, "src")), { top: project.main, main: project.main });
  assert.deepEqual(trees(path.join(project.main, "src", "missing")), { top: project.main, main: project.main });
  assert.deepEqual(trees(path.join(project.worktree, "src")), { top: project.worktree, main: project.main });
  // The scratch folder is not in a repository, so nothing above this folder holds a `.git`.
  assert.equal(trees(outside), null);
});

test("the home, its worktrees and the folders the registry gives this host are in the installation", () => {
  const where = { home, host };
  assert.deepEqual(place(home, where), { kind: "home" });
  assert.deepEqual(place(homeItem, where), { kind: "home-worktree" });
  assert.deepEqual(place(project.main, where), { kind: "project" });
  assert.deepEqual(place(path.join(project.worktree, "src"), where), { kind: "project" });
  for (const dir of [other.main, other.worktree, outside]) assert.deepEqual(place(dir, where), { kind: "outside" });
  assert.equal(inside(place(project.worktree, where)), true);
  assert.equal(inside(place(other.main, where)), false);
  assert.deepEqual(place(project.main, { home, host: `${host}-elsewhere` }), { kind: "outside" });
  if (process.platform === "win32") {
    assert.deepEqual(place(project.main.toUpperCase(), where), { kind: "project" });
  }
});

test("the registry is read from the home's default branch as last fetched, not from its working tree", () => {
  const clone = path.join(scratch, "home-clone");
  git(scratch, ["clone", "-q", home, clone]);
  const entry = { name: "other", repository: "o/other", state: "active", assessment: "261201-0930" };
  fs.writeFileSync(path.join(clone, "registry.yml"), formatRegistry([{ ...entry, paths: { [host]: other.main } }]));
  assert.deepEqual(place(other.main, { home: clone, host }), { kind: "outside" });
  assert.deepEqual(place(project.main, { home: clone, host }), { kind: "project" });
});

test("a folder in git whose installation cannot be read is in an unknown place, and one outside git is outside", () => {
  const broken = path.join(scratch, "broken-home");
  fs.mkdirSync(broken);
  fs.writeFileSync(path.join(broken, "registry.yml"), "projects:\n  - not a project\n");
  git(broken, ["init", "-q", "-b", "main"]);
  git(broken, ["add", "--all"]);
  git(broken, ["commit", "-q", "-m", "Start"]);
  const empty = path.join(scratch, "empty-home");
  fs.mkdirSync(empty);
  git(empty, ["init", "-q", "-b", "main"]);
  git(empty, ["commit", "-q", "--allow-empty", "-m", "Start"]);
  const cases = [
    ["", /^the plugin's setting `home` is not set on this machine$/],
    [path.join(scratch, "missing"), /could not be read: .*missing is not a git repository\.$/],
    [empty, /could not be read: the home's main holds no registry\.yml$/],
    [broken, /could not be read: registry\.yml, line 2: not in the shape this script writes/],
  ];
  for (const [given, reason] of cases) {
    const at = place(project.main, { home: String(given), host });
    assert.equal(at.kind, "unknown", String(given));
    assert.match(at.kind === "unknown" ? at.reason : "", /** @type {RegExp} */ (reason));
    assert.equal(inside(at), false);
    assert.deepEqual(place(outside, { home: String(given), host }), { kind: "outside" });
  }
  assert.match(unknown("the plugin's setting `home` is not set"), /^Honsha: .* Tell the person\.\n$/);
});

test("the scratch home of the hooks' tests registers its folders on this machine and names itself in `env`", () => {
  assert.equal(installation.env.CLAUDE_PLUGIN_OPTION_HOME, home);
  assert.match(git(home, ["show", "main:registry.yml"]), new RegExp(`${host}: '`));
});
