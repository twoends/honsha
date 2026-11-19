---
id: 261119-1751
title: Check a project's default branch after each push
project: honsha
type: change
size: full
kind: capability
state: awaiting-approval
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
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

## Log

## Verification

## Outcome
