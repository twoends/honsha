---
id: 261120-1012
title: Let the registry's script change a project's folder on a host
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked for a command in the kit to correct the home's registry, which gives the kit a folder that no longer
exists on this host: only `hub/projects.mjs` writes the registry, and it has no command that changes a project's
folder. The same command gives a project its folder on a new host. Asked on 2026-11-20, in the chat of a session,
choosing a command in the kit among the ways offered to correct the registry.

## Scope and acceptance criteria

### In scope

- A command of `hub/projects.mjs` that sets the folder of a registered project on the host it runs on, as a move:
  a work item of the home made by code, like `choose`.
- Its test, in `hub/projects.test.mjs`.
- The workflow's section 20, which lists the script's commands, and the script's own list of them.

### Out of scope

- Running the command in the home to correct the kit's folder: once this is merged, the hub runs it, and the item it
  makes is the home's.
- The home's `CLAUDE.md`, which names the commands the hub runs: a home item, after the merge.
- Checking that a folder holds a clone of the project's repository: `add` does not either, and the person merges
  each move after reading it.
- Removing a host's folder from an entry.

### Boundaries

- The registry is still written only by the script, in the shape it reads back.
- No other command changes its behaviour, and no state of a project changes.

### Acceptance criteria

1. `node <kit>/hub/projects.mjs folder <name> <folder>`, run from the home's folder, reads the registry from the
   home's default branch, sets `<folder>`, resolved to an absolute path, as the project's folder on this host, adding
   the host when the entry has none, and commits that change with a trivial record on a new work branch of the home,
   leaving the home's working tree as it is.
2. It refuses a project that is not in the registry, a folder that is not the folder of a git repository, and a
   folder that the entry already gives on this host, and then commits nothing.
3. A test covers the change of a folder, the addition of a host, and each refusal.
4. The workflow's section 20 and the script's list of commands name it.
5. The profile's `verify` passes.

## Strategy

The command follows `choose`, the move it most resembles: it reads the registry from the home's default branch with
`commitFiles`, changes the one entry, and hands the result to `commitMove`, which checks the registry it would hold,
commits it with the record that `moveRecord` writes in a temporary worktree, and pushes nothing. The record is trivial
and of kind `upkeep`, as for every move, and the slug is `folder-<name>`. The folder is checked as `add` checks it, a
`.git` inside it, and stored as `add` stores it, with `path.resolve`; the host is `os.hostname()`, as for every move.

It is named `folder`: section 20 calls the changes of state "moves", and a folder is not a state.

This is a change to the script's interface, so the item is full. Under the home's freeze of new capabilities it is a
fix: the registry cannot follow a project's folder once it moves, which leaves the kit's entry wrong today and would
leave every entry without a folder when the hub moves to its own host.

Risk: a folder given by mistake is committed as given; the person reads the record and the registry's change before
merging, as for `add`. The default model is enough: the change is one branch of `run` and its test.

## Approval

Approved by the person on 2026-11-20, in the chat of the session that wrote the strategy.

## Log

- `may-start honsha`: yes. Branch cut from the kit's `main` at `3339df0`.
- `hub/projects.mjs`: the command `folder`, after `refresh`, with the usage line, the list of commands and the header's
  account of the commands that commit a work item. It refuses before `taken` is asked, so a refusal never says that
  an item exists already.
- `hub/projects.test.mjs`: one test, with two clones of a project; the second run of `folder`, on another host, starts
  from the default branch, where the first branch is not merged, so it shows the host added beside the first.
- Workflow, section 20: the paragraph on what code does names the folder, and the list of commands has `folder`.

## Verification

## Outcome
