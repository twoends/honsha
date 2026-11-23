---
id: 261123-2056
title: Install the kit's development tools with npm 12 and its install defences, and take oxlint 1.94.0
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-23
updated: 2026-11-23
requested-by: person
source: null
pr: null
model: null
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
- Prettier, TypeScript and `＠types/node`, which both projects already hold at the same versions.
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

## Approval

## Log

## Verification

## Outcome
