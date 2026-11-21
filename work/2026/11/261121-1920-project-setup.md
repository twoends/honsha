---
id: 261121-1920
title: Prepare a project's fresh checkout before its checks, in a worktree and in the pipeline
project: honsha
type: change
size: full
kind: fix
state: done
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: 43
model: claude-opus-5-5
effort: xhigh
checks: []
---

## Intent

The person asked to start on the two defects that a readiness review found before the first real project joins. This
item is the second. The kit's shared pipeline installs a project's packages only from a lockfile at the project's
root, so a project whose packages live in a subfolder, as the pilot's do, cannot run its checks there. And the
worktree where a worker runs an item starts with no packages installed, so the project's checks, and the git hooks it
installs, fail in it. Asked on 2026-11-21, in the session of the readiness review.

## Scope and acceptance criteria

### In scope

- A profile key, `setup`: the commands that prepare a fresh checkout of the project for its `verify` commands and its
  own git hooks, in the same list form as `verify`.
- The kit's runner, `checks/verify.mjs`, runs that list with `--setup`.
- The worker runs it in the item's worktree before the item's first commit.
- The projects' pipeline, `project.yml`, runs it before `verify`, in place of its install from a root lockfile.
- The kit's own profile and pipeline use it.
- The documents that describe a profile, the runner, the worker's start and the pipeline: the profile's template, the
  interface, the GitHub piece, the workflow, the assessment's skill, the README.

### Out of scope

- Runtimes and package managers other than the Node.js and npm that the pipeline sets up, at versions the pilot
  accepts; another runtime is a later item.
- Caching packages in the pipeline, which saves minutes at scale: a later item.
- The home's own profile: it gains `setup` in a work item of the home, merged before this one (strategy, Order).
- The other defect of the review, how the kit reaches a project's sessions: item `261121-1922`.

### Boundaries

- `verify` stays what the worker, a person and the pipeline all run; `setup` runs once per checkout, not at each
  verification.
- A profile without `setup` installs nothing, in a worktree or in the pipeline.

### Acceptance criteria

1. `checks/profile.mjs` reads `setup` as a list with one command on each line, refuses any other form and an empty
   command, and gives an empty list when the key is absent; with tests. `templates/profile.yml` says what it holds.
2. `node <kit directory>/checks/verify.mjs --setup` runs the profile's `setup` commands in order, stops at the first
   that fails with exit code 1, and says so in a line when there are none, with exit code 0; with tests.
3. `project.yml` runs `node ../kit/checks/verify.mjs --setup` before the kit's checks and `verify`, and no longer runs
   `npm ci` on its own.
4. `agents/worker.md` has the worker run `--setup` in the item's worktree before its first commit there, and write
   that it did in the log; the worker stays within its budget.
5. The kit's profile lists `npm ci --ignore-scripts` under `setup`, and `verify.yml` runs it through `--setup`.
6. The template, the interface (its commands and the profile's keys), the GitHub piece's account of `project.yml`, the
   workflow's section on the profile, the assessment's first step and the README say what holds now.
7. A scratch project whose lockfile is in a subfolder, with a pre-commit hook that needs its packages: in a new
   worktree, `verify.mjs --setup`, a commit and `verify.mjs` pass. The same in a scratch clone of the pilot, with a
   `setup` that installs its packages from their subfolder, and the pilot's own check.
8. On this item's pull request, the job that runs `project.yml` on the kit passes through `--setup`.
9. The profile's `verify` passes.

## Strategy

**Why a key of the profile.** The checks of a project are commands that run anywhere, a person's computer included
(workflow, Checks on pull requests and on the default branch). A fresh checkout needs the same preparation wherever it
is, a worktree on a host or the pipeline's runner, so it belongs beside `verify`, in the one file both read. An input
of the caller's pipeline would serve the pipeline only, and a worker would have to guess.

**Why not inside `verify`.** A worker runs `verify` several times in an item; installing at each run costs minutes,
and a git hook of the project's own, such as a pre-commit hook, needs the packages before the first commit, before
any verification.

**The runner.** `--setup` reads the same profile, runs `setup` through the same function and shell as `verify`, and
prints the same lines. One runner keeps one way to run a project's commands.

**The worker.** In "Before changing anything", after the profile is read: run `--setup` in the worktree where the item
runs, once, before the first commit; write it in the log. A worktree that the hub or the app made starts empty, and a
part's worktree (`honsha:parallel-parts`) is a new checkout too, so the skill says the same for a part.

**The pipeline.** The step that runs `npm ci` where a root lockfile exists gives way to `--setup`. A project whose
packages are at its root lists `npm ci --ignore-scripts` itself; the install is no longer hidden in the pipeline.

**Order.** Removing the pipeline's own install breaks a project that relied on it until its profile names `setup`: the
home does, for Prettier. The home's item adds `setup` first; the current kit ignores a key it does not read, so the
home's checks pass before and after. This item merges once that one has, and its log names the home's pull request.

**Live check.** In the scratchpad: a project whose lockfile is in a subfolder, with a pre-commit hook that runs one of
its packages; then a clone of the pilot, read only, with a profile written in the scratch clone only.

**Measures.** About nine existing files against the four of `fix`: the key reaches every document that describes a
profile and the pipeline.

**Risks.** A `setup` command written for one shell fails in another, as a `verify` command does: the template says that
both run in the machine's default shell. A project's `setup` runs its install scripts unless it says
`--ignore-scripts`, as its own CI does today: the template says so. D87 of the installation allows the item, which
fixes a defect found before the pilot.

**Parallel parts.** None. The default model is enough.

## Approval

Approved by the person on 2026-11-21, in the chat of the session that wrote the strategy. Later the same day, in the
same chat, the person asked for the item's branch to be made again without the details of the pilot that the first
one held; this record states the same strategy in general words.

## Log

- 2026-11-21: the branch is made again from the default branch, at the person's request. The first one held, in its
  record and in a commit's log, details of the pilot and of this computer that the kit's gate keeps out, and a branch
  only grows. The work is the first branch's as its two checks left it, with every finding they made fixed; this
  branch gets a check of its own.
- 2026-11-21: worked in worktrees of the kit's clone, `.claude/worktrees/`. No `--setup` ran before the first commit:
  the kit's packages were found in the clone's `node_modules` above the worktree, which an item's worktree elsewhere
  would not have.
- 2026-11-21: `checks/profile.mjs` reads `setup` through the same code as `verify`, so the two keys accept and refuse
  the same forms, and it refuses for both an indented line that is no item, which would end the list there and skip
  the commands after it in silence. `checks/verify.mjs` takes `--setup` before or after the profile's path.
- 2026-11-21: the template's budget goes from 4,000 to 4,400 characters: it holds every key with what it holds, and it
  was at 3,949 before `setup`, whose comment says when it runs, in which shell, and that an install runs its packages'
  scripts unless told not to.
- 2026-11-21: the worker's step runs `--setup` before the item's first commit in a folder, in "Before changing
  anything", and `honsha:parallel-parts` says the same for a part's worktree.
- 2026-11-21: the pipeline's contract in the workflow names `setup` first, and so does the opening comment of
  `project.yml`. The wiring still installs Node.js, and Claude Code when its caller asks, but none of the project's
  packages itself.
- 2026-11-21: the change reaches 16 existing files, against the strategy's estimate of about nine: the tests of the
  reader and the runner, the two pipelines and the kit's profile count with the documents.
- 2026-11-21: the home's item that adds `setup` to its profile is `261121-2109` of the home, approved by the person
  the same day.
- 2026-11-21: live check (criterion 7), with this worktree's `checks/verify.mjs`:
  - a scratch project in the scratchpad, whose lockfile in a subfolder installs a local package with a command, and
    whose git `pre-commit` hook runs that command. In a new worktree a commit failed, the hook finding no packages;
    `verify.mjs --setup` passed; the commit then passed, and `verify.mjs` passed;
  - a scratch clone of the pilot, in an ignored folder of the kit's clone, with a profile written in the clone only,
    whose `setup` installs the pilot's packages from their subfolder without install scripts, and whose `verify` runs
    the pilot's own check. Setup ran in the clone; then the command that the pilot's own instructions give installed
    its git hooks, since its packages install none. In a new worktree a commit failed, its hook finding no packages;
    `verify.mjs --setup` passed; the commit then passed. `verify.mjs` ran the pilot's check, which failed at its lint:
    this computer refuses to run a program that step needs, in the pilot's own folder too. A matter of the host,
    reported to the person.
- 2026-11-21: in this worktree, after the work's commit, `node checks/verify.mjs --setup`: `npm ci --ignore-scripts`
  passed.
- 2026-11-21: the home's item `261121-2109` is in the home's pull request #18; this item merges after it. That item's
  log reads the home's profile with this branch's reader: `verify` as before, and `setup` as `npm ci --ignore-scripts`.
  The kit's own profile is read by this branch's tests too: neither profile of the installation's two registered
  projects has an indented line that is no item in a list of commands, which the reader now refuses.
- 2026-11-21: the person merged the home's #18 and the kit's #42. The default branch is merged here, as the strategy's
  order asks: two conflicts, each resolved by keeping both sides. In `honsha:parallel-parts`, a part's worktree is
  made with git from the item's branch, as #42 says, and `--setup` runs in it, as this item says. In the README's
  requirements, the setting `home` reads as #42 left it, and the development tools as this item installs them.
- 2026-11-21: on the merge `3af8088`, `node checks/verify.mjs --setup` and then the profile's `verify` ran again:
  passed, with 190 tests. The repeated check of the merge found that this log did not say so; this line does.

## Verification

On `87c8db7`, after the fix of the check on the merge, `node checks/verify.mjs`, which runs the profile's `verify`:
passed.

- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 190 tests, 190
  passed.
- `claude plugin validate .`: passed, with the warning that the manifests carry no version.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: the 6 commits of the branch follow the rules.

On the merge `3af8088` the same commands passed, with 190 tests and 5 commits; before the merge, on `0393398`, with 181
tests and 3 commits.

### Checker report, on `0393398`

**Verdict:** pass

**Findings**

none



### Checker report, repeated, on the merge `3af8088`

**Verdict:** fail

**Findings**

1. The log does not say that the verification ran again after the merge, which `honsha:branch-update` asks for.

### Checker report, repeated, on `87c8db7`

**Verdict:** fail

**Findings**

1. The verification was not repeated after the fix, or its results were not written: "Verification" gave the results
   on the merge `3af8088` only.

### Checker report, repeated, on the record's uncommitted Verification after `87c8db7`

**Verdict:** pass

The finding of the last report is fixed. That report read `87c8db7` and found that the verification had not been
repeated after the fix, or that its results had not been written. "Verification" now gives the run on `87c8db7`
(`work/2026/11/261121-1920-project-setup.md:168-178`): each of the profile's seven `verify` commands with its result,
`checks/record.mjs` and `checks/commits.mjs` among them. The earlier runs on `3af8088` and `0393398` follow at lines
180-181. The recorded 6 commits match the branch's history since the default branch: the strategy, the approval,
`0393398`, the closing commit `9a380bd`, the merge `3af8088` and `87c8db7`. Counting the same way, that is 5 commits at
the merge and 3 at `0393398`, as line 180 says.

**Acceptance criteria**

1. `checks/profile.mjs` reads `setup`, with tests; the template says what it holds: this diff does not touch it. The
   check on `0393398` found it met.
2. `verify.mjs --setup` runs in order, stops at the first failure, and handles an empty list, with tests: this diff
   does not touch it. The check on `0393398` found it met.
3. `project.yml` runs `--setup` before the checks and no longer runs `npm ci`: this diff does not touch it. The check
   on `0393398` found it met.
4. The worker runs `--setup` before its first commit and stays within its budget: this diff does not touch it. The
   check on `0393398` found it met.
5. The kit's profile lists `npm ci --ignore-scripts` under `setup`, and `verify.yml` runs it: met,
   `.hub/profile.yml:16-17`. This diff does not touch it.
6. The documents say what holds now: this diff does not touch it. The check on `0393398` found it met.
7. Live check on a scratch project and on a scratch clone of the pilot: not verifiable. Both lived outside the
   repository. The part of the criterion that is not met as written is declared under "Deviations" (record lines
   268-271). This diff does not touch it.
8. The `project.yml` job on the pull request passes through `--setup`: not verifiable. Pull request #43 is on the
   hosting service, which cannot be read from here.
9. The profile's `verify` passes: met, as recorded on `87c8db7` at record lines 168-178.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Criterion 7: the scratch project and the clone of the pilot were outside the repository.
- Criterion 8: the result of the `project` job on pull request #43 is on the hosting service.
- Which report the delivered record keeps in full. The record now keeps the report on `0393398` in full and the two
  later reports with only their verdict and finding. Once this report is copied, it is the last one, and the rule
  (core rules, The record) leaves the report on `0393398` with only its verdict and findings. That edit comes after
  this check.
- Whether the verdicts and findings kept for the checks on `3af8088` and `87c8db7` match those reports as they were
  returned: the reports themselves are not in the repository.

## Deviations

- Criterion 7, the clone of the pilot: its `setup` installed without install scripts, as the pipeline installs
  (`honsha:dependencies`), with two options that only quiet npm; and its check did not pass, since it fails on this
  computer at a step that the host refuses to run whatever the kit does, in the pilot's own folder too. The check as
  a whole is left to the pilot's own pipeline.
- Criterion 1 is met by a reader that refuses an indented line that is no item for `verify` too: the two keys share
  their reading.

## Outcome

A project's profile names under `setup` what a fresh checkout needs for its checks and its own git hooks, wherever its
packages are. `checks/verify.mjs --setup` runs it: the worker in each new worktree before its first commit, and the
shared pipeline before the kit's checks, in place of its own install from a root lockfile. The kit's own profile and
pipeline use it. Criterion 8 is the `project` job among this pull request's checks. The item merges after the home's
pull request #18 and after the kit's #42.
