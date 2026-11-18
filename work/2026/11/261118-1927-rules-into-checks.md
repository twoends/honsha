---
id: 261118-1927
title: Move mechanical rules into scripts and situational procedures into skills
project: honsha
type: change
size: full
kind: upkeep
state: awaiting-approval
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-1913
pr: null
model: null
effort: null
checks: []
---

## Intent

The person pointed out that this was the second or third time the kit's files were rearranged because they were
reaching their limits, and asked whether the approach itself was wrong. On the proposal that answered it, the person
asked for its strategy to be prepared: rules that a script can check become scripts, and the checker keeps only what
needs judgement; procedures needed only in some situations become skills, loaded when the situation arises; and the
specifications say that a budget reached is answered by moving text into a script or a skill, not by shortening
sentences. Asked on 2026-11-18.

## Scope and acceptance criteria

### In scope

- A script that checks the shape of an item's record, and the commit check extended to the record-only commits of a
  full item.
- The kit's own checks run by the worker from the kit directory, in every project, as part of the verification.
- The core rules delivered to the checker when it starts, so that its file no longer writes them out.
- The checker's file reduced to what needs judgement, and to the checks of what the scripts and the core rules cover.
- The worker's situational procedures moved into skills of the kit, each with a one-line pointer left in the worker.
- The specifications: where a rule goes, and what a reached budget asks for.

### Out of scope

- What any rule requires: sizes, states, commits, records and delivery stay as they are.
- The checks on a project's pull requests in its pipeline while the kit is private: a decision of the person, taken
  with the first project's adoption.
- The core rules' text, except pointers; the limit on what a session receives at start.
- The budgets' values.

### Boundaries

- A rule is not dropped: each check that leaves the checker's file is done by a script, or is read by the checker in
  the core rules it receives. The diff names, for each removed check, where it went.
- No script reads anything outside the repository it checks and the kit directory.

### Acceptance criteria

1. `checks/record.mjs` checks the item's record, the one whose identifier the branch names: the front matter keys and
   their values (`type`, `size`, `state`, `kind` among the profile's kinds or the defaults, the identifier matching
   the branch and the file name); the sections its size keeps and no other; an intent quoted; for a full item past
   approval, the approval written; for state `done`, `pr`, `model` and the outcome written and, for small and full
   items, a checker report whose verdict is `pass`. It has tests and fails with a line per break.
2. `checks/commits.mjs` also refuses, for a full item, a file other than the record in the commits up to and
   including the approval; with a test.
3. The worker runs `node <kit directory>/checks/record.mjs` and `node <kit directory>/checks/commits.mjs` in the
   verification of every item, in any project, and records their results; the kit's own profile lists them too.
4. A `SubagentStart` hook, matched to the checker alone, gives it the core rules; a test checks that the hook names
   the file and that its output stays under the platform's limit for a hook.
5. `agents/checker.md` no longer writes out a rule that the core rules state, nor a check that the scripts make; it
   points to the core rules' sections and asks that the scripts' results be recorded and passing. It is at most
   5,000 characters.
6. The procedures for parallel parts and for a default branch that moves, with the repeated check, are skills of the
   kit, `skills/<name>/SKILL.md`; the worker keeps for each one line that names the skill and when to invoke it. The
   worker is at most 4,500 characters.
7. `WORKFLOW.md`, section 2, says where a new rule goes: a script when a script can check it, a skill when only some
   situations need it, the core rules or an agent's file otherwise; and that a budget reached is answered by such a
   move. The upkeep review, section 18, looks for rules that could move.
8. One real check run by the new checker, in a new session where the kit's plugin is active, is recorded in the log
   with what showed that the core rules reached it.
9. The kit's `verify` list passes.

## Strategy

### Facts it rests on

- From the kit's first version to today, 19 pull requests in two days: the checker grew from 3,630 to 7,584
  characters, the core rules from 4,239 to 6,936, the worker from 4,548 to 5,752. Two items shortened sentences to
  stay within the budgets; the second lost a condition, which its check found.
- The checker writes out what it does not receive: the cases that are always full, the comment rules, the document
  rules, the sections by size. A rule added to the core rules costs twice.
- The checker's step 8 checks the trailer and the addresses, which `checks/commits.mjs` already checks in `verify`.
- Claude Code documents (hooks, sub-agents, skills, read on 2026-11-18): a `SubagentStart` hook, matched on the agent
  type such as `^honsha:checker$`, adds its `additionalContext` to the subagent's context before its first prompt, up
  to 10,000 characters; a plugin's skills live in `skills/<name>/SKILL.md`, are listed by their description and load
  in full when invoked; a subagent reading outside the working directory needs a permission, and reports say a plugin
  subagent may be refused, so the checker gets the rules from the hook, not by reading the kit directory.
- The kit's architecture already plans `skills/` in the kit (section 3.3), with the area packs.

### Design

- **Scripts for the shape.** `checks/record.mjs` reads the record named by the branch, and the profile for the kinds.
  What it checks depends on the state, so that it runs both in the verification, before the closing commit, and
  after it. The sections each size keeps are read from the template's comments, so that they are written once.
- **The kit's checks belong to the procedure, not to the profile.** The worker runs them from the kit directory that
  the session receives at start; Node.js is already needed by the kit's hooks. A project's profile lists only its own
  commands. The kit lists its own scripts in its profile because they are also its tests.
- **The checker receives the rules.** A hook gives it `rules/core.md` when it starts; its file says which section to
  read for each check: Sizes for the cases that are always full, Comments, Documents, The record. What is left in its
  file is the procedure of a check, the report's shape, and the judgement: criteria, intent, scope, comments and
  documents, gates, coverage of `verify`, a record's length and copies, a case that is always full in a smaller item.
- **Skills for situations.** `honsha:parallel-parts` holds section "While working"'s split into parts;
  `honsha:branch-update` holds "When the default branch moves" and the repeated check's commands. Their descriptions
  say when they apply, and the worker names them, so that loading does not rest on the description alone.
- **Where a rule goes,** in section 2 of the workflow: a script when a script can check it; a skill when only some
  situations need it; the core rules when every session needs it; an agent's file for that agent's procedure. A
  budget reached asks for one of these moves.

### Plan

1. After pull request 20 is merged, merge the default branch into this one.
2. In parallel, in two worktrees: part A, `checks/record.mjs` with its tests and the commit check's extension; part
   B, the two skills and the worker's pointers.
3. In sequence, after part A: the checker's hook and its test, and the checker's file.
4. The specifications: workflow sections 2, 5 and 18; architecture where it lists the kit's folders; the README
   where it lists what a session receives.
5. The verification, then the check run as the new checker, in a new session where the plugin is active.

### Assumptions to confirm while building

- The hook reaches the checker when the worker invokes it as `honsha:checker`. If it does not, the item stops: the
  fallback, a skill preloaded through the checker's `skills` field, would keep a second copy of the core rules.
- A worker told by one line to invoke a skill does so. Tried once while building, in a throwaway branch of a
  temporary clone, with the branch-update skill; the result goes into the log.
- The template's comments can be read by a script without changing their wording.

### Risks

- A script that fails a correct record blocks every item: its tests use the records of the kit's merged items as
  cases that pass.
- A skill not invoked when needed: a procedure skipped. The pointer in the worker limits it, and the repeated check's
  commands still show in the record when they ran.
- More existing files than the kind expects: about ten, against six; the measure will show it.

### Open work that touches the same files

Pull request 20 shortens `agents/checker.md` and `agents/worker.md` and corrects the README; this item starts from
it once merged.

### Measure

Two to four times a full item at the kit's medians: 20 to 60 minutes of agent time, 150,000 to 300,000 output tokens.

## Log

- 2026-11-18: branch cut from `main` at `c23bb4b`, before pull request 20 is merged. Facts on the platform read in
  Claude Code's documentation by a subagent on Sonnet. The work runs in a new session, where the kit's plugin is
  active, so that its agents and hooks are those of the clone.
