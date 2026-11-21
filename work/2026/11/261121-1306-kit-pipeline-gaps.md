---
id: 261121-1306
title: Run the kit's pipeline on each push to main, and check there the patterns of personal content
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
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

## Verification

## Outcome
