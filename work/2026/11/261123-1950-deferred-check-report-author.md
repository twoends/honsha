---
id: 261123-1950
title: Say who writes the report of a deferred check, the hub or a worker of the home
project: honsha
type: change
size: full
kind: rule
state: awaiting-approval
areas: []
created: 2026-11-23
updated: 2026-11-24
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-23 in the hub's session, to keep this gap of the hub's procedure in the home's
backlog, and on 2026-11-24 to start it.

The hub's procedure, `agents/hub.md`, gives two rules that pull apart on a deferred check, and does not say which one
holds. Under "Deferred checks", the hub runs a check that is due as a report of the home that names the item. Under
"What the hub never does", the hub never edits a project's files itself, and the home is a project like any other,
whose items start in a worktree of the home as any project's do. The report is a record of the home, with a branch, a
checker and a pull request. The procedure does not say whether the hub writes it itself, as it already makes the
closing commit of the records that `hub/projects.mjs` writes, or starts a worker of the home with what the check needs.
The workflow's "Deferred checks" says only that the outcome is a report in the home, linked to the item. The change
states who writes that report and where, in one place.

The item was captured as small. It is sized full when it starts, because the rule can take either of two reasonable
forms and the choice between them is the person's, with the strategy.

## Scope and acceptance criteria

### In scope

- `agents/hub.md`: who writes the report of a deferred check that is due, and where.
- `docs/01-specs/WORKFLOW.md`, "Deferred checks", only where it needs the same answer; any other document of the kit
  that states who runs a deferred check, pointed to the one place that states it.

### Out of scope

- The scheduler, and how a check comes due: the periodic review lists the checks past their date until an
  installation has one.
- What a report holds and how its record is shaped.
- `hub/backlog.mjs`, `checks/record.mjs` and their tests.

### Boundaries

- The rule that the hub never edits a project's files itself keeps one stated list of exceptions in `agents/hub.md`.
- If the strategy keeps the report with the hub, the hub's own writes are named in that one list, beside the closing
  commits of the records that `hub/projects.mjs` writes.

### Acceptance criteria

- `agents/hub.md` says who writes the report of a due deferred check, the hub itself or a worker of the home that the
  hub starts, and in which worktree and branch it is written, as the strategy that the person approves chooses.
- The rule is stated in one place; any other document of the kit that needs it points there.
- `agents/hub.md` still names, in one place, every write the hub makes to a repository itself.

## Strategy

**Facts it rests on.**

- The hub's session runs in the home's main working tree, which the kit's scripts leave as it is: they commit in a
  temporary worktree (`hub/home.mjs`). A session in a worktree of the home receives the worker's procedure, the hub's
  does not (`hooks/procedure.mjs`).
- The writes the hub makes to a repository itself are those of "Add a project": it pushes the branches that
  `hub/projects.mjs` commits, opens their pull requests and makes their records' closing commits. "What the hub never
  does" states no exception to the rule that it edits no project's files itself.
- A report of the home is already written by a worker: the assessment runs in a worktree of the home, on the branch
  that `add` makes, and reads another project's repository.
- `agents/hub.md` holds 4,811 characters, against a budget of 6,000.

**Form A: the hub writes the report itself.**

- Where: in a worktree of the home that the hub adds on the report's branch, `work/<id>-<slug>`, cut from the default
  branch as fetched, so that the home's main working tree stays as it is; the hub removes it once the closing commit is
  pushed. It follows the worker's procedure, `agents/worker.md`, which it does not receive and so reads first: the
  kit's checks, the home's `verify`, `honsha:checker`, the pull request and the closing commit.
- Files: `agents/hub.md`, where "Deferred checks" says so, and "What the hub never does" states its one list of
  exceptions: the writes of "Add a project" and the report of a due check. `docs/01-specs/WORKFLOW.md`, "Deferred
  checks": the sentence on the outcome points to `agents/hub.md` for who writes the report and where.
- For: no session to start; a check that is one query to the hosting service is answered at once, by the session that
  already knows the item.
- Against: the hub runs a whole work item, verification and checker included, in its own long-lived context, while the
  person waits on it; the rule that it edits no project's files gains a second exception; its responses on the report
  come from the home's main working tree on the default branch, so the measures attribute them by time window, mixed
  with whatever else the hub does meanwhile, not by the report's branch (workflow, Measures).

**Form B: the hub starts a worker of the home.**

- Where: the hub dispatches a due check as it dispatches any item of the home (Dispatch): the record of a report that
  names the item and its check, written outside the repositories, then `may-start`, then a new session in a worktree
  of the home with the record in its brief. Its worker cuts the report's branch, `work/<id>-<slug>`, and takes it to a
  pull request, as the worker of an assessment does. The hub follows it (Follow).
- Files: `agents/hub.md`, where "Deferred checks" says so, and "What the hub never does" states its one list of
  exceptions, which holds only the writes of "Add a project". `docs/01-specs/WORKFLOW.md`, "Deferred checks": the same
  pointer as in form A.
- For: no new exception; Dispatch, `may-start`, Follow, the worker's procedure and the checker hold as they are; the
  hub's context stays free for the person; checks due together run in parallel within `max-workers`; the measures
  attribute the report by its branch.
- Against: one session per due check, also for a check that is a single query. The decision log, which names the
  models that sessions start with, can give these sessions a lighter one.

**Recommendation: form B.** A due check then becomes one more item that the hub dispatches, the way the assessment,
the other report of the home that reads a project, is already written, and the hub's procedure gains no case of its
own. Form A would make the hub the worker of one kind of item, with a procedure it does not receive and in a context
that must stay free for the person, to save a session that a lighter model makes cheap.

**Plan.** After the approval, one commit of the work: the two files with the record's log. Under either form, "What
the hub never does" gains the list of the hub's own writes, so that the third criterion holds; today they are named
only under "Add a project". The scheduler's sentence and what a report holds stay as they are. Then the verification,
the checker, the pull request and the closing commit. No part runs in parallel: two short passages that must agree.

**Risks.** The item 261123-1954 runs at the same time: if it changes `agents/hub.md` too, this branch merges the
default branch once that item lands (`honsha:branch-update`). `agents/hub.md` grows by a few hundred characters under
either form, within its budget.

## Approval

## Log

- The branch was cut from `origin/main` after `git fetch`. `git config user.email` matches the profile's
  `commits.address`. The item has no areas, so no area pack is loaded.
- `node <kit directory>/checks/verify.mjs --setup` ran once in the worktree before the first commit, with this host's
  npm 12.2.1: `npm ci --ignore-scripts` passed.
- The record was saved as the hub gave it; the hook then wrote `effort`.
- Read `agents/hub.md`; the workflow's key facts, procedure, backlog, deferred checks, measures and joining an
  installation; the architecture's components, home and flows; the interface; `honsha:review`;
  `hooks/procedure.mjs`, `hub/home.mjs` and the opening comment of `hub/projects.mjs`. No other document of the kit
  says who writes a deferred check's report: the architecture's "Scheduled" flow says that every timed run goes through
  the hub and leaves records, and `honsha:review` only lists the checks past their date; both hold under either form.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.

## Verification

## Outcome
