---
id: 261117-1825
title: Keep commits few and say how comments are written
project: honsha
type: change
size: small
state: in-progress
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person had found one commit for each step of a plan too many and asked for fewer, and had then been given the two
proposals below. The person accepted the proposal on comments and asked to start applying the rules defined so far, to
move the work forward and to find out whether they work.

- **Commits.** The two record commits of a full item stay; the work goes in one commit, split only where parts are
  really separate; one closing commit holds verification, checker report and outcome; the pull request's number gets no
  commit of its own; a stop, a merge of the default branch and a fix asked by the checker or the person stay separate.
  That gives at least two commits for a small item and four for a full one.
- **Comments.** A comment says why, not what; no history in code; no commented-out code; a TODO only with the identifier
  of a record; the same holds for other files, while their formatting style stays deferred.

Asked on 2026-11-17, in the chat of a session on the kit, answering the two proposals.

## Acceptance criteria

1. The core rules, the worker and the workflow's section 13.3 say how many commits an item makes: for a small item,
   the work with its record and then a closing commit; for a full item, the two record commits, the work and the
   closing commit. The work is split into more commits only where its parts are separate enough to be reviewed one
   at a time. A stop, a merge of the default branch and a fix asked by the checker or the person are commits of
   their own.
2. The closing commit holds the verification, the checker's report, the outcome and the pull request's number
   together. No commit exists only to write the pull request's number. The worker's delivery steps are in the order
   that makes this possible.
3. The core rules and the workflow say how comments are written, in code and in the other files of a project: why,
   not what; no history; no commented-out code; a TODO names the identifier of a record. The formatting style of
   files is not set.
4. The checker looks at the comments added in the diff against that rule.
5. This item is delivered with exactly two commits on its branch, the work and the closing commit, both with the
   trailer.
6. The `verify` list of the kit's profile passes.

## Strategy

- **Size: small.** Two rules on how a session works, already decided with the person in the conversation. No
  schema, no configuration, no dependency. The record's front matter does not change: `pr` stays and is filled in
  the closing commit. If a design choice appears, the item stops and becomes full.
- **The pull request's number.** It exists only after the pull request is opened, which is why it had a commit of
  its own. The worker now opens the pull request after the verification and the checker, from what it already has,
  and then writes the outcome, the report and the number in one closing commit, which it pushes to the open pull
  request.
- **Where.** `rules/core.md`, `agents/worker.md`, `agents/checker.md`, `docs/01-specs/WORKFLOW.md` (sections 5, 9 and
  13.3). The template already says where `pr` goes.
- **This item as the test.** It is run by the new rules: one work commit with this record, one closing commit.

## Log

- 2026-11-17: the kit's earlier items made 8, 4 and 15 commits. Half of them held only the record; one held the
  whole first version of the kit, 695 lines. The person chose the fewest commits over one per step of the plan.
- The rules on comments go in the core rules, in a section of their own. In the workflow they are not about commits,
  so they get a section of their own, 15, rather than a part of section 13.
- The worker's delivery is reordered: verification and checker, then the pull request, then one closing commit.
- The checker gets a step on comments, after the scope; the steps after it are renumbered.
- Section 13.3 of the workflow is renamed "Which commits an item makes"; the README lists comments among the topics
  of the workflow.
- Work committed in one commit, ready for the verification.

## Verification

## Outcome
