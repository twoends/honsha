---
id: 261126-2215
title: Simplify what the last security items added to the kit, keeping what each of them guards
project: honsha
type: change
size: full
kind: upkeep
state: in-progress
areas: []
created: 2026-11-26
updated: 2026-11-26
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked, on 2026-11-26 in the hub's session, after a critical review of what the workflow costs in practice,
to review the work done on the kit and simplify it where possible without losing value. This item takes what the
security items of 2026-11-25 and 2026-11-26 added: the scan of a repository's whole history,
`checks/history-secrets.mjs` with its test; the skill `honsha:security-posture`; the changes to
`honsha:security-testing`; the reads that GitHub's piece gained for the protections, the alerts and a repository's
access; the rules on accounts and credentials; and the kit's own security testing, `checks/releases.mjs` and
`checks/security-testing.mjs` with their tests, their tools and the paths of the security review in the kit's profile.

What each of them guards stays: a secret in a history found and never printed, the posture read again at each review,
a credential that deploys kept from a pull request's runs, the kit's own code and workflows tested. What can go is
text that states a rule already stated elsewhere, steps or reads that no project needs, code that a simpler form does
as well, and tools whose findings the kit's files cannot have. The weak points that the security reviews of those
items left to the person are weighed here too, each fixed if the fix is small and real, or set aside with its reason.

## Scope and acceptance criteria

### In scope

- **GitHub's piece in two files.** `services/github/README.md` keeps what a worker and a project's setup read: the
  commands, the settings the rules rely on, the install of the kit, what GitHub enforces and the wiring of the checks.
  A new `services/github/security.md` takes what only an assessment, the periodic review and an item of security
  testing read: the protections and their reads, the open alerts, who and what can reach a repository with where a
  credential that deploys is kept, the account and its token, the static testing of the workflows and the refs of the
  history. Both lose what another document states and the reads that serve no project.
- **The skills this item owns,** `honsha:security-testing`, `honsha:security-posture`, `honsha:review`,
  `honsha:assessment` and `honsha:dependencies`: descriptions that say when each applies, a rule stated in one of them
  and pointed to from the others, and pointers to the file of the piece that each reads.
- **The two scans of secrets on one set of functions,** in `checks/history-secrets.mjs`, which
  `checks/security-testing.mjs` takes: the scanner's arguments, its run, its version, an ignore list and a finding's
  lines; the history scan's report by commit.
- **The kit's own security testing:** `checks/security-testing.mjs` without its `shellcheck` command; the `verify` and
  `security-review` keys of `.hub/profile.yml` and its comment; the tests of the three scripts.
- **The workflow's sections** "Security testing", "Security posture" and "Accounts and credentials", and, once the hub
  agrees, one sentence of "What the piece of a service says".
- **`checks/budgets.test.mjs`:** the lines of the skills, the workflow and GitHub's two files, each set to what this
  change needs.
- **The weak points** that the security reviews of `261124-1550`, `261125-1913`, `261125-2038`, `261125-2039` and
  `261125-1850` left to the person, as the home's ideas `261125-1849` and `261126-1422` and the descriptions of pull
  requests 62 to 65 list them: each fixed here, or set aside with its reason (Strategy, The weak points).

### Out of scope

- Anything a part guards: no protection, read, rule on a finding, pin or kind of testing that a project needs goes, and
  nothing that a project's profile, workflow file or the kit's interface relies on changes.
- The scanner, and a move to Betterleaks; the mirror, the refs that the history scan reads, the masking of a finding's
  line, and the rule on pull requests that people outside the project open.
- New reads: a repository's applications and webhooks, a private repository's setting that sends secrets to forks'
  runs, the locations and authors behind an alert.
- The files of `261126-2213` and `261126-2214`, and their parts of the workflow, the interface, the architecture, the
  README and GitHub's piece, but for the lines that "Boundaries" asks of the hub.
- The home: its inventory, its decision log, and its backlog, from which the hub drops what this item answers.
- A project's own files, which its next posture reading reads against the rules as they stand after this item.

### Boundaries

- The files the hub gave this item, as its notes list them. Outside them, only once the hub agrees, before the work: in
  the workflow's "What the piece of a service says", which neither other item lists, one sentence on which file of a
  piece holds what; `checks/profile.test.mjs:172`, which names the four commands of the kit's security testing, the
  word `shellcheck`; `README.md:121`, which names ShellCheck among the kit's checks, a few words. A line that the hub
  keeps for another item is changed there, and this item relies on it only once that item is merged.
- The budgets' lines that the other items share are set to what this change needs, and the log says so.
- In `honsha:assessment`, step 5, which reads `legacy`, is `261126-2214`'s if the person drops that key there: this
  item changes none of that step's lines, and keeps any change of its own to other steps, with unchanged lines between,
  so that git merges both in either order.
- Nothing is set on GitHub, and nothing is read there: the commands of the piece move and keep their form, but for the
  read of a pull request's author, which takes the form that the piece's other reads already have.
- The trial runs in the scratchpad, on a scratch repository served as its own remote, with fake values read by name;
  no output prints a value. Its one download is gitleaks's pinned archive, which the history scan fetches at each run.
- No history changes.

### Acceptance criteria

1. GitHub's piece is two files. `services/github/README.md` holds the commands, the settings the rules rely on, the
   install of the kit, what GitHub enforces and the wiring of the checks, in at most 16,500 characters with the two
   sections that `261126-2213` owns as they stand at `516e0db` (it holds 35,491). `services/github/security.md` holds
   the protections with their reads, the open alerts, who and what can reach a repository with where a credential that
   deploys is kept, the account and its token, the static testing of the workflows and the refs of the history, in at
   most 15,500 characters (those sections hold 18,445). Each of their commands stays as it is, but the read of a pull
   request's author, which names the owner and the repository of the remote the scan read, and the list of an
   organisation's members without a second factor, which goes.
2. The skills, the workflow and the contract of a service's piece name the file of the piece that holds what they point
   to, and no section that moves is cited in its old file.
3. Each of these is stated in one place, with its reason in the workflow where it has one: that a session never turns a
   protection on; what the review compares a reading with, and what is urgent then; how the piece's commands name a
   repository, read every page and tell an empty list from a failure. The review's step on the posture points to
   `honsha:security-posture` and lists nothing that the posture reads.
4. The descriptions of `honsha:security-testing`, `honsha:security-posture` and `honsha:review` hold at most 300
   characters each (480, 489 and 448 now). `honsha:review` holds at most a skill's 6,000 characters (6,676 now), so its
   budget and its reason leave `checks/budgets.test.mjs`; `honsha:security-testing` at most 7,200 (7,852 now), with its
   budget and reason set to it; `honsha:security-posture` no more than now (5,628). The workflow's budget is what it
   holds, and GitHub's two files each have one.
5. One set of functions in `checks/history-secrets.mjs` builds the scanner's arguments, runs it, checks its version,
   reads an ignore list and writes a finding's lines, and both scans use it. A scan fails when gitleaks writes an error,
   though it exits 0 with an empty report: the history scan exits 2 and the branch's scan 1, each with a test. The
   history scan prints, once for each commit that has findings, whether the default branch holds it and the refs that
   reach it, and under it each finding by file, line and rule, with its fingerprint and its masked line. Otherwise
   both scans read, leave out and print what they do now, and neither prints a value, an author or the remote's
   address.
6. `checks/security-testing.mjs` has no `shellcheck` command and no detection of shell scripts; ShellCheck stays
   pinned, and actionlint runs it on the scripts of the workflows' steps. The linters' output and git's messages are
   printed with their control characters escaped. The profile's `verify` drops the command, its comment says why, and
   its `security-review` lists the workflow files.
7. Each weak point of the strategy is fixed as it says, or set aside with its reason.
8. The tests of the three scripts run with no network. A trial in the scratchpad runs the history scan with the real
   gitleaks on a scratch repository with fake values, and shows the report by commit; and the shared run fails with the
   real gitleaks when the `git log` it runs fails.
9. What the intent names stays guarded: a secret in a history found and never printed; the posture read at each
   assessment and again at each review, with its protections, alerts and access; a credential that deploys kept from a
   pull request's runs; the kit's code and workflows tested by gitleaks, oxlint's security rules, actionlint with
   ShellCheck, and zizmor. The profile's `verify` commands pass, the security review and the checker pass, and the
   kit's pipeline passes on the pull request.

## Strategy

### What a part costs

Three costs are weighed: the characters that a session reads, the lines that a change to the kit maintains, and what a
verification adds. GitHub's piece is read whole by a worker at every delivery, for its commands (`agents/worker.md`,
Delivery); the description of each skill is in every session's list of skills, used or not; a skill's body is read
when its case comes; the workflow is read by whoever changes the kit.

- **GitHub's piece:** 35,491 characters, read at the delivery of every item of every project. Of them, 18,445 serve
  only the posture and the security testing: the protections and alerts 7,149, the access 5,632, the account and its
  token 2,716, the refs of the history 1,918, the static testing of the workflows 1,030. The commands a worker needs
  take 1,243, and the wiring, which `261126-2213` owns, 9,907.
- **The skills:** the descriptions of the security testing, the posture and the review hold 480, 489 and 448
  characters, 1,417 in every session; their bodies 7,852, 5,628 and 6,676, two of them over a skill's 6,000. In this
  item's own session, the list of skills arrived without the descriptions of `honsha:review` and
  `honsha:security-posture`: that list is not without limit.
- **The scripts:** `checks/history-secrets.mjs` 527 lines, `checks/releases.mjs` 250, `checks/security-testing.mjs` 467,
  and their tests 454, 149 and 423. The branch's scan keeps its own arguments, run, version check, ignore list and
  finding's lines beside the history scan's, about 110 lines.
- **The kit's verification:** four commands of security testing, each a second or less; a setup of about 27 MB and 20
  seconds in each worktree, about 2 seconds in the pipeline. The history scan downloads about 8 MB and takes 6 to 10
  seconds at each assessment and review.
- **The workflow:** "Security testing" 2,126 characters, "Security posture" 1,652, "Accounts and credentials" 1,867,
  "What the piece of a service says" 2,481, within a budget of 47,700.

### GitHub's piece

What a worker reads at delivery is the piece's `README.md`. The posture's reads, the static testing of the workflows
and the refs of the history move into `services/github/security.md`, which the security posture, the review's step on
the account and its token, and the security testing name. `README.md` keeps the commands, the settings, the install,
what GitHub enforces and the wiring, and goes from 35,491 characters to about 16,500: a worker reads about 19,000
fewer at each item. The interface names `README.md` for the install, which stays there.

In `security.md`, what holds for every command is said once, where the protections' and the access's sections each say
it now: the commands name the owner and repository of the remote the clone fetches from; an account that does not
administer the repository leaves the reads to the clone alone; each read follows every page, prints a line for each
entry and nothing, with exit status 0, for none; a failure exits with another status and is no answer; none prints a
value. Then:

- **The protections:** each, where GitHub gives it free, and its read. The rule that the posture asks the person for
  one that is off, and that a session never turns one on, is the posture's, and goes from the piece.
- **The access and the place of a credential that deploys:** the reads stay. The rule names the runs that may receive
  such a credential, those that no one outside the project can start, as a push to the default branch, a run started
  by hand on it or a schedule, where it named only the runs that a pull request starts (The weak points). An
  environment's name is written in the path with each byte of its UTF-8 form other than an ASCII letter, a digit, `-`
  and `_` as `%` and two hexadecimal digits, so that neither a quote nor `.` or `..` changes the path.
- **The account and its token:** the two reads, what they print, and the commands never run; what the kit's commands
  need of the token, with what is untried, in fewer words. The list of an organisation's members without a second
  factor goes: it is untried, an owner alone can read it, and the review reads each account's second factor from the
  inventory's entry of that account.
- **The refs of the history:** the read of a pull request's author names `<owner>/<repository>` of the remote the scan
  read, as the other reads do, not `{owner}/{repo}`, which `gh` fills by rules of its own.

In `README.md`, the part of "What GitHub enforces" that tells what the protections hold points to `security.md`, and
the opening paragraph keeps only what was tried of the commands that stay.

### The skills

- **Descriptions:** each says when the skill applies and, in a clause, what it holds, in at most 300 characters; the
  lists of everything a skill reads go. At least 500 characters fewer in every session. Those of `honsha:assessment` and
  `honsha:dependencies`, 236 and 239, stay.
- **`honsha:security-posture`:** the opening sentences on why the posture is read again, which the workflow's "Security
  posture" gives, go, and step 5's reason for never turning a protection on is the workflow's. Step 2 also reads that
  the profile lists under `security-review` the configuration and ignore files of the testing's tools. Step 7's rule
  on a credential that deploys names the runs that may receive it. The piece's reads are in `security.md`.
- **`honsha:security-testing`:** the kind "its shell scripts" leaves out a script that only hands its arguments to
  another program, which holds nothing for a linter: a narrowing, which the security review reads. Dynamic testing
  runs an active scan on a container network with no way out. A secret found in a commit is one that a scan finds or
  that the hosting service refuses at a push. "The history" keeps its rules on a finding, and drops what the posture
  and the script already say: that the scan is the posture's first step at each assessment and review, and the fields
  of its report, which the script prints and the posture keeps. The tools that read a pipeline's files are in the
  piece's `security.md`.
- **`honsha:review`:** step 2 points to the posture, which says what a review compares and what is urgent, where it now
  lists what the posture reads; step 3 keeps what the inventory holds and every rule it is read against, in fewer
  words, and reads the account and the token as `security.md` says. It fits a skill's 6,000 characters, and its own
  budget goes.
- **`honsha:assessment` and `honsha:dependencies`:** their pointers still hold, since the alerts on dependencies are
  among the settings that stay in `README.md`; they change only if the work finds a pointer that does not.

### The two scans of secrets

`checks/security-testing.mjs gitleaks` takes from `checks/history-secrets.mjs` the ignore file's name, the environment,
the fingerprint, the masking, the reading of the report and the escaping, but builds its own arguments, runs and checks
the scanner its own way, reads the ignore file its own way and writes a finding's lines its own way. Its run fails on
any line that gitleaks writes on its error output; the history scan's checks the exit status alone, and gitleaks 8.30.1
exits 0 with an empty report when the `git log` it runs fails, so a history scan that failed reads as one that found
nothing.

`checks/history-secrets.mjs` exports one form of each: the arguments, given what is scanned and the options of `git
log`; the run, which fails on a status other than 0 or on any line of error output, printed escaped and without the
remote's address; the version check; the ignore list read from a text; and a finding's lines. The branch's scan keeps
only its range, its reading of the checkout's ignore file and the remerge diff. The history scan's report gives, for
each commit that has findings, whether the default branch holds it and the refs that reach it, once, then its findings:
the refs, which no cap hides, are printed once for each commit and not with each of its findings.

The pin, the mirror, the refs read, the masking and the rule on outsiders' pull requests stay as they are: each answers
a finding of a security review. The simpler form that the masking has, gitleaks's own redacted match, would show
unmasked any second value that the match holds. The history scan keeps downloading gitleaks at each run: it runs from
the kit directory in a project's clone, where no setup ran.

### The kit's own security testing

- **`shellcheck` goes.** It reads the one shell script the kit tracks, `.githooks/pre-push`, which hands its arguments
  to `node checks/pushed.mjs` in one `exec`. It costs the command, the detection of shell scripts by extension and
  first line, about 55 lines, two tests and parts of two more. ShellCheck stays pinned and installed, since actionlint
  runs it on the scripts of the workflows' steps, where the kit's shell code is. The profile's comment says so.
- **actionlint and zizmor stay.** They read the two workflow files that every project's pipeline runs: actionlint the
  syntax, the expressions and, through ShellCheck, the steps' scripts; zizmor the holes. Each takes under a second.
- **gitleaks over the branch stays,** as every project's.
- **oxlint's security rules stay.** The 28 lines that silence the two rules on regular expressions sit in 13 files, the
  guard, the record's checks and the profile's reader among them, all outside this item but one line of
  `checks/history-secrets.mjs`; each says why its pattern is safe, and turning the rules off would leave unread what an
  attacker could aim at the guard. A rule that the kit's code cannot trip costs a line of configuration and nothing at
  a run, and catches the code that would.
- **The setup stays:** ShellCheck's archive goes on being installed for actionlint.
- **`security-review` lists the workflow files.** A change to one is CI configuration, which already calls for the
  review; on the list, `checks/record.mjs` holds it at every size. The profile stays off the list: it changed in 12 of
  the kit's 64 items, so listing it would put a review on about one item in five, for a weakening that the skill's
  description already makes due and that the checker reads in the diff.

### The workflow

"Security posture" keeps its reasons and drops the rule it restates, what a review compares with. "Accounts and
credentials" gives the reason for the runs that may receive a credential that deploys: a pull request's run executes
its own branch's workflow files, and a comment or another workflow's completion, which someone outside the project can
cause, runs the default branch's files with its secrets. "Security testing" stays as it is.
"What the piece of a service says", once the hub agrees, says that the reads of its points 4, 7, 8 and 9 are in a file
of their own, `security.md`, which an assessment, the review and an item of security testing read, so that a worker
reads only what a delivery needs.

### The weak points

From the history scan, `261125-1913` (pull request 62, the home's idea `261126-1422`):

- **Fixed:** the read of a pull request's author names the remote's owner and repository (GitHub's piece).
- **Fixed:** the refs that reach a finding are printed once for each commit (The two scans of secrets).
- **Fixed:** a failed `git log` read as no finding (The two scans of secrets); `261125-1850`'s trial found it.
- **Fixed in part:** an entry of `.gitleaksignore` is held to the review only where the profile lists the file. The
  posture now reads, at each assessment and review, that the profile lists the testing's configuration and ignore
  files under `security-review`.
- **Set aside:** an error discards the whole scan. A partial list that a failed run cannot vouch for would read as
  complete; the message is reported, and the scan runs again.
- **Set aside:** an interrupted run leaves its mirror in the user's own temporary folder, beside the clone that holds
  the same objects.
- **Set aside:** the project's bots, a deleted account and a removed collaborator count as outside the project. Such a
  finding is still listed, with its refs, for the person; and counting a deleted account as the project's would let a
  stranger who deletes the account after opening the pull request plant a stop again.

From the security testing, `261124-1550` (pull request 59, the home's idea `261125-1849`):

- **Set aside:** `checks/record.mjs` names neither a change of the profile that narrows a command nor an inline
  suppression. The profile's cost is above; an inline suppression has a form for each tool, which no path catches. The
  skill's description makes both due, and the checker reads the diff.
- **Set aside:** the profile's reader takes the last of a repeated key and ignores a misspelt one: `checks/profile.mjs`
  is `261126-2214`'s, which takes the profile's keys, and the hub can pass it there.
- **Set aside:** nothing checks a worker's statement that its host cannot run a command. The pipeline runs it, its
  result is written before the closing commit, and the checker reads it; the procedure is `261126-2213`'s.
- **Fixed:** an active dynamic scan could make the instance call out to the host's network: it runs on a network with
  no way out (The skills). Each project's item that sets up such a scan tries it.
- **Set aside:** a pull request opened before `261124-1550` was merged could leave out the dynamic testing once: that
  change is past.

From the posture, `261125-2038` (pull request 63):

- **Fixed:** a push that the hosting service refuses for a secret is a secret found in a commit, a stop (The skills).
- **Set aside:** that a session never turns a protection on, off or around is a rule that no guard holds. The guard
  reads a command's text and is no boundary; what holds against a steered session is a host's token that cannot
  administer the repository, which is the person's choice (below).
- **Set aside:** an alert on a secret that only an outsider's issue holds stops an assessment. It fails closed, and
  telling it apart needs each alert's locations and each issue's author, reads untried that would grow the piece.
- **Set aside:** a required check is matched by its name, not by its app. The piece already says that the check holds
  back a failing change, not a hostile one, since a pull request runs its own branch's workflow files; matching the
  app adds nothing against that.
- **Set aside:** `checks/commits.mjs` skips merges on the default branch, and a direct push that changes a workflow file
  runs that file: both lie in `261126-2213`'s files, and both were there before.

From the accounts and credentials, `261125-2039` (pull request 64):

- **Fixed:** a credential that deploys was kept only from the runs that a pull request starts, so a comment's run or
  another workflow's completion, which run the default branch's files, could reach it. It is now given only to the
  runs that no one outside the project can start (GitHub's piece, the posture, the workflow).
- **Fixed:** an environment's name is encoded byte by byte, `.` included (GitHub's piece).
- **Set aside:** where the host's token administers a repository, a session could widen an environment's branches
  between two readings. Which token a host holds is the person's choice, which the inventory records, and the posture
  reads the branches at each reading.
- **Set aside:** a private repository's setting that sends secrets to forks' runs. A personal account's private
  repository is forked only by a collaborator, who already writes to it; the endpoint the review named is unverified.
- **Set aside:** a repository's installed applications and webhooks. `261125-2039`'s approved strategy left them out:
  an application is authorised by an account, which the inventory lists with what it reaches, and a webhook's address
  can hold a secret that a read would print.
- **Set aside:** the guard refuses no command that prints `gh`'s token. A token can be printed in many ways, its
  configuration file and git's credential helper among them, so one pattern would guard little; the rule is the stop.

From the kit's security testing, `261125-1850` (pull request 65):

- **Fixed:** the linters' output and git's messages are printed escaped, as a finding is.
- **Fixed in part:** the workflow files join the kit's `security-review`. The profile stays off it for its cost
  (above), and `checks/record.mjs` and `checks/profile.mjs`, which read the list, by the person's choice in
  `261125-1850`: most of their changes touch only how a record or a profile is read.
- **Set aside:** a branch's own `.gitleaksignore` can silence its own finding. The file is on the list, so that change
  calls for the review.
- **Set aside:** `project.yml` installs npm and Claude Code at a version that its caller names, and empty
  `job.workflow_*` contexts would check out the caller's repository as the kit. The workflows are `261126-2213`'s, and
  the caller is the project's own file.
- **Set aside:** the regular expression of a record's front matter is quadratic at worst. `checks/record.mjs` is
  `261126-2213`'s, and a run's time limit bounds it.
- **Set aside:** a `LESSONS.md` committed as a link would lead the lessons' guard out of the project.
  `checks/profile.mjs` is `261126-2214`'s.
- **Set aside:** a file that git takes for binary by its content gives the scanner no patch, in either scan. Reading
  every binary as text would multiply a scan's time, for secrets that text rules seldom find in binary data.

### Parts, commits and verification

- Two parts may run in parallel, if `honsha:parallel-parts` lets them once this strategy is approved: the scripts,
  their tests and the profile; and the documents, the skills, GitHub's piece, the workflow and the budgets. The
  documents write the history report's shape from this strategy, and the scripts change no document.
- Commits: this record with its strategy; its approval; the scripts, then the documents, each reviewable alone; the
  closing commit.
- Verification: the kit's checks of the record and the commits; the profile's ten `verify` commands; the trial of
  criterion 8; the security review, due since the change touches paths under `security-review` and drops a command of
  the security testing; the checker.
- The item touches about 14 existing files, where an upkeep item is expected to touch 6: it goes across what four
  items added.

### Risks

- `261126-2213` changes the two sections of GitHub's `README.md` between which this item's sections leave. Git merges
  the two changes where their lines are apart; the item that merges second brings the default branch in
  (`honsha:branch-update`).
- A security review can reopen the history report's shape or the masking; a finding there is fixed in its scope.
- A shorter description could make a skill load less often than its case needs: each keeps the case that invokes it.

### Model

The strong tier at xhigh effort, as the hub started the item. No part needs the strongest tier.

### For the hub

Asked before the work, as "Boundaries" says: the sentence of "What the piece of a service says"; the word of
`checks/profile.test.mjs:172`; the words of `README.md:121`. The budgets' lines this item changes: the workflow's, the
security testing's and the review's, which goes, and two new lines for GitHub's files. The architecture's line on
`services/<name>/` stays true and is not changed. The weak point of the profile's reader may belong to `261126-2214`.

## Approval

Approved by the person on 2026-11-26, in this item's session, as written in `bc7d2cb`, with the line on
`honsha:assessment` that "Boundaries" took from the hub's note before the approval.

## Log

- 2026-11-26: the record was created on this branch, from `origin/main` at `516e0db`, with the intent as the hub gave
  it. `node <kit directory>/checks/verify.mjs --setup` ran once in this worktree before the first commit: `npm ci` and
  the four pinned programs, each with its SHA-256 the pinned one, in about 7 seconds.
- Read: the records of `261125-1913`, `261125-2038`, `261125-2039` and `261125-1850`, each by a subagent on the
  session's model that reported its decisions, weak points and costs; the descriptions of pull requests 62 to 65; the
  home's ideas `261125-1849` and `261126-1422`; the files this item owns, and the references to GitHub's piece and to
  its sections across the kit.
- Measured on `516e0db`: the characters of GitHub's piece by section, of the skills and their descriptions, and of the
  workflow's sections; the lines of the three scripts and their tests; the changes of the profile and of the workflow
  files in the kit's history. The costs of the setup, the commands and the history scan are those that the four
  records measured.
- Found: the kit tracks one shell script, `.githooks/pre-push`, three lines that hand their arguments to Node.js; the 28
  inline silences of oxlint are all of `security/detect-non-literal-regexp` (13) and `security/detect-unsafe-regex`
  (15); no command of GitHub's piece is cited by its section from outside the piece but the posture's two, which stay
  in `README.md`.
- The strategy was committed, and the person asked for the approval. The hub then wrote that `261126-2214` changes
  step 5 of `honsha:assessment`, which reads `legacy`, if the person drops that key, and nothing else of that skill;
  "Boundaries" says how this item keeps apart from it. No other file changes hands.
- The person approved the strategy (Approval); the state is `in-progress`. The item has no areas, so no area's pack is
  loaded.
- The hub was asked, on 2026-11-26, for the three lines that "Boundaries" names, and for the words of point 9 of "What
  the piece of a service says", which say that a credential that deploys is kept so that "only the default branch's
  runs reach it": the approved rule narrows them.
- Two parts ran in parallel, as `honsha:parallel-parts` lets them: they share no file, neither needs the other's
  result, and each is verified alone. The scripts, their tests and the profile ran in a subagent on the session's
  model, in its own worktree on the local branch `work/261126-2215-simplify-security-additions.scripts`, cut from
  `42bd307`; the documents ran in this worktree.
- The documents. GitHub's `README.md` went from 35,491 characters to 16,437, with its two sections that `261126-2213`
  owns unchanged; `services/github/security.md`, new, holds 16,822, of which the commands take 2,665. Its first
  section says once what the protections', the alerts' and the access's sections each said: how a command names the
  repository, the account's permission, every page, an empty list against a failure, no value. The README's
  "Two things on the site are not used" became one sentence, since the second was what the first setting does, and
  the sentence that the package manager's report stays the check went, since `honsha:dependencies` states it.
- The skills: the descriptions of the security testing, the posture and the review hold 293, 289 and 262 characters,
  844 in all where they held 1,417; their bodies 7,178, 5,308 and 6,000. The reasons that the workflow's "Security
  testing", "Security posture" and "Upkeep review" give went from the skills, which keep the rules.
- The hub's answers, on 2026-11-26. In the workflow's "Security testing", the "Cost" point's clause on a push that
  changes only records is `261126-2213`'s to delete: this item leaves that sentence as it is. Granted, and nothing more
  in each file: in "What the piece of a service says", points 4, 7, 8 and 9 and one sentence that sends their reads to
  `services/<name>/security.md`, point 9 with the narrower rule; in `checks/profile.test.mjs`, the word `shellcheck`
  of its list of commands; in `README.md`, the words of "Checking a change to the kit" that name ShellCheck as a check
  of its own. A line in the interface or the architecture for the new file would be asked first: none is needed, since
  the architecture's line on `services/<name>/` names no file of it, and the interface names `README.md` for the
  install alone. Points 4, 7 and 8 needed no change. The workflow then holds 47,976 characters, 276 more than at
  `516e0db`, for the contract's sentence and the narrower rule on a credential that deploys; its budget is 48,000.
- The scripts, in `ce14442`. `checks/history-secrets.mjs` exports the scanner's arguments, its run, which fails on a
  start's error, an exit code other than 0 or any line of error output, an ignore list read from a text, a finding's
  lines and the escaping of a program's output; `checks/releases.mjs` gives each pin the arguments that print its
  version, and the version check. The history scan prints, once for each commit, whether the default branch holds it
  and the refs that reach it, then its findings. `checks/security-testing.mjs` lost its `shellcheck` command, the
  detection of shell scripts and its own copies of the scanner's parts, and prints what a linter or git writes line by
  line, escaped. The scripts went from 1,244 lines to 1,233, since the shared functions came with their comments, and
  the tests grew by about 90 lines for the new cases; the duplicated forms are gone.
- Decided in that part: the version check sits in `checks/releases.mjs`, beside the pins, which it reads; the branch's
  scan no longer ends a finding's first line with its commit, which the fingerprint, on the next line, opens with; a
  program's error output is printed one escaped line for each line, and a run that exits with another code and writes
  nothing says its exit code.
- The part's verification, in its worktree at `ce14442`: Prettier, oxlint and tsc pass; 294 tests of 294 pass; the
  three commands of the security testing find nothing; `shellcheck` is refused as a wrong usage; the commits' check
  passes.
- The trial, in the scratchpad, read by name. (a) A scratch repository with a fake key and a fake token in one commit,
  pushed to a bare remote with a tag and a `refs/pull/1/head`: the history scan, which downloaded gitleaks 8.30.1 and
  checked its digest, read 3 refs and 3 commits, printed the commit once with the branch and the tag that reach it,
  then its two findings with their lines masked, and exited 1; no value was printed. (b) The gitleaks of the setup,
  given an option that its `git log` refuses: run alone it exited 0 with an empty report and two lines of error output;
  through the shared run it failed with that message.
- The part was brought into this branch by a fast-forward to `ce14442`, as nothing else was committed here since
  `42bd307`; its worktree and branch were then removed.
- The security review of `1b9ac27` passes, with no finding and four weak points (Verification). What was done with
  each:
  1. No command lints a shell script that the kit adds later outside the workflows' steps, until a posture reading
     names the missing kind: left to the person, as the approved strategy chose, since the one shell script the kit
     tracks quotes its arguments and is under `security-review`.
  2. The skill's exemption of a script that only hands its arguments on rested on a reader's judgement, though an
     unquoted `$@` is what ShellCheck finds there: fixed, the exemption names the quoted arguments, as
     `exec node <script> "$@"` hands them.
  3. GitHub's `security.md` had lost the qualifier that the environment's limit holds no further than what protects the
     default branch: fixed, it says that an account that lands a workflow file on the default branch has its runs
     enter, and that against a session the limit holds as far as the session is kept off that branch.
  4. The profile is not under `security-review`, and `checks/record.mjs` reads the branch's own list: left to the
     person, the first for the cost the strategy gives, the second in `261126-2213`'s file.
  Of what the review could not read: whether gitleaks writes on its error output in a clean run over a whole mirror
  is answered in part by the trial, where a clean mirror's scan wrote nothing there, and by the branch's scan, which
  fails on such a line and passed in this item's runs and in pull request 65's pipeline; a repository where it did
  would fail closed. That `checks/history-secrets.mjs` runs `git` by its name from the clone's folder, which on Windows
  may find a `git.exe` committed there, unconfirmed, is in the code before this item and in the kit's other scripts
  that run in a project: left to the person, as an item of its own.
- `services/github/security.md` then holds 17,081 characters, and its budget is 17,100; the security testing's skill
  holds 7,190.
- The fix, `9fbeb8e`, passed the verification again, and its repeated review passes: both weak points fixed, no
  finding, one new weak point. GitHub's `security.md` gave a workflow file as what gets past the environment's limit
  on the default branch, where any file that the deploying job runs does, a build script or a package's script among
  them: fixed, the sentence names any such file, its workflow among them. Of what that review could not read: the
  guard refuses no command that moves the default branch through the service's API without a pull request, which a
  ruleset that requires one refuses on the server: left to the person, since the guard stops a mistake and is no
  boundary, and the text claims no more of it. `security.md` then holds 17,126 characters, and its budget is 17,200.

## Deviations

- Criterion 1: `services/github/security.md` holds 17,126 characters, not at most 15,500. Its commands take 2,665, and
  each read keeps the answers by which a reading tells a protection on from off and an empty list from one it could not
  read; the cut came from what three sections repeated, from the read that serves no project and from the wording. Its
  budget is set to what it holds.
