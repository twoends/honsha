---
id: 261120-1813
title: Let the guard read a redirection glued to the word before it as Bash does
project: honsha
type: change
size: small
kind: fix
state: done
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: 261120-1617
pr: 37
model: claude-opus-5-5
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

## Verification

On `2bda08d`, Windows 11, Node.js 26.13.0: `node checks/verify.mjs` passed all seven commands — Prettier, oxlint,
TypeScript, 147 tests, the plugin validator, `node checks/record.mjs` ("The record
work/2026/11/261120-1813-guard-glued-redirection.md has the shape the rules ask for.") and `node checks/commits.mjs`
("The 4 commits of the branch follow the rules.").

### Checker report, on `d2c1674`

**Verdict:** fail

**Findings**

1. **Record and comments: the change also lets through lines the guard refused, while the record and a comment say it cannot.**
   - What they say:
     - The Strategy says "the guard can only refuse more than before".
     - The log says of the PowerShell reading "The guard can only refuse more by it".
     - `hooks/guard.mjs:155-156` says such a word "can only make the guard refuse a push of a branch whose name holds a `>`".
   - Why it is untrue:
     - `lead` checks the first raw word of each later command against `STILL` (`hooks/guard.mjs:410-412`). That word is now `node` in `node>log`, where it was `node>log`.
     - So `cd <work checkout> && git push origin HEAD && node>log x.mjs`, run from a checkout on `main`, was refused at `88b8abb`. The line was not followed, and `HEAD` was read in the session's checkout.
     - It is now followed and let through. The same holds in PowerShell with `;`.
     - The unanchored merge pattern in `services/github/merge-commands.json:6` also matched text after a `>`. So `echo done>api.github.com/repos/o/r/pulls/1/merge` was refused and is now let through.
   - The guard is right in both cases: `node` cannot move the shell, and the second line only writes a file.
   - The record says the opposite of what the code does, Deviations do not name it, and no test covers it.
   - Fix in one line: say that a later `STILL` command with a glued redirection is now followed, and drop "only".
2. **Intent: the guard does not read Bash's `{name}` form of a file descriptor.**
   - Bash 4.1 and later, which is what Git Bash runs, also reads a word `{name}` right before `>` or `<` as a file descriptor. For example, `{fd}>/dev/null` opens a descriptor and stores it in `fd`.
   - The guard splits `{fd}` off as a word of its own, and `program`'s pattern (`hooks/guard.mjs:178`) would not take it as a redirection either.
   - So `git push origin {fd}>/dev/null`, run from a checkout on `main`, is judged as a push of the refspec `{fd}` and let through. Bash runs `git push origin`, a push of the current branch, which the guard itself treats as `HEAD` (`hooks/guard.mjs:290`).
   - `88b8abb` let it through as well, so this is not a regression. But it is the item's own class of defect: a glued redirection hiding a push to the default branch.
   - The log's "A file descriptor is a word made only of unquoted digits", `hooks/guard.mjs:153-154` and the docstring's "as Bash reads it" (`hooks/guard.mjs:89`) state a narrower rule as Bash's. No test covers it.
   - Fix in one line: read `{name}` right before `>` or `<` as part of the redirection, or declare the gap under Deviations.

### Checker report, on `2ea921e`

**Verdict:** fail

**Findings**

1. **Intent and comments: Bash's `{varname}` form also accepts an array element, and the guard does not read it.**
   - **What Bash does.** In Bash's parser (`read_token_word` in `parse.y`, built with array variables as Git Bash is), a word `{…}` right before `<` or `>` is a redirection word when its inside is a legal identifier or a valid array reference. `redir.c` then assigns the new descriptor through the array code. So `{a[0]}>/dev/null` opens a descriptor and stores its number in `a[0]`.
   - **What the guard does.** `DESCRIPTOR` (`hooks/guard.mjs:48`) accepts only `\{[A-Za-z_][A-Za-z0-9_]*\}`, so `simpleCommands` splits `{a[0]}` off as a word of its own (`hooks/guard.mjs:156`).
   - **What gets through:**
     - `git push origin {a[0]}>/dev/null`, run from a checkout on `main`, is judged as a push of the refspec `{a[0]}` and let through. Bash runs `git push origin`, which the guard itself treats as `HEAD` (`hooks/guard.mjs:293`).
     - `{a[0]}>/dev/null git push origin main` takes `{a[0]}` as the program and is let through from any checkout.
   - **What the code says.** The comment on `DESCRIPTOR` (`hooks/guard.mjs:46-47`) calls its rule what Bash reads, and the docstring says "as Bash reads it" (`hooks/guard.mjs:92`). No test covers the array-element form.
   - **How sure this is.** This comes from Bash's source; it was not run here. In Git Bash, `printf '%s|' A {a[0]}>/dev/null; echo "${a[0]}"` would show it.
   - **Fix in one line:** once Git Bash confirms it, also read `{name[subscript]}` as a descriptor; otherwise declare the gap under Deviations and narrow the two comments.

### Checker report, on `e11e24b`

**Verdict:** fail

**Findings**

1. **Intent and record: a line that mixes both forms of `{…}` around an option that takes a value still hides a push to the default branch, while the log says the two readings leave nothing out.**
   - **What the record says.** The log entry for the check on `2ea921e` says: "Whichever way Bash takes each `{…}`, it refuses nothing that both readings let through". Its two reasons are:
     - every refspec Bash reads is also a refspec in the reading without braces;
     - a push Bash reads without a refspec has none in the reading with braces.
   - **Why it does not hold.** Both reasons assume that keeping or dropping a `{…}` does not change which word an option takes as its value. But `judgeGit` skips the word after `--repo`, `-o` and the other `PUSH_OPTIONS_WITH_VALUE` (`hooks/guard.mjs:284`).
   - **Example**, run from a checkout on `main`: `git push origin --repo {1x}>y --repo {a}>x feature`.
     - **What Bash runs.** The record's own Git Bash checks show that Bash takes `{1x}` as a word and `{a}` as the variable of a new descriptor. So Bash runs `git push origin --repo {1x} --repo feature`.
     - **What that pushes.** git lets the positional `origin` take precedence over `--repo`, so there is no refspec and the current branch is pushed. The guard itself treats that as `HEAD` (`hooks/guard.mjs:299-301`), which here is `main`.
     - **Reading without braces:** `--repo` takes `{1x}`, the second `--repo` takes `{a}`, and the only refspec is `feature`. Let through.
     - **Reading with braces:** the first `--repo` takes the second `--repo` as its value, and the only refspec is `feature`. Let through.
   - **How sure this is.** I traced this through the code; it was not run here. It needs both forms in one line: when Bash takes every `{…}` the same way, one of the two readings matches Bash's exactly. The code comment at `hooks/guard.mjs:436-437` claims no more than "judged both ways", so it is accurate.
   - **Fix in one line:** add a log entry that narrows the claim, and declare the mixed case under Deviations.

### Checker report, on `2bda08d`

**Verdict:** pass

The finding of the last report, on `e11e24b`, is fixed.

- **Narrowed claim.** A new log entry (`work/2026/11/261120-1813-guard-glued-redirection.md:109-115`) narrows the claim that the two readings leave nothing out. It now says the claim holds only when Bash takes every `{…}` of a line the same way.
- **Declared gap.** A new entry under Deviations (`:195-198`) declares the mixed case. It gives the reason by pointing to the guard's opening comment (`hooks/guard.mjs:23-25`) and does not copy it.
- **The example in the log is correct**, traced through the code:
  - `git push origin --repo {1x}>y --repo {a}>x feature` keeps `feature` as its only refspec in both readings, so it is let through. In the reading without braces, `--repo` takes `{1x}` and `{a}`. In the reading with braces, `program` drops both `{…}>` words (`hooks/guard.mjs:187-204`), so the first `--repo` takes the second (`hooks/guard.mjs:284`).
  - `git push origin --repo {1x} --repo feature` has no refspec, so it is judged as `HEAD` and refused from a checkout on `main` (`hooks/guard.mjs:293-304`).

**Acceptance criteria**

1. Unquoted `>` or `<` after other text begins a word of its own, except after a file descriptor, the `&` of `&>`, or a `>`/`<`: met, `hooks/guard.mjs:116` and `hooks/guard.mjs:161-167`, with `DESCRIPTOR` and `BRACED` at `hooks/guard.mjs:48-49`. The `{…}` form and its mixed case are declared under Deviations. The diff changes no code.
2. Tests show `main>/dev/null` and `main 2>/dev/null` refused, and `HEAD>/dev/null` let through, from a work branch: met, `hooks/guard.test.mjs:319`, `:322` and `:328`. That they fail on the guard before the fix is recorded in the log.
3. `node checks/verify.mjs` passes: met, according to Verification, on `2bda08d`.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

none

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

## Outcome

The guard reads a redirection glued to the word before it as a word of its own, as Bash does: a push hidden by one,
such as `git push origin main>/dev/null`, is refused, and `git push origin HEAD>/dev/null` from a work branch is let
through. Unquoted digits and the `&` of `&>` stay in the redirection. A `{…}` right before one is read both as the
variable of a new descriptor and as a word, and a line is refused if either reading refuses; a line that mixes the two
around an option that takes a value is left out (Deviations). No deferred check.
