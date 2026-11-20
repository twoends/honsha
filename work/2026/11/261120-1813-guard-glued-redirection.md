---
id: 261120-1813
title: Let the guard read a redirection glued to the word before it as Bash does
project: honsha
type: change
size: small
kind: fix
state: in-progress
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: 261120-1617
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked, through the session that ran item 261120-1617, to fix a defect of the guard that the checker of that
item noted outside its scope, and that was there before it. `simpleCommands` in `hooks/guard.mjs` keeps an unquoted
`>` or `<` in the word it follows, so in `git push origin main>/dev/null` the destination is read as `main>/dev/null`
and a push to the default branch gets through; the request names `main<x`, `main>>log` and `main2>&1` as other such
forms. Bash reads `main>/dev/null` as the word `main` followed by the redirection `>/dev/null`: a run of digits right
before the `>` or `<` is a file descriptor and belongs to the redirection, as in `2>&1`, and any other text before it
is a word of its own. The work starts once pull request 36, which rewrites the same function, is merged, from the
`main` that holds it. Asked on 2026-11-20 by that session, on the person's behalf.

## Acceptance criteria

1. In `simpleCommands`, an unquoted `>` or `<` that follows other text of a word begins a word of its own, unless that
   text is a file descriptor as Bash reads one, a word made only of unquoted digits, or is the `&` that begins `&>`, or
   the character before is itself a `>` or `<`, as in `>>`.
2. Tests in `hooks/guard.test.mjs` show that `git push origin main>/dev/null` and `git push origin main 2>/dev/null`
   are refused from a checkout on a work branch, and that `git push origin HEAD>/dev/null` from a work branch is let
   through. The new tests fail on the guard before the fix.
3. `node checks/verify.mjs` passes.

## Strategy

`simpleCommands` ends the word before such a `>` or `<` and starts the redirection as a word of its own; a flag says
whether the word so far holds a quoted or escaped character, since Bash reads `"2">x` and `\2>x` as the word `2`
followed by a redirection. `program` already leaves a word that begins a redirection out of the arguments, so the
destination of the push is the word before it. `simpleCommands` reads the lines of both tools; PowerShell's own reading
is checked before the change and the choice for it written in the log. The item is small: one function and its
tests, and the guard can only refuse more than before.

## Log

- `may-start honsha`: yes. Branch cut from `main` at `88b8abb`, after pull request 36 was merged.
- Checked in Git Bash before the change: `printf '%s|' A main>/dev/null` prints nothing, `main>>log` appends `main`
  to the file, `main2>&1` prints `main2`, and `"2">out` and `\2>out` write `2` to the file. A file descriptor is a word
  made only of unquoted digits.
- Checked in Windows PowerShell 5.1, the PowerShell tool's shell on this host, where PowerShell 7 is not installed:
  `Write-Output main>x` prints the one argument `main>x` and creates no file, while `Write-Output "main">x` writes
  `main` to the file. So `git push origin "main">$null` pushes to `main` too. `simpleCommands` reads the lines of
  both tools the Bash way: that closes the quoted form in PowerShell, and refuses there `main>x` without quotes, which
  PowerShell gives to git as a branch named `main>x`. The guard can only refuse more by it.
- Judged before the change from this checkout, on its work branch: in Bash `main>/dev/null`, `main<x`, `main>>log`,
  `HEAD:main>/dev/null` and `"main">/dev/null`, and in PowerShell `"main">$null`, were let through as destinations of
  `git push origin`; `main 2>/dev/null` was refused.
- `hooks/guard.mjs`: `simpleCommands` ends the word before an unquoted `>` or `<` and starts the redirection as a word
  of its own, unless the word so far is unquoted digits or the `&` of `&>`, or the character before was a `>` or `<`.
  Its description says so.
- `hooks/guard.test.mjs`: one test, for the words `simpleCommands` gives, the six pushes above refused in Bash and the
  one in PowerShell, and `HEAD>/dev/null`, a work branch's name with `>/dev/null` and `main2>&1` let through. On the
  guard of `88b8abb` it fails at its first assertion, and each of its refusals but `main 2>/dev/null` fails there
  too; the guard's other 21 tests pass on both.

## Deviations

- The request counts `main2>&1` among the forms that hide a push to `main`. Bash reads it as the word `main2` and the
  redirection `>&1`, as the check in Git Bash above shows, so `git push origin main2>&1` pushes `main2`. The guard
  reads it so and lets it through; a test says it.
