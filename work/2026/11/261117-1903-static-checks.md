---
id: 261117-1903
title: Static checks for the kit, and a default for projects
project: honsha
type: change
size: full
state: awaiting-approval
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: null
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

## Log

- 2026-11-17: measurements taken on copies of the kit and the home, with the three tools installed in a scratch
  folder outside both repositories; results under "Facts it rests on". The strategy is written and the item waits
  for approval.

## Verification

## Outcome
