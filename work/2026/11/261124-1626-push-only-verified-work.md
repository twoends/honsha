---
id: 261124-1626
title: Push only verified work, and let the checks skip a project's verification on a push that changes only records
project: honsha
type: change
size: full
kind: rule
state: done
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: 55
model: claude-opus-5-5
effort: xhigh
checks:
  - { due: 2026-11-26, what: "The run on the closing commit of pull request 55, a push that changes only the record, shows in its `project` job that the run on the work passed, the setup, Claude Code and the verification commands skipped, and the checks of the record and of the commits passed" }
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
- Finding 1, as the person decided: `services/github/runs.mjs` reads the current run's workflow, then that workflow's
  runs on the earlier tip for the `pull_request` event, and passes only when the latest from the same branch of the
  same repository completed with success. It matches a run by its commit, its branch and its repository, which a run
  carries from its start, rather than by the pull requests GitHub lists beside it, which are empty for a fork. It
  prints no text of the API's, and checks its arguments and GitHub's variables before it asks the API anything. Its
  test, `services/github/runs.test.mjs`, answers in place of the API: a run that passed, the latest that failed, one
  cancelled, one still going, none, one from a fork, an answer of another shape or not JSON, a refusal, no network,
  and arguments or variables that are not a run's. The test found that the first pattern of a repository let `../other`
  through; the pattern now refuses a name of dots alone.
- `project.yml` runs it after `checks/changes.mjs`, with the token in that step's environment alone, and names no
  permission of its own (Deviations). `verify.yml` grants `contents: read` and `actions: read` to its `project` job.
- The piece's README shows `actions: read` in the caller's file, says what it is for, that a file without it keeps
  working with every push running everything, and that the caller's `permissions` is the token's one limit; the skip's
  conditions and what the token may read replace what the skip assumed. The workflow's "Pushes" and its contract say
  that the skip follows a run that passed; the interface's line on `project.yml` names the permissions its caller
  grants. The workflow is 46 characters over the budget this item gave it, which goes from 38,600 to 38,700.
- The repeated security review of `20db06c`, on Opus, passed: findings 1 and 2 and weak point 1 are fixed, and it
  names three weak points (Verification).
- Its weak point 1: the runner also reads a command in the form `##[`, anywhere in a line, and a JSON string keeps `#`,
  `[` and `]`. The script now writes each character of a name but letters, digits and `_ . / -` as `%` and its bytes in
  hexadecimal, and the test adds names in that form.
- Its weak point 2, left to the person: `project.yml` no longer caps the token, so a caller that grants more, or names
  no permissions, gives the job more. Naming both permissions in `project.yml` would stop at its start every caller
  without `actions: read`, which the person's decision keeps working (Deviations). The README now says that code in
  the job can read the token from the runner's memory, so that what the token may do is what the whole job may do.
- Its weak point 3, left to the person: a passed run of another pull request from the same branch, against another
  base, would count. The caller's branch filter gives every such run the default branch as its base, and the documents
  already name a base that moved.
- The repeated security review of `09df150`, on Opus, passed: weak point 1 is fixed and weak point 2 answered. Its one
  weak point: the comment in `project.yml` still said that the token goes to the kit's script alone. The comment now
  says, as the README does, that the token is in that step's environment alone and that code in the job can still
  read it.
- The repeated security review of `1d24ac7`, on Opus, passed: that weak point is fixed. Its one weak point, left to the
  person: the comment does not say, as the README does, that the two checkouts get the token too. It is the wording of
  a comment whose conclusion holds, and each change to the workflow calls for another review.
- The checker, on Opus, read `1d24ac7` and failed it with three findings (Verification).
- Its finding 1: two lines that the work rewrote, in the workflow's contract and in the piece's cost paragraph, ran
  past 120 characters, which the formatter leaves as they are in prose; both paragraphs are wrapped again. Two more
  lines of the change ran past it, the notice in `project.yml` and the first line of `services/github/runs.mjs`; the
  notice is shorter, and the comment wrapped again.
- Its finding 2: the interface did not name `services/github/runs.mjs`, and its claim that `checks/interface.test.mjs`
  fails on a script it does not name held only for `checks/` and `hub/`. The interface names the script among those
  outside it, and the test reads the scripts of each piece of `services/` too: with the name written wrong, it fails.
- Its finding 3: the comment in `project.yml` on the token did not say that the checkouts get it too, as the last
  security review's weak point said. The comment now says it, as the README does.
- The repeated security review of `a784f87`, on Opus, passed: that weak point is fixed. Its one weak point:
  `actions/setup-node` takes the token as an input too, which neither the comment nor the README said. Both now say
  that the actions take the token as an input and that, of the steps that run commands, the one that reads the
  earlier run alone gets it, so that no list of actions has to be kept in step with the workflow. That change left a
  line of the README's paragraph short, wrapped again in a commit of its own.
- The repeated security review of `84365ea`, on Opus, passed with no finding and no weak point.
- The repeated check of `84365ea`, on Opus, found the three findings of the last check fixed, and failed with one
  more (Verification): the change to `checks/interface.test.mjs`, which now reads the scripts of each piece of
  `services/` too, lies outside the scope and the extension the person accepted, and the record declares it nowhere
  but in the log. The interface says that its test fails on a script it does not name, and `services/github/runs.mjs`
  is the first script of a piece; either the test reads the pieces, or the interface narrows what it says of its test.
  Both reach past the approved scope, and a departure from it is a stop condition: the state is `blocked`, and the
  person decides whether to accept the test's extension as a deviation.
- The person accepted the test's extension (Deviations); the item resumes, and the state is `in-progress`.
- The checker's repeated check of `c52641c`, on Opus, passed (Verification).
- The branch was pushed once, at `c52641c`, and pull request 55 opened. `gh pr checks --watch`, run at once after the
  pull request was opened, found no check yet and exited with "no checks reported"; run again a moment later, it
  waited until the four jobs finished. The piece's README gives the command without saying so: a follow-up for the
  hub.
- The run on `c52641c`, at the pull request's opening, passed in its four jobs: `verify` on Ubuntu and on Windows,
  `personal content`, and `project / checks`. In the last, the step that tells a push of records printed that an
  argument is not a commit's identifier, since the opening has no earlier tip, and the setup, Claude Code and the
  verification commands ran.
- The closing commit holds the verification, the outcome and the pull request's number; `node checks/record.mjs` and
  `node checks/commits.mjs` run on it before its push, and its run is not waited for (criterion 7 is a deferred check).

## Verification

On commit `84365ea`, from the root of the kit's worktree:

- `node checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node checks/commits.mjs`: passed, the 12 commits of the branch follow the rules.
- `node checks/verify.mjs`, the profile's `verify` list: all 7 commands passed.
  - `npx --no-install prettier --check .`: passed.
  - `npx --no-install oxlint`: passed.
  - `npx --no-install tsc -p .`: passed.
  - `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 238 tests, 238
    passed, the 9 of `checks/changes.test.mjs` and the 6 of `services/github/runs.test.mjs` among them.
  - `claude plugin validate .`: passed.
  - `node checks/record.mjs`: passed.
  - `node checks/commits.mjs`: passed.

### Security review report, on `5bb799e`

**Verdict:** fail

**Findings**

1. `.github/workflows/project.yml:79` (with the `if:` lines at 85, 94, 97 and 112): the skip assumes the earlier run on `github.event.before` passed, but nothing checks that.
   - **What the step checks:** only that the trees of the old and new head differ in record paths. It never asks whether the earlier run succeeded, or whether there was one at all.
   - **Who can exploit it:** anyone who can push to a pull request's branch, including the author of a pull request from a fork. The kit's checks that still run can be satisfied by an outsider: a branch named `work/<id>-<slug>`, a record, `Work-Item` trailers, and author addresses they choose freely.
   - **Ways to do it:**
     - (a) Push code that fails `verify`, then push a commit that only touches `work/<yyyy>/<mm>/<id>-x.md`. The new head's `checks` job is green, and the red run stays on an older commit.
     - (b) Push the two commits back to back. `cancel-in-progress` cancels the run on the code, so no failed run exists anywhere.
     - (c) Open the pull request against any other existing branch. There is no run, because the caller filters on `branches: [<default>]`. Push the code, then retarget the pull request to the default branch; `edited` is not a default event type, so again there is no run. Then push a commit that changes only records. The only run the pull request ever has is green, and the code never went through `verify`.
   - **What they gain:** a required status check (branch protection or ruleset) is satisfied, and the person merges on a green `gh pr checks` for code the project's verification never passed. On a project with `merge-deploys: true` the merge is the deploy, so the full run on the default branch, which the change names as the place where the skip is caught, runs only after the code has shipped.
   - **Fix:** skip only when this job's run on `before`, against the same base, concluded `success`, read through the API (`actions: read` or `checks: read`). Run everything otherwise, and at minimum never skip for a pull request whose head repository is not this repository.

2. `checks/changes.mjs:68` and `checks/changes.mjs:75`: a file name from the pull request's commits is written raw to stdout, which lets it inject a workflow command.
   - **How the name gets there:** the first path that is not a record is read from `git diff -z`, which gives names verbatim with any newlines in them, and is then printed with `console.log`. The runner treats any stdout line that starts with `::` as a workflow command.
   - **The exploit:** in a later push, the author commits code changes plus a file named, for example, `!\n::set-output name=verify::false\n!`. That name sorts before all other paths, so it is the one printed. The runner then sets `steps.changes.outputs.verify` to `false`, even though the script exits 1 and the shell writes nothing to `GITHUB_OUTPUT`. The setup and verification steps are skipped and the run is green on a push that changes code.
   - **Precondition:** the runner must still honour the deprecated `::set-output` command. GitHub deprecated it in 2022 and postponed its removal in 2023.
   - **Fix:** never print a path unescaped, for example print `JSON.stringify(other)` or no name at all, so that no line of output can begin with `::`.

### Security review report, on `20db06c`, a repeated review since `5bb799e`

**Verdict:** pass

**Findings**

none

### Security review report, on `09df150`, a repeated review since `20db06c`

**Verdict:** pass

**Findings**

none

### Security review report, on `1d24ac7`, a repeated review since `09df150`

**Verdict:** pass

**Findings**

none

### Security review report, on `a784f87`, a repeated review since `1d24ac7`

**Verdict:** pass

**Findings**

none

### Security review report, on `84365ea`, a repeated review since `a784f87`

**Verdict:** pass

**Read:** `.github/workflows/` (project.yml, the whole file, not only the hunk); `services/github/` (README.md, lines 150-209, around the hunk). I also searched outside `work/` for any other place that states which steps get the token.

**Findings**

none

**Weak points**

none

The last review's one weak point is fixed. Both places now say "The actions above take the token as an input" (`.github/workflows/project.yml:74`) and "The actions take the token as an input" (`services/github/README.md:196`). That covers the two `actions/checkout` steps and `actions/setup-node` (lines 52, 60 and 66). All three come before the step that reads the earlier run, and no action follows it.

The new narrower claim also holds: "of the steps that run commands, this one alone gets it". The token appears once in `.github/`, as `GH_TOKEN: ${{ github.token }}` at `.github/workflows/project.yml:82`. The job-level `env` (lines 42-45) holds no token, and no other `run` step puts it in its environment. "before any of the project's commands runs" is still true, because that step runs only the kit's `checks/changes.mjs` and `services/github/runs.mjs`.

The README's other statements in item 6 match the workflow as it stands:
- both checkouts set `persist-credentials: false`;
- `setup-node` is given no `registry-url`, so it writes no `.npmrc` that would refer to a token;
- every action is pinned to a commit SHA.

The diff changes only a YAML comment and README prose. It changes no step, permission, input or command, so it opens nothing new.

**Not reviewed**

- What `actions/setup-node` does internally with its `token` input at the pinned commit `949feb2413d6458794dcd2491c4babbbce0c15c1`. Its source is not in this repository and I cannot fetch it from here. The docs now say that it receives the token and do not claim it leaves no trace.

### Checker report, on `1d24ac7`

**Verdict:** fail

**Findings**

1. Two document lines the diff adds run well past the 120 characters the documents wrap to (`.prettierrc.json`, `printWidth: 120`). Prettier's `proseWrap: preserve` does not catch this, which is why `verify` passes.
   - `docs/01-specs/WORKFLOW.md:376` ("…Whatever cannot be told runs everything. The opening of a pull request and every push to the default branch run them all: the default branch is") is about 180 characters.
   - `services/github/README.md:215` ("…counts as one minute while they take less. With no payment method on the account, runs stop when that amount is used and nothing") is about 170.
   - Fix: rewrap both paragraphs at 120.
2. `services/github/runs.mjs` runs as a command (`services/github/runs.mjs:735-739`, `import.meta.url === pathToFileURL(…)`), and the interface does not name it.
   - `docs/01-specs/INTERFACE.md:49-51` lists "the kit's other scripts" that are not part of the interface (`checks/pushed.mjs`, `checks/changes.mjs`, the hooks) and leaves it out.
   - `docs/01-specs/INTERFACE.md:115-116` says `checks/interface.test.mjs` fails when the kit has a script the document does not name. That no longer holds: the test reads only `checks/` and `hub/` (`checks/interface.test.mjs:63-64`), so this script passes it unnamed.
   - Fix: name `services/github/runs.mjs` among the scripts outside the interface.
3. `.github/workflows/project.yml:74` says "The token is in this step's environment alone". The two checkouts at lines 52 and 60 also get the token, through their default `token` input. `services/github/README.md:196` says so ("Besides the checkouts, only the step that reads the earlier run gets the token in its environment"), so the comment and the README state different facts. The last security review named this as a weak point, and the log leaves it to the person, but the comment is still inaccurate.
   - Fix: say in the comment, as the README does, that the checkouts get the token too.

### Checker report, on `84365ea`, a repeated check since `1d24ac7`

**Verdict:** fail

**Findings**

1. `checks/interface.test.mjs:62-74` and `:100`: the diff extends a kit test so that it also checks every script under `services/`. This changes what the kit enforces for any future folder there.
   - The file is not under "In scope".
   - It is not in the extension the person accepted under "Deviations" either: that lists `services/github/runs.mjs`, its test, `verify.yml`, `project.yml` and the interface's line.
   - Only the log mentions the change (record lines 359-361).
   - So this is a departure from the approved scope that the record does not declare. Fix: declare it under "Deviations".

### The checks of the record and of the commits, on `c52641c`

Only the record changed after `84365ea`:

- `node checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node checks/commits.mjs`: passed, the 14 commits of the branch follow the rules.

### Checker report, on `c52641c`, a repeated check since `84365ea`

**Verdict:** pass

**Acceptance criteria**

1. The rule on pushes is in `rules/git.md`, Delivery: met, at `rules/git.md:36-42`. It is unchanged since `84365ea`.
2. The worker waits for the checks and runs the checks that read the record on the closing commit, pointing to the rule: met, at `agents/worker.md:82` and `agents/worker.md:86`. Unchanged since `84365ea`.
3. `checks/changes.mjs` gives the right exit code for each case, and each case has a test: met. Neither the script nor `checks/changes.test.mjs` changed since `84365ea`, where the last check found every case covered.
4. `project.yml` skips the setup and `verify` on a later push that changes only records, shows a notice, and keeps the kit's checks: met.
   - The notice is at `.github/workflows/project.yml:87`, and the skip conditions are at lines 91, 100, 103 and 118.
   - The extra condition from the first entry under "Deviations" is in place.
   - Unchanged since `84365ea`.
5. The documents say what criteria 1 to 4 make true, and each raised budget has its reason: met. `docs/01-specs/INTERFACE.md:50-51` names both scripts, and the claim at line 116 holds through `checks/interface.test.mjs:62-75` and `:100`. Unchanged since `84365ea`.
6. `verify` passes, and the pull request's run on the work is green: the `verify` part is met (Verification, on `84365ea`; only the record changed since then). The run on the pull request is not verifiable: the branch is pushed after this check.
7. The run on the closing commit shows the skip, as a deferred check in `checks`: not verifiable. `checks` is still `[]` (record line 17), and both the check and the run come with the closing commit.

- **Intent:** in order
- **Scope:** in order. The diff since `84365ea` is empty. The last report's one finding is fixed: the extension of `checks/interface.test.mjs` is now declared under "Deviations" (record lines 566-569), with who accepted it, when and where.
- **Comments and documents:** in order. The diff adds no comment and changes no document.
- **Gates:** in order. The diff is empty, and the record's new text breaks none of the four gates.
- **Verification evidence:** in order; covers formatting, lint, types, tests.
- **Security review:** in order. It was due on the branch, since the branch touches `.github/workflows/project.yml`.
  - The reports run up to `84365ea`, and the last one names no finding and no weak point.
  - The two commits since then change only the record, which calls for no review.
- **Record:** in order. The earlier checker report, on `1d24ac7`, keeps only its verdict and findings, and the one on `84365ea` is kept in full. The new log entries and the new deviation quote no words of the person (`public: true`).
- **Commits:** in order. `ddacb40` "Stop the item for the person, since the checker asks to declare the extension of the interface's test as a deviation" and `c52641c` "Write the deviation the person accepted for the interface's test, and resume the item":
  - each is one imperative sentence;
  - each carries `Work-Item: 261124-1626` with the other trailers;
  - the addresses match `commits.address`;
  - the stop is a commit of its own.

**Findings**

none

**Not verified**

- The run on the pull request (criterion 6): the branch is pushed after this check.
- The run on the closing commit and its deferred check in `checks` (criterion 7): both come with the closing commit.
- No result under Verification covers `c52641c`, because the results are on `84365ea`. That leaves the checks that read the record without a result there: `checks/record.mjs`, `checks/commits.mjs` and the formatter. I read `checks/record.mjs` and `checks/commits.mjs` against the record and the commits `ddacb40` and `c52641c` and found nothing they would refuse. The rule has the session run these checks on the closing commit.
- At the start of this session, git status showed the record as modified against `c52641c`. I read the file on disk and cannot compare it with the committed version without git.

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

- The checker's repeated check of `84365ea` found that `checks/interface.test.mjs` now reads the scripts of each piece
  of `services/` too, outside the scope and the extension above. The interface says that its test fails on a script it
  does not name, and `services/github/runs.mjs` is the first script of a piece. The person accepted the test's
  extension on 2026-11-25, in the hub's session; the hub passed the decision on to this item's session.

## Outcome

- The core rules ask every session to push a work branch only with work that has passed the verification, the
  security review where it applies and the checker, as seldom as its commits allow; to wait for the hosting service's
  checks on the work and never start them again; to report a failure that does not come from the change; and to push
  the closing commit without waiting for its run, after running on it the checks that read the record. The worker's
  procedure points to the rule, and the workflow keeps its reasons.
- On GitHub, `project.yml` leaves the setup, Claude Code and the verification commands out of a later push to a pull
  request whose commits change only records, once the latest run on the branch's earlier tip passed, as
  `services/github/runs.mjs` reads it with `actions: read`. The opening of a pull request, every push to the default
  branch and whatever cannot be told run everything. `project.yml` names no permission of its own.
- What each project using the kit has to do: add `actions: read` beside `contents: read` in the `permissions` of its
  caller file, as the GitHub piece's README shows. Until then its checks keep working, and every push of its pull
  requests runs everything. The hub dispatches the change, as an item of each project, after this pull request is
  merged.
- Criterion 7 is a deferred check in `checks`: the run on this closing commit, which no session waits for.
