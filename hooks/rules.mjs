// Gives one part of the core rules, or the record template, to a session when it starts, or to the checker when it
// starts as a subagent. `hooks.json` runs it once for each file and each of the two events.
//
//   node hooks/rules.mjs <file from the kit's root> [--subagent]
//
// The platform caps each hook's output at 10,000 characters, string by string, and replaces a longer one with a file
// path and a short preview, which would take the rules out of the context without a word. One hook per file gives
// every file a cap of its own; `hooks/hooks.test.mjs` runs each hook and keeps what it prints under the cap.
//
// A subagent does not get a session's start context, and reading the kit directory from a project needs a permission
// that a plugin's subagent may be refused; the platform adds a SubagentStart hook's context only from JSON output.
//
// Outside the installation's folders the hook gives nothing (`hooks/place.mjs`). Where the installation cannot be
// read, the hook of the opening part, `rules/core.md`, gives one line that says so in its place, and the others give
// nothing, so that the session can tell the person once.

import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { session, unknown } from "./place.mjs";

const OPENING = "rules/core.md";
const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");

/**
 * What a file gives: a line that names it and the kit directory, then the file. Hooks of one event run in parallel
 * and their outputs come in no stated order, so each output says by itself what it is.
 * @param {string} file a path from the kit's root, such as `rules/core.md`
 */
export function context(file) {
  const text = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const what = file.startsWith("templates/") ? "The record template" : "A part of the Honsha core rules";
  return `${what}, ${file} in the kit directory ${kit}:\n\n${text}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [file, flag] = process.argv.slice(2);
  try {
    const { at } = session();
    let text = "";
    if (at.kind === "unknown") text = file === OPENING ? unknown(at.reason) : "";
    else if (at.kind !== "outside") text = context(file);
    if (text !== "") {
      process.stdout.write(
        flag === "--subagent"
          ? JSON.stringify({ hookSpecificOutput: { hookEventName: "SubagentStart", additionalContext: text } })
          : text,
      );
    }
  } catch {
    // The session starts all the same, but the person sees that a part of the rules is missing.
    process.stderr.write(`Honsha: ${file ?? "no file"} could not be read, so the session lacks that part.\n`);
    process.exitCode = 1;
  }
}
