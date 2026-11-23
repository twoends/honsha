---
id: 261123-2056
title: Install the kit's development tools with npm 12 and its install defences, and take oxlint 1.94.0
project: honsha
type: change
size: full
kind: fix
state: done
areas: []
created: 2026-11-23
updated: 2026-11-24
requested-by: person
source: null
pr: 48
model: claude-opus-5-5
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-23 in the hub's session, to start at once the alignment of the tool versions and
of npm's install policy between the kit and another Node.js project of the installation, after a comparison of the
two projects' stacks and the hub's assessment of what each should take from the other.

The kit's rule on dependencies, `skills/dependencies/SKILL.md`, asks for exact versions installed without install
scripts, and for 7 days between a version's release and its adoption. The other project has npm enforce both: it
requires npm 12 through `devEngines`, and its `.npmrc` sets `min-release-age=7`, `strict-allow-scripts=true`,
`allow-git=none` and `allow-remote=none`. The kit's `.npmrc` sets only `ignore-scripts` and `save-exact`, and its
`verify` job installs with the npm that Node.js 26 carries, npm 11, which does not apply those settings: in the kit the
waiting period holds only by hand. The change has the kit's own installs enforce the kit's rule as the other project's
do, and takes oxlint 1.94.0, the version the other project takes in the same alignment.

## Scope and acceptance criteria

### In scope

- `package.json`: `devEngines` asking npm 12 (`>=12 <13`) with `onFail: error`; the runtime as the kit's `engines`
  holds it.
- `.npmrc`: `min-release-age=7`, `strict-allow-scripts=true`, `allow-git=none` and `allow-remote=none`, beside
  `save-exact=true`; `ignore-scripts=true` kept only if npm 12 still needs it.
- `.github/workflows/verify.yml`: the `verify` job installs npm 12.2.2 before the setup on both systems of its matrix,
  the version the `project` job already passes to `project.yml`.
- oxlint from 1.93.0 to 1.94.0 in `package.json` and `package-lock.json`.
- A document of the kit that says how to install the kit's development tools, if there is one: it names npm 12.

### Out of scope

- What the kit asks of projects: `skills/dependencies/SKILL.md`, the assessment, the templates and `project.yml` with
  its inputs.
- Prettier, TypeScript and `@types/node`, which both projects already hold at the same versions.
- The plugin itself, which needs none of the development tools to run.

### Boundaries

- Claude Code, which the `verify` job installs globally, stays an exception to the waiting period (record
  `261117-2034`): if the repository's `.npmrc` reaches that install, its command keeps it out.
- A version is taken only once it is at least 7 days old: oxlint 1.94.0 was released on 2026-11-16, npm 12.2.2 on
  2026-11-04.
- This PC's application control blocks oxlint's native binding: the lint runs in the pipeline, and the record says so.

### Acceptance criteria

1. With npm 11, `npm ci --ignore-scripts` stops on `devEngines`; with npm 12 it passes. Both results are in the log.
2. With npm 12, the repository's settings refuse a version released less than 7 days earlier; the command and its
   result are in the log.
3. On the pull request, the `verify` job is green on Ubuntu and on Windows with npm 12.2.2, and the `personal content`
   and `project` jobs stay green.
4. oxlint is at 1.94.0 in `package.json` and in the lockfile, and the package manager's vulnerability report is in the
   log.
5. The profile's `verify` commands pass.

## Strategy

**The design.**

- `package.json` gains `devEngines`, after `engines`, which stays as it is:

  ```json
  "devEngines": {
    "runtime": { "name": "node", "version": ">=26", "onFail": "error" },
    "packageManager": { "name": "npm", "version": ">=12 <13", "onFail": "error" }
  }
  ```

  npm checks it before `install`, `ci` and `run`, so the profile's setup stops, before it installs anything, under an
  npm other than 12 or a Node.js older than 26.

- `.npmrc` holds `save-exact=true`, `min-release-age=7`, `strict-allow-scripts=true`, `allow-git=none` and
  `allow-remote=none`, and no longer `ignore-scripts=true`. npm 12 does not need it to keep a dependency's install
  script from running: it runs only the scripts that `allowScripts` names, and the kit names none. With
  `strict-allow-scripts=true`, an install that meets a script nobody named fails, where npm 12 alone would skip the
  script with a warning. `ignore-scripts` overrides that setting, as npm's documentation of `strict-allow-scripts` says,
  so keeping it in the file would hide the very case the setting is for: a new version that brings an install script,
  at the `npm install` that takes it. The profile's setup keeps `npm ci --ignore-scripts`, so the install from the
  lockfile still runs no script, as the rule on dependencies asks; today no package in the lockfile has one.
  `allow-git` and `allow-remote` are already `none` by default in npm 12: written in the file, they hold whatever a
  host's own configuration says.

- `verify.yml`, `verify` job: right after `actions/setup-node`, a step installs npm 12.2.2 and prints `npm --version`.
  It runs in bash on both systems, so that a failed install fails the step: PowerShell, the default shell on Windows,
  would report only the exit code of the last command. The step "Install Claude Code, for the plugin validator" gains
  `--allow-scripts=@anthropic-ai/claude-code`, as in `project.yml`: npm 12 otherwise blocks the package's
  `postinstall`, which fetches its native binary, and `claude plugin validate .` stops. The comment on the `project`
  job's `npm: "12.2.2"`, which says that the `verify` job keeps the npm of Node.js 26, says instead that it is the npm
  that `devEngines` asks, the same version as the job above.

- oxlint 1.94.0 is taken with `npm install oxlint@1.94.0` under npm 12 and the new `.npmrc`, so that the waiting
  period itself admits it; `npm audit` runs after it.

- `README.md`: the requirement on the development tools names npm 12, which `package.json` asks, with the command that
  installs it where Node.js carries an older npm. "Checking a change to the kit" stays as it is.

**Found while writing this strategy.**

- npm does not read the repository's `.npmrc` in global mode: from the root, `npm config get ignore-scripts` prints
  `true`, and the same with `--global` prints `false`. So the waiting period does not reach the `verify` job's global
  installs of npm and of Claude Code, and the exception of record `261117-2034` needs nothing in the command. Claude
  Code 2.1.325, the version the job installs, was released on 2026-11-13, more than 7 days ago in any case.
- npm 11 knows some of these settings, depending on its release: 11.12.1 knows `min-release-age` and `allow-git`,
  11.20.0 all four, with `allow-git` and `allow-remote` at `all`. The defaults that refuse are npm 12's; asking npm 12
  in `devEngines` makes the whole set hold whatever npm 11 a host carries.
- The registry today: npm 12.2.2 was released on 2026-11-04 and 12.2.3 on 2026-11-18; oxlint 1.94.0 on 2026-11-16 at
  12:26 UTC, and 1.95.0 on 2026-11-23.

**How each criterion is shown.**

1. npm 11.12.1, already on this host in npm's cache, runs `npm ci --ignore-scripts` in the worktree and must stop on
   `devEngines`; this host's npm 12.2.1 runs it and must pass. The pipeline adds npm 12.2.2 on both systems.
2. With npm 12, `npm install --dry-run oxlint@1.95.0`, released less than 7 days earlier, must be refused. If 1.95.0 is
   7 days old by then, the test takes the newest version of another package that is not.
3. The pipeline's run on the pull request, with `npm --version` printed in each `verify` job.
4. `package.json`, the lockfile, and the output of `npm audit`.
5. The profile's `verify` on this host, apart from oxlint, which this host's application control stops; the pipeline
   runs it.

**Plan.** After the approval, one commit of the work: the five files with the record's log. Then the verification, the
checker, the closing commit and the pull request. No part runs in parallel: the change is a few lines in files that
must agree with each other.

**Assumptions.** `npm install --global npm@12.2.2` replaces the npm of Node.js 26 on `windows-latest` as it does on
`ubuntu-latest`, where `project.yml` already does it. No package that oxlint 1.94.0 brings has an install script, as
none that 1.93.0 brings has; if one has, `strict-allow-scripts` fails the install and the work stops to ask.

**Risks.** The npm update on Windows is the one step that the kit's pipeline has not run yet: if it fails, the
`verify` job on Windows shows it on the first run, and the work stops to ask. A host whose npm is 11 can no longer run
the setup until it installs npm 12: the README says so, and npm's error names the version `devEngines` asks.

**For the person.** The change touches five existing files, one more than the profile's `kinds` expects of a fix:
`package.json` with its lockfile, `.npmrc`, `verify.yml` and the README, all five named by the scope. The measure only
reports it; nothing fails on it.

## Approval

Approved by the person on 2026-11-23, in the hub's session, as written in `6ccfb03`, relayed to this session by the
hub.

## Log

- The record was committed as the hub gave it, then its strategy, at the hub's request: the branch holds three
  record-only commits before the approval, where the core rules expect two, and the measures will read the first two
  as the strategy and the approval.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit, with this host's npm 12.2.1:
  `npm ci --ignore-scripts` passed.
- The out-of-scope line on Prettier, TypeScript and `@types/node` wrote the package's name with a full-width at sign;
  it is written with the plain one, before the approval.
- Read `package.json`, `.npmrc`, the lockfile, `verify.yml`, `project.yml`, the README, the GitHub piece and the rule
  on dependencies. The README is the one document that says how to install the development tools, under
  "Requirements". No other file of the kit names the kit's `.npmrc`, its npm or `devEngines`:
  `services/github/README.md` names `devEngines` only for a project's caller of `project.yml`, out of scope.
- Read npm 12.2.1's documentation of `min-release-age`, `strict-allow-scripts`, `allow-scripts`, `allow-git`,
  `allow-remote`, `ignore-scripts` and `devEngines`, and the release dates of npm, oxlint, Prettier, TypeScript,
  `@types/node` and Claude Code in the registry (Strategy).
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The approval is written and the state set to `in-progress`.
- No part runs in parallel: the change is a few lines in files that must agree.
- `package.json`: `devEngines` with the runtime `node` `>=26` and the package manager `npm` `>=12 <13`, both with
  `onFail: error`; npm wrote the two objects one key per line when it saved the file.
- `.npmrc`: `min-release-age=7`, `strict-allow-scripts=true`, `allow-git=none` and `allow-remote=none` beside
  `save-exact=true`, without `ignore-scripts=true`, with a comment that says why it is absent. From the root,
  `npm config get` reads the five as written and `ignore-scripts` as `false`; with `--global`, `min-release-age` is
  `null`, so the global installs of the pipeline stay outside the file.
- `verify.yml`: the step "Install the npm that package.json asks", in bash, installs npm 12.2.2 and prints
  `npm --version` before the setup. "Install Claude Code, for the plugin validator" runs with
  `--allow-scripts=@anthropic-ai/claude-code`, with the comment that `project.yml` gives the same flag. The comment on
  the `project` job's `npm` says it is the npm that `devEngines` asks.
- `README.md`: "Requirements" names npm 12, which `package.json` asks in `devEngines`, and says that under another npm
  the setup stops before it installs anything.
- `npm install oxlint@1.94.0`, with this host's npm 12.2.1 under the new `.npmrc`: "changed 2 packages", "found 0
  vulnerabilities". The lockfile holds oxlint and its 19 bindings at 1.94.0, no 1.93.0, and no package with an install
  script; its one other change is the range of oxlint's optional peer `oxlint-tsgolint`, which is not installed.
  `npm audit`: "found 0 vulnerabilities".
- Criterion 1: npm 11.12.1, from npm's cache on this host, `npm ci --ignore-scripts`: exit 1, `EBADDEVENGINES`,
  "Invalid semver version ">=12 <13" does not match "11.12.1" for "packageManager"", before it installs anything; it
  also warns that `strict-allow-scripts` and `allow-remote` are unknown project configs. npm 12.2.1,
  `npm ci --ignore-scripts`: exit 0, "added 7 packages", "found 0 vulnerabilities".
- Criterion 2: npm 12.2.1, `npm install --dry-run oxlint@1.95.0`: exit 1, `ETARGET`, "No matching version found for
  oxlint@1.95.0 with a date before 16/11/2026, 22:13:33", the host's local time 7 days before the command.
- The checker read `d1a860b` and failed it on two findings. The first: the README named npm 12 without the command that
  installs it, which the approved strategy promised. The README now gives
  `npm install --global --min-release-age=7 npm@12`, so that the command itself keeps the waiting period of the rule on
  dependencies: with npm 11.12.1 and `--dry-run`, it would change npm 12.2.1 to 12.2.2, and not to 12.2.3, released
  on 2026-11-18. The second finding, the three record-only commits before the approval, cannot be fixed on a branch
  that only grows (next line).
- Stop: the second finding cannot be fixed, inside the scope or outside it. The record and its strategy were committed
  apart, at the hub's request, and no new commit joins them; the measures will read `b336245` as the strategy and
  `6ccfb03` as the approval. The state is `blocked` until the person decides whether to accept it.
- oxlint 1.94.0 runs on this host, which the boundaries did not expect: on a file outside the repository with two
  errors, it reported both and exited with 1. So the lint ran here too (Verification), besides in the pipeline.
- The person accepted the three record-only commits (Deviations); the state is `in-progress` again.
- The second check, of `2bc9a4e`, passed with no findings. The pull request is #48.
- The kit's pipeline on #48, run 45271715560, at `2bc9a4e`: `project` passed, with npm 12.2.2 installed before the
  setup, `npm ci --ignore-scripts` passing under it, Claude Code installed with its script allowed, and all 7
  verification commands passing. `verify` on Linux and on Windows and `personal content` failed in
  `actions/setup-node`, before any step of the kit's own. setup-node v7.1.0 takes the package manager of
  `package.json`'s `devEngines` as the project's, turns its npm cache on, and asks for the cache's folder with
  `npm config get cache`, run by the npm of Node.js 26.13.1, npm 11.20.0. npm checks `devEngines` there too, and stops
  with `EBADDEVENGINES`. `project` passed because its checkouts sit in `project/` and `kit/`, and setup-node found no
  `package.json` at the workspace's root.
- The fix lies in the `actions/setup-node` steps of the `verify` and `personal` jobs, which the approved scope does not
  name: `package-manager-cache: false`, the input that setup-node's own message names, keeps both jobs without an npm
  cache, as they were before `package.json` named a package manager, and setup-node then runs no npm before the job
  installs npm 12. That is a deviation from the scope, so the work stops here: the state is `blocked` until the person
  decides.
- The person approved `package-manager-cache: false` in the two jobs (Deviations); the state is `in-progress` again.
- `verify.yml`: the `actions/setup-node` steps of the `verify` and `personal` jobs take `package-manager-cache: false`,
  each with a comment that says why.
- The third check, of `b830b42`, passed with no findings. Its report is copied without the list of the files it read,
  which named them by absolute path, outside the report's shape. It noted that the record did not support the
  Verification's claim of the same results at `d1a860b` and `2bc9a4e`: Verification now gives only those at
  `b830b42`.
- The kit's pipeline on #48, run 45290838126, at `b830b42`: all four jobs passed. In `verify` on Linux and on Windows,
  setup-node ran with `package-manager-cache: false`, `npm --version` printed 12.2.2, `npm ci --ignore-scripts` passed
  under it, and the 7 verification commands passed, 196 tests among them. `personal content` and `project` passed.
  Criterion 3 is met.

## Verification

On this host, at `b830b42` with the record as it stands, with npm 12.2.1:

- `node checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node checks/commits.mjs`: passed, the 8 commits of the branch follow the rules.
- `node hub/projects.mjs check`: not run, the root holds no `registry.yml`.
- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed, no findings, with oxlint 1.94.0.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 196 tests, 196 pass.
- `claude plugin validate .`: passed, with warnings on the plugin's version, licence and icon and advice on the README's
  install line, none of which this change touches.

The first check, of `d1a860b` (full): verdict `fail`. Findings: 1. `README.md:48-50` names npm 12 but not the command
that installs it where Node.js carries an older npm, which the approved strategy says it would; add the command, or
write in the record why it was left out. 2. The branch has three record-only commits before the approval, `b336245`,
`6ccfb03` and `10bc2e8`, where `rules/git.md` asks for two; `checks/measures.mjs` will count `b336245` as the strategy
and `6ccfb03` as the approval. A branch that only grows cannot correct it; the person decides whether to accept it.

The second check, of `2bc9a4e` (since `d1a860b`): verdict `pass`, no findings.

The third check, of `b830b42` (since `2bc9a4e`), with the record as it stands:

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. npm 11 stops on `devEngines`, npm 12 passes, both in the log: met. `package.json:8-19`, and the record's log at
   lines 194-197 (`EBADDEVENGINES` under 11.12.1, exit 0 under 12.2.1).
2. npm 12 refuses a version released less than 7 days earlier: met. `.npmrc:4`, and the record's log at lines 198-199
   (`ETARGET` on `oxlint@1.95.0`).
3. `verify` is green on Ubuntu and Windows with npm 12.2.2, and `personal content` and `project` stay green: not
   verifiable. Run 45271715560 at `2bc9a4e` failed `verify` on both systems and `personal content` inside
   `actions/setup-node` (record lines 213-220). The fix at `.github/workflows/verify.yml:57` and `:91` has not had a
   pipeline run read yet.
4. oxlint is at 1.94.0 in `package.json` and the lockfile, and the audit is in the log: met. `package.json:22`,
   `package-lock.json:715-717` and its 19 bindings at 1.94.0 with no 1.93.0, and the record's log at line 193.
5. The profile's `verify` commands pass: met, in the record's Verification for `b830b42`.

- **Intent:** in order. The fix keeps the kit's pipeline able to run under the new `devEngines`. The profile has
  `public: true`, and nothing the person said is quoted in the diff, the record or the commit subjects.
- **Scope:** in order. The diff's one change outside the approved scope, `package-manager-cache: false` on the
  `actions/setup-node` steps of the `verify` and `personal` jobs, is recorded under "Deviations" with the person's
  approval (who, when, where). No other workflow runs `actions/setup-node` with the kit's `package.json` at the
  workspace root: `.github/workflows/project.yml:50-66` checks out into `project/` and `kit/`.
- **Comments and documents:** in order. The comments at `.github/workflows/verify.yml:55-56` and `:89-90` say why and
  hold no history. No document describes the setup-node cache of these jobs, and `services/github/README.md:107-188`
  still holds.
- **Gates:** in order. No rule names a hosting service. Nothing in the diff is about a user, a user's project or an
  installation. No script is added. No decision-log entry is cited.
- **Verification evidence:** in order. All seven `verify` commands of `.hub/profile.yml` are listed with results,
  `checks/record.mjs` and `checks/commits.mjs` among them. Covers formatting (`prettier --check .`), lint (`oxlint`),
  types (`tsc -p .`) and tests (`node --test`).
- **Record:** in order
- **Commits:** in order. `7fd85e3` "Stop the item: setup-node reads devEngines and runs npm 11 before the job installs
  npm 12" is a stop commit of its own and holds only the record. `b830b42` "Turn off setup-node's npm cache in the
  verify and personal jobs, as the person approved" is the approved fix. Both carry `Work-Item: 261123-2056`. The
  branch's reflog shows the 8 commits that Verification counts.

**Findings**

none

**Not verified**

- Criterion 3: the pipeline run on `b830b42` has not been read. It is the first proof that setup-node v7.1.0 accepts
  `package-manager-cache: false` and runs no npm before the job installs npm 12. It is also the first run of
  `npm install --global npm@12.2.2` on `windows-latest`.
- Verification says its results were "the same at `d1a860b` and `2bc9a4e`". The record's log places the first oxlint
  run on this host after the stop line that went into `2bc9a4e` (record line 209). So the oxlint result claimed for
  `d1a860b` has no support in the record and cannot be checked from here.

## Deviations

- The branch holds three record-only commits before the approval, where the core rules ask for two: `b336245`, the
  record as the hub gave it, `6ccfb03`, its strategy, and `10bc2e8`, the approval. The cause is the hub's brief, which
  asked for the record to be committed unchanged before the strategy was written. `checks/measures.mjs` reads the
  first two commits of a full item as the strategy and the approval, so for this item it measures the writing of the
  strategy, from `b336245` to `6ccfb03`, as the wait for approval, and counts the real wait, from `6ccfb03` to
  `10bc2e8`, as agent work. Accepted by the person on 2026-11-23, in the hub's session, after the hub explained the
  checker's finding and its cause.
- The `actions/setup-node` steps of the `verify` and `personal` jobs of `verify.yml`, which the scope does not name,
  take `package-manager-cache: false`. With `devEngines` in `package.json`, setup-node v7.1.0 turns its npm cache on and
  runs the npm of Node.js 26, which stops on `devEngines` before the `verify` job installs npm 12, and fails both jobs
  (Log). Approved by the person on 2026-11-24, in the hub's session, relayed to this session by the hub.

## Outcome

The kit's own installs enforce its rule on dependencies. `devEngines` asks npm 12, so the setup stops under another npm
before it installs anything, and `.npmrc` has npm 12 refuse a version released less than 7 days earlier, an install
script that nobody named, and a dependency from git or from a URL. The `verify` job installs npm 12.2.2 before the
setup on Linux and on Windows, and installs Claude Code with its install script allowed; in it and in the `personal`
job, setup-node's npm cache is off, so that no npm runs before npm 12 is installed. oxlint is at 1.94.0. The README
names npm 12 and the command that installs it. The pipeline passes on Linux and on Windows. No deferred check.
