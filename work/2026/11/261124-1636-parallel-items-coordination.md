---
id: 261124-1636
title: Let the hub coordinate items that run at once in a project, and let two share a file whose changes lie apart
project: honsha
type: change
size: full
kind: flow
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, to move into the kit what an installation does for
itself but holds for every installation, and on 2026-11-25 to start this part of it.

On a day when about a dozen items of one project using the kit ran at once, the hub did two things that no rule of the
kit says:

- Every brief listed the other items running in the project and the files each one changes, and told the worker to
  stop and ask the hub if its work needed one of them. Workers asked, and the hub answered, three times.
- `skills/parallel-parts/SKILL.md` lets two items run at once only when they change no file in common. Three times a
  worker needed a few lines of a file that another item held, far from that item's lines: the hub allowed it, told the
  other item, and had both logs say so; the pull requests merged in either order, the second one brought up to date.

On another day, of five items of the kit ready to start, two waited for the others only because each would change a few
lines of a file another one changed: a section of `docs/01-specs/WORKFLOW.md` far from the others', a sentence of
`agents/hub.md`, or a budget in `hooks/hooks.test.mjs` or `checks/budgets.test.mjs`, which most changes to what a
session receives raise.

Left: the brief's list and where the hub's procedure says it; the test for two items sharing a file (lines far apart,
merging in either order), who decides and what both records say; how a budget that several items raise is shared; what
changes in `skills/parallel-parts/SKILL.md`.

## Scope and acceptance criteria

### In scope

- The test in `skills/parallel-parts/SKILL.md`, which parts of one item and separate items share: two of them may
  change one file where their changes lie apart.
- How separate items run at once in the same skill: when an item is open, who decides that two may run at once, the
  list that the brief of an item gives, what the hub does when it lets two items share a file or refuses, what both
  records say, which item is brought up to date, and how a number that several items raise, such as a budget, is
  shared. The skill's description names the moments that now call for it.
- `agents/hub.md`: the step that invokes the skill before an item starts, and the moments of "Follow" that call for it.
- The reasons, in `docs/01-specs/WORKFLOW.md` ("Parallel work"), and the exception that they make to "Keeping a work
  branch up to date"; the workflow's budget in `checks/budgets.test.mjs`, which that text reaches.

### Out of scope

- The core rules and the worker's procedure. The list and the question to the hub reach a worker through the brief
  that the hub writes, since only an item that a hub starts has other items to be told about; a merge of the default
  branch for a need is already in the core rules (Commits and branches) and in `honsha:branch-update`.
- A script that decides whether two items may share a file. The hub decides before the later item's change exists, so
  no script can read it then; once both changes exist, the pull request shows a conflict as it does today.
- The limits of the skill (`max-workers`, `parallel.max`, `parallel.exclusive`), which stay as they are.
- The files of any installation: none changes for this item.

### Boundaries

- In `agents/hub.md`, only the word that says when the hub invokes the skill before an item starts, and one sentence
  of "Follow". The step that starts an item's session stays as it is: another item of the kit, queued behind this one,
  changes it.
- No part of the core rules changes, so the total that a session receives at start does not change; `agents/hub.md`
  stays within its budget.
- The kit's documents name no hosting service and no feature of a platform through which one session asks another:
  a worker "asks the hub".
- The skill and the hub's file name no project and no installation.

### Acceptance criteria

1. The skill's test lets two parts, or two items, change one file only where their changes lie apart: in different
   sections, paragraphs or functions, with lines that neither changes between them, so that git merges them in either
   order without a conflict, and neither rewords, moves or relies on what the other changes. A file that a tool writes
   whole, such as a lockfile or a generated file, is never shared, and no two change the same schema or configuration.
2. The skill says that an item is open from its start until its pull request is merged or it is dropped; that two open
   items of a project run at the same time when they pass the test against each other, and otherwise the later one
   waits; and that the hub decides, from their records and branches, before it starts the later one and whenever a
   worker asks, the later one waiting in doubt.
3. The skill says that the brief of an item that starts while others are open in the project lists each of them with
   the files it changes, and asks the worker to stop and ask the hub before it changes one of those files or relies on
   another item's change.
4. The skill says that, when the hub lets two items share a file, it tells the other item's worker if that item is
   still running; that the log of each running item names the other item, the file and the part of it that each
   changes; that once one of the two is merged the hub has the other brought up to date (`honsha:branch-update`)
   before its merge; and that an item the hub refuses waits until the other is merged, then merges the default branch
   and goes on.
5. The skill says that a number that limits what items add, such as a budget, is shared although both items change
   its line: each raises it by what its own change needs and says so in its record, and the item brought up to date
   sets it to what the two changes need together.
6. The skill's description names the moments that call for it: before splitting an item, before the hub starts an item
   where another is open, when a worker asks to change a file that another open item changes, and when one of two
   items that share a file is merged.
7. `agents/hub.md` invokes the skill before an item starts in a project where another is open, and in "Follow" when a
   worker asks to change a file that another open item changes and when one of two items that share a file is merged;
   nothing else in the file changes.
8. `docs/01-specs/WORKFLOW.md` gives the reasons in "Parallel work", and "Keeping a work branch up to date" names the
   item that shares a file as its exception; the workflow's budget is raised by this item, with its reason, to what the
   text needs.
9. The profile's `verify` commands pass.

## Strategy

**The intent's open points.**

- **The brief's list, and where the hub's procedure says it.** In the skill, which the hub's procedure already invokes
  at the moment the list is written, before an item starts where another is open: the hub then reads the skill whole,
  and `agents/hub.md` keeps only the moment. The list names every other open item, not only those running, since the
  files of one in review are as much in the way until it is merged. It goes into the brief of the item that starts;
  an item already running hears of a later one only when the hub lets the two share a file, since telling every
  running worker of every new item would interrupt each of them for files that are mostly not yet known.
- **The test for a shared file.** Git merges two changes in either order without a conflict when at least one line
  that neither changes stands between them, and conflicts on adjacent ones (see the log). The test asks for that and
  for no link in meaning: neither change rewords, moves or relies on what the other changes, which git cannot see. A
  paragraph that a formatter wraps again changes all its lines, hence "different paragraphs". A lockfile or a
  generated file is rewritten whole by its tool and is never shared; a schema or a configuration stays never shared,
  as now, since two changes of one can clash in what they mean however far apart their lines are.
- **Who decides, and what both records say.** The hub, the one session that sees every open item: at the start of the
  later item, and whenever a worker asks. In doubt, the later item waits, which is what happens today. The person is
  not asked: deciding what may run at once is already the hub's (`may-start`, the skill), and both records show the
  decision in the pull requests the person reviews. Each running item's log names the other item, the file and the
  part each changes; an item already in review writes nothing for it, since a line of the log is never pushed alone
  (core rules, Delivery), and the other item's log is enough for the person.
- **Which item is brought up to date.** The one merged second, before its merge, even without a conflict: each was
  verified without the other's change, and a budget that both reach can hold either change alone and not the two. The
  core rules already allow it as a need; the hub, which follows both pull requests, asks for it once the first is
  merged. An item refused a file waits, in its worktree, until the other is merged, then merges the default branch and
  goes on: the same as a later item that waits today, but without losing what it has done.
- **A budget that several items raise.** Its line is the one line two items may both change. Each raises it by what
  its own change needs and says so in its record, as a raise always does; the item brought up to date then meets a
  conflict on that line, or a verification that fails, and sets the number to what both changes need together. The
  conflict lies inside its scope, so it is no stop condition. The skill states it for any number that limits what
  items add, since a project other than the kit can hold one too.
- **What changes in the skill.** The test, written once for parts and items, with the shared file; the paragraph on
  separate requests, as above; the description. Parts of one item get the shared file too: the same git merge
  integrates them, their integrated result is verified once, and a second, stricter test for parts would only raise
  the question why. The limits and the steps for parts stay as they are.

**The skill's text.** The test, then the section on separate requests; the rest is unchanged.

```text
Work runs in parallel only when no part needs another part's result, no two parts change the same schema or
configuration, and each part can be verified on its own. Two parts may change one file only where their changes lie
apart: in different sections, paragraphs or functions, with lines that neither changes between them, so that git merges
them in either order without a conflict, and neither rewords, moves or relies on what the other changes. A file that a
tool writes whole, such as a lockfile or a generated file, is never shared. Parts that fail this test run in sequence.

**Separate requests.** Each is its own work item, with its own worker, branch and pull request, open from its start
until its pull request is merged or it is dropped. Two open items of one project run at the same time when they pass
the test against each other; otherwise the later one waits. The hub decides, from their records and branches, before
it starts the later one and whenever a worker asks; in doubt, the later one waits.

- The brief of an item that starts while others are open in the project lists each of them with the files it changes,
  and asks the worker to stop and ask the hub before it changes one of those files or relies on another item's change.
- When the hub lets two items share a file, it tells the other item's worker if that item is still running, and the
  log of each running item names the other item, the file and the part of it that each changes. Once one of them is
  merged, the hub has the other brought up to date (`honsha:branch-update`) before its merge, since each was verified
  without the other's change. An item the hub refuses waits until the other is merged, then merges the default branch
  and goes on.
- A number that limits what items add, such as a budget, is shared although both change its line: each raises it by
  what its own change needs and says so in its record, and the one brought up to date sets it to what the two changes
  need together, which the merge's conflict or its verification shows.
```

The description becomes: "Use before splitting a work item's work into parts that run in parallel; before the hub
starts a work item in a project where another one is open; when a worker asks the hub to change a file that another
open item changes; and when one of two items that share a file is merged. It holds the test that decides whether work
may run in parallel, what the hub tells the workers of items that run at once, the limits on how much may, and how the
parts' worktrees and branches are made and merged back into the item's branch."

**The hub's file.** In "Dispatch", "where another is running" becomes "where another is open". "Follow" gains: "When a
worker asks to change a file that another open item changes, and when one of two items that share a file is merged,
invoke `honsha:parallel-parts`." About 150 characters, within the 503 left of the file's budget.

**The workflow.** "Parallel work" gains a paragraph of reasons:

```text
Items that run at once in one project are coordinated by the hub, the one session that sees them all: a worker sees
only its own item, so its brief names the others and their files, and it asks before it changes one of them. Two items
may share a file whose changes lie apart, since waiting for a whole item costs more than a merge that git makes by
itself. The one merged second is brought up to date first: each was verified without the other's change, and a budget
that both reach can hold either change alone and not the two.
```

"Keeping a work branch up to date" gains: "The exception is an item that shares a file with another, once the other is
merged (workflow, Parallel work)." The workflow has 51 characters left of 38,700, and the two add about 650: its budget
is raised to what the text measures, rounded up to the next hundred. The workflow is where the kit keeps its reasons,
and neither text is a rule that a session applies.

**How each criterion is shown.** Criteria 1 to 8: the diff of the skill, of the hub's file, of the workflow and of the
budget, which the checker reads. Criterion 9: the profile's `verify` on this host, apart from oxlint if this host's
application control stops it, which the pipeline then runs; and the pull request's run.

**Plan.** After the approval, one commit of the work with the record's log; then the verification, the checker, the
push, the pull request, the wait for its checks, and the closing commit. The security review does not apply: the change
touches a skill and documents, none of what `honsha:security-review` names. No part runs in parallel: the skill, the
hub's file and the workflow say the same thing in the same words, a few hundred characters each. The work runs on Opus
at xhigh, as given; it needs no more.

**Assumptions.** A skill's description is what makes a session invoke the skill at a moment its procedure does not
name, and the hub's file names each moment besides. A worker started by the hub can ask it and wait for its answer.

**Risks.**

- A worker that changes a listed file without asking, or two changes that nobody foresaw, meet in a pull request's
  conflict, resolved as today (`honsha:branch-update`), or a stop when it cannot be resolved inside the scope.
- A link in meaning between two changes that lie apart, which git does not see: the item brought up to date runs its
  verification again, and the person reviews both pull requests, whose records name the shared file.
- The measure counts four existing files for a kind that expects three: the skill, the hub's file, the workflow and its
  budget. The measure only reports it.
- Choices to approve with the strategy: the shared file holds for parts of one item too; the hub decides, not the
  person, and in doubt the later item waits; the item merged second is always brought up to date, even without a
  conflict; and the list goes only into the brief of the item that starts.

## Approval

Approved by the person on 2026-11-25, in the hub's session, as written, with its four choices: the shared file holds
for parts of one item too; the hub decides, and in doubt the later item waits; the item merged second is always brought
up to date; and the list goes only into the brief of the item that starts. The hub passed the approval on to this
item's session, where the person confirmed it the same day.

## Log

- The branch was cut from `origin/main` after `git fetch`, and its upstream unset, so that no push can follow
  `origin/main` by default.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts` passed.
- Read `skills/parallel-parts/SKILL.md`, `skills/branch-update/SKILL.md`, `agents/hub.md`, `agents/worker.md`,
  `rules/git.md`, the workflow's sections on where the rules are, the procedure, parallel work, commits and branches,
  and the architecture's dispatch, whose sentence on separate requests that run at the same time stays true.
- Measured the budgets: `agents/hub.md` has 5,497 characters of 6,000; the skill 2,298 of 6,000;
  `docs/01-specs/WORKFLOW.md` 38,649 of 38,700. `hooks/hooks.test.mjs` and `checks/budgets.test.mjs` pass.
- In a scratch repository, two branches that changed lines 2 and 4 of a five-line file merged without a conflict; two
  that changed lines 2 and 3 conflicted.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The person approved the strategy (Approval); the state is `in-progress`.
- The skill's test, its section on separate requests and its description are written as the strategy gives them; the
  skill has 4,041 characters of 6,000.
- `agents/hub.md`: "running" became "open" in "Dispatch", and "Follow" gained its sentence; the file has 5,651 characters
  of 6,000, and the step that starts an item's session is unchanged.
- The workflow gained the paragraph of reasons in "Parallel work" and the exception in "Keeping a work branch up to
  date". The sentence before the reasons, which says when the hub invokes the skill, said "where another runs": it now
  says "where another is open", the word of the hub's file and the skill. The workflow has 39,293 characters, and its
  budget is raised from 38,700 to 39,300.
- No other document says when the skill applies: the README and the interface only name it, and the architecture's
  dispatch stays true.

## Verification

## Outcome
