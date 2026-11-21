# Workflow

Terms are defined in the [vision](../00-vision/VISION.md) glossary.

## Key facts

- **One engine, one profile per project.** The rules below are the same everywhere. A project changes only what its
  profile declares.
- **One record per work item,** one file, with front matter. Its sections depend on the size of the work.
- **Three sizes:** trivial, small, full. Only full items stop for approval before work starts.
- **A project's default branch changes only through pull requests.** The record travels in the same pull request as
  the change. The person merges. The one exception is the home's backlog (core rules, Delivery; workflow, The backlog).
- **The home is a project like any other.** What is not a change to another project lives there: backlog, inbox and
  verdicts, reports, check outcomes. It reaches the home's default branch as any change does, through a work item and
  a pull request, the writes the hub and its scripts make included; only the backlog's records are pushed there by a
  script of the kit, at once (workflow, The backlog).
- **Nothing is indexed by hand.** Status, lists and history are read from front matter.
- **Parallel by default.** Work is split and run in parallel whenever its parts are independent, without being asked.

---

## Where the rules are

The rules a session follows while it works are the [core rules](../../rules/core.md), the files of `rules/` in the kit,
which every session of a project receives when it starts, together with the record template. A rule that only some
sessions apply reaches them through a skill of the kit, a template or an agent's file. Apart from the summary of its
key facts, this document states none of them: it points to them, and keeps what no session needs while it works, the
reasons, and the specifications of the kit's own mechanisms, for whoever changes the kit.

A new rule goes where it costs least to hold:

- **a script,** when a script can check it: `checks/` in the kit, run by the worker in every project, or a command of
  the project's `verify` list. A script checks every time and costs no context;
- **a skill** of the kit, `skills/<name>/SKILL.md`, when only some situations need it: its description says when it
  applies, the worker's file names the skills an item calls for, and the skill's text enters the context only then;
- **a template** of the kit, `templates/`, for the shape of a file a session writes: the record, which every session
  receives, and the profile;
- **the core rules,** in the part of its topic, when every session needs it while it works. The checker receives them
  too, when it starts;
- **an agent's file,** for that agent's own procedure. The worker's file reaches a session that runs as no agent, by a
  hook at its start, outside the main working tree of a home, which is the hub's: a session started as an agent has
  that agent's file as its system prompt, and the sessions that an application or another session starts run as none.

A document that reaches its budget (`checks/budgets.test.mjs`) is answered by such a move, not by shortening its
sentences: a shortened rule can lose a condition, and nothing shows it. The core rules have two limits, in
`hooks/hooks.test.mjs`. Each part reaches a session by a hook of its own, and the platform keeps out of the context any
hook's output over 10,000 characters: a part that nears that limit is split into two topics, each with its hook. The
total a session receives at start, the lessons and the worker's procedure counted at their budgets (workflow,
Lessons), is a choice of what every session pays: it is raised by a work item that says why, or answered by moving a
rule that only some situations need into a skill.

---

## Work items

### Types

- **change** — modifies a repository. Lives in the project, arrives as a pull request.
- **report** — answers a question (a status recap, an audit, a performance analysis). A work item of the home: its
  record holds the answer, and arrives with it in a pull request of the home.

### Sizes

The three sizes, what each needs before work starts and the cases that are always full are in the core rules (Sizes); a
profile adds cases under `always-full` (workflow, Profile). The size is proposed when the item is created and the person
can change it. The effort of recording follows the size, so that a small change does not carry the paperwork of a large
one.

### States

| State               | Meaning                                                     | Where the record is         |
| ------------------- | ----------------------------------------------------------- | --------------------------- |
| `idea`              | Captured, not yet decided                                   | Home, `backlog/<project>/`  |
| `ready`             | Intent clear, size set, can start                           | Home, `backlog/<project>/`  |
| `awaiting-approval` | Full item with its strategy written, waiting for the person | Branch of the project       |
| `in-progress`       | A worker is on it                                           | Branch of the project       |
| `blocked`           | A stop condition was met; waiting for the person            | Branch of the project       |
| `done`              | Work finished and verified                                  | Branch, then default branch |
| `dropped`           | Abandoned                                                   | Home, `backlog/<project>/`  |

"In review" is not a state: it is a `done` record on a branch whose pull request is open. Starting an item moves its
record from the home's backlog into a new branch of the project (workflow, The backlog). A report's project is the home:
its record follows the same states on a branch of the home.

---

## The record

One Markdown file, whose path and branch are named in the core rules (Work items). The identifier is a time in UTC so
that two branches cannot produce the same one; folders by year and month keep each folder small (architecture, Files and
index).

### Front matter

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

### Sections by size

The record template (`templates/record.md`) says, section by section, which sizes keep it and what it holds. What
Verification holds, and how much of each checker report a record keeps, is in the core rules (The record): only
the last report in full, because an earlier one matters only for what it found. A record is as long as its size calls
for, and copies nothing another document holds (core rules, Documents); the checker fails an item whose record is
longer.

### What may not be rewritten

The intent, the scope and acceptance criteria once fixed, and the log: the core rules (The record) say how each is
extended instead.

---

## Procedure

1. **Capture.** A record is created with the intent as the core rules say (The record). It is an `idea` or `ready` in
   the home's backlog, where the hub captures it at once (workflow, The backlog), or it starts at once.
2. **Size and areas.** Proposed from the core rules (Sizes) and the profile's area map.
3. **Start.** A branch is created in the project and the record moves into it; one in the backlog is taken from there
   (workflow, The backlog).
4. **Strategy.** Small: a few lines, then continue. Full: the strategy is written and the item stops for the
   approval, as the core rules say (Sizes; Commits and branches).
5. **Execute.** A worker runs in a worktree, with the core rules, the profile and the packs of the item's areas: a
   session that receives the worker's procedure when it starts, or one started as the worker (`agents/worker.md`).
6. **Verify.** The kit's checks of the record and of the commits run from the kit directory, then the profile's
   verification commands. For small and full items the checker then compares the result with the record and the
   profile's gates, from a fresh context and without write access (`agents/checker.md`).
   A repeated check reads only what changed (`agents/worker.md`, Verification): a full read of a large branch finds
   something new each time, so repeated full reads do not converge, and the first one already covered the branch.
7. **Deliver.** The worker opens the pull request and makes the closing commit (core rules, Delivery; Commits and
   branches). The checks that are wired to the hosting service run on the pull request (workflow, Checks on pull
   requests and on the default branch).
8. **Merge.** The person reviews and merges (workflow, Merging). A project whose profile says that merging deploys is
   deployed by that merge.
9. **Persist.** Specifications affected by the change are updated in the same pull request.

A trivial item goes from step 3 to step 5.

### Parallel work

Independent parts that run at once arrive sooner and cost no more, so nobody has to ask for them; a split is never
forced, since the gain exists only where no coordination is needed. When to split and to fan out is in the worker's
file (`agents/worker.md`). The test, the limits, and how parts and separate requests run are in the skill
`honsha:parallel-parts`, which the worker invokes before it splits an item and the hub before it starts an item in a
project where another runs.

### The backlog

The home's backlog holds the records kept for later: ideas, requests that wait, `ready` items and `dropped` ones, one
file each, `backlog/<project>/<id>-<slug>.md` on the home's default branch. A pull request exists so that the person
reviews a change before it lands. A captured record changes nothing and has nothing to review, and capturing one must
not become a job for anyone: it is the one write that reaches a default branch without a pull request (core rules,
Delivery). Code keeps the exception narrow, not trust.

`hub/backlog.mjs` in the kit, run from the home's folder, does both moves:

- `add <project> <file>` captures a record. It reads the registry from the home's default branch after a fetch, and
  refuses a project that is not there, a file that is not a record of that project in the state `idea`, `ready` or
  `dropped` and named `<id>-<slug>.md`, and a record the backlog holds already. It commits the file in a temporary
  worktree of the default branch's tip, with the trailer `Backlog: <id>`, and pushes it before it returns, so that the
  capture is on the hosting service and the person does nothing for it.
- `take <project> <id>` removes the record in the same way when the item starts, and prints it for the session that
  creates the item in its project.

Neither touches the home's working tree. When a push is refused because the default branch moved in the meantime, the
script fetches and commits again on the new tip. It refuses to push a commit that does anything but add or remove one
file under `backlog/<project>/`.

On the default branch, `node checks/commits.mjs` reads the commits of the first parents: a merge commit, which brings
a pull request whose commits were checked on its branch, and the commits pushed there directly. It accepts a direct
commit only when it carries the `Backlog` trailer and adds or removes exactly the one record that trailer names, and
it fails on any other. This reading assumes that the project merges with merge commits (workflow, Merging): a pull
request squashed or rebased onto the default branch looks like a direct commit. A pipeline that checks the default
branch after each push runs it there.

---

## Stop conditions

The conditions that stop a worker, and what it does then, are in the core rules (Stop conditions). A worker that
stops instead of guessing leaves a choice to the person that only the person can make.

---

## Deferred checks

An acceptance criterion that only a future event can verify does not keep the item open. It is written in `checks` with
a date and what to look at. The scheduler runs it on that date; until an installation has one, the periodic review lists
the checks past their date (`honsha:review`). The outcome is a report in the home, linked to the item. A failed check
creates a new work item.

---

## Lessons

When a lesson is written is in the core rules (Lessons). It goes to the level where it applies, so that it is learned
once:

| Level      | Applies to                              | Example                                                         | Where                                      | How it enters            |
| ---------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ | ------------------------ |
| Project    | This repository only                    | "The `fixtures/` folder is generated: change the generator"     | The file named by `lessons` in the profile | In the same pull request |
| Technology | Every project that uses that technology | "A pushed database migration takes one to two minutes to apply" | Home, `lessons/tech/<technology>.md`       | A work item of the home  |
| Host       | Every session on that machine           | "This shell converts arguments that start with `/`"             | Home, `lessons/host/<host>.md`             | A work item of the home  |
| Kit        | Every user of the kit                   | "Never batch a restart with the edit of the file it loads"      | The kit's rules                            | A work item on the kit   |

- **Loading.** A session receives the project's lessons, the lessons of each technology in the profile's `stack`, and
  the lessons of the host it runs on, whose file is named by the machine's name in lower case. Nothing else is loaded,
  so a project never carries lessons for tools it does not use. A hook of the kit gives each of the three levels when
  the session starts (`hooks/lessons.mjs`). The home's folder on the machine is the plugin's setting `home`, which
  Claude Code asks for when the plugin is enabled and shows among its settings; without it a session receives only
  its project's lessons, and is told why when its profile has a `stack`. A setting that names no folder on the
  machine is named in the same way.
- **Budget.** Each level gives at most 4,000 characters, about fifteen lessons. A level with more gives the lessons
  that fit and names the files it left in part (`hooks/lessons.mjs` says how), and the session tells the person. The
  periodic review answers a level that fills (`honsha:review`).
- **Technology lessons are the cross-project memory.** A lesson learned on one project is available to every other
  project that declares the same technology, from the next session.

---

## Profile

`.hub/profile.yml` in each project. The template `templates/profile.yml` holds every key, with what it holds;
`checks/profile.mjs` reads the keys the kit's scripts use, and refuses a form it cannot read. Per-project customisation
is limited to this file and to the project's own rules. The procedure, sizes, states and record format are not
customised.

---

## Derived views

- **Status of a project:** records on its branches, open pull requests, its entries in the home's backlog.
- **Waiting for the person:** records in `awaiting-approval` or `blocked`, and open pull requests.
- **History:** `done` records on default branches, plus verdicts and reports in the home.
- **Measures:** counts and durations by size, area and model, from front matter.

---

## Commits and branches

The rules on commits and branches are in the core rules (Commits and branches; Delivery). A project adds to them only
in its own rules. What follows is why they are as they are, and what they do not say.

### Commit messages

A message is read as a title in the history; the reasons are in the record, so the message needs no more.

### The trailer

- The trailer goes in the last block of the message. Other trailers, such as the one the platform adds for its
  co-author, can share the block.
- It ties each commit to its record without walking the history:
  `git log --format='%(trailers:key=Work-Item,valueonly)'` prints it. It cannot be added later, because commits are
  never rewritten.
- A commit that the hosting service writes, such as the merge of a pull request, carries none.

### Which commits an item makes

- The two commits of a full item that hold only the record let the approval gate be read from the history.
- The closing commit is made after the pull request is opened, so no commit exists only to write its number.
- A pull request is reviewed as a whole. Fewer commits make the history shorter; the record says what happened in
  between.

### Merging

- With a merge commit, every commit of the item reaches the default branch as it was made, and the default branch
  shows one entry for each item (`git log --first-parent`). Between them stand only the backlog's captures, and the
  check of commits reads that history on the default branch (workflow, The backlog).
- A merged branch left behind shows a finished item among the open ones (workflow, Derived views).
- A project that already merges in another way can keep it. The record still arrives whole and the trailer still ties
  the commits to it; the order of the approval gate is then visible only where the hosting service keeps the pull
  request.

### Keeping a work branch up to date

A work branch does not need to hold the latest default branch: its pull request shows a conflict when there is one. A
conflict that cannot be resolved inside the scope stops the work, as any work beyond the scope does.

### Branches of parallel parts

How the parts of an item (workflow, Parallel work) get their worktrees and branches, and how they are merged back, is in
the kit's skills `honsha:parallel-parts` and `honsha:branch-update`, which the worker invokes when it splits the work
and when it merges the default branch.

---

## The hosting service

The kit does not depend on the service that hosts a project's repository and its pull requests, and its rules name no
service. What is specific to one service is a separate piece of the kit, `services/<name>/`, which a user of another
service replaces with their own. This section says what such a piece holds; `services/github/` is a worked example.

The rules rely on nothing that a service enforces or sells. They hold with a free account, where a service may give
no protection at all: what a service adds beyond that is a further stop, never something a user of the kit must have.

### What the piece of a service says

1. **The commands** that open a pull request, read its number, its state and the results of its checks, and show who
   merged it.
2. **The commands that merge a pull request,** as patterns in `merge-commands.json`, for the guard to refuse (workflow,
   The guard).
3. **The settings the rules rely on:** pull requests are merged with the method the core rules name (Delivery), merged
   branches are deleted, and, where the service has them, alerts on vulnerable dependencies are on without automatic
   pull requests (workflow, Dependencies).
4. **What the service can enforce on its side, and under which conditions:** a default branch that refuses direct and
   forced pushes; a check that must pass before a merge; an identity that can push branches and open pull requests but
   cannot merge.
5. **The wiring of the checks** (workflow, Checks on pull requests and on the default branch), and what it costs on
   that service.
6. **The source of the kit's marketplace** that a repository declares (architecture, Kit), and the command
   that moves a host's registration of it to that source.

### Checks on pull requests and on the default branch

The checks of a project are the ones its worker runs (`agents/worker.md`, Verification, step 1): commands that run
anywhere, a person's computer included. The wiring of a service makes them run on a pull request and on a push to the
default branch. It meets this contract.

1. **When.** On every pull request to the default branch: when it is opened, and at every push to its branch. And on
   every push to the default branch itself, which takes the merges and the backlog's direct commits (workflow, The
   backlog): those commits pass through no pull request, so they are checked there. Every push gets its own run, since
   each checks only the commits it added.
2. **What it runs.** First the kit's checks, from the kit's default branch, or from the branch under check in the kit's
   own repository: the check of the record, on a pull request only, since it belongs to a work branch; the check of the
   commits, and the registry's check where the project's root holds a registry. Then the `verify` commands, as the
   profile writes them. All of them in a clean checkout that holds the history of the branch, and nothing else. On the
   merge of the branch with the default branch where the service offers that, on the tip of the branch otherwise, and on
   the pushed commit for a push; the piece says which.
3. **What it gives the commands.** Three environment variables, because such a checkout is often not on the branch
   itself: `HONSHA_BRANCH`, the name of the branch; `HONSHA_BASE` and `HONSHA_HEAD`, the commit before the first of the
   branch and its last one. On a push to the default branch, the default branch's name, its tip before the push and the
   pushed commit.
4. **What it reports.** For each command whether it passed, with its output, shown on the pull request, or on the pushed
   commit, and readable from the service's command line or interface, so that the hub can pass it on.
5. **What can block.** The piece says whether a failed check can stop a merge on that service, and under which
   conditions. The rules never rely on it: the worker has already run the same commands, and the person merges after
   seeing the result.
6. **What it may not do.** Change the repository, merge, deploy, or hold more than the right to read the repository.

In the kit, `node checks/verify.mjs` runs the `verify` list of a profile; `node checks/commits.mjs` reads the three
variables, also when they name the default branch (workflow, The backlog), and `node checks/record.mjs` reads
`HONSHA_BRANCH`.

### The guard

- A hook of the kit refuses four kinds of shell command in a session: a push to the default branch, a forced push, a
  push that skips the repository's hooks (`--no-verify`), and a command that merges a pull request. The first three
  are plain git and hold on any service. The fourth comes from the `merge-commands.json` of each service's piece.
- The backlog's script (workflow, The backlog) pushes to the default branch from inside the script, the one way there. A
  push to the default branch typed in a session is still refused.
- It matches the text of a command. It stops a mistake. It is not a boundary against a session that was manipulated, and
  a command hidden in a script gets past it: what holds against that is protection on the hosting service, where the
  service gives it.
- It judges a push in the session's folder, or in another repository's when the line begins by moving there in a way
  it can be sure of, which `hooks/guard.mjs` names. Any other line is judged in the session's folder, so that a line
  it cannot follow lets through nothing it would refuse there.

---

## Comments and documents

The rules are in the core rules (Comments; Documents), for code and every other file. A project adds to them only in
its own rules. What the checker reviews of them is in `agents/checker.md`.

### Comments

- A comment that says what the code does goes stale with the code; the reason behind it does not.
- Formatting is the project's choice, with the tools of its stack, and its `verify` list checks it (workflow, Profile).

### Documents

- A document that keeps what was replaced beside the new text has to be read with its history to know what holds.
  Git keeps the earlier wording, and the record of the change says why.
- Naming once the identifier an entry deletes, as the core rules allow, keeps a citation in a record traceable; an
  identifier is never reused for the same reason.
- A rule stated twice drifts: one copy is changed and the other is not. The second document points to the first. A
  record that copies another document grows with every item and says nothing new.
- The records' own rules are given with the record (workflow, The record); a project's earlier documents are listed
  under `legacy` in its profile (`templates/profile.yml`).

---

## Decisions

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
- **The current rules are read from the specifications,** never from a log, so a document states a rule, with its
  reason where the reason helps, instead of citing an entry; for the kit's own documents a gate of its profile checks
  it.

---

## Dependencies

A dependency is code the project runs without having written it. So it is pinned, so that a build installs what was
checked; its known vulnerabilities are looked for and fixed at once; and any other new version waits a few days, so
that a release withdrawn or found compromised early is not taken. The rules are in the skill `honsha:dependencies`,
which a work item invokes when it changes a dependency or answers a vulnerability report. Ordinary updates are left
to the periodic review (`honsha:review`), so that they do not interrupt other work.

---

## Upkeep review

Documents and logs grow by small additions, each reasonable on its own: a rule restated where it is needed, a
paragraph kept after it stopped holding, a record that copies what another document says. Nobody notices while
working, so a review on a date looks for it, together with the radar's dates, the dependencies, the deferred checks,
the lessons and the measures. What it reads and how it reports are in the skill `honsha:review`.

---

## Measures

Each merged item is measured from git, so that later work can be estimated from similar items, and so that a change
that touches more of a project than its kind should shows where the project is too coupled. Nothing is typed by hand
but the kind. `node checks/measures.mjs` in the kit prints them; it is a report and fails nothing.

- **Times,** from commits. Created: the identifier. Strategy and approval: the two record-only commits of a full
  item. Delivered: the closing commit. Merged: the merge commit on the default branch.
- **Intervals.** Agent work: created to delivered, less the wait for approval. Waiting for approval: strategy to
  approval. Review: delivered to merged.
- **Size.** Commits; lines added and removed; existing files changed and new files added, records left out.
- **Kind.** Chosen with the size, from the profile's `kinds`, each with the most existing files a change of that kind is
  expected to touch, or the defaults the profile's template names. New files are not counted: a capability added in its
  own files is the shape that stays easy to change.
- **Sessions.** Where the platform's session files are on the machine, each item also gets the tokens by class and by
  model, and the active minutes, of the sessions and subagents that worked on it. A response belongs to an item by
  the branch `work/<id>-<slug>` it was on; on no work branch, in the project's folder, by the one item whose window,
  from creation to delivery, holds it; otherwise to none. The files' format is the platform's and not documented as
  stable: what cannot be read is counted and reported, and the git measures stand alone. Only sums are printed;
  nothing is stored. An installation that wants a documented source can use the platform's OpenTelemetry metrics.
- **Use.** For estimates, and for finding coupling. They are not a judgement of a session or a person.
- **Limit.** An item is found from its merge commit; a project that merges in another way gets no measures.

---

## Joining an installation

Every project that joins an installation is assessed first (`honsha:assessment`), so that its gaps against the kit's
rules are known, and the work that closes them is chosen by the person, before any other work starts in it.

A project's entry in the home's registry (architecture, Home) says where it stands, and so what work may start in it:

- **`assessing`:** the person has decided that the project joins. Only its assessment runs.
- **`adopting`:** the person has taken the decisions of the assessment's report and chosen its proposed items. Only
  those items start, each with the assessment's identifier as its `source`, in the order the report proposes.
- **`active`:** the kit is declared on the project's default branch, so its sessions run under the core rules. Any
  work item may start; the chosen items left go on as ordinary items.

Entering a project, moving it between states and setting its folder are mechanical, so code does them, not an agent:
`hub/projects.mjs` in the kit, run from the home's folder by the person, the hub or an interface. Each move, and each
change of a folder, is a work item of the home made by code: the script reads the registry from the home's default
branch, creates a work branch from it, and commits the registry's change there with the item's record, leaving the
home's working tree as it is. It never pushes and never opens a pull request; the hub does, with the commands of the
hosting service's piece (workflow, The hosting service). Each holds once the person merges its pull request: a project's
state and its folders are those on the home's default branch.

- `add` creates the assessment's branch, with its record, ready to start, and the entry as `assessing`. The assessment
  runs on that branch, and its pull request carries the entry, so that merging it registers the project. With
  `--assessment <id>` it takes a report already on the home's default branch instead, for a project assessed before it
  was added, in a trivial item of its own.
- `choose`, once the assessment is merged as done and the person has chosen its items, moves the project to
  `adopting`; `refresh` moves it to `active` when its default branch declares the kit. Each makes a trivial item whose
  record the script writes whole, verification and outcome included; the closing commit adds what the pull request
  gives.
- `folder` sets a registered project's folder on the host it runs on, and adds the host when the entry has none: a
  project's clone can move to another folder, and a new host needs a folder for each project. It makes a trivial item
  as a move does, and changes no state.
- `check` reads the registry of a branch of the home, and fails on an entry it cannot read, an assessment with no
  record, or a project past `assessing` whose assessment is not done. The worker runs it in the home with the kit's
  other checks (`agents/worker.md`).
- `may-start` answers, from the home's default branch, whether a work item may start in a project, and is asked
  before one starts, except the assessment that `add` starts: running `add` is the person's decision that the project
  joins, and the assessment runs on `add`'s branch, before its entry reaches the default branch. An assessment of a
  project already `assessing` there, whose `add` was merged before the assessment was done, is asked like any item.

An agent does only the assessment and the items.

A project that is not in the registry gets no work item. An active project can be assessed again when the person
asks; its state does not change.
