// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { judge, simpleCommands } from "./guard.mjs";

const script = fileURLToPath(new URL("./guard.mjs", import.meta.url));
const WORK = "work/261116-1432-export-orders";
/** @type {string[]} */
const made = [];

after(() => {
  for (const dir of made) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * A repository with one commit, checked out on `branch`, with a profile when one is given.
 * @param {string} [branch]
 * @param {string | null} [profile]
 */
function repository(branch = WORK, profile = null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-guard-"));
  made.push(dir);
  const empty = path.join(dir, "no-config");
  fs.writeFileSync(empty, "");
  /** @param {...string} args */
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: empty,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Worker",
        GIT_AUTHOR_EMAIL: "worker@example.org",
        GIT_COMMITTER_NAME: "Worker",
        GIT_COMMITTER_EMAIL: "worker@example.org",
      },
    });
  git("init", "-q", "-b", "main", ".");
  if (profile) {
    fs.mkdirSync(path.join(dir, ".hub"));
    fs.writeFileSync(path.join(dir, ".hub", "profile.yml"), profile);
  }
  git("commit", "-q", "--allow-empty", "-m", "Start the project");
  if (branch !== "main") git("checkout", "-q", "-b", branch);
  return dir;
}

const onWork = repository();
const onMain = repository("main");

// The piece of an invented hosting service, so that these tests name no real one. The commands of
// a real service are tested in its own piece.
const pieces = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-pieces-"));
made.push(pieces);
fs.mkdirSync(path.join(pieces, "forge"));
fs.writeFileSync(
  path.join(pieces, "forge", "merge-commands.json"),
  JSON.stringify({ merge: ["^forge( .*)? merge( |$)"] }),
);

/**
 * @param {string} line
 * @param {string} [cwd]
 */
const refused = (line, cwd = onWork) => {
  const reason = judge(line, { cwd, services: pieces });
  assert.ok(reason, `let through: ${line}`);
  return reason;
};
/**
 * @param {string} line
 * @param {string} [cwd]
 */
const allowed = (line, cwd = onWork) => assert.equal(judge(line, { cwd, services: pieces }), null, `refused: ${line}`);

test("splits a command line into simple commands and keeps quoted text as one word", () => {
  assert.deepEqual(simpleCommands('cd repo && git commit -m "Add a thing; push later" | cat'), [
    ["cd", "repo"],
    ["git", "commit", "-m", "Add a thing; push later"],
    ["cat"],
  ]);
  assert.deepEqual(simpleCommands("echo 'one two' three\\ four\nls"), [["echo", "one two", "three four"], ["ls"]]);
  assert.deepEqual(simpleCommands("x=$(git rev-parse HEAD)"), [["x=$"], ["git", "rev-parse", "HEAD"]]);
  assert.deepEqual(simpleCommands("cat > notes.md <<EOF\ngit push --force\nEOF\nls"), [
    ["cat", ">", "notes.md", "<<EOF"],
    ["ls"],
  ]);
});

test("refuses a push whose destination is the default branch", () => {
  for (const line of [
    "git push origin main",
    "git push origin master",
    "git push -u origin main",
    "git push origin HEAD:main",
    `git push origin ${WORK}:main`,
    "git push origin :main",
    "git push origin refs/heads/main",
    `git push origin ${WORK} main`,
    "git push origin --delete main",
    "git -C . push origin main",
    "git -c core.editor=true push origin main",
    "/usr/bin/git push origin main",
    "GIT_TRACE=1 git push origin main",
    'git add -A && git commit -m "Add the export" && git push origin main',
    "result=$(git push origin main 2>&1)",
    "git push origin main 2>&1 | tail -3",
  ]) {
    assert.match(refused(line), /default branch `(main|master)`/);
  }
});

test("refuses a push with no destination when the checkout is on the default branch", () => {
  for (const line of [
    "git push",
    "git push origin",
    "git push origin HEAD",
    "git push --follow-tags",
    "git push origin 2>&1",
  ]) {
    assert.match(refused(line, onMain), /default branch `main`/);
  }
  assert.match(refused(`git -C "${onMain}" push`, onWork), /default branch `main`/);
});

test("refuses a forced push, whatever its destination", () => {
  for (const line of [
    `git push --force origin ${WORK}`,
    "git push -f",
    `git push -uf origin ${WORK}`,
    `git push --force-with-lease origin ${WORK}`,
    `git push --force-with-lease=${WORK} origin ${WORK}`,
    `git push --force-if-includes origin ${WORK}`,
    `git push origin +${WORK}`,
    `git push origin +HEAD:${WORK}`,
  ]) {
    assert.match(refused(line), /is forced/);
  }
});

test("refuses a push that skips the hooks", () => {
  for (const line of [`git push --no-verify origin ${WORK}`, "git push origin HEAD --no-verify"]) {
    assert.match(refused(line), /skips the repository's hooks/);
  }
  allowed('git commit -m "Say that a session never runs git push --no-verify"');
});

test("refuses a push of every branch", () => {
  for (const line of [
    "git push --all",
    "git push --all origin",
    "git push --mirror origin",
    "git push --branches origin",
  ]) {
    assert.match(refused(line), /every branch/);
  }
});

test("refuses the commands that the piece of a hosting service lists as merging", () => {
  for (const line of [
    "forge merge 12",
    "forge --repository owner/repository merge 12",
    "FORGE_TOKEN=x forge merge 12",
    "/usr/local/bin/forge merge 12",
    "forge checks 12 && forge merge 12",
  ]) {
    assert.match(refused(line), /merges a pull request/);
  }
});

test("lets through what a work item needs", () => {
  for (const line of [
    `git push -u origin ${WORK}`,
    `git push origin ${WORK}`,
    `git push origin ${WORK}:${WORK}`,
    `git push origin HEAD:refs/heads/${WORK}`,
    "git push",
    "git push origin",
    "git push origin HEAD",
    "git push origin HEAD 2>&1 | tail -3",
    "git push --tags",
    `git push origin --delete ${WORK}`,
    "git fetch origin main",
    "git merge origin/main",
    "git log --oneline main..HEAD",
    "git diff main...HEAD > .honsha-checker.diff",
    'git commit -m "Say that a session never runs git push --force"',
    'git commit -m "Refuse git push origin main" && git push',
    'echo "git push origin main"',
    "cat > notes.md <<EOF\ngit push --force origin main\nforge merge 12\nEOF",
    "cat > notes.md <<'EOF'\ngit push origin main\nEOF\ngit add notes.md",
    'forge open --base main --title "Export orders as CSV"',
    "forge view 12",
    "forge checks 12",
    'echo "forge merge 12"',
    "npm run check",
    "",
    '"unfinished',
  ]) {
    allowed(line);
  }
});

test("takes the default branch from the profile when it names one", () => {
  const dir = repository(WORK, "default-branch: trunk\n");
  assert.match(refused("git push origin trunk", dir), /default branch `trunk`/);
  allowed("git push origin main", dir);
  allowed("git push origin trunk", repository(WORK, "verify: [unreadable]\n"));
});

test("reads the merge commands of every piece, and none when there is no piece", () => {
  const services = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-services-"));
  made.push(services);
  assert.equal(judge("tracker merge 12", { cwd: onWork, services }), null);
  fs.mkdirSync(path.join(services, "example"));
  fs.writeFileSync(
    path.join(services, "example", "merge-commands.json"),
    JSON.stringify({ merge: ["^tracker merge( |$)"] }),
  );
  fs.mkdirSync(path.join(services, "broken"));
  fs.writeFileSync(path.join(services, "broken", "merge-commands.json"), "not JSON");
  assert.match(judge("tracker merge 12", { cwd: onWork, services }) ?? "", /merges a pull request/);
  assert.equal(judge("tracker view 12", { cwd: onWork, services }), null);
  assert.equal(judge("tracker merge 12", { cwd: onWork, services: path.join(services, "missing") }), null);
});

/** @param {unknown} input */
function hook(input) {
  return spawnSync(process.execPath, [script], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
  });
}

/**
 * @param {string | undefined} command
 * @param {Record<string, unknown>} [extra]
 */
const call = (command, extra = {}) => ({
  hook_event_name: "PreToolUse",
  tool_name: "Bash",
  tool_input: { command },
  cwd: onWork,
  ...extra,
});

test("as a hook it exits with code 2 and says why, and with 0 when it lets a command through", () => {
  const stopped = hook(call("git push origin main"));
  assert.equal(stopped.status, 2);
  assert.match(stopped.stderr, /^Honsha guard: this push would update the default branch `main`\./);
  const passed = hook(call(`git push -u origin ${WORK}`));
  assert.equal(passed.status, 0);
  assert.equal(passed.stderr, "");
});

test("never fails on input it does not understand", () => {
  for (const input of [
    "",
    "not JSON",
    "{}",
    call(undefined),
    { hook_event_name: "PostToolUse", tool_input: { command: "git push origin main" } },
  ]) {
    const result = hook(input);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
  }
  assert.equal(hook(call("git push origin main", { cwd: path.join(os.tmpdir(), "no-such-folder") })).status, 2);
});
