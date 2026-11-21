// Gives a session that runs as no agent, when it starts, the procedure it follows: the hub's, `agents/hub.md`, in the
// home's main working tree, and the worker's, `agents/worker.md`, in a worktree of the home and in a project's folder
// or one of its worktrees. Outside the installation's folders, or where it cannot be read, it gives none
// (`hooks/place.mjs`). `hooks.json` runs it at each start.
//
//   node hooks/procedure.mjs < the hook's input
//
// The platform makes an agent's file the system prompt only of a session started as that agent, and the sessions that
// an application or another session starts run as none: without this hook, a procedure would reach them only if they
// read its file, and every installation would write the hub's in its home. A session that runs as an agent, which the
// hook's input names in `agent_type`, has its agent's file as its prompt already. The home's items run in its linked
// worktrees, where a session gets the worker's procedure.
//
// The condition is neither a work branch nor a linked worktree: a session that an application starts in a worktree is
// on a branch that the application names until it cuts the item's, and a session in a project's own folder that is
// asked for a change follows the same procedure, since every change is a work item.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { session } from "./place.mjs";

const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");

export const WORKER = "agents/worker.md";
export const HUB = "agents/hub.md";

/**
 * The agent's file whose procedure a session receives at start, from the kit's root, or null for none.
 * @param {{ agent_type?: unknown }} input the hook's input
 * @param {import("./place.mjs").Place} at the session's place
 */
export function procedure(input, at) {
  if (typeof input.agent_type === "string" && input.agent_type !== "") return null;
  if (at.kind === "home") return HUB;
  if (at.kind === "home-worktree" || at.kind === "project") return WORKER;
  return null;
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
  return `${what}, which this session follows${file === WORKER ? " for a work item" : ""}:\n\n${body}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { input, at } = session();
  if (input === null) {
    // Without its input the hook cannot tell an agent's session, the hub's and a worker's apart, so it gives nothing;
    // in the installation's folders, judged from the hook's own, the person sees that the procedure is missing.
    if (at.kind !== "outside") {
      process.stderr.write("Honsha: the hook's input could not be read, so the session lacks its procedure.\n");
      process.exitCode = 1;
    }
  } else {
    const file = procedure(input, at);
    try {
      if (file) process.stdout.write(context(file));
    } catch {
      process.stderr.write(`Honsha: ${file} could not be read, so the session lacks its procedure.\n`);
      process.exitCode = 1;
    }
  }
}
