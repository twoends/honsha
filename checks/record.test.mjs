// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_KINDS, readProfile } from "./profile.mjs";
import { check, checkRecord, entriesOf, matches, readTemplate, recordPath } from "./record.mjs";

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

/**
 * A record whose `checks` are the given lines.
 * @param {string} entries
 */
const withChecks = (entries) => record({ checks: "" }, (t) => t.replace("checks: \n", `checks:\n${entries}`));

test("a deferred check may take several lines, as Prettier writes one past its width", () => {
  const long = "the main folder holds no install of its own, and a session there gets the procedure from the user's";
  // The form Prettier gave such an entry in a project whose formatter reads its records.
  const formatted = `  - {\n      due: 2026-11-22,\n      what: "${long}",\n    }\n`;
  assert.deepEqual(problems(withChecks(`${formatted}  - { due: 2026-12-01, what: "the export runs" }\n`)), []);
  const broken = [
    `  - {\n      due: soon,\n      what: "${long}",\n    }\n`,
    `  - {\n      what: "${long}",\n    }\n`,
    `  - {\n      due: 2026-11-22,\n      what: "${long}",\n`,
    // A line with no dash after a closed entry is an entry of its own, not the end of the one before.
    `  - { due: 2026-11-22, what: "x" }\n    { due: soon, what: "y" }\n`,
    `  - { due: 2026-11-22, what: "x" }\n    { due: 2026-12-01, what: "y" }\n`,
  ];
  for (const entries of broken) {
    assert.deepEqual(problems(withChecks(entries)), [
      `${FILE}: an entry of \`checks\` is not \`{ due: YYYY-MM-DD, what: … }\``,
    ]);
  }
  assert.deepEqual(
    entriesOf(["  - {", "      due: 2026-11-22,", '      what: "x",', "    }", '  - { due: 2026-12-01, what: "y" }']),
    ['- { due: 2026-11-22, what: "x", }', '- { due: 2026-12-01, what: "y" }'],
  );
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

test("where the profile is not at hand, an intent quoted or restated passes, and one that says nothing is named", () => {
  const options = { file: FILE, id: ID, kinds: DEFAULT_KINDS, template, public: null };
  const quoted = record({ state: "idea" });
  assert.deepEqual(checkRecord(quoted, options), []);
  const restated = quoted.replace("> Export the orders as CSV.", "The person asked for the orders as a CSV file.");
  assert.deepEqual(checkRecord(restated, options), []);
  for (const empty of ["", "> …", ">", "<!-- The person's words as a quote. -->\n\n> …"]) {
    const text = quoted.replace("> Export the orders as CSV.", empty);
    assert.deepEqual(checkRecord(text, options), [`${FILE}: the intent is not written`], empty);
  }
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

const REVIEW = "### Security review report\n\n**Verdict:** pass\n\n";
/**
 * The record with a security review report before its checker report, or at the end of Verification without one.
 * @param {string} text
 */
const reviewed = (text) =>
  text.includes("### Checker report")
    ? text.replace("### Checker report", `${REVIEW}### Checker report`)
    : text.replace("## Outcome", `${REVIEW}## Outcome`);
/**
 * The problems of a record whose branch changes the paths `due` under `security-review`.
 * @param {string} text
 * @param {string[]} due
 */
const whenDue = (text, due) => checkRecord(text, { file: FILE, id: ID, kinds: DEFAULT_KINDS, template, due });
const UNREVIEWED = `${FILE}: the branch changes a path under \`security-review\` (deploy/.env), and the verification has no security review report`;

test("a done record whose branch changes a path under `security-review` holds a security review report", () => {
  assert.deepEqual(whenDue(record(), ["deploy/.env"]), [UNREVIEWED]);
  assert.deepEqual(whenDue(reviewed(record()), ["deploy/.env"]), []);
  // A finding the person accepted leaves the verdict `fail`: the record's check asks only that the report be there.
  const accepted = reviewed(record()).replace(REVIEW, REVIEW.replace("pass", "fail"));
  assert.deepEqual(whenDue(accepted, ["deploy/.env"]), []);
  // Like a checker report's, its heading may name the commit it read.
  const named = reviewed(record()).replace("### Security review report", "### Security review report, on `abc1234`");
  assert.deepEqual(whenDue(named, ["deploy/.env"]), []);
  assert.deepEqual(whenDue(record(), []), []);
});

test("the security review report is asked at every size, and only once the item is done", () => {
  const trivial = record({ size: "trivial" }, (t) =>
    t
      .replace(/## Acceptance criteria[\s\S]*?## Verification/, "## Verification")
      .replace(/### Checker report[\s\S]*?## Outcome/, "## Outcome"),
  );
  assert.deepEqual(whenDue(trivial, ["deploy/.env"]), [UNREVIEWED]);
  assert.deepEqual(whenDue(reviewed(trivial), ["deploy/.env"]), []);
  const started = record({ state: "in-progress", pr: "null", model: "null" }, (t) =>
    t.slice(0, t.indexOf("## Verification")),
  );
  assert.deepEqual(whenDue(started, ["deploy/.env"]), []);
});

test("the problem names up to three of the paths due, then how many more", () => {
  const named = (/** @type {string[]} */ due) => /\((.*)\)/.exec(whenDue(record(), due)[0] ?? "")?.[1];
  assert.equal(named(["a", "b"]), "a and b");
  assert.equal(named(["a", "b", "c"]), "a, b and c");
  assert.equal(named(["a", "b", "c", "d", "e"]), "a, b, c and 2 more");
  assert.match(whenDue(record(), ["a", "b"])[0] ?? "", /the branch changes paths under `security-review` \(a and b\)/);
});

test("a security review report's verdict is never read as the checker's", () => {
  const review =
    "### Security review report\n\n**Verdict:** fail\n\n**Findings**\n\n1. A hole the person accepted.\n\n";
  assert.deepEqual(problems(record({}, (t) => t.replace("## Outcome", `${review}## Outcome`))), []);
  // A checker report with no verdict has none, whatever the report after it says.
  const unjudged = record({}, (t) =>
    t.replace("**Verdict:** pass\n\n", "").replace("## Outcome", `${review.replace("fail", "pass")}## Outcome`),
  );
  assert.deepEqual(problems(unjudged), [`${FILE}: the verification has no checker report with a verdict`]);
});

test("a pattern of `security-review` matches names that begin with a dot, and crosses folders only with `**`", () => {
  /** @type {[string, string, boolean][]} */
  const cases = [
    ["deploy/**", "deploy", true],
    ["deploy/**", "deploy/.env", true],
    ["deploy/**", "deploy/x/.env", true],
    ["deploy/**", "deployment/x", false],
    ["deploy/**", "app/deploy/x", false],
    ["**/*.pem", ".secrets/a.pem", true],
    ["**/*.pem", "a.pem", true],
    ["**/*.pem", "x/y/.pem", true],
    ["**/*.pem", "a.pem.txt", false],
    ["**", ".git-crypt/keys/a", true],
    ["**/**", "x/.y", true],
    ["*.pem", "a.pem", true],
    ["*.pem", "x/a.pem", false],
    [".env", ".env", true],
    [".env", "app/.env", false],
    ["*", ".env", true],
    ["*", "x/a", false],
    ["a/**/b.txt", "a/b.txt", true],
    ["a/**/b.txt", "a/x/y/b.txt", true],
    ["a/**/b.txt", "a/x/c.txt", false],
    ["a/**/b.txt", "ab.txt", false],
    ["**/deploy/**", "app/deploy/.env", true],
    ["**/deploy/**", "deploy", true],
    ["a/x**y", "a/xzzy", true],
    ["a/x**y", "a/x/y", false],
    ["?env", ".env", true],
    ["a?b", "a/b", false],
    ["a?b", "ab", false],
    ["a+b.txt", "a+b.txt", true],
    ["a+b.txt", "aab.txt", false],
    ["a.b", "a.b", true],
    ["a.b", "aXb", false],
    ["(x)|y^$", "(x)|y^$", true],
  ];
  for (const [pattern, file, expected] of cases) assert.equal(matches(file, pattern), expected, `${pattern} ${file}`);
});

/**
 * Runs git in a repository made by `repository`, with its empty configuration and an identity of its own.
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  return execFileSync("git", args, {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: path.join(dir, "no-config"),
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_AUTHOR_NAME: "Worker",
      GIT_AUTHOR_EMAIL: "worker@example.org",
      GIT_COMMITTER_NAME: "Worker",
      GIT_COMMITTER_EMAIL: "worker@example.org",
    },
  }).trim();
}

/**
 * Writes `files` into the repository, a null text removing the file, and commits every change.
 * @param {string} dir
 * @param {Record<string, string | null>} files
 * @param {string} subject
 */
function commit(dir, files, subject) {
  for (const [file, text] of Object.entries(files)) {
    if (text === null) fs.rmSync(path.join(dir, file));
    else {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), text);
    }
  }
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", subject]);
}

/**
 * A repository on `branch` holding `files`, that reads no configuration but its own.
 * @param {string} branch
 * @param {Record<string, string>} files
 */
function repository(branch, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-record-"));
  made.push(dir);
  fs.writeFileSync(path.join(dir, "no-config"), "");
  git(dir, ["init", "-q", "-b", branch, "."]);
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
  return dir;
}

// A pipeline gives the branch and the two ends of its changes; the tests give their own.
const quiet = { ...process.env, HONSHA_BRANCH: "", HONSHA_BASE: "", HONSHA_HEAD: "" };

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

const BRANCH = `work/${ID}-export-orders`;
const PATTERNS = 'security-review:\n  - "deploy/**"\n  - "**/*.pem"\n';

/**
 * A repository whose `main` holds a profile and a few files, on a work branch made from it.
 * @param {string} [profile]
 */
function project(profile = PATTERNS) {
  const dir = repository("main", { ".hub/profile.yml": profile, "deploy/run.sh": "run\n", "src/app.js": "app\n" });
  commit(dir, {}, "Start the project");
  git(dir, ["checkout", "-q", "-b", BRANCH]);
  return dir;
}

test("names the branch's changed paths under `security-review`, names that begin with a dot among them", () => {
  const dir = project();
  const files = { [FILE]: record(), "deploy/.env": "KEY=1\n", ".secrets/key.pem": "pem\n", "src/app.js": "app 2\n" };
  commit(dir, files, "Add the export");
  const due = [".secrets/key.pem", "deploy/.env"];
  assert.deepEqual(check({ cwd: dir, env: quiet }), {
    file: FILE,
    problems: [
      `${FILE}: the branch changes paths under \`security-review\` (.secrets/key.pem and deploy/.env), and the verification has no security review report`,
    ],
    due,
  });
  fs.writeFileSync(path.join(dir, FILE), reviewed(record()));
  assert.deepEqual(check({ cwd: dir, env: quiet }), { file: FILE, problems: [], due });
});

test("a file moved out of a path under `security-review` counts by its old path", () => {
  const dir = project();
  commit(dir, { [FILE]: reviewed(record()), "deploy/run.sh": null, "tools/run.sh": "run\n" }, "Move the script");
  // Git itself reads the move as a rename, and names only the new path.
  assert.equal(git(dir, ["diff", "--name-only", "main...HEAD"]), `tools/run.sh\n${FILE}`);
  assert.deepEqual(check({ cwd: dir, env: quiet }).due, ["deploy/run.sh"]);
});

test("reads the changes from the default branch as last fetched, else the local one, or between the pipeline's ends", () => {
  const dir = project();
  commit(dir, { [FILE]: reviewed(record()), "deploy/a.yml": "a\n" }, "Add a");
  const first = git(dir, ["rev-parse", "HEAD"]);
  commit(dir, { "deploy/b.yml": "b\n" }, "Add b");
  const due = (/** @type {NodeJS.ProcessEnv} */ env = {}) => check({ cwd: dir, env: { ...quiet, ...env } }).due;
  assert.deepEqual(due(), ["deploy/a.yml", "deploy/b.yml"]);
  assert.deepEqual(due({ HONSHA_BASE: first }), ["deploy/b.yml"]);
  assert.deepEqual(due({ HONSHA_HEAD: first }), ["deploy/a.yml"]);
  git(dir, ["update-ref", "refs/remotes/origin/main", first]);
  assert.deepEqual(due(), ["deploy/b.yml"]);
});

test("fails when the branch's changed files cannot be read, rather than pass a review it cannot tell is due", () => {
  const dir = project(`default-branch: trunk\n${PATTERNS}`);
  commit(dir, { [FILE]: reviewed(record()), "deploy/a.yml": "a\n" }, "Add a");
  assert.deepEqual(check({ cwd: dir, env: quiet }), {
    file: FILE,
    problems: [
      `${FILE}: the branch's changed files could not be read (the default branch \`trunk\` was not found), so whether the security review is due cannot be told`,
    ],
    due: [],
  });
  assert.deepEqual(check({ cwd: dir, env: { ...quiet, HONSHA_BASE: "no-such-commit" } }).problems, [
    `${FILE}: the branch's changed files could not be read (git could not compare \`no-such-commit...HEAD\`), so whether the security review is due cannot be told`,
  ]);
});

test("without paths under `security-review`, no diff is read and no `due` is given", () => {
  // A repository with no commit at all, where any diff would fail.
  for (const profile of ["verify: []\n", "security-review: []\n"]) {
    const dir = repository(BRANCH, { [FILE]: record(), ".hub/profile.yml": profile });
    assert.deepEqual(check({ cwd: dir, env: quiet }), { file: FILE, problems: [] });
  }
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

test("after the usual line, names the paths under `security-review` the branch changes, and fails without the report", () => {
  const dir = project();
  const keys = { "deploy/.env": "KEY=1\n", "deploy/a.pem": "a\n", "deploy/b.pem": "b\n", "deploy/c.pem": "c\n" };
  commit(dir, { [FILE]: reviewed(record()), ...keys }, "Add the keys");
  const passed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal(
    passed.stdout,
    `The record ${FILE} has the shape the rules ask for.\n` +
      "The branch changes 4 paths under `security-review` in the profile: deploy/.env, deploy/a.pem, deploy/b.pem and " +
      "1 more. The security review is due before delivery (`honsha:security-review`).\n",
  );
  fs.writeFileSync(path.join(dir, FILE), record());
  const failed = spawnSync(process.execPath, [script], { cwd: dir, env: quiet, encoding: "utf8" });
  assert.equal(failed.status, 1);
  assert.equal(failed.stdout, "");
  assert.match(
    failed.stderr,
    /\(deploy\/\.env, deploy\/a\.pem, deploy\/b\.pem and 1 more\), and the verification has no security review report/,
  );
});

test("a section kept only if there is something to say is not left empty", () => {
  assert.deepEqual(problems(record({}, (t) => t.replace("## Outcome", "## Deviations\n\n## Outcome"))), [
    `${FILE}: section "Deviations" is empty, and is kept only when there is something to say`,
  ]);
});
