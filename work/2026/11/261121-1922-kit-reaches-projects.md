---
id: 261121-1922
title: Give the kit to every session of a registered project from its first item, on a fresh base
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

The person asked to start on the two defects that a readiness review found before the first real project joins. This
item is the first. A project's sessions get the kit only once the plugin is installed in that clone, and nothing tells
the hub or the person to do it. So while a project is adopting, its items, the one that declares the kit first, run
with no core rules, no procedure and no guard, under the project's own older instructions. The pilot's `.gitignore`
ignores the whole `.claude/` folder, so the declaration cannot be committed as it is. `refresh` marks a project active
from its settings on the hosting service, not from whether its sessions get the kit. And sessions work from bases that
nobody brings up to date: the main folders of the home and of the projects. Asked on 2026-11-21, in the session of the
readiness review.

## Scope and acceptance criteria

### In scope

- How the plugin reaches a host and a project's sessions: the design the person chooses from the strategy.
- What makes a project `active`, and `refresh` with it.
- Fresh bases: the branch of an item, the checker's comparison and the hub's reading of the home, from the default
  branch as the hosting service holds it.
- What a project must ignore for the platform's worktrees and the checker's input files, in the assessment.
- The documents that describe installing the kit, declaring it, the states and the worker's start: the README, the
  interface, the GitHub piece, the architecture, the workflow, the hub's, the worker's and the checker's files, and the
  assessment's skill.

### Out of scope

- The other defect, preparing a fresh checkout: item `261121-1920`.
- The guard's gaps, the plugin's place in the repository, the measures and records in other languages: later items.
- How the hub starts a session in a project: a later item.
- The home's own files: a work item of the home after this one, if the chosen design changes them.

### Boundaries

- No session that gets the kit today, in the kit's clone or in the home, loses it.
- Outside the home and the projects it registers, the kit changes nothing in a session.

### Acceptance criteria

The criteria are those of the recommended design, A; if the person chooses B, they are rewritten before the approval.

1. The hooks give the core rules, the template, the lessons and the procedure, and the guard judges commands, only in a
   session whose `cwd` is in the home's main working tree or one of its worktrees, or in the folder that the home's
   registry gives a project for this host, or one of that folder's worktrees. Anywhere else they give nothing and let
   every command through. With tests, the guard's included.
2. The registry is read from the home's default branch as last fetched. When the home or its registry cannot be read,
   the hooks that give context say so in one line, and the guard judges the command as in a project.
3. Installing the kit is one step per host, written in the README and the interface: the plugin installed for the
   user, with the setting `home`. No project holds a file for the kit, and the kit's own `.claude/settings.json` no
   longer declares it.
4. A project is `active` once every item chosen from its assessment is merged as `done`; `refresh` reads that from the
   records on the project's default branch, and no longer reads its settings; with tests.
5. The worker cuts an item's branch from `origin/<default branch>` after a fetch; the checker's two input files compare
   with it; the hub fetches the home before it reads the decisions and the registry.
6. The assessment checks that the project ignores the platform's worktrees and the checker's input files, and proposes
   the change when it does not.
7. Live run in the scratchpad, with the plugin given by `--plugin-dir` and a scratch home whose registry names a scratch
   project: a session in an unregistered folder gets nothing and can push to its `main`; one in the project's folder and
   one in a worktree of it get the rules and the worker's procedure, and the guard refuses a push to `main`; one in the
   home gets the hub's procedure.
8. The documents say what holds now; the profile's `verify` passes.

## Strategy

**What the platform does** (Claude Code documentation, read on 2026-11-21):

- A plugin that a project's `.claude/settings.json` enables does not load until each user installs it in that clone.
- A plugin installed for the user is enabled in every project of the machine, and its hooks run in every session;
  nothing limits them to some folders, so only the hook can decide from its input's `cwd`.
- A session that the desktop app starts in a worktree reads settings, hooks, skills and agents from the main checkout,
  and gives the worktree's path as `cwd`.

**Design A, recommended: the kit for the user, active where the registry says.** Install the plugin once per host at
user scope. Each hook first finds whether the session's folder belongs to the home or to a project that the registry
gives this host a folder for, its worktrees included through git's common directory, and gives nothing otherwise.

- One step per host instead of one per clone, and the same step on a new host, after `folder`.
- A project carries no file for the kit, so neither its `.gitignore` nor a pull of its main folder matters.
- A project gets the kit from its first item after `add` is merged: the items of `adopting` run under the rules and
  the guard.
- The registry already holds which folder is which project on which host, so nothing new is declared.
- `active` can no longer mean "declares the kit". It becomes "the items chosen from its assessment are merged", which
  the records show.

**Design B: the kit per clone, installed by the hub.** Keep a project's declaration. The hub installs the plugin in the
project's clone for the local scope at `add` and at `folder`, before any item; the declaration item commits it for the
project, with `.gitignore` exceptions; `refresh` checks the declaration on the default branch as today. B changes less
and keeps the kit visible in each repository. But it is a step per clone and per host that someone has to remember,
and the project's files must change to adopt the kit, which is what the person objected to.

**Fresh bases.** Whatever the design: the worker fetches and cuts the item's branch from `origin/<default branch>`,
since a worktree may start from a main folder that lags; the checker's files compare with the same ref; the hub
fetches the home before reading `decisions.md` and the registry, and reads them from that ref. On the always-on host
(architecture, Key facts) nobody works in the main folders, so without the fetch every base would lag.

**The cost of A in every session.** Each of the nine hooks at a session's start spends a git call or two to find the
folder's place, about 30 ms each as measured on Windows. On the always-on host, whose dedicated user (architecture,
Security) runs only Honsha's sessions, every folder is the home's or a project's, and the test only confirms it. On a
personal computer, where an installation can run first (architecture, Key facts), the cost also falls on the person's
other sessions, and there the test is what keeps the kit out of them. The guard runs before each shell command
everywhere, so its first test is the cheapest: a folder outside every registered one ends the hook before it parses
the command. The plugin's skills and agents are listed in every session, a few hundred tokens of descriptions; the
platform gives no way to hide them.

**Measures.** About fourteen existing files against the four of `fix`: the change reaches every document that says how
the kit is installed and declared.

**Risks.**

- A wrong decision about the folder silences the kit in a project: the tests cover the home, its worktrees, a
  project's folder, its worktrees and a folder outside, on Windows and Linux paths.
- A home that cannot be read: the hooks say so, and the guard judges as in a project.
- A user-scope install is per user: a second person on the same repository gets no kit, which this installation does
  not have.
- D87 of the installation allows the item, which fixes a defect found before the pilot.

**Order.** This item and `261121-1920` both change the worker's start and the GitHub piece: the one merged second
merges the default branch first.

**Parallel parts.** None. The default model is enough.

## Approval

Approved by the person on 2026-11-21, with design A, in the chat of the session that wrote the strategy.

## Log

- 2026-11-21: before approving, the person asked whether the item is needed when the installation's goal is the
  always-on host. Every part is needed there too, the fresh bases more than on a computer; only the registry's test
  and the cost in other sessions concern a personal computer. `6598c72` added that to the strategy.

## Verification

## Outcome
