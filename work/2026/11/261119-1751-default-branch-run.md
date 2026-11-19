---
id: 261119-1751
title: Check a project's default branch after each push
project: honsha
type: change
size: full
kind: capability
state: done
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: 30
model: claude-opus-5-5
effort: null
checks:
  - { due: 2026-11-26, what: "The home's first push to its default branch after its caller file adds the push event: a run of project.yml on that commit, read with `gh run list --branch main`, with the commits check over the pushed commits passed." }
---

## Intent

The person asked to cover the one point the home's pipeline left out (the home's item `261119-1649`, Out of scope):
no pipeline checks the default branch after a push of `hub/backlog.mjs`, since the kit's reusable workflow runs on
pull requests only. The workflow's section 5.2 already says that a pipeline that checks the default branch after each
push runs the check of commits there. Asked on 2026-11-19, in the chat of a session, answering whether to take up that
point.

## Scope and acceptance criteria

### In scope

- `.github/workflows/project.yml`: a run on a push to the project's default branch, besides the pull request.
- The caller file in `services/github/README.md` and the section that answers the contract; the workflow's section
  14.2, which names only pull requests.

### Out of scope

- The home's own caller file, which a home item changes once this one is merged.
- The kit's own pipeline: the kit's default branch takes no direct commits.
- A change to `checks/commits.mjs`, which already reads the default branch's first-parent commits when the branch it
  is given is the default one.

### Boundaries

- The token stays read-only; the run changes nothing, reverts nothing and opens nothing. It reports.
- A pull request runs exactly as it does now.

### Acceptance criteria

1. On a push to the default branch, project.yml runs the check of commits on the commits that push added
   (`HONSHA_BRANCH` the default branch, `HONSHA_BASE` the commit before the push, `HONSHA_HEAD` the pushed one), the
   registry's check where there is a registry, and the profile's `verify`; it skips the record's check, which belongs
   to a work branch.
2. The caller file in the piece triggers on both events, and its concurrency group still works on a push, which has no
   pull request number.
3. Section 14.2 says that the wiring also runs on a push to the default branch, and why.
4. The kit's own pipeline still passes on this item's pull request, the `project` job included.
5. The profile's `verify` passes.

## Strategy

project.yml learns the event from `github.event_name`. On `push` its three variables come from `github.ref_name`,
`github.event.before` and `github.sha`; on `pull_request` they stay as they are. The record's step gets
`if: github.event_name == 'pull_request'`. The caller file adds `push: branches: [<default branch>]` and keys its
concurrency group on `github.event.pull_request.number || github.sha`. Section 14.2's "When" names the push, with
the reason: the default branch takes the backlog's direct commits, which no pull request checks.

A push to the default branch happens on every merge as well, so every merge also gets a run on the merged result:
the commits check passes over the merge commit, and `verify` checks the default branch as it now is.

Assumptions: `github.event.before` is the default branch's previous tip on an ordinary push; it is all zeros only for
a new branch or a forced push, which the default branch does not take.

Risks: a capture that the profile's `verify` refuses, for instance a record that Prettier would format differently,
would now show at once as a failed run on the default branch, and it would fail every later pull request's `verify`
as well, with or without this item. So the home's "Capture" step should format the record with the home's own
formatter before `add`: that is a line of the home's item that updates its caller file, not of this one.

Cost: one more Linux run, about twenty seconds, for each merge and each capture, against the account's monthly
minutes for private repositories.

## Approval

Approved by the person on 2026-11-19, in the chat of the session that wrote the strategy.

## Log

- 2026-11-19: project.yml takes its three variables from the push on a `push` event and skips the record's check
  there. The caller file in the piece adds the `push` event and keys its concurrency group on the commit for a push:
  each run checks only what its push added, so no push may cancel another. Section 14.2's "When", the variables and
  "What it reports" name the push; its item 2, whose wrap a short line broke, is rewrapped at 120. The push path runs
  only from a project's caller file, so it is tried by the home after this item is merged: a deferred check.
- After the checker's first report (verdict fail): section 14.2's title, opening and item 2, the piece's title and its
  item 2, and the assessment's step on checks name the push too: the record's check on a pull request only, and the
  pushed commit as what a push checks out. project.yml's header names the piece's new title.

- Pull request 30 was opened before the first check so that the kit's own pipeline could run on it; it ran again on
  the fix. Both runs are a pull request's, so the push path waits for the deferred check.
- After the repeated check on `6c8c9cc` (verdict fail): the change to section 20.1 is declared under Deviations.

## Verification

On `4b3fc46`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.
- On GitHub, pull request 30: run `44595758793` on `de16002`, then run `44596499075` on `6c8c9cc`; in each,
  `project / checks`, `verify (ubuntu-latest, Node.js 26)` and `verify (windows-latest, Node.js 26)` passed.

### Earlier checker reports

On `de16002`, a full check.

**Verdict:** fail

**Findings**

1. The documents this item changes still describe the wiring as running on a pull request only, in parts the diff left as they were:
   - `services/github/README.md:155-163` (item 2, "What it runs") says project.yml runs `checks/record.mjs` with no condition. Item 3 on lines 165-166 says that step is skipped on a push.
   - The same item 2 says only that "GitHub checks out the merge of the pull request with its base branch". Contract item 2 at `docs/01-specs/WORKFLOW.md:487-488` requires the piece to say which tree is checked out, and for a push it says nothing.
   - `docs/01-specs/WORKFLOW.md:476-478` still says "The wiring of a service makes them run on a pull request". Item 2 of the contract (lines 484-486) still lists the check of the record without condition. The headings at `docs/01-specs/WORKFLOW.md:474` and `services/github/README.md:113` still say "Checks on a pull request". This breaks the rule in Documents that a document says what holds now.

   Fix in one line: make README item 2 cover the push (what is checked out, the record's step skipped), and align the 14.2 intro and item 2 with item 1.

On `6c8c9cc`, a repeated check.

**Verdict:** fail

**Findings**

1. Change outside the scope that is not declared as a deviation. In `docs/01-specs/WORKFLOW.md:675-676`, section 20.1 ("What is read", the assessment), step 2 was renamed to "Checks on pull requests and the default branch". It now requires a pipeline that also runs "on each push to the default branch". This changes what an assessment counts as a gap in a project. The record's In scope does not list section 20.1, and the record has no "Deviations" section. Only the log mentions the change ("the assessment's step on checks name the push too"). Fix: declare the change to section 20.1 under "Deviations", with the reason.

### Checker report

On `4b3fc46`, a repeated check of the changes since `6c8c9cc`, with the record's last log line and Verification not yet committed.

**Verdict:** pass

The finding from the check on `6c8c9cc` is fixed. The record now has a "Deviations" section (`work/2026/11/261119-1751-default-branch-run.md:141-145`). It declares the change to section 20.1, step 2, and gives the reason. The description matches the text at `docs/01-specs/WORKFLOW.md:675-676`. That text is "Checks on pull requests and the default branch", with a pipeline that runs on every pull request and on each push to the default branch.

This check read only the changes since `6c8c9cc`: commit `4b3fc46` and the uncommitted record. Both change only the record.

**Acceptance criteria**

1. Push run of project.yml with the push's variables, record check skipped: met. The diff since `6c8c9cc` does not touch `.github/workflows/project.yml`, and the last check found no fault here.
2. Caller file triggers on both events, concurrency group works on a push: met. `services/github/README.md` is not changed since `6c8c9cc`.
3. Section 14.2 names the push and why: met, `docs/01-specs/WORKFLOW.md:474-481`. Not changed since `6c8c9cc`.
4. Kit's pipeline passes on the pull request, `project` job included: met up to `6c8c9cc`. The record's Verification lists runs `44595758793` on `de16002` and `44596499075` on `6c8c9cc`. A run on `4b3fc46` cannot be seen from here (see Not verified).
5. Profile's `verify` passes: met as recorded. Verification records all 7 commands passing on `4b3fc46`.

- **Intent:** in order
- **Scope:** in order. The change to section 20.1 is now declared under "Deviations", and nothing else in the diff is outside the scope.
- **Comments and documents:** in order. The diff changes no comment and no document other than the record.
- **Gates:** in order. All three gates in `.hub/profile.yml` hold for this diff, which changes only the record.
- **Verification evidence:** in order; covers formatting (`prettier --check .`), lint (`oxlint`), types (`tsc -p .`) and tests (`node --test`).
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Whether the kit's pipeline ran and passed on `4b3fc46`. The record lists runs only up to `6c8c9cc`, and the hosting service cannot be read from here. `4b3fc46` changes only the record.
- The push path of project.yml has not run yet. The record defers it to the `checks` entry due 2026-11-26.

## Deviations

- The workflow's section 20.1, step 2, which is out of the listed scope, now names the push to the default branch
  too: an assessment reads a project's checks against section 14.2, and that section now asks for the push, so the
  step would otherwise count a project wired as 14.2 says as wired in part.

## Outcome

The kit's reusable workflow also runs on each push to a project's default branch, where it checks the commits that
push added, the merges and the backlog's direct commits, with the registry's check and the profile's `verify`; the
record's check stays on pull requests. Section 14.2 and the GitHub piece say so, and the piece's caller file triggers
on both events. A project takes it by updating its caller file: the home does so in an item of its own, whose first
push answers the deferred check due 2026-11-26.
