---
id: 261124-1626
title: Push only verified work, and let the checks skip a project's verification on a push that changes only records
project: honsha
type: change
size: full
kind: rule
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, that pushing a work item's branch as few times as
possible, to save the pipeline's minutes, be a rule of the kit rather than a choice of one installation, and on
2026-11-25 to start it.

What happened: on a day when about a dozen items of one private project using the kit ran at once, every push to a pull
request ran the project's checks with its integration tests. Workers pushed intermediate fixes and log updates and
waited for runs on commits that changed only their record, and the pipeline minutes that the hosting service grants
private repositories nearly ran out. The hub then told every worker by message: push only finished work, the work and
then the closing commit; no intermediate pushes and no re-runs; after a green run on the code, a commit that changes
only the record does not wait for the pipeline; a failure that does not come from the change goes to the hub, not
pushed again to retry. Those messages reached only the sessions of that day; a rule of the kit reaches every session.

Two parts. The rule: `rules/git.md` already asks an item to make as few commits as it can; it could ask as few pushes,
each of verified work, and say when the worker reads the pipeline's result and when a commit that changes only the
record needs no new run, the record's own checks included. The piece: the hosting service's workflow
(`services/github/README.md`) already cancels an older run of the same pull request; it could run a project's `verify`
only when a push changes something outside the records, while the checks of records and commits always run.

Left to this item: the rule's wording for any hosting service; how the workflow tells a push that changes only records
and still runs the records' checks; whether a project's own workflows, such as its application's checks, are in scope
or the project's own; what a public repository, whose minutes are free, changes.

## Scope and acceptance criteria

### In scope

- The rule, in `rules/git.md` (Delivery): a work branch is pushed only with work that has passed the verification, the
  security review where it applies and the checker, and as seldom as its commits allow; after the push of the work the
  session waits for the checks that the hosting service runs on it and never starts them again; a failure that comes
  from the change is fixed, one that does not goes to the person and is not pushed again; once the checks pass, the
  closing commit is pushed without waiting for its run, after the session has run on it the checks that read the
  record.
- The worker's procedure, `agents/worker.md` (Delivery): the wait after the pull request is opened, and the checks that
  read the record on the closing commit, pointing to the rule.
- The wiring for GitHub, `.github/workflows/project.yml`: on a push to a pull request's branch whose new commits change
  only records, the steps that install and the step that runs `verify` are left out, with a notice that says so; the
  kit's checks of the record, of the commits and of the registry run on every push.
- A script of the kit, `checks/changes.mjs`, with its test, `checks/changes.test.mjs`: it tells the wiring whether the
  commits between two given ones change only records.
- The documents that describe these: the piece, `services/github/README.md` (its commands, the wiring, what it costs, a
  project's own workflows); the workflow, `docs/01-specs/WORKFLOW.md` (why the rule holds, under "Commits and
  branches", and the contract of the checks); the interface, `docs/01-specs/INTERFACE.md`, which names the new script
  among those outside it.
- The budgets that the new text reaches: the total a session receives at start, in `hooks/hooks.test.mjs`, and the
  workflow's, in `checks/budgets.test.mjs`.

### Out of scope

- A project's own workflows, such as its application's checks: they are the project's, wired by it. The rule on pushes
  makes them run less often, and the piece says in one line that they are the project's.
- The kit's own `verify` job in `.github/workflows/verify.yml`, which tests the kit on two systems at every push. The
  `project` job of that file calls `project.yml`, so the kit runs the new wiring on its own pull requests.
- The caller's file that a project holds, the inputs of `project.yml`, the concurrency of a run, the settings of the
  hosting service and any check required before a merge: no installation changes a file for this item.
- `agents/hub.md`: the hub receives the core rules at start, and nothing in its procedure contradicts the rule.
- A retry of a failed run, by a session or by the wiring.

### Boundaries

- The rules name no hosting service (the profile's gates): `rules/git.md` and the worker's procedure speak of the
  checks that the hosting service runs.
- The opening of a pull request and every push to the default branch run every step: only a later push to a pull
  request's branch can leave out the setup and `verify`.
- Whatever the script cannot tell, a range it cannot read included, counts as a change beyond the records, and the
  wiring then runs everything.
- The interface changes only by an addition outside it, a script that the wiring alone runs: nothing breaking.
- The files that other items of the kit change at the same time stay untouched: `skills/dependencies/SKILL.md`,
  `.hub/profile.yml`, `skills/assessment/SKILL.md` and `agents/hub.md`.

### Acceptance criteria

1. `rules/git.md`, Delivery, holds the rule: a push carries only work that has passed the steps before delivery, as
   seldom as the commits allow; after the push of the work the session waits for the hosting service's checks and
   never starts them again; a failure that comes from the change is fixed, one that does not is reported to the person
   and not pushed again; the closing commit is pushed without waiting for its run, after the session has run on it the
   checks that read the record.
2. `agents/worker.md`, Delivery, waits for the checks after the pull request is opened and runs on the closing commit
   the checks that read the record, pointing to the rule rather than restating it.
3. `node checks/changes.mjs <base> <head>` exits 0 when every file that differs between the two commits is a record, a
   work item's or one of the backlog, added, changed or deleted. It exits 1 when another file differs, a file moved
   into or out of `work/` among them; when a file under `work/` is not a record; when the base is empty or all zeros;
   when a commit is not in the clone; and when an argument is not a commit's identifier. `checks/changes.test.mjs`
   covers each case.
4. In `project.yml`, a push to a pull request's branch whose new commits change only records skips the steps that
   install npm, run the setup, install Claude Code and run `verify`, and shows a notice that says so. It runs the checks
   of the record, of the commits and, where the project holds a registry, of the registry. The opening of a pull
   request and every push to the default branch run every step as before.
5. The piece's README, the workflow's contract and reasons, and the interface say what criteria 1 to 4 make true, and
   each raised budget is raised by this item with its reason.
6. The profile's `verify` commands pass, and on the pull request the run on the work is green, with its `project` job
   running the verification commands.
7. The run on the closing commit, a push that changes only the record, shows in its `project` job the setup and the
   verification commands skipped and the checks of the record and of the commits passed. The rule has the session push
   that commit without waiting for its run, so this is a deferred check in `checks`.

## Strategy

**The rule.** One bullet in `rules/git.md`, Delivery, after the one on the verification:

```text
- A work branch is pushed only with work that has passed those steps, and as seldom as its commits allow: the work,
  then the closing commit; a fix once verified and checked again, a line of the log never alone. The session then
  waits for the checks that the hosting service runs on the work, and never starts them again: a failure that comes
  from the change is fixed; one that does not is reported to the person, who decides, and nothing is pushed for it.
  Once they pass, the closing commit is pushed and its run is not waited for: it changes only the record, and the
  session has run on it the checks that read the record, the kit's checks of the record and of the commits and those
  of the verification commands that read it, such as a formatter.
```

The intent's four open points:

- **Wording for any hosting service.** "The checks that the hosting service runs" names no service, as the rules
  already say "the hosting service". The command that waits for them is the piece's.
- **The record's own checks.** They are those that read the record: the kit's checks of the record and of the commits,
  and those of a project's verification commands that read it, such as a formatter over the whole tree. The session
  runs them on the closing commit before it pushes it, so that no run on that commit is needed to find what they find.
- **A project's own workflows** stay the project's: the kit wires only its own checks. They run at every push they are
  wired for, so the rule makes them run less often too.
- **A public repository** changes nothing, neither in the rule nor in the wiring that projects get: the runs still take
  the time the worker would wait, a run started again still hides a fault, and one behaviour for every project is
  simpler to read than a switch. Its free minutes only make the kit's own `verify` job, which is not a project's
  wiring, cheap enough to keep running in full.

**The worker's procedure.** `agents/worker.md` has 75 characters left in its budget. Delivery step 1 gains "Then wait
for its checks (core rules, Delivery)."; step 4 reads "Make the closing commit, run on it the checks that read the
record (core rules, Delivery), and push it to the open pull request." If the two exceed the budget by a few
characters, the budget is raised by as many, and the total below with it.

**The wiring.** In `project.yml`, after `actions/setup-node`:

```yaml
- name: Tell whether the push changes more than records
  id: changes
  if: github.event_name == 'pull_request'
  env:
    BEFORE: ${{ github.event.before }}
  run: |
    if node ../kit/checks/changes.mjs "$BEFORE" "$HONSHA_HEAD"; then
      echo "verify=false" >> "$GITHUB_OUTPUT"
      echo "::notice::The push changes only records: the setup and the verification commands are left out."
    fi
```

The steps "Install npm", "Prepare the checkout", "Install Claude Code" and "Run the verification commands" gain the
condition `steps.changes.outputs.verify != 'false'`, beside the one each has. Only the script's exit code 0 writes
`false`: a push event, where the step does not run, an opening of a pull request, whose event has no earlier tip, and
any failure of the script all leave the output empty, and every step runs. The kit's checks need nothing the setup
installs: they import only Node.js's own modules. The order of the steps stays as it is.

- **The range** is the push's own: `github.event.before`, the branch's tip before the push, to the head of the pull
  request. A merge of the default branch into the work branch changes more than records, so its push runs everything.
- **Why only on a pull request's branch.** The default branch is where whatever the skip leaves out is caught: a record
  that a project's `verify` reads, such as a backlog capture that the home's formatter checks, and the default branch
  having moved between the run on the work and the closing commit. Its pushes are the merges, which change code, and
  the backlog's captures; the minutes the intent speaks of were spent on pull requests.
- **One job with skipped steps, not a second job.** A job is counted as at least a whole minute: a second job would add
  a minute to every run on the code to save one on a run on records.

**The script.** `checks/changes.mjs <base> <head>`, run from the project's root, lists the files that differ between
the two commits with `git diff --no-renames --name-only -z`, so that a file moved into `work/` counts by its old path
too. A record is `work/<yyyy>/<mm>/<id>-<slug>.md` or `backlog/<project>/<id>-<slug>.md`, the two shapes the interface
gives. Exit code 0 when every file is a record, or none differs; 1 otherwise, and when an argument is not a commit's
identifier in hexadecimal, when the base is all zeros, or when git fails, as for a commit the clone lacks. Git runs
without a shell, with arguments checked first. It prints the first file outside the records, never a file's content.
It is outside the interface, as `checks/pushed.mjs` is: the wiring runs it from the kit at the commit the wiring was
read from, and a project names it nowhere.

**The documents.**

- `services/github/README.md`: a row in the commands for waiting until the checks finish, `gh pr checks --watch`; in
  "Checks on pull requests and on the default branch", the step that tells a push on records only, what it skips and
  what it keeps, and what the skip assumes (below); in what it costs, that such a run is the kit's checks alone, about
  a minute; one line that a project's own workflows are the project's.
- `docs/01-specs/WORKFLOW.md`: under "Commits and branches", a "Pushes" subsection with the reasons: each push to a
  pull request runs the checks, which on a private repository spend the account's minutes; the service's run is a
  second check in a clean place, not where fixes are tried; a run started again hides a fault the person should see;
  a run on a commit that changes only the record finds nothing that the session's own checks did not, and waiting for
  it only delays the end. The contract, "What it runs", gains the skip on a pull request's later pushes and why the
  default branch keeps every step.
- `docs/01-specs/INTERFACE.md`: `checks/changes.mjs` joins `checks/pushed.mjs` among the scripts outside the interface.

**The budgets.** A session receives about 29,290 of the 29,400 characters that `hooks/hooks.test.mjs` allows at
start, and the rule adds about 700: the total is raised to fit it with a margin of about 100. The rule belongs in the
core rules, which every session that pushes a work branch receives, the hub's included; a skill reaches a session only
when it invokes it. The workflow has 6 characters left of 36,300; the reasons and the contract add about 1,500, and its
budget is raised by as much: the workflow is where the kit's reasons are kept, and no part of this text is a rule that
a session applies.

**How each criterion is shown.**

- Criteria 1 and 2: the diff of `rules/git.md` and of `agents/worker.md`, which the checker reads.
- Criterion 3: `node --test checks/changes.test.mjs`, in a temporary repository, each case of the criterion with its
  exit code.
- Criterion 4: the diff of `project.yml`, and the pull request's first run, at its opening, which must run every step
  of its `project` job, the verification commands included.
- Criterion 5: the diff of the documents and of the budgets.
- Criterion 6: the profile's `verify` on this host, apart from oxlint if this host's application control stops it,
  which the pipeline then runs; and the pull request's first run.
- Criterion 7: a deferred check dated the day after delivery, which reads the run on the closing commit.

**Plan.** After the approval, one commit of the work with the record's log; then the verification, the security review
(the change touches CI configuration), the checker, the push, the pull request, the wait for its checks, the closing
commit. No part runs in parallel: the documents describe the script and the workflow in the same words, and the
whole change is a few hundred lines. The work runs on Opus at xhigh, as given; it needs no more.

**Assumptions.** GitHub gives `before` in the event of a push to a pull request's branch (`synchronize`) and none at
its opening; the work checks it against GitHub's documentation of the event before it relies on it. `gh pr checks
--watch` waits until the checks finish, as its help says.

**Risks.**

- A push that changes only records, made while the run on the work is still going, cancels that run, as the caller's
  concurrency asks, and the new run skips the verification: the code would then be checked by nothing on the pull
  request until the merge's run on the default branch. The rule's wait for the run on the work is what prevents it, and
  the README says so.
- On a pull request whose last push changed only records, the green result is the kit's checks', and the result of the
  verification is on the earlier run; the notice on the run says so.
- A project whose verification commands read the records, as a formatter over the whole tree does, relies on the
  session running them on the closing commit: what it misses shows on the default branch's run after the merge.

**For the person.**

- The change touches eight existing files, five more than the profile's `kinds` expects of a rule: the rule and the
  worker's procedure, the wiring and its two documents, the interface, and the two budgets. The measure only reports
  it.
- Two choices to approve with the strategy: the skip applies only to a pull request's later pushes, never to the
  default branch; and the kit's own `verify` job keeps running in full.

## Approval

Approved by the person on 2026-11-25, in the hub's session, as written, with its two choices: the skip only on a pull
request's later pushes, never on the default branch, and the kit's own `verify` job running in full. The hub passed the
approval on to this item's session.

## Log

- The branch was cut from `origin/main` after `git fetch`, and its upstream unset, so that no push can follow
  `origin/main` by default.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts` passed.
- Read `rules/git.md`, `agents/worker.md`, `agents/hub.md`, the workflow's sections on commits, the backlog and the
  hosting service, the interface, the GitHub piece, `project.yml`, `verify.yml`, the opening comments of
  `checks/record.mjs`, `checks/commits.mjs` and `checks/verify.mjs`, and the budgets in `checks/budgets.test.mjs` and
  `hooks/hooks.test.mjs`.
- Measured the budgets: a session receives 29,288 characters at start, of 29,400; `agents/worker.md` has 5,925 of
  6,000; `docs/01-specs/WORKFLOW.md` 36,294 of 36,300.
- `work/` holds only records, each named `work/<yyyy>/<mm>/<id>-<slug>.md`.
- `skills/assessment/SKILL.md`, which another item changes, says that the wiring runs `verify` "on every pull request
  and on each push to the default branch": with the skip on a pull request's later pushes only, that stays true.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The person approved the strategy (Approval); the state is `in-progress`.
- Checked the strategy's assumption against GitHub's documentation, through a subagent on Sonnet: the `pull_request`
  event's `synchronize` action carries `before` and `after`, `opened` and `reopened` carry no `before`, and
  `github.event` is the event's whole payload. A step's `env` may read the `github` context. The documentation does not
  say what a skipped step's output gives; it says that a property that does not exist reads as an empty string, and the
  conditions compare with `'false'`, so that either way every step runs unless the script wrote `false`.
- `checks/changes.mjs` and `checks/changes.test.mjs` are written: eight tests, each case of criterion 3 among them. The
  test of a file moved into `work/` fails without `--no-renames`, since git would list only the new path.
- `project.yml` gains the step "Tell whether the push changes more than records", and the four steps that install or
  run `verify` its condition; its opening comment says what a later push on records gets.
- `rules/git.md` holds the rule as the strategy wrote it. In `agents/worker.md`, step 1 says "Then wait for its
  checks." without the pointer to the core rules that the strategy gave it, which would have put the file 6 characters
  over its budget; step 4 keeps the pointer. The file has 5,980 characters of its 6,000, and its budget is not raised.
- With the rule, a session receives 30,047 characters at start: `TOTAL` in `hooks/hooks.test.mjs` goes from 29,400 to
  30,150.
- The workflow gains 2,257 characters, more than the strategy's estimate of about 1,500: the "Pushes" subsection, the
  skip in the contract's "What it runs", and a sentence on `checks/changes.mjs` beside the kit's other scripts that the
  wiring runs. Its budget goes from 36,300 to 38,600.
- The interface names `checks/changes.mjs` among the scripts outside it. The GitHub piece gains the command that waits
  for the checks, the skip and what it assumes in "What it runs", that the kit's own first job runs at every push, what
  a run on records costs, and a paragraph on a project's own workflows.
- Searched the kit for other texts that describe the wiring's steps, the worker's closing commit or the budgets: none
  but those changed.
- The security review of `5bb799e`, on Opus, failed with two findings and three weak points (Verification).
- Finding 2: `checks/changes.mjs` printed the first file outside the records as it is, and a runner reads a line that
  begins with `::` as a command to it. The script now writes the name as a JSON string, and a test builds two names
  that hold `::`, one with line breaks, with git's plumbing, since this system refuses such names in a working tree. The
  test fails on the script as it was.
- Weak point 1: the pull request's own `.gitmodules` could tell `git diff` to ignore a submodule's change; the script
  runs it with `--ignore-submodules=none`. Weak points 2, the base moved since the run on the code, and 3, a file at a
  record's path that a project's `verify` reads, are left to the person: the strategy's risks name both, and the
  documents say so.
- Finding 1: the skip reads which files a push changed, not whether the run on the branch's earlier tip passed, or
  whether one ran. After code that failed, or whose run a newer push cancelled, or that never ran, as on a pull request
  retargeted to the default branch, a push that changes only records shows the pull request's head green, and a check
  that a ruleset requires passes. Each fix reaches past the approved scope: reading the earlier run's result needs
  `actions: read` in each project's caller file, which the boundaries keep unchanged; a mark of a passing run kept in
  GitHub's cache needs a new action and another design of the skip; refusing the skip on a pull request from a fork
  narrows the finding without closing it. A finding that cannot be fixed inside the scope is a stop condition: the
  state is `blocked`, and the person decides.
- The person chose to read the earlier run's result from GitHub's API (Deviations); the item resumes, and the state is
  `in-progress`.
- GitHub's documentation, read through a subagent on Sonnet, says that a called workflow's permissions can only be the
  same as its caller's or fewer, and that the `github` context of a called workflow, its token included, is its
  caller's. It does not say what happens to a called workflow that asks for more than its caller grants; in the
  kit's experience GitHub then refuses to start the run. The list of a workflow's runs takes `head_sha` and `event`,
  and each run carries `id`, `event`, `head_sha`, `status`, `conclusion`, `workflow_id` and `pull_requests`.

## Verification

## Deviations

- The security review of `5bb799e` found that the skip read only which files a push changed, not whether the run on
  the branch's earlier tip passed (finding 1, Verification). The person decided on 2026-11-25, in the hub's session,
  that the skip happens only when that run concluded with success, read from GitHub's API, and that whatever the read
  cannot tell runs everything; the hub passed the decision on to this item's session. The person accepts the extension
  of the approved scope that this brings:
  - criterion 4 holds with one more condition: a later push to a pull request's branch whose new commits change only
    records skips the steps only when the latest run of the same workflow on the branch's earlier tip, from the same
    branch of the same repository, concluded with success;
  - a script of the GitHub piece with its test, `services/github/runs.mjs` and `services/github/runs.test.mjs`, reads
    that run;
  - `actions: read` is granted in the kit's own `verify.yml`, to its `project` job alone, and in the caller's file that
    the piece shows, where a project may leave it out: its checks keep working, and its pushes on records run
    everything;
  - `project.yml` names no permission of its own any more: a called workflow may only keep or lower what its caller
    grants, and one that named `actions: read` would ask more than a caller without it grants. The caller's
    `permissions` is the one limit;
  - the interface's line on the piece's workflow names the permissions that its caller grants.

  The caller's file of each project of the installation lies outside the kit: the hub dispatches its change, as items
  of those projects, after this pull request is merged.

## Outcome
