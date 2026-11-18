---
id: 261118-1708
title: Let the guard read a Git Bash path given to git -C on Windows
project: honsha
type: change
size: small
kind: fix
state: done
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-1532
pr: 17
model: claude-opus-5-5
effort: high
checks: []
---

## Intent

The person asked, through the session that ran item 261118-1532, that the guard read on Windows a directory given
to `git -C` in the Git Bash form. `hooks/guard.mjs` resolves `git -C <dir>` with `path.resolve(cwd, dir)`, and on
Windows a path in the form `/c/…` does not exist: `git rev-parse` fails, no profile is read, and the guard falls
back to `main`/`master` without `direct-commits`. A push to `main` through such a path is therefore refused although
the repository's profile declares `direct-commits: true`, while the same push with the path in the form `C:/…`
passes. The failure is toward refusal, so it is not a hole, but it blocks legitimate direct pushes. The guard is to
resolve such paths on Windows, for example by mapping `/<drive>/rest` to `<DRIVE>:/rest` when
`process.platform === "win32"` and the plain resolution does not exist, or by asking git itself; with tests in
`hooks/guard.test.mjs` that do not depend on the machine running them, and a line in the record. Given on 2026-11-18
by that session, on the person's behalf.

## Acceptance criteria

1. On Windows, the directory given to `git -C` in the Git Bash form `/<drive>/<rest>` is read as `<DRIVE>:/<rest>`
   when the plain resolution does not exist, so the guard reads that repository's profile and current branch.
2. A path whose plain resolution exists, and every path on other platforms, is resolved as before.
3. Tests in `hooks/guard.test.mjs` cover both, with the platform and the existence check given to the function, so
   they pass the same on any machine.
4. The kit's `verify` list passes.

## Strategy

A small exported function in `hooks/guard.mjs` resolves the directory of `-C`, taking the platform and an existence
check as parameters with the running ones as defaults; on `win32` it uses `path.win32`, so the tests run on any
platform. The existence check keeps a path that does exist on the current drive, which is what `git` itself receives
from PowerShell, where nothing translates `/c/...`; Git Bash translates it before `git` runs, so the guard does the
same only when the plain path is missing.

## Log

- 2026-11-18: record and branch created from `main`, in a worktree, by a session started from the one that ran item
  261118-1532. `direct-commits` (PR 16) is not on `main` yet; the resolution of `-C` is the same on both branches.
- On `main` the misread path also fails open, not only toward refusal: with the directory missing, `git symbolic-ref`
  returns nothing, so `git -C /c/<repo> push` with no destination passes while that checkout is on `main`, and a
  profile's `default-branch` other than `main` or `master` is never read. Reproduced with `judge` on a temporary
  repository on `main`: `git -C C:/<repo> push` refused, `git -C /c/<repo> push` let through.
- `gitDirectory` in `hooks/guard.mjs` resolves the directory of `-C`; `judgeGit` calls it in place of
  `path.resolve`. After the change the same reproduction refuses both forms.
- Tests: one with the platform and the existence check given, which runs the same on any machine; one end to end on
  a temporary repository named in the Git Bash form, run only on Windows, since only there does that form name a
  drive (the CI matrix has a Windows runner). The test paths avoid users' folders, which `checks/public.test.mjs`
  refuses.
- The checker failed the gate "nothing about a user, a user's project or an installation": the quoted intent named
  a folder of this installation and its home's configuration. Those parts of the quote are elided with "[…]".
- The checker's reports below are copied unchanged except where they quote the folder names the first report found:
  those words are replaced by a description, so the record does not bring them back.

## Verification

On `3e40189`, Windows 11, Node.js 26.13.0: `node checks/verify.mjs` passed all six — Prettier, oxlint, TypeScript, 68
tests, the plugin validator, and the commit check, "The 2 commits of the branch follow the rules."

### Checker report, on `9d5ab20`

**Verdict:** fail

**Findings**

1. Gate "nothing about a user, a user's project or an installation": the record
   `work/2026/11/261118-1708-git-bash-paths.md:24-25` is committed to the public kit. It quotes a `git -C` command
   with a path into a user's folder and this installation's home folder, and says what that home's profile declares.
   One-line fix: elide the installation-specific part of the quote with "[…]", as other records do.

### Checker report, on `3e40189`

**Verdict:** pass

This is a repeated check of the diff from 9d5ab20 to 3e40189. It touches only the record.

**Acceptance criteria**

1. On Windows, a Git Bash form `/<drive>/<rest>` is read as `<DRIVE>:/<rest>` when the plain path does not exist: met
   in the last check (`hooks/guard.mjs:168-174`, `:186`). Not changed by 3e40189.
2. A path that exists, and every path on other platforms, resolves as before: met in the last check
   (`hooks/guard.mjs:172`). Not changed.
3. Tests in `hooks/guard.test.mjs` pass the platform and the existence check in: met in the last check
   (`hooks/guard.test.mjs:219-232`). Not changed.
4. The kit's `verify` list passes: met according to the coordinator's report on 3e40189 (68 tests, "The 2 commits of
   the branch follow the rules."). This result is not in the record yet; it goes in with the closing commit.

- **Intent:** in order
- **Scope:** in order. The diff changes only `work/2026/11/261118-1708-git-bash-paths.md`.
- **Comments and documents:** in order
- **Gates:** in order. Finding 1 of the last report is fixed: lines 22-26 of the record now elide the user-folder
  path, the home folder's name and the home's configuration with "[…]". No tracked file of the kit now contains the
  home folder's name or a path into a user's folder. "the rules name no hosting service": in order. "a script comes
  with its test": in order, as no script changed.
- **Verification evidence:** in order, according to the coordinator's report on 3e40189; it is to be written into
  Verification in the closing commit. The list covers formatting, lint, types and tests.
- **Record:** in order. The Log records the fix at lines 63-64.
- **Commits:** in order. `3e40189` "Elide the installation's folder and home from the record's quoted intent" carries
  `Work-Item: 261118-1708` in its closing trailer block. Author and committer addresses match `commits.address`.

**Findings**

none

**Not verified**

- Whether the end-to-end test that runs only on Windows passes on the CI Windows runner
  (`.github/workflows/verify.yml:32`). It was recorded as passing only on the local Windows machine.
- Whether the quoted intent matches the hub's request (source 261118-1532), apart from the parts now elided. That
  item is not in this repository.

## Outcome

On Windows the guard reads a directory given to `git -C` in the Git Bash form `/<drive>/<rest>` as that drive when
the plain path does not exist, so it reads that repository's profile and current branch: a direct push that a profile
declares passes, and a push to the default branch through such a path, which `main` let through, is refused. Paths
that exist, and every path on other platforms, resolve as before. No deferred check.
