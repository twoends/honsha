// Gives one level of lessons to a session when it starts: the project's, those of the technologies its profile lists
// under `stack`, or the host's (workflow, section 8). `hooks.json` runs it once for each level.
//
//   node hooks/lessons.mjs project | technologies | host
//
// The project's lessons are the file that `lessons` names in its profile. The technologies' and the host's are in the
// home, whose folder on this machine is the plugin's setting `home`: the platform gives it to the hook as
// CLAUDE_PLUGIN_OPTION_HOME. A level gives at most BUDGET characters. One that has more gives the lessons that fit and
// names each file it left in part, so that nothing is left out without a word, and no output nears the platform's cap
// on a hook's output, which would replace it with a preview.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readProfile } from "../checks/profile.mjs";

export const LEVELS = ["project", "technologies", "host"];
export const BUDGET = 4000;
// Room kept for the closing line that names what was left out.
const NOTE = 400;

/**
 * The files of one level of lessons, absolute and as the output names them, and a notice when the level cannot be
 * loaded for a reason the person can mend.
 * @param {string} level
 * @param {{ project: string, home: string, host: string }} where
 * @returns {{ files: { file: string, name: string }[], notice: string | null }}
 */
export function sources(level, { project, home, host }) {
  if (level === "host") {
    if (!home) return { files: [], notice: null };
    const name = `lessons/host/${host.toLowerCase()}.md`;
    return { files: [{ file: path.join(home, name), name: `${name} in the home` }], notice: null };
  }
  const profile = readProfile(path.join(project, ".hub", "profile.yml"));
  if (level === "project") {
    const named = profile?.lessons;
    return { files: named ? [{ file: path.join(project, named), name: named }] : [], notice: null };
  }
  const stack = profile?.stack ?? [];
  if (stack.length === 0) return { files: [], notice: null };
  if (!home) {
    return {
      files: [],
      notice: `the plugin's setting \`home\` is not set on this machine, so the lessons of ${stack.join(", ")} are not loaded.`,
    };
  }
  const files = stack.map((technology) => {
    const name = `lessons/tech/${technology}.md`;
    return { file: path.join(home, name), name: `${name} in the home` };
  });
  return { files, notice: null };
}

/**
 * A lessons file cut into its head, before its first lesson, and its lessons: each a top-level item of its list, with
 * the lines that continue it.
 * @param {string} text
 */
export function split(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  const first = lines.findIndex((line) => line.startsWith("- "));
  if (first === -1) return { head: lines.join("\n"), items: /** @type {string[]} */ ([]) };
  /** @type {string[]} */
  const items = [];
  for (const line of lines.slice(first)) {
    if (line.startsWith("- ")) items.push(line);
    else items[items.length - 1] += `\n${line}`;
  }
  return { head: lines.slice(0, first).join("\n").trimEnd(), items: items.map((item) => item.trimEnd()) };
}

/**
 * What one level gives: a line that names it and its files, then each file's head and lessons while they fit, and a
 * line that names each file left in part. Empty when the level has nothing to give.
 * @param {string} level
 * @param {{ project: string, home: string, host: string }} where
 */
export function context(level, where) {
  /** @type {{ file: string, name: string }[]} */
  let present;
  /** @type {string | null} */
  let notice;
  try {
    const found = sources(level, where);
    present = found.files.filter(({ file }) => fs.existsSync(file));
    notice = found.notice;
  } catch (error) {
    present = [];
    notice = `${error instanceof Error ? error.message : String(error)}; the lessons are not loaded.`;
  }
  if (present.length === 0) return notice ? `Honsha lessons of the ${level}: ${notice}\n` : "";
  const room = BUDGET - NOTE;
  let out = `Honsha lessons of the ${level}, from ${present.map(({ name }) => name).join(", ")}:\n`;
  /** @type {string[]} */
  const left = [];
  for (const { file } of present) {
    const { head, items } = split(fs.readFileSync(file, "utf8"));
    if (out.length + head.length + 2 > room) {
      left.push(`${file}, all of it`);
      continue;
    }
    out += `\n${head}\n\n`;
    let given = 0;
    for (const item of items) {
      if (out.length + item.length + 1 > room) break;
      out += `${item}\n`;
      given += 1;
    }
    if (given < items.length) left.push(`${file}, ${items.length - given} of its ${items.length} lessons`);
  }
  if (left.length > 0) {
    out += `\nLeft out, past the ${BUDGET} characters a level of lessons may give: ${left.join("; ")}. Read them there, and tell the person that this level is full.\n`;
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [level = ""] = process.argv.slice(2);
  if (LEVELS.includes(level)) {
    const project = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const home = process.env.CLAUDE_PLUGIN_OPTION_HOME || "";
    try {
      process.stdout.write(context(level, { project, home, host: os.hostname() }));
    } catch {
      // The session starts all the same, but the person sees that a level of lessons is missing.
      process.stderr.write(`Honsha lessons: the lessons of the ${level} could not be read.\n`);
      process.exitCode = 1;
    }
  } else {
    process.stderr.write(`Honsha lessons: no level \`${level}\`; a level is ${LEVELS.join(", ")}.\n`);
    process.exitCode = 1;
  }
}
