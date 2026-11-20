// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_KINDS } from "./measures.mjs";
import { readProfile } from "./profile.mjs";
import { check, checkRecord, readTemplate, recordPath } from "./record.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const script = fileURLToPath(new URL("./record.mjs", import.meta.url));
const template = readTemplate(fs.readFileSync(path.join(root, "templates", "record.md"), "utf8"));
const ID = "261116-1432";
const FILE = `work/2026/11/${ID}-export-orders.md`;
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * A record of a small item, done, in the shape the rules ask for; `change` edits its text.
 * @param {Record<string, string>} [fields]
 * @param {(text: string) => string} [change]
 */
function record(fields = {}, change = (text) => text) {
  const front = {
    id: ID,
    title: "Export orders as CSV",
    project: "example-project",
    type: "change",
    size: "small",
    kind: "feature",
    state: "done",
    areas: "[backend]",
    created: "2026-11-16",
    updated: "2026-11-16",
    "requested-by": "person",
    source: "null",
    pr: "12",
    model: "a-model",
    effort: "high",
    checks: "[]",
    ...fields,
  };
  const head = Object.entries(front)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return change(`---
${head}
---

## Intent

> Export the orders as CSV.

## Acceptance criteria

1. A button exports the orders.

## Strategy

A route and a button.

## Log

- The route and the button are added.

## Verification

\`npm test\` passed.

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. A button exports the orders: met.

## Outcome

The orders can be exported.
`);
}

/**
 * @param {string} text
 * @param {Record<string, number>} [kinds]
 */
const problems = (text, kinds = DEFAULT_KINDS) => checkRecord(text, { file: FILE, id: ID, kinds, template });

test("the template's comments say which sizes keep each section", () => {
  /** @type {Record<string, unknown>} */
  const shape = {};
  for (const section of template.sections) shape[section.name] = { ...section.names, optional: section.optional };
  assert.deepEqual(shape, {
    Intent: { trivial: "Intent", small: "Intent", full: "Intent", optional: false },
    "Scope and acceptance criteria": {
      small: "Acceptance criteria",
      full: "Scope and acceptance criteria",
      optional: false,
    },
    Strategy: { small: "Strategy", full: "Strategy", optional: false },
    Approval: { full: "Approval", optional: false },
    Log: { small: "Log", full: "Log", optional: false },
    Verification: { trivial: "Verification", small: "Verification", full: "Verification", optional: false },
    Deviations: { trivial: "Deviations", small: "Deviations", full: "Deviations", optional: true },
    Outcome: { trivial: "Outcome", small: "Outcome", full: "Outcome", optional: false },
  });
  assert.deepEqual(template.keys.get("size"), ["trivial", "small", "full"]);
});

// A script that fails a correct record blocks every item, so the kit's own done records are its cases. A record that
// lacks a key the template has is not one: it would fail for that key alone.
test("the records of the kit's merged items pass", () => {
  const profile = readProfile(path.join(root, ".hub", "profile.yml"));
  const kinds = profile?.kinds ?? DEFAULT_KINDS;
  const folder = path.join(root, "work");
  const files = fs
    .readdirSync(folder, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(folder, file));
  const current = files
    .map((file) => ({ file, text: fs.readFileSync(file, "utf8") }))
    .filter(({ text }) => [...template.keys.keys()].every((key) => new RegExp(`^${key}:`, "m").test(text)))
    .filter(({ text }) => /^state: done$/m.test(text));
  assert.ok(current.length >= 10, `${current.length} records`);
  for (const { file, text } of current) {
    const id = path.basename(file).slice(0, 11);
    // A record written before its project became public quotes its intent, and is checked in the form it was written
    // in; the rule for a public project has cases of its own.
    const intent = text.split(/^## /m).find((section) => section.startsWith("Intent")) ?? "";
    const restated = !/^>/m.test(intent);
    assert.deepEqual(checkRecord(text, { file, id, kinds, template, public: restated }), []);
  }
});

test("a record in the shape the rules ask for passes", () => {
  assert.deepEqual(problems(record()), []);
});

test("names each break of the front matter on its own line", () => {
  const text = record({ type: "task", id: "261116-1500", kind: "chore", created: "16 November", owner: "me" }, (t) =>
    t.replace("checks: []\n", ""),
  );
  assert.deepEqual(problems(text), [
    `${FILE}: \`owner\` is not a key of the record template`,
    `${FILE}: \`type\` is \`task\`, not one of change, report`,
    `${FILE}: \`checks\` is missing`,
    `${FILE}: \`id\` is \`261116-1500\`, not ${ID}, the one of the branch`,
    `${FILE}: \`created\` is not a date YYYY-MM-DD`,
    `${FILE}: \`kind\` is \`chore\`, not one of feature, fix, upkeep, change`,
  ]);
});

test("the kinds are the profile's when it lists them", () => {
  assert.deepEqual(problems(record({ kind: "gate" }), { gate: 1 }), []);
  assert.equal(problems(record(), { gate: 1 }).length, 1);
});

test("a deferred check is a date and what to look at", () => {
  const ok = record({ checks: "" }, (t) =>
    t.replace("checks: \n", 'checks:\n  - { due: 2026-12-01, what: "the export runs" }\n'),
  );
  assert.deepEqual(problems(ok), []);
  const bad = record({ checks: "" }, (t) => t.replace("checks: \n", "checks:\n  - { due: soon, what: x }\n"));
  assert.deepEqual(problems(bad), [`${FILE}: an entry of \`checks\` is not \`{ due: YYYY-MM-DD, what: … }\``]);
});

test("a section the size does not keep, or one written twice, is named", () => {
  const text = record({}, (t) =>
    t.replace("## Log", "## Approval\n\nYes.\n\n## Notes\n\nMore.\n\n## Log").concat("\n## Log\n"),
  );
  assert.deepEqual(problems(text), [
    `${FILE}: section "Approval" is not one a small item keeps`,
    `${FILE}: section "Notes" is not one a small item keeps`,
    `${FILE}: section "Log" appears twice`,
  ]);
});

test("headings inside fenced code are not sections", () => {
  assert.deepEqual(problems(record({}, (t) => t.replace("A route and a button.", "```\n## Notes\n```"))), []);
});

test("an intent that is not quoted is named", () => {
  assert.deepEqual(problems(record({}, (t) => t.replace("> Export the orders as CSV.", "Export the orders."))), [
    `${FILE}: the intent is not quoted`,
  ]);
});

test("in a public project, an intent that quotes the person is named, and one that restates the request passes", () => {
  const options = { file: FILE, id: ID, kinds: DEFAULT_KINDS, template, public: true };
  assert.deepEqual(checkRecord(record(), options), [`${FILE}: the intent quotes the person in a public project`]);
  const restated = record({}, (t) =>
    t.replace("> Export the orders as CSV.", "The person asked for the orders as a CSV file."),
  );
  assert.deepEqual(checkRecord(restated, options), []);
});

test("before done, sections still to write are not missing; after it, they are", () => {
  const unfinished = record({ state: "in-progress", pr: "null", model: "null" }, (t) =>
    t.slice(0, t.indexOf("## Verification")),
  );
  assert.deepEqual(problems(unfinished), []);
  assert.deepEqual(problems(record({ pr: "null", model: "null" }, (t) => t.slice(0, t.indexOf("## Verification")))), [
    `${FILE}: section "Verification" is not written`,
    `${FILE}: section "Outcome" is not written`,
    `${FILE}: a done item has no \`pr\``,
    `${FILE}: a done item has no \`model\``,
    `${FILE}: the verification has no checker report with a verdict`,
  ]);
});

test("once a full item has started, its approval and its scope's headings are written", () => {
  const full = record({ size: "full", state: "in-progress" }, (t) =>
    t
      .replace(
        "## Acceptance criteria",
        "## Scope and acceptance criteria\n\n### In scope\n\nThe export.\n\n### Acceptance criteria",
      )
      .replace("## Log", "## Approval\n\n## Log"),
  );
  assert.deepEqual(problems(full), [
    `${FILE}: "Scope and acceptance criteria" has no "Out of scope"`,
    `${FILE}: "Scope and acceptance criteria" has no "Boundaries"`,
    `${FILE}: section "Approval" is not written`,
  ]);
  assert.deepEqual(problems(full.replace("state: in-progress", "state: awaiting-approval")), []);
  const scoped = full.replace(
    "### Acceptance criteria",
    "### Out of scope\n\nNone.\n\n### Boundaries\n\nNone.\n\n### Acceptance criteria",
  );
  assert.deepEqual(problems(scoped.replace("## Approval\n", "## Approval\n\nApproved.\n")), []);
});

test("once a small item has started, what comes before the verification is written", () => {
  const started = record({ state: "in-progress", pr: "null", model: "null" }, (t) =>
    t.slice(0, t.indexOf("## Verification")).replace("A route and a button.", ""),
  );
  assert.deepEqual(problems(started), [`${FILE}: section "Strategy" is not written`]);
});

test("the report kept in full decides, wherever earlier reports stand", () => {
  const earlier = "\n### Checker report, first run\n\n**Verdict:** fail\n\n**Findings**\n\n1. Something.\n";
  const passed = record({}, (t) => t.replace("## Outcome", `${earlier}\n## Outcome`));
  assert.deepEqual(problems(passed), []);
  const failed = record({}, (t) => t.replace("**Verdict:** pass", "**Verdict:** fail"));
  assert.deepEqual(problems(failed), [
    `${FILE}: the checker report kept in full has the verdict \`fail\`, not \`pass\``,
  ]);
});

test("a trivial item needs no checker report, and a report item needs its pull request", () => {
  const trivial = record({ size: "trivial" }, (t) =>
    t
      .replace(/## Acceptance criteria[\s\S]*?## Verification/, "## Verification")
      .replace(/### Checker report[\s\S]*?## Outcome/, "## Outcome"),
  );
  assert.deepEqual(problems(trivial), []);
  assert.deepEqual(problems(record({ type: "report" })), []);
  assert.deepEqual(problems(record({ type: "report", pr: "null" })), [`${FILE}: a done item has no \`pr\``]);
});

/**
 * A repository on `branch` holding `files`, that reads no configuration but its own.
 * @param {string} branch
 * @param {Record<string, string>} files
 */
function repository(branch, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-record-"));
  made.push(dir);
  const empty = path.join(dir, "no-config");
  fs.writeFileSync(empty, "");
  const env = { ...process.env, GIT_CONFIG_GLOBAL: empty, GIT_CONFIG_NOSYSTEM: "1" };
  execFileSync("git", ["init", "-q", "-b", branch, "."], { cwd: dir, env });
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  return dir;
}

const quiet = { ...process.env, HONSHA_BRANCH: "" };

test("finds the record from the branch and reads the kinds of the profile", () => {
  assert.equal(recordPath(`work/${ID}-export-orders`), FILE);
  assert.equal(recordPath("main"), null);
  const dir = repository(`work/${ID}-export-orders`, {
    [FILE]: record({ kind: "gate" }),
    ".hub/profile.yml": "kinds:\n  gate: 1\n",
  });
  assert.deepEqual(check({ cwd: dir, env: quiet }), { file: FILE, problems: [] });
  const other = check({ cwd: dir, env: { ...quiet, HONSHA_BRANCH: `work/${ID}-export-invoices` } });
  assert.deepEqual(other.problems, [
    `work/2026/11/${ID}-export-invoices.md: there is no record for the branch; work/2026/11 holds ${ID}-export-orders.md`,
  ]);
});

test("reads from the profile whether the project is public", () => {
  const dir = repository(`work/${ID}-export-orders`, { [FILE]: record(), ".hub/profile.yml": "public: true\n" });
  assert.deepEqual(check({ cwd: dir, env: quiet }).problems, [
    `${FILE}: the intent quotes the person in a public project`,
  ]);
});

test("a branch that is not a work branch has nothing to check", () => {
  const dir = repository("main", {});
  assert.match(check({ cwd: dir, env: quiet }).note ?? "", /`main` is not a work branch/);
});

test("the exit code is 1 with each break named, and 0 when the record is in shape", () => {
  const dir = repository(`work/${ID}-export-orders`, { [FILE]: record() });
  const passed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(passed.status, 0, passed.stderr);
  fs.writeFileSync(path.join(dir, FILE), record({ pr: "null" }));
  const failed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /a done item has no `pr`/);
});

test("a section kept only if there is something to say is not left empty", () => {
  assert.deepEqual(problems(record({}, (t) => t.replace("## Outcome", "## Deviations\n\n## Outcome"))), [
    `${FILE}: section "Deviations" is empty, and is kept only when there is something to say`,
  ]);
});
