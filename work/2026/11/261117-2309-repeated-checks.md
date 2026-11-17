---
id: 261117-2309
title: Check again only what changed since the last report
project: honsha
type: change
size: small
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: 10
model: claude-opus-5-5
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
- The first check failed on three findings, fixed in a commit of their own. After a merge of the default branch the
  repeated-check commands would have brought in the default branch's changes and commits; now a merge leads to a
  repeated check only when a check has already run and the merge had conflicts, and it reads `git show --cc` of the
  merge commit, which holds only the resolutions. The commands for a repeated check after a fail are the first
  check's commands with the last checked commit in place of the default branch, so the format stays the same. The
  workflow points to the worker instead of restating the rule. The commands were tried on this repository. Worker
  5,694 of 5,800; checker 7,390 of 7,600.
- The first repeated check, reading only `5213235`, failed on one finding, fixed in a commit of its own: a merge of the
  default branch between a failed check and its repeated check would bring the default branch's changes into the
  repeated check. The worker now never merges in that interval; `git show --cc` is described as what the merge itself
  changed. Worker 5,752 of 5,800.

## Verification

On `f2e2efd`, `5213235` and `b79fa29`, Windows 11, Node.js 26.13.0, Claude Code 2.1.325: `node checks/verify.mjs` passed all
six each time — Prettier, oxlint, TypeScript, 58 tests with the budgets, the plugin validator with its known warning,
and the commit check, last "The 3 commits of the branch follow the rules."

### First checker report: fail, read `f2e2efd`

Findings: (1) after a merge of the default branch, the repeated-check commands would bring in its changes and
commits, and "with the same format" could drop `--reverse --name-only`; (2) a merge before any check had no commit to
start a repeated check from; (3) workflow section 5 restated the rule and left out the merge case.

### Second checker report: fail, read `5213235`

Finding: a merge of the default branch between a failed check and its repeated check would bring its changes
into the repeated check.

### Checker report

**Verdict:** pass

Repeated check on `b79fa29`, reading `git diff 5213235...HEAD`. Last report's finding (a merge of the default branch between a failed check and its repeated check would bring that branch's changes into the repeated check): fixed. `agents/worker.md:49` now says "Never merge between a failed check and its repeated check." The only other merge path into a repeated check (`agents/worker.md:45-47`) reads `git show --cc <merge>` with `<merge>^!` as the range, so it never takes in the default branch's own changes. This agrees with `rules/core.md:53-54` and `docs/01-specs/WORKFLOW.md` 13.5.

**Acceptance criteria**

1. Repeated check after a fail or a merge, earlier report plus diff since the last checked commit: met, `agents/worker.md:45-49` and `:75-78`, `agents/checker.md:26-29`. The fix closes the gap that broke this criterion.
2. First check and a check the person asks for read the whole branch: met, `agents/worker.md:66-69` and `:77`. The diff does not touch this.
3. Commands work on any hosting service: met, plain git commands only (`agents/worker.md:46-47`, `:66-69`, `:75-77`).
4. Core, template, worker and checker within budget: met by the recorded result. The record gives worker at 5,752 of 5,800, and the budget tests pass on `b79fa29`.
5. Kit's `verify` list passes: met by the recorded result. Verification gives all six passing on `b79fa29`.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order. `node checks/verify.mjs` runs the profile's `verify` list (`checks/verify.mjs:39-49`), and its six results are recorded for `b79fa29`. It covers formatting, lint, types and tests.
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

none

## Outcome

After a failed check, the checker reads only what changed since the commit it last read; after a merge of the default
branch, only a merge with conflicts leads to a repeated check, on what the merge itself changed. A full check runs
once, or again when the person asks. On this item the rule was used on itself: one full check, then two repeated
checks of one commit each, at about half the cost of a full one. No deferred check.
