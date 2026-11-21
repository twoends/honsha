---
id: 261121-1306
title: Run the kit's pipeline on each push to main, and check there the patterns of personal content
project: honsha
type: change
size: full
kind: fix
state: done
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: 38
model: claude-opus-5-5
effort: xhigh
checks:
  - { due: 2026-11-28, what: "The run of verify.yml on the push of this item's merge to `main`, read with `gh run list --branch main --event push`: `verify` on Linux and on Windows, `project / checks` and `personal content` passed, with the commits check over that push's first-parent commits and the patterns over every commit it added." }
---

## Intent

The person asked, through the session that started this one, to close two gaps of the kit's own pipeline that a
review of 2026-11-21 left open, both found on `main` at `5a5492f`. First, `.github/workflows/verify.yml` runs only on
pull requests to `main`, while the workflow's section 14.2, item 1, asks for a run on every push to the default branch
as well: merges land there with no run of their own, so pull requests merged minutes apart were never checked
together. Each check is to behave on such a push: the check of the record, the check of the commits over the pushed
commits, the job that calls `project.yml` on the kit, and the three variables that item 3 defines for a push. Second,
the check of personal content, `checks/pushed.mjs` run by the `pre-push` hook, runs only in the clone of whoever
pushes. The kit's repository is public, so its part made of patterns, e-mail addresses and paths into a user's folder,
is to run in the pull requests' pipeline too, still naming the commit, the file and the line and never what it found,
and not flagging the addresses that the profile allows under `commits.address`. The name of the machine's user is read
from the system at push time and cannot be known in the pipeline: the strategy says so, and that part stays local.
`services/github/README.md` is to describe the kit's wiring as it then is. Given on 2026-11-21 by the session that
started this one, for the person.

## Scope and acceptance criteria

### In scope

- `.github/workflows/verify.yml`: a run on every push to `main` besides the pull requests, a concurrency group and
  three variables that suit both events, and a job that runs the patterns of the personal-content check.
- `checks/pushed.mjs`: a mode that checks the commits of the range that `HONSHA_BASE` and `HONSHA_HEAD` give, by the
  patterns only; in both modes, the addresses that `commits.address` allows are let through. Its test.
- `checks/public.mjs`: `personal()` takes the allowed addresses. Its test.
- `services/github/README.md`, where it describes the kit's own wiring, and the kit's `README.md`, where it says when
  the verification and the hook run.

### Out of scope

- `.github/workflows/project.yml` and a project's caller file: project.yml has its push path already (item
  261119-1751), and the kit's push run now runs that path on the kit.
- The personal-content check in other projects: the hook is the kit's own, as the kit's README says.
- A push whose `before` is all zeros or no longer reachable, the first push of a new or recreated repository or a
  forced one: there `checks/commits.mjs` fails, since git cannot read the range, as item 261119-1751 assumed for
  projects. What such a push should check is a question about history made before the rules, not this item's.
- Requiring a check before a merge, with a ruleset or branch protection: a setting of the person's.
- The name of the machine's user in the pipeline (Strategy).

### Boundaries

- The workflow's token stays read-only. The new job uses the two actions already pinned, and no secret.
- On a pull request the `verify` and `project` jobs run as they do now; only the new job is added.
- A report never holds what it found. The hook's results do not change but for addresses that match
  `commits.address`, which with the kit's profile are `noreply` ones it already lets through.
- No new dependency. The tests build their samples at run time, so that no file holds what the check looks for.

### Acceptance criteria

1. `verify.yml` runs on every pull request to `main` and on every push to `main`. A newer run of a pull request still
   cancels its older one, and no push's run cancels another's: the group of a push is its commit.
2. On a push, the `verify` job and the new job get `HONSHA_BRANCH` `main`, `HONSHA_BASE` the tip before the push and
   `HONSHA_HEAD` the pushed commit; on a pull request, what they get now. So on a push `checks/record.mjs` finds no
   work branch and passes, and `checks/commits.mjs` reads the first-parent commits the push added. The `project` job
   runs on both events.
3. `node checks/pushed.mjs --range` checks each commit of `HONSHA_BASE..HONSHA_HEAD`, or each commit `HONSHA_HEAD`
   reaches when the base is all zeros, by the patterns of `checks/public.mjs` and with no name. Its report names the
   commit and the file and line, the name of a file, the message or the identities, never the text. It exits with 1 on
   a finding, and with 1 and a line that names the variable when either is not set.
4. An address that matches the profile's `commits.address` is no finding, in a line, a message, a file's name or the
   identities, in both modes; any other address that is not a placeholder still is one.
5. The new job of `verify.yml` runs that command once, on Linux, on both events, with a result of its own.
6. Tests in `checks/pushed.test.mjs` and `checks/public.test.mjs` cover criteria 3 and 4, and that the range mode does
   not look for the machine's user where the system gives a name the hook looks for. The hook's existing tests pass.
7. `services/github/README.md` and `README.md` describe the kit's wiring, and where the patterns are checked, as they
   then are.
8. `node checks/verify.mjs` passes its 7 commands, and on the pull request the four jobs pass: `verify` on Linux and on
   Windows, `project / checks` and the new one.

## Strategy

**The push run.** verify.yml adds `push: branches: [main]`. The three variables move from the `verify` job to the
workflow's `env`, with the expressions project.yml already uses: on a push `github.ref_name`, `github.event.before` and
`github.sha`, on a pull request what they are now. The `project` job takes nothing from that `env`, since a called
workflow gets none of its caller's, and project.yml sets its own. The group becomes
`verify-${{ github.event.pull_request.number || github.sha }}`: a push has no number, so with today's group every push
would share `verify-` and cancel the one before. The trigger alone is not enough: with the variables empty, as today's
job would give them on a push, the check of the commits passes having read nothing (Log). Each push run checks `main`
as merged, so of two pull requests merged minutes apart the second one's run checks both.

**The patterns in the pipeline.** pushed.mjs gains `--range`. It reads `HONSHA_BASE` and `HONSHA_HEAD`, lists the
commits with `git rev-list`, all those `HONSHA_HEAD` reaches when the base is all zeros, since a push that creates a
branch publishes all of it, and runs each through the `commitFindings` the hook uses, with no names. Its report has the
hook's lines; its closing words say the commits are already on the hosting service. Without both variables it fails:
falling back to `origin/main..HEAD`, as the check of commits does, would read nothing in a pipeline's checkout.

The name of the machine's user stays with the hook. In a pipeline the system's user is the runner's, never the name of
who made the commits, and the kit keeps no list of names, by design. So the pipeline checks the patterns, and only the
hook of the clone that pushes can find the name.

`personal()` takes a third argument, a pattern: an address it matches is no finding. pushed.mjs reads it from
`commits.address` in the profile of the folder it checks, in both modes, so that the hook and the pipeline judge an
address alike. An address the profile allows for authors and committers is in every commit's metadata already, so
letting it through in a line publishes nothing more. With the kit's profile today no result changes, since those
addresses hold `noreply` and are placeholders; if the profile named another address, it would stay out of findings.

The new job, `personal content`: Linux, Node.js 26, a checkout with the whole history and no token left behind, then
`node checks/pushed.mjs --range`. One system is enough, since the check reads git's output; it needs no `npm ci`, since
pushed.mjs uses Node.js's own modules and the kit's. On a pull request it reads the branch's commits, which a clone
without the hook, or a push that skipped it, may have sent; on a push, also the merge commits, which the hosting service
writes and no clone's hook sees. It finds content once it is on the public branch: it shows it before the merge and
stops the merge only where a ruleset requires the check. Taking it out of the history is the person's; a finding that
is wrong shows as a failed job, and the person judges it, as with a push made with `--no-verify`.

**Tests.** In pushed.test.mjs, on a scratch repository: the range mode names commit, file and line and not the text;
finds what a later commit of the range removes; reads all history on a zero base; lets through an address matching
`commits.address` of a profile in that repository, in a line and as the author, and not another one; does not find the
machine's user, built from the system at run time, where `personalNames()` gives it and the hook mode finds it. The
command itself: a missing variable fails with its name; a finding exits with 1 and its output holds no sample; a clean
range exits with 0. The hook's own test also copies `checks/profile.mjs`, which pushed.mjs will import. In
public.test.mjs, `personal()` with an allowed pattern.

**Documents.** services/github/README.md, "Checks on pull requests and on the default branch": the kit's file runs on
both events with three jobs; the items of the contract name it where they hold for it; a paragraph says what the third
job checks and why it does not look for a name. README.md: the verification runs on every pull request and every push
to `main`, and the hook's paragraph says that the pipeline checks the patterns again. WORKFLOW.md stays as it is: 14.2
asks for the push already, and the personal-content check is the kit's own, not part of the contract.

**Commits.** The work in two, since its parts can be reviewed apart: the push run with its documents; then the range
mode, its tests, its job and its documents. Then the pull request, and the closing commit.

**Assumptions.** On an ordinary push `github.event.before` is `main`'s previous tip, and a checkout of the whole history
holds it. On a pull request the checkout of the merge holds the branch's head, as the check of commits relies on now.

**Risks.**

- A forced push, or a recreated repository, makes `before` unreachable or all zeros: the check of commits then fails
  (Out of scope); the patterns read all history on zeros and fail on an unreachable base.
- Each push to `main` runs four jobs where it ran none. The repository is public, where GitHub's standard runners cost
  nothing.
- The push path is seen only after a merge. This item's own merge is a push to `main`, so its run is a deferred check,
  declared in `checks` with the work.

The item is full, as CI configuration. D87 of the home allows it: it fixes a defect of the kit. It touches 7 existing
files where a fix expects 4, since it closes two gaps, which meet in verify.yml and in the piece's README; for the same
reason it has no parallel parts.

## Approval

Approved by the person on 2026-11-21, in the chat of the session that wrote the strategy.

## Log

- Branch cut from `main` at `5a5492f`. Tried there before any change: with `HONSHA_BRANCH=main`, `checks/record.mjs`
  says that `main` is not a work branch and passes; `checks/commits.mjs` with the default branch's variables passes over
  the merge of pull request 37, and over the last five first-parent commits of `main`. With the three variables empty,
  as today's `verify` job would give them on a push, it reads `origin/main..HEAD`, which a push's checkout leaves empty,
  and passes having read nothing. With a base of zeros it fails: git cannot read the range.
- The patterns of `checks/public.mjs`, with no names, over each of the 251 commits that `main` reaches, run with the
  `commitFindings` of `checks/pushed.mjs` from a script outside the repository: no finding.
- `.github/workflows/verify.yml` runs on a push to `main` too. The three variables are in the workflow's `env` and
  follow the event, and the group of a push is its commit. The `project` job's comment names both of its paths.
  `services/github/README.md` says that the kit's file runs on both events, that project.yml's path for a push runs at
  each merge of the kit, and that the kit's file sets the variables as project.yml does; `README.md` says that the
  verification runs on every push to `main`.
- `checks/public.mjs`: `personal()` takes a pattern of allowed addresses. `checks/pushed.mjs`: `--range`, with
  `rangeCommits`, `checkRange` and `allowedAddress`, which reads `commits.address` from the profile of the folder
  checked; both modes pass it to `commitFindings`. The command reads the profile before git, so that its error, which
  names a key, is shown as it is, and a git error still is not; a profile the reader refuses now stops the hook too.
  The report's closing words say, in the pipeline, that the commits are on the hosting service already.
- `checks/pushed.test.mjs`: five tests, for the range over commits a remote holds, the zero base, the allowed
  addresses in both modes, the machine's user, built from the system, that only the hook looks for, and the command's
  variables, exit codes and output; the hook's test copies `checks/profile.mjs` too. `checks/public.test.mjs`: one
  test for the allowed pattern. The 22 tests of the two files pass here, the one on the machine's user among them.
- `verify.yml`: the job `personal content`. `services/github/README.md`: the kit's third job, what it checks and why
  not the name; `README.md`: the pipeline checks the patterns again.
- The branch was pushed, its hook passing, and pull request 38 opened before the first check, so that the kit's own
  pipeline, the new job among its four, could run on it.
- Check on `b1249ae`, by `honsha:checker`: fail, three findings.
  - No test covered an allowed address in a file's name, nor a missing `HONSHA_BASE`. The test of the allowed
    addresses adds a file in a folder named with one, and the test of the command tries each variable missing and
    both.
  - The hook stopped on a profile the reader refuses, which the Boundaries rule out. `allowedAddress` now gives no
    pattern for such a profile, so the check finds more and never less, and the reader's errors are left to the other
    checks; the command no longer reads the profile apart. The test of the allowed addresses tries such a profile in
    both modes.
  - The deferred check that the Strategy names was not in `checks`; it is now.
  - Found while writing the test: in a file's name such as `<address>.md` the pattern of addresses takes the extension
    into the domain, so an allowed address named so is still a finding, which errs toward finding more. The test
    names a folder with the address.
- Repeated check on `31ca847`, by `honsha:checker`: pass, no finding. Its report ended with a list of the files it
  read, by absolute paths into the user's folder; the copy below leaves that list out, since the kit must not publish
  such a path.

## Verification

On `31ca847`, Windows 11, Node.js 26: `node checks/verify.mjs` passed all 7 commands: Prettier, oxlint, TypeScript,
153 tests, the plugin validator, `node checks/record.mjs` ("The record work/2026/11/261121-1306-kit-pipeline-gaps.md
has the shape the rules ask for.") and `node checks/commits.mjs` ("The 5 commits of the branch follow the rules.").

On GitHub, pull request 38, run `44908291743` on `b1249ae`: `verify (ubuntu-latest, Node.js 26)`,
`verify (windows-latest, Node.js 26)`, `project / checks` and `personal content` passed; the last printed "From
HONSHA_BASE to HONSHA_HEAD, 4 commits read: none adds what the patterns find." Run `44909078297` on `31ca847`: the same
four jobs passed, and `personal content` read 5 commits.

### Earlier checker reports

On `b1249ae`, a full check.

**Verdict:** fail

**Findings**

1. Criterion 6 is met only in part. No test covers an allowed `commits.address` in a file's name (criterion 4 lists that place), or a missing `HONSHA_BASE` (criterion 3 says "either"). `checks/pushed.test.mjs:205-216` and `:241-243` show what is tested. Fix: add both cases to those two tests.
2. A change outside the boundaries is not declared. The hook now fails on a profile the reader refuses (`checks/pushed.mjs:275-282`, Log entry 4), which the Boundaries rule out, and it is not under Deviations. Fix: declare it under Deviations, or make the hook carry on without the pattern.
3. The deferred check is missing. The Strategy promises the push run of this item's own merge "declared in `checks` with the work", and `checks` is empty (`work/2026/11/261121-1306-kit-pipeline-gaps.md:17`). Fix: add the `checks` entry.

### Checker report

On `31ca847`, a repeated check of the changes since `b1249ae`, with the record's Verification not yet committed.

**Verdict:** pass

A repeated check of the diff since `b1249ae` (one commit, `31ca847`). All three findings of the last report are fixed:

1. Tests for the two missing cases are now there. An allowed address in a file's name is tested at `checks/pushed.test.mjs:210-218`: the folder `for-<address>/notes.md` is let through in both modes, and without the pattern the count rises to 5. A missing `HONSHA_BASE`, and both variables missing, are tested at `checks/pushed.test.mjs:249-257`.
2. The hook no longer stops on a profile the reader refuses. `allowedAddress` catches the reader's error and returns null (`checks/pushed.mjs:114-121`). `main()` no longer reads the profile on its own (`checks/pushed.mjs:282-290`). `readProfile` checks the pattern before `new RegExp` runs (`checks/profile.mjs:158-164`), so nothing outside the `try` can throw. The test at `checks/pushed.test.mjs:220-223` tries such a profile in both modes and expects 5 findings, which matches what the commit history holds.
3. The deferred check is now declared under `checks` (`work/2026/11/261121-1306-kit-pipeline-gaps.md:17-18`).

**Acceptance criteria**

1. Runs on every pull request and push to `main`, and the group of a push is its commit: met, `.github/workflows/verify.yml:10-23`. This diff does not touch it.
2. The three variables follow the event, and `project` runs on both: met, `.github/workflows/verify.yml:27-30` and `:82-86`. This diff does not touch it.
3. `--range` over `HONSHA_BASE..HONSHA_HEAD`, or all history on a zero base, by the patterns only. It reports places, never the text, and exits with 1 on a finding or a missing variable: met.
   - Code: `checks/pushed.mjs:102-106`, `:232-235`, `:275-281` and `:296-304`.
   - Tests: `checks/pushed.test.mjs:177-203` and `:249-268`.
4. An allowed address is no finding in a line, a message, a file's name or the identities, in both modes, and another address still is one: met, `checks/pushed.test.mjs:205-224`.
5. The new job runs once, on Linux, on both events: met, `.github/workflows/verify.yml:64-77`. This diff does not touch it.
6. Tests cover criteria 3 and 4, that the range mode skips the machine's user, and the hook's own tests: met.
   - Criteria 3 and 4: `checks/pushed.test.mjs:177-224` and `:239-269`.
   - The machine's user: `:226-237`.
   - The hook's tests: `:282-302`.
7. `services/github/README.md` and `README.md` describe the wiring: met, `services/github/README.md:178-186` and `README.md:83-89`. Neither describes how the hook treats a refused profile, so they still hold after this diff.
8. `node checks/verify.mjs` passes, and the four jobs pass on the pull request: met for `node checks/verify.mjs` on `31ca847` (Verification). The four jobs are recorded passing on `b1249ae`, run `44908291743`. The run on `31ca847` is not verifiable from here (Not verified).

- **Intent:** in order. Nothing the person said is quoted in the diff or the record.
- **Scope:** in order. The diff touches only `checks/pushed.mjs`, its test and the record. On a refused profile the hook now behaves as it did before the item, which keeps within the Boundaries.
- **Comments and documents:** in order.
- **Gates:** in order.
  - "the rules name no hosting service": no rule file is in the diff.
  - "nothing about a user, a user's project or an installation": the test samples are built at run time, at `checks/pushed.test.mjs:208` and `:211`.
  - "a script comes with its test": `checks/pushed.mjs` changes together with `checks/pushed.test.mjs`.
- **Verification evidence:** in order. All 7 `verify` commands are recorded passing on `31ca847`, including `node checks/record.mjs` and `node checks/commits.mjs`. They cover formatting (Prettier), lint (oxlint), types (`tsc`) and tests (`node --test`).
- **Record:** in order.
- **Commits:** in order.

**Findings**

none

**Not verified**

- The pull request's run on `31ca847`: it was still in progress when this check started, so criterion 8's four jobs are recorded only for `b1249ae`.
- The push path of `.github/workflows/verify.yml` (criteria 1, 2 and 5 on a push): it can only run once the item is merged into `main`. It is declared as the deferred check due 2026-11-28.

## Outcome

`.github/workflows/verify.yml` runs on every pull request to `main` and on every push to `main`, and the three variables
of section 14.2 follow the event. On a push, the record's check finds no work branch, the check of commits reads the
first-parent commits the push added, and the `project` job runs project.yml's path for a push on the kit. A third job,
`personal content`, runs `node checks/pushed.mjs --range` over the same range, by the patterns of `checks/public.mjs`
only; both that mode and the hook let through the addresses that `commits.address` allows. The name of the machine's
user stays with the local hook. The push path first runs on this item's own merge: the deferred check due 2026-11-28.
