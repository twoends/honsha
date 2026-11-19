// What the hub's scripts share to work on the home's git repository without touching its working tree: git itself,
// the home's default branch, and a temporary worktree to commit in.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * @param {string} dir
 * @param {string[]} args
 */
export function git(dir, args) {
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/**
 * @param {string} dir
 * @param {string[]} args
 */
export function attempt(dir, args) {
  try {
    return git(dir, args);
  } catch {
    return null;
  }
}

/**
 * Whether the home has a remote called `origin`.
 * @param {string} home
 */
export function hasOrigin(home) {
  return (attempt(home, ["remote"]) ?? "").split(/\r?\n/).includes("origin");
}

/**
 * The home's default branch as a ref, after a fetch: the remote's where the home has one, the local branch otherwise.
 * @param {string} home
 */
export function defaultRef(home) {
  if (attempt(home, ["rev-parse", "--git-dir"]) === null) throw new Error(`${home} is not a git repository.`);
  if (hasOrigin(home)) {
    git(home, ["fetch", "-q", "origin"]);
    const head = attempt(home, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"])?.trim();
    if (!head) throw new Error("The home's origin has no HEAD: set it with `git remote set-head origin --auto`.");
    return head;
  }
  const local = ["main", "master"].find((name) => attempt(home, ["rev-parse", "--verify", "-q", `refs/heads/${name}`]));
  if (!local) throw new Error("The home has neither an origin nor a branch `main` or `master`.");
  return local;
}

/**
 * Runs `work` in a temporary worktree of the home at `base`, on a new branch when one is named and detached otherwise,
 * and removes the worktree after it, with the branch when `work` throws.
 * @template T
 * @param {string} home
 * @param {{ base: string, branch?: string }} at
 * @param {(dir: string) => T} work
 * @returns {T}
 */
export function inWorktree(home, { base, branch }, work) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-home-"));
  // From a remote branch a new branch would track it, and a plain push could then reach the default branch.
  const target = branch ? ["--no-track", "-b", branch] : ["--detach"];
  git(home, ["worktree", "add", "-q", ...target, dir, base]);
  let result;
  try {
    result = work(dir);
  } catch (error) {
    git(home, ["worktree", "remove", "--force", dir]);
    if (branch) git(home, ["branch", "-D", branch]);
    throw error;
  }
  git(home, ["worktree", "remove", dir]);
  return result;
}

/**
 * Writes files under a folder, creating the folders they need.
 * @param {string} dir
 * @param {Record<string, string>} files
 */
export function writeFiles(dir, files) {
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
}
