import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DEFAULT_KINDS } from "../checks/measures.mjs";
import { checkRecord } from "../checks/record.mjs";
import { findReport, formatRegistry, parseRegistry, REGISTRY, run } from "./projects.mjs";

const now = new Date("2026-12-01T09:30:00Z");
const host = "example-host";

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/**
 * @param {string} dir
 * @param {string[]} args
 */
function git(dir, args) {
  return execFileSync("git", ["-C", dir, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Example",
      GIT_AUTHOR_EMAIL: "example@example.org",
      GIT_COMMITTER_NAME: "Example",
      GIT_COMMITTER_EMAIL: "example@example.org",
    },
  });
}

/**
 * A project's clone with an origin, whose default branch holds `settings` as `.claude/settings.json` when given.
 * @param {object} [settings]
 */
function project(settings) {
  const dir = temporary("honsha-project-");
  const origin = path.join(dir, "origin.git");
  const clone = path.join(dir, "clone");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", origin]);
  execFileSync("git", ["clone", "-q", origin, clone], { stdio: "ignore" });
  fs.writeFileSync(path.join(clone, "README.md"), "Example.\n");
  if (settings) {
    fs.mkdirSync(path.join(clone, ".claude"));
    fs.writeFileSync(path.join(clone, ".claude", "settings.json"), JSON.stringify(settings));
  }
  git(clone, ["add", "-A"]);
  git(clone, ["commit", "-q", "-m", "Start"]);
  git(clone, ["push", "-q", "-u", "origin", "main"]);
  git(clone, ["remote", "set-head", "origin", "main"]);
  return clone;
}

/**
 * Writes a record with a front matter.
 * @param {string} file
 * @param {Record<string, string>} values
 */
function record(file, values) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const front = Object.entries(values).map(([key, value]) => `${key}: ${value}`);
  fs.writeFileSync(file, `---\n${front.join("\n")}\n---\n\n## Intent\n\n> Example.\n`);
}

/**
 * @param {string} file
 * @param {string} state
 */
function setState(file, state) {
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/^state: .*$/m, `state: ${state}`));
}

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
  assert.deepEqual(parseRegistry("projects: []\n"), []);
  assert.throws(() => parseRegistry(`${formatRegistry(projects)}  extra: yes\n`), /line \d+: not in the shape/);
  assert.throws(() => parseRegistry(formatRegistry(projects).replace("adopting", "paused")), /the state `paused`/);
  assert.throws(() => parseRegistry(formatRegistry(projects).replace(/ {4}assessment: .*\n/, "")), /no `assessment`/);
});

test("add writes the entry as assessing and an assessment's record in the shape the rules ask for", () => {
  const home = temporary("honsha-home-");
  const folder = project();
  const added = run(["add", "example-shop", "example-owner/example-shop", folder], { home, host, now });
  assert.equal(added.code, 0, added.out.join("\n"));
  assert.match(added.out[0], /the next step is to run it/);
  const [entry] = parseRegistry(fs.readFileSync(path.join(home, REGISTRY), "utf8"));
  assert.deepEqual(entry, {
    name: "example-shop",
    repository: "example-owner/example-shop",
    paths: { [host]: path.resolve(folder) },
    state: "assessing",
    assessment: "261201-0930",
  });
  const file = findReport(home, "261201-0930");
  assert.ok(file);
  const text = fs.readFileSync(file, "utf8");
  assert.match(text, /^type: report$/m);
  assert.match(text, /^state: ready$/m);
  const problems = checkRecord(text, { file, id: "261201-0930", kinds: DEFAULT_KINDS });
  assert.deepEqual(problems, []);

  assert.equal(run(["add", "example-shop", "example-owner/example-shop", folder], { home, host, now }).code, 1);
  assert.equal(run(["add", "Example", "example-owner/example", folder], { home, host, now }).code, 2);
  assert.equal(run(["add", "other", "example-owner/other", home], { home, host, now }).code, 1);
});

test("add with an existing report takes it as the assessment and writes no new record", () => {
  const home = temporary("honsha-home-");
  record(path.join(home, "reports", "2026", "11", "261130-1200-example-assessment.md"), {
    id: "261130-1200",
    state: "done",
  });
  const folder = project();
  const added = run(["add", "example", "example-owner/example", folder, "--assessment", "261130-1200"], {
    home,
    host,
    now,
  });
  assert.equal(added.code, 0);
  assert.match(added.out[0], /it is done, so the next step is `choose`/);
  assert.equal(parseRegistry(fs.readFileSync(path.join(home, REGISTRY), "utf8"))[0].assessment, "261130-1200");
  assert.equal(findReport(home, "261201-0930"), null);
  assert.equal(
    run(["add", "other", "example-owner/other", folder, "--assessment", "261130-1300"], { home, host, now }).code,
    1,
  );
});

test("choose waits for the assessment to be done, then moves the project to adopting", () => {
  const home = temporary("honsha-home-");
  run(["add", "example", "example-owner/example", project()], { home, host, now });
  const refused = run(["choose", "example"], { home, host, now });
  assert.equal(refused.code, 1);
  assert.match(refused.out[0], /is ready, not done/);
  setState(/** @type {string} */ (findReport(home, "261201-0930")), "done");
  assert.equal(run(["choose", "example"], { home, host, now }).code, 0);
  assert.equal(parseRegistry(fs.readFileSync(path.join(home, REGISTRY), "utf8"))[0].state, "adopting");
  assert.equal(run(["choose", "example"], { home, host, now }).code, 1);
  assert.equal(run(["choose", "missing"], { home, host, now }).code, 1);
});

test("may-start lets through only the work each state allows", () => {
  const home = temporary("honsha-home-");
  const folder = project();
  const assessment = /** @type {const} */ (["may-start", "example"]);
  const item = path.join(folder, "work", "2026", "12", "261202-1000-example.md");
  record(item, { id: "261202-1000", source: "null" });
  const chosen = path.join(folder, "work", "2026", "12", "261202-1100-chosen.md");
  record(chosen, { id: "261202-1100", source: "261201-0930" });

  assert.equal(run([...assessment, item], { home, host, now }).code, 1);
  run(["add", "example", "example-owner/example", folder], { home, host, now });
  const report = /** @type {string} */ (findReport(home, "261201-0930"));
  assert.equal(run([...assessment, report], { home, host, now }).code, 0);
  assert.equal(run([...assessment, chosen], { home, host, now }).code, 1);

  setState(report, "done");
  run(["choose", "example"], { home, host, now });
  assert.equal(run([...assessment, chosen], { home, host, now }).code, 0);
  assert.equal(run([...assessment, item], { home, host, now }).code, 1);

  const text = fs.readFileSync(path.join(home, REGISTRY), "utf8");
  fs.writeFileSync(path.join(home, REGISTRY), text.replace("state: adopting", "state: active"));
  assert.equal(run([...assessment, item], { home, host, now }).code, 0);
});

test("refresh moves an adopting project to active once its default branch declares the kit", () => {
  const home = temporary("honsha-home-");
  const declared = project({ enabledPlugins: { "honsha@honsha": true } });
  const plain = project({ enabledPlugins: { "honsha@honsha": false } });
  const later = new Date("2026-12-01T09:31:00Z");
  run(["add", "declared", "example-owner/declared", declared], { home, host, now });
  assert.equal(run(["add", "plain", "example-owner/plain", plain], { home, host, now }).code, 1);
  run(["add", "plain", "example-owner/plain", plain], { home, host, now: later });
  setState(/** @type {string} */ (findReport(home, "261201-0930")), "done");
  setState(/** @type {string} */ (findReport(home, "261201-0931")), "done");
  run(["choose", "declared"], { home, host, now });
  run(["choose", "plain"], { home, host, now });

  const elsewhere = run(["refresh"], { home, host: "another-host", now });
  assert.match(elsewhere.out.join("\n"), /no folder on this host/);

  const result = run(["refresh"], { home, host, now });
  assert.equal(result.code, 0);
  const states = Object.fromEntries(
    parseRegistry(fs.readFileSync(path.join(home, REGISTRY), "utf8")).map((each) => [each.name, each.state]),
  );
  assert.deepEqual(states, { declared: "active", plain: "adopting" });
  assert.equal(git(declared, ["status", "--porcelain"]), "");
});
