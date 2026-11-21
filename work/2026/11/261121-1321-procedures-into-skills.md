---
id: 261121-1321
title: Give every session the workflow's rules it applies, and keep the workflow to reasons and specifications
project: honsha
type: change
size: full
kind: upkeep
state: done
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: 39
model: claude-opus-5-5
effort: xhigh
checks: []
---

## Intent

The person asked for the record of an item that moves out of the workflow two sets of rules that sessions need only
in some situations, and that no session receives today: the procedure of a project's assessment and the rules on
dependencies. They become skills of the kit, which a session loads whole when the situation comes. The same item
gives the workflow a size limit, and replaces with a pointer to the code the implementation details that the code's
comments already state. Asked on 2026-11-21, in the session of the kit's readiness review, after the person observed
that a workflow of about 44,000 characters risks losing pieces once projects start using it.

### Addenda

2026-11-21, before the approval, on the first strategy (`f809f1d`), which kept the workflow's headings, numbers and
sections and stayed away from files another item changes, so that what depends on them would not have to change. The
person asked for no such workaround while the kit is still in full development: the change is designed as it should
be, and every reference, document and file it affects, in the kit and in the home, changes with it.

## Scope and acceptance criteria

### In scope

- Every rule of the workflow that a session applies, moved to where that session receives it: the core rules, an
  agent's file, a skill or a template. The destination of each section is in the strategy.
- New skills `honsha:assessment`, `honsha:dependencies` and `honsha:review`; the skill `honsha:parallel-parts` made
  whole.
- A template of the profile, `templates/profile.yml`, read by the profile's reader in a test.
- The workflow kept to the reasons, the specifications of the kit's own mechanisms and pointers, its headings without
  numbers, the example of a small item removed.
- Every reference to a part of the workflow or of the architecture, in the kit's files outside `work/`, written by the
  heading's name, with a test that fails on one that names no heading.
- `agents/worker.md`, `hub/projects.mjs` and its test, the kit's profile, `checks/budgets.test.mjs`, the README, the
  architecture and every other file whose references or text the moves change.
- The lesson of the person's correction, in `LESSONS.md`.

### Out of scope

- What any rule requires: the rules move and are pointed to, none is changed, added or dropped.
- The core rules' parts, which every session already receives.
- The home and the installation's monthly review task, which change in their own items after this one is merged (see
  the strategy, "After the merge").
- Splitting the workflow into several files: once the rules leave it, no session needs it to do its work.

### Boundaries

- No rule is dropped: the log names, for each paragraph that leaves the workflow, where it went.
- A skill, a template and the workflow say nothing about a user, a project or an installation.
- The core rules' parts stay within the limits of `hooks/hooks.test.mjs`.

### Acceptance criteria

1. Every rule of the workflow that a session applies reaches it through the core rules, an agent's file, a skill or a
   template, as the strategy's table says; the workflow keeps the reasons, the specifications of the kit's mechanisms
   and pointers to where each rule is.
2. `honsha:assessment` holds what an assessment reads and its report. Where a step checks a criterion that another
   file holds, it names that file, which is read whole: the profile's template, the hosting service's piece, the skill
   `honsha:dependencies`.
3. `honsha:dependencies` holds the rules that a work item applies when it changes a dependency or answers a
   vulnerability report.
4. `honsha:review` holds the periodic review: vulnerabilities, ordinary updates, radar dates, deferred checks past
   their date with no outcome, lessons to review, the upkeep of documents and the measures.
5. `honsha:parallel-parts` holds the whole of parallel work: the test, the limits and the case of two separate
   requests in one project, and its description names both the worker and the hub.
6. `templates/profile.yml` holds every key of a profile, each with what it holds in a comment, the area packs and
   `legacy` included; `checks/profile.test.mjs` reads it with `readProfile`.
7. `agents/worker.md` says when to invoke `honsha:assessment` and `honsha:dependencies`, points to the profile's
   template, and names the pack of an area as the skill `honsha:area-<name>`. It stays within its budget.
8. The record that `hub/projects.mjs add` writes names `honsha:assessment`, and its test checks that text.
9. The kit's profile has the gate that the kit's documents cite no entry of a decision log.
10. The workflow's and the architecture's headings carry no numbers. Every reference to one of their headings, in the
    kit's files outside `work/`, reads `(workflow, <heading>)` or `(architecture, <heading>)`, and a test fails on a
    reference that names no heading of that document, or on a reference by number.
11. The example of a small item is gone from the workflow. The lessons' budget and the guard's reading of a move to
    another folder are stated as rules there, with their mechanics left to the comments of `hooks/lessons.mjs` and
    `hooks/guard.mjs`, which already hold them.
12. `checks/budgets.test.mjs` holds each skill at 6,000 characters, the profile's template at 4,000, and the workflow
    at its size after this change rounded up to the next thousand plus 2,000; its comment says why each has one.
13. The README and the architecture list the new skills and the profile's template.
14. `LESSONS.md` holds the lesson of the person's correction.
15. A session started with `claude -p --plugin-dir` on this branch, in a scratch repository, lists the five skills of
    the kit and, after invoking `honsha:assessment`, names its ten steps.
16. The profile's `verify` passes.

## Strategy

**The defect.** The workflow says that the rules a session follows are in the core rules, and that it keeps only what
they do not say: the reasons, the specifications of the kit's mechanisms (section "Where the rules are"). Many rules
that sessions apply stayed in it, and no session receives it. The rules on dependencies are in no rule, agent or
skill; the assessment sends its session to ten other sections; the profile's keys, the limits on parallel work and the
name of an area's pack reach no worker; the gate on citing a decision log reaches no checker. D87 of the installation
lets the item start, since it fixes a defect of the kit; the person decides.

**Where each part goes.**

| Part of the workflow today                     | Goes to                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Parallel work: the test, the limits, the cases | `honsha:parallel-parts`, made whole; the workflow keeps why                               |
| Lessons: the budget's mechanics                | `hooks/lessons.mjs`, whose comments hold them; the rule stays                             |
| Lessons: version, promotion, a full level      | `honsha:review`                                                                           |
| Profile: its keys and what each holds          | `templates/profile.yml`; the workflow keeps why and what a project may not customise      |
| Projects with earlier documents                | `honsha:assessment` and the template's `legacy`; the section goes                         |
| Example: a small item                          | Deleted: the template, `checks/record.mjs` and the kit's own records show the same        |
| The guard: what move it follows                | `hooks/guard.mjs`, whose comments hold it; the rule stays                                 |
| Decisions: the kit's documents cite no log     | A gate of the kit's profile; the rest stays, as the specification of a decision log       |
| Dependencies                                   | `honsha:dependencies` for an item, `honsha:review` for the review; the workflow keeps why |
| Upkeep review                                  | `honsha:review`; the workflow keeps why                                                   |
| Assessing a project: what is read, the report  | `honsha:assessment`; the section keeps the registry's states, the scripts and why         |

The rest stays: key facts, where the rules are, work items, the record, the procedure, the backlog, stop conditions,
deferred checks, the lessons' levels and loading, derived views, the reasons on commits and branches, the hosting
service's contract, comments and documents, measures.

**The skills.** As `honsha:parallel-parts` and `honsha:branch-update` are: a `SKILL.md` whose `description` says when
it applies, whose text the platform gives whole when it is invoked. A skill points to another file only when that file
is read whole and is about one subject: the profile's template, the hosting service's piece, another skill. Nothing is
copied, so no exception to "a rule is stated in one place" is needed. `honsha:review` is generic: the folders of an
installation, its radar and its decisions stay in the home and in the task that runs the review.

**References by name.** Today 85 references in the kit and about 15 in the home cite a section by its number, so
removing one section moves every number after it. A reference by the heading's name, as the core rules' parts are
cited, survives a section added or removed. The headings lose their numbers, and `checks/references.test.mjs` reads the
kit's files outside `work/`: it fails on a reference whose heading the document does not have, and on a reference by
number. Records keep the numbers they were written with, as history.

**Commits.** Two, reviewable one at a time: first the references by name with their test, which change no rule; then
the moves, the skills, the template and the budgets, with the log naming where each paragraph went.

**The budgets.** Six thousand characters for a skill, where the longest, the assessment's, should hold about 4,000;
four thousand for the profile's template. The workflow's budget comes from its size once the moves are made, about 33,000 characters by
today's measures, since nothing else stops its growth, which went from 17,507 to 44,724 characters in five days.

**After the merge.** Two changes outside this repository, each the person's to approve:

- A work item of the home: `CLAUDE.md`, whose dispatch invokes `honsha:parallel-parts` before a second item starts in
  a project with one running and whose follow-up runs the deferred checks that are due; the references by name in its
  other documents; the same lesson as here.
- The installation's monthly review task, outside every repository: today it names a kit folder that no longer
  exists and repeats the review's steps. It becomes the two folders of this PC and the instruction to invoke
  `honsha:review`, read-only, reporting in Italian.

**Live check.** In a scratch repository, `claude -p --plugin-dir` on this branch, asked which skills of the kit it has
and, after invoking `honsha:assessment`, which steps it holds.

**Measures.** About twenty existing files against the six of `upkeep`: the references are in every document of the
kit, once. The measure will mark the item over its kind's expectation, for that reason.

**Risks.** The item `261121-1306`, open as pull request 38, changes the hosting service's contract and the GitHub
piece: once it is merged, the default branch is merged here, as `honsha:branch-update` says, before the work touches
those files, so that the work builds on its text. A skill whose description does not match the situation is not invoked: the record that `add` writes and
the worker's file name the skills, and the live check reads the descriptions. A large diff tires the check: the two
commits and the log's map of each move keep it readable. About twice a full item.

**Alternatives left out.** Copying into the assessment's skill the criteria other sections state, with the exception
for agents' files extended to skills: it keeps two statements of each rule. Splitting the workflow into files of one
topic: once the rules leave it, its reader is a person or a session that changes the kit, who reads it whole.

**Parallel parts.** None: the moves and the references change the same files. The default model is enough.

## Approval

Approved by the person on 2026-11-21, in the chat of the session that wrote the strategy.

## Log

- 2026-11-21: the first strategy, `f809f1d`, kept the workflow's sections, headings and numbers, and avoided the files
  of item `261121-1306`, only so that what depends on them would not change. The person asked for the change to be
  designed as it should be; scope, criteria and strategy are rewritten before the approval.
- The pull request 38 of item `261121-1306` is still open at the approval, so the work starts on the files it does not
  change, and the default branch is merged here once it is merged.
- References by name, the first commit. The workflow's and the architecture's headings lost their numbers; the
  architecture's "Kit", "Home" and "Project" also lost the words in brackets, which moved to each section's first
  line. 88 references in 11 files now name a heading: the two specifications, the README, `LESSONS.md`, the GitHub
  piece, the two pipeline files, `hub/projects.mjs`, `hub/backlog.mjs`, `checks/commits.mjs` and `hooks/lessons.mjs`.
  Where the new reference repeated the document's name, as in "in the workflow (workflow, …)", the sentence was
  reworded. `hooks/hooks.test.mjs` read the record's front matter from the workflow by the heading "4.1 Front
  matter", and now reads it by its name. `checks/references.test.mjs` is new: it fails on a reference that names no
  heading of its document, on a reference by number and on a numbered or repeated heading.
- The first commit changed the README, the GitHub piece and `verify.yml` after all, since their references had to
  change with the others; pull request 38 changes them too, and a conflict is resolved when the default branch is
  merged here.
- The moves, the second commit. Where each part of the workflow went:
  - Parallel work: the test, the two cases and the limits to `honsha:parallel-parts`, whose description now names the
    hub too; the workflow keeps why, and that reading always fans out.
  - Lessons: how a full level names its files, to `hooks/lessons.mjs`, whose opening comment holds it; what a full
    level calls for and the review of a lesson tied to a version, to `honsha:review`; that such a lesson names its
    version, to the core rules (Lessons), since every session may write one; existing lessons files, to
    `honsha:assessment`, step 6. The workflow keeps the levels, the loading, the budget and why promotion is reviewed.
  - Profile: the example and every key's bullet, to `templates/profile.yml`, with `secret`, `legacy` and the default
    kinds from the measures; the workflow keeps what a project may not customise.
  - Projects with earlier documents: to the template's `legacy` and `honsha:assessment`, step 6; the section is gone,
    and `hub/projects.mjs` no longer cites it.
  - Example of a small item: deleted.
  - The guard: the paths and shells it follows, to `hooks/guard.mjs`, whose opening comment holds them.
  - Decisions: that the kit's documents cite no entry of a log, to a gate of `.hub/profile.yml`.
  - Dependencies: the rules of an item to `honsha:dependencies`; the radar's cadence and who starts the review to
    `honsha:review`; the workflow keeps why.
  - Upkeep review: to `honsha:review`, which also holds the steps that the installation's monthly task wrote out; the
    workflow keeps why.
  - Measures: the default kinds, to the template.
  - Assessing a project: what is read and the report, to `honsha:assessment`, which points to the template, the
    hosting service's piece and `honsha:dependencies` instead of other sections; the order that puts the kit's
    declaration first moved there from the state `adopting`. The section is now "Joining an installation", with the
    states, the scripts and why; `hub/projects.mjs`, the architecture and the GitHub piece cite it by that name, and
    the record `add` writes names the skill.
  - Deferred checks: the periodic review lists those past their date, until an installation has a scheduler.
- `agents/worker.md` points to the profile's template, names an area's pack as a skill, and says when to invoke
  `honsha:assessment` and `honsha:dependencies`: 4,800 characters. The workflow went from 44,724 to 32,553 characters;
  its budget is 35,000. The skills: assessment 4,052, review 4,061, parallel parts 1,884, dependencies 1,733; the
  template 3,867.
- Lines over 120 characters that the first commit's references left, and those of this commit, were wrapped again by
  hand: Prettier keeps prose as written.
- Live run on the working tree before this commit: in a new repository, `claude -p --plugin-dir` on this checkout
  listed `honsha:assessment`, `honsha:branch-update`, `honsha:dependencies`, `honsha:parallel-parts` and
  `honsha:review`, and after invoking `honsha:assessment` named its ten steps, from "Profile" to "Open points".
- The checker's full check on `833df8f` failed with seven findings, all inside the scope. Fixed:
  1. The two references by number left in "What the piece of a service says" name their headings, and `numbered` in
     `checks/references.test.mjs` also finds a dotted number in brackets, with a test.
  2. Splitting work whenever its parts are independent, without being asked, and fanning out every search and review
     moved to `agents/worker.md`; the workflow keeps why.
  3. The exception to the wait on new versions, which `honsha:review` had taken from the installation's monthly task,
     is gone: it is a decision of the installation, and stays there.
  4. The two placements that depart from the strategy's table are declared under Deviations.
  5. Each rule stated twice keeps one place: what follows a deferred check, in the workflow; the raising of a lessons'
     budget, the promotion of a lesson and ordinary updates as one item, in `honsha:review`; what an assessment is, in
     `honsha:assessment`. "Where the rules are" now says that the workflow's key facts sum up rules.
  6. The three lines over 120 characters are wrapped. The log line above that says such lines were wrapped by hand is
     wrong twice: a script in the scratchpad wrapped them, and it left these three.
  7. `name` and `description` have their comments in the template, whose opening no longer says that every key but
     `name` may be left out.
- The repeated check on `09c542e` found the seven fixed and one rule dropped by the fix of the fifth: the size of the
  item of ordinary updates, full if it holds a major upgrade and small otherwise. It is back in `honsha:review`, step
  2, its one place.
- The second repeated check, on `ed11b1a`, passed. Pull request 38 was merged by then, so the default branch was
  merged here, `9796c66`, with no conflict: in the README, the GitHub piece and `verify.yml`, git joined the two sides'
  neighbouring changes. `checks/references.test.mjs` then failed on `checks/pushed.mjs`, whose new comment cited the
  hosting service's contract by its number; it now names the heading, `c6d97ea`. The verification ran again on
  `c6d97ea`.

## Verification

On `c6d97ea`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed, 165 tests.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed, 9 commits.

### Checker report, on `833df8f`

A full check.

**Verdict:** fail

**Findings**

1. Two references by number are left in `docs/01-specs/WORKFLOW.md`. Item 2 of "What the piece of a service says"
   (`:316`) ends "for the guard to refuse (14.3)", and item 5 (`:323`) reads "The wiring of the checks (14.2)". Neither
   number is a heading any more. `checks/references.test.mjs:69` does not catch this form, so criterion 10 is not met.
   Fix: name the headings, and widen `numbered`.
2. Two rules that a session applies stayed only in the workflow, which no session receives. At
   `docs/01-specs/WORKFLOW.md:155-157`: split work into independent parts without being asked, and reading always fans
   out. The log (record lines 199-200) says the workflow keeps "that reading always fans out". The strategy's table
   sends the cases of parallel work, Reading among them, to `honsha:parallel-parts`.
3. `skills/review/SKILL.md:21` adds "a decision of the installation can except a dependency from the wait". The
   workflow had no such exception, and the record puts changing or adding a rule out of scope (record line 55).
   `honsha:dependencies` (`skills/dependencies/SKILL.md:18-20`) states the 7-day wait with no exception, so the two
   skills disagree. Nothing is declared under "Deviations".
4. Two moves depart from the strategy's table (record line 116, "Lessons: version, promotion, a full level →
   `honsha:review`"), which criterion 1 binds:
   - "One that holds only for a version of a tool names that version" was added to `rules/core.md:45`, although the
     record also lists the core rules' parts as out of scope (record line 56).
   - Existing lessons files went to `skills/assessment/SKILL.md:26-28`.

   The log explains both (record lines 201-204), but neither is declared under "Deviations".
5. Rules are stated in two places. This breaks Documents and the strategy's "Nothing is copied", and
   `docs/01-specs/WORKFLOW.md:26` says the workflow "states none of them":
   - A deferred check's outcome is a report linked to the item, and a failed check creates a new item:
     `docs/01-specs/WORKFLOW.md:202-203` and `skills/review/SKILL.md:25-26`.
   - A level's budget is raised only by a work item that says why, and the kit takes only reviewed lessons:
     `docs/01-specs/WORKFLOW.md:228-229` and `:232-233`, and `skills/review/SKILL.md:29-31`.
   - Ordinary updates come as one work item: `docs/01-specs/WORKFLOW.md:421-422`, `skills/dependencies/SKILL.md:19-20`
     and `skills/review/SKILL.md:22`.
   - What an assessment is, a small report item of the home that changes nothing, with the person choosing the items:
     `docs/01-specs/WORKFLOW.md:462-465` and `skills/assessment/SKILL.md:6-8`.
6. The log says the lines over 120 characters left by this item's references were wrapped again by hand (record lines
   227-228). Three lines this item changed are still longer than the 120 characters set in `.prettierrc.json`:
   `.github/workflows/project.yml:6`, `.github/workflows/verify.yml:5` and `README.md:113`.
7. `templates/profile.yml:4-5`: `name` and `description` have no comment saying what they hold, as criterion 6 asks of
   every key.

### Checker report, on `09c542e`

A repeated check of the changes since `833df8f`.

**Verdict:** fail

**Findings**

1. A rule of the workflow is dropped. Before this item, the workflow's Dependencies section said "The updates worth
   making become one work item, full if it holds a major upgrade and small otherwise." At `833df8f` that clause was in
   `skills/dependencies/SKILL.md` ("as one work item: full if it holds a major upgrade, small otherwise"). `09c542e`
   deletes it there and does not move it anywhere.
   - `skills/review/SKILL.md:21` keeps only "The updates worth making become one work item", and its report sizes
     items "by the core rules (Sizes)".
   - The core rules make a major upgrade full, but they do not make a bundle without one small rather than trivial.
     That difference decides whether the checker runs.
   - A search of `skills/`, `agents/`, `rules/` and the template finds the clause nowhere.
   - Log item 5 says the rule now lives in `honsha:review` and does not mention the dropped size.
   - One-line fix: put the size clause back in step 2 of `skills/review/SKILL.md`.

### Checker report, on `ed11b1a`

A repeated check of the changes since `09c542e`.

**Verdict:** pass

**Findings**

none

### Checker report, on `c6d97ea`

**Verdict:** pass

A repeated check of what changed since `ed11b1a`: the merge `9796c66` (its `--cc` diff) and the fix `c6d97ea`. The
last report, on `ed11b1a`, passed with no findings, so there is no earlier finding to confirm. Its text is not in the
record yet; the record's log says it passed, and so does the task.

**Acceptance criteria**

1. Every rule a session applies reaches it, and the workflow keeps reasons, specifications and pointers: met. This
   diff does not touch the workflow, the rules, the agents or the skills.
2. `honsha:assessment` holds the reading and the report, and names the files it relies on: met. Not touched by this
   diff.
3. `honsha:dependencies` holds an item's rules on dependencies: met. Not touched.
4. `honsha:review` holds the periodic review: met. Not touched.
5. `honsha:parallel-parts` is whole and names the worker and the hub: met. Not touched.
6. `templates/profile.yml` holds every key, and `checks/profile.test.mjs` reads it: met, `checks/profile.test.mjs:109`.
   Not touched.
7. `agents/worker.md` names the two skills, the template and `honsha:area-<name>`: met, `agents/worker.md:14`, `:23`,
   `:32-33`. Not touched.
8. The record `add` writes names `honsha:assessment`, with a test: met, `hub/projects.mjs:243` and
   `hub/projects.test.mjs:196`. Not touched.
9. The kit's profile has the gate on decision logs: met, `.hub/profile.yml:20`.
10. Headings carry no numbers, every reference names a heading, and a test fails otherwise: met.
    - The fix: `checks/pushed.mjs:19` now reads `(workflow, Checks on pull requests and on the default branch)` instead
      of `(workflow, section 14.2)`. That heading is at `docs/01-specs/WORKFLOW.md:327`.
    - The merged files: every reference in `README.md`, `services/github/README.md` and `.github/workflows/verify.yml`
      names an existing heading, for example `services/github/README.md:152` and `.github/workflows/verify.yml:5`.
    - The files the merge took whole from the default branch (`checks/public.mjs`, `checks/public.test.mjs`,
      `checks/pushed.test.mjs`) contain no reference to either document.
    - A search outside `work/` finds no reference by number except the test's own samples in
      `checks/references.test.mjs`.
11. The small item's example is gone, and the lessons' budget and the guard's move are stated as rules: met. Not
    touched.
12. Budgets: met, `checks/budgets.test.mjs:19-28`. Not touched.
13. The README and the architecture list the new skills and the profile's template: met, `README.md:14`, `:17` and
    `:115`. The merge kept them.
14. `LESSONS.md` holds the lesson: met, `LESSONS.md:11`. Not touched.
15. The live run lists the five skills and the ten steps: met as recorded in the log. The diff touches no skill.
16. The profile's `verify` passes: met. Verification records all 7 commands passing on `c6d97ea`.

- **Intent:** in order. Nothing the person said is quoted in the diff or in the new log line.
- **Scope:** in order. The merge is the one the strategy's Risks foresees. The fix `c6d97ea` belongs to criterion 10.
- **Comments and documents:** in order. The fix changes only the reference in the existing opening comment of
  `checks/pushed.mjs`, plus its rewrap. The three joined hunks in `README.md`, `services/github/README.md` and
  `.github/workflows/verify.yml` say what holds now and keep this branch's references by name.
- **Gates:** in order.
  - "the rules name no hosting service": no file under `rules/` is in the diff.
  - "nothing about a user, a user's project or an installation": nothing such is in the diff.
  - "a script comes with its test": `checks/pushed.mjs` changes only in a comment, and `checks/pushed.test.mjs` came
    with it in the merge.
  - "a document of the kit cites no entry of a decision log": the `O10` at `README.md:103` is an open design point of
    the architecture, not a decision log entry.
- **Verification evidence:** in order. All 7 commands of `verify` are recorded with results on `c6d97ea`, including
  `node checks/record.mjs` and `node checks/commits.mjs` (9 commits). The local branch log shows exactly 9 commits
  after the branch point. Covers formatting (Prettier), lint (oxlint), types (`tsc`) and tests (`node --test`).
- **Record:** in order.
  - The new log line matches the diff: no conflict (the local branch log records an automatic merge), the three
    joined files, and the reference by number in `checks/pushed.mjs` that the fix names.
  - Verification holds only the commands and their results.
- **Commits:** in order.
  - `9796c66` "Merge the default branch, which holds the pipeline changes of item 261121-1306" and `c6d97ea` "Name the
    heading that the merged check of personal content cited by its number" are each a commit of their own, as
    `rules/git.md` asks for a merge and a fix.
  - Each subject is one imperative sentence, and each commit carries `Work-Item: 261121-1321`.
  - The merge came after a passed check, not between a failed check and its repeated one, as
    `skills/branch-update/SKILL.md` requires.

**Findings**

none

**Not verified**

- The findings of the last report, on `ed11b1a`: the report itself is not yet copied into the record. Only the log
  line, `work/2026/11/261121-1321-procedures-into-skills.md:250`, and the task say it passed with no findings.

## Deviations

- The strategy's table sends the version of a lesson to `honsha:review`. The rule that a lesson tied to a version
  names it went to the core rules (Lessons) instead, since any session may write a lesson and only the review reviews
  one; the core rules' parts, which the scope leaves out, change by that clause.
- Existing lessons files went to `honsha:assessment`, step 6, not to `honsha:review`: they are read when a project
  adopts the kit, which is the assessment.

## Outcome

Every rule of the workflow that a session applies now reaches it: through the core rules, the worker's file, the
skills `honsha:assessment`, `honsha:dependencies`, `honsha:review` and `honsha:parallel-parts`, or the profile's
template. The workflow keeps the reasons and the specifications of the kit's own mechanisms, at 32,553 characters
against 44,724, under a budget of 35,000; it and the architecture are cited by their headings, and a test fails on a
reference that names no heading or a number. The home's `CLAUDE.md` and documents, and the installation's monthly
review task, still name sections by number and steps that moved: each changes in its own item after this one is
merged.
