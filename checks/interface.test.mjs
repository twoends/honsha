// The kit's interface (`docs/01-specs/INTERFACE.md`) is what an installation's files may name, so it has to match the
// kit both ways: a name it lists that the kit lacks sends an installation to nothing, and an agent, a skill, a
// template, a script or a command that it does not list is one an installation cannot know it may rely on.

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
/** @param {string} file */
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const text = read("docs/01-specs/INTERFACE.md");

/**
 * The distinct first groups of a pattern's matches in a text, sorted.
 * @param {RegExp} pattern a global pattern with one group
 * @param {string} within
 */
const found = (pattern, within) => [...new Set([...within.matchAll(pattern)].map((match) => match[1]))].toSorted();

/**
 * The text of a section of the interface, up to the next heading of its level.
 * @param {string} heading
 */
function section(heading) {
  const start = text.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `the interface has no section "${heading}"`);
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start, end < 0 ? undefined : end);
}

/** @param {string} folder */
const entries = (folder) => fs.readdirSync(new URL(`${folder}/`, root), { withFileTypes: true });

test("the interface names every agent and skill of the kit, and none it lacks", () => {
  const agents = entries("agents")
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.slice(0, -".md".length));
  const skills = entries("skills")
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  // `honsha:area-<name>` stands for every pack, so its placeholder ends the match before the closing backtick.
  assert.deepEqual(found(/`honsha:([a-z][a-z-]*)`/g, text), [...agents, ...skills].toSorted());
});

test("the interface names every template of the kit, and none it lacks", () => {
  const templates = entries("templates")
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  assert.deepEqual(found(/`templates\/([\w.-]+)`/g, text), templates.toSorted());
});

test("the interface names the marketplace, the plugin and its settings as the manifests do", () => {
  const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  assert.match(section("The plugin"), new RegExp(`\`${plugin.name}@${marketplace.name}\``));
  for (const key of Object.keys(plugin.userConfig ?? {})) {
    assert.match(section("The plugin"), new RegExp(`setting \`${key}\``), key);
  }
});

/** The scripts of `checks/`, `hub/` and each piece of `services/` that run as commands, by their path from the root. */
function scripts() {
  const pieces = entries("services")
    .filter((entry) => entry.isDirectory())
    .map((entry) => `services/${entry.name}`);
  return ["checks", "hub", ...pieces]
    .flatMap((folder) =>
      entries(folder)
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mjs") && !entry.name.endsWith(".test.mjs"))
        .map((entry) => `${folder}/${entry.name}`),
    )
    .filter((file) => read(file).includes("import.meta.url === pathToFileURL("))
    .toSorted();
}

/** The interface's command lines: the script each runs, and the words that follow it. */
function commands() {
  const block = /```\n([\s\S]*?)```/.exec(section("Commands"));
  assert.ok(block, "the section Commands has no block of commands");
  return block[1]
    .trim()
    .split("\n")
    .map((line) => {
      const parsed = /^node <kit directory>\/((?:checks|hub)\/[\w-]+\.mjs)(?: (.*))?$/.exec(line);
      assert.ok(parsed, `not a command of the kit: ${line}`);
      return { script: parsed[1], words: (parsed[2] ?? "").split(" ").filter(Boolean) };
    });
}

test("every script that runs as a command is in the interface, and every command it lists runs", async () => {
  const all = scripts();
  const listed = commands();
  // A script left out of the interface is named in its text all the same, so that leaving it out is a choice.
  for (const script of all) {
    assert.ok(text.includes(`\`${script}\``) || listed.some((command) => command.script === script), script);
  }
  for (const { script } of listed) assert.ok(all.includes(script), `${script} does not run as a command`);
  // A script that the text names, inside the interface or as left out of it, is one the kit has.
  for (const script of found(/`((?:checks|hub|services\/[\w-]+)\/[\w-]+\.mjs)`/g, text)) {
    assert.ok(all.includes(script), `${script} is named, and does not run as a command`);
  }
  for (const script of new Set(listed.map((command) => command.script))) {
    const module = await import(new URL(script, root).href);
    const given = listed.filter((command) => command.script === script).map((command) => command.words[0] ?? "");
    if (Array.isArray(module.COMMANDS)) {
      // A script with commands lists each once, and the interface gives each of them.
      assert.deepEqual(given.toSorted(), [...module.COMMANDS].toSorted(), script);
    } else {
      // A script without commands takes only options and arguments, which the interface writes in brackets.
      assert.deepEqual(
        given.filter((word) => word !== "" && !word.startsWith("[")),
        [],
        script,
      );
    }
  }
});
