---
id: 261117-2309
title: Check again only what changed since the last report
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

The person asked for the rule on repeated checks to come first, before the pilot's assessment. The rule is the one
proposed after item `261117-2114`, whose branch was checked six times: after a failed check, the checker read the whole
branch again each time, found one new finding in each of five rounds, and cost about 150,000 tokens a round. The
proposal: a repeated check covers the fixes and what they touch, not the whole branch; the full check stays the first.
Asked on 2026-11-18, in the chat of a session on the kit, choosing between this item and the pilot's assessment.

## Acceptance criteria

1. After a failed check, and after the default branch is merged into a work branch, the checker receives the earlier
   report and the difference since the commit it last checked, and checks only that: each earlier finding is fixed,
   and every check applies to the new difference.
2. The first check of an item, and a check the person asks for, read the whole branch, as now.
3. The worker writes the files for a repeated check with commands that work on any hosting service.
4. The core rules and the template stay within their budget; the worker and the checker within theirs.
5. The kit's `verify` list passes.

## Strategy

- **Size: small.** One rule on how the checker is run again, in the worker, the checker and one line of the core
  rules. No script, no configuration.
- **Inputs of a repeated check:** the record, which holds the earlier report reduced to its findings; the difference
  from the commit the earlier check read to the branch's tip; the list of the commits since then. The worker notes
  under Verification which commit each check read, so the next one knows where to start.
- **Why not every repeated check from scratch:** a full read finds new things each time on a large branch, so the
  loop never converges on its own; the first full check already covered the branch, and the fixes are what changed.
- **Where.** Core rules, the line on bringing a branch up to date; worker, verification step 4 and "When the default
  branch moves"; checker, "What you receive" and the start of "What you check". Workflow: one line in section 5 if
  it describes the check.

## Log

- 2026-11-18: core rules, the line on bringing a branch up to date: the checker runs again on what changed. Worker:
  each report is copied with the commit it read; a repeated check gets the diff and the commits from that commit to
  the tip, with plain git commands; only the person can ask for a full check again; "When the default branch moves"
  points to it. Checker: a paragraph on repeated checks. Workflow, section 5 step 6: the reason, in one sentence.
- Sizes: core and template 8,712 characters; worker 5,603 of 5,800; checker 7,380 of 7,600.
- Work committed in one commit.

## Verification

## Outcome
