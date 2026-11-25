---
id: YYMMDD-HHMM
title: A short title
project: project-name
type: change # change | report
size: small # trivial | small | full
kind: feature # one of the profile's kinds, set with the size
state: in-progress # idea | ready | awaiting-approval | in-progress | blocked | done | dropped
areas: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
requested-by: person # person | hub | check
source: null # inbox item or parent work item, when there is one
pr: null
model: null
effort: null
checks: [] # each: { due: YYYY-MM-DD, what: "…" }
---

<!--
The full-size shape. Each section says which sizes keep it: delete the sections the item's size does not keep, and
every comment, when the record is created.
-->

## Intent

<!-- Every size. The person's words as a quote; in a public project, the request restated (core rules, The record). -->

> …

## Scope and acceptance criteria

<!--
trivial: delete this section.
small: acceptance criteria only; rename the section "Acceptance criteria".
full: what is in scope, what is out of scope, the boundaries, the criteria.
-->

### In scope

### Out of scope

### Boundaries

### Acceptance criteria

## Strategy

<!--
trivial: delete. small: a few lines. full: plan, assumptions, risks, the split into parallel parts if any, and the
strongest model tier or the max effort if the work needs them.
-->

## Approval

<!-- full only: who approved, when, through which channel. -->

## Log

<!-- small and full. Says which parts ran in parallel, if any. -->

## Verification

<!-- trivial: one line, the commands and their result. small and full: the commands with their results, then the
checker's report, copied unchanged. At any size, a security reviewer's report comes before any checker's, copied
unchanged too. -->

## Deviations

<!-- Every size, only if any: what departed from the scope, the criteria or the size, and why. -->

## Outcome

<!-- Every size. What is true now, in a few lines, and any deferred check declared in `checks`. -->
