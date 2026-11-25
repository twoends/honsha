// Run with: node --test hooks/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { BUDGET, NO_BRANCH, TIERS, line, parse } from "./models.mjs";
import { scratchHome } from "./scratch-home.mjs";

const script = fileURLToPath(new URL("./models.mjs", import.meta.url));
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

const MAPPED = "Honsha models of this installation, from `settings.yml` on the home's default branch: ";
const NO_MAP =
  "Honsha models of this installation: `settings.yml` on the home's default branch maps no model to any tier, so a session names none (core rules, Models).\n";
/** @param {number} at */
const unreadable = (at) =>
  `Honsha models of this installation: \`models\` in \`settings.yml\` on the home's default branch cannot be read at line ${at}, so a session names no model for any tier (core rules, Models). Tell the person.\n`;

const FULL = [
  "# The installation's settings.",
  "quiet: 22-07",
  "models: # the kit's tiers",
  "  # from the lightest",
  "  light: model-a # a comment may follow a value",
  "",
  "  standard: 'model-b'",
  '  strong: "model-c[x]"   # in quotes',
  "  strongest: place.vendor.model-d-v1:0",
  "max-workers: 3",
  "notify:",
  "  light: not-a-tier",
  "",
].join("\n");

test("the tiers are the kit's four, from the lightest", () => {
  assert.deepEqual(TIERS, ["light", "standard", "strong", "strongest"]);
});

test("a full map is read among the file's other keys, with its comments and quotes, and gives each tier's model", () => {
  const read = parse(FULL);
  assert.deepEqual(read, {
    map: { light: "model-a", standard: "model-b", strong: "model-c[x]", strongest: "place.vendor.model-d-v1:0" },
  });
  assert.equal(
    line(read),
    `${MAPPED}light \`model-a\`, standard \`model-b\`, strong \`model-c[x]\`, strongest \`place.vendor.model-d-v1:0\`.\n`,
  );
});

test("a tier that the map does not name has no model", () => {
  const read = parse("models:\n  light: model-a\n  strong: model-c\n");
  assert.deepEqual(read, { map: { light: "model-a", strong: "model-c" } });
  assert.equal(line(read), `${MAPPED}light \`model-a\`, standard no model, strong \`model-c\`, strongest no model.\n`);
});

test("no file, no key `models`, or a key that maps nothing, maps no model to any tier", () => {
  assert.deepEqual(parse(null), { map: null });
  assert.deepEqual(parse("quiet: 22-07\n"), { map: null });
  // Under another key, `models` is not the installation's map.
  assert.deepEqual(parse("notify:\n  models:\n    light: model-a\n"), { map: null });
  assert.deepEqual(parse("models:\n# none yet\nquiet: 22-07\n"), { map: {} });
  for (const read of [parse(null), parse("quiet: 22-07\n"), parse("models:\n")]) assert.equal(line(read), NO_MAP);
});

test("the reader refuses, at its line, what it cannot read, and the line never holds the text it refused", () => {
  /** @type {[string, string[], number][]} */
  const cases = [
    ["an unknown tier", ["models:", "  light: model-a", "  heavy: model-e"], 3],
    ["a repeated tier", ["models:", "  light: model-a", "  light: model-e"], 3],
    ["a repeated key", ["models:", "  light: model-a", "quiet: 22-07", "models:", "  strong: model-e"], 4],
    ["a map in braces", ["quiet: 22-07", "models: {}"], 2],
    ["a value after the key", ["models: model-e"], 1],
    ["a name too long", ["models:", `  light: ${"e".repeat(65)}`], 2],
    ["a name with a space", ["models:", "  light: 'model e'"], 2],
    ["a bare name with a space", ["models:", "  light: model e"], 2],
    ["a forbidden sign", ["models:", "  light: model`e"], 2],
    ["another forbidden sign", ["models:", '  light: "model/e"'], 2],
    ["a name that starts with a sign", ["models:", "  light: -model-e"], 2],
    ["an empty name", ["models:", "  light: ''"], 2],
    ["no name", ["models:", "  light:"], 2],
    ["a bare null", ["models:", "  light: null"], 2],
    ["a quote left open", ["models:", "  light: 'model-e"], 2],
    ["a comment with no space before it", ["models:", "  light: model-e# note"], 2],
    ["a nested map", ["models:", "  light:", "    name: model-e"], 2],
    ["a list", ["models:", "  - light: model-e"], 2],
    ["another indentation", ["models:", "  light: model-a", "    standard: model-e"], 3],
    ["a tab for indentation", ["models:", "\tlight: model-e"], 2],
  ];
  for (const [what, lines, at] of cases) {
    const read = parse(lines.join("\n"));
    assert.deepEqual(read, { unreadable: at }, what);
    const text = line(read);
    assert.equal(text, unreadable(at), what);
    assert.ok(!text.includes(lines[at - 1].trim()), what);
    assert.ok(!text.includes("model-e") && !text.includes("eeeeee"), what);
  }
});

test("a name of the longest length accepted is read, and one character more is refused", () => {
  const longest = "m".repeat(64);
  assert.deepEqual(parse(`models:\n  light: ${longest}\n`), { map: { light: longest } });
  assert.deepEqual(parse(`models:\n  light: ${longest}m\n`), { unreadable: 2 });
});

test("a file with CRLF line ends is read as one with LF, and a refused line keeps its number", () => {
  assert.deepEqual(parse(FULL.replace(/\n/g, "\r\n")), parse(FULL));
  assert.deepEqual(parse("models:\r\n  light: model-a\r\n  heavy: model-e\r\n"), { unreadable: 3 });
  assert.deepEqual(parse("﻿models:\r\n  light: model-a\r\n"), { map: { light: "model-a" } });
});

test("no line that the hook can give is longer than its budget, and the budget is no more than the longest needs", () => {
  const longest = parse(`models:\n${TIERS.map((tier) => `  ${tier}: ${"m".repeat(64)}`).join("\n")}\n`);
  const lines = [line(longest), line({ map: null }), line({ unreadable: Number.MAX_SAFE_INTEGER }), NO_BRANCH];
  for (const text of lines) assert.ok(text.length <= BUDGET, `${text.length} characters of ${BUDGET}: ${text}`);
  assert.ok(BUDGET - line(longest).length < 10, `${line(longest).length} characters of ${BUDGET}`);
  assert.equal(
    NO_BRANCH,
    "Honsha models of this installation: git cannot read the home's default branch, so a session names no model for any tier (core rules, Models). Tell the person.\n",
  );
});

/**
 * What the hook prints for a session's start in `cwd`, run as `hooks.json` writes it.
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} env
 */
const run = (cwd, env) =>
  execFileSync(process.execPath, [script], {
    encoding: "utf8",
    input: JSON.stringify({ hook_event_name: "SessionStart", cwd }),
    env,
  });

/** A new folder in the system's temporary one. */
function folder() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-models-"));
  made.push(dir);
  return dir;
}

test("in an installation the hook gives the map on the home's default branch, not in its working tree", () => {
  const project = folder();
  execFileSync("git", ["init", "-q", project]);
  const settings = "quiet: 22-07\nmodels:\n  light: model-a\n  standard: model-b\n  strong: model-c\n";
  const installation = scratchHome([project], { "settings.yml": settings });
  made.push(installation.home);
  const given = `${MAPPED}light \`model-a\`, standard \`model-b\`, strong \`model-c\`, strongest no model.\n`;
  assert.equal(run(project, installation.env), given);
  assert.equal(run(installation.home, installation.env), given);
  // A change of the map holds once it is on the default branch.
  fs.writeFileSync(path.join(installation.home, "settings.yml"), "models:\n  light: model-e\n");
  assert.equal(run(project, installation.env), given);
});

test("a home whose default branch has no `settings.yml` maps no model to any tier", () => {
  const project = folder();
  execFileSync("git", ["init", "-q", project]);
  const installation = scratchHome([project]);
  made.push(installation.home);
  assert.equal(run(project, installation.env), NO_MAP);
});

test("a home whose default branch git cannot find gives a line that says so", () => {
  const installation = scratchHome([]);
  made.push(installation.home);
  // An origin that was never fetched has no HEAD, so the home's default branch cannot be found.
  const origin = path.join(os.tmpdir(), "honsha-models-no-such-origin");
  execFileSync("git", ["-C", installation.home, "remote", "add", "origin", origin]);
  assert.equal(run(installation.home, installation.env), NO_BRANCH);
});

test("outside the installation's folders, or where the installation cannot be read, the hook gives nothing", () => {
  const project = folder();
  execFileSync("git", ["init", "-q", project]);
  const installation = scratchHome([project], { "settings.yml": "models:\n  light: model-a\n" });
  made.push(installation.home);
  const outside = folder();
  assert.equal(run(outside, installation.env), "");
  const elsewhere = folder();
  execFileSync("git", ["init", "-q", elsewhere]);
  assert.equal(run(elsewhere, installation.env), "");
  assert.equal(run(project, { ...installation.env, CLAUDE_PLUGIN_OPTION_HOME: "" }), "");
});
