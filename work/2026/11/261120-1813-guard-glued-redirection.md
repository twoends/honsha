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
is checked before the change and the choice for it written in the log. The item is small: the guard's reading of the
words of a line, and its tests.

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
- Check on `d2c1674`, by `honsha:checker`: fail, two findings.
  - The change also lets through lines the guard refused, while the Strategy, the log above on PowerShell and a
    comment in `simpleCommands` said it could only refuse more. A later command such as `node>log x.mjs` is now read
    as the program `node`, so a line that begins by moving to a folder is followed with it; and an unanchored merge
    pattern of a hosting service's piece no longer matches the file of a redirection, as in `echo done>…/merge`. Both
    are read as Bash reads them. The Strategy and the comment no longer say it.
  - Bash also reads an unquoted `{name}` right before a `>` or `<` as a file descriptor: it opens a new one and stores
    its number in `name`. So `git push origin {fd}>/dev/null` pushes the current branch, and the guard let it through
    from a checkout on `main`, before this item as well. Checked in Git Bash 5.2: `printf '%s|' A {fd}>/dev/null`
    prints `A|` and sets `fd`, while `"{fd}">out` and `{1x}>out` write the word to the file. `DESCRIPTOR` in
    `hooks/guard.mjs` names what stands before a `>` or `<` as part of its redirection, digits, a `{name}` or the `&`
    of `&>`, and both `simpleCommands` and `program` read it. Criterion 1 is extended (Deviations).
  - The test also covers `{name}`, a push it hid refused after the destination and before the program, and a line
    followed through `node>log`. On the guards of `d2c1674` and `88b8abb` it fails at the `{name}` assertion. Judged on
    the three guards from a checkout on `main`: both earlier ones let `git push origin {fd}>/dev/null` through, and
    this one refuses it; the line with `node>log` is refused at `88b8abb` and let through since `d2c1674`.
- Repeated check on `2ea921e`, by `honsha:checker`: fail, one finding. Bash also reads an array's element, `{a[0]}`,
  as the variable of a new descriptor, and the guard read it as a word.
  - Checked in Git Bash 5.2 with `printf '%s|' W <word>>o`: `{a[0]}`, `{a[b[0]]}`, `{a[k]}`, `{a["k"]}` and
    `{_b[1+1]}` take a descriptor, while `{a[0]x[1]}`, `{a[]}` and `{a[x]y}` are written to the file as words. What
    Bash takes depends on what the braces hold, nesting and quotes among it, and each round found more of it; so the
    guard no longer follows that rule.
  - With the option `braces`, `simpleCommands` keeps every `{…}` right before a `>` or `<` in the redirection, and
    without it as a word of its own; `program` takes a word that begins with `{…}>` as a redirection only in the
    reading with braces. `judge` judges a line both ways when the two differ, and refuses if either refuses.
    Whichever way Bash takes each `{…}`, it refuses nothing that both readings let through: a branch name that Bash
    reads as a refspec is one in the reading without `braces`, where no `{…}` is left out, and a push that Bash reads
    without a refspec has none in the reading with `braces`, where every `{…}` is.
  - Found while reviewing this change: `program` reads a word as a redirection after quotes are removed, so since
    `2ea921e` a quoted `{a}>` was dropped with the word after it, and `git push origin "{a}>" main`, which `88b8abb`
    refused, was let through. The reading without braces keeps that word, and the push is refused again.
  - The log above says the test failed on `88b8abb` at the `{name}` assertion. It fails there at its first assertion,
    since that guard keeps `main>/dev/null` whole; the pushes hidden by `{fd}` were judged on that guard apart.
  - The test now covers `{a[b[0]]}` and `{a["k"]}` in both readings, a push hidden by `{a[0]}` after the destination
    and one by `{a["k"]}` before the program, both refused, `git push {1x}>/dev/null main` refused by the reading
    without `braces`, the quoted `{a}>` refused, and `git push origin HEAD {fd}>/dev/null` let through from a work
    branch. On the guard of `2ea921e` it fails at the `{a[b[0]]}` assertion, and judged there the pushes hidden by
    `{a[0]}`, by `{a["k"]}` and by the quoted `{a}>` are let through.
- Repeated check on `e11e24b`, by `honsha:checker`: fail, one finding. The entry above says that whichever way Bash
  takes each `{…}`, it refuses nothing that both readings let through. That holds when Bash takes every `{…}` of a
  line the same way, since one of the two readings is then its own. It does not hold when Bash takes some of them each
  way and an option that takes a value stands among them: from a checkout on `main`,
  `git push origin --repo {1x}>y --repo {a}>x feature` is let through, while
  `git push origin --repo {1x} --repo feature`, the line Bash runs, is refused. The guard does not judge every mix of
  the two (Deviations).

## Deviations

- The request counts `main2>&1` among the forms that hide a push to `main`. Bash reads it as the word `main2` and the
  redirection `>&1`, as the check in Git Bash above shows, so `git push origin main2>&1` pushes `main2`. The guard
  reads it so and lets it through; a test says it.
- After the checks on `d2c1674` and `2ea921e`, criterion 1 holds for a `{…}` right before the `>` or `<` in two
  readings: in one it belongs to the redirection, as Bash takes it when it holds a variable's name or an array's
  element, in the other it is a word of its own, and a line is refused if either reading refuses. The checker found
  pushes to the default branch hidden by those forms, the defect the intent names.
- A line in which Bash takes some `{…}` before a redirection as variables of new descriptors and others as words is
  judged only in the two readings, where all of them are taken one way. Around an option that takes a value such a
  line can hide a push to the default branch, as the check on `e11e24b` found. It is not a line written by mistake, and
  the guard stops a mistake, not a command made to get past it (its opening comment).
