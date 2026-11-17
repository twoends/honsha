---
id: 261117-2114
title: Say each rule once, keep records short, and keep it that way
project: honsha
type: change
size: full
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

Before going on with the assessment, the person asked for all the documents produced so far to be gone over, with the
same reasoning as for the decisions, to find out whether too much material is starting to accumulate. Two independent
reviews of the kit and the home found that it is: the same rule is stated in three or four documents, checker reports
copied in full make up 38% of the records, the architecture keeps history and measurements, and some documents
contradict each other.

The person then asked to go ahead, and asked for more than fixing what is there now: that it does not happen again,
without the person having to remember it in everything that is done. The home's part is done in the home, outside this
pull request. Asked on 2026-11-17, in the chat of a session on the kit.

## Scope and acceptance criteria

### In scope

- Each rule stated once in the kit's documents, with pointers elsewhere.
- A shorter checker report and a shorter Verification section in future records.
- History, status and measurements removed from the kit's specifications and README.
- The inconsistencies the reviews found in the kit.
- Mechanisms that keep the material from growing again without the person having to ask.

### Out of scope

- Records already merged: they are history and are not rewritten.
- The home's documents, cleaned in the home.
- Any change to what a rule requires, beyond the inconsistencies listed below.

### Boundaries

- No rule is lost: every rule deleted from one document is still stated in another, which the deleting text points to.
- What a session needs and cannot otherwise read stays where the session reads it: the core rules for every session,
  the checker's file for the checker, which does not receive the core rules.

### Acceptance criteria

1. The core rules are the only place for every rule they state; the workflow and the worker point to them instead of
   repeating them. The checker keeps what it needs, since it does not receive the core rules.
2. The checker's report is shorter: a criterion met takes one line, only a criterion not met or not verifiable is
   argued, standing limits are said once in the checker's file, and "Record" lists only what is not in order.
3. A record keeps in full only the last checker report; an earlier one keeps its verdict and findings. Verification
   holds the commands and the report, not a second walk through the criteria.
4. The architecture, the vision, the README and the GitHub piece hold no test dates, no measurements kept for a past
   decision, no status lines and no assumption already settled.
5. The inconsistencies listed in the strategy are fixed.
6. Three mechanisms keep the material from growing, described below, are in place: a rule, a check on every pull
   request, and a periodic review.
7. The kit's `verify` list passes; the core rules and the template stay under their budget.

## Strategy

### Facts it rests on

From the two reviews on 2026-11-17:

- Kit documents: about 100k characters. WORKFLOW 32k, ARCHITECTURE 26k, worker 7.7k, GitHub piece 7.1k, README 6.8k,
  core 6.5k, checker 5.9k, vision 5.8k, template 2.2k. Core and template: 8,687 of the 9,000 the hooks' test allows.
- Records: 195k characters for 8 items in one day. Verification is 49% of it; checker reports alone 38%; three
  records hold two full reports.
- The same rule appears in the core rules, the worker, the workflow and often the checker: commits, comments,
  documents, stop conditions, the always-full list, lessons, delivery.
- Inconsistencies: the architecture says the hub's identity cannot merge and default branches are protected, which a
  free personal account does not give (the GitHub piece and section 14 say so); it says the hook limit is 10,000 while
  the test enforces 9,000; it calls the marketplace private while the kit is meant to be public; the always-full list
  has three wordings, and the checker's lacks "anything ambiguous"; the checker is asked to check the sections a size
  requires and to apply "the core rules", neither of which it receives; the core rules lack the allowance, which the
  workflow and the checker have, to name once the identifier an entry replaces; the strategy of a full item has two
  lists of contents; the workflow's example shows a one-line checker summary while the rules ask for the full report.

### Design

**Fix now.**

- **One source per rule.** The core rules hold every rule a session needs while working. The workflow keeps what the
  core rules do not say (reasons, the contract of a hosting service, the profile, derived views, dependencies, the
  parts of sections 13 to 17 that are not rules for a session) and points to the core rules for the rest. The worker
  keeps the procedure only. The checker keeps its checks, written out, with the always-full list and the sections by
  size, because it does not receive the core rules.
- **Checker report.** New shape in `agents/checker.md`: verdict; criteria, one line each when met; intent, scope,
  comments and documents, gates, commits, each one line when in order; findings in full; "Not verified" without the
  limits that always hold, which the checker's file states once.
- **Records.** Template and worker: the last report in full, an earlier one reduced to its verdict and findings;
  Verification holds the commands and the reports, nothing else; what happened after a check goes into the log only.
- **Specifications.** The architecture loses its status lines, the measurement table of section 3.4 (one sentence
  stays), the results and dates of section 8 and the settled assumptions A4, A6 and A7, repeated statements of
  hosting independence and of the guard's limits, and the paragraph on versions repeated from O10. The README, the
  vision and the GitHub piece lose status and "tried on" lines that the specifications or the records already hold.
- **Inconsistencies.** Each one above, fixed in the document that is wrong.

**Keep it that way.** Three mechanisms, none of which depends on the person remembering:

1. **A rule,** in the core rules' "Documents": a rule is stated in one place, and a document that needs it points to
   it; a record copies nothing that another document already holds. Every session receives it.
2. **A check on every pull request,** two parts:
   - the checker's step on comments and documents reports, in the parts a change touches, a rule restated that
     another document already states, and a record over the size its item calls for. Both fail the item;
   - a new test in the kit's `verify` list gives each document a session reads at every start or every item (core
     and template together, the worker, the checker) a budget in characters, and fails when one is exceeded. A budget
     is raised only by a work item that says why.
3. **A periodic review,** in the workflow next to the radar review of section 17: on the same date, the documents and
   logs of the kit, the home and each project are read for duplication, stale text and size, and the findings become
   one work item. Until the installation has a scheduler, a scheduled task on the person's computer starts it each
   month and reports; it changes nothing by itself. The task belongs to the installation and is created in the home's
   part, after the approval.

### Plan

1. Core rules: the "one place" rule and the allowance on identifiers; the internal duplicates merged, to make room.
2. Workflow: pointers in place of the repeated rules; the periodic review; the example fixed.
3. Worker and template: procedure only; the record rules on reports.
4. Checker: the new report shape; the always-full list and the sections by size written out; the two new findings.
5. Architecture, vision, README, GitHub piece: history, status and measurements out; inconsistencies fixed.
6. The budget test and its numbers, set a little above the sizes reached after the cuts.
7. Verification, the checker under its own new rules, the pull request, the closing commit.

One worker, in sequence: every step touches files the next one reads.

### Assumptions to confirm while building

- Removing the repeated rules frees enough of the core budget for the new rule.
- The checker can tell a restated rule from a pointer reliably enough to fail an item on it; if not, the finding
  becomes a report without a fail.

### Risks

- **A rule lost in the cutting.** Mitigation: the checker is asked to list every rule removed and where it is still
  stated.
- **The workflow no longer reads on its own.** Accepted: it points to the core rules, which every reader of a project
  has.
- **Budgets too tight,** forcing work items only to raise them. Mitigation: budgets set about 10% above the size after
  the cuts.

### Decisions for the person

1. **The checker fails an item** for a restated rule or an oversized record, rather than only reporting it.
   Recommended: a report that nothing enforces is how the material grew.
2. **Budgets in characters** for the documents read at every start or every item, enforced by a test. Recommended.
3. **A monthly scheduled task on this PC** starts the review until the scheduler exists. Recommended; it reports and
   changes nothing.

## Approval

Approved by the person on 2026-11-17, in the chat of the session that wrote the strategy, with the three decisions as
recommended.

## Log

- 2026-11-17: two read-only reviews, one of the kit and one of the home, on Opus; their findings are under "Facts it
  rests on". The strategy is written and the item waits for approval.
- Approved; state set to `in-progress`.
- Steps 1 to 5 done by a subagent on Opus, in this checkout, following this record; it committed nothing. Sizes in
  characters, before and after: core 6,494 to 6,914; template 2,199 to 1,639 (core and template 8,693 to 8,554);
  workflow 32,176 to 28,478; architecture 26,185 to 20,511; worker 7,718 to 5,252; checker 5,887 to 6,895, larger
  because it writes out the rules it does not receive; README 6,853 to 6,321; GitHub piece 7,066 to 6,696; vision
  5,855 to 5,797. Kit documents in all: about 100,000 to about 88,500.
- Every rule removed from one document is still stated in another; the subagent listed each one with the place that
  still states it, checked here against the core rules. The rule on Verification and reports is in the core rules,
  not the workflow, because sessions read the core rules. Workflow section 2 now points to the core rules; new
  section 18, "Upkeep review".
- Core rules: merging with a merge commit unless the project's rules name another method, to agree with workflow 13.4.
- `checks/budgets.test.mjs`: the worker at most 5,800 characters and the checker 7,600, about 10% above their size;
  core and template keep the 9,000 of the hooks' test.
- The scheduled task of decision 3 was created in the installation, outside the kit.
- Work committed in one commit.
- The checker failed the item with five findings, fixed in a commit of their own: the change to the merge rule is
  declared under Deviations; the log no longer names details of the installation (rewritten in place, against the
  log's append-only rule, because the kit's gate on personal content comes first; the earlier wording stays in the
  work commit); the template again says that the checker's report is copied unchanged and that the log names the
  parts that ran in parallel; the core rule on one place makes an exception for an agent's file that checks rules
  its agent does not receive; workflow 4.2 points to the template instead of repeating its sections in a table.
- The second check failed on two findings, fixed in a commit of their own: the GitHub piece claimed that every command
  in it was tried, while only `gh pr create`, `gh pr view` for number and state, and `gh pr checks` were; it now names
  those. The second, a sentence in Verification that belonged in the log, was in the uncommitted part and is removed
  there. The check is repeated.
- The third check failed on one finding, fixed in a commit of its own: workflow 15.2 restated the core rule on naming
  a deleted identifier as an obligation, where the core rules allow it; it now gives the reason and points to the
  core rules. Each repeated check reads the whole branch again and finds something the earlier ones did not; whether
  a repeated check should cover only the fixes is a question for the person, not changed here.
- The fourth check failed on one finding, fixed in a commit of its own: workflow section 1 still said the person merges
  with a merge commit, without the exception the core rules now make. It now points to the core rules, and so does
  section 14.1 on the settings a piece describes; every other mention of the method was searched and is either the
  GitHub piece's default setting or the reason for merge commits.

## Verification

## Deviations

- The core rules now allow a project to merge with another method than a merge commit when its own rules say so.
  Not in the strategy's list: it removes a contradiction with workflow 13.4 found while working.
- One log entry was rewritten to remove installation details (see the log).

## Outcome
