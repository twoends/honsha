# Workflow

**Status:** approved as the starting base on 2026-11-16. Identifiers such as D21 refer to the author's decision log, which is kept
outside this repository. Terms are defined in the [vision](../00-vision/VISION.md) glossary.

## 1. Key facts

- **One engine, one profile per project.** The rules below are the same everywhere. A project changes only what its
  profile declares.
- **One record per work item,** one file, with front matter. Its sections depend on the size of the work.
- **Three sizes:** trivial, small, full. Only full items stop for approval before work starts.
- **A project's default branch changes only through pull requests.** The record travels in the same pull request as
  the change. The person merges.
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

| Size    | When                                                                                 | Before work           | Evidence                              |
| ------- | ------------------------------------------------------------------------------------ | --------------------- | ------------------------------------- |
| trivial | One obvious change of a few lines, with no effect beyond what the intent states      | Nothing               | The profile's verification commands   |
| small   | One concern, a few files, clear acceptance                                           | A short strategy      | Verification commands and the checker |
| full    | Everything else                                                                      | Strategy and approval | Verification commands and the checker |

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

| State               | Meaning                                                    | Where the record is        |
| ------------------- | ---------------------------------------------------------- | -------------------------- |
| `idea`              | Captured, not yet decided                                  | Home, `backlog/`           |
| `ready`             | Intent clear, size set, can start                          | Home, `backlog/`           |
| `awaiting-approval` | Full item with its strategy written, waiting for the person | Branch of the project      |
| `in-progress`       | A worker is on it                                          | Branch of the project      |
| `blocked`           | A stop condition was met; waiting for the person           | Branch of the project      |
| `done`              | Work finished and verified                                 | Branch, then default branch |
| `dropped`           | Abandoned                                                  | Home, `backlog/`           |

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
model: null # written by a hook
effort: null # written by a hook
checks: [] # each: { due: 2026-11-20, what: "…" }
```

### 4.2 Sections by size

| Section                       | trivial | small                 | full                                     |
| ----------------------------- | ------- | --------------------- | ---------------------------------------- |
| Intent                        | yes     | yes                   | yes                                      |
| Scope and acceptance criteria | —       | acceptance criteria   | scope in and out, criteria, boundaries   |
| Strategy                      | —       | a few lines           | plan, assumptions, risks                 |
| Approval                      | —       | —                     | who, when, through which channel         |
| Log                           | —       | yes                   | yes                                      |
| Verification                  | one line | commands and checker | commands and checker                     |
| Deviations                    | if any  | if any                | if any                                   |
| Outcome                       | yes     | yes                   | yes                                      |

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
5. **Execute.** A worker runs in a worktree, with the core rules, the profile and the packs of the item's areas. It
   appends to the log as it goes.
6. **Verify.** The profile's verification commands run. For small and full items the checker then compares the result
   with the intent, the acceptance criteria and the profile's gates, from a fresh context and without write access.
7. **Deliver.** The worker writes the outcome, sets the state to `done` and opens the pull request. Its description is
   generated from the record: intent, what changed, verification evidence, checker report, deviations.
8. **Merge.** The person reviews and merges. A project whose profile says that merging deploys is deployed by that
   merge.
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

| Case                                                  | What happens                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parts of one request                                  | One request is one work item and one pull request, even when its parts could land separately (D47). The worker runs the independent parts in separate worktrees and integrates them on the item's branch. Verification and the checker run once, on the integrated result |
| Separate requests                                     | Each is its own work item, with its own worker, branch and pull request. Two requests run at the same time when they pass the test against each other; otherwise the later one waits |
| Reading                                               | Searching, exploring, researching and reviewing always fan out                                                                                                |

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

| Level      | Applies to                              | Example                                                        | Where                                        | How it enters                |
| ---------- | --------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | ---------------------------- |
| Project    | This repository only                    | "The `fixtures/` folder is generated: change the generator"    | The file named by `lessons` in the profile   | In the same pull request     |
| Technology | Every project that uses that technology | "A pushed database migration takes one to two minutes to apply" | Home, `lessons/tech/<technology>.md`         | Written by the hub, reported |
| Host       | Every session on that machine           | "This shell converts arguments that start with `/`"            | Home, `lessons/host/<host>.md`               | Written by the hub, reported |
| Kit        | Every user of the kit                   | "Never batch a restart with the edit of the file it loads"     | The kit's rules                              | A work item on the kit       |

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
  Code, comments, commit messages and pull requests stay in English in every project.
- `stack` lists the technologies whose lessons the project's sessions load (section 8).
- `parallel` sets how many workers may run in the project at once and which resources cannot be shared (section 5.1).
- `lessons` names the file that holds the project-level lessons only. The file name is the project's choice.
- `legacy` lists folders with documents from before the project adopted this workflow (section 11).
- `secret` is the name of a secret on the host, never its value.

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
model: fable
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
