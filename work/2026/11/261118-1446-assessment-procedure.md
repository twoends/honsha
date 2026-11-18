---
id: 261118-1446
title: Write the procedure for assessing a project
project: honsha
type: change
size: small
kind: flow
state: done
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-1348
pr: 14
model: claude-opus-5-5
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
- The first check failed on two findings, fixed in a commit of their own: section 20.2 now places each part of an
  assessment in a section of the template, the findings table in the outcome; `source` names the report
  `261118-1348` of the home, finding 4, whose "Procedure used" section 20 generalises, and the paragraph that said so
  under the intent, which holds only the words given, is removed. Those words are the task given by the session that
  runs, for the person, the items of that report.

## Verification

On `4fc56a1` and `6e387a2`, Windows 11, Node.js 26.13.0, Claude Code 2.1.325: `node checks/verify.mjs` passed all six
each time — Prettier, oxlint, TypeScript, 66 tests, the plugin validator with its known warnings, and the commit
check, last "The 2 commits of the branch follow the rules."

### First checker report: fail, read `4fc56a1`

Findings: (1) section 20.2 laid the assessment out in sections the record template does not have, with no place for
the findings table, and said nothing of the acceptance criteria and the verification of a small item; (2) `source`
was `null` while the record named the report it came from, in a paragraph under the intent.

### Checker report

**Verdict:** pass

Repeated check on `4fc56a1...HEAD`, commit `6e387a2`. Both findings from the first report are fixed:
- (1) `docs/01-specs/WORKFLOW.md` lines 589-599: section 20.2 now gives the assessment the sections of a small item from `templates/record.md`. These are Acceptance criteria, Strategy, Log, Verification and Outcome, with the findings table placed in the Outcome. It now covers the acceptance criteria (line 591) and the verification (line 595).
- (2) Line 13 of the record now reads `source: 261118-1348`. The paragraph that sat under the intent is removed (diff lines 51-52), so the Intent holds only the quote.

**Acceptance criteria**

1. Workflow holds the assessment procedure (what is read, in order; each gap becoming a proposed item with size, kind and cost): met, `docs/01-specs/WORKFLOW.md` 558-604. Size, kind and cost are at 596-604.
2. Procedure names no hosting service; service-specific commands are in the service's piece: met. The changed lines 589-604 name no service, and line 567 points to the piece (section 14).
3. Reached through the core rules' pointer; core rules, template and checker do not grow: met. This diff touches only `WORKFLOW.md` and the record.
4. Kit's `verify` list passes: met as recorded. The record's Verification says all six passed on `6e387a2` (not run again).

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- That `261118-1348` is the home's report and that its finding 4 is this item. The home repository is not available here.

## Outcome

The workflow's section 20 is the procedure for assessing a project before it adopts the kit: ten steps read in order,
each pointing to the rule it checks, and a small report record in the home whose outcome holds the findings table,
with a size, a kind and a cost from the measures for each proposed item. The GitHub piece has the commands to read the
merge settings and the workflows. The pilot's assessment follows it. No deferred check.
