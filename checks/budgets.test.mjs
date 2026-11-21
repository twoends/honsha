import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);

/**
 * Characters allowed for a document. A budget stops the slow growth that no single change makes visible; it is raised
 * only by a work item that says why. The core rules and the record template have their own limit, set by what a hook
 * can deliver, in `hooks/hooks.test.mjs`.
 *
 * - The worker's and the checker's files are read at every item, the hub's at the start of every session in a home's
 *   own folder, and a skill whenever its situation comes: what they hold is paid for each time, so each is kept to what
 *   its reader needs. The hub's budget is also what `hooks/hooks.test.mjs` counts for it at a hub's start.
 * - The profile's template is read whenever a profile is written or read for what a key holds.
 * - The workflow is read by whoever changes the kit, not by a session at work; nothing else stops its growth, and a
 *   rule that a session applies belongs elsewhere (workflow, Where the rules are).
 * - The interface is read by whoever writes an installation's files. It is a list that points to where each thing is
 *   specified, and a list that grows past its budget is taking in specifications that belong elsewhere.
 */
/** @type {Record<string, number>} */
const budgets = {
  "agents/hub.md": 6000,
  "agents/worker.md": 5800,
  "agents/checker.md": 7600,
  "templates/profile.yml": 4400,
  "docs/01-specs/WORKFLOW.md": 35000,
  "docs/01-specs/INTERFACE.md": 9000,
};
const SKILL = 6000;

for (const entry of fs.readdirSync(new URL("skills/", root), { withFileTypes: true })) {
  if (entry.isDirectory()) budgets[`skills/${entry.name}/SKILL.md`] = SKILL;
}

for (const [file, budget] of Object.entries(budgets)) {
  test(`${file} stays within its budget`, () => {
    const size = fs.readFileSync(new URL(file, root), "utf8").length;
    assert.ok(size <= budget, `${size} characters, budget ${budget}`);
  });
}
