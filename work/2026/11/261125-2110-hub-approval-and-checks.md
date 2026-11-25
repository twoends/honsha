---
id: 261125-2110
title: Have the person approve a strategy in the worker's session, and the hub read a worker's checks once for it
project: honsha
type: change
size: small
kind: rule
state: done
areas: []
created: 2026-11-25
updated: 2026-11-25
requested-by: person
source: null
pr: 60
model: claude-sonnet-5-5
effort: high
checks: []
---

## Intent

The person asked the hub, on 2026-11-25 in the hub's session, to write down before the day closed the lessons of the
day that lived only in the hub's conversation, so that a new session of the hub starts with all of them. Two of them
hold for every installation and belong to the hub's procedure.

- **An approval is given in the worker's session.** On a day of several full items, the hub relayed the person's
  approval of a strategy to the worker's session by message, quoting the person's words. Twice the worker wrote it and
  went on; once its session's permission checks refused to write an approval that came from another session, and the
  item waited until the person approved again in that session. A relayed approval is not reliable, and the person's
  own words in the worker's session are the plain record of it.
- **The hub reads a worker's checks once, and tells it.** The core rules have a worker wait for the hosting service's
  checks on its work before the closing commit, and no session polls them. Workers that opened a pull request ended
  their turn while a check was still running and asked to be told when it ended; the hub, woken by the worker's stop,
  read the checks once and, when they had ended, told the worker, which then read them once and made its closing
  commit. Nothing in the hub's procedure says that this is the hub's step.

## Acceptance criteria

1. The hub's procedure says that the approval of a full item's strategy, and the acceptance of a deviation, is given
   by the person in the worker's session, and that the hub, when it learns that one waits, tells the person where to
   give it rather than relaying it.
2. The hub's procedure says that when a worker stops waiting for its pull request's checks, the hub reads them once
   and, once they have ended, tells the worker; and that neither polls them.
3. The worker's procedure, where it waits for the checks, agrees with it, pointing to the rule rather than restating
   it.
4. Each change fits its file's budget, or the budget is raised with its reason.
5. The profile's `verify` passes.

## Strategy

The core rules already hold that a worker waits for the checks and that nobody starts them again (Delivery), so they
are left as they are, since every session pays for them at its start. The two rules are stated once, with their
reasons, in the workflow: the approval in the procedure's strategy step, the wait in "Pushes". The hub's procedure
(Follow) gives the hub's own part of each in a sentence that points there, and the worker's procedure agrees where it
asks for an approval and where it waits, in a few words. Both agents' files sit at their budgets: text is replaced
where it can be, and a budget is raised only by what the rest needs, together with the total that a session's start
counts.

## Log

- Ran `node <kit directory>/checks/verify.mjs --setup` in the worktree before the first commit, as the worker's
  procedure asks. The branch was cut from `origin/main` after `git fetch`. No parts ran in parallel.
- The rules are stated in the workflow: the approval, with its reason, in Procedure step 4, and the wait for the
  checks in "Pushes". `agents/hub.md` (Follow) gives the hub's part of each; `agents/worker.md` agrees where it asks
  for an approval (in this session) and where it waits for the checks, pointing to the core rules and to "Pushes".
- Budgets, each raised by what the text needs: the hub's from 6000 to 6400 for the 360 characters of its two new
  sentences, the worker's from 6400 to 6600 for the 131 characters that its two steps gained, which left it under its
  new budget by 70, and the workflow's from 42000 to 42500 for the 577 characters of its two new passages. A session
  that receives the worker's procedure at its start counts it at its budget, so the total in `hooks/hooks.test.mjs`
  is raised from 31550 to 31750 by the same 200 characters.
- The checker, called before the verification was written into the record, failed it on that, and on a conflict that
  the first commit left: `docs/01-specs/ARCHITECTURE.md` still sent approvals through the messaging app and the board,
  which reach the hub, not the worker's session. A commit of its own updates it: the channels' line, the messaging
  row, the board's arrow, step 2 of the flow and the trigger for custom code that named buttons for approvals. The
  specification is part of the change (worker's procedure, While working), so no scope or criterion changes. The
  verification is then run again, and a repeated check reads what changed.
- The profile has no `dynamic-testing`, and the security review is not due: the change is none of the kinds that the
  skill names. The second check's one finding, a sentence in Verification that was neither a result nor a report, was
  moved here; the third check's, clauses in the shortened reports that told what followed each check, was fixed by
  deleting them.
- The checks of pull request 60 all passed on the work: the check of personal content, the project's checks, and the
  verification on Ubuntu and on Windows. The person merged the pull request before this closing commit, so the closing
  is made on a branch of its own cut from the default branch, in a pull request that holds only this record.

## Verification

Run on commit 12dfcd7, from the root of the worktree: `node checks/verify.mjs`, which ran the profile's seven
commands, all passed.

- `npx --no-install prettier --check .`: passed, every file in Prettier style.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: passed, 255 tests of
  255, among them the budgets of the files and the total of a session's start.
- `claude plugin validate .`: passed with the warnings it gives of every run on the kit: no version, no license file,
  no icon and no install line in the README. None comes from the change.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed, the 2 commits of the branch follow the rules.

### Checker report, first check

**Verdict:** fail, on commit 06a0013. Criteria 1 to 3 met. Findings: the verification was empty; and
`docs/01-specs/ARCHITECTURE.md` still sent approvals through the messaging app and the board.

### Checker report, second check

**Verdict:** fail, on commit 12dfcd7, reading what changed since 06a0013. Criteria 1 to 5 met. Finding: a sentence in
Verification that was neither a command's result nor a report.

### Checker report, third check

**Verdict:** fail, on commit 12dfcd7, reading the record alone. Criteria 1 to 5 met. Finding: the shortened reports of the
first two checks held clauses on what followed each check, which the log already says.

### Checker report, fourth check

Read commit 12dfcd7, with the diff and the commit list empty since nothing outside the record had changed.

**Verdict:** pass

**Acceptance criteria**

1. The hub's procedure gives approvals and deviations to the person in the worker's session, and the hub says where to
   give them: met, `agents/hub.md` lines 50-52; the reason is in the workflow (Procedure step 4).
2. The hub reads a waiting worker's checks once, tells the worker when they have ended, and neither of them polls: met,
   `agents/hub.md` lines 52-53; `docs/01-specs/WORKFLOW.md` lines 313-315.
3. The worker's procedure agrees and points to the rule: met, `agents/worker.md` lines 22-24 and 84-85, which point to
   "core rules, Delivery" and "workflow, Pushes".
4. Each change fits its budget, or the budget is raised with its reason: met, `checks/budgets.test.mjs` lines 24, 25 and
   29 and `hooks/hooks.test.mjs` line 110 match the raises the log gives with their reasons, and the recorded test run
   passed.
5. The profile's `verify` passes: met. Verification records all seven commands as passed on commit 12dfcd7, and nothing
   outside the record has changed since.

- **Intent:** in order. The profile says `public: true`, and the intent restates the request without quoting the
  person.
- **Scope:** in order. The diff since the last check is empty.
- **Comments and documents:** in order. The diff since the last check is empty.
- **Gates:** in order. Nothing outside the record changed, and the record names no hosting service and nothing about a
  user, a user's project or an installation.
- **Verification evidence:** in order. Covers formatting (prettier), lint (oxlint, correctness and suspicious
  categories in `.oxlintrc.json`), types (tsc) and tests (node --test). Static security testing is not in `verify`, and
  no comment in `.hub/profile.yml` says why. No gate asks for it, so this is not a finding. The profile has no
  `dynamic-testing`.
- **Security review:** not due.
- **Record:** in order. The last check's finding is fixed. The shortened reports of the first, second and third checks
  now keep only the commit, what was read, the criteria and the findings. What followed each check is in the log.
  Verification holds only command results and checker reports.
- **Commits:** in order. No commit since 12dfcd7. Verification records `node checks/commits.mjs` as passed on the
  branch's 2 commits.

**Findings**

none

**Not verified**

- Whether the record's edits since 12dfcd7 left the earlier log entries unchanged. The diff file leaves the record out,
  and the committed version cannot be compared without git. The one log change visible is an addition at the end of the
  last bullet (lines 79-80), which is consistent with an append-only log.

## Outcome

The hub reads a worker's checks once and tells it, and the person gives the approval of a full item's strategy, and the
acceptance of a deviation, in the worker's own session: both are in the workflow (Procedure, step 4; Pushes), in the
hub's procedure (Follow) and, as far as the worker is concerned, in the worker's. The architecture no longer sends
approvals through the messaging app or the board. The budgets of the hub's and the worker's procedures and of the
workflow are raised by what the text needs, and with them the total of a session's start. Pull request 60 was merged
with all its checks green; no deferred check is declared.
