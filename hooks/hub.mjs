// Gives the hub's procedure, the body of `agents/hub.md`, to a session that opens in a home's own folder, so that an
// installation writes no instructions of its own to make that session the hub. `hooks.json` runs it when a session
// starts; the platform gives it the session's folder and, for a session started as an agent, that agent's name.
//
// A home is a repository with `registry.yml` at its root (interface, Files). Only its main working tree gets the
// procedure: the home's own work items run in its linked worktrees, and each of those sessions is the item's, not the
// hub. A session started as an agent gets nothing either: `honsha:hub` already has the procedure as its prompt, and
// any other agent is not the hub.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");
const AGENT = "agents/hub.md";

/**
 * Whether a session in `cwd` that runs as `agent` is the hub.
 * @param {{ cwd?: string, agent?: string }} session
 */
export function isHub({ cwd, agent }) {
  if (agent || !cwd) return false;
  let top;
  try {
    top = execFileSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return false;
  }
  if (!fs.existsSync(path.join(top, "registry.yml"))) return false;
  // In a linked worktree, `.git` is a file that points to the main repository; in the main working tree, a folder.
  return fs.statSync(path.join(top, ".git"), { throwIfNoEntry: false })?.isDirectory() ?? false;
}

/** What the hook gives: a line that names the file and the kit directory, then the agent's body. */
export function context() {
  const text = fs.readFileSync(new URL(`../${AGENT}`, import.meta.url), "utf8");
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, "");
  return `The hub's procedure, ${AGENT} in the kit directory ${kit}:\n\n${body}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    // Without the platform's input the folder is unknown, and no session is taken for the hub.
  }
  const { cwd, agent_type: agent } = /** @type {{ cwd?: string, agent_type?: string }} */ (input);
  if (isHub({ cwd, agent })) {
    try {
      process.stdout.write(context());
    } catch {
      // The session starts all the same, but the person sees that the hub lacks its procedure.
      process.stderr.write(
        `Honsha: ${AGENT} could not be read, so this session in the home lacks the hub's procedure.\n`,
      );
      process.exitCode = 1;
    }
  }
}
