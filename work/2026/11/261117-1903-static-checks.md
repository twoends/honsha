---
id: 261117-1903
title: Static checks for the kit, and a default for projects
project: honsha
type: change
size: full
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: 5
model: claude-opus-5-5
effort: null
checks: []
---

## Intent

The person had asked whether the kit and the home have static checks of code quality, naming SonarQube as an example
that might be too much. The person then asked to settle the question of static checks on the kit and the home first, and
to start the work on the assessment and on the checks for the first project only once that is done. This item is the
kit's part. The home's part is a change to another repository, so it is not in this pull request (see the strategy).
Asked on 2026-11-17, in the chat of a session on the kit.

## Scope and acceptance criteria

### In scope

- Formatting, linting and type checking of the kit's own files, run by the kit's `verify` list, locally and on every
  pull request.
- The changes to the kit's scripts and documents that those checks require.
- A rule for projects: what a project's `verify` list is expected to cover.

### Out of scope

- The home's checks: they land in the home, after this item, as described in the strategy.
- Security scanning, secret scanning, duplication and complexity metrics, and services such as SonarQube: they go
  through the radar.
- The first project's checks: they belong to its assessment, the next item.
- The records under `work/`: they are history and are not reformatted.

### Boundaries

- The plugin needs nothing installed to run. The new packages are for development only.
- Every package is pinned to an exact version, with a lockfile, and installed without running its scripts.

### Acceptance criteria

1. The kit's `verify` list checks formatting, lint and types, and passes on the branch.
2. The pipeline installs the development packages from the lockfile, without running their scripts, and runs the same
   `verify` list on both systems of its matrix.
3. The plugin still works with nothing installed: the hooks' tests pass and `claude plugin validate .` passes, with
   the development packages absent from the plugin's runtime.
4. The records under `work/` are left as they are, and the formatter is told to skip them.
5. The workflow says what a project's `verify` list is expected to cover, and the checker reports it when a list does
   not.
6. The README and the architecture say what the kit needs at runtime and what it needs for development.

## Strategy

### Facts it rests on

Measured on 2026-11-17 on copies of the kit and the home, with the tools installed in a scratch folder:

- **Formatter (Prettier 3.10.1).** In the kit, 14 script and configuration files would change, about 500 lines, the
  same at a width of 100 or 120: mostly quotes and line breaks. Three documents would change, 83 lines, all in tables.
  In the home, 7 documents, 283 lines, also tables. The records under `work/` would change too, and are excluded.
- **Linter (oxlint 1.94.0).** With its default rules, nothing. With the correctness and suspicious groups, two
  findings: a `new` used for its side effect in `checks/profile.mjs`, and a function that could move out of its
  scope in a test.
- **Types (TypeScript 7.0.2, checking the JavaScript files).** 98 errors in strict mode; 70 of them are parameters
  without a declared type. Without that rule, 33 remain: most are values first set to `null` and later to a string,
  and one is a real mismatch, an option `services` that the documented type of a function in `hooks/guard.mjs` does
  not declare.
- **The first project** already runs the same three tools, plus a dead-code finder and its tests, through one
  command. Using the same tools keeps technology lessons shared between the kit and the projects.
- **Node.js versions.** The three tools accept Node.js 22, the lowest version of the pipeline's matrix.

### Design

- **Tools:** Prettier for formatting (scripts, JSON, YAML, Markdown), oxlint for lint, TypeScript for types, checking
  the JavaScript files from type annotations in comments. No change of language: the scripts stay `.mjs`.
- **Configuration:** `package.json` with the three tools as exact development dependencies and the type definitions
  of Node.js; `package-lock.json`; `.prettierrc.json` with a width of 120, the width the kit's documents and scripts
  already use; `.prettierignore` with `work/`; `.oxlintrc.json` with the correctness and suspicious groups;
  `tsconfig.json` in strict mode for the `.mjs` files.
- **Profile:** three new `verify` commands, run through `npx --no-install` so that a missing install fails instead of
  downloading.
- **Pipeline:** `npm ci --ignore-scripts` before `node checks/verify.mjs`.
- **Scripts:** formatted once; type annotations added where strict mode asks for them; the two lint findings and the
  real type mismatch fixed.
- **Rule for projects:** in the workflow's section on the profile, a project's `verify` list covers formatting, lint,
  types where the language has them, and tests, with the tools of its own stack. A project that leaves one out says
  why in its profile. The checker reports a missing one under the gates; it is a finding only if the profile lists
  it as a gate.
- **Runtime unchanged:** no hook or check imports a package. `claude plugin validate .` and the hooks run without
  `node_modules`.

### Plan

1. Add the configuration and install with the lockfile; run each tool once and keep its output in the log.
2. Format the kit's files except `work/`; commit together with the configuration.
3. Fix lint findings and types: annotations, the `null` initial values, the `services` mismatch.
4. Profile, pipeline, README, architecture and the workflow's rule for projects; the checker's gate wording.
5. Verification, the checker, the pull request, the closing commit.

Steps 2 and 3 can be separate commits if the formatting alone is large, so that the review of the fixes is not lost
in whitespace. One worker, in sequence: every step touches files the next one reads.

### The home's part

The home holds only Markdown. After this item is merged, the home gets the same formatter with the same
configuration, a `package.json` with Prettier only, one command `npm run check`, and an ignore list for the discovery
files, which are history. It has no pipeline. It is committed in the home as its other changes are, outside this pull
request.

### Assumptions to confirm while building

- TypeScript 7 checks `.mjs` files from type annotations in comments the way the measurement suggests, with a
  `tsconfig.json`.
- A `package.json` at the root of the plugin does not change how the plugin is validated or installed.
- `npx --no-install` finds the local packages on Windows and Linux.

### Risks

- **Supply chain.** Three packages and their dependencies enter a repository meant to be public. Mitigation: exact
  versions, lockfile, no install scripts, development only.
- **Churn.** About 500 lines of formatting in one pull request. Mitigation: formatting in its own commit.
- **Types in comments.** Annotations make the scripts longer. Mitigation: annotate parameters and exported functions
  only; let the rest be inferred.

### Decisions for the person

1. **Same tools as the first project** (Prettier, oxlint, TypeScript), rather than one tool such as Biome, which does
   not format Markdown. Recommended.
2. **Strict types,** with about 70 annotations, rather than a looser mode that leaves parameters untyped.
   Recommended: the scripts are few and small, and they guard the workflow.
3. **Markdown formatted,** the kit's documents included, `work/` excluded. This reopens part of D71, which deferred
   Markdown formatting. Recommended: the measured change is table alignment only.
4. **Width 120** for the kit and the home, against 100 in the first project. Recommended: the documents are written
   at 120.
5. **The rule for projects** as described: expected coverage, not a required tool. Recommended.
6. **The home's part** as described, outside the workflow and without a pipeline. Recommended.

## Approval

Approved by the person on 2026-11-17, in the chat of the session that wrote the strategy, with the six decisions as
recommended.

## Log

- 2026-11-17: measurements taken on copies of the kit and the home, with the three tools installed in a scratch
  folder outside both repositories; results under "Facts it rests on". The strategy is written and the item waits
  for approval.
- Approved; state set to `in-progress`.
- Configuration added: `package.json` with the four development packages at exact versions, `package-lock.json`,
  `.npmrc` that turns off install scripts and saves exact versions, `.gitignore` for `node_modules/`,
  `.prettierrc.json`, `.prettierignore` with `work/`, `.oxlintrc.json`, `tsconfig.json`. The type definitions of
  Node.js are those of version 22, the lowest the kit supports, so that a script cannot use a later API unnoticed.
- `claude plugin validate .` passes with `package.json` at the root, with the same warnings as before: the
  assumption holds for validation.
- `npx --no-install` found the three tools on Windows.
- Formatted with Prettier: 17 files, 652 lines added and 574 removed, scripts and three documents. The tests still
  pass, 56 of 56. Committed alone with the configuration, so that the fixes are reviewed apart from the whitespace.
- After formatting: oxlint reports the two findings measured before; TypeScript reports 98 errors.
- Two parts ran at the same time, in the same checkout: a subagent fixed types and lint in the scripts under
  `checks/` and `hooks/`, while this session wrote the profile, the pipeline, the README, the architecture, the
  workflow's rule and the checker. The parts touched no common file. The workflow asks for parallel parts in
  worktrees on local branches; that was not used, because a subagent of a session cannot be given a branch name.
  Recorded as a deviation.
- Types: annotations in comments on parameters and exported functions, a `Profile` type for the profile reader, caught
  errors narrowed with `instanceof Error`, and a possibly-null match in `hooks/record-effort.mjs` now checked before
  use, which keeps the earlier behaviour: nothing is written. The `services` mismatch was a gap in the documented
  type of `judge` in `hooks/guard.mjs`, not a bug: the tests use the option to point the guard at invented service
  folders. It is now declared.
- Lint: the profile reader validates `commits.address` by calling `RegExp` without `new`, which throws the same way;
  the test helper `strip` moved to the module's scope.
- Behaviour that changed: a thrown value that is not an `Error` is now printed as text by `checks/commits.mjs` and
  `checks/verify.mjs`, where it printed `undefined`; exit codes are the same.
- Profile: three commands added before the tests, through `npx --no-install`. Pipeline: `npm ci --ignore-scripts`
  before the verification. README and architecture: what the plugin needs at runtime and what a change to the kit
  needs. Workflow, section 9: what a project's `verify` list is expected to cover. Checker: step 6 reports that
  coverage.
- The core rules and the record template together are 8,333 characters, under the 10,000 that a hook can deliver.

## Verification

### Commands

Run on `0753128`, Windows 11, Node.js 26, Claude Code 2.1.325, with `node checks/verify.mjs`:

- `npx --no-install prettier --check .`: passed, "All matched files use Prettier code style!"
- `npx --no-install oxlint`: passed, no findings.
- `npx --no-install tsc -p .`: passed, no errors.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version.
- `node checks/commits.mjs`: passed, "The 4 commits of the branch follow the rules."

With `node_modules` moved out of the repository, for criterion 3: the tests passed, 56 of 56, and
`claude plugin validate .` passed; `npx --no-install oxlint` failed at once instead of downloading.

Not run here: the pipeline on Linux with Node.js 22. It runs on the pull request.

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The `verify` list checks formatting, lint and types, and passes on the branch: met. `.hub/profile.yml:8-10` adds `npx --no-install prettier --check .`, `npx --no-install oxlint` and `npx --no-install tsc -p .`. The working-tree record (Verification) shows all six commands passing on `0753128`. I did not run them again.
2. The pipeline installs from the lockfile without scripts and runs the same list on both systems: met. `.github/workflows/verify.yml:46-47` runs `npm ci --ignore-scripts` before `node checks/verify.mjs` (line 51), in the one job that both matrix entries share (ubuntu with Node 22, windows with Node 26, lines 28-34). The run itself happens on the pull request, so this is not verified here.
3. The plugin works with nothing installed: met on the recorded evidence. Every import under `hooks/`, `checks/` and `services/` is either `node:` or relative; `verify.mjs:20` has only a type import, inside a JSDoc comment. The record says that with `node_modules` moved out, 56 of 56 tests passed and `claude plugin validate .` passed. I did not run this again.
4. Records under `work/` are untouched and the formatter skips them: met. The only `work/` file in the diff is this item's new record. `.prettierignore:2` lists `work/`.
5. The workflow states the expected coverage and the checker reports it: met. `docs/01-specs/WORKFLOW.md:280-283` and `agents/checker.md` step 6, plus the line about the report shape (diff lines 124-126 and 135-136).
6. README and architecture state the runtime and development needs: met. README diff lines 83 and 91-94 (the line before 94 is "The plugin installs no packages."), and lines 102 and 108-111. `ARCHITECTURE.md` diff lines 1119-1121.

**Intent:** The kit's part of settling the question of static checks on the kit and the home is done. The home's part is explicitly out of scope and described under "The home's part", to land after the merge in the other repository. So the intent is fully met only once that follow-up is made.

**Scope:** Every change belongs to the item: the configuration files, the profile, the pipeline, the README, `ARCHITECTURE.md`, the `WORKFLOW.md` rule, the checker wording (plan step 4), the formatting of the scripts and of three documents (decision 3), and the type and lint fixes. No change is outside the scope.

**Comments:** In order. The diff adds only these:
- `.prettierignore:1` says why `work/` is skipped.
- The rest are JSDoc type annotations (`@param`, `@returns`, `@type`, `@typedef Profile`) in `checks/*.mjs`, `hooks/*.mjs` and their tests.

The prose lines inside the reflowed JSDoc blocks keep their earlier text unchanged. There is no history, no code commented out, and no TODO. The YAML step, `package.json` and `tsconfig.json` add no comments.

**Gates:**
- "The rules name no hosting service": met. `rules/` is unchanged, and the added text in `WORKFLOW.md` and `checker.md` names no service.
- "Nothing about a user, a user's project or an installation": met. No names, addresses or user paths are added. The first project is never named. The commits check reports no address, and `public.test.mjs` passed as part of the recorded tests.
- "A script comes with its test": met. No new script is added, and every changed script has its existing test file, also changed.

**Verification evidence:** All six commands appear in the working-tree record as passing, on `0753128` (Windows 11, Node.js 26):
- `prettier --check .`: passed.
- `oxlint`: passed, no findings.
- `tsc -p .`: passed, no errors.
- `node --test …`: 56 passed, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version.
- `node checks/commits.mjs`: passed, 4 commits.

I did not run any of them again. The list covers formatting (Prettier), lint (oxlint), types (TypeScript checking the `.mjs` files) and tests (`node --test`). Nothing is left out.

**Record:** In order:
- The intent restates the request, which matches the earlier records.
- All sections of a full item are present: scope in and out, boundaries, criteria, strategy with plan, assumptions and risks, approval, log, verification, deviations, outcome.
- The approval is written and the log has entries.
- Two deviations are declared: parallel parts in one checkout instead of worktrees (against `WORKFLOW.md:173`), and the work split into two commits.
- The empty Outcome and the unset `pr`, `model` and `state: done` are expected before the closing commit.

One observation, not a finding: the strategy's design says the checker reports missing coverage "under the gates", but the change puts it under "Verification evidence" (checker step 6). This differs from the strategy, not from the scope or the criteria.

**Commits:**
- Trailer: met. All four commits (f8781b9, bb17385, 37ede57, 0753128) carry `Work-Item: 261117-1903`.
- Approval gate: met. f8781b9 "Add the record for static checks of the kit" and bb17385 "Record the approval of the static checks" touch only the record.
- Addresses: met. The author and committer addresses of all four commits match `commits.address`.

**Findings**

none

**Not verified**

- That commit 37ede57 "Add the formatter, linter and type checker, and format the kit" changed only layout. The diff covers the whole branch, and the scripts and the two specs are touched by both 37ede57 and 0753128, so their changes cannot be split by commit. What I could check:
  - `services/github/merge-commands.test.mjs` and `docs/00-vision/VISION.md` are touched only by 37ede57, and they show layout changes only.
  - Every change to the scripts that is more than layout is one the log assigns to the type and lint fixes: `RegExp` without `new`, `instanceof Error`, the null check in `record-effort.mjs`, the `program()` split in `guard.mjs`, `strip` moved, the `?? ""` and `assert.ok` additions in the tests.
- The pipeline on Linux with Node 22, including `npx --no-install` on Linux. The record says this runs on the pull request.
- Installing the plugin with `package.json` at its root. The log confirms the strategy's assumption for validation only, not for installation.
- A small inaccuracy in the record: it says the three tools accept Node.js 22, but oxlint 1.94.0 declares `^20.19.0 || >=22.12.0`. Node 22 releases before 22.12 are outside that range, although the README and `package.json` say Node 22 or later. The pipeline uses the latest 22.x, so it is not affected.

### After the check

- The coverage of the `verify` list is reported under "Verification evidence", not under the gates as the design said: a gate is a project's own rule, and the coverage is about the verification commands. Declared below.
- The development tools need Node.js 22.12 or later, because of oxlint; the plugin itself still runs on any Node.js 22. Left as it is in `package.json` and the README, and written in the outcome.

## Deviations

- Two parts ran in parallel in the same checkout, not in worktrees on local branches as the workflow's section 5.1
  asks: a subagent of a session cannot be given a branch. The parts touched no common file, which the log lists.
  Whether the workflow should allow this for subagents is a question for the person, not changed here.
- The work went into two commits, the configuration with the formatting and then the fixes, as the strategy foresaw.
- The checker reports the coverage of the `verify` list under "Verification evidence", not under the gates as the
  strategy's design said.

## Outcome

The kit checks its own formatting, lint and types on every change, locally and on every pull request, with exact
versions of Prettier, oxlint and TypeScript installed only for development. The scripts are typed in strict mode and
the plugin still runs with nothing installed. The workflow now says what a project's `verify` list is expected to
cover, and the checker reports it.

Known limits: the development tools need Node.js 22.12 or later; installing the plugin with `package.json` at its
root is tried with the first project. The home's part follows in the home. No deferred check.
