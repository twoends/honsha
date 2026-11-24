---
id: 261123-1950
title: Say who writes the report of a deferred check, the hub or a worker of the home
project: honsha
type: change
size: full
kind: rule
state: done
areas: []
created: 2026-11-23
updated: 2026-11-24
requested-by: person
source: null
pr: 50
model: claude-opus-5-5
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

Form B approved by the person on 2026-11-24, in the hub's session, with the strategy as written in `18d1ee8`, relayed
to this session by the hub.

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
- The approval is written and the state set to `in-progress`.
- `agents/hub.md`, "Deferred checks": the hub dispatches a due check as an item of the home, and a worker of the home
  writes the report in the session the hub starts in a worktree of the home, on the report's own branch. "What the hub
  never does": the rule that the hub edits no project's files itself names the writes it makes to a repository itself,
  those of "Add a project": the pushes of the branches that `hub/projects.mjs` commits, and the closing commits of the
  trivial records the script writes. The pushes are named because the third criterion asks for every write to a
  repository; the pull requests the hub opens change no file. The file holds 5,166 characters, budget 6,000.
- `docs/01-specs/WORKFLOW.md`, "Deferred checks": the sentence on the outcome points to `agents/hub.md` for who writes
  the report and where. The scheduler's sentence stays.
- Found and left, outside the scope: both documents say that a failed check becomes a new work item, and neither says
  who creates it.
- The first check, of `65c9082`, failed on one finding: the list of the hub's own writes left out the deletion of a
  merged branch, which the core rules (Delivery) ask of every session, the hub included. The list now names it and
  points to the core rules for the rule itself. The strategy's facts leave that write out too; the strategy stays as
  it was approved.

## Verification

On this host, at `4e1bef5` with the record as it stands, with npm 12.2.1:

- `node checks/record.mjs`, in the kit directory and in the worktree: passed, the record has the shape the rules ask
  for.
- `node checks/commits.mjs`, in the kit directory and in the worktree: passed, the 4 commits of the branch follow the
  rules.
- `node hub/projects.mjs check`: not run, the root holds no `registry.yml`.
- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed, no findings, with oxlint 1.94.0.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 196 tests, 196 pass.
- `claude plugin validate .`: passed, with warnings on the plugin's version, licence and icon and advice on the README's
  install line, none of which this change touches.

The first check, of `65c9082` (full): verdict `fail`. Findings: 1. `agents/hub.md:55-57` gives a closed list of the
hub's own writes to a repository and leaves out the deletion of a merged branch, which `rules/git.md:28` asks of every
session, the hub included; the strategy's facts leave it out too. Name the deletion in the list, or limit the sentence
to the writes beyond those the core rules ask of every session.

The second check, of `4e1bef5` (since `65c9082`), with the record as it stands:

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. `agents/hub.md` says who writes the report of a due deferred check, and in which worktree and branch, as the
   approved form B: met, `agents/hub.md:47-50` (a worker of the home, in the session the hub starts in a worktree of
   the home, on the report's own branch).
2. The rule is stated in one place, and other documents point there: met, `docs/01-specs/WORKFLOW.md:207-208` points
   to `agents/hub.md`, Deferred checks. `skills/review/SKILL.md:24` and `docs/01-specs/ARCHITECTURE.md:143` do not say
   who writes the report.
3. `agents/hub.md` names every write the hub makes to a repository itself, in one place: met, `agents/hub.md:55-58`.
   The list now includes the deletion of a merged branch and points to the core rules (Delivery) for that rule, which
   is `rules/git.md:28`.

- **Intent:** in order. No words of the person are quoted in the diff or the record, so `public: true` is respected.
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting (prettier), lint (oxlint), types (tsc) and tests (`node --test`)
- **Record:** in order
- **Commits:** in order

Last report's finding: the list of the hub's own writes left out the deletion of a merged branch. This is fixed in
`agents/hub.md:57-58` by commit 4e1bef5, "Name the deletion of a merged branch among the hub's own writes, as the
checker asked". The approved strategy's facts still leave this write out. The log at lines 153-156 of the record states
this and keeps the strategy as it was approved. That is not a change to the scope or the criteria.

**Findings**

none

**Not verified**

none

## Outcome

The hub dispatches a deferred check that is due as an item of the home, and a worker of the home writes its report in
a worktree of the home, on the report's own branch; the hub's procedure says so under "Deferred checks", and the
workflow points there. "What the hub never does" names, in one place, every write the hub makes to a repository itself.
No deferred check.
