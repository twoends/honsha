---
id: 261118-2128
title: Run the home as a project like any other, with no direct commits
project: honsha
type: change
size: full
kind: flow
state: in-progress
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-2039
pr: null
model: null
effort: high
checks: []
---

## Intent

The person asked why the home is not a project managed like the others: the criteria by which certain things
became code in the kit should apply to the home in the same way, so all the checks, the tests and the rest should
run there too. Given a choice between two ways of running the home as a project, the person chose A: every change to
the home goes through a work item and a pull request, the writes the system makes included. B would have taken
through pull requests only the changes the person decides, and committed the files written by code directly. Asked
on 2026-11-18.

## Scope and acceptance criteria

### In scope

- The kit's specifications: the home is a project like any other; every change to it, a report or a move in the
  registry included, is a work item that arrives as a pull request of the home.
- The end of direct commits: the profile's `direct-commits`, the guard's exception for it, their tests and the text
  that describes them.
- The record check: a report item needs its pull request at `done`, as a change does.
- `hub/projects.mjs`: each command that changes the registry does it as a work item of the home, made by code.
- A check of the registry that a project's verification can run.

### Out of scope

- The home's own adoption: its profile, its declared plugin, its decisions and its hub instructions. They follow
  this item, through the procedure of section 20: the home is added and assessed like any project.
- Opening pull requests from code: that depends on the hosting service, and is decided with the interface.
- Records already merged, in the kit or the home: they stay as they are.

### Boundaries

- No rule changes for projects: what holds for a project now holds for the home too, and nothing more.
- The scripts never push and never open a pull request; they commit only on a work branch they create.
- Nothing about this installation enters the kit.

### Acceptance criteria

1. The workflow and the architecture no longer describe the home as a repository with direct commits: the home is a
   project, a report is a work item whose record and answer arrive in a pull request of the home, and the hub
   changes the home only through work items.
2. `direct-commits` is gone from the profile's reader, the guard, their tests and the specifications; a profile that
   still holds it is refused with a line that says the key no longer exists.
3. `checks/record.mjs` asks a report item at `done` for its pull request, like a change; its tests say so.
4. `hub/projects.mjs`:
   - `add` creates the work branch of the assessment in the home, writes the registry's entry and the assessment's
     record there, and commits both with the trailer;
   - `choose` and `refresh` each create a work branch with a trivial record of the move, written by the script, and
     commit the registry's change with it;
   - none of them pushes; each prints the branch and the next step;
   - `check` reads the registry and fails on an entry it cannot read or whose assessment's record is missing.
5. The worker runs `hub/projects.mjs check` with the kit's other checks in a repository that has a `registry.yml`.
6. Tests for every change above; the kit's `verify` list passes.

## Strategy

### Facts it rests on

- `direct-commits` exists only for the home: the profile's reader, the guard (`hooks/guard.mjs`), their tests, the
  workflow (sections 9, 14.3), the architecture (3.2). The workflow's section 3.1 says a report has no pull request,
  and `checks/record.mjs` accepts a report at `done` without one.
- `hub/projects.mjs` writes `registry.yml` and the assessment's record in the working tree of the home and commits
  nothing.
- The home's repository already has the kit's settings: merge commits only, branches deleted after a merge.

### Design

- **One rule for every repository.** The home is a project. What made it different, a hub that writes it often, is
  a matter of how many pull requests the person merges, not of a different rule; when they become too many, code
  opens them, which is decided with the interface.
- **A report is a work item of the home.** Its record lives on a branch of the home and arrives with its answer in a
  pull request; the review of an assessment is the review of that pull request.
- **Moves in the registry are work items made by code.** `add` makes the assessment's branch, record and entry in one
  commit, so the assessment's pull request carries the entry: merging it registers the project as `assessing`.
  `choose` and `refresh` make a trivial item each, with `requested-by: person` for `choose` and `check` for
  `refresh`, the command as its intent and the registry's change as its work. The trivial record is complete when
  committed: verification and outcome are written by the script, from the check it ran.
- **Moves take effect when merged.** A state is the one on the home's default branch; `may-start` reads it there.
- **`check`** is the registry's check for a verification: the shape the reader accepts, a report for each entry's
  assessment, and the states.

### Plan

1. Specifications: workflow sections 1, 3.1, 3.3, 9, 14.3, 20; architecture 3.2.
2. In parallel, in two worktrees: part A, `direct-commits` out of the reader and the guard, with their tests, and the
   report's pull request in the record check; part B, `hub/projects.mjs` (branches, commits, `check`) with its tests.
3. The worker's line on the kit's checks, and the kit's own `verify` if it gains a command.
4. The verification, the checker, the pull request.

### Assumptions to confirm while building

- A script can create a branch and commit in the home's clone while the home's working tree is clean; when it is
  not, the script stops and changes nothing.
- `may-start` reading the default branch (`git show origin/<branch>:registry.yml`, after a fetch) works on a clone
  with no remote in the tests, by falling back to the working tree there only.

### Risks

- The home has direct commits on `main` until its own adoption is merged, and nothing will let them through: from
  this item's merge to the home's adoption, a change to the home goes through a pull request, the adoption's own
  items included.
- More pull requests for the person to merge: one per assessment and one per move.

### Measure

Two to three times a full item at the kit's medians: 20 to 60 minutes of agent time, 120,000 to 300,000 output tokens.

### Decisions for the person

1. **Who opens the pull requests of the moves made by code.** Recommended: the script commits on its branch and the
   hub pushes and opens the pull request, with the commands of the hosting service's piece; code that opens them is
   decided with the interface. The alternative is the script calling the service's client itself, which ties the
   hub's code to one service.

## Approval

Approved by the person on 2026-11-18, in the chat of the session that wrote the strategy, with the recommended
decision.

## Log

- 2026-11-18: branch cut from `main` at `13b27b0`, with pull request 23 still open; it touches `hub/projects.mjs`,
  which this item changes too, so step 2 starts after it is merged, or merges it.
- 2026-11-18: pull request 23 merged on `main`; `origin/main` merged into the branch (`55ffe5b`) with the skill
  `honsha:branch-update`, without conflicts. The verification ran again on the merge: every command passed, 113 tests.
- Parts A and B ran in parallel, as the plan says, each in its own worktree on a local branch cut from `55ffe5b`
  (`.a` and `.b`, skill `honsha:parallel-parts`); part A by a subagent, part B by this session. Both were merged into
  the item's branch with `--no-ff` (`c6f535e`, `73a46dd`), then their branches and worktrees were removed. The
  specifications, the worker's line and this record came after, on the item's branch.
- Part A: the profile's reader refuses any profile holding `direct-commits`, whatever its value, with a line saying
  the key no longer exists; the guard has no exception left, and since a refused profile names no branch, the guard
  falls back to `main` and `master` for such a profile; a push that deletes the default branch gets the deletion's
  reason. `checks/record.mjs` asks every `done` item for its `pr`.
- Part B, decided while building, inside the approved design:
  - A move is committed in a temporary worktree of the home, from its default branch (`origin/HEAD` after a fetch;
    `main` or `master` where the home has no origin, as in the tests), on a branch made with `--no-track`, so that a
    plain push can never reach the default branch. The home's working tree and branch are never touched, so the first
    assumption is not needed: a dirty home does not stop a move, and a test shows that it stays as it was. The second
    holds, with the local default branch rather than the working tree where there is no remote.
  - A report's record goes where every record goes, `work/<yyyy>/<mm>/`, since the home is a project and the kit's
    record check reads only there. Reports merged before stay in `reports/`, which the script still reads, and which
    the home's adoption is to list under `legacy`. The architecture's layout of the home loses `reports/` for `work/`.
  - `add` without `--assessment` makes the assessment's branch `work/<id>-<name>-assessment`; with it, a trivial item
    `work/<id>-add-<name>`, since the assessment is already merged. `choose` and `refresh` make `work/<id>-choose-<name>`
    and `work/<id>-refresh`; `refresh` makes none when nothing moved.
  - The trivial record is committed `in-progress`, with its intent (the command), verification and outcome: `pr`,
    `model` and `done` are known only once the hub has opened the pull request, so its closing commit writes them, as
    for any trivial item. Its `project` is the `name` of the home's profile on the default branch, or the folder's
    name; its kind is `upkeep`, one of the default kinds.
  - Every move runs the registry's check on what the branch would hold before committing, and commits nothing when it
    fails. An identifier already used by a branch or a record makes the move wait a minute.
  - `check` also refuses a name written twice and a project past `assessing` whose assessment is not done.
- Specifications: workflow sections 1, 3.1, 3.3, 8 (lessons of the home enter through its work items), 9, 14.3 and
  20; architecture 3.2. `agents/worker.md` runs `hub/projects.mjs check` where the root holds a `registry.yml`. The
  kit's own `verify` gains nothing: its tests already cover `hub/`.
