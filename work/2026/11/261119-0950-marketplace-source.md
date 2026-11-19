---
id: 261119-0950
title: One source for the kit's marketplace on every host, the kit's own clone included
project: honsha
type: change
size: full
kind: flow
state: awaiting-approval
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked to solve now, rather than later, a problem met while declaring the kit in a project, since it would
come up sooner or later anyway: on a host where the kit is cloned, the marketplace `honsha` is already registered from
the clone's folder, so a project cannot declare it from the kit's repository. Asked on 2026-11-19, in the chat of a
session, answering whether to handle that problem now.

## Scope and acceptance criteria

### In scope

- How a project declares the kit, the kit's own repository included, so that one host gives the marketplace one
  source.
- The kit's `.claude/settings.json`, its README, the architecture (3.1, 3.3) and the piece of the hosting service.
- How a session on a branch of the kit runs under the kit as that branch holds it, where it needs to.

### Out of scope

- The home's declaration of the kit: its own item, `261119-0904` of the home, which resumes with what this item
  decides.
- O10, versions of the manifests.

### Boundaries

- The rules name no hosting service: the source type of a service goes in its piece.
- No setting of a user or a host is committed.

### Acceptance criteria

1. The architecture states one way for every repository to declare the kit, with the reason, and the piece of the
   hosting service gives the declaration as JSON.
2. The kit's `.claude/settings.json` declares `honsha` from its repository on the hosting service, with automatic
   updates, as a project does.
3. The README says how a session runs under an unmerged change of the kit, and what a host does once to move a
   registration made from a folder.
4. The kit's `verify` passes.
5. A deferred check: the first session in the kit's clone after the merge receives the core rules, and the host lists
   `honsha` from the repository.

## Strategy

### Facts it rests on

- A host registers one marketplace for a name, for every project (platform documentation, marketplace reference and
  plugin loading).
- Adding `honsha` from another source replaces the registration for every project: tried on 2026-11-19 with the
  command line.
- A settings file of a project outranks the user's, and its entry for a marketplace replaces a lower one whole.
- A project's marketplaces and plugins apply only in a folder whose trust was accepted; a `claude -p` run in another
  folder ignores them.
- A marketplace entry takes `autoUpdate: true`, which refreshes the marketplace and its plugins after startup; a
  third party's default is off.
- A plugin's relative source cannot leave its marketplace's folder, and no setting loads a plugin from a folder
  without a marketplace; `claude --plugin-dir <folder>` loads one for a session.
- The kit declares itself today as `{ "source": "directory", "path": "." }`, so every session in a clone runs the kit
  as the clone holds it, whatever branch is checked out.

### Design

- **One declaration everywhere.** Every repository that runs under the kit, the kit's own included, declares
  `honsha` from the kit's repository on the hosting service, with `autoUpdate: true`. A host then has one source for
  the name, the same on every host, and every project gets the kit as merged into its default branch.
- **A session works under the rules in force.** A session on a branch of the kit runs under the merged kit, not under
  the change it is making, as any project's session does. Where a change to the rules, a hook or an agent must be
  tried before it is merged, the session starts with `claude --plugin-dir <the clone>`, which the README already
  names.
- **The service's piece holds the JSON.** The architecture says what a declaration does; `services/github/README.md`
  gives `{ "source": "github", "repo": "<owner>/<repository>" }`.
- **Moving a host.** A host that registered `honsha` from a folder runs once
  `claude plugin marketplace add <owner>/<repository>`; the README says so.

### Plan

1. The kit's settings, the architecture, the service's piece and the README.
2. The verification, the checker, the pull request; the deferred check in `checks`.
3. After the merge, on this host: move the registration, open a session in the kit's clone and in the home, and read
   that the rules arrive. Then the home's item resumes.

### Risks

- A session of the kit no longer sees an unmerged change to the rules unless started with `--plugin-dir`; an item
  that changes a hook is tried that way.
- Automatic updates bring every merge of the kit to every project at its next session. That is what the kit's
  manifests without a version mean already (O10).
- Until the kit's clone checks out a commit with this change, a session in it declares the folder, which outranks the
  registration and may move it back.

### Measure

1 to 2 times a full item at the kit's medians: 10 to 20 minutes of agent time, 60,000 to 120,000 output tokens. It
rests on platform behaviour read in the documentation and only partly tried.

### Decisions for the person

1. **The design.** Recommended: one declaration from the repository everywhere, the kit included, as above. The
   alternative keeps the kit's clone as the source on a host and has each project declare the kit only in its
   untracked `.claude/settings.local.json`, by host; it keeps the kit's sessions on their branch's rules, but every
   clone of every project needs a hand-written file, and a fresh clone runs without the kit.

## Approval

## Log

- 2026-11-19: branch cut from `main` at `61f8453`. Facts read in the platform's documentation, and tried with the
  command line on throwaway marketplaces. One trial also added `honsha` from the repository and so moved this host's
  registration away from the clone's folder, which is how the second fact above was seen; it was put back at once,
  with the user settings as they were.
