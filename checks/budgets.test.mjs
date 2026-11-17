import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);

/**
 * Characters allowed for the documents a session reads at every start or every item. A budget stops the slow growth
 * that no single change makes visible; it is raised only by a work item that says why. The core rules and the record
 * template have their own limit, set by what a hook can deliver, in `hooks/hooks.test.mjs`.
 */
const budgets = {
  "agents/worker.md": 5800,
  "agents/checker.md": 7600,
};

for (const [file, budget] of Object.entries(budgets)) {
  test(`${file} stays within its budget`, () => {
    const size = fs.readFileSync(new URL(file, root), "utf8").length;
    assert.ok(size <= budget, `${size} characters, budget ${budget}`);
  });
}
