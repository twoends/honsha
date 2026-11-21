// Every reference to a part of the workflow or of the architecture names its heading, as `(workflow, The backlog)`,
// the way the core rules' parts are cited. A number would keep pointing at whatever section comes to hold it once a
// section is added or removed, and nothing would show it; a name that no heading carries any more fails here.
// Records keep the references they were written with, as history, so `work/` is not read.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const DOCUMENTS = { workflow: "docs/01-specs/WORKFLOW.md", architecture: "docs/01-specs/ARCHITECTURE.md" };
// This file is skipped too: its own tests hold references that name no heading, on purpose.
const SKIP = new Set([".git", ".claude", "node_modules", "work", "package-lock.json", "references.test.mjs"]);
const READ = /\.(md|mjs|ya?ml|json)$/;

/**
 * The headings of a Markdown document, levels two to four, outside fenced code.
 * @param {string} text
 */
export function headings(text) {
  const found = [];
  let fenced = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const heading = !fenced && /^#{2,4} (.+?)\s*$/.exec(line);
    if (heading) found.push(heading[1]);
  }
  return found;
}

/**
 * The text with each line break, and the comment marker that continues a comment on the next line, folded into a
 * space, so that a reference wrapped over two lines reads as one.
 * @param {string} text
 */
export function fold(text) {
  return text.replace(/[ \t]*\r?\n[ \t]*(?:(?:\/\/|#|\*)(?=[ \t]|$))?[ \t]*/g, " ");
}

/**
 * The references a text makes to each document: `(workflow, A)`, `(architecture, A; B)`, and the part of a reference
 * to several documents that names one of these, `(core rules, Delivery; workflow, The backlog)`. A name without a
 * document belongs to the document named before it in the same brackets.
 * @param {string} text
 */
export function references(text) {
  const found = [];
  for (const group of fold(text).matchAll(/\(([^()]*)\)/g)) {
    let document = null;
    for (const part of group[1].split(";").map((item) => item.trim())) {
      const named = /^(workflow|architecture|core rules), (.+)$/.exec(part);
      if (named) document = named[1];
      if (document === "workflow" || document === "architecture") {
        found.push({ document, name: named ? named[2] : part });
      }
    }
  }
  return found;
}

/**
 * Words that cite a section by its number: "section 5.2", "§ 5", or a bare number of a subsection in brackets,
 * "(14.3)". A bare number with no dot in brackets is left alone: "(1)" or "(5)" is as often a count as a section.
 * @param {string} text
 */
export function numbered(text) {
  return [...fold(text).matchAll(/\bsections? \d[\d.]*|§\s*\d|\(\d+(?:\.\d+)+\)/gi)].map((match) => match[0]);
}

/** @param {string} folder @returns {string[]} */
function files(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) return files(full);
    return READ.test(entry.name) ? [full] : [];
  });
}

test("headings are read outside fenced code, and folding joins a wrapped reference", () => {
  assert.deepEqual(headings("# Title\n\n## One\n\n```\n## Not one\n```\n### Two\n"), ["One", "Two"]);
  assert.deepEqual(
    references(
      "see (workflow,\n// The backlog), (architecture, Kit; Home) and (core rules, Delivery; workflow, Merging)",
    ),
    [
      { document: "workflow", name: "The backlog" },
      { document: "architecture", name: "Kit" },
      { document: "architecture", name: "Home" },
      { document: "workflow", name: "Merging" },
    ],
  );
  assert.deepEqual(references("(core rules, Sizes; Delivery) and f(a; b)"), []);
  assert.deepEqual(numbered("as section 5.2 says, and sections 8\n# and 2"), ["section 5.2", "sections 8"]);
  assert.deepEqual(numbered("for the guard (14.3), in two steps (2) of version 1.94.0"), ["(14.3)"]);
});

const named = Object.fromEntries(
  Object.entries(DOCUMENTS).map(([name, file]) => [name, headings(fs.readFileSync(path.join(root, file), "utf8"))]),
);

for (const [name, list] of Object.entries(named)) {
  test(`the ${name}'s headings carry no number and are each used once`, () => {
    assert.deepEqual(
      list.filter((heading) => /^\d/.test(heading)),
      [],
    );
    assert.deepEqual(
      list.filter((heading, index) => list.indexOf(heading) !== index),
      [],
    );
  });
}

test("every reference to the workflow or the architecture names one of its headings, and none cites a number", () => {
  const problems = [];
  for (const file of files(root)) {
    const text = fs.readFileSync(file, "utf8");
    const where = path.relative(root, file).split(path.sep).join("/");
    for (const { document, name } of references(text)) {
      if (!named[document].includes(name)) problems.push(`${where}: (${document}, ${name}) names no heading`);
    }
    for (const words of numbered(text)) problems.push(`${where}: "${words}" cites a section by its number`);
  }
  assert.deepEqual(problems, []);
});
