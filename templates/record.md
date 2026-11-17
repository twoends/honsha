---
id: YYMMDD-HHMM
title: A short title
project: project-name
type: change # change | report
size: small # trivial | small | full
state: in-progress # idea | ready | awaiting-approval | in-progress | blocked | done | dropped
areas: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
requested-by: person # person | hub | check
source: null # inbox item or parent work item, when there is one
pr: null
model: null # written by the session that finishes the item
effort: null # written by a hook
checks: [] # each: { due: YYYY-MM-DD, what: "…" }
---

<!--
File: work/<yyyy>/<mm>/<id>-<slug>.md, on the branch work/<id>-<slug>. <id> is the creation time in UTC.
This is the full-size shape. Each section says which sizes keep it: delete the sections the item's size does not
keep, and every comment, when the record is created. The rules are in docs/01-specs/WORKFLOW.md, sections 3 and 4.
-->

## Intent

<!-- Every size. The person's words, verbatim, as a quote. Never rewritten: later additions go under "Addenda". -->

> …

## Scope and acceptance criteria

<!--
trivial: delete this section.
small: acceptance criteria only; rename the section "Acceptance criteria".
full: what is in scope, what is out of scope, the criteria, the boundaries.
Fixed once work starts (small) or once approved (full). A later change is a deviation.
-->

### In scope

### Out of scope

### Boundaries

### Acceptance criteria

## Strategy

<!-- trivial: delete. small: a few lines. full: plan, assumptions, risks, and the split into parallel parts if any. -->

## Approval

<!-- full only: who approved, when, through which channel. Work starts after this is written. -->

## Log

<!-- small and full. Append-only, written while the work goes on. Says which parts ran in parallel, if any. -->

## Verification

<!--
trivial: one line with the verification commands and their result.
small and full: each verification command with its result, then the checker's report, copied unchanged.
-->

## Deviations

<!-- Every size, only if any: what departed from the scope, the criteria or the size, and why. -->

## Outcome

<!-- Every size. What is true now, in a few lines, and any deferred check declared in `checks`. -->
