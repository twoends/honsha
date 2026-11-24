---
id: 261124-1637
title: Let the check of commits accept the work an item committed before it grew from small to full
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-24
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked, on 2026-11-24 in the hub's session, for a review of the decisions taken so far, to find what belonged
in the kit and had not reached it, and the other way round; accepted every proposal of that review, this one among
them; and asked to start it.

The core rules say that work which turns out larger than its size stops, takes the larger size and its gate, and gets a
deviation. Twice in a project using the kit, a small item whose first work commit was already made grew to full.
`checks/commits.mjs` then failed on that commit, which came before the full item's strategy and approval: the person
had to accept the failure as a deviation, and the pipeline stayed red on every later push for a reason that was not the
code.

This item settles how the check reads an item that grew, from the commit that stops it, the deviation and the approval
after it, so that the work committed before the growth passes; and what the rules say a worker commits when its item
grows. Work committed before the approval of an item that was full from its start is still refused.

## Scope and acceptance criteria

### In scope

- `checks/commits.mjs`: the approval gate of a full item read from the size that each commit's record states, the
  deviation that a grown item's work calls for, and the script's opening comment; its tests.
- `checks/measures.mjs`: the times of strategy and approval read at the commits that open and close the same gate; its
  tests. `DEFAULT_KINDS` moves from it to `checks/profile.mjs`, with the imports of `checks/record.mjs`,
  `checks/record.test.mjs` and `hub/projects.test.mjs` (Strategy, The measures).
- `agents/worker.md`: what a worker commits when its item outgrows its size.
- `rules/git.md`: the commits an item keeps when it grows to full.
- `docs/01-specs/WORKFLOW.md`: the reasons, under "Which commits an item makes", and the times of strategy and approval,
  under "Measures".
- The budgets the new text needs: the worker's file and the workflow in `checks/budgets.test.mjs`, the session-start
  total in `hooks/hooks.test.mjs`.

### Out of scope

- An item whose size is lowered: the check looks at the gate, as today, only when the record at the branch's tip says
  full.
- `checks/record.mjs` beyond its import: a grown record has the shape of a full one, which it checks already.
- `agents/checker.md`: its check of commits is the script's, and the core rules it receives say what a grown item keeps.
- `docs/01-specs/INTERFACE.md`: it names the command, whose opening comment says what it checks.
- What a project using the kit changes: nothing. Its pipeline takes the check from the kit's default branch at its next
  run.

### Boundaries

- Not breaking: every history the check accepts today it still accepts. The one it starts to accept is a grown item's,
  whose work came at its smaller size and before a commit of the record alone that makes it full with a deviation.
- The command, its environment variables and the form of its output stay as they are (interface, Commands).
- The rules name no hosting service (gate).

### Acceptance criteria

1. On a work branch whose record at the tip says full, `checks/commits.mjs` reads the record as each commit holds it,
   merges aside. The commits made while it states trivial or small are free. The gate opens at the first commit whose
   record states another size, or has none, and closes with the first commit from there whose record holds the
   approval; every commit in it changes only the record.
2. When a commit before the gate changes a file other than the record, the commit that opens the gate holds a written
   "Deviations"; otherwise the check names that commit and says why.
3. As today, the check names a commit before the approval that changes another file in an item full from its first
   commit; and it names one inside the gate that turns the record back to a smaller size and changes another file.
4. `checks/commits.test.mjs` covers: a grown item that passes; one whose commit that opens the gate also changes another
   file; one with no deviation; an item made full before any work and with no deviation, which passes; an item full from
   its start; a record turned back to small inside the gate.
5. `checks/measures.mjs` reads a full item's strategy and approval at the commits that open and close the gate, with a
   test of a grown item; `checks/measures.mjs`, `checks/record.mjs` and `checks/commits.mjs` import one another in no
   cycle.
6. `agents/worker.md` says what a worker commits when its item outgrows its size, `rules/git.md` that an item which
   grows to full keeps the commits of its smaller size, and the workflow gives the reasons and the measures' reading;
   nothing in the kit contradicts them.
7. A trial: on the branch of a project using the kit whose small item grew to full after its first work commit, the
   check from this branch passes, and the check from the kit's default branch fails on that commit, as the project's
   pipeline does. The log says so without naming the project.
8. The profile's `verify` commands pass, and the kit's pipeline passes on the pull request.

## Strategy

**How the check reads the gate.** Today the check reads the size from the record at the branch's tip and, for a full
item, wants every commit up to the approval to hold only the record. A grown item's history is the record's own: its
first commits carry the record at its smaller size, and a later one gives it the size full. So the check reads each
commit's record, as it already does to find the approval:

- it looks at the gate only when the record at the tip says full, as today;
- merges are set aside, as today: what one brings is the default branch's;
- the commits made while the record states `trivial` or `small` are a smaller item's, and free;
- the gate opens at the first commit whose record states another size, or has no record, so that a commit made before
  its record, or after a full record was turned back to small, is read as today's check reads it;
- it closes with the first commit from its opening whose record holds a written approval; an approval in a record of a
  smaller size, which `checks/record.mjs` refuses anyway, does not close it;
- every commit inside it changes only the record, with today's message.

The deviation the core rules ask of a grown item becomes the condition for its earlier work: when a commit before the
gate changes a file other than the record, the commit that opens the gate holds a written "Deviations", or the check
names it: "the record becomes full here, after work committed at a smaller size, and holds no deviation". A size raised
before any work, as when the person makes an item full before it starts, leaves nothing to explain and passes as today.

The reading is one exported function over the records of the branch's commits, in order, that returns where the gate
opens and closes and whether work came before it; the check and the measures both call it.

On the branch of a project using the kit that waits for this fix, the history is: the work with the record at small; a
stop, the record alone at small; the record alone made full, with its strategy and a deviation; the approval, the
record alone. The gate opens at the third commit and closes at the fourth, and the check passes.

**What a worker commits when its item grows.** `agents/worker.md`, under "While working", after the stop conditions:
work that turns out larger than its size is committed as far as it got, with the record at that size; the larger size,
its deviation and its gate then begin in a commit of the record alone. An approval can take days, and work left
uncommitted lives only in a worktree that may be gone by then; on the branch, the person reads it in the pull request
beside the strategy. A stop is already a commit of its own (core rules, Commits and branches).

`rules/git.md`, after the commits of a full item, one sentence: an item that grows to full keeps the commits of its
smaller size. Without it the core rules say that no file of a full item but its record changes before the approval,
and a checker that reads them would report what the script accepts. `rules/core.md` stays as it is.

**The measures.** `checks/measures.mjs` takes a full item's first two commits as its strategy and its approval; for a
grown item they are its work and its stop, and the wait for approval comes out wrong. It calls the gate's function
instead, reading the record at each of the item's commits, with `%P` added to its log so that it sets merges aside as
the check does. `checks/commits.mjs` imports `checks/record.mjs`, which imports `DEFAULT_KINDS` from
`checks/measures.mjs`: the measures importing the check would close a cycle. `DEFAULT_KINDS` moves to
`checks/profile.mjs`, the module that reads the profile's `kinds`, which every one of them imports already.

**Documents and budgets.**

- The workflow, under "Which commits an item makes": a bullet with the reasons. The commits of a grown item's smaller
  size were right when they were made, and a branch is never rewritten, so they stay; the gate is read from the commit
  that makes the record full, and the deviation written there says why work came before it. Under "Measures": strategy
  and approval are the commits that open and close the gate.
- The opening comments of `checks/commits.mjs` and `checks/measures.mjs` say the same, as the interface asks of a
  check's script.
- Measured in this worktree, a hub's session counts 29,222 characters at start and a worker's 29,044, of the 29,300
  allowed. The sentence in `rules/git.md`, about 70 characters, reaches every session and the checker, so it cannot
  move to a skill; with it, 8 characters are left at the hub's start, less in a longer folder. The total rises to
  29,400. The worker's file, at 5,723 of its 5,800, gains about 220 characters: its budget rises to 6,000, as the hub's,
  and a worker's start stays under the new total. The workflow, at 35,854 of 36,000, gets 36,300.

**Security review.** Due, by this strategy's reading of its rules: the approval gate is the person's permission for a
full item's work to start, and this change widens what the gate accepts. A gate that opens wider than meant is the
fail-open the reviewer looks for, as an item sized small to start without approval and grown afterwards. It runs before
the checker, on the diff without the record, as the skill `honsha:security-review` says.

**How each criterion is shown.** 1 to 4: the tests of `checks/commits.mjs`, and the files, read by the checker. 5: the
tests of `checks/measures.mjs`, and the imports. 6: the files. 7: in that project's checkout, with `HONSHA_BRANCH`,
`HONSHA_BASE` and `HONSHA_HEAD` naming its branch and the two ends of its commits, `node checks/commits.mjs` from this
worktree and from a checkout of the kit's default branch; only the outcome goes into the log. 8: the profile's
`verify` on this host, and the pipeline's run on the pull request.

**Plan.** After the approval, two parts in parallel, if `honsha:parallel-parts` admits them: the scripts with their
tests; the worker's file, the core rules, the workflow and the budgets. They change different files, and each is
verified on its own. Then the trial, the verification, the security review, the checker, the pull request's update and
the closing commit. The work runs on Opus, the default.

**Assumptions.** The project's branch keeps its history until the trial. A grown item's records keep the size key on
one line, as the template writes it and the check reads it today.

**Risks.** An item sized small on purpose, to start its work before an approval, passes the check once a deviation
follows. The core rules allow the growth, and the deviation and the order of the commits are in the record and the
pull request, where the checker and the person read them. Reading the record at each commit costs one `git show` per
commit up to the gate's close: a few per item.

**For the person.**

- The change touches 13 existing files, where the profile's `kinds` expects 4 of a fix: the measure only reports it.
- Choices this strategy makes, each against an alternative:
  1. the gate is read from each commit's record, rather than from a new key of the front matter naming the commit
     where the item grew, which every writer of a record would have to learn and which could disagree with the history;
  2. the check asks for the deviation, in the commit that makes the record full, only where work came before it;
  3. a worker commits its work so far at the smaller size before the stop, rather than leaving it uncommitted while
     the approval waits;
  4. the measures read the same gate in this item, with `DEFAULT_KINDS` moved, rather than in a later one;
  5. the session-start total rises by 100 characters, rather than leaving `rules/git.md` silent on a grown item;
  6. the security review runs on this item.

## Approval

Approved by the person on 2026-11-24, in the hub's session, as written in `ca2db44`, the six choices listed under "For
the person" included, relayed to this session by the hub and confirmed by the person in this session the same day.

## Log

- The record comes from the home's backlog, taken by the hub; its intent is restated as the core rules ask of a public
  project. The branch was created from `origin/main` after `git fetch`.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit, with this host's npm 12.2.1:
  `npm ci --ignore-scripts` passed.
- Read `checks/commits.mjs` and its tests, `checks/record.mjs`, `checks/measures.mjs`, the core rules, the workflow, the
  interface, the worker's and the checker's files, the skill `honsha:security-review` and the tests of budgets and
  hooks. Measured the session-start totals in this worktree with the computation of `hooks/hooks.test.mjs`.
- Read the history of the branch of a project using the kit whose small item grew to full after its first work commit
  (Strategy, How the check reads the gate).
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The pull request is #52, opened with the record alone while it waited for the approval.
- The approval is written and the state set to `in-progress`.
- Two parts ran in parallel, as `honsha:parallel-parts` admits: they change different files, neither needs the
  other's result, and each is verified on its own. The scripts with their tests ran in a worktree of their own on the
  local branch `work/261124-1637-grown-item-commits.scripts`, cut from `ec90a6f`, by a subagent on Opus. The worker's
  file, the core rules, the workflow and the budgets ran in the item's worktree, in this session.
- `agents/worker.md`: under "While working", after the stop conditions, the commits of an item that turns out larger
  than its size. `rules/git.md`: an item that grows to full keeps the commits of its smaller size.
- The workflow: under "Which commits an item makes", a bullet with the reasons; under "Measures", strategy and
  approval are the commits that open and close a full item's gate.
- Budgets: the worker's file 6,000 (it holds 5,925 characters), the workflow 36,300 (36,288), the session-start total
  29,400. Measured in this worktree, a hub's session counts 29,290 characters at start and a worker's 29,312. The
  comment of `checks/budgets.test.mjs` now says that the worker's budget, like the hub's, is what
  `hooks/hooks.test.mjs` counts at a session's start, as that test does. The budget, hook, reference and interface
  tests pass on this part: 31 tests.
- Criterion 7, the first half: on the branch of a project using the kit whose small item grew to full after its first
  work commit, `node checks/commits.mjs` from the kit's default branch, `6719d4b`, with `HONSHA_BRANCH`, `HONSHA_BASE`
  and `HONSHA_HEAD` naming that branch and its four commits, fails on the work commit with "before the approval is
  committed", as that project's pipeline does.
