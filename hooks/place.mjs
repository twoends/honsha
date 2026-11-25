// Where a session is, for the kit's hooks: in the home's main working tree, in a linked worktree of the home, in the
// folder that the home's registry gives a project on this host or in a worktree of that folder, or outside all of
// them. The plugin is installed for the user, so the platform runs its hooks in every session on the machine, and only
// the hook's input says which folder a session is in (architecture, Kit): each hook asks here first, and outside the
// installation it gives nothing and refuses nothing.
//
// A folder belongs to the repository whose `.git` is found above it, and a linked worktree to the main working tree
// whose git directory it shares. Both are read from the files, with no git process, since the guard asks before each
// shell command. A folder outside every repository is outside the installation, whose folders are all repositories,
// so the registry is not read for it. The home is the plugin's setting `home`; the registry is read from the home's
// default branch as last fetched, since a move holds once its pull request is merged (workflow, Joining an
// installation).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { attempt, fetchedRef } from "../hub/home.mjs";
import { parseRegistry, REGISTRY } from "../hub/projects.mjs";

/** @typedef {{ kind: "home" | "home-worktree" | "project" | "outside" } | { kind: "unknown", reason: string }} Place */

/**
 * A folder's path as the file system holds it, so that two spellings of one folder compare equal.
 * @param {string} dir
 */
function real(dir) {
  try {
    return fs.realpathSync.native(dir);
  } catch {
    return path.resolve(dir);
  }
}

/**
 * Whether two real paths name one folder: Windows ignores case in a path.
 * @param {string} a
 * @param {string} b
 */
const same = (a, b) => (process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b);

/**
 * The working tree a folder is in, and the main working tree of its repository; null outside every repository.
 * @param {string} dir
 * @returns {{ top: string, main: string } | null}
 */
export function trees(dir) {
  let current = path.resolve(dir);
  for (;;) {
    const dotgit = path.join(current, ".git");
    /** @type {fs.Stats | null} */
    let stat = null;
    try {
      stat = fs.statSync(dotgit);
    } catch {
      stat = null;
    }
    if (stat?.isDirectory()) return { top: real(current), main: real(current) };
    if (stat?.isFile()) {
      const gitdir = /^gitdir:\s*(.+?)\s*$/m.exec(fs.readFileSync(dotgit, "utf8"))?.[1];
      const own = gitdir ? path.resolve(current, gitdir) : null;
      /** @type {string | null} */
      let common = null;
      try {
        common = own ? path.resolve(own, fs.readFileSync(path.join(own, "commondir"), "utf8").trim()) : null;
      } catch {
        common = null;
      }
      // A linked worktree's git directory names the main working tree's; a submodule's names none: it is a
      // repository of its own.
      const main = common && path.basename(common) === ".git" ? path.dirname(common) : current;
      return { top: real(current), main: real(main) };
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * A file's text on the home's default branch as last fetched, null where that branch holds no such file, and the
 * branch as a ref; throws where the home has no such branch.
 * @param {string} home
 * @param {string} file a path from the home's root
 * @returns {{ ref: string, text: string | null }}
 */
export function homeFile(home, file) {
  // One git process for a home with an origin, the usual case; the others only to find the branch of one without.
  const text = attempt(home, ["show", `origin/HEAD:${file}`]);
  if (text !== null) return { ref: "origin/HEAD", text };
  const ref = fetchedRef(home);
  return { ref, text: attempt(home, ["show", `${ref}:${file}`]) };
}

/**
 * The registry's text on the home's default branch as last fetched.
 * @param {string} home
 */
function registryText(home) {
  const { ref, text } = homeFile(home, REGISTRY);
  if (text === null) throw new Error(`the home's ${ref} holds no ${REGISTRY}`);
  return text;
}

/**
 * The place of a folder in the installation whose home is `home`, on the host named `host`.
 * @param {string} cwd
 * @param {{ home: string, host: string }} where
 * @returns {Place}
 */
export function place(cwd, { home, host }) {
  const found = trees(cwd);
  if (!found) return { kind: "outside" };
  if (!home) return { kind: "unknown", reason: "the plugin's setting `home` is not set on this machine" };
  if (same(found.main, real(home))) return { kind: same(found.top, found.main) ? "home" : "home-worktree" };
  let projects;
  try {
    projects = parseRegistry(registryText(home));
  } catch (error) {
    const message = error instanceof Error ? error.message.trim() : String(error);
    return { kind: "unknown", reason: `the registry of the home ${home} could not be read: ${message}` };
  }
  const registered = projects.some(({ paths }) => paths[host] && same(real(paths[host]), found.main));
  return { kind: registered ? "project" : "outside" };
}

/**
 * Whether a place is in the installation: the home, a worktree of it, or a project.
 * @param {Place} at
 */
export const inside = (at) => at.kind === "home" || at.kind === "home-worktree" || at.kind === "project";

/**
 * The hook's input, read from its standard input, or null when it is not an object.
 * @returns {Record<string, any> | null}
 */
export function readInput() {
  /** @type {unknown} */
  let input = null;
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    input = null;
  }
  return typeof input === "object" && input !== null && !Array.isArray(input) ? input : null;
}

/**
 * The place of a hook's session: the input's `cwd`, or the process's folder when it names none, in the home of the
 * plugin's setting `home`, on this machine.
 * @param {Record<string, any> | null} input
 */
export function placeOf(input) {
  const cwd = typeof input?.cwd === "string" && input.cwd !== "" ? input.cwd : process.cwd();
  return place(cwd, { home: process.env.CLAUDE_PLUGIN_OPTION_HOME || "", host: os.hostname() });
}

/**
 * The hook's input and the place of its session.
 * @returns {{ input: Record<string, any> | null, at: Place }}
 */
export function session() {
  const input = readInput();
  return { input, at: placeOf(input) };
}

/**
 * What a session receives in place of the core rules when its place is unknown, so that it can tell the person.
 * @param {string} reason
 */
export function unknown(reason) {
  return `Honsha: ${reason}, so the kit cannot tell whether this session is in the home or in one of its projects. It gives the session none of its rules, lessons or procedures, and its guard judges every command as in a project. Tell the person.\n`;
}
