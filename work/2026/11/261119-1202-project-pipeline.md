---
id: 261119-1202
title: Let a project's pipeline run the kit's checks with its own
project: honsha
type: change
size: full
kind: capability
state: awaiting-approval
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: null
model: null
effort: high
checks: []
---

## Intent

The person asked, for finding 4 of the home's assessment `261118-2152`, that the home has no pipeline (its decision
D80), to bring in every check from the start: a pipeline that runs on the home's pull requests the kit's checks of
the record and of the commits, the registry's check, and the profile's `verify`. The kit's wiring today runs only the
kit's own checks on the kit, and a project has no way to run the kit's checks in its pipeline: this item gives it one,
and the home's own item wires it once this one is merged. Asked on 2026-11-19, in the chat of a session, answering
finding 4 of that assessment.

## Scope and acceptance criteria

### In scope

- The workflow's section 14.2: the wiring runs the kit's checks, as the worker does (`agents/worker.md`,
  Verification, step 1), then the `verify` commands.
- The GitHub piece: a reusable workflow in the kit that a project's workflow calls, and the section of
  `services/github/README.md` that says how a project wires it and what it costs.
- How the pipeline of a project reaches the kit's repository while that repository is private.

### Out of scope

- The home's own workflow file and the end of its decision D80: an item of the home, after this one is merged.
- The kit's own pipeline, `.github/workflows/verify.yml`, which already runs the kit's checks through its profile.

### Boundaries

- The workflow's token keeps read access to the contents and nothing else (section 14.2, item 6).
- A project's pipeline uses the kit as its sessions do: the kit's default branch.
- The kit's rules name no hosting service.

### Acceptance criteria

1. Section 14.2 says that the wiring runs the kit's checks of the record and of the commits, and the registry's check
   where the project's root holds a registry, before the `verify` commands.
2. A project wires the checks with one short workflow file that calls the kit's reusable workflow; the piece shows it.
3. The reusable workflow runs those checks and the project's `verify` on a project's pull request. Only a project's
   item can try it after this one is merged, so it is a deferred check, read on the home's first pull request that
   calls it.
4. The kit's own pipeline still passes.
5. The profile's `verify` passes.

## Strategy

The kit's repository is private, and a pipeline of another repository cannot read it with its own token. Two ways:

- **A. The kit's repository becomes public** (recommended). It already counts as public from its first commit, and
  the pre-push hook keeps anything personal out of it, so nothing new is exposed. A public repository is read by any
  pipeline with no secret, its own pipeline's minutes become free, and branch protection becomes available to it. The
  person makes the change on GitHub, or tells the session to run `gh repo edit twoends/honsha --visibility public`
  with the confirmation GitHub asks for; the session does not do it on the approval of this strategy alone.
- **B. A token per project.** A fine-grained token of the person's account, read-only on the kit's contents, stored as
  a secret in each project. Each project carries a secret, which expires and is renewed by hand, and the reusable
  workflow must also be shared from the private repository in its settings.

With A or B, the work is the same:

1. `.github/workflows/project.yml` in the kit, called with `workflow_call`: it checks out the project's pull request
   with its whole history and the kit's default branch beside it, sets up Node.js 26, installs the project's tools
   from its lockfile without install scripts when it has one, and runs `checks/record.mjs`, `checks/commits.mjs`,
   `hub/projects.mjs check` when the project's root holds `registry.yml`, and `checks/verify.mjs`, with the three
   variables of section 14.2. Linux only: the matrix of two systems is the kit's need, not a project's. Actions pinned
   to a commit, as in `verify.yml`.
2. Section 14.2 and the piece's "Checks on a pull request" and "What it costs": the kit's checks first, then the
   profile's commands; the project's caller file, about ten lines.
3. Before that, the kit's own pull request runs the reusable workflow once on the kit itself, through a caller job in
   `verify.yml`, so that the workflow is known to run before any project calls it.

Assumption: GitHub lets a private repository call a reusable workflow of a public one with no setting; checked in
GitHub's documentation before the work starts.

Risks: a change to the kit's default branch reaches every project's pipeline at once, as it reaches every session.
Cost: one full item, plus the person's change of visibility.

## Approval

## Log

## Verification

## Outcome
