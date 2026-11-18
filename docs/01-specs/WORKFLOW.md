# Workflow

Terms are defined in the [vision](../00-vision/VISION.md) glossary.

## 1. Key facts

- **One engine, one profile per project.** The rules below are the same everywhere. A project changes only what its
  profile declares.
- **One record per work item,** one file, with front matter. Its sections depend on the size of the work.
- **Three sizes:** trivial, small, full. Only full items stop for approval before work starts.
- **A project's default branch changes only through pull requests.** The record travels in the same pull request as
  the change. The person merges (core rules, Delivery).
- **Everything that is not a change to a project lives in the home:** backlog, inbox and verdicts, reports, check
  outcomes.
- **Nothing is indexed by hand.** Status, lists and history are read from front matter.
- **Parallel by default.** Work is split and run in parallel whenever its parts are independent, without being asked.

---

## 2. Where the rules are

The rules a session follows while it works are the [core rules](../../rules/core.md), which every session of a
project receives when it starts, together with the record template. This document points to them instead of repeating
them, and keeps what they do not say: the reasons, the profile, the derived views, the contract of a hosting service,
decisions, dependencies and the upkeep review.

A new rule goes where it costs least to hold:

- **a script,** when a script can check it: `checks/` in the kit, run by the worker in every project, or a command of
  the project's `verify` list. A script checks every time and costs no context;
- **a skill** of the kit, `skills/<name>/SKILL.md`, when only some situations need it: the worker's file names the
  skill and when to invoke it, and the skill's text enters the context only then;
- **the core rules,** when every session needs it while it works. The checker receives them too, when it starts;
- **an agent's file,** for that agent's own procedure.

A document that reaches its budget (`checks/budgets.test.mjs`; the core rules' limit in `hooks/hooks.test.mjs`)
is answered by such a move, not by shortening its sentences: a shortened rule can lose a condition, and nothing shows
it.

---

## 3. Work items

### 3.1 Types

- **change** — modifies a repository. Lives in the project, arrives as a pull request.
- **report** — answers a question (a status recap, an audit, a performance analysis). Lives in the home. No pull
  request.

### 3.2 Sizes

The three sizes, what each needs before work starts and the cases that are always full are in the core rules (Sizes);
a profile adds cases under `always-full` (section 9). The size is proposed when the item is created and the person can
change it. The effort of recording follows the size, so that a small change does not carry the paperwork of a large
one.

### 3.3 States

| State               | Meaning                                                     | Where the record is         |
| ------------------- | ----------------------------------------------------------- | --------------------------- |
| `idea`              | Captured, not yet decided                                   | Home, `backlog/`            |
| `ready`             | Intent clear, size set, can start                           | Home, `backlog/`            |
| `awaiting-approval` | Full item with its strategy written, waiting for the person | Branch of the project       |
| `in-progress`       | A worker is on it                                           | Branch of the project       |
| `blocked`           | A stop condition was met; waiting for the person            | Branch of the project       |
| `done`              | Work finished and verified                                  | Branch, then default branch |
| `dropped`           | Abandoned                                                   | Home, `backlog/`            |

"In review" is not a state: it is a `done` record on a branch whose pull request is open. Starting an item moves its
record from the home's backlog into a new branch of the project. A report record goes through `in-progress` and `done`
in the home.

---

## 4. The record

One Markdown file, whose path and branch are named in the core rules (Work items). The identifier is a time in UTC so
that two branches cannot produce the same one; folders by year and month keep each folder small (architecture, section
3.4).

### 4.1 Front matter

```yaml
id: 261116-1432
title: Export orders as CSV
project: example-project
type: change # change | report
size: small # trivial | small | full
kind: feature # one of the profile's kinds
state: in-progress
areas: [backend]
created: 2026-11-16
updated: 2026-11-16
requested-by: person # person | hub | check
source: null # inbox item or parent work item, when there is one
pr: null
model: null
effort: null
checks: [] # each: { due: 2026-11-20, what: "…" }
```

Who writes `model` and `effort` is in the core rules (The record).

### 4.2 Sections by size

The record template (`templates/record.md`) says, section by section, which sizes keep it and what it holds. What
Verification holds, and how much of each checker report a record keeps, is in the core rules (The record): only
the last report in full, because an earlier one matters only for what it found. A record is as long as its size calls
for, and copies nothing another document holds (core rules, Documents); the checker fails an item whose record is
longer.

### 4.3 What may not be rewritten

The intent, the scope and acceptance criteria once fixed, and the log: the core rules (The record) say how each is
extended instead.

---

## 5. Procedure

1. **Capture.** A record is created with the intent verbatim. It is an `idea` or `ready` in the home's backlog, or it
   starts at once.
2. **Size and areas.** Proposed from the core rules (Sizes) and the profile's area map.
3. **Start.** A branch is created in the project and the record moves into it.
4. **Strategy.** Small: a few lines, then continue. Full: the strategy is written and the item stops for the
   approval, as the core rules say (Sizes; Commits and branches).
5. **Execute.** A worker runs in a worktree, with the core rules, the profile and the packs of the item's areas.
6. **Verify.** The kit's checks of the record and of the commits run from the kit directory, then the profile's
   verification commands. For small and full items the checker then compares the result with the record and the
   profile's gates, from a fresh context and without write access (`agents/checker.md`).
   A repeated check reads only what changed (`agents/worker.md`, Verification): a full read of a large branch finds
   something new each time, so repeated full reads do not converge, and the first one already covered the branch.
7. **Deliver.** The worker opens the pull request and makes the closing commit (core rules, Delivery; Commits and
   branches). The checks that are wired to the hosting service run on the pull request (section 14.2).
8. **Merge.** The person reviews and merges (section 13.4). A project whose profile says that merging deploys is
   deployed by that merge.
9. **Persist.** Specifications affected by the change are updated in the same pull request.

A trivial item goes from step 3 to step 5.

### 5.1 Parallel work

Work is split and run in parallel whenever its parts are independent. Nobody has to ask for it.

**The test.** Parts are independent when all of these hold:

1. no part needs another part's result;
2. no two parts change the same files, the same schema or the same configuration;
3. each part can be verified on its own;
4. between two separate requests: their pull requests can be merged in either order.

Parts that fail the test run in sequence. A split is never forced: the gain exists only where no coordination is
needed.

**Where it applies.**

| Case                 | What happens                                                                                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parts of one request | One request is one work item and one pull request, even when its parts could land separately. The worker runs the independent parts in separate worktrees, on local branches cut from the item's branch, and merges them into it (section 13.6). Verification and the checker run once, on the integrated result |
| Separate requests    | Each is its own work item, with its own worker, branch and pull request. Two requests run at the same time when they pass the test against each other; otherwise the later one waits                                                                                                                             |
| Reading              | Searching, exploring, researching and reviewing always fan out                                                                                                                                                                                                                                                   |

**Limits.** `max-workers` in the home's settings caps the workers on a host. `parallel.max` in a profile caps the
workers in a project. `parallel.exclusive` names resources that only one worker may use at a time, such as a test
database or a development server; a worker that needs one waits its turn. Work beyond a limit is queued, not dropped.

**Record.** The item's log says which parts ran in parallel and how they were integrated.

---

## 6. Stop conditions

The conditions that stop a worker, and what it does then, are in the core rules (Stop conditions). A worker that
stops instead of guessing leaves a choice to the person that only the person can make.

---

## 7. Deferred checks

An acceptance criterion that only a future event can verify does not keep the item open. It is written in `checks`
with a date and what to look at. The scheduler runs it on that date. The outcome is a report in the home, linked to
the item. A failed check creates a new work item.

---

## 8. Lessons

When a lesson is written is in the core rules (Lessons). It goes to the level where it applies, so that it is learned
once:

| Level      | Applies to                              | Example                                                         | Where                                      | How it enters                |
| ---------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Project    | This repository only                    | "The `fixtures/` folder is generated: change the generator"     | The file named by `lessons` in the profile | In the same pull request     |
| Technology | Every project that uses that technology | "A pushed database migration takes one to two minutes to apply" | Home, `lessons/tech/<technology>.md`       | Written by the hub, reported |
| Host       | Every session on that machine           | "This shell converts arguments that start with `/`"             | Home, `lessons/host/<host>.md`             | Written by the hub, reported |
| Kit        | Every user of the kit                   | "Never batch a restart with the edit of the file it loads"      | The kit's rules                            | A work item on the kit       |

- **Loading.** A session receives the project's lessons, the lessons of each technology in the profile's `stack`, and
  the lessons of the host it runs on. Nothing else is loaded, so a project never carries lessons for tools it does not
  use.
- **Technology lessons are the cross-project memory.** A lesson learned on one project is available to every other
  project that declares the same technology, from the next session.
- **Version.** A lesson tied to a version says so in its text ("with version 2.0 of …"). When the radar records an
  upgrade of that tool, its lessons are reviewed.
- **Promotion.** Technology and host lessons accumulate in the home, which is personal. One that has proved generally
  valid can be proposed for the kit through a work item; the kit only receives reviewed lessons.
- **Existing files.** A project that already has a lessons file keeps it. Entries in it that are about a technology or
  a host are moved to the right level when the project adopts this workflow.

---

## 9. Profile

`.hub/profile.yml` in each project. Indicative content:

```yaml
name: example-project
description: One line on what the project is.
language: en # documents and records; English when omitted
stack: [node, postgres, docker]
default-branch: main
merge-deploys: true
areas:
  backend: { paths: ["src/**"] }
  deploy: { paths: ["deploy/**", ".github/**"] }
  content: { paths: ["prompts/**"] }
verify:
  - npm run check
gates:
  - tests added or updated
  - no breaking change without approval
always-full:
  - "db/migrations/**"
commits:
  address: '@example\.org$' # the author and committer addresses of every commit must match
parallel:
  max: 2 # workers at once in this project
  exclusive: [integration-db] # resources only one worker may use at a time
lessons: MEMORY.md
data:
  - { name: metrics, kind: postgres-readonly, secret: EXAMPLE_RO_URL }
playbooks:
  - docs/playbooks/weekly-metrics.md
legacy:
  - docs/old-worklogs
```

- `language` sets the language of the project's documents and records (core rules, Work items).
- `stack` lists the technologies whose lessons the project's sessions load (section 8).
- `parallel` sets how many workers may run in the project at once and which resources cannot be shared (section 5.1).
- `lessons` names the file that holds the project-level lessons only. The file name is the project's choice.
- `legacy` lists folders with documents from before the project adopted this workflow (section 11).
- `secret` is the name of a secret on the host, never its value.
- `verify` is written as a list with one command on each line: the kit's scripts read no other form. Each command
  runs in the default shell of the machine.
- `verify` is expected to cover four things, with the tools of the project's own stack: formatting, lint, types where
  the language has them, and tests. One command may cover several, as `npm run check` does in the example. A project
  that leaves one out says why in a comment beside the list. The checker reports what the list does not cover
  (`agents/checker.md`).
- `commits.address` is a regular expression that the author and committer addresses of every commit on a work branch
  must match. A profile without it sets no rule on addresses.
- `direct-commits: true` declares that the default branch takes direct commits: the guard (section 14.3) lets a plain
  push to it through, and still refuses a forced push, a push of every branch, a deletion of the default branch and a
  merge of a pull request. Only the home sets it (architecture, 3.2); a project never does, so the example leaves it
  out. Any value but `true` or `false` is an error, and grants nothing.

Per-project customisation is limited to this file and to the project's own rules. The procedure, sizes, states and
record format are not customised.

---

## 10. Derived views

- **Status of a project:** records on its branches, open pull requests, its entries in the home's backlog.
- **Waiting for the person:** records in `awaiting-approval` or `blocked`, and open pull requests.
- **History:** `done` records on default branches, plus verdicts and reports in the home.
- **Measures:** counts and durations by size, area and model, from front matter.

---

## 11. Projects with earlier documents

A project may already have specifications or work logs in another form when it adopts this workflow. They stay where
they are, unchanged, and are listed under `legacy` in the profile so that history questions can read them. New work
follows this workflow from the day of adoption. Nothing is converted.

---

## 12. Example: a small item

```markdown
---
id: 261116-1432
title: Export orders as CSV
project: example-project
type: change
size: small
kind: feature
state: done
areas: [backend]
created: 2026-11-16
updated: 2026-11-16
requested-by: person
source: null
pr: 212
model: claude-opus-5-5
effort: high
checks:
  - { due: 2026-11-20, what: "A full month of orders opens correctly in a spreadsheet" }
---

## Intent

> let me download the orders list as a CSV file

## Acceptance criteria

- The orders page has a download button that returns the current filter as CSV.
- Amounts and dates in the file use the same format as on the page.

## Strategy

Reuse the query behind the orders page, stream the rows as CSV, add one unit test for the formatting and one for an
empty result.

## Log

- Added the CSV endpoint on top of the existing orders query.
- Added the download button to the orders page.
- Added tests.

## Verification

- `node <kit directory>/checks/record.mjs`: passed.
- `node <kit directory>/checks/commits.mjs`: passed.
- `npm run check`: passed.

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. A download button returns the current filter as CSV: met, `src/orders/export.ts`.
2. Amounts and dates use the page's format: met, `src/orders/format.ts`.

- **Intent:** in order.
- **Scope:** in order.
- **Comments and documents:** in order.
- **Gates:** in order.
- **Verification evidence:** in order; `npm run check` covers formatting, lint, types and tests.
- **Record:** in order.
- **Commits:** in order.

**Findings**

none

**Not verified**

none

## Outcome

Orders can be downloaded as CSV with the active filter. One deferred check on a full month of real data.
```

---

## 13. Commits and branches

The rules on commits and branches are in the core rules (Commits and branches; Delivery). A project adds to them only
in its own rules. What follows is why they are as they are, and what they do not say.

### 13.1 Commit messages

A message is read as a title in the history; the reasons are in the record, so the message needs no more.

### 13.2 The trailer

- The trailer goes in the last block of the message. Other trailers, such as the one the platform adds for its
  co-author, can share the block.
- It ties each commit to its record without walking the history:
  `git log --format='%(trailers:key=Work-Item,valueonly)'` prints it. It cannot be added later, because commits are
  never rewritten.
- A commit that the hosting service writes, such as the merge of a pull request, carries none.

### 13.3 Which commits an item makes

- The two commits of a full item that hold only the record let the approval gate be read from the history.
- The closing commit is made after the pull request is opened, so no commit exists only to write its number.
- A pull request is reviewed as a whole. Fewer commits make the history shorter; the record says what happened in
  between.

### 13.4 Merging

- With a merge commit, every commit of the item reaches the default branch as it was made, and the default branch
  shows one entry for each item (`git log --first-parent`).
- A merged branch left behind shows a finished item among the open ones (section 10).
- A project that already merges in another way can keep it. The record still arrives whole and the trailer still ties
  the commits to it; the order of the approval gate is then visible only where the hosting service keeps the pull
  request.

### 13.5 Keeping a work branch up to date

A work branch does not need to hold the latest default branch: its pull request shows a conflict when there is one. A
conflict that cannot be resolved inside the scope stops the work, as any work beyond the scope does.

### 13.6 Branches of parallel parts

How the parts of an item (section 5.1) get their worktrees and branches, and how they are merged back, is in the
kit's skills `honsha:parallel-parts` and `honsha:branch-update`, which the worker invokes when it splits the work and
when it merges the default branch.

---

## 14. The hosting service

The kit does not depend on the service that hosts a project's repository and its pull requests, and its rules name no
service. What is specific to one service is a separate piece of the kit, `services/<name>/`, which a user of another
service replaces with their own. This section says what such a piece holds; `services/github/` is a worked example.

The rules rely on nothing that a service enforces or sells. They hold with a free account, where a service may give
no protection at all: what a service adds beyond that is a further stop, never something a user of the kit must have.

### 14.1 What the piece of a service says

1. **The commands** that open a pull request, read its number, its state and the results of its checks, and show who
   merged it.
2. **The commands that merge a pull request,** as patterns in `merge-commands.json`, for the guard to refuse (14.3).
3. **The settings the rules rely on:** pull requests are merged with the method the core rules name (Delivery), merged
   branches are deleted, and, where the service has them, alerts on vulnerable dependencies are on without automatic
   pull requests (section 17).
4. **What the service can enforce on its side, and under which conditions:** a default branch that refuses direct and
   forced pushes; a check that must pass before a merge; an identity that can push branches and open pull requests but
   cannot merge.
5. **The wiring of the checks** (14.2), and what it costs on that service.

### 14.2 Checks on a pull request

The checks of a project are the `verify` commands of its profile: commands that run anywhere, a person's computer
included. The wiring of a service makes them run on a pull request. It meets this contract.

1. **When.** On every pull request to the default branch: when it is opened, and at every push to its branch.
2. **What it runs.** The `verify` commands, as the profile writes them, in a clean checkout that holds the history of
   the branch. Nothing the profile does not list. On the merge of the branch with the default branch where the service
   offers that, on the tip of the branch otherwise; the piece says which.
3. **What it gives the commands.** Three environment variables, because such a checkout is often not on the branch
   itself: `HONSHA_BRANCH`, the name of the branch; `HONSHA_BASE` and `HONSHA_HEAD`, the commit before the first of the
   branch and its last one.
4. **What it reports.** For each command whether it passed, with its output, shown on the pull request and readable from
   the service's command line or interface, so that the hub can pass it on.
5. **What can block.** The piece says whether a failed check can stop a merge on that service, and under which
   conditions. The rules never rely on it: the worker has already run the same commands, and the person merges after
   seeing the result.
6. **What it may not do.** Change the repository, merge, deploy, or hold more than the right to read the repository.

In the kit, `node checks/verify.mjs` runs the `verify` list of a profile; `node checks/commits.mjs` reads the three
variables, and `node checks/record.mjs` reads `HONSHA_BRANCH`.

### 14.3 The guard

- A hook of the kit refuses four kinds of shell command in a session: a push to the default branch, unless the profile
  declares direct commits (section 9), a forced push, a push that skips the repository's hooks (`--no-verify`), and a
  command that merges a pull request. The first three are plain git and hold on any service. The fourth comes from the
  `merge-commands.json` of each service's piece.
- It matches the text of a command. It stops a mistake. It is not a boundary against a session that was manipulated, and
  a command hidden in a script gets past it: what holds against that is protection on the hosting service, where the
  service gives it.

---

## 15. Comments and documents

The rules are in the core rules (Comments; Documents), for code and every other file. A project adds to them only in
its own rules. What the checker reviews of them is in `agents/checker.md`.

### 15.1 Comments

- A comment that says what the code does goes stale with the code; the reason behind it does not.
- Formatting is the project's choice, with the tools of its stack, and its `verify` list checks it (section 9).

### 15.2 Documents

- A document that keeps what was replaced beside the new text has to be read with its history to know what holds.
  Git keeps the earlier wording, and the record of the change says why.
- Naming once the identifier an entry deletes, as the core rules allow, keeps a citation in a record traceable; an
  identifier is never reused for the same reason.
- A rule stated twice drifts: one copy is changed and the other is not. The second document points to the first. A
  record that copies another document grows with every item and says nothing new.
- The records' own rules are in section 4; a project's earlier documents are in section 11.

---

## 16. Decisions

A record of decisions keeps its value only if it holds the decisions in force and nothing else, and is never needed to
know the current rules.

- **What a decision is:** a choice between alternatives, with its reason. Something that happened, such as a
  repository created or a phase closed, is not a decision: it goes into the plan or into a record.
- **Taken in a work item:** it is written in that item's record, in the strategy, the approval or the deviations, and
  nowhere else. A log may point to the record; it does not copy it.
- **Taken outside any work item:** a choice about one installation, or a standing preference of the person. It goes
  into the decision log of the home, one entry each.
- **The log holds only decisions in force,** as the core rules say for every document (Documents). A later choice
  rewrites the entry it changes, or deletes it.
- **The current rules are read from the specifications,** never from a log. The kit's documents cite no entry of a
  log: they state the rule, with its reason in a few words where the reason helps.

---

## 17. Dependencies

The same in every project that has dependencies. A project adds to it only in its own rules.

- **Pinned.** Every dependency is at an exact version, with the lockfile in the repository, and is installed from the
  lockfile, without install scripts where the package manager can turn them off.
- **Known vulnerabilities are looked for on any service.** At every review below, and in every work item that changes
  the lockfile, the package manager's own vulnerability report runs. Where the hosting service offers alerts on
  vulnerable dependencies, they are switched on as a further stop between reviews; the piece of the service says how.
  Its automatic pull requests stay off: a change that is not a work item has no record, and its commits fail the check
  of a work branch.
- **A fix of a known vulnerability goes in at once.** When a report or an alert names a dependency, a work item starts
  the same day, with the version that fixes it as soon as that version is out. No waiting period applies. Its size
  follows the core rules (Sizes): a major upgrade is full, and its approval is asked the same day.
- **Ordinary updates wait and come on a cadence.** Each direct dependency of a project is covered by a radar entry of
  the installation, with a review date. At the review, the outdated dependencies are listed with the package manager.
  The updates worth making become one work item, full if it holds a major upgrade and small otherwise. A version is
  taken only when it was released at least 7 days earlier, so that a release withdrawn or found compromised in its
  first days is not taken.
- **Who.** The review is started on its date by the scheduler where an installation has one; until then, by the
  person or by a session asked to. An update worth making ends in a work item and a pull request that the person
  merges; a review that finds none moves the review date.

---

## 18. Upkeep review

Documents and logs grow by small additions, each reasonable on its own: a rule restated where it is needed, a
paragraph kept after it stopped holding, a record that copies what another document says. Nobody notices while
working, so a review on a date looks for it.

- **When.** On the same date as the radar review of section 17.
- **What.** The documents and logs of the kit, of the home and of each project are read for duplication, stale text
  and size; the core rules and the agents' files for rules that could move to a script or a skill (section 2); and the
  measures of section 19 for items that touched more existing files than their kind expects.
- **Result.** The findings become one work item.
- **Who.** The review is started by the scheduler where an installation has one; until then, by a scheduled task of
  the installation, which reports its findings and changes nothing.

---

## 19. Measures

Each merged item is measured from git, so that later work can be estimated from similar items, and so that a change
that touches more of a project than its kind should shows where the project is too coupled. Nothing is typed by hand
but the kind. `node checks/measures.mjs` in the kit prints them; it is a report and fails nothing.

- **Times,** from commits. Created: the identifier. Strategy and approval: the two record-only commits of a full
  item. Delivered: the closing commit. Merged: the merge commit on the default branch.
- **Intervals.** Agent work: created to delivered, less the wait for approval. Waiting for approval: strategy to
  approval. Review: delivered to merged.
- **Size.** Commits; lines added and removed; existing files changed and new files added, records left out.
- **Kind.** Chosen with the size, from the profile's `kinds`, each with the most existing files a change of that
  kind is expected to touch. A project whose profile has none uses `feature: 10`, `fix: 5`, `upkeep: 5`,
  `change: 10`. New files are not counted: a capability added in its own files is the shape that stays easy to
  change.
- **Sessions.** Where the platform's session files are on the machine, each item also gets the tokens by class and by
  model, and the active minutes, of the sessions and subagents that worked on it. A response belongs to an item by
  the branch `work/<id>-<slug>` it was on; on no work branch, in the project's folder, by the one item whose window,
  from creation to delivery, holds it; otherwise to none. The files' format is the platform's and not documented as
  stable: what cannot be read is counted and reported, and the git measures stand alone. Only sums are printed;
  nothing is stored. An installation that wants a documented source can use the platform's OpenTelemetry metrics.
- **Use.** For estimates, and for finding coupling. They are not a judgement of a session or a person.
- **Limit.** An item is found from its merge commit; a project that merges in another way gets no measures.

---

## 20. Assessing a project

Before a project adopts the kit, or when the person asks for one, an assessment reads the project against the kit's
rules and proposes the work that would close each gap. It changes nothing: it is a small report item in the home
(section 3.1), and the person chooses which of its proposed items start.

### 20.1 What is read

In this order. A step that finds the project in order says so in a line; a gap is a finding. The commands that are
specific to the hosting service are in its piece (section 14).

1. **Profile:** present, or what it would hold; `verify` covering formatting, lint, types and tests (section 9);
   gates, kinds, the lessons file.
2. **Checks on pull requests:** a pipeline that runs the `verify` commands on every pull request (section 14.2).
3. **The settings of the hosting service** that the rules rely on: the merge method, merged branches deleted, alerts
   on vulnerable dependencies (section 14.1).
4. **Dependencies** (section 17): pinned with a lockfile and installed without install scripts; the package manager's
   vulnerability report and its list of outdated dependencies.
5. **The kit declared in the repository** (architecture, section 3.3), so that sessions get the core rules, the guard
   and the effort hook.
6. **The project's own rules,** such as `CLAUDE.md`, for anything that conflicts with the core rules; earlier
   documents to list under `legacy` (section 11); an existing lessons file, for entries that belong at another level
   (section 8).
7. **Records,** where there are any: complete front matter, sizes and kinds.
8. **Measures** (section 19), where items have been merged: items over their kind's expectation; size budgets the
   project sets on its documents, close to their limit.
9. **Documents:** their size. Duplication and text that no longer holds are the upkeep review's (section 18).
10. **Open points:** the project's open questions, and the assumptions the adoption rests on that nobody has tried.

### 20.2 The report

The record of an assessment has the sections of a small item, from the template.

- **Acceptance criteria:** every step of 20.1 read, and every gap given a proposed item or the reason it has none.
- **Strategy:** the costs the estimates use, the median agent time and output tokens of a small and of a full item,
  and the items they come from.
- **Log:** the commit read in each repository, and the date the settings were read.
- **Verification:** the project's `verify` commands, where they ran, with their results.
- **Outcome:** the findings, in one table: number, finding, proposed item, size and kind, estimated cost. A finding
  with no item says why: a decision only the person can take, or nothing to do now and the review that watches it.
  After the table, one paragraph lists what was read and found in order; then the state in a few lines, the proposed
  order of the items, and the decisions waiting for the person.

The size and kind of a proposed item follow the core rules (Sizes) and the project's `kinds`, or the default ones
(section 19). Its cost is a multiple of a typical item of that size, from `node checks/measures.mjs` run on the
project; while the project has no merged items, on another project of the installation, the kit included. An item
that rests on something untried is estimated higher, and says why.
