---
id: 261118-1446
title: Write the procedure for assessing a project
project: honsha
type: change
size: small
kind: flow
state: in-progress
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: null
pr: null
model: null
effort: high
checks: []
---

## Intent

The person asked that the kit hold the procedure for assessing a project before it adopts the kit, so that the
pilot's assessment, which comes next, follows it. Given on 2026-11-18 by the session that runs, for the person, the
items of the home's report `261118-1348`, from its finding 4.

## Acceptance criteria

1. The kit's workflow holds the procedure for assessing a project before it adopts the kit: what is read, in order,
   and how each gap becomes a proposed item with a size, a kind and an estimated cost from the measures.
2. The procedure names no hosting service; the commands it needs that are specific to a service are in that
   service's piece.
3. A session doing an assessment reaches it through the core rules' pointer to the workflow; the core rules, the
   template and the checker do not grow.
4. The kit's `verify` list passes.

## Strategy

A new section 20 of `docs/01-specs/WORKFLOW.md`, appended so that no section number cited elsewhere moves: an
assessment is a report item in the home, read-only, with the ten steps of the trial written for any project and
pointing to the sections that hold each rule, and a findings table whose columns the trial used. The GitHub piece
gains the two commands the steps need and does not have yet: reading the merge settings and the pipelines. Two
existing files, within the three of `flow`.

## Log

- 2026-11-18: record and branch created by a session started with the plugin declared in `.claude/settings.json`;
  it received the core rules at start.
- The effort hook wrote `effort: high` into this record when it was created: the first kit item whose effort is
  written by the hook.
- `WORKFLOW.md`: section 20, "Assessing a project", with what is read (20.1) and the report (20.2). The core rules
  already send a case they do not cover to the workflow, so they are unchanged.
- GitHub piece: `gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge`
  and `gh workflow list`, both tried on the kit's repository.
