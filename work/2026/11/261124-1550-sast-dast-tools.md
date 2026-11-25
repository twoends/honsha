---
id: 261124-1550
title: Give projects static and dynamic security testing, where their technology and surface call for it
project: honsha
type: change
size: full
kind: capability
state: done
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: 59
model: claude-opus-5-5
effort: xhigh
checks:
  - { due: 2026-11-26, what: "The run on the closing commit of pull request 59, a push that changes only the record, shows in its `project` job that the run on the work passed, the setup, the verification and the dynamic testing skipped, and the checks of the record and of the commits passed" }
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, right after asking for a security review of sensitive
changes (the kit's item `261124-1549`), whether the kit could also include static and dynamic security testing tools,
and on 2026-11-25 to start it.

Static testing (SAST) reads the code: rules for a project's languages, for its shell scripts, its container files and
its pipeline's configuration, and a search for secrets committed by mistake. Free tools exist for each, such as Semgrep
with its open rules, ShellCheck and gitleaks; a hosting service's own scanners can be paid on private repositories,
and the kit's rules name no hosting service. Dynamic testing (DAST) attacks a running instance from outside, such as an
OWASP ZAP baseline scan: it fits a project with an HTTP surface, against a local or preview instance in the pipeline or
as a periodic check, and never against production without the person's leave.

Left: which kinds a project receives from its assessment and how the profile names them; whether static testing joins
the verification commands, a pipeline job or the security review of `261124-1549`; where dynamic testing runs, how
often, and against what; the cost in pipeline minutes, which are counted on private repositories, and how the skip of a
push that changes only records (the kit's item `261124-1626`) applies to it; and a host whose application control
refuses some native programs, where a tool then runs in the pipeline instead.

## Scope and acceptance criteria

### In scope

- A new skill, `skills/security-testing/SKILL.md`, `honsha:security-testing`: the kinds of static and dynamic testing
  a project receives and when each applies; static testing as part of `verify`, dynamic testing as the profile's new
  key `dynamic-testing`; what the scan for secrets reads; what dynamic testing attacks and what it never targets; how a
  tool is chosen and pinned; what a finding, a silenced finding and a found secret do.
- The profile: `templates/profile.yml` names static security testing among what `verify` covers, and holds
  `dynamic-testing`; `checks/profile.mjs` reads it, and `checks/verify.mjs --dynamic` runs it; their tests,
  `checks/profile.test.mjs` and `checks/verify.test.mjs`.
- The worker and the agents: `agents/worker.md` invokes the skill, runs `dynamic-testing` after `verify`, and says what
  becomes of a command that the host cannot run; `agents/checker.md` reads the evidence of those commands, reports
  whether `verify` covers static security testing, and counts a change that weakens the security testing among those
  the security review is due for; `agents/security-reviewer.md` judges a silenced finding.
- `skills/security-review/SKILL.md`: a change that weakens the security testing calls for the review.
  `skills/assessment/SKILL.md`, step 1 only: the profile's `verify` and `dynamic-testing` against the kinds that the
  skill asks of the project.
- The wiring for GitHub: `.github/workflows/project.yml` runs `checks/verify.mjs --dynamic` after the verification,
  under the same condition; `services/github/README.md` describes that step and its cost, the free tools that read
  GitHub's workflow files, and which of GitHub's own scanners a free account has.
- The documents: `docs/01-specs/WORKFLOW.md`, its sections "Profile", "Procedure" (the step Verify), "Security review",
  the contract in "The hosting service" (what a service's piece says, and what the checks run), and a new section
  "Security testing" with the reasons; `docs/01-specs/INTERFACE.md`, the skill and `--dynamic`;
  `docs/01-specs/ARCHITECTURE.md` and `README.md`, where they list the kit's skills.
- The budgets that the new text needs: `checks/budgets.test.mjs`, and the session-start total in
  `hooks/hooks.test.mjs`.

### Out of scope

- The kit's own security testing. The kit is a project too, and its tools would be new dependencies with a change to
  its lockfile: an item of its own, once this one and `261123-2103` are merged.
- Dynamic testing of a deployed instance, preview or production, and any run on a date.
- A hosting service's own scanners as something the rules rely on, paid or free.
- Choosing a project's tools and writing their rules: the item that sets up a project's security testing does, under
  the skill.
- What an installation's projects change: each gets its security testing in an item of its own, which an assessment
  proposes.
- `skills/dependencies/SKILL.md`, step 4 of the assessment and the workflow's "Dependencies", which `261123-2103`
  changes: this item points to the dependency rules and changes none of them.
- The host's lesson in the home that the rule on a command the host cannot run makes general.

### Boundaries

- Nothing breaks (interface, Changes to the interface): a skill, an optional key, an optional argument and a step of
  the pipeline that runs nothing without the key are added; nothing is renamed or removed. A project that changes
  nothing keeps working, and its checker says in each report whether `verify` covers static security testing.
- The rules name no hosting service and depend on no tool: tools appear in the skill as examples, and those that read
  a service's pipeline files in that service's piece.
- Nothing is installed or run beyond the trial's scratch repository, and dynamic testing attacks only the trial's own
  local instance.
- Shared with `261123-2103`, only where the changes lie apart and as the hub decides (`honsha:parallel-parts`): step 1
  of `skills/assessment/SKILL.md`, and the sections of `docs/01-specs/WORKFLOW.md` named above, apart from step 4 and
  from "Dependencies"; the workflow's budget in `checks/budgets.test.mjs`, raised by what this item's text needs.

### Acceptance criteria

1. The skill `honsha:security-testing` holds: the kinds, a scan for secrets in every project, the security rules of
   each of its languages, its shell scripts, container files and pipeline configuration where it has them, and
   dynamic testing where it serves HTTP; static testing as commands of `verify`, the scan for secrets reading every
   commit of the branch; dynamic testing as `dynamic-testing`, against a local instance started from the checkout with
   no secret, never against a deployed instance outside an item that names it, nor production without the person's
   leave; tools that are free, run from the command line, are pinned with their rules as `honsha:dependencies` says,
   and send nothing out; a finding fixed in the item that meets it, a silenced finding with its reason beside it, a
   found secret a stop condition.
2. `templates/profile.yml` names static security testing among what `verify` covers and holds `dynamic-testing`;
   `checks/profile.mjs` reads it as a list of commands and refuses another form; `checks/verify.mjs --dynamic` runs it
   as `--setup` runs `setup`, and refuses the two flags together. Tests cover each.
3. `agents/worker.md` invokes the skill for an item that sets up or changes the security testing or answers one of its
   findings, and runs `dynamic-testing` after `verify`; a command that the host cannot run whatever the change is
   written with the system's message, and its result comes from the pipeline's run on the work, except a scan for
   secrets, which stops the item. `agents/checker.md` takes such a command as not verifiable, reads the evidence of
   `dynamic-testing`, and reports whether `verify` covers static security testing.
4. A change that weakens the security testing, by removing or narrowing one of its commands or rules or by silencing
   one of its findings, calls for the security review: `skills/security-review/SKILL.md` and the checker's check 7 say
   so, and `agents/security-reviewer.md` says what the reviewer judges in a silenced finding.
5. `.github/workflows/project.yml` runs `checks/verify.mjs --dynamic` after the verification step and under its
   condition, so that a push that changes only records leaves it out; the step holds no token. The kit's pipeline runs
   it on this item's pull request.
6. The workflow, the interface, the architecture, the README and GitHub's piece say what criteria 1 to 5 make true, as
   "In scope" lists; the assessment's step 1 reads the kinds; nothing in the kit contradicts the new rules.
7. A trial on this host, in a scratch repository outside the installation, with `checks/verify.mjs` from this branch:
   `verify` with a scanner of secrets and ShellCheck fails on a fake token and an unquoted expansion, and passes once
   both are fixed; `dynamic-testing`, with a small application and OWASP ZAP's baseline scan in containers, fails on a
   missing response header whose rule is set to fail, and passes once the application sends it. The log says which of
   the tools this host's application control lets run as native programs.
8. The profile's `verify` commands pass, the security review and the checker pass, and the kit's pipeline passes on
   the pull request.

## Strategy

**The kinds.** A project receives each kind that its files and its surface call for: a scan for secrets in every
project, since any change can commit one; the security rules of each language it is written in, where a free tool has
them; its shell scripts, container files and pipeline configuration, where it has them; and dynamic testing where it
serves HTTP, as a web application or an API does. Its assessment reads, at step 1 beside what `verify` covers today,
which kinds apply and which the profile has, and proposes an item for each that is missing. The skill holds the list,
so that an assessment and the item that sets a kind up read the same one.

**Static testing joins `verify`,** as a fifth thing that the list covers beside formatting, lint, types and tests, with
no key of its own: the template's comment says so, and the checker says in every report whether the list covers it.
Against the two other places the intent names:

- A pipeline job would find a committed secret only after the push, when it is already on the hosting service, and
  would pay a run for what the worker could have found; it would also need wiring on each service.
- The security review cannot hold it: the reviewer runs no commands, and it reads only the changes that call for it,
  while a secret or an injection can come in any change.

In `verify` it runs at every verification, on the worker's host before the push and in the pipeline alike, and on the
closing commit too when a scanner reads the record, as the core rules already ask of the commands that read it. The scan
for secrets reads every commit of the branch and not only its last tree, since a push sends the history: from
`HONSHA_BASE` to `HONSHA_HEAD` where a pipeline gives them, from the default branch on the hosting service otherwise.

**Dynamic testing gets the key `dynamic-testing`,** a list of commands like `verify` and `setup`, run by
`checks/verify.mjs --dynamic`. Its commands start a local instance from the checkout and attack it from outside. Inside
`verify` they would run at each of the worker's runs of the list and fail on any host without a container engine.

- **Where.** At every verification, after `verify`: as a step of the worker's verification, before the push, for the
  reason the rule on pushes gives; and as a step of the pipeline, on the merge of the pull request with its base.
- **Against what.** A local instance started from the checkout under check, with no secret, since the pipeline's job
  holds none: it tests the change before it is merged, harms no environment and needs nobody's leave. The instance and
  the scanner run best in containers on one network, so that one command runs on every host and in the pipeline, and
  stops both when the scan ends. A deployed instance, preview or production, is never a target of these commands:
  scanning one is a work item that names it, and production needs the person's leave in that item's approval.
- **How often.** Not on a date. The tools and their rules are pinned, so a run on unchanged code finds nothing new; a
  new version of a tool comes in a work item, whose verification runs it.
- **How deep.** A passive baseline scan at least, such as OWASP ZAP's, which explores the application and reads its
  responses without attacking them; an active scan of the local instance where the project's item judges it worth its
  minutes.

The template's example:

```yaml
# The dynamic security testing of a project that serves HTTP (`honsha:security-testing`): commands that start a local
# instance from the checkout and attack it from outside, which every verification runs after `verify`, in the same list
# form and default shell. Left out, there is none.
dynamic-testing:
  - docker compose -f compose.scan.yml up --abort-on-container-exit --exit-code-from scanner
```

**The tools.** Free, run from the command line on any host and in the pipeline, with no account: a hosting service's
own scanners can be paid on private repositories, and the rules rely on nothing a service sells; one that a service
gives free is a further stop, as its alerts on dependencies are. Each tool is a dependency, pinned and taken at a new
version as `honsha:dependencies` says: a package of the project's lockfile, a container image by its digest, or a
release by its checksum. Its rules are pinned with it: rules fetched at each run change without a work item, and a check
that changes by itself fails on code that did not. It sends nothing out while it runs, with telemetry and online rule
registries off, and it fails its command on a finding. The skill names examples, each free: gitleaks, secretlint and
detect-secrets for secrets; Semgrep's community edition, with a pinned rule set, for languages; ShellCheck; hadolint for
container files; OWASP ZAP for HTTP. GitHub's piece names zizmor and actionlint for its workflow files, and which of
GitHub's own scanners a free account has, read in GitHub's documentation during the work. The workflow's contract for a
service's piece gains that point, so that the piece of another service says the same.

**A finding** is fixed in the item that meets it: one in the item's own change is the change's, and one that a new tool
or a new version of a tool brings up belongs to the item that takes the tool. A finding the worker believes mistaken
is silenced only where it stands, by an inline suppression or an entry of the tool's ignore file, with its reason beside it. That change, and
any change that removes or narrows a command or a rule of the security testing, calls for the security review:
silencing a finding is a judgement on a possible hole, which the worker that wrote the change does not make alone, as it
does not set aside a reviewer's finding. The security review's skill adds the case to "When", the checker to check 7,
and the reviewer judges whether the reason holds. The skill asks a project to list its tools' configuration and ignore
files under `security-review`, so that `checks/record.mjs` names a change to them. A secret found in a commit is a stop
condition: the branch only grows, so the commit stays in the history that a push sends, and a secret that reaches the
hosting service must be revoked; the person decides.

**A host that cannot run a command.** This host's application control refuses some native programs, as it has refused
a native binding of the kit's own linter, and a security tool may be one. The rule goes into the worker's verification,
for every command, since the case is not one of security tools alone: a command that the host cannot run whatever the
change is written with the system's message, and its result is the pipeline's run on the work, which the worker already
waits for before the closing commit. The checker takes such a command as not verifiable, not as a finding. The scan for
secrets is the exception: what the pipeline finds there is already on the service, so a host that cannot run it stops
the item, and the skill asks for a scanner that every host of the installation runs, such as one written in the
language of the project's own package manager.

**Cost and the skip.** Static tools add seconds to each verification, up to a minute for an engine of rules.
Dynamic testing adds the pull of its images, the start of the instance and the scan, likely three to five minutes for a
small application's baseline, to each run that verifies: on a pull request its opening and each later push of work,
and on the default branch the push of its merge, so about two runs for an item. On a private repository the account
pays those minutes. A later push that changes only records leaves it out with the setup and the verification: the new
step has their condition, and the contract names it. The trial measures the time on this host; the pipeline's figure
comes from the first project that sets dynamic testing up.

**The documents and their budgets.**

- `agents/worker.md`, at 5,968 characters of its 6,000, gets 6,400 for the invocation of the skill, the step of
  `dynamic-testing` and the rule on a command the host cannot run; all three apply at an item's verification, where no
  skill is loaded, so they cannot move to one. The session-start total in `hooks/hooks.test.mjs`, which counts the
  worker's file at its budget and has 31 characters left at a worker's start, rises by as much, from 31,150 to 31,550.
- `docs/01-specs/WORKFLOW.md`, at 39,293 of its 39,300, gets about 42,000 for the new section and the contract's lines;
  `261123-2103` raises the same line by what its own text needs (`honsha:parallel-parts`).
- `templates/profile.yml`, at 4,627 of its 4,700, gets about 5,200 for the new key.
- The checker's file, the reviewer's, the skills and the interface stay within their budgets.

**The files.** Changed: `skills/assessment/SKILL.md`, `skills/security-review/SKILL.md`, `agents/worker.md`,
`agents/checker.md`, `agents/security-reviewer.md`, `templates/profile.yml`, `checks/profile.mjs`,
`checks/profile.test.mjs`, `checks/verify.mjs`, `checks/verify.test.mjs`, `.github/workflows/project.yml`,
`services/github/README.md`, `docs/01-specs/WORKFLOW.md`, `docs/01-specs/INTERFACE.md`,
`docs/01-specs/ARCHITECTURE.md`, `README.md`, `checks/budgets.test.mjs` and `hooks/hooks.test.mjs`. New:
`skills/security-testing/SKILL.md`.

**Plan.** After the approval, the scripts and their tests come first, with the template's new key, since the
template's test reads its example. Then the trial runs in a subagent on this session's tier, in the scratchpad, while
this session writes the skills, the agents, the pipeline and the documents, which change nothing the trial reads. The
change itself is not split into parallel parts: the scripts' tests read the template, and the scripts and the documents
share `checks/budgets.test.mjs`, so they fail the test of `honsha:parallel-parts`. Then the verification, the security
review, which is due since the change touches CI configuration, the checker, the pull request, the wait for its checks
and the closing commit. The work runs on the strong tier at xhigh, as a full item does; it asks for no stronger tier or
effort.

**How each criterion is shown.** 1 to 4 and 6: the files, read by the checker; 2 also the scripts' tests. 5: the diff
of `project.yml` and the pull request's first run, whose `project` job runs the new step and finds no command in the
kit's profile. 7: the trial, in the log. 8: the profile's `verify` on this host, apart from a command its application
control stops, which the pipeline then runs; the reports; the pull request's run.

**Assumptions.** The service's Linux runners have a container engine with compose, as GitHub's do. OWASP ZAP's baseline
exits with a code other than 0 on a rule set to fail, and runs with its checks for updates off. Linux containers on this
host's container engine are not stopped by its application control. The trial checks the last two.

**Risks.**

- Dynamic testing at every verification costs minutes at each run, on the worker's host and on a private repository,
  and a slow instance costs more: the item that sets it up measures it, and the person approves it there.
- Rules of static testing raise false findings, and each one silenced costs a security review.
- A worker could take a failure of the change for one that the host causes: the system's message and the pipeline's
  result, in the record, keep it in front of the checker and the person.
- A worker's session pays 400 more characters at start.

**For the person.**

- Five choices made here, each against an alternative: static testing in `verify`, not a pipeline job or the review;
  dynamic testing at every verification against a local instance, not a weekly run on the default branch, which would
  cost less and find a hole only after its merge; the rule on a command the host cannot run for every command, not for
  security tools alone; a silenced finding calls for the security review; a new skill, not more text in the
  assessment.
- The trial downloads, each at a version released at least 7 days earlier and checked against its digest or checksum:
  OWASP ZAP's stable image, over 1 GB; a Node.js 26 image for the scratch application, about 50 MB; the images of
  gitleaks and ShellCheck, tens of MB; and their releases for Windows, about 10 MB each, to learn whether this host's
  application control runs them. Approving this strategy gives leave for these downloads; without it the trial and
  criterion 7 are left out.
- The change touches 18 existing files, where the profile's `kinds` expects 3 of a capability; the measure only
  reports it.
- Left to later items: the kit's own security testing; the host's lesson in the home, which this rule makes general;
  the security testing of an installation's projects, from an assessment or an item that the person asks for.

## Approval

Approved by the person on 2026-11-25, in this item's session, as written in `bb38740`, with the trial: the five
choices and the trial's downloads listed under "For the person" included.

## Log

- The record was given by the hub when it started the item; its intent is restated as the core rules ask of a public
  project. The branch was cut from `origin/main` after `git fetch`, and its upstream unset, so that no push can follow
  `origin/main` by default.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` from the kit directory ran once in the worktree before the first commit, with this
  host's npm 12.2.1: `npm ci --ignore-scripts` passed.
- `261123-2103` runs at the same time, started by the hub under `honsha:parallel-parts`; its brief expects it to change
  `skills/dependencies/SKILL.md`, step 4 of `skills/assessment/SKILL.md` and the workflow's "Dependencies". This item
  changes step 1 of the assessment and other sections of the workflow, and both raise the workflow's budget. The other
  files the strategy names go to the hub with the request for approval, so that it decides on any that the other item
  changes too.
- Read the workflow, the interface, the architecture's components, layout, security and models, the agents' files,
  the skills, the profile's template and the kit's profile, `project.yml` and `verify.yml`, GitHub's piece,
  `checks/profile.mjs`, `checks/verify.mjs` and the tests of budgets, of the profile, of verify and of the hooks, and
  the records of `261124-1549` and `261124-1626`.
- Measured the budgets: `agents/worker.md` holds 5,968 of 6,000 characters, `docs/01-specs/WORKFLOW.md` 39,293 of
  39,300, `templates/profile.yml` 4,627 of 4,700; at a worker's start a session receives 31,119 of the 31,150 that
  `hooks/hooks.test.mjs` allows, measured with a copy of that test left uncommitted and deleted.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The hub decided on the files shared with `261123-2103` (`honsha:parallel-parts`): the two items run at the same time
  and share three files whose changes lie apart. In `skills/assessment/SKILL.md` this item changes step 1, the other
  step 4; in `docs/01-specs/WORKFLOW.md` the other changes only "Dependencies", this item the sections its strategy
  names, with "Security testing" placed after "Security review" so that unchanged lines stand between the two changes;
  in `checks/budgets.test.mjs` both raise the workflow's budget, which the item merged second sets for both once it is
  brought up to date.
- The person approved the strategy (Approval); the state is `in-progress`.
- No part of the change ran in parallel, as the strategy says. The trial ran in a subagent on Opus, in the scratchpad,
  while this session wrote the skills, the agents, the pipeline and the documents; a lookup in GitHub's documentation
  and in the tools' own ran in a subagent on Haiku at medium effort.
- `checks/profile.mjs` reads `dynamic-testing` as it reads `verify` and `setup`, a list of commands, and refuses the
  same other forms. `checks/verify.mjs --dynamic` runs it as `--setup` runs `setup`; two flags, or a flag it does not
  know, print the usage and run nothing. Four new tests, and the template's test expects its new example.
- `templates/profile.yml`: `verify` covers five things, the fifth the static security testing that the skill asks;
  `dynamic-testing` after `verify`, with the strategy's example; `setup` prepares the checkout for both.
- `skills/security-testing/SKILL.md` is written as the strategy says: the kinds, where the profile names them, the
  tools with their examples, a finding, a silenced finding and a found secret.
- `agents/worker.md`: the skill named for an item that sets up or changes the security testing or answers one of its
  findings; `dynamic-testing` after `verify` in Verification step 1; a command the host cannot run whatever the change,
  and the scan for secrets that stops the item. Its first wording held 6,452 characters; shortened, it holds 6,399 of
  the approved 6,400.
- `agents/checker.md`: check 6 reads `dynamic-testing`, takes a command the host could not run as not verifiable and a
  scan for secrets left so as a finding, and says whether `verify` covers static security testing, with `security` in
  the report's line; check 7 counts a change that weakens the security testing. `agents/security-reviewer.md`: a new
  point 7, a silenced finding, before the point on any other weakness.
- `skills/security-review/SKILL.md`: the case in its description and in "When". `skills/assessment/SKILL.md`: step 1
  reads `verify` and `dynamic-testing` against the kinds of the skill; step 4 is untouched.
- `.github/workflows/project.yml`: the step "Run the dynamic testing commands of the profile" after the verification,
  with its condition and no environment of its own; the notice on a run that skips names the dynamic testing too.
- `services/github/README.md`: the new step and the runner's Docker with Docker Compose in answer 2, the two steps the
  skip leaves out, the minutes dynamic testing adds, and a section "Static testing of the workflows" naming zizmor and
  actionlint and which of GitHub's own scanners a free account has. Its facts come from the lookup of 2026-11-25:
  zizmor's and actionlint's documentation, GitHub's documentation of code scanning and secret scanning, and the
  software list of GitHub's Ubuntu 24.04 runner image, which lists Docker and Docker Compose 2. Whether push
  protection is on by default on a public repository was not settled there, so the piece does not say.
- `docs/01-specs/WORKFLOW.md`: "Profile" names three command keys, the step Verify the dynamic testing, the piece of a
  service a point 7, the contract's "What it runs" the new list and the skip, the closing paragraph `--dynamic`,
  "Security review" the new case; "Security testing" stands after "Security review", apart from "Dependencies". Its
  first wording took the workflow to 42,820 characters; the section was shortened to the reasons, which the skill's
  rules do not repeat, and the workflow holds 41,633.
- `docs/01-specs/INTERFACE.md` names the skill and `[--setup | --dynamic]`; `docs/01-specs/ARCHITECTURE.md` and
  `README.md` add the skill to their lists.
- Budgets: `agents/worker.md` 6,400, `templates/profile.yml` 5,200 (it holds 5,121), `docs/01-specs/WORKFLOW.md`
  42,000; the session-start total in `hooks/hooks.test.mjs` 31,550. The other documents stay within theirs: the
  checker's file 6,724 of 7,600, the reviewer's 5,093 of 6,000, the new skill 5,070 of 6,000 with the line the trial
  added.
- The whole test suite passes on the change, 255 tests, with Prettier, oxlint and tsc.
- Criterion 7, the trial, in a scratch repository in the session's scratchpad, outside the installation, run with
  `checks/verify.mjs` from this worktree. Its tools, each at a version released at least 7 days earlier and pinned:
  gitleaks 8.30.1 and ShellCheck 0.11.0 by their images' digests, OWASP ZAP 2.17.0 by the digest of
  `zaproxy/zap-stable:2.17.0`, built on 2026-11-03, and Node.js 26.13.1 by the digest of its Alpine image. Branch
  `work/1-findings` adds a fake token in the form of a personal access token and a shell script with an unquoted
  expansion, and serves pages without `X-Content-Type-Options`; branch `work/2-clean` reads the token from the
  environment, quotes the expansion, and sends the header.
- Static testing: the scratch profile's `verify` runs gitleaks on the branch's commits, `git --redact --verbose
  --log-opts=main..HEAD`, and ShellCheck on each script, both from their images. On `work/1-findings`
  `node checks/verify.mjs` exits 1: gitleaks reports rule `github-pat` in `config/app.env`, line 2, with the secret
  redacted, and ShellCheck, run alone, reports SC2086 in `scripts/clean.sh`, line 5. On `work/2-clean` it exits 0.
  Without `--redact` gitleaks prints the secret it finds; the skill now says that the scan prints no secret, since
  others read a pipeline's output. `cmd.exe`, this host's default shell for the commands, does not expand
  `scripts/*.sh`, and ShellCheck's image has no shell: the scratch profile loops over the files in `cmd.exe`'s syntax,
  which a Linux runner would not read. Writing a command for the default shell of each host is the project's, as the
  template already says.
- Dynamic testing: the scratch profile's `dynamic-testing` is the template's example. `compose.scan.yml` runs the
  application from the pinned Node.js image with a health check, and ZAP once it is healthy, with
  `zap-baseline.py -t http://app:3000 -c rules.tsv -I -z -silent` and `rules.tsv` setting rule 10021,
  `X-Content-Type-Options` header missing, to FAIL. `-I` lets only a FAIL fail the run; `-z -silent` keeps ZAP from
  its check for updates and its other requests, which the baseline script otherwise makes at start, and ZAP's log names
  no address but the target's. Its working folder is mounted read-only, since the script writes its plan there at
  every run. On `work/1-findings` `node checks/verify.mjs --dynamic` exits 1, with 1 FAIL, 10021 on `/` and `/about`,
  and 2 warnings, 10020 and 10038, that `-I` lets through; on `work/2-clean` it exits 0. The run takes about 20
  seconds with the images present, ZAP itself about 14, and 97 seconds when the images are pulled first, 73 of them
  for ZAP's image, 3.7 GB unpacked. Nothing was left running.
- This host's application control, on and enforcing, let both native programs run, though neither is signed:
  `gitleaks.exe version` printed 8.30.1, and gitleaks scanned the findings branch natively with the same result;
  `shellcheck.exe --version` printed 0.11.0. gitleaks's archive matched its release's checksums file. ShellCheck's
  release publishes none, and its archive matched the digest that GitHub gives the release's file.
- On this host `docker desktop status` read "stopped" while the engine answered `docker info`; the trial went by the
  engine. This is a lesson of the host, for the person.
- The security review is due, since the change touches CI configuration. Its report on `d452187` passes, with no
  findings and six weak points:
  1. The comment of the new step in `project.yml` said the step is given no secret and no token, while the project's
     code that it runs can read the token from the runner's memory: fixed, the comment says so.
  2. A pull request opened before this change reaches the kit's default branch can leave out the dynamic testing on
     its closing commit after a run on its work that had no such step: left to the person. It can happen once, at the
     change, and the push of the merge runs everything.
  3. `checks/record.mjs` names neither a change of the profile that weakens a command nor an inline suppression:
     left to the person. The skill asks for the tools' configuration and ignore files under `security-review`, the
     checker reads the rest in the diff, and listing the profile there too is each project's choice.
  4. The profile's reader lets a later occurrence of a key win and ignores a misspelt key, so a second, empty
     `dynamic-testing` passes in silence: left to the person. The reader has always read every key so, and refusing a
     repeated or unknown key is a change of its own.
  5. A worker's statement that the host cannot run a command makes the checker take it as not verifiable: left to the
     person, as the approved choice. The pipeline's result is written before the closing commit, and the scan for
     secrets is excluded.
  6. The skill did not say how an instance keeps "no secret" on a worker's host, where compose fills variables from
     the environment and from an uncommitted file of variables, and publishes ports on every interface: fixed, the
     skill says that nothing reaches the instance from either, and that it publishes no port, or only on the loopback.
- The two fixes are a commit of their own. The verification ran again on it, and the review was repeated on what it
  changed.
- Lines that the work's edits left wider than the kit's documents, 120 characters, are wrapped in two commits of their
  own: one in the new skill, then one in `project.yml`'s comments, the checker's file, the workflow, GitHub's piece
  and the security review's skill. The words are unchanged.
- The repeated security review, of `286dff4`, passes with no findings, and confirms both fixed weak points. Its one
  new weak point: the skill's reason said the network around the host was out of the scan's reach, while publishing
  no port only keeps other machines from reaching the instance, and an active scan that makes the instance call out
  could still reach the host's network. Fixed in its own commit: the reason now claims only what the rule gives. A
  network with no way out for an active scan, which the review proposes, is left to the person: it is a further rule
  for projects, which the trial did not try. The fix changes only the skill, none of the cases the review guards, so
  no further review is due.
- The first check, of `30a3fcd` (full), fails on one finding: the two commits that wrap lines, `7f6dc23` and
  `286dff4`, make one correction in two commits, where the core rules ask an item to make as few commits as it can.
  The wrap was made first in the new skill alone, before a search of the other changed files found more such lines.
  A branch only grows, so the finding cannot be fixed inside the scope: a stop condition. The state is `blocked`, and
  the person decides whether to accept it under "Deviations".
- The hub says that `261123-2103` is merged into the kit's default branch, at `042cf46`: this item, merged second, is
  brought up to date before its merge, and sets the workflow's budget for both. The merge waits for the repeated check
  of the finding above (`honsha:branch-update`).
- The person accepted the finding (Deviations); the state is `in-progress`.
- The second check, of `3f8707e`, passes with no findings.
- The default branch, at `042cf46` with `261123-2103`, is merged in `4d80ed1` (`honsha:branch-update`). It conflicted
  only on the workflow's budget in `checks/budgets.test.mjs`, 39,500 there and 42,000 here: the two changes together
  hold 41,830 characters, so the budget stays at 42,000. The template's 5,200 stays, since the other item did not
  change it. Git merged step 4 of the assessment, the workflow's "Dependencies" and `skills/dependencies/SKILL.md` with
  this item's changes on its own. The verification ran again on the merge and passed. The merge's own diff,
  `git show --cc 4d80ed1`, is empty, since its resolution keeps this branch's line: it touches nothing the security
  review guards, and a repeated check reads it.
- The third check, of `4d80ed1`, fails on one finding: Verification gave its results at `30a3fcd`. The check read the
  record while the results on the merge were being written there. They are written now, and a repeated check reads
  them.
- The fourth check, of `4d80ed1` with the results on the merge, passes with no findings.
- The pull request is #59. The kit's pipeline on it, run 45677757658 at `4d80ed1`, passed: `verify` on Linux and on
  Windows, `personal content` and `project`, whose new step "Run the dynamic testing commands of the profile" ran and
  found no command in the kit's profile. Criteria 5 and 8 are met.

## Verification

On this host, at `4d80ed1`, the merge of the default branch, with the record as it stands, with npm 12.2.1, the same
results as at `d452187`, `286dff4` and `30a3fcd`:

- `node <kit directory>/checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node <kit directory>/checks/commits.mjs`: passed, the 10 commits of the branch follow the rules.
- `node <kit directory>/hub/projects.mjs check`: not run, the root holds no `registry.yml`.
- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 255 tests, 255 pass.
- `claude plugin validate .`: passed, with warnings on the plugin's version and icon, a licence that the plugin
  directory would ask for, and advice on the README's install line, none of which this change touches.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.
- The kit's profile lists no `dynamic-testing`: `node checks/verify.mjs --dynamic` says so and passes.

The first security review, of `d452187` (full): verdict `pass`, no findings.

The second security review, of `286dff4` (since `d452187`):

### Security review report

**Verdict:** pass

**Read:** `.github/workflows/` (project.yml), `agents/` (checker.md), `docs/01-specs/` (WORKFLOW.md), `services/github/`
(README.md), `skills/security-review/` (SKILL.md), `skills/security-testing/` (SKILL.md). For context I also read
`checks/verify.mjs` (how `--dynamic` hands the environment to the commands), `templates/profile.yml` (the example
`dynamic-testing` command) and the WORKFLOW.md section "Security testing".

**Confirmation of the earlier weak points**

1. `.github/workflows/project.yml:121-124`: fixed. The comment now says the step's environment holds no secret and no
   token, and that the project's code it runs can read the token from the runner's memory, as the verification's code
   can. This matches the step: it has no `env` of its own, only the job's `HONSHA_*`. It also matches the note at lines
   75-77 and `services/github/README.md:198-202`.
2. `skills/security-testing/SKILL.md:30-32`: fixed. The rule now applies on a worker's host as well. Nothing reaches
   the instance from the host's environment or from an uncommitted variables file, and the instance publishes no port,
   or only on the host's loopback. That closes both channels the weak point named: compose filling variables from the
   host's environment or `.env`, and ports published on every interface.

**Findings**

none

**Weak points**

1. `skills/security-testing/SKILL.md:30-32`: the rule gives as its reason that "the network around the host" is out of
   the scan's reach, but the measure it names, publishing no port or only on loopback, only blocks inbound traffic:
   other machines cannot reach the instance. It does nothing about outbound traffic. On compose's default network, the
   instance and scanner containers can still reach the host's LAN, and in the pipeline the internet. An active scan
   that sets off a server-side request or an open redirect in the instance could therefore make it call services next
   to the worker's host. As written this cannot be exploited: the skill is a rule, no project's compose file is in
   this change, the scanner targets only the local instance, and a test value stands in for every secret. Fix: put
   the instance and scanner on an `internal: true` network, or reword the reason so it claims only what the port rule
   achieves.

**Not reviewed**

- The projects' own `dynamic-testing` commands and compose files are not in this repository. Whether a given project
  keeps the host's environment, its `.env` and its ports out of the instance can only be judged in a review of that
  project's change.
- The rest of the diff (project.yml lines 69-74, `agents/checker.md`, `docs/01-specs/WORKFLOW.md`,
  `services/github/README.md`, `skills/security-review/SKILL.md`) only rewraps lines. I compared each against its old
  text word by word: nothing was added or removed, so there is nothing further to review there.

The first check, of `30a3fcd` (full): verdict `fail`, one finding. Commits `7f6dc23` "Wrap a line of the security
testing skill at the width of the kit's documents" and `286dff4` "Wrap the lines that the change left wider than the
kit's documents" make the same correction, line wrapping with the words unchanged, in two consecutive commits, where the
core rules (Commits and branches) ask an item to make as few commits as it can; the branch only grows, so the person
accepts it under "Deviations" or not.

The second check, of `3f8707e` (since `30a3fcd`): verdict `pass`, no findings.

The third check, of `4d80ed1` (the merge's own diff): verdict `fail`, one finding. "Verification" gave the results of
the `verify` commands at `30a3fcd`, while `4d80ed1` merged into the tree the default branch's changes to files that
`verify` reads; no command's result on `4d80ed1` was written under "Verification".

The fourth check, of `4d80ed1` (since `4d80ed1`, with the results on the merge):

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The skill `honsha:security-testing` holds the kinds, where the profile names them, the tools, a finding, a silenced
   finding and a found secret: met, `skills/security-testing/SKILL.md:9-17`, `23-37`, `41-56`, `60-69`.
2. The template names static security testing and holds `dynamic-testing`. The profile reader reads it as a list of
   commands and refuses any other form. `--dynamic` runs it and refuses to go with another flag. Tests cover each:
   met, `templates/profile.yml:29`, `34-37`; `checks/profile.mjs:168-171`; `checks/verify.mjs:49-62`;
   `checks/profile.test.mjs:50-67`, `133-136`, `156`; `checks/verify.test.mjs:69-97`.
3. The worker invokes the skill and runs `dynamic-testing` after `verify`. It writes down a command that the host
   cannot run and takes its result from the pipeline, except a scan for secrets, which stops the item. The checker
   takes such a command as not verifiable and reports whether `verify` covers static security testing: met,
   `agents/worker.md:35-37`, `50-56`; `agents/checker.md:48-54`.
4. A change that weakens the security testing calls for the review: met, `skills/security-review/SKILL.md:3`, `12-13`;
   `agents/checker.md:55-57`; `agents/security-reviewer.md:47-49`.
5. `project.yml` runs `--dynamic` after the verification, under its condition, and the step holds no token: met,
   `.github/workflows/project.yml:118-127`. The kit's pipeline running it on this item's pull request is not
   verifiable: no pull request exists yet.
6. The workflow, interface, architecture, README, GitHub's piece and assessment step 1 cover what criteria 1 to 5 make
   true: met, `docs/01-specs/WORKFLOW.md:251`, `381-386`, `404`, `507-510`; `docs/01-specs/INTERFACE.md:26`, `45`;
   `docs/01-specs/ARCHITECTURE.md:79`; `README.md:18`; `services/github/README.md:173`;
   `skills/assessment/SKILL.md:15-18`.
7. The trial in a scratch repository, with both static and dynamic testing failing and then passing, and which tools
   the host's application control lets run: met as the log records it,
   `work/2026/11/261124-1550-sast-dast-tools.md:353-382`.
8. `verify` passes, the security review passes and the checker passes: met, Verification and the second security
   review report. The kit's pipeline passing on the pull request is not verifiable: no pull request exists yet.

- **Intent:** in order
- **Scope:** in order. The diff since `4d80ed1` is empty.
- **Comments and documents:** in order. The diff since `4d80ed1` is empty.
- **Gates:** in order
- **Verification evidence:** in order. The last report's finding is fixed: Verification now gives the results of every
  `verify` command, and of the kit's `checks/record.mjs` and `checks/commits.mjs`, at `4d80ed1`, the merge. Its count
  of 10 commits on the branch matches the branch's history (`bb38740` to `4d80ed1`). The profile lists no
  `dynamic-testing`. Covers formatting (prettier), lint (oxlint), types (tsc) and tests (node --test). It does not
  cover static security testing; the record puts the kit's own security testing out of scope as a later item, and no
  gate asks for it.
- **Security review:** not due. The diff since `4d80ed1` is empty.
- **Record:** in order. The new text only appends the third check's entry to the log and updates Verification: its
  header now names `4d80ed1`, and the third check's verdict and finding are summed up. Earlier reports keep only their
  verdict and findings.
- **Commits:** in order. No commit since `4d80ed1`.

**Findings**

none

**Not verified**

- The kit's pipeline on the pull request (criteria 5 and 8): no pull request exists yet.
- Whether the record's uncommitted change touched only Verification and the end of the log: the diff file leaves the
  record out, so the log's append-only rule was judged from the record as it stands, not from a comparison with
  `4d80ed1`.

## Deviations

- The two commits that wrap lines, `7f6dc23` and `286dff4`, make one correction in two commits, which the first check
  found. Accepted by the person on 2026-11-25, in this item's session.

## Outcome

Projects get static and dynamic security testing where their files and surface call for it, under the new skill
`honsha:security-testing`. Static testing is part of `verify`, a fifth thing the list covers, with a scan for secrets
over the branch's commits that prints no secret. Dynamic testing is the profile's new `dynamic-testing`, which
`checks/verify.mjs --dynamic` runs after `verify` on the worker's host and in `project.yml`, against a local instance
with no secret, and which a push that changes only records leaves out. A command the host cannot run goes to the
pipeline, except a scan for secrets, which stops the item; a change that weakens the security testing calls for the
security review. The assessment, the checker, the reviewer, the workflow, the interface and GitHub's piece say so. The
trial showed both kinds failing on planted holes and passing once they were fixed, on this host. Four weak points of the
security review, the kit's own security testing and the host's lesson are left to the person.

Deferred check: the run on the closing commit, which changes only the record, shows in its `project` job the dynamic
testing step skipped with the setup and the verification (`checks`).
