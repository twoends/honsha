---
id: 261125-1913
title: Have an assessment scan the project's whole history for secrets
project: honsha
type: change
size: full
kind: capability
state: in-progress
areas: []
created: 2026-11-25
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-25 in the hub's session, that an assessment also scan a project's history for
secrets, after the hub explained that nothing in the kit reads the history a project already has: the assessment reads
which kinds of security testing apply and proposes items, it runs no tool; the scan for secrets that
`honsha:security-testing` puts in `verify` reads the commits of a branch, from its base; and the security review reads
only an item's diff. A secret committed before a project joined, or on a branch since deleted from the default
branch's line, stays in the history that every clone holds.

The same day, on the host of an installation, three assessments ran such a scan as an extension of their scope, with
gitleaks downloaded from its releases at a version at least 7 days old, checked against its checksums file, run on the
project's clone over every ref with its findings redacted; the kit's item `261124-1550` had found that the host's
application control lets gitleaks run.

Left: where the scan goes in `honsha:assessment` and what `honsha:security-testing` says of it; which tool, and how an
assessment, which changes nothing in the project and installs nothing there, takes and pins one that is no dependency
of the project; which refs it reads, every branch and tag on the hosting service; what the report holds, each finding
by commit, file, line and rule and never its value; what a finding does, a real secret being a stop condition, with
its revocation and any change of the history the person's decision; what a public repository changes, where the
history is already public; and whether the scan runs again, at an assessment only or also at the periodic review.

## Scope and acceptance criteria

### In scope

- A new script, `checks/history-secrets.mjs`, with its test, `checks/history-secrets.test.mjs`: run in a repository's
  clone, it scans for secrets every ref that the repository's hosting service serves, with a scanner that the script
  pins by its checksums, and prints each finding by where it is, never by its value.
- `skills/security-testing/SKILL.md`: a section on the history, which says why it is scanned, by what, over which
  refs, what the report holds, what a finding does, what a public repository changes, and when the scan runs; its
  description names the scan.
- `skills/assessment/SKILL.md`: a first step that runs the script. `skills/review/SKILL.md`: a step that runs it in
  each repository the review reads.
- The documents: `docs/01-specs/WORKFLOW.md`, its sections "Security testing" (the reasons), "Upkeep review" (what it
  reads) and "What the piece of a service says" (the refs that a mirror clone takes); `docs/01-specs/INTERFACE.md`, the
  command; `docs/01-specs/ARCHITECTURE.md` and `README.md`, where they list what `checks/` holds;
  `services/github/README.md`, the refs that GitHub serves beyond branches and tags, and what it keeps that no ref
  holds.
- The budgets that the new text needs, in `checks/budgets.test.mjs`.

### Out of scope

- The kit's own security testing in `verify` (`261125-1850`) and the weak points that the last security review left
  (`261125-1849`), each an item of its own. Whether the kit's `verify` scans with the scanner pinned here is
  `261125-1850`'s to decide.
- Revoking a secret, changing a repository's history, writing a project's ignore file: the person's, and the items
  that an assessment proposes.
- Scanning the history of any repository of an installation: no assessment or review runs in this item. The
  assessments that ran the scan today change no file of the kit.
- A hosting service's own scanning for secrets, read or turned on: a further stop, which the rules do not rely on.
- Secrets outside the history: files that are not committed, the service's issues, comments and pipeline logs.
- How the periodic review learns of a new version of a tool pinned by its checksum or digest, which no package
  manager lists, and the installation's radar entry for the scanner, which is the home's.

### Boundaries

- Nothing breaks (interface, Changes to the interface): a command, a step of the assessment and a step of the review
  are added; nothing is renamed or removed.
- The rules name no hosting service: the refs that GitHub serves are in its piece. The script holds the scanner's
  name, version and checksums; the skills name what it does.
- The script changes nothing in the clone it runs in and installs nothing: what it downloads, and the mirror it makes,
  are in a temporary folder outside the clone, which it deletes when it ends, on an error too.
- The trial runs in the session's scratchpad, on a scratch repository. Besides it, only the list of the kit's own refs
  on its hosting service is read; no repository of an installation is scanned. The only download is the scanner's
  release for this host; the checksums of the others are read from the release's checksums file.

### Acceptance criteria

1. `checks/history-secrets.mjs`, run in a repository's clone: downloads the pinned scanner's archive for the host's
   platform into a temporary folder outside the clone, and refuses to extract or run it unless its SHA-256 is the
   pinned one; makes there a mirror clone of the remote that the clone fetches from, borrowing the objects the clone
   already has, so that it holds every ref the hosting service serves; scans every commit of every ref, each merge for
   what it adds of its own, with the scanner's built-in rules, its findings redacted and nothing sent out; leaves out
   the findings that the scanner's ignore file on the default branch lists; prints each other finding by commit, file,
   line and rule, with its fingerprint, whether the default branch holds its commit, and its line with the value
   found and every other run of characters that could be one masked, and never a value or an author; prints the
   scanner's version and the number of refs and commits read; deletes its folder; exits 0 with no finding, 1 with
   findings, and 2 on an error or on a platform with no pinned archive. Its opening comment says what it does and what
   it refuses.
2. The pin is gitleaks at the newest release published at least 7 days before the work, 8.30.1 unless a later one
   qualifies, with the SHA-256 of each archive it pins, read from the release's checksums file and matching the
   digests that the release itself lists.
3. `checks/history-secrets.test.mjs` covers, with no network: the archive of each pinned platform and the refusal of
   another; a checksum that differs, which stops the script before anything is extracted; a mirror that holds a ref
   which is neither a branch nor a tag, with the commit of a deleted branch; the patch given to the scanner for a merge
   whose resolution adds a line; the ignore file read from the default branch; printed lines that hold no value, no
   unmasked line and no author, even when the scanner's report has them; the exit codes; and the temporary folder,
   deleted on success and on an error.
4. `honsha:security-testing` holds, in a section on the history: why it is scanned; the script; the refs; the report;
   that a session never reads a finding's value; a finding taken for a secret unless its file, rule and masked line
   show otherwise, with the reason written; a secret a stop condition at an assessment and urgent at the review, its
   revocation and any change of the history the person's and never a session's; what a public repository changes, and
   what a private one does; the findings answered, listed with their outcome in the project's ignore file of the
   scanner by an item that the security review reads. Its description names the scan of the history.
5. `honsha:assessment` runs the scan as its first step, and its report gives the scanner's version and the refs and
   commits read. `honsha:review` runs it in each repository it reads, and reports a finding not yet answered as urgent.
6. The workflow, the interface, the architecture, the README and GitHub's piece say what criteria 1, 4 and 5 make
   true, as "In scope" lists; each raised budget says why; nothing in the kit contradicts the new rules.
7. A trial on this host, in the scratchpad, with the script from this branch, on a scratch repository served as a
   remote: a fake token on the default branch removed by a later commit, one on a branch deleted but kept under a ref
   of a pull request, one only in a tag, one added only by a merge's resolution of a conflict, and a fifth listed in
   the ignore file. The script reports the first four by commit, file, line and rule, leaves the fifth out, prints none
   of the fake values, searched for in its output, and exits 1; it exits 0 once the four are listed too.
   `git ls-remote` on the kit's own repository shows the refs of pull requests that a mirror clone takes. The log says
   how long the runs took.
8. The profile's `verify` commands pass, the security review and the checker pass, and the kit's pipeline passes on
   the pull request.

## Strategy

**Why the history.** `verify`'s scan reads a branch's commits from its base, the security review reads one diff, and
an assessment runs no tool. A secret committed before the project had a scan, or that reached the hosting service
without a verification, by a push or a tag made outside a work item or on a pull request's branch since deleted, stays
in the history that every clone holds, and nothing reads it.

**A script, not steps a session takes.** The scan is mechanical, as the moves between a project's states are, so code
does it: the same pinned scanner, the same refs and the same redaction in every assessment and review, on every host;
a test that holds it; and no value passing through a session, whose transcript leaves the host. The three assessments
that ran the scan today took the steps by hand, each a little differently: two downloaded the release, one reused the
archive of `261124-1550`'s trial; each read the refs that a fetch had brought into the project's clone; and only one
read the merges, in a second run.

**The scanner: gitleaks.**

- It reads the history of a git repository over any refs, where secretlint and detect-secrets read files.
- It is one program with no runtime, released for Windows, Linux and macOS on x64 and arm64, so every host runs it
  without a container engine, which not every host has running; an image by its digest would need one.
- Its rules are built into each version, pinned with it, and it sends nothing out. trufflehog, another scanner of
  histories, checks each secret it finds against its provider unless told not to, and is under the AGPL; gitleaks is
  under the MIT licence.
- This host's application control ran gitleaks 8.30.1 in `261124-1550`'s trial and in the assessments today.
- It takes no new rules. Its author declared it feature complete on 2026-05-21, its later releases security patches
  only, and develops Betterleaks with gitleaks's other makers. Betterleaks, under the MIT licence too, reads a history
  over any refs, checks a secret against its provider only when asked, and keeps adding rules. Its stable line is at
  1.10.1, released on 2026-11-12, past the 7 days, while its version 2, in release candidates, changes its command
  line, its configuration and its report; and no host of the kit has run it, where this host's application control
  refuses some native programs. gitleaks stays the choice here, for the runs it has had on this host and a pin that
  holds still; the move to Betterleaks is an item of the kit once its version 2 is stable past the waiting period, and
  the choice is the person's (For the person).

**The pin.** In the script: the version, and the SHA-256 of the archive of each platform that the kit's hosts run,
Windows, Linux and macOS, each on x64 and arm64: six archives, which 8.30.1's release all has. The script checks the
download against it before extracting anything, so a release replaced on the service after the pin fails. gitleaks
8.30.1, released on 2026-03-21, is still its latest release on 2026-11-25, well past the 7 days of
`honsha:dependencies`. The checksums come from the release's checksums file, checked against the digests that the
release lists for its archives, and the archive for this host against its download. A new version is a work item of
the kit, as any dependency's is.

**Where it runs.** In a repository's clone, by the session that assesses or reviews it:
`node <kit directory>/checks/history-secrets.mjs`. It installs nothing and changes nothing in the clone: the archive,
the program and a mirror clone go in a temporary folder outside it, deleted when the script ends, on an error too. The
archive is extracted with the system's `tar`, which Windows, Linux and macOS carry, so the kit adds no package. On
Windows the script calls the system's `tar.exe` by its path: Git for Windows puts ahead of it on the path a GNU tar
that reads no zip archive, the form of gitleaks's Windows release. The mirror clone of the clone's remote borrows the
objects the clone already has, so it fetches only what the clone lacks, and holds every ref the service serves, with
no fetch into the person's clone, whose remote-tracking refs a fetch with `--prune` would change.

**The refs.** Every ref the hosting service serves: branches, tags, and the refs that a service may keep for each pull
request, which hold the commits of its branch after the branch is deleted, and which anyone who reads the repository
can fetch. The intent names branches and tags; the refs of pull requests are added because they hold the very commits
of deleted branches, which a fetch of branches and tags leaves out. GitHub's piece names them, and the contract of a
service's piece gains the point, so that the piece of another service says the same. What a service keeps that no ref
holds, a commit reachable by its hash alone, is beyond any clone: GitHub's piece says what GitHub keeps and how it is
removed, from a lookup of its documentation during the work.

**The merges.** `git log -p`, which the scanner reads, gives no patch for a merge, so what a merge adds of its own, as
in resolving a conflict, is read by no run of the scanner's default: the kit's flow merges the default branch into a
work branch on a conflict. The script reads each merge for what it adds beyond the automatic merge of its parents, as
`git log --diff-merges=remerge` shows it, which repeats nothing that the merged commits hold. Where the scanner cannot
read that form, it reads each merge against its first parent instead, which repeats under the merge the findings of
the branch it brought: the trial decides, and the log says which.

**The report.** Each finding by commit, file, line and rule, with its fingerprint, which the ignore file uses, and
whether the default branch holds its commit, which tells whether every clone has it. Then its line, read by the
script from the mirror, with the value that the scanner found and every other run of characters that could be a value
masked: an assessment today judged its one finding from such a line, the identifier that a tool had given a stored
credential and not the credential, and needed no stop. Never a value, nor the author, whom the scanner reports by name
and address. The list is in the assessment's record, in the home, which is private; the session never opens the file
at that commit, since what it reads goes into its transcript.

**A finding.**

- It is taken for a secret unless its file, rule and masked line show otherwise, as a test's fixture, an example key
  or an identifier does; the report says why for each one it sets aside.
- A secret is a stop condition of the assessment: the record becomes `blocked` and the person gets the list at once,
  since revoking a secret waits for nothing else. That is also why the scan is the assessment's first step. At the
  periodic review it is urgent, as a vulnerability is.
- The person revokes it at its provider and decides whether the history changes. No session changes a history: the
  core rules let a branch only grow, and the guard refuses a forced push. Where a live secret is, is written nowhere
  public before it is revoked: not in the project's repository, an issue or a pull request.
- The assessment then goes on, and proposes the project's item that answers the findings: each listed in the
  scanner's ignore file in the project, `.gitleaksignore`, by its fingerprint, with its outcome beside it, revoked on
  a date or no secret and why. An entry there silences a finding, so that item gets the security review
  (`honsha:security-testing`, A finding), and every later scan leaves the listed findings out. A history that is
  changed leaves no finding to list.

**A public repository.** Its history is public already: a secret in it is taken for used, revoking it is the remedy,
and a change of the history does not take it back from the forks, clones and archives that already hold it. In a
private repository everyone who has had access holds it, and every clone; revoking still comes first, and a change of
the history narrows who can read it later, at the cost of every clone and open branch: the person's choice. A private
repository that is made public publishes its whole history with it.

**When it runs.** First at every assessment, and again at every periodic review, in each repository the review reads,
the kit's clone and the home included. `verify` reads what a work item pushes; the review catches what reaches the
service otherwise, a push or a tag made outside a work item or a pull request's branch, and what newer rules find in
the old history once the kit takes a scanner that has them. It costs little: the runs today read histories of 325 and
740 commits, the larger in under two seconds. The review installs nothing, since the script's folder is temporary.

**The documents and their budgets.**

- `skills/security-testing/SKILL.md`, at 5,361 of the 6,000 characters that each skill has, needs about 1,500 more:
  it gets a budget of its own, about 7,000, set at what the text needs, and the test's comment says why. The section
  belongs there, beside the rule on a secret found in a commit; the assessment's skill, at 5,161, has no more room.
- `skills/assessment/SKILL.md` and `skills/review/SKILL.md` take a step each and stay within 6,000.
- `docs/01-specs/WORKFLOW.md`, at 42,407 of 42,500, gets about 43,000 for the reason in "Security testing", the
  review's reading and the point of a service's piece.
- `docs/01-specs/INTERFACE.md`, at 6,964 of 9,000, stays within its budget.

**The files.** Changed: `skills/security-testing/SKILL.md`, `skills/assessment/SKILL.md`, `skills/review/SKILL.md`,
`docs/01-specs/WORKFLOW.md`, `docs/01-specs/INTERFACE.md`, `docs/01-specs/ARCHITECTURE.md`, `README.md`,
`services/github/README.md` and `checks/budgets.test.mjs`. New: `checks/history-secrets.mjs` and
`checks/history-secrets.test.mjs`.

**Plan.** After the approval, the script and its test come first. Then the trial runs in a subagent on this session's
tier, in the scratchpad, while this session writes the skills and the documents, which the trial does not read: it
reads only the script, which the writing does not change, and it commits nothing. The change itself is not split into
parallel parts: the skills, the documents and the script's opening comment say one thing in several places, and
`checks/interface.test.mjs` reads both the script's folder and the interface, so neither part is verified alone. A
lookup of GitHub's documentation, on the refs it serves and what it keeps of a deleted branch, runs in a subagent on
the light tier at medium effort. Then the verification, the security review, due since the change touches secrets,
the checker, the pull request, its checks read as the workflow's rule on pushes says, and the closing commit. The work
runs on the strong tier at xhigh, as a full item does; it asks for no stronger tier or effort.

**How each criterion is shown.** 1 and 3: the script and its test, read by the checker, the test run by `verify`. 2:
the pin in the script, and the log's reading of the checksums file and the digests. 4 to 6: the files. 7: the trial,
in the log. 8: the verification on this host, the reports, and the pull request's run.

**Assumptions.** gitleaks reads a bare mirror over all its refs and gives each finding a fingerprint; it reads the
patch of a merge that its options ask `git log` for; the system's `tar.exe` on Windows, bsdtar 3.8.9 on this host,
extracts a zip archive; a mirror clone that borrows a clone's objects still takes every ref the service serves, the
refs of pull requests included. The trial and the lookup check them.

**Risks.**

- Findings that are no secret, in an old history, cost the person a look at the first assessment, until the project's
  item lists them; the masked line lets the session set most aside with its reason.
- A masking that misses a value would put it in the transcript: the test covers the usual forms of values, and the
  security review reads the masking.
- A large repository's mirror costs minutes and disk the first time; borrowing the clone's objects keeps that to what
  the clone lacks.
- A host whose application control refuses the scanner cannot run the step: the skill has it say so with the system's
  message, and the person chooses another host.
- The pin ages: a new version comes in an item of the kit, and nothing yet tells the review that one is out (Out of
  scope).
- gitleaks's rules stay as they were on 2026-03-21: a credential of a form that came later goes unseen, at an
  assessment and at each review, until the kit moves to a scanner that knows it.

**For the person.**

- Six choices made here, each against an alternative: a script of the kit, not steps a session takes by hand;
  gitleaks's own release, pinned in the kit by its checksums, not a container image, trufflehog or Betterleaks; the
  refs of pull requests read beside branches and tags; a finding taken for a secret unless its file, rule and masked
  line show otherwise, with no value ever read by a session; the scan first at every assessment and again at every
  periodic review, not at an assessment only; the findings answered listed in the project's `.gitleaksignore` with
  their outcome, by an item under the security review.
- The scanner is what changed since the item was stopped: gitleaks takes security patches only, and its makers develop
  Betterleaks. Betterleaks 1.10.1 in its place would change the pin, six archives with their checksums, the project's
  ignore file, which becomes Betterleaks's own, and the trial's download, its Windows x64 archive of about 10 MB.
  Whether this host's application control runs it is learnt only by running it, and a refusal would stop the item; its
  version 2 would follow soon after, in an item of the kit.
- The trial downloads gitleaks for Windows x64, about 10 MB, from its release, checked against the pin, and runs it in
  the scratchpad on a scratch repository. Approving this strategy gives leave for that download.
- The change touches 9 existing files, where the profile's `kinds` expects 3 of a capability; the measure only
  reports it.
- Left to later: the installation's radar entry for the scanner, and how the review learns of a new version of a tool
  pinned by checksum or digest; the move to Betterleaks; the kit's own security testing, `261125-1850`.

## Approval

Approved by the person on 2026-11-25, in this item's session, as written in `6014d40`, with gitleaks 8.30.1 as the
scanner: the six choices and the trial's download listed under "For the person" included.

## Log

- The record was given by the hub when it started the item; its intent is restated as the core rules ask of a public
  project. The branch was cut from `origin/main` after `git fetch`, and its upstream unset, so that no push can follow
  `origin/main` by default.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` from the kit directory ran once in the worktree before the first commit:
  `npm ci --ignore-scripts` passed.
- Read the skills `honsha:assessment`, `honsha:security-testing`, `honsha:dependencies`, `honsha:security-review`,
  `honsha:review` and `honsha:parallel-parts`; the workflow's "The hosting service", "Security review", "Security
  testing", "Upkeep review" and "Joining an installation"; the interface; the architecture's layout and home; GitHub's
  piece; `checks/budgets.test.mjs`, `checks/interface.test.mjs` and `checks/public.mjs`; the record of `261124-1550`,
  with its trial; and the records of `261125-1849` and `261125-1850` in the backlog.
- Read the records of the three assessments of an installation's projects that ran on 2026-11-25, as their branches
  stood, for what they found running the scan. Each used gitleaks 8.30.1, released on 2026-03-21 and the latest
  release, whose Windows x64 archive has the SHA-256
  `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e` of the release's checksums file and of the digest
  that the release lists. Two downloaded it, one reused the archive of `261124-1550`'s trial; each ran it on the
  project's clone, read-only, with `--redact` and the built-in rules, over the branches and tags that a fetch had
  brought, and the clone was clean after. Histories of 325, 414 and 740 commits, the largest read in 1.35 seconds. One
  finding in all three: rule `generic-api-key` on a line that held the identifier a tool had given a stored
  credential, judged no secret from the line read with its values masked, and no stop. None read the refs of pull
  requests. The assessment of the kit found that `git log -p` gives no patch for its 75 merges, and read them in a
  second run, each merge on a ref's first-parent line against its first parent: no finding.
- Measured the budgets: `skills/security-testing/SKILL.md` holds 5,361 of 6,000 characters,
  `skills/assessment/SKILL.md` 5,161, `skills/review/SKILL.md` 3,989, `docs/01-specs/WORKFLOW.md` 41,836 of 42,000,
  `docs/01-specs/INTERFACE.md` 6,964 of 9,000.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- The person approved the strategy in this item's session on 2026-11-25, then, before the approval was written and
  before any work, compared the kit with a questionnaire of SDLC security controls and stopped the item: the scan of
  the history is to be one part of a review of the whole security story of the kit and of the hub, which the hub
  opens, and the three assessments of the day are to run again once that review's items are merged. The approval
  therefore does not stand. The state is `idea`, so that the record waits in the home's backlog with its strategy, as
  an input of that review, which decides whether the item starts as written, changed or not at all. No file but this
  record was changed.
- The hub started the item again on 2026-11-25, from the home's backlog, with the record as the backlog held it: the
  review of the security story kept it as written. The branch was cut again from `origin/main`, at `390bb0b`, after
  `git fetch`, with no upstream. `git config user.email` matches the profile's `commits.address`; no areas.
  `node checks/verify.mjs --setup` ran once in the new worktree before the first commit: `npm ci --ignore-scripts`
  passed.
- Read the strategy again against the default branch at `390bb0b`. `skills/security-testing/SKILL.md`,
  `skills/assessment/SKILL.md`, `skills/review/SKILL.md` and `docs/01-specs/INTERFACE.md` are as the strategy read
  them, at the same sizes. The workflow now says that the person approves in the worker's own session and that no
  session polls the checks; its budget is 42,500 and it holds 42,407. The architecture changed only where approvals
  are given. The workflow's sections that the strategy changes, and `checks/interface.test.mjs`, are as they were.
- gitleaks has no release after 8.30.1, of 2026-03-21, which is past the 7 days of `honsha:dependencies`. Its release
  lists six archives, Windows, Linux and macOS on x64 and arm64, the Windows arm64 one new since 8.30.0, each with its
  digest; the Windows x64 digest is the one named above. Its README has said since 2026-05-21 that gitleaks is feature
  complete, takes security patches only, and that its author works on Betterleaks; its default branch has taken only
  updates of its pipeline's actions since the release.
- Betterleaks, read in its repository and documentation: maintained by gitleaks's makers, its author among them, under
  the MIT licence; its stable release 1.10.1, of 2026-11-12, lists the same six platforms with a checksums file. Its
  scan of a history reads `git log` with options as gitleaks's does, merges only when asked and against the first
  parent, and it calls a secret's provider only with `--validation`. Its version 2, in release candidates, changes its
  command line, configuration and report. No host of the kit has run it.
- On this host Git Bash puts GNU tar 1.35 first on the path, which reads no zip archive; the system's `tar.exe` is
  bsdtar 3.8.9.
- The hub relayed two confirmations from scans of an installation's repositories: the refs of pull requests hold the
  commits of a pull request closed without a merge, and `git log -p` gives no patch for a merge. The two choices of the
  strategy that rest on them stand.
- Corrected in the strategy: gitleaks's freeze and Betterleaks as the alternative, under "The scanner", "Risks" and
  "For the person"; the six archives of the pin; the system's `tar.exe` on Windows; what a later review finds with a
  scanner whose rules no longer change; the workflow's budget, now about 43,000; the reading of the pull request's
  checks. The scope and the criteria stand as written.
- The state is `awaiting-approval`; the work waits for the person's approval, in this session.
- The person approved the strategy (Approval); the state is `in-progress`.
- No part of the change ran in parallel, as the strategy says. A lookup in GitHub's documentation ran in a subagent on
  Haiku at medium effort, and the trial in a subagent on Opus, while this session wrote the skills and the documents.
- gitleaks 8.30.1's checksums file, read from its release, gives for each of the six archives the digest that the
  release lists; the script pins those six.
- `checks/history-secrets.mjs` takes the remote `origin`, or the clone's only remote, and borrows the clone's objects
  unless the clone is shallow or partial, whose objects are missing. On Windows it extracts with the system's
  `tar.exe`. It gives gitleaks no configuration, an empty folder as its working folder and its ignore path, and
  `--ignore-gitleaks-allow`, so that the built-in rules read everything and only the default branch's ignore file,
  which the script reads, leaves a finding out; `--exit-code=0`, so that any other status is an error. git and the
  scanner run without the variables that point git at another repository and without `GITLEAKS_*`. The script builds
  each fingerprint from the commit, file, rule and line, and reads no other field of the report but the redacted match,
  which places the value in the line. A run is shown only when it reads as a name: letters only, in words of at most 20
  joined by `_`, `-` or `.`, at most four changes of case, 40 characters in all; a part after an `=` is a run of its
  own, and a run with no letter or digit, such as `//`, stays. The remote's address is never printed, and an address
  in git's messages has its credential hidden. Its test: 14 tests, with no network, on a fixture that a local bare
  repository serves.
- The lookup, in GitHub's pages on removing sensitive data, on forks and on checking out pull requests: the namespace
  `refs/pull/` is read-only, GitHub Support removes a pull request's refs and the cached views, the repositories of a
  fork network share their git data, and revoking comes first. That a pull request's `head` ref stays after its branch
  is deleted is not stated there: `git ls-remote origin` on the kit's own repository shows it, with `HEAD`, one branch,
  26 refs `refs/pull/<n>/head`, no `merge` ref since no pull request is open, and no tag; and the hub's confirmation
  above shows it for a pull request closed without a merge.
- The trial's first round, on a scratch repository served as a bare remote, ran on this host with gitleaks 8.30.1,
  which its application control let run, in 6.8 seconds with the download: it reported the five fake values by commit,
  file, line and rule, with the four lines it could read masked, and printed no value, author or path of the remote;
  the clone and the temporary folder were left as they were. The merge's finding came with the file `b/settings.txt`: with
  `--diff-merges=remerge`, git writes a line `remerge CONFLICT …` into the header of a conflict's file, and gitleaks
  then keeps the prefix `b/` in its name, so the line could not be read and the fingerprint named no file. A run of
  gitleaks alone on the same mirror with `--diff-merges=first-parent` named the file and the line right. As the
  strategy foresaw, the script reads each merge against its first parent, which reports again under a merge the
  findings of the branch it brings; its test reads the merge's patch with the script's options.
- The guard refused the trial's push of the scratch repository's `main`, as it refuses any push that updates a branch
  named as the default; the trial stopped there and went around nothing. Its second round serves the scratch working
  repository itself as the remote, with no push. The first push of the scratch `main`, inside a shell script that the
  trial ran, passed the guard, which reads the command line only: reported to the person, outside this item's scope.
- The test's first wording left its temporary folders in the system's temporary folder, 47 of them after the runs:
  they are now in one folder that the test deletes at its end, and the 47 were deleted.
- The skills and the documents are written as the strategy says. `skills/security-testing/SKILL.md` holds 7,557
  characters, more than the 7,000 or so the strategy expected, for what criterion 4 lists: its budget is 7,600.
  `docs/01-specs/WORKFLOW.md` holds 43,024, its budget 43,100. `skills/assessment/SKILL.md` holds 5,543,
  `skills/review/SKILL.md` 4,320 and `docs/01-specs/INTERFACE.md` 7,012, within theirs. The assessment's and the
  review's later steps are renumbered; nothing in the kit cites them by number.
- The trial's second round, with the script from this branch, in the scratchpad, with the scratch working repository
  served as the remote and no push. Its history: a fake GitHub token on `main`, removed by a later commit; a fake GitLab
  token on a branch deleted but kept by `refs/pull/1/head`; a fake Slack token only in a tag; a fake generic key added
  only by a merge's resolution of a conflict; a fake npm token on `main`. Run 1 reported the five by commit, file, line
  and rule and exited 1, in 7.0 seconds; with the npm token's fingerprint in `.gitleaksignore` on `main`, run 2
  reported the other four, left the fifth out and exited 1, in 6.4 seconds; with the four listed too, run 3 found
  nothing and exited 0, in 9.0 seconds. Each run read 4 refs and 10 to 12 commits, and most of its time is the download
  of about 8 MB. The merge's finding named its file and line, with its line masked. No output held a value, whole or in
  part, the commits' author or the remote's path, searched for in each; the clone was unchanged after each run, and no
  temporary folder was left. A merged branch's finding reported again under its merge did not arise, since the merged
  branch held none.
- The security review of `d9fe419` fails on one finding: anyone who can open a pull request, from a fork of a public
  repository any account, adds a ref that the scan reads and that stays after the pull request is closed, so a stranger
  could plant findings that stop every assessment and alarm every review, and the report did not tell them from the
  repository's own branches. Fixed in a commit of its own, inside the scope: the report names the refs that reach each
  finding's commit, the repository's own or else pull requests only, and the skill takes a finding that only pull
  requests opened from forks reach as possibly anyone's, reported with them and stopping nothing. GitHub's piece says
  how to tell such a pull request, `gh pr view <number> --json isCrossRepository`, tried on pull request 61, and the
  workflow's point 8 names it. The case changes criterion 4's rule on a finding (Deviations).
- The review's weak points: 1, a path printed raw, fixed: the script escapes the control and format characters of all
  it prints from the history. 2, the value placed at the first place of what precedes it in the match, fixed: every
  place is masked, and an empty value is passed over; the masking stays a heuristic. 3, an error discarding the whole
  scan, left to the person: the script exits 2 with the message, which the assessment or the review reports, and keeps
  no partial list that a failed run cannot vouch for. 4, the remote's address given to `git clone` with no `--`, fixed.
  5, the replacement refs, fixed: git runs with `GIT_NO_REPLACE_OBJECTS=1`. 6, an entry of `.gitleaksignore` not held
  to the security review by a check, left to the person: the skill's rule in "A finding" already has a project list its
  tools' ignore files under `security-review`, so that `checks/record.mjs` names a change to them. 7, an interrupted run
  leaving its mirror, left to the person: the folder is the user's own, made by `mkdtemp`.
- What the review could not read, the attributes of a bare repository: on this host's git 2.53 the mirror does not read
  `.gitattributes` from `HEAD`, but it does where `attr.tree` names a tree, as some versions of git do unasked for a bare
  repository, and a file of text marked `-diff` or `binary` then gives no patch. Fixed with the rest: the mirror's
  `info/attributes`, which take precedence, unset `diff` for every file. Its test reads the history with
  `attr.tree=HEAD`, with and without that file.
- With the case of a fork, `skills/security-testing/SKILL.md` holds 7,728 characters, its budget 7,800;
  `docs/01-specs/WORKFLOW.md` holds 43,083 of its 43,100. The script's test has 18 tests.

## Verification

## Deviations

- From the security review's finding: criterion 1's report also names the refs that reach each finding's commit, and
  criterion 4's rule on a finding gains a case, a finding that only pull requests opened from forks reach, which is
  reported with them and stops nothing, since anyone can open such a pull request.

## Outcome
