// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { gitDirectory, judge, readPath, simpleCommands } from "./guard.mjs";

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

test("a profile that declares direct commits lets no push to the default branch through", () => {
  const direct = repository("main", "default-branch: main\ndirect-commits: true\n");
  for (const line of ["git push", "git push origin main", 'git commit -m "Record a decision" && git push']) {
    assert.match(refused(line, direct), /update the default branch `main`/);
  }
  assert.match(refused(`git -C "${direct}" push origin main`, onWork), /default branch `main`/);
});

test("a push that deletes the default branch is refused as a deletion", () => {
  for (const line of ["git push origin :main", "git push origin --delete main", "git push -d origin main"]) {
    assert.match(refused(line), /delete the default branch `main`/);
  }
});

/**
 * A path as a Bash line writes it: with forward slashes, and on Windows `C:\x` as Git Bash's `/c/x`.
 * @param {string} dir
 */
const bash = (dir) => dir.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);

/**
 * The guard's reason for a line as the PowerShell tool runs it.
 * @param {string} line
 * @param {string} cwd
 */
const judged = (line, cwd) => judge(line, { cwd, services: pieces, powershell: true });

/**
 * A checkout on the work branch at `dir`, cloned from `onWork`.
 * @param {string} dir
 */
const workClone = (dir) => {
  execFileSync("git", ["clone", "-q", onWork, dir], { stdio: "ignore" });
  return dir;
};
workClone(path.join(onMain, "nested"));
const wild = workClone(path.join(onMain, "app[v2]"));
// A folder whose two links lead to the two checkouts: from `linked/main`, `../work` is the work
// checkout as written, and nothing through the real folder of the checkout on `main`.
const linked = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-linked-"));
made.push(linked);
fs.symlinkSync(onMain, path.join(linked, "main"), "junction");
fs.symlinkSync(onWork, path.join(linked, "work"), "junction");

test("judges a push in the folder that the line begins by moving to", () => {
  refused(`cd ${bash(onMain)} && git push`, onWork);
  allowed(`cd ${bash(onWork)} && git push`, onMain);
  allowed(`cd "${bash(onWork)}" && git add . && git commit -m "Add a thing" && git push origin HEAD`, onMain);
  allowed(`pushd ${bash(onWork)} && git push`, onMain);
  allowed(`cd ${bash(onWork)} && git push 2>&1`, onMain);
  allowed(`cd ${bash(onWork)} && git push &>/dev/null`, onMain);
  allowed(`cd ${bash(onWork)} && git push >|/dev/null`, onMain);
  allowed("cd ./nested && git push", onMain);
  // Git Bash may write the session's folder through one of its mounts, so on Windows `..` is not followed.
  if (process.platform === "win32") refused(`cd ../${path.basename(onWork)} && git push`, onMain);
  else allowed(`cd ../${path.basename(onWork)} && git push`, onMain);
});

test("the & or | of a redirection belongs to it, and a redirection may come before the program", () => {
  assert.deepEqual(simpleCommands("git push 2>&1 >&2", { marks: true }), [["git", "push", "2>&1", ">&2"]]);
  assert.deepEqual(simpleCommands("git push &>/dev/null >|log &>> all", { marks: true }), [
    ["git", "push", "&>/dev/null", ">|log", "&>>", "all"],
  ]);
  assert.deepEqual(simpleCommands("a&>x", { marks: true }), [["a", "&>x"]]);
  assert.deepEqual(simpleCommands("echo '>'& git push", { marks: true }), [["echo", ">"], ["&"], ["git", "push"]]);
  assert.deepEqual(simpleCommands("echo \\>& git push", { marks: true }), [["echo", ">"], ["&"], ["git", "push"]]);
  assert.deepEqual(simpleCommands("echo '>'| git push", { marks: true }), [["echo", ">"], ["|"], ["git", "push"]]);
  refused("2>/dev/null git push origin main");
  refused(">& log git push origin main");
  refused("&>/dev/null git push origin main");
  refused("git push origin main 2>&1");
});

test("a redirection glued to a word begins a word of its own, unless that word is a file descriptor", () => {
  assert.deepEqual(simpleCommands("git push origin main>/dev/null main<x main>>log main2>&1"), [
    ["git", "push", "origin", "main", ">/dev/null", "main", "<x", "main", ">>log", "main2", ">&1"],
  ]);
  assert.deepEqual(simpleCommands('a 2>&1>x 12<y "2">z \\2>w'), [["a", "2>&1", ">x", "12<y", "2", ">z", "2", ">w"]]);
  const braces = 'a {fd}>/dev/null {a[b[0]]}<x "{fd}">y {1x}>z';
  assert.deepEqual(simpleCommands(braces), [
    ["a", "{fd}", ">/dev/null", "{a[b[0]]}", "<x", "{fd}", ">y", "{1x}", ">z"],
  ]);
  assert.deepEqual(simpleCommands(braces, { braces: true }), [
    ["a", "{fd}>/dev/null", "{a[b[0]]}<x", "{fd}>y", "{1x}>z"],
  ]);
  // Bash reads `{fd}` and `{a[0]}` as the variables of new descriptors, and `{1x}` as a word: each line is refused by
  // one of the guard's two readings.
  for (const line of ["git push origin {fd}>/dev/null", "git push origin {a[0]}>/dev/null"]) {
    assert.match(refused(line, onMain), /default branch `main`/);
  }
  for (const line of ["{fd}>/dev/null git push origin main", '{a["k"]}>/dev/null git push origin main']) {
    assert.match(refused(line), /default branch `main`/);
  }
  assert.match(refused("git push {1x}>/dev/null main"), /default branch `main`/);
  // A quoted `{a}>` is a word to Bash, and the reading without braces keeps it one.
  assert.match(refused('git push origin "{a}>" main'), /default branch `main`/);
  allowed("git push origin HEAD {fd}>/dev/null");
  // The program of a later command is read without its redirection, so the line is followed into the work checkout.
  allowed(`cd ${bash(onWork)} && git push origin HEAD && node>log x.mjs`, onMain);
  for (const line of [
    "git push origin main>/dev/null",
    "git push origin main<x",
    "git push origin main>>log",
    "git push origin main 2>/dev/null",
    "git push origin HEAD:main>/dev/null",
    'git push origin "main">/dev/null',
  ]) {
    assert.match(refused(line), /default branch `main`/);
  }
  allowed("git push origin HEAD>/dev/null");
  allowed(`git push origin ${WORK}>/dev/null`);
  allowed("git push origin main2>&1");
  assert.ok(judged('git push origin "main">$null', onWork));
});

test("a line the guard cannot follow for sure is judged in the session's folder", () => {
  const work = bash(onWork);
  for (const line of [
    `cd ${work}; git push`,
    `cd ${work} & git push`,
    `cd ${work} | git push`,
    `cd ${work} || git push`,
    `cd ${bash(path.join(onWork, "missing"))} && git push`,
    "cd - && git push",
    "cd && git push",
    `cd -P ${work} && git push`,
    `pushd -P ${work} && git push`,
    `pushd +1 && git push`,
    `cd ${work} && cd - && git push`,
    `cd ${work} && cd ${bash(onMain)} && git push`,
    `pushd ${work} && popd && git push`,
    `cd ${work} && { cd ${bash(onMain)}; } && git push`,
    `cd ${work} && if true; then cd ${bash(onMain)}; fi && git push`,
    `cd ${work} && source ./back.sh && git push`,
    `cd ${work} && eval "cd ${bash(onMain)}" && git push`,
    `cd ${work} && (cd ${bash(onMain)}) && git push`,
    `cd ${work} && x=\`cd ${bash(onMain)}\` && git push`,
    `(cd ${work} && git push)`,
    `x=$(cd ${work} && pwd); git push`,
    `Set-Location ${work} && git push`,
    `cd -Path ${work} && git push`,
    `cd ${work} && builtin cd ${bash(onMain)} && git push`,
    `cd ${work} && trap "cd ${bash(onMain)}" DEBUG && git push`,
    `cd ${work} && echo done && git push`,
    `env cd ${work} && git push`,
    `X=1 cd ${work} && git push`,
    `sudo cd ${work} && git push`,
    `cd ${bash(script)} && git push`,
    "cd nested && git push",
    `cd ${bash(onWork)} 2>/dev/null && git push`,
  ]) {
    refused(line, onMain);
  }
  refused("cd ../work && git push", path.join(linked, "main"));
});

test("reads a move's path as the tool's shell does, and gives up where the shell could read another folder", () => {
  assert.equal(readPath("/s", "./sub", false, "linux"), "/s/sub");
  assert.equal(readPath("/s/t", "../x", false, "linux"), "/s/x");
  assert.equal(readPath("/s/t", "../..", false, "linux"), "/");
  assert.equal(readPath("/s", "/abs/x", false, "linux"), "/abs/x");
  assert.equal(readPath("D:\\s\\t", "..\\x", true, "win32"), "D:\\s\\x");
  assert.equal(readPath("D:\\s", "/c/src/repo", false, "win32"), "C:\\src\\repo");
  assert.equal(readPath("D:\\s", "/c", false, "win32"), "C:\\");
  assert.equal(readPath("C:\\p", "./q/x", false, "win32"), "C:\\p\\q\\x");
  // A `..` is read only at the start of a relative path: after a named part, a shell that follows
  // links enters it through the link, and one rule holds for `./..` as for every other path.
  /** @type {[string, boolean, string][]} */
  const climbs = [
    ["/a/link/../x", false, "linux"],
    ["./a/../x", false, "linux"],
    ["./..", false, "linux"],
    ["C:\\a\\..\\x", true, "win32"],
  ];
  for (const [where, powershell, platform] of climbs) {
    assert.equal(readPath("/s", where, powershell, platform), null, where);
  }
  // Git Bash resolves `..` before it reads the drive, so `/c/..` is its own root, not `C:\`; and it may write the
  // session's folder through a mount such as `/tmp`, from which `..` climbs elsewhere.
  for (const where of ["/c/../c/x", "..", "../x"]) {
    assert.equal(readPath("C:\\p\\q", where, false, "win32"), null, where);
  }
  // A leading `//` may name a network share.
  assert.equal(readPath("D:\\s", "//c/x", false, "win32"), null);
  assert.equal(readPath("/s", "//x", false, "linux"), null);
  assert.equal(readPath("D:\\s", "C:\\a b\\PROGRA~1", true, "win32"), "C:\\a b\\PROGRA~1");
  assert.equal(readPath("D:\\s", "sub", true, "win32"), "D:\\s\\sub");
  /** @type {[string, boolean, string][]} */
  const unsure = [
    ["sub", false, "linux"],
    [".config", false, "linux"],
    ["sub/x", false, "win32"],
    ["/usr/x", false, "win32"],
    ["/C/x", false, "win32"],
    ["C:/x", false, "win32"],
    ["~/x", false, "linux"],
    ["~", true, "win32"],
    ["$HOME/x", false, "linux"],
    ["$HOME", true, "win32"],
    ["app[v2]", true, "win32"],
    ["a*", true, "win32"],
    ["a?", false, "linux"],
    ["{a,b}", false, "linux"],
    ["C:x", true, "win32"],
    ["Env:", true, "win32"],
    ["C:/x", true, "linux"],
    ["a\\b", true, "linux"],
    ["x.", true, "win32"],
    ["./x ", false, "win32"],
    ["...", false, "linux"],
  ];
  for (const [where, powershell, platform] of unsure) {
    assert.equal(readPath("D:\\s", where, powershell, platform), null, where);
  }
});

test("in PowerShell a backslash belongs to the path, and Set-Location moves as cd does", () => {
  assert.deepEqual(simpleCommands("cd C:\\a\\b; git push", { escapes: false }), [
    ["cd", "C:\\a\\b"],
    ["git", "push"],
  ]);
  assert.deepEqual(simpleCommands("cd C:\\a\\b; git push"), [
    ["cd", "C:ab"],
    ["git", "push"],
  ]);
  assert.equal(judged(`Set-Location ${onWork}; git push`, onMain), null);
  assert.equal(judged(`Set-Location -Path "${onWork}"; git push`, onMain), null);
  assert.equal(judged(`cd ${onWork}; git push`, onMain), null);
  assert.equal(judged(`cd ${onWork}; git push 2>&1`, onMain), null);
  assert.equal(judged("cd nested; git push", onMain), null);
  assert.ok(judged(`sl ${onMain}; git push`, onWork));
  for (const line of [
    `Set-Location -P ${onWork}; git push`,
    `Set-Location ${onWork}; Set-Location -; git push`,
    `Push-Location ${onWork}; Pop-Location; git push`,
    `Set-Location ${onWork}; Invoke-Expression "cd ${onMain}"; git push`,
    `Set-Location ${onWork}; foreach ($x in 1) { cd ${onMain} }; git push`,
    `Set-Location ${onWork}; try { cd ${onMain} } catch {}; git push`,
    `Set-Location ${onWork}; 1 | % { cd ${onMain} }; git push`,
    `Set-Location ${onWork}; $null = cd ${onMain}; git push`,
    `Set-Location ${onWork}; &{cd ${onMain}}; git push`,
    `sudo cd ${onWork}; git push`,
    `X=1 cd ${onWork}; git push`,
    `cd ${script}; git push`,
    `cd ${wild}; git push`,
    "cd -Path app[v2]; git push",
    "cd -LiteralPath app[v2]; git push",
  ]) {
    assert.ok(judged(line, onMain), `let through: ${line}`);
  }
  assert.ok(judged("cd ..\\work; git push", path.join(linked, "main")));
  // Only Bash reads `/c/rest` as the drive C:, so PowerShell's move to it fails.
  if (process.platform === "win32") assert.ok(judged(`cd ${bash(onWork)}; git push`, onMain));
  const passed = hook(call(`Set-Location ${onWork}; git push`, { tool_name: "PowerShell", cwd: onMain }));
  assert.equal(passed.status, 0, passed.stderr);
});

const none = () => false;

test("reads a Git Bash path given to git -C as a drive on Windows, only when the plain path does not exist", () => {
  assert.equal(gitDirectory("D:\\work", "/c/src/repo", "win32", none), "C:\\src\\repo");
  assert.equal(gitDirectory("D:\\work", "/c", "win32", none), "C:\\");
  assert.equal(gitDirectory("D:\\work", "/c/", "win32", none), "C:\\");
  assert.equal(
    gitDirectory("D:\\work", "/c/src/repo", "win32", () => true),
    "D:\\c\\src\\repo",
  );
  assert.equal(gitDirectory("D:\\work", "/cc/repo", "win32", none), "D:\\cc\\repo");
  assert.equal(gitDirectory("D:\\work", "C:/src/repo", "win32", none), "C:\\src\\repo");
  assert.equal(gitDirectory("D:\\work", "repo", "win32", none), "D:\\work\\repo");
  assert.equal(gitDirectory("/srv", "/c/repo", "linux", none), "/c/repo");
  assert.equal(gitDirectory("/srv", "repo", "linux", none), "/srv/repo");
});

test(
  "on Windows, reads the profile and the branch of a repository named by git -C in the Git Bash form",
  { skip: process.platform !== "win32" },
  () => {
    assert.match(refused(`git -C ${bash(onMain)} push`), /default branch `main`/);
    const dir = repository(WORK, "default-branch: trunk\n");
    assert.match(refused(`git -C ${bash(dir)} push origin trunk`), /default branch `trunk`/);
  },
);

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
