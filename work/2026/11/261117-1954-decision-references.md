---
id: 261117-1954
title: Cite no decision log in the kit, and say what a decision is
project: honsha
type: change
size: small
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: 6
model: claude-opus-5-5
effort: null
checks: []
---

## Intent

The person had asked whether a decision log whose numbers keep growing loses value as its entries pile up, and approved
the proposal made in answer, asking for it to be done first. The kit's part of the proposal: the kit's documents stop
citing entries of a decision log kept outside the kit, and the workflow says what is recorded as a decision and where.
The reorganisation of the log itself happens in the home, outside this pull request. Asked on 2026-11-17, in the chat of
a session on the kit.

### Addenda

2026-11-17, after the pull request was opened. The person had asked whether entries that are fully replaced should be
deleted instead of kept with a state, since they add noise when one looks for something. The answer proposed: delete
them, since git keeps the earlier wording; rewrite an entry that holds in part; never reuse an identifier; make the
change in this pull request as a fix asked by the person. The person approved it and asked for the same reasoning to be
applied to the whole project. That is read here as the rule for every document of a project, so it goes into the core
rules; the home is cleaned the same way, outside this pull request.

## Acceptance criteria

1. No document of the kit outside `work/` cites a decision of a log kept outside the kit (`D` followed by a number).
   Where a citation carried a reason, the reason is stated in words.
2. The open design points `O02`, `O06`, `O07` and `O10`, which the architecture lists in its own section 9, stay; the
   status lines say they are listed there instead of pointing to an outside log.
3. The workflow says what a decision is, where it is recorded (the record of the work item that takes it; otherwise
   the home's decision log, with a state), that entries are replaced and not rewritten, and that current rules are
   read from the specifications, not from a log.
4. The architecture lists the decision log among the home's files.
5. The kit's `verify` list passes.

## Strategy

- **Size: small.** Wording in four documents and one new section of the workflow. No rule a session follows while
  working changes, apart from where a decision is written; no script, no configuration.
- **Citations:** most are tags after a sentence that already states the rule; they are removed. None changes a
  meaning.
- **Records** under `work/` keep their citations: they are history.

## Log

- 2026-11-17: 30 citations of `D` numbers in `README.md`, `VISION.md`, `ARCHITECTURE.md` and `WORKFLOW.md`; the
  three status lines and the README say they point to a log kept outside the repository.
- Every citation was a tag after a sentence that already stated the rule; all removed, none rewritten. The status
  lines of the vision and the workflow drop the note; the architecture's now says that `O` identifiers are its own
  section 9 and `A` identifiers its section 8; the README says where the reasons are: the records of the changes.
- Workflow, new section 16, "Decisions". Architecture, section 3.2: `decisions.md` in the home's layout. README: the
  workflow's topics include decisions.
- Work committed in one commit.
- The count in the first entry was wrong: the diff removes 27 occurrences, 23 tags and 4 notes, not 30.
- The checker passed the item with one finding: the README said that the reason for every rule is in the records
  under `work/`, which is not true for the starting base, approved before any record existed. Fixed in a commit of
  its own: the README now says so. The verdict was a pass, so the check is not repeated; the verification is.
- After the pull request was opened, the person asked for the change in the addenda. State set back to
  `in-progress`.
- Core rules: a new section "Documents": a document says what holds now; replaced text and entries that no longer
  hold are deleted; records and notes of a past discussion are the exception. The core rules and the template are
  now 8,650 characters, under the 10,000 a hook can deliver.
- Workflow, section 15 becomes "Comments and documents": 15.1 is the former text, with formatting now pointing to
  the profile's `verify` list instead of "left to each project for now"; 15.2 states the rule on documents. Section
  16: the log holds only decisions in force; an entry is rewritten or deleted, and identifiers are never reused. The
  states `active` and `replaced by` are gone.
- Architecture 3.2: `decisions.md` holds the choices in force. Checker, step 4: "Comments and documents", reporting
  text left beside what replaced it. README: the workflow's topics.
- Committed as a fix of its own.
- The second check passed with seven findings, all inconsistencies between the new rules, fixed in a commit of
  their own: the checker can now fail a changed document that keeps what the change replaced; it checks only the
  parts a change touches, as the workflow says; the exceptions name records by their own rules (section 4.3) and add
  the profile's `legacy` documents; naming once the identifier an entry replaces is allowed where records cite it;
  the architecture adds standing preferences to `decisions.md`; the worker states the rule on documents. The verdict
  was a pass, so the check is not repeated.

- Mistake: the two files written for the checker, `.honsha-checker.diff` and `.honsha-checker.commits`, were
  committed in `3c074d8` by `git add -A`, and removed in `d865dbf`. They hold the branch's diff and its commits,
  with no-reply addresses only. Prevention, in a commit of its own: `.gitignore` lists `.honsha-checker.*`.

## Verification

### Commands

Run on `8162475`, Windows 11, Node.js 26, Claude Code 2.1.325, with `node checks/verify.mjs`: all six passed.

- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed, no findings.
- `npx --no-install tsc -p .`: passed, no errors.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version.
- `node checks/commits.mjs`: passed, "The 1 commits of the branch follow the rules."

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. No `D`+number citation left outside `work/`; reasons stated in words where a citation carried one: met for the first part, and the second part could not be fully checked. A search for `\bD\d+\b` across the repository, excluding `work/` and `node_modules/`, finds matches only in `.honsha-checker.diff`. The diff removes 27 occurrences. Four were the "Identifiers such as D21…" notes in the README and the three status lines; 23 were tags: 19 in `ARCHITECTURE.md` and 4 in `WORKFLOW.md`. I read each sentence that lost a tag, and its meaning is unchanged. Each one still states its rule, for example "A full-size item stops here: the strategy is sent for approval. Trivial and small items continue." (ARCHITECTURE 4.3) and "One request is one work item and one pull request…" (WORKFLOW 5.1 table). The rows realigned by the formatter keep the same text apart from the removed `(D47)` (WORKFLOW lines 171–175). The O06 and O07 rows lose only `(D37)` and `(D54)` (ARCHITECTURE lines 339–340). Whether any of those log entries held a reason the kit now needs cannot be checked, because the log is outside the repository (see Not verified).
2. `O02`, `O06`, `O07` and `O10` stay, and the status lines point to section 9: met. All four rows are in ARCHITECTURE section 9 (lines 338–341). ARCHITECTURE lines 3–5 now read "Identifiers such as O02 are the open design points of section 9; A1 to A9 are the assumptions of section 8". That is accurate: A1–A9 are at lines 304–312. README lines 94–95 say the same. VISION and WORKFLOW contain no `O` identifiers, so their status lines correctly drop the note.
3. The workflow says what a decision is, where it is recorded, that entries are replaced and not rewritten, and that rules come from the specifications: met. WORKFLOW section 16, lines 507–520, covers each point:
   - what a decision is (line 512);
   - a decision taken in a work item goes in its record (line 514);
   - otherwise it goes in the home's decision log, with the state `active` or `replaced by <id>` (lines 516–517);
   - entries are never rewritten (line 518);
   - current rules are read from the specifications (line 519).
4. The architecture lists the decision log among the home's files: met. ARCHITECTURE 3.2, line 127, has `decisions.md` with a pointer to workflow section 16.
5. The kit's `verify` list passes: met as recorded. All six commands are recorded as passing on `8162475`. I did not run them again.

**Intent:** Done as asked. The kit's documents no longer cite the outside log, and the workflow now says what a decision is and where it is recorded. One added sentence is inaccurate (see Findings).

**Scope:** The diff covers README, VISION, ARCHITECTURE, WORKFLOW and the record, matching the Strategy ("Wording in four documents and one new section of the workflow"). No change is outside the scope.

**Comments:** None. The diff adds only Markdown prose, with no comments of any kind.

**Gates:**
- "The rules name no hosting service": met. The diff adds no service name.
- "Nothing about a user, a user's project or an installation": met. The diff removes "the author's decision log"; the new text (section 16, the `decisions.md` line) is generic.
- "A script comes with its test": met. The diff adds or changes no script.

**Verification evidence:** All six `verify` commands appear under "Verification" as passed on `8162475`. I did not run them again.
- `prettier --check .`: passed.
- `oxlint`: passed, no findings.
- `tsc -p .`: passed.
- `node --test …`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version.
- `node checks/commits.mjs`: passed.

The list covers formatting (prettier), lint (oxlint), types (tsc) and tests (node --test). The checker line is not yet written, which is expected before this report.

**Record:**
- In order: the intent restates the request and says what it approves; acceptance criteria, strategy and log are present as size small requires; the log has entries; Outcome is empty and front matter has `pr`/`model` null and `state: in-progress`, which is expected before the closing commit; no departure from the scope or criteria needs a "Deviations" section; I found no always-full case.
- Not accurate: the log's first entry says "30 citations of `D` numbers". The diff removes 27 occurrences (23 tags plus the 4 notes). This breaks no record rule, but the claim is wrong.

**Commits:**
- Trailer: met. The one commit, `8162475` "Cite no decision log in the kit and say what a decision is", ends with `Work-Item: 261117-1954`.
- Approval-gate order: not applicable, because the item is small.
- Addresses: met. Author and committer both match `commits.address`.
- The closing commit is not made yet, which is expected.

**Findings**

1. README lines 94–95 say "Why each rule is as it is can be read in the records under `work/` of the change that made it". This is not true for the rules of the starting base, which was approved on 2026-11-16 before any record existed. The earliest record, `work/2026/11/261116-1856-kit-first-version.md`, builds on those documents. It says itself (line 414) that the entries it cites are "in a decision log outside the repository". So the reasons behind the removed tags, for example `D21`, `D28`, `D37` and `D47`, are not in any record under `work/`. This false statement is not among the checker's fail conditions, so the verdict stays pass. One-line fix: limit the sentence to rules changed after the starting base.
2. The log's count of 30 citations does not match the 27 occurrences the diff removes (see Record). This is not a fail condition.

**Not verified**

- Whether any removed citation pointed to a reason the kit's text now needs: the log entries are outside the repository and cannot be read from here.
- Whether the new rules in section 16 (the state values, one entry each) had more than one reasonable design, which would make the item always full. The intent says the person approved the proposal in chat; that proposal is not in the repository.
- The verification commands: they are recorded as passing and were not run again.

### After the check

Both findings handled in `8f8ac9a`: the README limits the claim to rules changed after the starting base; the log
corrects the count with a new entry.

### Second run of the commands

On `8f8ac9a`, with `node checks/verify.mjs`: all six passed; `node checks/commits.mjs` reported "The 2 commits of the
branch follow the rules."

### After the addenda: commands

- On `deb4f32`, the person's fix: all six passed; "The 4 commits of the branch follow the rules."
- On `3c074d8`, the fix of the second check's findings: all six passed, 56 tests; "The 5 commits of the branch follow
  the rules." The core rules and the template are 8,693 characters; the hooks' test fails above 9,000.

### Second checker report

**Verdict:** pass

**Acceptance criteria**

1. No `D`+number citation outside `work/`, and reasons stated in words: met. A search for `\bD\d+\b` across the repository, excluding `work/`, `node_modules/` and the diff file, finds nothing. Commit `deb4f32` adds no citation. The second part was judged in the first round. It still cannot be fully checked, because the outside log cannot be read from here.
2. `O02`, `O06`, `O07` and `O10` stay, and the status lines point to section 9: met. ARCHITECTURE lines 338–341 hold all four rows. ARCHITECTURE lines 3–5 and README line 94 say they are the open design points of section 9.
3. The workflow says what a decision is, where it is recorded "with a state", and that "entries are replaced and not rewritten": not met as written, met as amended.
   - Not met as written: WORKFLOW section 16 (lines 524–534) now says the opposite. "A later choice rewrites the entry it changes, or deletes it", and there are no states.
   - Met as amended: the change was asked by the person (Addenda, record lines 28–37) and is declared under "Deviations" (record lines 168–172).
   - The rest of the criterion still holds. What a decision is: line 524. The record of the work item: line 526. The home's log: line 528. Rules are read from the specifications: line 533.
4. The architecture lists the decision log among the home's files: met. ARCHITECTURE line 127, `decisions.md`.
5. The kit's `verify` list passes: not verifiable for the current tip. Passes are recorded for `8162475` (record lines 90–97) and `8f8ac9a` (lines 165–166). No run on `deb4f32` is recorded. I did not run any command.

**Intent:** The first request is done. The addenda are done too: entries that no longer hold are deleted instead of kept with a state, and the rule is generalised in core rules "Documents" (core.md lines 66–70), WORKFLOW 15.2 (lines 507–515) and checker step 4. The record itself says that it read the request as a rule for every project's documents. Whether the person meant that cannot be checked from here.

**Scope:** The diff touches README, VISION, ARCHITECTURE, WORKFLOW, `rules/core.md`, `agents/checker.md` and the record.
- The growth beyond the original strategy (core rules, workflow 15, checker) is declared under "Deviations".
- WORKFLOW 15.1 line 504 rewrites the formatting bullet. It replaces "left to each project for now" with a pointer to the `verify` list. The log records this, but "Deviations" does not name it. I count it as the new document rule applied to text of the kit that no longer held, which falls within the declared growth.

**Comments and documents:** The diff adds no comments. The changed documents leave no replaced text beside its replacement in the changed lines. Applying step 4 to the whole of each changed document, one entry is kept with a note that it no longer holds:
- ARCHITECTURE line 310, A7, "A hook can write model and effort into the record". The results table at line 328 says it is "false for the model". By WORKFLOW 15.2 (line 512), an entry that holds in part is rewritten to what still holds. That text predates this item. It is reported here because step 4 says "a document the diff changes says what holds now" (see Findings 1 and 2).

**Gates:**
- "The rules name no hosting service": met. The new text names only git.
- "Nothing about a user, a user's project or an installation": met. The new text in core.md, WORKFLOW 15.2 and 16, and checker step 4 is generic. ARCHITECTURE line 127 says "this installation" generically.
- "A script comes with its test": met. No script is added or changed.

**Verification evidence:** I did not run any command again.
- All six `verify` commands appear under "Verification" as passed on `8162475`, with a second run on `8f8ac9a`: prettier, oxlint, tsc, node --test (56 tests), `claude plugin validate .`, and `node checks/commits.mjs` ("The 2 commits…").
- No run on `deb4f32` is recorded. As stated, results stay out of a fix commit (worker.md line 87), so I treat this as not verifiable rather than missing. The closing commit must add it.
- Coverage: formatting (prettier), lint (oxlint), types (tsc), tests (node --test).
- The size claim in the log ("8,650 characters") is guarded by `hooks/hooks.test.mjs` line 29 (`size < 9000`), which is part of the test run.

**Record:**
- In order:
  - The intent restates the request, and the person's later request is under "Addenda".
  - Criteria, strategy and log are present as size small requires.
  - The log grows by appended entries, and the first-round entries are intact.
  - "Deviations" declares the change to criterion 3 and to the scope.
  - `state: in-progress` is expected before the closing commit.
- Not yet in order, expected for the closing commit: "Outcome" (lines 174–178) is still the first round's text. It says section 16 says "how entries are replaced", which no longer holds, and it must be rewritten.
- The strategy line "No rule a session follows while working changes, apart from where a decision is written" (line 53) is now false. It is covered by the deviation, since the strategy is fixed.
- No always-full case from the checker's list: no schema, dependency, authentication, CI or public interface.

**Commits:**
- Trailer: met. All four commits end with `Work-Item: 261117-1954`:
  - `8162475` "Cite no decision log in the kit and say what a decision is"
  - `8f8ac9a` "Say that the starting base has no records"
  - `b6d8468` "Close the record of the decision references"
  - `deb4f32` "Delete what no longer holds, in decision logs and every document"
- Approval-gate order: not applicable (small).
- Addresses: met. The author and committer of every commit match `commits.address`.
- `deb4f32` is a commit of its own for a fix asked by the person, as 13.3 allows. The new closing commit is not made yet, which is expected.

**Findings**

1. The checker's verdict rule was not extended to documents. Step 4 is now "Comments and documents" and reports superseded text (checker.md lines 31–35, 72). But the fail list still names only "a comment breaks the rules on comments" (lines 92–93). Superseded text in a document is therefore reported but can never fail an item. That is inconsistent with core.md lines 66–70 and WORKFLOW 15.2, which state the rule as binding. This is not a fail condition under the current text.
2. Checker step 4 and WORKFLOW 15.2 differ on what is checked.
   - Step 4 (lines 34–35): "A document the diff changes says what holds now". As written, that covers the whole document.
   - WORKFLOW 15.2 line 515: "The checker reports text that a change leaves beside what replaced it", which covers only the change.
   - For comments, both limit the check to what the diff adds (checker line 33, WORKFLOW line 505).
   - The two readings give different results here. For example, ARCHITECTURE A7 (line 310 against line 328) breaks 15.2 under the first reading and is out of scope under the second.
3. Core rules and 15.2 say records "are not rewritten" (core.md lines 69–70, WORKFLOW lines 513–514). WORKFLOW 4.3 (lines 119–124) protects only intent, scope and criteria, and the log. The record's other sections (strategy, verification, outcome) and its front matter are written and changed by design. This item's closing commit must rewrite "Outcome" (record lines 174–178) and `state`.
4. WORKFLOW section 11 (lines 303–305) keeps a project's earlier specifications "unchanged" under `legacy`. Neither exception in core.md line 69 nor WORKFLOW 15.2 line 513 covers them. They name only records and notes of a past discussion. A legacy specification that no longer holds is then both required to be deleted and required to stay unchanged.
5. WORKFLOW 16 line 531 says a later entry "deletes it and says which identifier it replaces". That is a note naming what was replaced, the mirror of the "replaced by" that 15.2 line 510 forbids. Line 532 gives a reason (records cite identifiers), but 15.2 states no such allowance.
6. Minor: ARCHITECTURE line 127 describes `decisions.md` as "the choices about this installation that are in force". WORKFLOW 16 line 528 also puts "a standing preference of the person" there.
7. Minor: `agents/worker.md` line 43 restates the comment rules for the worker but not the new rule on documents. The rule reaches the worker only through the core rules in its context.

**Not verified**

- The six `verify` commands on `deb4f32`: not in the record by design. I did not run them.
- Whether the person meant the reasoning to hold for every project that uses the kit, as the record reads it, or only for the documents of the Honsha kit and home. The record states its reading, and the request alone does not settle it.
- Whether a new core rule loaded into every session of every project is a design with more than one reasonable form, which would make the item always full. This case is not on the checker's always-full list, and the person approved the proposal in chat, which is not in the repository.
- Whether the outside log entries behind the removed citations held a reason the kit now needs: that log is outside the repository.

### After the second check

All seven findings are fixed in `3c074d8`, as the log says. A7 in the architecture's section 8 is left as it is: an
assumption is stated as it was tested, with its result beside it, and the check now covers only what a change touches.

## Deviations

- Criterion 3 asked for entries that are replaced, not rewritten, with a state. At the person's request after the
  pull request was opened, entries are now rewritten or deleted and the states are gone. The scope grew to a rule for
  every document, in the core rules, the workflow and the checker.

## Outcome

The kit's documents cite no entry of an outside decision log. Every document says what holds now: what a change
replaces is deleted and git keeps the history, with records, notes of a past discussion and `legacy` documents as the
exceptions. This is a core rule, workflow 15.2, and part of the checker's verdict. A decision log holds only the
decisions in force (workflow 16). The home's log is cleaned the same way, outside this pull request.

Known limit: the core rules and the template are at 8,693 of the 9,000 characters the hooks' test allows. No deferred
check.
