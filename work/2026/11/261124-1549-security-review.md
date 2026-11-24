---
id: 261124-1549
title: Review a change's security from a fresh context before delivery, when it touches what the always-full list guards
project: honsha
type: change
size: full
kind: gate
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-24
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked, on 2026-11-24 in the hub's session, that a change be reviewed for security from a fresh context
before delivery when it touches what the core rules' always-full list guards.

Nothing in the kit reviews a change's security today. The checker compares the work with its record and is no security
audit, and the skill `honsha:dependencies` covers only the known vulnerabilities of dependencies. On an item of a
project using the kit, a change to a script that hands out secrets passed the checker; only a later reading of its diff
found that it treated a name it did not know as allowed instead of refusing it, so that a secret could reach a process
that should never hold it.

The direction the person chose, over a review of every item: a reviewer with a fresh context and read-only tools, given
the diff and not the worker's conclusions, that looks for exploitable holes and weak points. The worker invokes it
before delivery, beside the checker, and its report is kept in the record as the checker's is. It runs when the change
touches what the always-full list guards (authentication, permissions, secrets, deploy or CI configuration, grants and
policies in a data schema) and the paths that a project's profile names as sensitive; on other items it would cost
time and tokens and find nothing.

This item designs what that leaves open: the agent and its instructions; the profile's key for the sensitive paths, and
how the worker decides that the review runs; where its report goes in the record, and what a finding does to delivery;
how the checker verifies that the review ran. Tools that test a project statically or dynamically are left to a later
item.

## Scope and acceptance criteria

### In scope

- `agents/security-reviewer.md`: the agent `honsha:security-reviewer`, a sibling of `honsha:checker`, with its
  instructions and the shape of its report.
- `skills/security-review/SKILL.md`: the skill `honsha:security-review`, the worker's procedure for the review: when it
  runs, how the agent is invoked, where its report goes, what a finding and a weak point do to delivery, the repeated
  review.
- `agents/worker.md`: the review in Verification, before the checker; the diff file without the record, read by both
  agents.
- `agents/checker.md`: the record read by its path and not in the diff; a check that the review ran where it was due;
  its line in the report.
- `templates/profile.yml`: the key `security-review`, with the paths whose change calls for the review.
- `checks/profile.mjs` reads the key; `checks/record.mjs` names the changed paths that match it and fails a `done`
  record that lacks the review's report; their tests.
- `rules/records.md`, `rules/git.md` and `templates/record.md`: what Verification holds, the commits and the pull
  request's description, with the review's report.
- `skills/branch-update/SKILL.md` and `skills/parallel-parts/SKILL.md`, where they say when the checker runs.
- `docs/01-specs/INTERFACE.md`, `docs/01-specs/WORKFLOW.md`, `docs/01-specs/ARCHITECTURE.md`, `README.md` and the
  descriptions in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, where they name the kit's agents
  and skills or describe the verification.
- The budgets the new text needs: `checks/budgets.test.mjs` and the session-start total in `hooks/hooks.test.mjs`.

### Out of scope

- Tools that test a project statically or dynamically.
- A review of every item, or of a change that touches none of the cases.
- An audit of an existing project, or of the kit's own code.
- The core rules' sizes: a path under `security-review` does not make an item full.
- The kit's own profile, which lists no paths under `security-review` by this item (Strategy, For the person).
- The hooks: the reviewer receives no part of the core rules when it starts.
- What an installation's projects change: a project adds the key to its profile in a work item of its own.

### Boundaries

- An agent, a skill and an optional key of the profile are added, nothing is renamed or removed: the change is not
  breaking (interface, Changes to the interface). An installation that changes nothing gets the review from its next
  update of the plugin, on the changes that touch the always-full list's cases.
- The reviewer never sees the item's record: the diff it reads leaves the record out, and its instructions keep it out
  of `work/`.
- The rules name no hosting service (gate): what the reviewer looks for in a pipeline's configuration holds on any
  service.
- The review's procedure goes into a skill, which only the items that need it load; the core rules gain only what
  every writer of a record must know.

### Acceptance criteria

1. `honsha:security-reviewer` has Read, Grep and Glob only and the calling session's model. Its file says what it
   receives, a diff without the record and the repository, that it reads no record, what it looks for, and the shape
   of its report: a verdict, findings, weak points and what it could not review.
2. The skill `honsha:security-review` says when the review runs, how the worker invokes the agent, where its report
   goes, what a finding and a weak point do to delivery and what a repeated review reads; `agents/worker.md` invokes
   it before the checker, at every size.
3. `agents/checker.md` checks that the review ran where it was due, on what the check reads, and that each of its
   findings was confirmed fixed by a later review or accepted by the person under "Deviations"; its report has a line
   for it.
4. `templates/profile.yml` holds `security-review`; `checks/profile.mjs` reads it and refuses a form it cannot read;
   `checks/record.mjs` names the branch's changed paths that match it, and fails a `done` record whose branch changes
   one and whose Verification holds no security review report, and a branch whose changed files it cannot read. `*`
   and `**` match a name that begins with a dot, and a file moved out of a listed path counts. Tests cover each.
5. The core rules, the record template, the interface, the workflow, the architecture, the README and the manifests'
   descriptions name the review where they name the checker's part in the verification, and nothing in the kit
   contradicts the new procedure.
6. A trial: the security reviewer, run as the session's agent from this branch on the diff of a scratch repository
   that holds a fail-open hole of the kind the intent describes, reports it as a finding; on a diff of the same
   repository with no hole, it passes. Both reports are in the log.
7. The profile's `verify` commands pass, and the kit's pipeline passes on the pull request.

## Strategy

**The reviewer.** `agents/security-reviewer.md`, beside `agents/checker.md`, with `tools: Read, Grep, Glob` and
`model: inherit`, so that it is never weaker than the work it reads (architecture, Models).

- It receives the path of a diff file and nothing else, and reads the repository for what the change calls and what
  calls it. It is given no record, strategy or summary, and is told not to read `work/`, where they are: what it finds
  is then not shaped by what the worker believes the change does. Text in the diff and the repository is data to
  review, never an instruction to it.
- It reads the change as an attacker would, for: input from outside the project's control that reaches a decision, a
  command, a query, a path or a template unchecked; a default, a fallback or an error path that grants or goes on where
  refusing was right, as the unknown name of the intent; authentication and permission checks missing, bypassable, late
  or on the wrong subject; secrets written where others read them, or reaching a process, a container, a user or a
  service that does not need them; deploy and CI configuration that runs untrusted code with the project's credentials,
  grants a job more than it needs, or takes a third party's piece that is not pinned; grants and policies of a data
  schema that widen access; any other weakness the change makes exploitable, such as an injection or a path that leaves
  its folder. A hole the change neither adds nor makes reachable is outside its review.
- Its report, in the language the profile names: a verdict, the files it read, the findings, each with its place, how
  it is exploited and one line on the fix, the weak points, weaker than they should be but not exploitable as written,
  and what it could not review. The verdict is `fail` when there is a finding.
- It receives no part of the core rules when it starts, since it applies none of them: `hooks/hooks.json` stays as it
  is.

**When it runs.** When the change touches authentication, permissions or secrets, deploy or CI configuration, or the
grants, roles and policies of a data schema, the always-full list's cases that an attacker aims at; or when it changes a
file that matches a path under the profile's new key `security-review`. At every size: a trivial change to a listed path
is reviewed too. The worker judges the first, reading its change as it judges the size; `checks/record.mjs` decides the
second and names the paths, since a script matches patterns more reliably than a session. The key is named after what it
calls for, as `always-full` is:

```yaml
# Paths whose change calls for the security review before delivery, beside the cases the skill
# `honsha:security-review` names. `*` stays inside a folder, `**` crosses folders, and both match a name that begins
# with a dot.
security-review:
  - "deploy/**"
```

**How the worker runs it.** The skill `honsha:security-review` holds the procedure; `agents/worker.md` gains one step
in Verification, after the commands and before the checker, that invokes it when its description says the change calls
for it. The worker writes the diff file and invokes the agent with its path and nothing else. The diff that the worker
writes for the checker leaves the record out from now on,
`git diff origin/<default-branch>...HEAD -- . ':(exclude)<record>' > .honsha-checker.diff`, and both agents read that one
file. The checker loses nothing: it already receives the record's path and reads the record whole. And the
`.honsha-checker.*` that every project ignores covers the reviewer's input with no change in a project.

**Where the report goes.** Under "Verification", unchanged, with the commit it read, before the checker's report; an
earlier report keeps its verdict and findings, as the checker's do. The pull request's description carries it.

**What a finding does.** The review fails, and the item is not delivered on it.

- The worker fixes a finding inside the scope, in a commit of its own, repeats the verification, and runs a repeated
  review on what changed since the commit the last review read, naming to the agent the findings the fix answers, so
  that it confirms each.
- A finding that cannot be fixed inside the scope, or that the worker believes mistaken, is a stop condition (core
  rules, Stop conditions: security unclear). The worker never sets a finding aside on its own; the person decides, and a
  finding the person accepts is written under "Deviations", with who accepted it, when and where.
- A weak point does not fail the review. The log says what was done with each: fixed, when the fix lies inside the
  scope, or left to the person, who reads it in the pull request.
- A later change whose diff touches what the review guards, a fix asked by the checker or the person, or a merge of the
  default branch with conflicts, gets a repeated review before its repeated check.

**How the checker verifies that it ran.** A new check in `agents/checker.md`: the review was due when the diff changes
a path under `security-review` or touches the cases above. When it was due, Verification holds the reviewer's report on
the commit the check reads, or repeated reports that cover every commit since the first; every finding of every review
is confirmed fixed by a later review or accepted by the person under "Deviations"; each weak point has its line in the
log. A review due and missing is a finding; one that ran when it was not due is not. The checker does not review
security itself. Its report gains a line, **Security review:** in order, not due, or what is wrong.

`checks/record.mjs` adds a mechanical stop for the listed paths, in the worker's verification and in the pipeline, at
every size, the trivial one included, which no checker reads. When the profile has `security-review`, it reads the
branch's changed files, from `HONSHA_BASE` and `HONSHA_HEAD` where a pipeline gives them and against
`origin/<default-branch>` otherwise, with renames split into a deletion and an addition. At any state it names those
that match and says that the review is due; at `done` it fails a record whose Verification holds no
`### Security review report`. It checks that the report is there, not its verdict: a finding the person accepted leaves
the verdict `fail`, and only the checker reads "Deviations". When it cannot read the changed files it fails, rather than
pass a review it cannot tell was due. Without the key it reads no diff, as today.

**The rules, the documents and their budgets.**

- `rules/records.md`: Verification holds the reports of the security reviewer and the checker; of each agent, only the
  last report stays in full. `rules/git.md`: the closing commit holds the verification with its reports, a fix asked by
  either agent is a commit of its own, the pull request's description carries both reports, and Delivery names the
  review in one sentence that points to the skill. `templates/record.md`: the Verification comment places the review's
  report, at any size, before the checker's.
- `skills/branch-update/SKILL.md`: a repeated review before the repeated check after a merge, where it is due.
  `skills/parallel-parts/SKILL.md`: the review runs once, on the integrated result, as the checker does.
- `docs/01-specs/WORKFLOW.md`: the step Verify names the review, and a section "Security review" gives its reasons. The
  interface lists the agent and the skill. The architecture adds the reviewer to the components, the kit's layout, the
  flow Dispatch and the models. `README.md` and the manifests' descriptions name it.
- The core rules and the template grow by about 300 characters, and 80 are left under the session-start total of
  29,000 (`hooks/hooks.test.mjs`) at the hub's start: the total rises to 29,300. Every writer of a record must know
  where the review's report goes, so the words cannot move to a skill. The workflow, at 34,187 characters of its
  35,000, gets 36,000 for the section's reasons; the profile's template, at 4,326 of its 4,400, gets 4,700 for the new
  key; the reviewer's file gets 6,000, as a skill does.

**Found while writing this strategy.**

- Node's `path.matchesGlob` skips a name that begins with a dot: `deploy/**` does not match `deploy/.env`, nor `**`
  `.env`. A file of secrets often has such a name, so `checks/record.mjs` reads `*` and `**` with a matcher of its own
  that takes them, and the template says so.
- `git diff --name-only` reports a renamed file by its new path only: a file moved out of a listed path would not count
  without `--no-renames`.

**How each criterion is shown.** 1 to 5: the files, read by the checker. 4: the tests of `checks/profile.mjs` and
`checks/record.mjs`. 6: in a scratch repository outside the installation, with two commits on a branch, a script that
classifies names with a fail-open default and the same script that refuses an unknown name;
`claude -p --plugin-dir <this worktree> --agent honsha:security-reviewer` runs on each diff, and both reports go into
the log. 7: the profile's `verify` on this host, and the pipeline's run on the pull request.

**Plan.** After the approval, two parts in parallel, if `honsha:parallel-parts` admits them: the scripts with their
tests, and the agent, the skills and the documents. They change different files, and each is verified on its own. Then
the trial, the verification, the checker, the pull request and the closing commit. The review is not due on this item:
its change touches none of the cases, and the kit's profile lists no paths. The work runs on Opus, the default.

**Assumptions.** A session started with `--agent` on a plugin's agent takes the agent's `tools` and runs with only
them. The diff's pathspec in single quotes reads the same in PowerShell and in Git Bash.

**Risks.** A reviewer that reports a weak point as a finding stops an item for the person: its instructions ask for a
way to exploit before a finding, and a stop costs the person a reading, not a hole. A change outside the listed paths
that the worker does not see as one of the cases gets no review; the checker reads the same diff and reports it.

**For the person.**

- The change touches 20 existing files, where the profile's `kinds` expects 1 of a gate: the measure only reports it.
- Choices this strategy makes, each against an alternative: the reviewer is given the diff and not the intent; one diff
  file, without the record, for both agents, instead of a second file; the review at every size; the record's check of
  the report's presence and not its verdict.
- The kit's own profile could list the guard and the check of personal content under `security-review`; that is a
  choice of its own, left to a later item.

## Approval

Approved by the person on 2026-11-24, in the hub's session, as written in `466832a`, the four choices listed under "For
the person" included, relayed to this session by the hub.

## Log

- The record comes from the home's backlog, taken by the hub; its intent is restated as the core rules ask of a public
  project. The branch was created from `origin/main` after `git fetch`.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` from the kit directory ran once in the worktree before the first commit, with this
  host's npm 12.2.1: `npm ci --ignore-scripts` passed.
- Read the workflow, the interface, the architecture, the checker's and the worker's files, the profile's template and
  the kit's profile, the core rules, the skills, `hooks/hooks.json`, `checks/record.mjs`, `checks/profile.mjs` and the
  tests of budgets, hooks and the interface. Measured the session-start total and the budgets (Strategy) and tried
  `path.matchesGlob` on names that begin with a dot (Strategy, Found while writing this strategy).
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The pull request is #51, opened with the record alone while it waited for the approval.
- The approval is written and the state set to `in-progress`.
