// Gives the checker, when it starts as a subagent, what a session receives when it starts: the core rules and the
// record template. A subagent does not get a session's start context, and reading the kit directory from a project
// needs a permission that a plugin's subagent may be refused, so the checker's file would otherwise have to write
// the rules out a second time.
//
// The platform adds a SubagentStart hook's context only from JSON output, not from plain text, and replaces any
// over 10,000 characters with a file path; `hooks/hooks.test.mjs` keeps it under that.

import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");

/** @param {string} file */
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

/** The context the checker receives, in the order and with the words a session receives it at start. */
export function context() {
  return `${read("rules/core.md")}\nKit directory: ${kit}\n\nThe record template, templates/record.md in the kit directory:\n\n${read("templates/record.md")}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "SubagentStart", additionalContext: context() } }),
  );
}
