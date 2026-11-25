---
id: 261125-2110
title: Have the person approve a strategy in the worker's session, and the hub read a worker's checks once for it
project: honsha
type: change
size: small
kind: rule
state: in-progress
areas: []
created: 2026-11-25
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
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

## Verification

## Outcome
