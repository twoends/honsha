---
id: 261119-1200
title: Say how an assessment started by add is let through before its branch is merged
project: honsha
type: change
size: full
kind: flow
state: awaiting-approval
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: null
model: null
effort: high
checks: []
---

## Intent

The person asked to cover the four points listed to them in a session's chat; this item covers point 4, the kit's
item that finding 7 of the home's assessment `261118-2152` calls for, full and of kind flow. `add` commits a project's
entry as `assessing`, with the assessment's record, on a branch of the home, and the assessment runs on that branch;
`may-start`, asked before an item starts, reads the registry of the home's default branch, where the entry is not yet,
and so answers no to that assessment. Asked on 2026-11-19, in that chat, answering whether to cover the four points.

## Scope and acceptance criteria

### In scope

- The workflow's section 20: which items `may-start` is asked for, and what lets the assessment that `add` starts
  through.
- `hub/projects.mjs`, its header and `may-start`, and its tests, only as far as the chosen design needs.

### Out of scope

- The home's `CLAUDE.md`: its step for `add` already starts the assessment on `add`'s branch without asking
  `may-start`, and its dispatch step asks it for every other item.
- The other commands of `hub/projects.mjs`, and the states and their moves.

### Boundaries

- A project's state is still the one on the home's default branch: no design reads a state from an unmerged branch
  for any item other than the assessment.

### Acceptance criteria

1. Section 20 says, in one place, whether `may-start` is asked for the assessment that `add` starts, and, if not, what
   stands in its place.
2. Asked for any other item, `may-start` answers as it does now in each state, and its test still shows it.
3. No document of the kit says that every item, the assessment included, asks `may-start` first.
4. The profile's `verify` passes.

## Strategy

Three designs, as the assessment named them.

- **A. `may-start` is not asked for the assessment that `add` starts** (recommended). Running `add` is the person's
  decision that the project joins, and `add` writes the assessment's record itself, on the branch where it runs: the
  question has already been answered. Section 20's bullet on `may-start` says so.
  `may-start` keeps its answer for an assessment of a project already `assessing` on the default branch: that happens
  when `add`'s pull request, opened before the assessment runs, is merged before the assessment is done, and the
  assessment then goes on in a branch of its own.
- **B. `may-start` lets an assessment through when it is not in the registry**, from the record alone: a `report`
  whose project is the home. It would let through any record shaped that way, for a project nobody added.
- **C. `may-start` reads the registry from a branch given to it**, `add`'s, for the assessment. It adds an option and
  a second source of state to a command whose point is that the state is the merged one.

With A, the change is section 20's bullet on `may-start`; the header of `hub/projects.mjs` names `may-start` as
asked for every item but the assessment `add` starts; and the answer of `may-start` for a project not in the registry
says that an assessment started by `add` is not asked, so that a hub that asks anyway learns why it got a no. The
test checks that message; the other answers do not change. With B or C, `may-start` and its test change as the design
says.

Risks: with A, nothing in code stops a hub that skips `may-start` for an item that is not an assessment; that is the
case today, and the home's instructions ask it for every dispatched item.

## Approval

## Log

## Verification

## Outcome
