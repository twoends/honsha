---
id: 261125-1850
title: Give the kit its own security testing, as the skill for it asks of every project
project: honsha
type: change
size: full
kind: upkeep
state: awaiting-approval
areas: []
created: 2026-11-25
updated: 2026-11-26
requested-by: person
source: 261124-1550
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked, on 2026-11-25 in the hub's session, to put in the kit's backlog the follow-ups that the kit's item
`261124-1550` (pull request 59) had left out of its scope. This is one of them: the kit's own security testing.

`honsha:security-testing` asks every project for a scan for secrets over the branch's commits, and for the security
rules of its languages, its shell scripts and its pipeline's configuration where it has them, as commands of `verify`.
The kit is a project too: Node.js scripts, shell in its git hook and in its workflows' steps, and GitHub's workflow
files, which GitHub's piece pairs with tools such as zizmor and actionlint. It serves no HTTP, so it takes no dynamic
testing. Its tools are new dependencies, pinned with their rules and taken as `honsha:dependencies` says, with a change
to its lockfile or to the releases it fetches. In that item's trial, gitleaks and ShellCheck ran as native programs
under this host's application control.

Left: which tools, how each is pinned, the cost they add to each verification, and which findings their first run
brings up, each fixed or silenced with its reason in this item.

### Addenda

On 2026-11-25, in the hub's session, the person chose to put in the backlog every item that the home's report
`261125-1956` proposes, in the order it proposes. The report's item 3 adds to this one: beside its tools, the kit's
profile lists under `security-review` the files that guard, as the kit's assessment `261125-1907` proposed in its
finding 3: the guard and its patterns (`hooks/guard.mjs`, `services/github/merge-commands.json`), the check of personal
content and its hook, the security reviewer's file, the security skills, and the new tools' configuration. The report
estimates the item at 1 to 2 times a full item, 38 to 76 minutes and 200,000 to 400,000 output tokens. It comes after
`261125-1913`, whose pinned scanner it can take, and `261125-2038`.

## Scope and acceptance criteria

### In scope

- `checks/releases.mjs`, new: the pins of the release programs that the kit's checks run, gitleaks moved from
  `checks/history-secrets.mjs` beside ShellCheck, actionlint and zizmor, and the verified install moved with it; its
  test, `checks/releases.test.mjs`, takes the installer's tests from `checks/history-secrets.test.mjs`.
  `checks/history-secrets.mjs` takes its pin and its install from there, and does what it does now.
- `checks/security-testing.mjs`, new, with its test: the kit's own static security testing. `--setup` installs the
  pinned programs for the host; one command for each program runs it.
- `.hub/profile.yml`: the setup's new line, the four commands in `verify`, a comment on dynamic testing, and the paths
  under `security-review`.
- The security rules of JavaScript: `eslint-plugin-security` in `package.json` and `package-lock.json`, its rules in
  `.oxlintrc.json`, run by the profile's `oxlint`.
- The configuration and ignore files that the first run's findings need, and only those: `.gitleaksignore`,
  `.github/actionlint.yaml`, `.github/zizmor.yml`.
- The first run's findings: each fixed, or silenced where it stands with its reason, in whatever file of the kit holds
  it, the workflows and the git hook included.
- `README.md`: the rows of `checks/` and of the profile, and "Checking a change to the kit". In three files that
  `261125-2039` changes, a line each, once the hub agrees: `docs/01-specs/INTERFACE.md`, the new script among those that
  are not part of the interface, as its test asks; `docs/01-specs/ARCHITECTURE.md`, the line of `checks/`; and
  `services/github/README.md`, zizmor's release binaries among the forms it comes in.

### Out of scope

- Dynamic testing: the kit serves no HTTP.
- The rules themselves: the skills of the security testing, review and posture, and the workflow, which already ask
  what this item does.
- Another project's security testing, and a command of the interface that would scan a project's branch with the
  kit's pinned scanner: a project's `verify` cannot name the kit's folder, and offering one is a capability of its own.
- The weak points of the security testing (`261125-1849`), those of `checks/history-secrets.mjs` and of the outsider
  rule in GitHub's piece, and a push run from inside a script that the guard does not see: other items' and ideas'.
- What the scan of the kit's whole history finds in commits before this branch: the security posture's, at the
  assessment and the periodic review, which list the answered ones in `.gitleaksignore`.
- A new version of gitleaks, another scanner of secrets, and how the periodic review learns of a new version of a
  program pinned by its digest.
- GitHub's own scanners, which the person decides on (finding 5 of the kit's assessment).
- The one-line shell commands inside `hooks/hooks.json` and `.claude/settings.json`: no shell tool reads a command
  inside JSON as a file, and both files join the paths of the security review.

### Boundaries

- Nothing breaks for a project: no rule, command of the interface, template or input of `project.yml` changes. A
  finding fixed in `project.yml` keeps what the workflow does for a project.
- `checks/history-secrets.mjs` pins the same archives by the same digests, prints the same report, and keeps the tests
  of what it does.
- Each tool is free, runs from the command line with no account, is pinned as `honsha:dependencies` says, a release by
  its SHA-256 or a package of the lockfile, has its rules pinned with it, sends nothing out, and fails its command on a
  finding.
- Downloads come only from each tool's GitHub release and from the npm registry, at versions released at least 7 days
  earlier; on this host, the archives for Windows x64, into the worktree's `node_modules/`. The approval gives leave for
  the downloads that "For the person" lists, and for nothing else.
- No output prints a secret's value. No history changes.
- In the files of `261125-2039`, only the lines named above, after the hub agrees; no budget of
  `checks/budgets.test.mjs` is expected to change, since the interface holds 7,041 of its 9,000 characters.

### Acceptance criteria

1. `checks/releases.mjs` holds the pins of gitleaks 8.30.1, with its six archives and digests unchanged, ShellCheck,
   actionlint and zizmor, each at its newest release published at least 7 days before the work, with the SHA-256 of each
   archive it publishes for the six platforms of the kit's pin and the program's path inside it, read from the
   release's checksums file where there is one and from the digests that GitHub lists for the release's files. Its
   install refuses an archive whose digest differs before anything is written or extracted, and extracts the program
   alone. `checks/history-secrets.mjs` takes both from it.
2. `node checks/security-testing.mjs --setup` installs each pinned program for the host's platform under
   `node_modules/.cache/honsha-tools/`, refuses an archive with another digest, and names a program that has no archive
   for the platform; the profile's `setup` runs it after `npm ci`.
3. `node checks/security-testing.mjs gitleaks` scans each commit from `HONSHA_BASE` to `HONSHA_HEAD` where both are set,
   and otherwise from the default branch on the hosting service to `HEAD`, each merge by what it adds of its own; with
   the scanner's built-in rules, the checkout's `.gitleaksignore` as its only ignore file and no allowance written
   inline; its findings redacted, and each printed by commit, file, line, rule and fingerprint with its line masked,
   never a value. It exits 1 with a finding.
4. `shellcheck` reads every shell script the repository tracks, known by its extension or its first line, with no rc
   file; `actionlint` reads every workflow file, with the pinned ShellCheck on the scripts of its steps and no other
   linter; `zizmor` reads the workflow files offline. Each command fails on a finding, and on a program that is missing
   or answers with another version.
5. The profile's `oxlint` runs every rule of `eslint-plugin-security`'s recommended set and `no-new-func`, but for a
   rule turned off in `.oxlintrc.json` with its reason beside it; a fixture outside the kit shows that oxlint runs each
   rule left on. If oxlint's JavaScript plugins cannot run them, ESLint runs them instead, as the strategy says.
6. The profile's `verify` lists the four commands, says beside the list that the kit serves no HTTP, and lists under
   `security-review` the paths that "The paths of the security review" names; `checks/profile.mjs` reads them.
7. Each finding of the first run is fixed or silenced where it stands with its reason, and the log lists each with what
   was done; the security review judges each silenced one.
8. The tests of both new scripts run with no network and cover criteria 1 to 4.
9. The README, the interface, the architecture and GitHub's piece say what holds.
10. The log says which programs ran under this host's application control, what the setup downloads, and how long each
    command takes here and in the pipeline. A program that cannot run here is left to the pipeline, said in the log,
    except gitleaks, whose failure here stops the item.
11. The profile's `verify` commands pass, the security review and the checker pass, and the kit's pipeline passes on the
    pull request.

## Strategy

**The kinds, and a tool for each.** The kit's files call for four of the skill's kinds, and the tools follow the
skill's examples where one fits:

- **Secrets:** gitleaks 8.30.1, the scanner that `checks/history-secrets.mjs` already pins and that ran on this host, so
  that the branch and the whole history are read with the same rules.
- **JavaScript:** `eslint-plugin-security` 4.2.1, published on 2026-10-30, under the Apache licence, with one
  dependency, `safe-regex`. Its rules look for what the kit's scripts could hold: a child process or `eval` with an
  expression, a regular expression open to catastrophic backtracking, a regular expression or a file name built from a
  variable, bidirectional and invisible characters, deprecated buffers. Against the others: Semgrep's community rules
  are under a licence that limits their use, and its engine needs Python; Opengrep publishes no Windows build that the
  lookup found; ESLint itself has some 30 direct dependencies, where the kit's tools hold 7 packages in all.
- **Shell:** ShellCheck 0.11.0, the newest release, which ran on this host, for `.githooks/pre-push` and any later
  script.
- **The pipeline's configuration:** actionlint 1.7.12, under MIT, for the workflows' syntax, expressions and, through
  the pinned ShellCheck, the scripts of their steps; zizmor, under MIT, for their holes: untrusted input in a script,
  permissions, unpinned actions, credentials left in a checkout. zizmor 1.33.1 came out on 2026-11-22, so the work takes
  the newest release published at least 7 days before it, 1.32.0 of 2026-11-02 unless a later one qualifies by then.

**Where the programs come from.** gitleaks, ShellCheck, actionlint and zizmor are each a release, pinned by the
SHA-256 of each archive: from the checksums file of gitleaks and actionlint, which matches GitHub's digests, and from
GitHub's digests for ShellCheck and zizmor, which publish no checksums file. The pins move into one module,
`checks/releases.mjs`, with the install that checks the digest before it writes or extracts anything: one place for
every pin of a release, which `checks/history-secrets.mjs` and the new script both read, and one install. Each pin
covers the platforms its tool publishes among the six that gitleaks's covers; neither ShellCheck nor zizmor builds
for Windows on Arm.

**Installed at the setup, checked at the install.** `node checks/security-testing.mjs --setup`, after `npm ci` in the
profile's `setup`, installs each program for the host into `node_modules/.cache/honsha-tools/<name>-<version>/`, where
git, Prettier, oxlint and TypeScript already read nothing, and where `npm ci` empties it at each setup. The digest is
checked at the install, as npm checks a package's integrity at its install and not at each run, so the setup's download
is paid once in each worktree and each pipeline job, and not at each of the worker's runs of `verify`. Each command
then asks its program for its version and fails on another, or on a missing program, naming the setup. The history scan
keeps downloading into a temporary folder at each run, since it runs in a project's clone, where the kit's setup never
ran.

**The scan of the branch.** `node checks/security-testing.mjs gitleaks` reads the range the skill names: from
`HONSHA_BASE` to `HONSHA_HEAD`, which both of the kit's workflows set, and otherwise from the default branch on the
hosting service, after the worker's `git fetch`. It takes each commit's patch, and each merge's by what it adds of its
own, with git's remerge diff: the first-parent diff that the history scan reads would make a merge of the default
branch report again what other items brought, which their own scans read. It uses the built-in rules and the same
redaction as the history scan, and the checkout's `.gitleaksignore` as its only ignore file, the one that the history
scan reads on the default branch; it honours no allowance written inline, as the history scan does not, since
`checks/record.mjs` names a change to the ignore file and none to a comment. It reuses the history scan's reading of
the report, its fingerprints and its masking of a line, so that it prints each finding by where it is and never by its
value. On the closing commit, a push that the pipeline does not verify, the worker runs it with the checks that read the
record.

**Shell and workflows.** `shellcheck` takes every file that `git ls-files` gives whose extension is `.sh` or `.bash` or
whose first line names a shell, with `--norc`, so that no rc file of the host changes its checks. `actionlint` takes
every file of `.github/workflows/`, with `-shellcheck` set to the pinned ShellCheck and `-pyflakes=`, since no step
runs Python. `zizmor` runs with `--offline`, which leaves out the few audits that read GitHub's API, and at its default
persona; each of its exit codes for a finding fails the command. One command for each program, and not one for all, so
that a program the host cannot run leaves only its own command to the pipeline.

**JavaScript, through oxlint.** oxlint 1.94.0, which ran here, reads ESLint plugins as JavaScript plugins, an alpha
feature: the plugin is listed under `jsPlugins` in `.oxlintrc.json`, with each rule of its recommended set at `error`,
beside oxlint's own `no-new-func`; its `no-eval` and `no-implied-eval` are already on in its categories. One linter and
one command, pinned by the lockfile. Since a plugin rule that oxlint did not run would pass in silence, a fixture in the
scratchpad holds one case of each rule, and the log records that oxlint reports each. If it cannot, ESLint at its
newest release published 7 days earlier runs the same rules from `eslint.config.mjs`, as a command of its own, and the
log says why.

**The first run's findings.** Each is fixed in this item where the fix is sound, or else silenced where it stands with
its reason beside it: an inline comment for oxlint, actionlint or zizmor, an entry of `.gitleaksignore` under a comment
with its reason. A rule whose first run gives many findings of one false kind, as a file name built from the kit's own
arguments, is turned off in `.oxlintrc.json` with its reason rather than silenced in each place, where a few dozen
comments would hide the one that matters; the log gives each rule's count. `detect-object-injection` and
`detect-non-literal-fs-filename` are the likely ones. The security review, which this item calls for, judges each.

**The paths of the security review.** The profile lists:

```yaml
security-review:
  - hooks/guard.mjs
  - hooks/hooks.json
  - services/github/merge-commands.json
  - checks/public.mjs
  - checks/pushed.mjs
  - .githooks/pre-push
  - .claude/settings.json
  - agents/security-reviewer.md
  - skills/security-review/SKILL.md
  - skills/security-testing/SKILL.md
  - skills/security-posture/SKILL.md
  - checks/history-secrets.mjs
  - checks/releases.mjs
  - checks/security-testing.mjs
  - .oxlintrc.json
  - .gitleaksignore
  - .github/actionlint.*
  - .github/zizmor.*
  - zizmor.*
```

The guard with its wiring and its patterns; the check of personal content with its hook and the setting that installs
the hook at each session's start; the reviewer and the three security skills; the scripts of the security testing; and
the files that configure or silence its tools, those that do not exist yet included, where zizmor would read a
configuration. `hooks/hooks.json` and `.claude/settings.json` are beyond the assessment's list: a change there can
switch off the guard or the hook without touching either.

**Cost.** The setup downloads about 27 MB on Windows and 23 MB on Linux, in each worktree and in each of the pipeline's
three jobs that run it, the two of `verify` and `project`. Each command should take a few seconds; the log gives the
measures on this host and in the pipeline's run.

**The documents.** The README's rows of `checks/` and `.hub/profile.yml`, and its paragraph on checking a change, which
names what `verify` runs and what the setup installs. The three lines in the files of `261125-2039`, asked of the hub
before they change; whichever item merges second takes the other's lines with the default branch. No budget changes.

**The files.** New: `checks/releases.mjs`, `checks/releases.test.mjs`, `checks/security-testing.mjs`,
`checks/security-testing.test.mjs`, and the configuration and ignore files that the findings need. Changed:
`.hub/profile.yml`, `.oxlintrc.json`, `package.json`, `package-lock.json`, `checks/history-secrets.mjs`,
`checks/history-secrets.test.mjs`, `README.md`, `docs/01-specs/INTERFACE.md`, `docs/01-specs/ARCHITECTURE.md`,
`services/github/README.md`, and the files that the findings' fixes touch.

**Plan.** After the approval: read the pins, and zizmor's newest release that qualifies; write `checks/releases.mjs`
with its test and move the history scan onto it; write `checks/security-testing.mjs` with its test; run the setup,
which downloads the Windows archives, and each program once, which tells what the application control lets run; add
the plugin and its rules, with the fixture's trial; run every command, and fix or silence each finding; the profile and
the documents; then the verification, the security review, the checker, the pull request, its checks and the closing
commit. The change is not split into parallel parts: a finding's fix can touch any script, the new ones included. If
the JavaScript rules find many, subagents on this session's tier read them by folder, without writing, and the fixes
are made here. The work runs on the strong tier at xhigh, as a full item does.

**How each criterion is shown.** 1 to 4 and 8: the scripts and their tests, which `verify` runs; 1 also the log's
reading of the checksums and digests. 5: `.oxlintrc.json` and the fixture's trial in the log. 6 and 9: the files. 7:
the log and the security review. 10: the log, and the pipeline's run. 11: the verification, the reports, the
pipeline's run.

**Assumptions.** zizmor's archives hold the program at a path the trial reads; Windows's own `tar` extracts a `.zip`,
as it does for gitleaks; each program runs here as gitleaks and ShellCheck did; git's remerge diff gives gitleaks a
patch it reads, with the file name it shows for a conflict, which the history scan found to be `b/<path>`, written in
the log if it appears.

**Risks.**

- oxlint's JavaScript plugins are alpha and not covered by semver: a later oxlint can change how they run, and its
  upgrade, a work item, would show it. The fallback costs ESLint's dependencies.
- actionlint 1.7.12 may not know the contexts `job.workflow_repository` and `job.workflow_sha` that `project.yml` reads;
  a finding of that kind is silenced in `.github/actionlint.yaml`, with the reason.
- A finding in `project.yml` changes the workflow that every project calls; its fix keeps what the workflow does.
- A fixture of a scanner's test that looks like a secret, as one in `checks/history-secrets.test.mjs`, fails the scan of
  any later branch that changes its line; the moved tests keep their lines as they are.
- Once this item is merged, `skills/security-posture/SKILL.md` and `skills/security-testing/SKILL.md` call for the
  security review in every item that changes them, `261125-2039` included if it merges the default branch after.

**For the person.**

1. JavaScript's rules: `eslint-plugin-security` run by oxlint, with ESLint as the fallback, or ESLint from the start.
2. The programs installed at the setup and checked there, as npm's packages are, or downloaded and checked at each run,
   as the history scan does, at about 27 MB a run.
3. One module for every pin of a release, which moves gitleaks's pin out of `checks/history-secrets.mjs`.
4. The paths of the security review, with `hooks/hooks.json` and `.claude/settings.json` beyond the assessment's list,
   and without `checks/record.mjs`: it enforces the review, but most of its changes touch only how a record is read.
5. The downloads the approval gives leave for, each from its tool's release on GitHub unless named otherwise:
   `gitleaks_8.30.1_windows_x64.zip`, about 8 MB; `shellcheck-v0.11.0.zip`, 8.1 MB;
   `actionlint_1.7.12_windows_amd64.zip`, 2.5 MB, and `actionlint_1.7.12_checksums.txt`, 1 KB; zizmor's `zizmor-x86_64-pc-windows-msvc.zip` at the release the
   work takes, 8.5 MB at 1.32.0; from the npm registry, `eslint-plugin-security` 4.2.1 with `safe-regex` and
   `regexp-tree`, about 1 MB, and, only if the fallback is needed, ESLint with its dependencies, a few MB. Each new
   worktree's setup downloads the four archives again.

## Approval

## Log

- The hub gave the record from the home's backlog when it started the item; its intent and its addendum are restated
  as the core rules ask of a public project. The branch was cut from `origin/main` at `287ce93` after `git fetch`,
  with no upstream. `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area
  pack is loaded.
- `node <kit directory>/checks/verify.mjs --setup` ran once in the worktree before the first commit:
  `npm ci --ignore-scripts` passed, 7 packages.
- Read `honsha:security-testing`, `honsha:dependencies`, `honsha:security-posture` and `honsha:security-review`; the
  workflow's sections on dependencies, the security review, the security testing and the posture; the interface's
  commands; the architecture's and the README's lists; GitHub's piece on its free protections and on the static testing
  of the workflows; `.github/workflows/verify.yml` and `project.yml`; `checks/history-secrets.mjs`, `checks/verify.mjs`,
  `checks/profile.mjs`, `checks/interface.test.mjs`, `checks/references.test.mjs` and `checks/budgets.test.mjs`; the
  records of `261124-1550` and `261125-1913`. In the home: the kit's assessment `261125-1907`, its findings 1 and 3.
- oxlint 1.94.0 ran on this host, exit 0, and its native binding loaded from Node.js.
- A lookup of the tools' releases and documentation ran in two subagents on Haiku at medium effort, reading GitHub's
  API and the tools' pages. gitleaks 8.30.1, of 2026-03-21, is its latest release. ShellCheck 0.11.0, of 2025-08-04, is
  its latest, under GPL-3.0, with GitHub's digests on its files and no checksums file, and no build for Windows on Arm.
  actionlint 1.7.12, of 2026-03-30, under MIT, with a checksums file and builds for the six platforms; `-shellcheck`
  names the ShellCheck it runs, and `.github/actionlint.yaml` ignores an error by a regular expression. zizmor 1.33.1
  came out on 2026-11-22 and 1.32.0 on 2026-11-02, under MIT, as release binaries with GitHub's digests and no
  checksums file, no build for Windows on Arm; `--offline` turns off every request; `# zizmor: ignore[<audit>]` silences a finding
  inline, and `zizmor.yml` in `.github/` or the root configures it; exit codes 11 to 14 give a finding's severity.
  `eslint-plugin-security` 4.2.1 holds 15 rules, all in its recommended set. oxlint's JavaScript plugins are alpha;
  whether they run this plugin was not found. Semgrep's rules are under the Semgrep Rules License, and no Windows build
  of Opengrep was found. Whether actionlint knows `job.workflow_repository` and `job.workflow_sha` was not found.
- Measured: `docs/01-specs/INTERFACE.md` 7,041 characters of its 9,000; `skills/security-testing/SKILL.md` 7,852 of
  7,900, which this item does not change.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval, in this
  item's session, and for the hub's answer on the three lines in the files of `261125-2039`.

## Verification

## Outcome
