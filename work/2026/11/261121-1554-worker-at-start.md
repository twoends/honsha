---
id: 261121-1554
title: Give the worker's procedure to every session of a project that runs as no agent
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked for the record and the strategy of an item on the kit. The worker's file says to run the worker as
the main session of an item, started with `--agent honsha:worker`. A session that the desktop application starts in a
project runs instead with the platform's own system prompt and the core rules that the kit's hooks give at start: the
worker's procedure reaches it only if it reads that file. So the worker's steps, from the gate of the item's size to
the checker and the delivery, depend on a file that the session is not given.

The direction asked for: a session gets its agent's procedure without the user writing instructions. The strategy
weighs the key `agent` in each project's settings, a hook of the kit at a session's start, and any other means; says
what each does to the home, where item `261121-1509` proposes a hook that gives the hub's procedure to a session in the
home's own folder that runs as no agent, so that the two do not collide; and says whether the item fixes a defect or
adds a capability under the installation's decision that holds back new capabilities of the kit, leaving that to the
person, who may prefer to fold this item into `261121-1509`.

Asked on 2026-11-21, through the session that wrote the record of item `261121-1509`, which started the session that
wrote this record.

## Scope and acceptance criteria

### In scope

- A hook of the kit at a session's start that gives the body of `agents/worker.md` to a session of a project that runs
  as no agent and is not the hub's. It is the same script as the hook of item `261121-1509`: one script decides, for
  each session, which procedure it receives, if any.
- `hooks/hooks.json` with its description, the hook's test, and `hooks/hooks.test.mjs` with its total at a session's
  start.
- The description of `agents/worker.md`, which says how the procedure reaches a session.
- The README, the architecture and the workflow, where they say how the worker's procedure reaches a session and on
  which model that session runs.

### Out of scope

- What the worker does: no step of its procedure is added, changed or dropped.
- The hub's procedure, its agent and its share of the hook: item `261121-1509`.
- The key `agent` in any settings file, the kit's and the home's included: none is written.
- How a session is started and on which model: the person's choice in the application, or the hub's when it starts an
  item's session.
- The checker, which already receives the core rules from hooks matched to it alone.

### Boundaries

- A session that runs as an agent, or in the main working tree of a repository holding `registry.yml` at its root,
  receives from this item nothing that it does not receive today.
- One script decides which procedure a session receives; no session receives two.
- The hook's output stays under the limit for one output; the total at a session's start is raised once, by this item,
  with its reason.
- The hook, its test and its fixtures name no user, project, installation or folder of an installation.

### Acceptance criteria

1. A hook at a session's start gives the body of `agents/worker.md`, after a line that names it and the kit directory,
   to a session that runs as no agent (no `agent_type` in the hook's input) and whose folder is not in the main working
   tree of a repository holding `registry.yml` at its root. To a session that runs as an agent, or in such a working
   tree, it gives nothing.
2. When the hook cannot read its input, it gives nothing and tells the person, as the hook of the core rules does for a
   part that it cannot read.
3. The hook's tests cover a project's main working tree, a linked worktree of a project, a linked worktree of a home, a
   home's main working tree, a session running as `honsha:worker` and one running as another agent.
4. If item `261121-1509` is on the default branch when this item is verified, the worker's procedure is a second
   outcome of that item's script, and a test fails when a session would receive both procedures. Otherwise this item's
   script is the one that `261121-1509` extends, and it gives nothing in a home's main working tree.
5. `hooks/hooks.test.mjs` runs the hook: its output stays under the limit for one output, and the start of a session
   that receives the worker's procedure, the lessons and the procedure counted at their budgets, stays under a total of
   29,000 characters, whose comment says why it was raised. What the other hooks give does not change.
6. The description of `agents/worker.md` says that a session of a project receives the procedure at its start, that
   `claude --agent honsha:worker` makes it the system prompt instead, and that it never runs as a subagent. No step of
   its body changes, and it stays within its budget.
7. The README (the row of `hooks/`, "Trying it"), the architecture (Kit, on what a session receives at start; Models)
   and the workflow (Where the rules are; Procedure) say how the worker's procedure reaches a session, and that a
   session that receives it by the hook runs on the model it was started with.
8. In a scratch repository, with `claude -p --plugin-dir` on this branch: a session in its main working tree and one in
   a linked worktree of it hold the worker's procedure in their context; with `--agent honsha:worker` the worker's file
   is the system prompt and the hook adds nothing; in a scratch repository holding `registry.yml`, a session in its own
   folder holds none.
9. `checks` declares what only the merged kit can show: a session that the desktop application starts in a worktree of
   a project holds the worker's procedure from its first message, and holds it again after a compaction.
10. The profile's `verify` passes.

## Strategy

**Defect or capability.** This strategy reads the item as a defect fix, kind `fix`. The kit specifies one worker per
item (workflow, Procedure; architecture, Dispatch) and keeps in the worker's file what no other file holds: which of
the kit's checks run and from where, the checker's two input files and the repeated check, the skills an item calls
for and the packs of its areas, the order of the delivery. The sessions that do the work are started in ways that run
no worker: by the desktop application, and by the means that a session there has to start another, which takes a
folder, a model, an effort and a preset, and no agent. This record's own session is one of them. The item gives an
existing procedure to the sessions it was written for, by the means that already gives them the core rules, and adds no
verb, step or rule. By the letter of D87 of the installation, which holds back new capabilities of the kit until the
first phase of its plan is done, a new hook can be read as a new mechanism. The person decides among:

- this item now, on its own, kind `fix`;
- folded into item `261121-1509`, whose hook then gives either procedure: that item's criteria on the hook, the
  budgets and the trial widen to the worker's case, and this record becomes `dropped`, pointing to it;
- after phase 1, kind `capability`.

This item does not depend on `261121-1509`: its hook gives nothing in a home's own folder, whatever instructs the hub
there, so it can land before, after or without that item.

**What the platform offers.** The probes of item `261121-1509` (its record, "What the platform offers, verified")
show, on Claude Code 2.1.325 with `claude -p`: the key `agent` of a project's settings makes the main thread that
agent, whose file replaces the platform's system prompt; the kit's hooks at a session's start still run and `CLAUDE.md`
still loads; the hook's input names the agent in `agent_type`; `--agent` wins over the key. By the documentation, a
session in a worktree that the desktop application makes reads its settings from the main checkout's root, and the
hooks at a session's start run again after a compaction. Not verified: whether the desktop application honours the
key, and whether an agent's prompt keeps what the application adds to the platform's. Seen in this session: the desktop
application runs the kit's hooks at a session's start, since the core rules arrived through them, and a session that
it starts in a worktree is on a branch that the application names, not yet on the item's.

**Ways weighed.**

- **The key `agent`,** set to `honsha:worker` in each project's settings. It cannot serve the home: one settings file
  reaches every session of the home, the hub's in its own folder and its items' in worktrees, so the home either makes
  its hub a worker or leaves its items without the procedure, and a second means is needed there anyway. In every
  project it makes each session the worker, one opened for a question included, in place of the platform's prompt and
  perhaps of what the desktop application adds to it; whether the application honours the key is unknown. It is also
  a line that each installation writes into each project, and that the kit would then have to check. Its gains, the
  procedure as a system prompt and the agent's model, do not outweigh that.
- **A hook of the kit at a session's start** (proposed): it gives the worker's procedure to a session that runs as no
  agent and is not the hub's. Nothing is written in a project or in the home; the platform's prompt stays; the core
  rules already reach sessions this way, in the desktop application too. The condition is not narrowed to a work
  branch or a linked worktree: at its start a session in a worktree is on a branch that the application names, and a
  session in a project's own folder that is asked for a change follows the same procedure, since every change is a
  work item. A narrower condition would spare context only to sessions that do no item, and would miss some that do.
- **Other means.** A skill holding the procedure, named by a line of the core rules, enters only when it is invoked:
  nearly every session of a project runs an item and needs the procedure before its first change, so the saving is
  small, and the step that can be missed is the defect itself; the agent's file and the skill would also hold the same
  text, unless the agent preloads the skill, which is not verified for a main-thread agent. The procedure as a fifth
  part of the core rules would reach the hub and every agent's session too. A pointer to the worker's file, in the core
  rules or in a project's `CLAUDE.md`, needs a permission to read the kit directory (architecture, Kit), and a
  project's `CLAUDE.md` is the installation's to write. An output style that the plugin forces applies to every
  session, the hub's included; one that a project's settings choose reaches every session of the project, as the key
  does.

**The home, and item `261121-1509`.** One script decides, for each session at its start, which procedure it receives:
none to a session that runs as an agent, whose file is already its system prompt; the hub's to one in the main working
tree of a repository holding `registry.yml` at its root (`261121-1509`); the worker's to any other. A test runs it for
each kind of session and fails when one would receive both. In the home, a session in the home's own folder receives
the hub's procedure, or, before `261121-1509`, nothing from this hook, the home's `CLAUDE.md` instructing it as today;
every session that the hub starts in a worktree of the home, for an item of the home, receives the worker's. No key
`agent` is written anywhere. The two items change the same script, `hooks/hooks.json` and `hooks/hooks.test.mjs`:
whichever lands second merges the default branch and adds its procedure to the script (skill `honsha:branch-update`).
The script is `hooks/procedure.mjs`, unless `261121-1509` lands first with another name. If the person folds this item
into `261121-1509`, that item takes the worker's share as an addendum, and the script is written once.

**What the hook gives.** The body of `agents/worker.md`, without its front matter, after a line that names the file
and the kit directory, as the hook of the core rules does: the procedure's commands name `<kit directory>`, and hooks
of one event come in no stated order, so the output says by itself what it is. The procedure stays in the agent's file
alone, so that `claude --agent honsha:worker` runs the same text as the system prompt, with the agent's model.

**The model.** A session that receives the procedure by the hook runs on the model it was started with, not on the
agent's `model: opus`: the person chooses it in the application, and the hub, when it starts an item's session, gives
it its own model or one that it names. The architecture's Models section says so, beside the rule that a model given
when a session is started overrides the definition.

**Budgets.** Today a session receives 10,424 characters of core rules and template and, with the lessons at their
budget, 22,424 of the total of 25,000. The worker's procedure is 4,712 characters without its front matter, under the
budget of 5,800 that its file keeps. The total becomes 29,000: the procedure counted at its file's budget, with its
line; if the hub's agent lands with the 6,000 that `261121-1509` proposes, the larger of the two counts, since a session
receives one. The comment says why: every session of a project that runs as no agent pays it, as a session started as
the worker pays the same file as its system prompt.

**What stays to try.** After the merge, in the desktop application (criterion 9). If the application started its
sessions as an agent, the hook would give them nothing; this session's prompt is the platform's own, so it starts them
as none.

**Commits.** The work in one commit: the script and its test, `hooks/hooks.json`, `hooks/hooks.test.mjs`, the worker's
description and the documents; then the closing commit.

**Risks.**

- Every session of a project that runs as no agent pays about 5,000 characters more at its start, those that only
  answer a question included: the price of having the procedure before the first change.
- Context weighs less than a system prompt. The core rules reach every session the same way and are followed;
  `--agent honsha:worker` gives the stronger form wherever a session can be started so.
- A session started as an agent of the person's own receives no procedure: whoever chose the agent chose its procedure.
- A repository holding `registry.yml` at its root is taken for a home, as `261121-1509` and the kit's checks already
  take it.
- Until this item is merged, the sessions that the desktop application starts go on without the procedure unless they
  read the worker's file, as this record's session did.

**Alternatives left out.** The key `agent`, a skill, a fifth part of the core rules, a pointer to the file and an output
style, for the reasons above.

**Parallel parts.** None: one hook, its test and the documents that name it are one concern. The default model is
enough.

**Measures.** Six existing files against the four of `fix` (three of `capability`): `hooks/hooks.json`,
`hooks/hooks.test.mjs`, `agents/worker.md`, the README, the architecture and the workflow, with two new files, the
script and its test. The measure will mark the item over its kind's expectation, for that reason.

## Approval

Approved by the person on 2026-11-21, in the chat of the session that wrote the strategy: this item now, on its own,
as a defect fix of kind `fix`.

## Log

- 2026-11-21: the branch is cut from the default branch after a fetch, at `b26e7bc`, the merge of pull request 39.
  Read the record of item `261121-1509` on its branch, and measured what a session receives at start from the kit's
  hooks (Strategy, Budgets). The means of starting a session that this session's tools offer take no agent.
- 2026-11-21: approved; the work starts. Item `261121-1509` is not on the default branch, nor pushed, so this item's
  script is the one that item extends (criterion 4): `hooks/procedure.mjs` returns the file of the procedure a session
  receives, the worker's or none, and gives nothing in a home's main working tree.
- The main working tree is told from a linked worktree by git, `rev-parse --path-format=absolute` of the git
  directory and the common one, which are the same only in the main working tree; a folder outside a repository, or
  one that git cannot read, is no home's. An input that is not a JSON object gives nothing and a message, with exit
  code 1, as the hook of the core rules does for a part it cannot read.
- The hook gives the worker's file without its front matter, after a line naming `honsha:worker`, the file and the kit
  directory, read from the file's `name`. It is the fourth kind of hook at a session's start, so the test that nothing
  else starts there counts it.
- `hooks/hooks.test.mjs` counts the procedure at its file's budget, which it reads from `checks/budgets.test.mjs`, so
  that the number is stated once. Measured in this worktree: 10,424 characters of rules and template, 12,000 of
  lessons at their budget, a line of 196 and the budget of 5,800, 28,420 against the total of 29,000. The hook's whole
  output is 4,907 characters, under the limit for one output.
- The worker's description, the README's row of `hooks/` and "Trying it", the architecture's Kit and Models, the
  workflow's "Where the rules are" and Procedure say how the procedure reaches a session and on which model it runs.
  The worker's file is 5,034 characters, within its budget of 5,800; no step of its body changed.
- Trial of criterion 8, Claude Code 2.1.325, `claude -p --plugin-dir` on this branch with `--output-format stream-json
  --verbose --include-hook-events`, whose events carry each hook's output, in scratch repositories in the scratchpad,
  each with a linked worktree, one of them holding `registry.yml`. Nine hooks answered at each start, all with exit
  code 0. A session in the project's main working tree, in its linked worktree and in the home's linked worktree:
  one output held the worker's procedure, and the session said it held it. A session in the home's main working
  tree: none held it, and the session said so. A session with `--agent honsha:worker`: none held it; the session said
  its system prompt holds the worker's opening sentence and not the platform's instructions.

## Verification

## Outcome
