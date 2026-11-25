---
id: 261124-1635
title: Move into the kit two lessons that a home keeps for itself, on assessments and on the briefs of full items
project: honsha
type: change
size: small
kind: rule
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
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

## Verification

## Outcome
