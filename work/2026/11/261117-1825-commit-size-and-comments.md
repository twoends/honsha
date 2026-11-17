---
id: 261117-1825
title: Keep commits few and say how comments are written
project: honsha
type: change
size: small
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: 4
model: claude-opus-5-5
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

- First verification passed; the checker failed the item on one finding: the worker's Verification section still
  said to write the results and then commit the work, which puts them outside the closing commit. Fixed in a commit
  of its own, as the new rule asks for a fix asked by the checker: the work is committed before the verification,
  the results stay uncommitted until the closing commit, and a fix commit carries its log lines without them.
- The results of the first verification and the first report were kept out of the fix commit; they go into the
  closing commit with the second ones.

## Verification

### First verification

Run on the work commit `8880575`, Windows 11, Claude Code 2.1.325, with `node checks/verify.mjs`:

- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version, and the plugin
  directory's remarks on the licence and the icon.
- `node checks/commits.mjs`: passed, "The 1 commits of the branch follow the rules."

### First check

The checker ran as a subagent given `agents/checker.md` as its instructions, with read-only tools, because this
session did not load the kit as a plugin.

#### Checker report

**Verdict:** fail

**Acceptance criteria**

1. The core rules, the worker and WORKFLOW 13.3 say which commits an item makes (small: work plus closing commit; full: two record commits, the work, the closing commit; split only where the parts are separate; a stop, a merge and a fix are commits of their own): met. `rules/core.md:45-51`; `agents/worker.md:20-23` (full record commits), `:45-50` (the work as one commit, split rule, commits of their own), `:100` (closing commit); `docs/01-specs/WORKFLOW.md:378-401` (table at 385-388, the work at 390-392, closing commit at 393-395, commits of their own at 396-397).
2. The closing commit holds the verification, the checker's report, the outcome and the PR number; no commit exists only for the number; the worker's steps are in an order that makes this possible: not met. The core rules (`rules/core.md:46-47`), WORKFLOW 5 step 7 (`:144-148`) and 13.3 (`:393-395`), and the worker's Delivery (`agents/worker.md:89-101`: open the PR, then outcome, number and front matter, then one closing commit) say so. But the worker's Verification section, which the diff leaves unchanged, still says to write each command and its result under "Verification" (step 1, `agents/worker.md:68`) and only then "commit the work" (step 3, `:72`). Read literally, the verification results go into the work commit or into a separate commit, not the closing commit. This also contradicts `:45-46`, where the work is committed "when the work is ready for the verification". This item did not follow step 3 literally: its Verification section is uncommitted and says the commands ran on work commit `8880575`.
3. The core rules and the workflow say how comments are written (why not what, no history, no commented-out code, TODO with a record id, in code and other files; formatting not set): met. `rules/core.md:56-64`; `docs/01-specs/WORKFLOW.md:486-499` (formatting left open at 498); `README.md:83` lists comments among the workflow's topics.
4. The checker looks at the comments the diff adds against that rule: met. `agents/checker.md:31-34` (step 4), the "Comments" line in the report shape (`:69`), and the verdict clause (`:88-89`).
5. Delivered with exactly two commits, both with the trailer: not verifiable from here. The branch holds one commit, `8880575` "Keep commits few and say how comments are written", with `Work-Item: 261117-1825`. The closing commit does not exist yet.
6. The kit's `verify` list passes: not verifiable from here. All three commands are recorded as passing (see Verification evidence). I did not run them again.

**Intent:** The person asked for the agreed rules on commits and comments to be applied, and for this item to test them. The rules are written in the core rules, the worker, the checker and the workflow, and the item itself is being run as a two-commit small item. The worker's leftover "commit the work" step (finding 1) is the kind of gap that running the rules was meant to expose.

**Scope:** Every change belongs to the item. The Strategy's "Where" names WORKFLOW sections 5, 9 and 13.3. The diff also adds section 15 and one word in `README.md:83`. Both follow from criterion 3, and the log declares both (record lines 69-70 and 73-74). No change is outside the scope.

**Comments:** in order. The diff adds only Markdown prose. It adds no HTML comments, no code comments and no TODO markers. The "TODO" matches in the diff are prose describing the rule.

**Gates:**
- The rules name no hosting service: met. The added text says "the service that hosts the project" and `services/<name>/README.md` (`agents/worker.md:92-94`). The diff names no service.
- Nothing about a user, a user's project or an installation: met. The diff and the record hold no personal detail.
- A script comes with its test: met. The diff adds no script.

**Verification evidence:** The record (lines 79-84, uncommitted) says the commands ran on work commit `8880575` through `node checks/verify.mjs`:
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning about the manifests' missing version and remarks on the licence and the icon.
- `node checks/commits.mjs`: passed, 1 commit.

All three commands of the profile's `verify` list are recorded. None was run again by me.

**Record:** In order: the intent restates the request, as in earlier records. The acceptance criteria, a few lines of strategy and log entries are there. The Verification section is filled in the working tree. The size is right: nothing in the diff is a case that is always full (no schema, dependency, permissions, CI or deploy configuration, or public interface). No "Deviations" section is needed. Not yet in order, as expected at this point: Outcome is empty, `pr`, `model` and `state: done` are not set, and the checker's report is not copied in. All of these belong to the closing commit.

**Commits:** One commit, `8880575` "Keep commits few and say how comments are written".
- Trailer: met. `Work-Item: 261117-1825` is in the last trailer block, sharing it with the co-author trailer as WORKFLOW 13.2 (`:371-372`) allows.
- Approval gate: not applicable to a small item.
- Addresses: met. The author and committer addresses both match `commits.address`.
- The two-commit shape of criterion 5: not verifiable yet.

**Findings**

1. The worker's Verification section contradicts the new closing-commit rule. `agents/worker.md:68` writes the verification results under "Verification" before `:72` says "commit the work". That puts the verification in the work commit, or in an extra commit, instead of the closing commit that `rules/core.md:46-47` and `docs/01-specs/WORKFLOW.md:393` require. It also clashes with `agents/worker.md:45-46`, where the work is committed before the verification. Criterion 2 is therefore not met in the worker. Fix in one line: drop "commit the work" from step 3, or move it before step 1 and say that the verification results stay uncommitted until the closing commit.

**Not verified**

- Criterion 5: the closing commit does not exist yet, so neither the count of exactly two commits nor its trailer can be seen.
- Criterion 6 and the verification evidence: I cannot run commands. The results are taken from the record.
- The outcome, `pr`, `model`, `state: done` and the copied checker report: they belong to the closing commit, which comes after this report.

### After the first check

Fixed in `5d8abcc`: the worker's Verification section now says that the work is committed before the verification
and that its results stay uncommitted until the closing commit; step 4 says a fix is a commit of its own, without
the results of the verification it answers.

### Second verification

Run on `5d8abcc`, same machine, with `node checks/verify.mjs`:

- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the same warning and remarks as the first time.
- `node checks/commits.mjs`: passed, "The 2 commits of the branch follow the rules."

### Second check

#### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The core rules, the worker and WORKFLOW 13.3 say which commits an item makes: met. `rules/core.md:45-49` covers small and full, the split rule, and the stop, merge and fix commits. `agents/worker.md:20-23` covers the two record commits of a full item. `:45-48` makes the work one commit, split only where its parts are separate, with the stop, merge and fix as commits of their own. `:103-104` is the closing commit. `docs/01-specs/WORKFLOW.md:378-397` has the table at 385-388, the work at 390-392, the closing commit at 393-395 and the commits of their own at 396-397.
2. The closing commit holds the verification, the checker's report, the outcome and the PR number; no commit exists only for the number; the worker's steps are in an order that allows this: met. The first check's finding is resolved:
   - `agents/worker.md:68-69` now says the work is committed before the verification and that its results stay uncommitted until the closing commit.
   - The old "commit the work" step is gone from step 3 (`:74-85`).
   - Step 4 (`:86-88`) makes a fix a commit of its own, without the verification results.
   - Delivery (`:92-104`) runs: open the PR, write the outcome, write `pr` and the front matter, then one closing commit.
   - This agrees with `rules/core.md:46-47` and with `docs/01-specs/WORKFLOW.md:144-148` and `:393-395`.
3. The core rules and the workflow say how comments are written (why, not what; no history; no commented-out code; a TODO names a record; formatting not set): met. See `rules/core.md:56-64` and `docs/01-specs/WORKFLOW.md:486-499`, where formatting is left open at 498. `:268-269` points to section 15, and `README.md:83` lists comments among the workflow's topics.
4. The checker looks at the comments the diff adds against that rule: met. Step 4 is at `agents/checker.md:31-34`, the "Comments" line of the report at `:69`, and the verdict clause at `:88-89`.
5. Exactly two commits, both with the trailer: not verifiable from here, as amended by the declared deviation. "Deviations" (record lines 163-166) says the branch will have three commits: the work, the fix the checker asked for, and the closing commit. The rules allow the fix commit (`rules/core.md:49`). The branch holds two commits now, and both have the trailer. The closing commit does not exist yet.
6. The kit's `verify` list passes: not verifiable from here. All three commands are recorded as passing on `5d8abcc` (see Verification evidence). I did not run them again.

**Intent:** The person asked for the agreed rules on commits and comments to be applied and tested on this item. The rules are written in the core rules, the worker, the checker and the workflow. The item itself is run under them, and the first failed check showed a gap in the worker that has now been closed.

**Scope:** Every change belongs to the item. The fix commit `5d8abcc` touches only `agents/worker.md` (the Verification section) and the record. Both are inside the Strategy's "Where". The README line and WORKFLOW section 15 follow from criterion 3, and the log declares both (record lines 69-70, 73-74).

**Comments:** in order. The diff adds no HTML comments, no code comments and no TODO markers. Every "TODO" match in the diff is prose describing the rule, at diff lines 25, 78, 218-219, 249, 290 and 304. The record was created without the template's HTML comments.

**Gates:**
- The rules name no hosting service: met. The diff says "the service that hosts the project" and `services/<name>/README.md` (`agents/worker.md:95-97`), and names no service.
- Nothing about a user, a user's project or an installation: met for the diff. The uncommitted Verification section names the operating system and the Claude Code version (record line 88). The kit's earlier records already do the same (`work/2026/11/261116-1856-kit-first-version.md:300`, `work/2026/11/261117-1234-delivery-conventions.md:364`).
- A script comes with its test: met. The diff adds no script.

**Verification evidence:** The record shows two runs, both through `node checks/verify.mjs`. I ran neither again.
- First run, on `8880575` (record lines 86-93):
  - `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
  - `claude plugin validate .`: passed, with the known warning on the missing version and remarks on the licence and the icon.
  - `node checks/commits.mjs`: passed, 1 commit.
- Second run, on `5d8abcc` (record lines 155-161):
  - The tests: passed, 56 tests, 0 failed.
  - `claude plugin validate .`: passed, with the same warning and remarks.
  - `node checks/commits.mjs`: passed, "The 2 commits of the branch follow the rules."

All three commands of the profile's `verify` list are recorded as passing.

**Record:**
- In order:
  - The intent restates the request, as in earlier records.
  - The sections a small item needs are all there: acceptance criteria, strategy, log, verification and deviations, matching WORKFLOW 4.2.
  - The log has entries for the work and for the fix.
  - The Verification section holds both runs, the first report and what was fixed after it.
  - The deviation on criterion 5 is declared.
  - The size is right: nothing in the diff is a case that is always full.
- Expected at this point, and not findings: Outcome is empty, and `pr`, `model` and `state: done` are not set. These belong to the closing commit.
- A correction to the context I was given: the "Deviations" section is not uncommitted. It is already in the diff (diff lines 345-348), so commit `5d8abcc` contains it, and the working tree copy is identical. No rule keeps it out of a fix commit. The fix commit leaves "Verification" empty in the committed record, as `agents/worker.md:87-88` requires.

**Commits:** Two commits: `8880575` "Keep commits few and say how comments are written" and `5d8abcc` "Keep the verification results out of the work commit".
- Trailer: met. Both carry `Work-Item: 261117-1825` in the last trailer block, sharing it with the co-author trailer as WORKFLOW 13.2 (`:371-372`) allows.
- Approval gate: does not apply to a small item.
- Addresses: met. The author and committer addresses of both commits match `commits.address`.
- Shape: the work commit, then a fix commit of its own that holds its log lines and no verification results. The closing commit is still to come.

**Findings**

none

**Not verified**

- Criterion 5: the closing commit does not exist yet, so I cannot check the final count of three commits or that commit's trailer and addresses.
- Criterion 6 and the verification evidence: I cannot run commands, so the results are taken from the record.
- The outcome, `pr`, `model`, `state: done`, and whether the second report is copied in unchanged: these belong to the closing commit, which comes after this report.
- Whether the first checker report in the record is an unchanged copy: there is no original here to compare it with.

## Deviations

- Criterion 5 expected two commits. The branch has three: the work, the fix asked by the checker, the closing
  commit. The fix commit is one the rule allows; the criterion did not foresee a failed check.

## Outcome

The kit's rules now say which commits an item makes and how comments are written, and the checker reviews the
comments a change adds. This item ran under the new rules: the work commit, a fix commit asked by the first check,
and this closing commit, with the pull request opened before it so that its number needed no commit of its own.
Running them found one gap, the worker's verification step, which was fixed inside the item. No deferred check.
