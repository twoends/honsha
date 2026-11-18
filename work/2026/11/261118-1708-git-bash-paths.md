---
id: 261118-1708
title: Let the guard read a Git Bash path given to git -C on Windows
project: honsha
type: change
size: small
kind: fix
state: in-progress
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: hub
source: 261118-1532
pr: null
model: null
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
