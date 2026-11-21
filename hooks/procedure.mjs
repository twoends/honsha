// Gives a session, when it starts, the procedure it follows: the worker's, `agents/worker.md`, to a session that runs
// as no agent and whose folder is not in the main working tree of a home. `hooks.json` runs it at each start.
//
//   node hooks/procedure.mjs < the hook's input
//
// The platform makes an agent's file the system prompt only of a session started as that agent, and the sessions that
// an application or another session starts run as none: without this hook, the worker's procedure would reach them
// only if they read the file. A session that runs as an agent, which the hook's input names in `agent_type`, has its
// agent's file as its prompt already. The main working tree of a home, a repository holding `registry.yml` at its
// root, is the hub's; the home's items run in its linked worktrees, where a session gets the worker's procedure.
//
// The condition is neither a work branch nor a linked worktree: a session that an application starts in a worktree is
// on a branch that the application names until it cuts the item's, and a session in a project's own folder that is
// asked for a change follows the same procedure, since every change is a work item.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");

export const WORKER = "agents/worker.md";
const REGISTRY = "registry.yml";

/**
 * Whether a folder is in the main working tree of a home. A folder outside a repository, or one that git cannot read,
 * is in none.
 * @param {string} dir
 */
export function inHome(dir) {
  try {
    const args = ["rev-parse", "--path-format=absolute", "--show-toplevel", "--git-dir", "--git-common-dir"];
    const out = execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const [top, own, common] = out.trim().split(/\r?\n/);
    // A linked worktree has a git directory of its own inside the common one; the main working tree uses the common.
    return path.resolve(own) === path.resolve(common) && fs.existsSync(path.join(top, REGISTRY));
  } catch {
    return false;
  }
}

/**
 * The agent's file whose procedure a session receives at start, from the kit's root, or null for none.
 * @param {{ cwd?: unknown, agent_type?: unknown }} input the hook's input
 */
export function procedure(input) {
  if (typeof input.agent_type === "string" && input.agent_type !== "") return null;
  const dir = typeof input.cwd === "string" && input.cwd !== "" ? input.cwd : process.cwd();
  return inHome(dir) ? null : WORKER;
}

/**
 * What the hook gives for an agent's file: a line that names the agent, the file and the kit directory, since hooks of
 * one event come in no stated order and the procedure's commands name the kit directory; then the file without its
 * front matter, which only the platform reads.
 * @param {string} file a path from the kit's root, such as `agents/worker.md`
 */
export function context(file) {
  const text = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n+/.exec(text);
  const name = /^name:\s*(\S+)/m.exec(front?.[1] ?? "")?.[1] ?? path.basename(file, ".md");
  const body = front ? text.slice(front[0].length) : text;
  const what = `The procedure of honsha:${name}, ${file} in the kit directory ${kit}`;
  return `${what}, which this session follows for a work item:\n\n${body}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  /** @type {unknown} */
  let input = null;
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    input = null;
  }
  if (typeof input !== "object" || input === null) {
    // Without its input the hook cannot tell an agent's session or the hub's from a worker's, so it gives nothing; the
    // person sees that the procedure is missing.
    process.stderr.write("Honsha: the hook's input could not be read, so the session lacks the worker's procedure.\n");
    process.exitCode = 1;
  } else {
    const file = procedure(/** @type {{ cwd?: unknown, agent_type?: unknown }} */ (input));
    try {
      if (file) process.stdout.write(context(file));
    } catch {
      process.stderr.write(`Honsha: ${file} could not be read, so the session lacks its procedure.\n`);
      process.exitCode = 1;
    }
  }
}
