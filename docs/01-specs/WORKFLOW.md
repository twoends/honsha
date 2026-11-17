# Workflow

**Status:** approved as the starting base on 2026-11-16. Identifiers such as D21 refer to the author's decision log, which is kept
outside this repository. Terms are defined in the [vision](../00-vision/VISION.md) glossary.

## 1. Key facts

- **One engine, one profile per project.** The rules below are the same everywhere. A project changes only what its
  profile declares.
- **One record per work item,** one file, with front matter. Its sections depend on the size of the work.
- **Three sizes:** trivial, small, full. Only full items stop for approval before work starts.
- **A project's default branch changes only through pull requests.** The record travels in the same pull request as
  the change. The person merges, with a merge commit.
- **Everything that is not a change to a project lives in the home:** backlog, inbox and verdicts, reports, check
  outcomes.
- **Nothing is indexed by hand.** Status, lists and history are read from front matter.
- **Parallel by default.** Work is split and run in parallel whenever its parts are independent, without being asked.

---

## 2. What the workflow guarantees

- The intent is captured verbatim and then frozen.
- Work that deserves it has an explicit scope and stops for approval before any code is written.
- What happened is written in an append-only log.
- A deviation from the scope is written down, never silent.
- A worker stops when it meets a stop condition, instead of guessing.
- A check that can only be done later is declared with its date and run on that date.
- The effort of recording is proportional to the size of the work.
- Nothing about the state of the work is kept by hand in a second place.

---

## 3. Work items

### 3.1 Types

- **change** — modifies a repository. Lives in the project, arrives as a pull request.
- **report** — answers a question (a status recap, an audit, a performance analysis). Lives in the home. No pull
  request.

### 3.2 Sizes

| Size    | When                                                                            | Before work           | Evidence                              |
| ------- | ------------------------------------------------------------------------------- | --------------------- | ------------------------------------- |
| trivial | One obvious change of a few lines, with no effect beyond what the intent states | Nothing               | The profile's verification commands   |
| small   | One concern, a few files, clear acceptance                                      | A short strategy      | Verification commands and the checker |
| full    | Everything else                                                                 | Strategy and approval | Verification commands and the checker |

Always full, whatever the number of lines:

- a data schema change or migration, or deletion of data;
- a new dependency or a major upgrade;
- authentication, permissions or secrets;
- deploy or CI configuration;
- a change to a public interface;
- anything ambiguous, or with more than one reasonable design;
- anything the project's profile adds to this list.

The size is proposed when the item is created and the person can change it. A worker that discovers the work is larger
than its size stops, raises the size and records a deviation. Raising to full triggers the approval gate.

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

One Markdown file: `work/<yyyy>/<mm>/<id>-<slug>.md`, in folders by year and month (D48). The identifier is the creation time in UTC, `YYMMDD-HHMM`, so two branches
cannot produce the same one. The branch is named `work/<id>-<slug>`.

### 4.1 Front matter

```yaml
id: 261116-1432
title: Export orders as CSV
project: example-project
type: change # change | report
size: small # trivial | small | full
state: in-progress
areas: [backend]
created: 2026-11-16
updated: 2026-11-16
requested-by: person # person | hub | check
source: null # inbox item or parent work item, when there is one
pr: null
model: null # written by the session that finishes the item
effort: null # written by a hook
checks: [] # each: { due: 2026-11-20, what: "…" }
```

### 4.2 Sections by size

| Section                       | trivial  | small                | full                                   |
| ----------------------------- | -------- | -------------------- | -------------------------------------- |
| Intent                        | yes      | yes                  | yes                                    |
| Scope and acceptance criteria | —        | acceptance criteria  | scope in and out, criteria, boundaries |
| Strategy                      | —        | a few lines          | plan, assumptions, risks               |
| Approval                      | —        | —                    | who, when, through which channel       |
| Log                           | —        | yes                  | yes                                    |
| Verification                  | one line | commands and checker | commands and checker                   |
| Deviations                    | if any   | if any               | if any                                 |
| Outcome                       | yes      | yes                  | yes                                    |

### 4.3 What may not be rewritten

- **Intent** is the person's words, verbatim. After creation it is only extended, under "Addenda".
- **Scope and acceptance criteria** are fixed once work starts (small) or once approved (full). A change is a
  deviation.
- **Log** is append-only.

In the first version these are rules for agents and reviewers. A check that compares the sections across commits can
be added if they are broken in practice.

---

## 5. Procedure

1. **Capture.** A record is created with the intent verbatim. It is an `idea` or `ready` in the home's backlog, or it
   starts at once.
2. **Size and areas.** Proposed from the rules in 3.2 and the profile's area map.
3. **Start.** A branch is created in the project and the record moves into it.
4. **Strategy.** Small: a few lines, then continue. Full: the strategy is written, the state becomes
   `awaiting-approval`, and the person is asked. Work continues only after approval, which is written into the record.
   The record with its strategy, and then the approval, are each committed alone (section 13.3).
5. **Execute.** A worker runs in a worktree, with the core rules, the profile and the packs of the item's areas. It
   appends to the log as it goes.
6. **Verify.** The profile's verification commands run. For small and full items the checker then compares the result
   with the intent, the acceptance criteria and the profile's gates, from a fresh context and without write access.
7. **Deliver.** The worker opens the pull request. Its description is generated from the record and the checker's
   report: intent, what changed, verification evidence, checker report, deviations. The worker then writes the
   outcome, the pull request's number and its own model identifier, sets the state to `done`, and pushes all of it in
   one closing commit (section 13.3). The checks that are wired to the hosting service run on the pull request
   (section 14.2).
8. **Merge.** The person reviews and merges, with a merge commit, and the merged branch is deleted (section 13.4). A
   project whose profile says that merging deploys is deployed by that merge.
9. **Persist.** Specifications affected by the change are updated in the same pull request.

A trivial item goes from step 3 to step 5.

### 5.1 Parallel work

Work is split and run in parallel whenever its parts are independent. Nobody has to ask for it (D46).

**The test.** Parts are independent when all of these hold:

1. no part needs another part's result;
2. no two parts change the same files, the same schema or the same configuration;
3. each part can be verified on its own;
4. between two separate requests: their pull requests can be merged in either order.

Parts that fail the test run in sequence. A split is never forced: published comparisons have found that agents
sharing one piece of work do worse than a single agent, so the gain exists only where no coordination is needed.

**Where it applies.**

| Case                 | What happens                                                                                                                                                                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parts of one request | One request is one work item and one pull request, even when its parts could land separately (D47). The worker runs the independent parts in separate worktrees, on local branches cut from the item's branch, and merges them into it (section 13.6). Verification and the checker run once, on the integrated result |
| Separate requests    | Each is its own work item, with its own worker, branch and pull request. Two requests run at the same time when they pass the test against each other; otherwise the later one waits                                                                                                                                   |
| Reading              | Searching, exploring, researching and reviewing always fan out                                                                                                                                                                                                                                                         |

**Approval.** For full-size work the split into parts is part of the strategy and is approved with it.

**Limits.** `max-workers` in the home's settings caps the workers on a host. `parallel.max` in a profile caps the
workers in a project. `parallel.exclusive` names resources that only one worker may use at a time, such as a test
database or a development server; a worker that needs one waits its turn. Work beyond a limit is queued, not dropped.

**Record.** The item's log says which parts ran in parallel and how they were integrated.

---

## 6. Stop conditions

A worker stops, sets the state to `blocked` and reports when:

- the intent or an acceptance criterion is ambiguous;
- a breaking change is required;
- security or permissions are unclear;
- the work conflicts with the documented architecture;
- the work goes beyond the scope;
- an item in the "always full" list appears in work that was sized smaller.

---

## 7. Deferred checks

An acceptance criterion that only a future event can verify does not keep the item open. It is written in `checks`
with a date and what to look at. The scheduler runs it on that date. The outcome is a report in the home, linked to
the item. A failed check creates a new work item.

---

## 8. Lessons

When a tool is misused or the person corrects an approach, the correct action is written down as a short preventive
rule, with no history. It goes to the level where it applies, so that it is learned once:

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

- `language` sets the language of the project's documents and records. When it is omitted, they are in English (D44).
  Code, comments, commit messages and pull requests stay in English in every project. How comments are written is in
  section 15.
- `stack` lists the technologies whose lessons the project's sessions load (section 8).
- `parallel` sets how many workers may run in the project at once and which resources cannot be shared (section 5.1).
- `lessons` names the file that holds the project-level lessons only. The file name is the project's choice.
- `legacy` lists folders with documents from before the project adopted this workflow (section 11).
- `secret` is the name of a secret on the host, never its value.
- `verify` is written as a list with one command on each line: the kit's scripts read no other form. Each command
  runs in the default shell of the machine.
- `verify` is expected to cover four things, with the tools of the project's own stack: formatting, lint, types where
  the language has them, and tests. One command may cover several, as `npm run check` does in the example. A project
  that leaves one out says why in a comment beside the list. The checker reports what the list does not cover; it
  is a finding only when the profile lists that coverage among its gates.
- `commits.address` is a regular expression that the author and committer addresses of every commit on a work branch
  must match. A profile without it sets no rule on addresses.

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

- `npm run check`: passed.
- Checker: both criteria met; no change outside `src/orders`.

## Outcome

Orders can be downloaded as CSV with the active filter. One deferred check on a full month of real data.
```

---

## 13. Commits and branches

The same in every project. A project adds to it only in its own rules.

### 13.1 Commit messages

- One plain imperative sentence in English, short enough to be read as a title. A body follows only when the reason is
  not in the record.
- A project that has its own convention for messages states it in its own rules. The engine has none beyond this.

### 13.2 The trailer

- Every commit a session makes on a work branch ends with the trailer `Work-Item: <id>`, in the last block of the
  message. Other trailers, such as the one the platform adds for its co-author, can share the block.
- It ties each commit to its record without walking the history:
  `git log --format='%(trailers:key=Work-Item,valueonly)'` prints it. It cannot be added later, because commits are
  never rewritten.
- A commit that the hosting service writes, such as the merge of a pull request, carries none.

### 13.3 Which commits an item makes

- For a full item, two commits hold only the record: the record with its strategy and the state `awaiting-approval`, and
  then the approval. No other file changes before the commit of the approval. This is what lets the approval gate be
  read from the history.
- An item makes as few commits as it can:

  | Size             | Commits                                                                  |
  | ---------------- | ------------------------------------------------------------------------ |
  | trivial or small | the work with its record; the closing commit                             |
  | full             | the record with its strategy; the approval; the work; the closing commit |

- **The work** is one commit, with the record and its log, made when the work is ready for the verification. It is
  split only where its parts are separate enough to be reviewed one at a time. The specifications the change affects
  are part of it.
- **The closing commit** holds the verification, the checker's report, the outcome and the front matter, the pull
  request's number included. It is made after the pull request is opened, so no commit exists only to write that
  number.
- **Commits of their own,** besides these: a stop that sets the state to `blocked`, a merge of the default branch
  (13.5), and a fix asked by the checker or the person.
- A pull request is reviewed as a whole. Fewer commits make the history shorter; the record says what happened in
  between.
- A work branch only grows: no amend, no rebase, no squash, whether its commits were pushed or not. A mistake is
  corrected by a new commit.

### 13.4 Merging

- A pull request is merged with a merge commit. Every commit of the item then reaches the default branch as it was made,
  and the default branch shows one entry for each item (`git log --first-parent`).
- After the merge the branch is deleted, on the hosting service and locally, with its worktrees. A merged branch left
  behind shows a finished item among the open ones (section 10).
- A project that already merges in another way can keep it. The record still arrives whole and the trailer still ties
  the commits to it; the order of the approval gate is then visible only where the hosting service keeps the pull
  request.

### 13.5 Keeping a work branch up to date

- A work branch does not need to hold the latest default branch. It is brought up to date only when its pull request
  shows a conflict, when the item needs something that was merged after it started, or when the person asks.
- It is done by merging the default branch into the work branch, never by a rebase. The verification commands and the
  checker then run again, and the log says so.
- A conflict that cannot be resolved inside the scope is a stop condition.

### 13.6 Branches of parallel parts

- Each part of an item (section 5.1) works in its own worktree, on a local branch that is cut from the tip of the item's
  branch and is never pushed. Git refuses a branch named below an existing one, so the name takes a suffix:
  `work/<id>-<slug>.<part>`.
- The parts are merged into the item's branch. Their branches and worktrees are then removed.
- The default branch is merged only into the item's branch, before the split or after the integration, never into a
  part.

---

## 14. The hosting service

The kit does not depend on the service that hosts a project's repository and its pull requests, and its rules name no
service. What is specific to one service is a separate piece of the kit, `services/<name>/`, which a user of another
service replaces with their own. This section says what such a piece holds. The piece for the one service the kit has
been tried with is the worked example.

The rules rely on nothing that a service enforces or sells. They hold with a free account, where a service may give
no protection at all: what a service adds beyond that is a further stop, never something a user of the kit must have.

### 14.1 What the piece of a service says

1. **The commands** that open a pull request, read its number, its state and the results of its checks, and show who
   merged it.
2. **The commands that merge a pull request,** as patterns in `merge-commands.json`, for the guard to refuse (14.3).
3. **The settings the rules rely on:** pull requests are merged with a merge commit, and merged branches are deleted.
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

In the kit, `node checks/verify.mjs` runs the `verify` list of a profile, and `node checks/commits.mjs` is the check
that reads the three variables.

### 14.3 The guard

- A hook of the kit refuses three kinds of shell command in a session: a push to the default branch, a forced push, and
  a command that merges a pull request. The first two are plain git and hold on any service. The third comes from the
  `merge-commands.json` of each service's piece.
- It matches the text of a command. It stops a mistake. It is not a boundary against a session that was manipulated, and
  a command hidden in a script gets past it: what holds against that is protection on the hosting service, where the
  service gives it.

---

## 15. Comments

The same in every project, in code and in every other file: documents, configuration, scripts. A project adds to it
only in its own rules.

- **Why, not what.** A comment gives the reason, a constraint or a trap that the code cannot show. What the code does
  is read from the code.
- **No history.** No "changed for", no dates, no mention of earlier versions or of finished work items. History is in
  the records and in git.
- **No code left commented out.** Git keeps it.
- **A TODO names its record:** `TODO(<id>): …`, where `<id>` is the identifier of a work item in the home's backlog or
  in a project. A TODO without one is not written.
- **Formatting is not set.** The style of Markdown and other files is left to each project for now.
- The checker reviews the comments a change adds, not those it leaves untouched.
