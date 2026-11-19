---
id: 261119-1202
title: Let a project's pipeline run the kit's checks with its own
project: honsha
type: change
size: full
kind: capability
state: done
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: 28
model: claude-opus-5-5
effort: high
checks:
  - { due: 2026-11-26, what: "On the home's first pull request whose workflow calls project.yml: the job ran the record check, the commits check, the registry check and every `verify` command of the home's profile, each with its result in the log, and `gh pr checks` shows it" }
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

Approved by the person on 2026-11-19, in the chat of the session that wrote the strategy, in one approval for the
items `261119-1200`, `261119-1201` and `261119-1202` as their strategies are
written, each with the design its strategy recommends. The change of the kit repository's visibility is not part of this approval: the person makes it, or asks for it in words of its own.

## Log

- 2026-11-19: branch at `5c10e7f`, the approval. No areas, so no pack to load.
- The assumption, read in GitHub's documentation before the work:
  - "Reusing workflow configurations", Access to reusable workflows
    (docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations): a workflow can use a
    reusable workflow of the same repository, or of a public repository; one of a private repository only when that
    repository's Access setting allows it. Its table gives a private caller access to private and public repositories.
    The caller's Actions permissions must allow reusable workflows; "Managing GitHub Actions settings for a repository"
    says Actions is enabled by default, and then workflows may use reusable workflows of any public repository. The
    assumption holds.
  - The same page: the `github` context of a called workflow is the caller's, so `github.head_ref` and
    `github.event.pull_request` hold the project's pull request; the token's permissions can only be lowered by the
    called workflow; billing for GitHub's runners goes to the caller; the same concurrency group in caller and called
    workflow cancels the running one, so project.yml declares none.
  - "Contexts" (docs.github.com/en/actions/reference/workflows-and-actions/contexts): `job.workflow_repository` and
    `job.workflow_sha` name the repository and commit of the file that defines the job, and its example checks out a
    reusable workflow's own repository with them; the `job` context is available in a step's `with`.
  - Checking out the kit with the caller's token: "GITHUB_TOKEN"
    (docs.github.com/en/actions/concepts/security/github_token) says its permissions are limited to the workflow's
    repository and says nothing of other public repositories.
    The README of `actions/checkout` (github.com/actions/checkout) says the default token is scoped to the current
    repository, "so if you want to checkout a different repository that is private you will need to provide your own"
    token, and its side-by-side example checks out another repository with the default token. So a public kit is
    read with no secret; GitHub's documentation does not state it in so many words, and only the deferred check
    shows it on a project.
- `.github/workflows/project.yml`: called with `workflow_call`; checks out the project in `project/` and the kit in
  `kit/`, side by side so that a project's formatter or linter run on `.` never reads the kit's files; the kit from
  `job.workflow_repository` at `job.workflow_sha`, so that the checks and the file that runs them come from one
  commit: the kit's default branch for a project, whose caller names it, and the pull request for the kit's own run.
  Node.js 26, `npm ci --ignore-scripts` when `package-lock.json` is there, then the record check, the commits check,
  the registry's check when `registry.yml` is there, and `checks/verify.mjs`, from the project's folder, with the
  three variables. Linux only, `permissions: contents: read`, the same pinned commits as `verify.yml`, no token left in
  the git configuration, a limit of 20 minutes.
- An optional input `claude-code`, a version of Claude Code to install: the kit's profile runs
  `claude plugin validate .`, so the kit's own run of project.yml needs it (see Deviations).
- `verify.yml`: a second job, `project`, calls `./.github/workflows/project.yml` with the same Claude Code version as
  the first. Called from the same repository it is allowed whatever the visibility, and the kit's own token reads the
  kit, so it runs while the kit is private and after.
- WORKFLOW.md section 14.2: the checks are the worker's (Verification, step 1); item 2 runs the kit's checks first,
  then `verify`. Section 20.1, item 2, which said the pipeline runs the `verify` commands, now points to section 14.2.
- `services/github/README.md`, "Checks on a pull request": the project's caller file in full, how the kit is read and
  why a project needs the kit public, what project.yml runs; "What it costs": one Linux job, counted to the account
  that owns the calling project.

- 2026-11-19, after the checker's first report (verdict fail): section 14.2 says that the kit's own repository runs
  the kit's checks from the branch under check, as its wiring does; the `verify` job's checkout of `verify.yml` leaves
  no token in the git configuration either, as the piece says of both checkouts; the change to `verify.yml` is
  written under Deviations. The empty Verification was the caller's omission: it is written before the repeated
  check.

## Verification

On `8f6c07d`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.

### Earlier checker report

On `5dbd143`, a full check.

**Verdict:** fail

**Findings**

1. "Verification" in the record is empty (lines 146-147). `agents/worker.md`, Verification, step 1 has each command and its result written there, uncommitted, before the checker is called. The working tree was clean, so none of the 7 `verify` commands appears with its result.
2. `.github/workflows/verify.yml` is out of scope (record line 44), yet the diff changes it (verify.yml:1-2, 53-60). "Deviations" does not declare this. Strategy step 3 asks for the change but does not lift the out-of-scope entry.
3. `services/github/README.md:165-166` says the checkouts leave no token in the git configuration. The kit's `verify` job checkout (`.github/workflows/verify.yml:40-42`) keeps the action's default `persist-credentials`, so the statement does not hold for the kit's wiring that the README describes.
4. `docs/01-specs/WORKFLOW.md:445` requires the kit's checks "from the kit's default branch". The kit's own wiring runs them from the pull request (`services/github/README.md:151`), yet README line 146 says it answers the contract. Section 14.2 and the kit's own wiring disagree.

### Checker report

On `8f6c07d`, a repeated check of the changes since `5dbd143`.

**Verdict:** pass

This was a repeated check. It read the diff since `5dbd143` (commit `8f6c07d`) and the record's uncommitted Verification.

**Earlier findings**

1. Empty Verification: resolved. The record's Verification now lists all 7 `verify` commands with their results on `8f6c07d`, including `checks/record.mjs` and `checks/commits.mjs`.
2. `verify.yml` changed while out of scope and not declared: resolved. The second entry under Deviations declares it.
3. README says no token is left in the git configuration, but `verify.yml`'s checkout kept it: resolved. `.github/workflows/verify.yml:43` now sets `persist-credentials: false`, and both checkouts in `.github/workflows/project.yml` (lines 45 and 54) already did. So `services/github/README.md:165-166` holds.
4. Section 14.2 and the kit's own wiring disagreed: resolved. `docs/01-specs/WORKFLOW.md:445-446` now allows "the branch under check in the kit's own repository", which matches `services/github/README.md:150-151`.

**Acceptance criteria**

1. Section 14.2 runs the kit's checks, and the registry's check where there is a registry, before `verify`: met, `docs/01-specs/WORKFLOW.md:445-448`.
2. A project wires the checks with one short caller file, and the piece shows it: met at the last check. This diff does not touch it.
3. The reusable workflow runs the checks and `verify` on a project's pull request: not verifiable from here. It is the deferred check declared in `checks` (due 2026-11-26).
4. The kit's own pipeline still passes: not verifiable from here. It needs a run on GitHub.
5. The profile's `verify` passes: met, according to the record's Verification (all 7 commands passed on `8f6c07d`).

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order. The diff names no hosting service in the rules, holds nothing about a user or an installation, and adds no script.
- **Verification evidence:** in order. Covers formatting (prettier), lint (oxlint), types (tsc) and tests (node --test).
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Criterion 4: the kit's pipeline, including the new `project` job, can only be confirmed by a run on GitHub, on the pull request.
- Criterion 3: only the deferred check can confirm it, on the home's first pull request that calls `project.yml`.

## Deviations

- The strategy installs a project's tools only from its lockfile. project.yml also takes an optional version of
  Claude Code to install, because the kit's own profile runs `claude plugin validate .` and step 3 of the strategy
  runs that profile through project.yml; without it the kit's own pipeline would fail (criterion 4). A project whose
  profile runs no `claude` passes nothing.
- `.github/workflows/verify.yml` is listed as out of scope, yet it changes: step 3 of the strategy adds its `project`
  job, and its `verify` job's checkout no longer leaves a token in the git configuration. The out-of-scope entry meant
  the kit's own checks, which stay as they were.

## Outcome

A project wires the kit's checks and its own `verify` on its pull requests with one short caller file of
`.github/workflows/project.yml`, which section 14.2 and the GitHub piece describe; the kit runs the same workflow on
its own pull requests. A project can call it once the kit's repository is public, a change the person makes: until
then the home cannot wire it. The run on a project is a deferred check, due 2026-11-26.
