// Writes the effort level of a session into the work-item record it edits.
//
// Runs as a PostToolUse hook on Write and Edit (see hooks.json). When the edited file is a record,
// the `effort` key of its front matter takes the level the hook input reports. The value is the
// level of the last main session that edited the record. An edit made inside a subagent is
// skipped: the record describes the session that does the work, not its helpers.
//
// `model` is not written here. No hook event carries the model of a session started without a
// terminal interface, so the session that finishes the item writes its own model identifier.
//
// It writes only in a session of the installation's folders (`hooks/place.mjs`). The script never gets in a session's
// way: on any error it exits 0 and changes nothing.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { inside, placeOf, readInput } from "./place.mjs";

const RECORD_PATH = /(^|\/)work\/\d{4}\/\d{2}\/\d{6}-\d{4}-[^/]+\.md$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/**
 * Returns the record's text with `effort` set to the level (null when the model has none),
 * or null when the text is not a record: no front matter, or front matter without the key.
 * @param {string} text
 * @param {string | null | undefined} level
 * @returns {string | null}
 */
export function stamp(text, level) {
  const match = FRONT_MATTER.exec(text);
  if (!match) return null;
  const before = match[1];
  if (!/^effort:/m.test(before)) return null;
  const value = /^[a-z]+$/.test(level || "") ? level : "null";
  const after = before.replace(/^effort:.*?(\r?)$/m, (_, cr) => `effort: ${value}${cr}`);
  const start = match[0].indexOf(before);
  return text.slice(0, start) + after + text.slice(start + before.length);
}

function main() {
  const input = readInput();
  if (input?.hook_event_name !== "PostToolUse" || input.agent_id) return;
  if (!input.tool_input?.file_path) return;
  const file = path.resolve(input.cwd || ".", input.tool_input.file_path);
  if (!RECORD_PATH.test(file.replace(/\\/g, "/"))) return;
  if (!inside(placeOf(input))) return;
  const text = fs.readFileSync(file, "utf8");
  const next = stamp(text, input.effort?.level || process.env.CLAUDE_EFFORT);
  if (next === null || next === text) return;
  fs.writeFileSync(file, next);
  const written = /^effort:.*$/m.exec(next);
  if (!written) return;
  const line = written[0].trim();
  const note = `A hook wrote \`${line}\` into the front matter of ${file}. The file on disk is newer than the last read of it.`;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: note } }),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch {
    // Never fail the session because of this hook.
  }
}
