---
id: 261124-1635
title: Move into the kit two lessons that a home keeps for itself, on assessments and on the briefs of full items
project: honsha
type: change
size: small
kind: rule
state: done
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: 53
model: claude-sonnet-5-5
effort: high
checks: []
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, to move into the kit what an installation keeps for
itself but holds for every installation, and on 2026-11-25 to start this part of it.

An installation's home keeps in its own lessons file two lessons that hold for every installation, not for that home:

- An assessment proposes, for its project, the files, checks and settings that the kit gives every project, as the kit
  and the home hold them, so that projects of different technologies run alike; a convention of the project stays only
  where its technology needs it, never because the project already had it. It belongs to `skills/assessment/SKILL.md`.
- A brief that starts a full item gives the worker the record to commit together with its strategy, the first of the
  commits that the core rules ask of a full item, never as a commit of its own before it. It belongs to the hub's
  procedure, `agents/hub.md`, under Dispatch.

Left: each lesson's wording in its place, as what holds now and in the document's own style. Not a new capability.

## Acceptance criteria

- `skills/assessment/SKILL.md` states that an assessment proposes the files, checks and settings that the kit gives
  every project, as the kit and the home hold them, and that a convention of the project stays only where its
  technology needs it.
- `agents/hub.md`, under Dispatch, states that the brief of a full item leaves the record to be committed by the worker
  together with its strategy, as the first of its commits, and asks for no commit of the record before it.
- Each statement is one place, in the document's own style, as what holds now, with no history, no quote and nothing
  about a user, a project or an installation; the rest of both files and every other file are unchanged.
- The kit's checks and the profile's `verify` commands pass, and the checker's verdict is `pass`.

## Strategy

Two edits of one passage each. The assessment's lesson is a short section between "What is read" and "The report", since
it governs what the findings propose and not what is read. The hub's lesson is one sentence added to Dispatch, after the
sentence on the worker committing the record, since that is where the brief is described; the rest of Dispatch stays as
it is, because two later items change the same file. No other document states either rule, so no other file changes.

## Log

- Branch cut from `origin/main` after `git fetch`; `node checks/verify.mjs --setup` run once in the worktree: passed.
- No other item's file is needed: `docs/01-specs/WORKFLOW.md` is not changed.
- Wrote "What is proposed" in `skills/assessment/SKILL.md` and one sentence in the Dispatch entry of `agents/hub.md`.
  The record is committed with the work, as the core rules ask of a small item, not before it.
- The first check, on `de54d33`, failed: the record's "Verification" was empty, since I called the checker before
  writing the results. I wrote them, and ran a repeated check.
- The repeated check failed on two points of the record only: a sentence under "Verification" that belongs here, and
  this log's lack of the first check and its fix. I fixed both in the record and ran a second repeated check. No
  change to the work was asked for in either check.
- The second repeated check passed. The kit's `checks/record.mjs` passes on the record as it is in the closing commit.

## Verification

Run from the repository's root on `de54d33`:

- `npx --no-install prettier --check .`: passed, all files match.
- `npx --no-install oxlint`: passed, exit 0.
- `npx --no-install tsc -p .`: passed, exit 0.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: passed, 223 tests, 0 failed.
- `claude plugin validate .`: passed, with one warning about the README's install line, which this change does not touch.
- `node checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node checks/commits.mjs`: passed, the 1 commit of the branch follows the rules.

First check, on `de54d33`: verdict `fail`. Finding: "Verification" held no results when the checker read the record.

Second check, on `de54d33` with the record changed: verdict `fail`. Findings: "Verification" held a sentence that
belongs in the log; the log did not record the first check or its fix.

Last check, on `de54d33` with the record changed, whose diff was the whole change against `origin/main`:

### Checker report

**Verdict:** pass

The findings of the last report, in the record, are all fixed:

- "Verification" now holds only the command results and the two earlier checker reports, each with its verdict and
  findings (work/2026/11/261124-1635-home-lessons-into-kit.md, lines 66-81).
- The log now records the first check, its fix and the repeated check (lines 60-64).

The branch has no new commit since de54d33, so the checks below were applied to the whole diff.

**Acceptance criteria**

1. The assessment proposes what the kit gives every project, as the kit and the home hold it, and keeps a project's
   convention only where its technology needs it: met. See skills/assessment/SKILL.md lines 38-43, the section "What
   is proposed".
2. Under Dispatch, a full item's brief leaves the record to the worker, who commits it with its strategy as the first
   commit, and no commit of the record comes before it: met. See agents/hub.md lines 38-40.
3. Each statement is in one place, in the document's style, says what holds now, with no history, no quote and
   nothing about a user, project or installation, and nothing else changed: met. The diff touches only those two
   passages, and both are written in the present and generic.
4. The kit's checks and the `verify` commands pass, and the checker's verdict is `pass`: met. The record's
   Verification (lines 70-76) lists all seven commands as passed, and this report's verdict is `pass`.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting (prettier), lint (oxlint), types (tsc) and tests (node
  --test)
- **Security review:** not due
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

none

## Outcome

The kit now states both lessons in their places: what an assessment proposes, in `skills/assessment/SKILL.md`, and that a
full item's record is committed by its worker together with its strategy, in the Dispatch entry of `agents/hub.md`. The
checks and `verify` commands pass and the last check's verdict is `pass`. Pull request 53 waits for the person's review
and merge.
