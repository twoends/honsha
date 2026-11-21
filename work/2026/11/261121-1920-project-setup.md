---
id: 261121-1920
title: Prepare a project's fresh checkout before its checks, in a worktree and in the pipeline
project: honsha
type: change
size: full
kind: fix
state: awaiting-approval
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: null
model: null
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

## Log

## Verification

## Outcome
