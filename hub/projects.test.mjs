import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DEFAULT_KINDS } from "../checks/measures.mjs";
import { checkRecord } from "../checks/record.mjs";
import { findRecord, formatRegistry, parseRegistry, REGISTRY, run, workingTree } from "./projects.mjs";

const now = new Date("2026-12-01T09:30:00Z");
const later = new Date("2026-12-01T09:31:00Z");
const host = "example-host";

// The script commits with the identity git finds, which a machine that runs the tests may not have.
Object.assign(process.env, {
  GIT_AUTHOR_NAME: "Example",
  GIT_AUTHOR_EMAIL: "example@example.org",
  GIT_COMMITTER_NAME: "Example",
  GIT_COMMITTER_EMAIL: "example@example.org",
});

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/**
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/**
 * Writes files under a folder.
 * @param {string} dir
 * @param {Record<string, string>} files
 */
function write(dir, files) {
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  }
}

/**
 * A clone with an origin, whose default branch `main` holds `files`.
 * @param {string} prefix
 * @param {Record<string, string>} files
 */
function clone(prefix, files) {
  const dir = temporary(prefix);
  const origin = path.join(dir, "origin.git");
  const folder = path.join(dir, "clone");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["clone", "-q", origin, folder], { stdio: "ignore" });
  write(folder, { "README.md": "Example.\n", ...files });
  git(folder, ["add", "-A"]);
  git(folder, ["commit", "-q", "-m", "Start"]);
  git(folder, ["push", "-q", "-u", "origin", "main"]);
  git(folder, ["remote", "set-head", "origin", "main"]);
  return folder;
}

/**
 * A project's clone, whose default branch holds `files`.
 * @param {Record<string, string>} [files]
 */
const project = (files = {}) => clone("honsha-project-", files);

/**
 * A home's clone, whose default branch holds `files`.
 * @param {Record<string, string>} [files]
 */
const home = (files = {}) => clone("honsha-home-", { ".hub/profile.yml": "name: example-home\n", ...files });

/**
 * Commits `files` on the home's default branch and pushes them, as a merged pull request would.
 * @param {string} dir
 * @param {Record<string, string>} files
 */
function onMain(dir, files) {
  write(dir, files);
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", "Change"]);
  git(dir, ["push", "-q", "origin", "main"]);
}

/**
 * Merges a work branch into the home's default branch and pushes it, as the person would through its pull request.
 * @param {string} dir
 * @param {string} branch
 */
function merge(dir, branch) {
  git(dir, ["merge", "-q", "--no-ff", "-m", "Merge", branch]);
  git(dir, ["push", "-q", "origin", "main"]);
}

/**
 * A record's text with a front matter.
 * @param {Record<string, string>} values
 */
function record(values) {
  const front = Object.entries(values).map(([key, value]) => `${key}: ${value}`);
  return `---\n${front.join("\n")}\n---\n\n## Intent\n\n> Example.\n`;
}

/**
 * A registry of projects on `host`, each with a name, a state and an assessment.
 * @param {[string, string, string, string?][]} entries name, state, assessment, folder
 */
function registry(entries) {
  return formatRegistry(
    entries.map(([name, state, assessment, folder]) => ({
      name,
      repository: `example-owner/${name}`,
      paths: { [host]: folder ?? `/srv/${name}` },
      state,
      assessment,
    })),
  );
}

/**
 * @param {string} dir
 * @param {string} ref
 * @param {string} file
 */
const show = (dir, ref, file) => git(dir, ["show", `${ref}:${file}`]);

/**
 * The problems the kit's record check finds in a record on a branch.
 * @param {string} dir
 * @param {string} branch
 * @param {string} file
 */
function recordProblems(dir, branch, file) {
  const id = /work\/(\d{6}-\d{4})-/.exec(branch)?.[1] ?? "";
  return checkRecord(show(dir, branch, file), { file, id, kinds: DEFAULT_KINDS });
}

/** @param {string} dir */
const workBranches = (dir) => git(dir, ["for-each-ref", "--format=%(refname:short)", "refs/heads/work/"]).trim();

test("the registry is read back as it is written, and a line in another shape stops the reader", () => {
  const projects = [
    {
      name: "example-shop",
      repository: "example-owner/example-shop",
      paths: { [host]: "C:\\projects\\it's here" },
      state: "adopting",
      assessment: "261201-0930",
    },
  ];
  assert.deepEqual(parseRegistry(formatRegistry(projects)), projects);
  const chosen = [
    { ...projects[0], chosen: ["261201-0940", "261201-0941"] },
    { ...projects[0], chosen: [] },
  ];
  assert.match(formatRegistry(chosen), /\n {4}chosen: \[261201-0940, 261201-0941\]\n[^]*\n {4}chosen: \[\]\n$/);
  assert.deepEqual(parseRegistry(formatRegistry(chosen)), chosen);
  assert.throws(() => parseRegistry(formatRegistry(chosen).replace("[]", "none")), /line \d+: not in the shape/);
  // The interface shows the shape, so its example is one the script reads.
  const shown = fs.readFileSync(new URL("../docs/01-specs/INTERFACE.md", import.meta.url), "utf8");
  const example = /## The registry[^]*?```\n([^]*?)```/.exec(shown)?.[1] ?? "";
  assert.deepEqual(
    parseRegistry(example).map((each) => each.chosen),
    [["261202-1000", "261202-1005"]],
  );
  // The file is the installation's, so its header cites the kit's interface, the one part of the kit it may cite.
  assert.ok(
    formatRegistry(projects).startsWith("# Written by the kit's hub/projects.mjs (interface, The registry).\n"),
  );
  assert.deepEqual(parseRegistry("projects: []\n"), []);
  assert.throws(() => parseRegistry(`${formatRegistry(projects)}  extra: yes\n`), /line \d+: not in the shape/);
  assert.throws(() => parseRegistry(formatRegistry(projects).replace("adopting", "paused")), /the state `paused`/);
  assert.throws(() => parseRegistry(formatRegistry(projects).replace(/ {4}assessment: .*\n/, "")), /no `assessment`/);
});

test("add commits the entry and the assessment's record on the assessment's branch, and leaves the home as it is", () => {
  const dir = home();
  fs.writeFileSync(path.join(dir, "draft.md"), "Unsaved.\n");
  const folder = project();
  const added = run(["add", "example-shop", "example-owner/example-shop", folder], { home: dir, host, now });
  assert.equal(added.code, 0, added.out.join("\n"));
  const branch = "work/261201-0930-example-shop-assessment";
  const file = "work/2026/12/261201-0930-example-shop-assessment.md";
  assert.match(added.out.join("\n"), /the assessment runs there/);
  assert.match(added.out.join("\n"), new RegExp(`\`${branch}\`.*\\n.*push the branch and open its pull request`));

  assert.equal(git(dir, ["symbolic-ref", "--short", "HEAD"]).trim(), "main");
  assert.equal(git(dir, ["status", "--porcelain"]), "?? draft.md\n");
  assert.equal(git(dir, ["worktree", "list"]).trim().split("\n").length, 1);
  assert.equal(git(dir, ["ls-remote", "origin", branch]), "");
  assert.throws(() => git(dir, ["rev-parse", "--abbrev-ref", `${branch}@{upstream}`]));

  assert.equal(git(dir, ["rev-list", "--count", `main..${branch}`]).trim(), "1");
  assert.match(git(dir, ["log", "-1", "--format=%B", branch]), /\n\nWork-Item: 261201-0930\n/);
  assert.deepEqual(git(dir, ["diff", "--name-only", "main", branch]).trim().split("\n"), [REGISTRY, file]);
  assert.deepEqual(parseRegistry(show(dir, branch, REGISTRY)), [
    {
      name: "example-shop",
      repository: "example-owner/example-shop",
      paths: { [host]: path.resolve(folder) },
      state: "assessing",
      assessment: "261201-0930",
    },
  ]);
  assert.match(show(dir, branch, file), /^type: report$/m);
  assert.match(show(dir, branch, file), /^state: ready$/m);
  // The session that runs the assessment learns its procedure from the record, which names the skill that holds it.
  assert.match(show(dir, branch, file), /The procedure is the skill `honsha:assessment`\./);
  assert.deepEqual(recordProblems(dir, branch, file), []);

  const again = run(["add", "example-shop", "example-owner/example-shop", folder], { home: dir, host, now });
  assert.match(again.out[0], /exists already: run again in a minute/);
  assert.equal(run(["add", "Example", "example-owner/example", folder], { home: dir, host, now }).code, 2);
  assert.equal(run(["add", "other", "example-owner/other", temporary("plain-")], { home: dir, host, now }).code, 1);

  merge(dir, branch);
  const known = run(["add", "example-shop", "example-owner/example-shop", folder], { home: dir, host, now: later });
  assert.match(known.out[0], /in the registry already, as assessing/);
});

test("add with an existing report takes it as the assessment, in a trivial item of its own", () => {
  const dir = home({
    "reports/2026/11/261130-1200-example-assessment.md": record({ id: "261130-1200", state: "done" }),
  });
  const folder = project();
  const added = run(["add", "example", "example-owner/example", folder, "--assessment", "261130-1200"], {
    home: dir,
    host,
    now,
  });
  assert.equal(added.code, 0, added.out.join("\n"));
  assert.match(added.out[0], /it is done, so `choose` follows the merge/);
  const branch = "work/261201-0930-add-example";
  const file = "work/2026/12/261201-0930-add-example.md";
  assert.equal(parseRegistry(show(dir, branch, REGISTRY))[0].assessment, "261130-1200");
  assert.match(show(dir, branch, file), /^size: trivial$/m);
  assert.match(show(dir, branch, file), /^project: example-home$/m);
  assert.ok(show(dir, branch, file).includes("the change to `registry.yml` (interface, The registry)."));
  assert.deepEqual(recordProblems(dir, branch, file), []);

  const missing = run(["add", "other", "example-owner/other", folder, "--assessment", "261130-1300"], {
    home: dir,
    host,
    now: later,
  });
  assert.equal(missing.code, 1);
  assert.match(missing.out[0], /No report `261130-1300`/);
});

test("choose waits for the assessment to be merged and done, then commits the move to adopting", () => {
  const dir = home();
  run(["add", "example", "example-owner/example", project()], { home: dir, host, now });
  assert.match(run(["choose", "example"], { home: dir, host, now: later }).out[0], /not in the registry/);
  merge(dir, "work/261201-0930-example-assessment");
  const refused = run(["choose", "example"], { home: dir, host, now: later });
  assert.equal(refused.code, 1);
  assert.match(refused.out[0], /is ready, not done/);

  const report = "work/2026/12/261201-0930-example-assessment.md";
  onMain(dir, {
    [report]: fs.readFileSync(path.join(dir, report), "utf8").replace("state: ready", "state: done"),
    "backlog/example/261201-0940-profile.md": record({ id: "261201-0940", state: "ready", source: "261201-0930" }),
    "backlog/example/261201-0941-other.md": record({ id: "261201-0941", state: "ready", source: "261130-0000" }),
  });
  /** @param {string[]} ids */
  const choose = (ids) => run(["choose", "example", ...ids], { home: dir, host, now: later });
  for (const [ids, reason] of [
    [["261201-0942"], /No record 261201-0942 in the home's backlog of `example`/],
    [["261201-0941"], /does not have the assessment 261201-0930 as its source/],
    [["261201-0940", "261201-0940"], /is not one identifier of a record/],
    [["profile"], /is not one identifier of a record/],
  ]) {
    const refusal = choose(/** @type {string[]} */ (ids));
    assert.equal(refusal.code, 1);
    assert.match(refusal.out.join("\n"), /** @type {RegExp} */ (reason));
    assert.equal(workBranches(dir), "work/261201-0930-example-assessment");
  }
  const chosen = choose(["261201-0940"]);
  assert.equal(chosen.code, 0, chosen.out.join("\n"));
  const branch = "work/261201-0931-choose-example";
  assert.deepEqual(parseRegistry(show(dir, branch, REGISTRY))[0], {
    ...parseRegistry(show(dir, "main", REGISTRY))[0],
    state: "adopting",
    chosen: ["261201-0940"],
  });
  assert.equal(parseRegistry(show(dir, "main", REGISTRY))[0].state, "assessing");
  const file = "work/2026/12/261201-0931-choose-example.md";
  assert.match(show(dir, branch, file), /^requested-by: person$/m);
  assert.match(show(dir, branch, file), /^> `hub\/projects\.mjs choose example 261201-0940`$/m);
  assert.match(show(dir, branch, file), /active once the chosen items 261201-0940 are merged as done/);
  assert.deepEqual(recordProblems(dir, branch, file), []);

  merge(dir, branch);
  const twice = run(["choose", "example"], { home: dir, host, now: new Date("2026-12-01T09:32:00Z") });
  assert.match(twice.out[0], /is adopting, not assessing/);
  assert.equal(run(["choose", "missing"], { home: dir, host, now }).code, 1);
});

test("refresh commits the move to active of the projects whose chosen items are all merged as done or dropped", () => {
  const item = (/** @type {string} */ id, /** @type {string} */ state) => ({
    [`work/2026/11/${id}-item.md`]: record({ id, state, source: "261130-1200" }),
  });
  const finished = project({ ...item("261130-1210", "done"), ...item("261130-1211", "done") });
  const going = project(item("261130-1220", "done"));
  // A record left in progress on the default branch is not merged as done: its pull request is not.
  const stale = project(item("261130-1230", "in-progress"));
  const dropped = project(item("261130-1240", "done"));
  const none = project();
  /** @type {import("./projects.mjs").Project[]} */
  const entries = [
    ["finished", finished, ["261130-1210", "261130-1211"]],
    ["going", going, ["261130-1220", "261130-1221"]],
    ["stale", stale, ["261130-1230"]],
    ["dropped", dropped, ["261130-1240", "261130-1241"]],
    ["none", none, []],
  ].map(([name, folder, chosen]) => ({
    name: String(name),
    repository: `example-owner/${name}`,
    paths: { [host]: String(folder) },
    state: "adopting",
    assessment: "261130-1200",
    ...(chosen ? { chosen: /** @type {string[]} */ (chosen) } : {}),
  }));
  const dir = home({
    [REGISTRY]: formatRegistry(entries),
    "work/2026/11/261130-1200-assessment.md": record({ id: "261130-1200", state: "done" }),
    "backlog/going/261130-1221-later.md": record({ id: "261130-1221", state: "ready", source: "261130-1200" }),
    "backlog/dropped/261130-1241-not-now.md": record({ id: "261130-1241", state: "dropped", source: "261130-1200" }),
  });

  const elsewhere = run(["refresh"], { home: dir, host: "another-host", now });
  assert.match(elsewhere.out.join("\n"), /no folder on this host/);
  assert.match(elsewhere.out.join("\n"), /nothing was committed/);
  assert.equal(workBranches(dir), "");

  const result = run(["refresh"], { home: dir, host, now });
  assert.equal(result.code, 0, result.out.join("\n"));
  const out = result.out.join("\n");
  assert.match(out, /`going` stays adopting: 261130-1221 not yet merged as done, nor dropped\./);
  assert.match(out, /`stale` stays adopting: 261130-1230 not yet/);
  const branch = "work/261201-0930-refresh";
  const states = Object.fromEntries(parseRegistry(show(dir, branch, REGISTRY)).map((each) => [each.name, each.state]));
  assert.deepEqual(states, {
    finished: "active",
    going: "adopting",
    stale: "adopting",
    dropped: "active",
    none: "active",
  });
  const file = "work/2026/12/261201-0930-refresh.md";
  assert.match(show(dir, branch, file), /^requested-by: check$/m);
  assert.deepEqual(recordProblems(dir, branch, file), []);
  assert.equal(git(finished, ["status", "--porcelain"]), "");

  // An entry adopting with no chosen items written stays so, and fails the registry's check.
  const unwritten = home({
    [REGISTRY]: registry([["unwritten", "adopting", "261130-1200", project()]]),
    "work/2026/11/261130-1200-assessment.md": record({ id: "261130-1200", state: "done" }),
  });
  const kept = run(["refresh"], { home: unwritten, host, now });
  assert.match(
    kept.out.join("\n"),
    /`unwritten` stays adopting: the items chosen from its assessment are not written\./,
  );
  assert.equal(workBranches(unwritten), "");
  assert.match(run(["check"], { home: unwritten }).out.join("\n"), /`unwritten` is adopting, but the items chosen/);
});

test("folder commits a project's folder on this host, a host's first one included, and refuses what it cannot set", () => {
  const first = project();
  const moved = project();
  const dir = home({
    [REGISTRY]: registry([["example", "active", "261130-1200", first]]),
    "work/2026/11/261130-1200-example-assessment.md": record({ id: "261130-1200", state: "done" }),
  });

  const result = run(["folder", "example", moved], { home: dir, host, now });
  assert.equal(result.code, 0, result.out.join("\n"));
  assert.match(result.out[0], /^Once merged, `example` is in .+ on example-host\.$/);
  const branch = "work/261201-0930-folder-example";
  assert.deepEqual(parseRegistry(show(dir, branch, REGISTRY))[0].paths, { [host]: path.resolve(moved) });
  assert.deepEqual(parseRegistry(show(dir, "main", REGISTRY))[0].paths, { [host]: first });
  const file = "work/2026/12/261201-0930-folder-example.md";
  assert.match(show(dir, branch, file), /^size: trivial$/m);
  assert.match(show(dir, branch, file), /^requested-by: person$/m);
  assert.deepEqual(recordProblems(dir, branch, file), []);
  assert.equal(git(dir, ["symbolic-ref", "--short", "HEAD"]).trim(), "main");
  assert.equal(git(dir, ["status", "--porcelain"]), "");

  const added = run(["folder", "example", moved], { home: dir, host: "another-host", now: later });
  assert.equal(added.code, 0, added.out.join("\n"));
  assert.deepEqual(parseRegistry(show(dir, "work/261201-0931-folder-example", REGISTRY))[0].paths, {
    [host]: first,
    "another-host": path.resolve(moved),
  });

  const then = { home: dir, host, now: new Date("2026-12-01T09:32:00Z") };
  assert.match(run(["folder", "example", first], then).out[0], /already: nothing to change/);
  assert.match(run(["folder", "missing", moved], then).out[0], /not in the registry/);
  assert.match(run(["folder", "example", temporary("plain-")], then).out[0], /not the folder of a git repository/);
  assert.equal(run(["folder", "example"], then).code, 2);
  assert.equal(workBranches(dir).split("\n").length, 2);
});

test("a move whose registry would fail the check commits nothing", () => {
  const dir = home({ [REGISTRY]: registry([["lost", "assessing", "261130-1200"]]) });
  const result = run(["add", "example", "example-owner/example", project()], { home: dir, host, now });
  assert.equal(result.code, 1);
  assert.match(result.out.join("\n"), /assessment 261130-1200 of `lost` has no record[\s\S]*Nothing was committed/);
  assert.equal(workBranches(dir), "");
});

test("check fails on a registry it cannot read, a missing assessment, or a state its assessment does not allow", () => {
  const dir = temporary("honsha-check-");
  assert.match(run(["check"], { home: dir }).out[0], /There is no registry\.yml/);
  write(dir, {
    [REGISTRY]: registry([
      ["first", "active", "261130-1200"],
      ["second", "assessing", "261130-1300"],
    ]),
    "reports/2026/11/261130-1200-first-assessment.md": record({ id: "261130-1200", state: "done" }),
    "work/2026/11/261130-1300-second-assessment.md": record({ id: "261130-1300", state: "in-progress" }),
  });
  assert.deepEqual(run(["check"], { home: dir }), {
    code: 0,
    out: ["registry.yml is readable, and the assessment of every project has its record."],
  });
  assert.equal(findRecord(workingTree(dir), "261130-1300"), "work/2026/11/261130-1300-second-assessment.md");

  const failures = [
    [
      registry([["second", "adopting", "261130-1300"]]),
      /`second` is adopting, but its assessment 261130-1300 is in-progress/,
    ],
    [registry([["third", "assessing", "261130-1400"]]), /the assessment 261130-1400 of `third` has no record/],
    [
      registry([
        ["first", "active", "261130-1200"],
        ["first", "active", "261130-1200"],
      ]),
      /`first` is written twice/,
    ],
    [`${registry([])}  - name\n`, /line 3: not in the shape/],
  ];
  for (const [text, expected] of failures) {
    write(dir, { [REGISTRY]: /** @type {string} */ (text) });
    const result = run(["check"], { home: dir });
    assert.equal(result.code, 1);
    assert.match(result.out.join("\n"), /** @type {RegExp} */ (expected));
  }
});

test("may-start reads the registry of the home's default branch, and lets through only the work each state allows", () => {
  const folder = project();
  const item = path.join(folder, "work", "2026", "12", "261202-1000-example.md");
  const chosen = path.join(folder, "work", "2026", "12", "261202-1100-chosen.md");
  const assessment = path.join(folder, "assessment.md");
  write(folder, {
    "work/2026/12/261202-1000-example.md": record({ id: "261202-1000", source: "null" }),
    "work/2026/12/261202-1100-chosen.md": record({ id: "261202-1100", source: "261201-0930" }),
    "assessment.md": record({ id: "261201-0930", source: "null" }),
  });
  const report = { "work/2026/12/261201-0930-example-assessment.md": record({ id: "261201-0930", state: "done" }) };
  const dir = home(report);
  const ask = (/** @type {string} */ file) => run(["may-start", "example", file], { home: dir, host, now }).code;

  assert.equal(ask(item), 1);
  const unknown = run(["may-start", "example", item], { home: dir, host, now });
  assert.match(unknown.out[0], /is not in the registry/);
  assert.match(unknown.out[0], /The assessment that `add` starts is not asked for/);
  onMain(dir, { [REGISTRY]: registry([["example", "assessing", "261201-0930"]]) });
  assert.equal(ask(assessment), 0);
  assert.equal(ask(chosen), 1);

  onMain(dir, { [REGISTRY]: registry([["example", "adopting", "261201-0930"]]) });
  assert.equal(ask(chosen), 0);
  assert.equal(ask(item), 1);

  write(dir, { [REGISTRY]: registry([["example", "active", "261201-0930"]]) });
  assert.equal(ask(item), 1, "a state in the working tree only is not merged");
  onMain(dir, { [REGISTRY]: registry([["example", "active", "261201-0930"]]) });
  assert.equal(ask(item), 0);
});
