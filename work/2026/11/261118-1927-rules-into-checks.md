---
id: 261118-1927
title: Move mechanical rules into scripts and situational procedures into skills
project: honsha
type: change
size: full
kind: upkeep
state: done
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-1913
pr: 21
model: claude-opus-5-5
effort: high
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

## Approval

Approved by the person on 2026-11-18, in the chat of the session that wrote the strategy.

## Log

- 2026-11-18: branch cut from `main` at `c23bb4b`, before pull request 20 is merged. Facts on the platform read in
  Claude Code's documentation by a subagent on Sonnet. The work runs in a new session, where the kit's plugin is
  active, so that its agents and hooks are those of the clone.
- Pull request 20 had been merged at 19:25 UTC, before the branch was cut; the local `main` had not fetched it.
  Step 1 of the plan merges it.
- Step 1: `origin/main` merged into the branch with the trailer, no conflict; `node checks/verify.mjs` passed all six
  commands on the merge commit.
- Step 2 ran in two parts in parallel, each in its own worktree on a local branch cut from the merge commit:
  `.scripts` (part A, by this session) and `.skills` (part B, by a subagent on Opus). Each made one commit; both were
  merged into the item's branch with the trailer, and their branches and worktrees removed.
- Part A: `checks/record.mjs` reads what each size keeps from the template's comments, without changing their
  wording, so the third assumption holds. The kit's records written since the template has `kind` (from
  `261118-1103`) are its passing cases; the ten older ones lack `kind`, which the template did not have then.
  `checks/commits.mjs` reads the size from the record at the branch's tip and, for a full item, the files of every
  commit up to the first whose record holds an approval, skipping merges.
- Part B moved, word for word, the worker's split into parts to `skills/parallel-parts/SKILL.md`, and the section
  "When the default branch moves", with the rule that the default branch is merged only into the item's branch, to
  `skills/branch-update/SKILL.md`. The worker keeps one line for each.
- Step 3: a `SubagentStart` hook needs JSON output to add context, by the hooks documentation read by a subagent on
  Sonnet; `hooks/checker-rules.mjs` prints the core rules and the template as a session receives them, 8,815
  characters here.
- Where each check that left `agents/checker.md` went:
  - "you do not receive the core rules": replaced; the hook gives them, with the template.
  - Comments (why not what, no history, no code commented out, a TODO's identifier): core rules, Comments.
  - Documents (nothing beside what replaced it, the entry that deletes another, no restated rule, the agent's file
    exception, the documents not checked): core rules, Documents.
  - The record's intent quoted, approval written, `kind`, the sections by size and Deviations only if any:
    `checks/record.mjs`. To take "the log has entries" and the sections present before the verification out of the
    checker, the script also checks, at `in-progress`, that every section the size keeps before Verification is
    written, and flags an optional section left empty.
  - The cases that are always full: core rules, Sizes, with the profile's `always-full` still named.
  - What Verification holds and the last report kept in full: core rules, The record, pointed to.
  - The trailer, the record-only commits up to the approval and `commits.address`: `checks/commits.mjs`, whose result
    the checker now asks to see recorded and passing, with that of `checks/record.mjs`. The profile's gates on commits
    are step 5, Gates.
- Step 4: the worker runs both kit checks from the project's root before the profile's other commands, and the
  record check again on the closing commit, where it checks the `done` state. The kit's profile lists
  `node checks/record.mjs`. Specifications: workflow sections 2, 5, 13.6, 14.2 and 18, architecture 3.1, README.
- Sizes: `agents/checker.md` 4,993 characters, `agents/worker.md` 4,376. The budgets' values are unchanged.
- The second assumption, tried on `1eee829` in a temporary clone, on a throwaway checkout of the branch, with the
  clone's plugin (`--plugin-dir`): asked as `honsha:worker` on Opus to bring the branch up to date, the worker
  invoked `honsha:branch-update` as its first action, then fetched and found nothing to merge. The clone was deleted.
- The check on `1eee829` ran as `honsha:checker`, invoked by a new headless session on Opus started in this folder,
  where the kit's plugin is declared and read from the folder itself. In the checker's own transcript, before its
  first prompt, the platform recorded a `hook_success` for `SubagentStart:honsha:checker` and a
  `hook_additional_context` of 8,815 characters, from "# Honsha core rules" to the template's last comment: the
  whole output of `hooks/checker-rules.mjs`. Its report also names the rules' sections (Comments, Documents) in its
  findings. Verdict `fail`, two findings, both inside the scope.
- Fixes: the comment above the test of the kit's records in `checks/record.test.mjs` gives the reason without
  history; the example of section 12 of the workflow lists the kit's two checks in its Verification.
- The repeated check on `d62096c`, by a new headless session as before, read only what changed since `1eee829`:
  verdict `pass`, both findings fixed, no new one.

## Verification

On `d62096c`, Windows 11, Node.js 26.13.0, Claude Code 2.1.325: `node checks/verify.mjs` passed all seven commands of
the profile — Prettier, oxlint, TypeScript, 107 tests, the plugin validator with its known warnings,
`node checks/record.mjs` ("The record work/2026/11/261118-1927-rules-into-checks.md has the shape the rules ask
for.") and `node checks/commits.mjs` ("The 9 commits of the branch follow the rules."). In the kit the profile's
`verify` list holds the kit's two checks, so they ran once.

### Checker report on `d62096c`, the repeated check

**Verdict:** pass

**Findings of the last report**

1. Comment in `checks/record.test.mjs` mentioning an earlier template: fixed. Lines 119–120 now give the reason ("A script that fails a correct record blocks every item…"), and the filter at line 131 matches it.
2. `docs/01-specs/WORKFLOW.md` section 12 example: fixed. Lines 334–335 now list `node <kit directory>/checks/record.mjs` and `node <kit directory>/checks/commits.mjs`, before `npm run check`. This matches section 5 and the text at lines 458–459.

**Acceptance criteria**

1. `checks/record.mjs` with tests: met in the last check. This diff changes only a comment in its test.
2. `checks/commits.mjs` refuses non-record files up to approval: met in the last check. Not touched by this diff.
3. The worker runs both kit checks, and the kit's profile lists them: met in the last check. `.hub/profile.yml` lines 13–14.
4. `SubagentStart` hook for the checker, with a test: met in the last check. Not touched by this diff.
5. `agents/checker.md` reduced, at most 5,000 characters: met in the last check. Not touched by this diff.
6. Two skills, worker pointers, worker at most 4,500 characters: met in the last check. Not touched by this diff.
7. `WORKFLOW.md` sections 2 and 18: met in the last check. This diff changes only section 12.
8. A real check by the new checker, with evidence the core rules reached it: met. Record log lines 204–209 (the `hook_success` for `SubagentStart:honsha:checker` and 8,815 characters of `hook_additional_context`).
9. The kit's `verify` list passes: met. Recorded in Verification, record lines 215–219, on `d62096c`.

- **Intent:** in order.
- **Scope:** in order. Both code and document changes fix findings of the last report. The record changes are log entries.
- **Comments and documents:** in order.
- **Gates:** in order. The rules name no hosting service; nothing about a user or an installation; no new script.
- **Verification evidence:** in order; covers formatting, lint, types, tests.
- **Record:** in order.
- **Commits:** in order.

**Findings**

none

**Not verified**

- The record has an uncommitted change in the working tree. It removes the blank line that commit `d62096c` left inside the log list, between the entry on the second assumption and the entry on the check. This report reads the working copy. The recorded result of `checks/record.mjs` is for the committed version.

### Checker report on `1eee829`

**Verdict:** fail

**Findings**

1. `checks/record.test.mjs` lines 119–120: the comment mentions an earlier version of the template ("the template
   of their time, which had no `kind`"), which Comments forbids.
2. `docs/01-specs/WORKFLOW.md` section 12, "Example: a small item", no longer matches the procedure: its
   Verification lists only `npm run check`, without the kit's `checks/record.mjs` and `checks/commits.mjs`, which
   section 5, the worker and the checker now require.

## Outcome

The record's shape and the full item's approval gate are checked by scripts that the worker runs in every project,
from the kit directory, before and after the closing commit. The checker receives the core rules and the template
from a hook when it starts, as a real check showed, and its file keeps only the procedure, the report and what
needs judgement: 4,993 characters. The worker's procedures for parallel parts and for a moving default branch are
skills it invokes, which a trial confirmed: 4,376 characters. The workflow says where a new rule goes, and that a
reached budget is answered by such a move.
