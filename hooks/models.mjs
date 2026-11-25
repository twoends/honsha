// Gives a session of an installation, when it starts, one line with the model that the installation maps to each of
// the kit's model tiers (core rules, Models), from the key `models` of `settings.yml` in the home. `hooks.json` runs it
// at each start.
//
//   node hooks/models.mjs < the hook's input
//
// A session names a tier's model when it starts a subagent, so every session needs the map: one that the hub did not
// start has no brief to find it in, and the platform runs the hook again after a compaction. The file is read on the
// home's default branch as last fetched, as the registry is (`hooks/place.mjs`), since a change of the map holds once
// its pull request is merged.
//
// No YAML library is used: the reader accepts the plain form below and refuses anything else, naming the line and
// never its text. A model's name is short and made of letters, digits and the few signs that model names use, so that
// the line stays within BUDGET and no text of the file reaches a session unchecked.
//
//   models: # other keys of the file are ignored
//     light: model-a # a comment may follow a value
//     standard: 'model-b'
//     strong: "model-c"

import { pathToFileURL } from "node:url";

import { homeFile, inside, session } from "./place.mjs";

export const TIERS = ["light", "standard", "strong", "strongest"];
export const SETTINGS = "settings.yml";
// The longest line: every tier with a name of the longest length that NAME accepts.
export const BUDGET = 390;

const NAME = /^[A-Za-z0-9][\w.:[\]-]{0,63}$/;
// Bare values that YAML reads as no string at all: a session must not take one for a model's name.
const NOT_A_NAME = /^(?:null|Null|NULL|true|True|TRUE|false|False|FALSE)$/;
const BLANK = /^\s*(?:#.*)?$/;
const INDENTED = /^\s/;
const KEY = /^models\s*:(.*)$/;
const NOTHING = /^(?:[ \t]+#.*)?[ \t]*$/;
const ENTRY = /^( +)([^\s:]+):[ \t]+(\S+)(?:[ \t]+#.*)?[ \t]*$/;

const OPENING = "Honsha models of this installation";
const WHERE = "`settings.yml` on the home's default branch";
const FAILED = "a session names no model for any tier (core rules, Models). Tell the person.\n";

export const NO_BRANCH = `${OPENING}: git cannot read the home's default branch, so ${FAILED}`;

/** @typedef {{ map: Record<string, string> | null } | { unreadable: number }} Read */

/**
 * The map under `models` in the text of `settings.yml`, null where the file or the key is missing; or the number of
 * the first line that the reader refuses.
 * @param {string | null} text
 * @returns {Read}
 */
export function parse(text) {
  if (text === null) return { map: null };
  /** @type {Record<string, string> | null} */
  let map = null;
  // The map while the lines read are under `models`, and the indentation of its entries.
  /** @type {Record<string, string> | null} */
  let block = null;
  /** @type {string | null} */
  let indent = null;
  // An editor may open the file with a byte order mark, which would hide a key on its first line.
  const rows = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (const [index, row] of rows.entries()) {
    if (BLANK.test(row)) continue;
    if (!INDENTED.test(row)) {
      block = null;
      const key = KEY.exec(row);
      if (!key) continue;
      if (map !== null || !NOTHING.test(key[1])) return { unreadable: index + 1 };
      block = {};
      map = block;
      continue;
    }
    if (block === null) continue;
    const entry = ENTRY.exec(row);
    if (entry !== null) {
      const [, space, tier, raw] = entry;
      const name = /^'(.*)'$/.exec(raw)?.[1] ?? /^"(.*)"$/.exec(raw)?.[1] ?? (NOT_A_NAME.test(raw) ? "" : raw);
      indent ??= space;
      if (space === indent && TIERS.includes(tier) && !Object.hasOwn(block, tier) && NAME.test(name)) {
        block[tier] = name;
        continue;
      }
    }
    return { unreadable: index + 1 };
  }
  return { map };
}

/**
 * The line a session receives for what the reader found.
 * @param {Read} read
 */
export function line(read) {
  if ("unreadable" in read) {
    return `${OPENING}: \`models\` in ${WHERE} cannot be read at line ${read.unreadable}, so ${FAILED}`;
  }
  const { map } = read;
  if (map === null || Object.keys(map).length === 0) {
    return `${OPENING}: ${WHERE} maps no model to any tier, so a session names none (core rules, Models).\n`;
  }
  const tiers = TIERS.map((tier) => (Object.hasOwn(map, tier) ? `${tier} \`${map[tier]}\`` : `${tier} no model`));
  return `${OPENING}, from ${WHERE}: ${tiers.join(", ")}.\n`;
}

/**
 * What the hook gives a session of the installation whose home is `home`.
 * @param {string} home
 */
export function context(home) {
  /** @type {string | null} */
  let text;
  try {
    ({ text } = homeFile(home, SETTINGS));
  } catch {
    return NO_BRANCH;
  }
  return line(parse(text));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    // Outside the installation's folders, or where it cannot be read, a session gets no map (`hooks/place.mjs`); in the
    // second case the hook of the core rules gives the reason in their place.
    if (inside(session().at)) process.stdout.write(context(process.env.CLAUDE_PLUGIN_OPTION_HOME || ""));
  } catch {
    // The session starts all the same, but the person sees that the map is missing.
    process.stderr.write("Honsha models: the models of this installation could not be read.\n");
    process.exitCode = 1;
  }
}
