---
id: 261121-2242
title: Read an entry of a record's deferred checks over several lines, as a formatter writes it
project: honsha
type: change
size: small
kind: fix
state: done
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: 44
model: claude-opus-5-5
effort: xhigh
checks: []
---

## Intent

The person asked for the fix of a defect found while an item of the home was closed. A project whose formatter also
formats its records, as the home's Prettier does, writes an entry of `checks` that is longer than a line over several
lines, with a comma after its last value. The kit's record check reads each entry from one line only, so it refuses
that form, and the entry had to be cut short to fit. Asked on 2026-11-21, in the chat of the kit's session that
delivered the items `261121-1920` and `261121-1922`.

## Acceptance criteria

1. `checks/record.mjs` accepts an entry of `checks` written over several lines, as Prettier writes a mapping in braces
   past its width, a comma after the last value included; it refuses such an entry, as it refuses one on one line,
   when `due` is not a date or a key is missing; with tests.
2. The check's opening comment says that an entry may take several lines.
3. The profile's `verify` passes.

## Strategy

Group the lines that follow `checks:` into entries, each starting at a line that begins with `- `, join the lines of
an entry with single spaces, and read the joined text with the pattern of one line, which then allows a comma before
the closing brace. The test holds the form that Prettier wrote in the home for such an entry. A live run formats a
record with a long entry with the kit's own Prettier and runs the check on the result.

## Log

- 2026-11-21: `entriesOf` in `checks/record.mjs` groups the lines of a list in the front matter into entries, each
  from a line that begins with `- `, and joins an entry's lines with single spaces; the pattern of an entry then allows
  a comma before the closing brace. Nothing else in the kit reads the entries of `checks`: the hub and the periodic
  review read them as text.
- 2026-11-21: live run. Prettier 3 leaves alone a file that git ignores, so a sample under an ignored folder came out
  as written; at the path of a record in the home it gave the long entry of the home's item `261121-2229` over four
  lines, with a comma after `what`. On that output the record check as merged reports that the entry is not
  `{ due: YYYY-MM-DD, what: … }`, and this branch's reports nothing about `checks`. The sample was removed from the
  home at once.
- 2026-11-21: the work's commit ran before `node checks/verify.mjs --setup`, which passed after it: the worktree lies
  in the kit's clone, whose `node_modules` above it the formatter and the git hooks found.
- 2026-11-21: the check on `9d92aef` failed with one finding: a line with no dash after a closed entry went on that
  entry and passed unseen, where the check as merged refused it. The fix starts an entry of its own after a closed
  brace, with tests for such a line with a date and without one. The home's formatted entry still passes.

## Verification

On `2badc87`, `node checks/verify.mjs`, which runs the profile's `verify`: passed.

- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 191 tests, 191
  passed.
- `claude plugin validate .`: passed, with the warning that the manifests carry no version.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: the 2 commits of the branch follow the rules.

On `9d92aef` the same commands passed, with 191 tests and 1 commit.

### Checker report, on `9d92aef`

**Verdict:** fail

**Findings**

1. A line with no dash after a complete entry of `checks` goes on that entry, and the pattern's lazy `what` takes it
   in, so a second entry's missing dash and a `due` that is no date pass unseen, which the check as merged refused.

### Checker report, repeated, on `2badc87` and the record's uncommitted Verification

**Verdict:** pass

**Acceptance criteria**

1. `checks/record.mjs` reads an entry of `checks` over several lines, comma after the last value included, and
   refuses one with a bad `due` or a missing key, with tests: met. The code is at `checks/record.mjs:78-88` and
   `:221`. The tests are at `checks/record.test.mjs:185-186` (formatted form accepted), `:188` (`due: soon` refused),
   `:189` (missing `due` refused) and `:190` (entry left open refused). The finding of the report on `9d92aef` is
   fixed. `entriesOf` now starts a new entry after one that ends in `}` (`checks/record.mjs:84`), so a line with no
   dash after a closed entry is checked as an entry of its own and fails the pattern at `:221`. Two new cases cover
   it, one with a date and one with `due: soon` (`checks/record.test.mjs:192-193`). Each gets the single problem "an
   entry of `checks` is not …". An entry that passes the pattern on its own always ends in `}`, so no such entry can
   now absorb the line after it.
2. The check's opening comment says an entry may take several lines: met, `checks/record.mjs:7-8`. The diff leaves
   this unchanged.
3. The profile's `verify` passes: met, as recorded under Verification on `2badc87`.

- **Intent:** in order. The profile has `public: true`, and the diff quotes nothing the person said.
- **Scope:** in order. The diff touches only `entriesOf` and its JSDoc, two test cases with their comment, and the
  record's log and Verification, all of which serve the fix the checker asked for.
- **Comments and documents:** in order. The JSDoc at `checks/record.mjs:73-75` and the comment at
  `checks/record.test.mjs:191` give the reason and carry no history. No document other than the record changes.
- **Gates:** in order. No hosting service in the rules: met, since no rule changes. Nothing about a user, a user's
  project or an installation: met, since the code and tests name none and the record refers to the home's entry the
  way earlier records do. A script comes with its test: met, `checks/record.test.mjs:191-193`. No decision log entry
  cited: met, since no kit document changes.
- **Verification evidence:** in order. Every `verify` command of `.hub/profile.yml` is listed with its result,
  including `node checks/record.mjs` and `node checks/commits.mjs`. "2 commits" matches the branch (`9d92aef`,
  `2badc87`). 191 tests on both commits matches a diff that adds cases to an existing test, not a new `test()`. Covers
  formatting (`prettier --check .`, which skips `work/` via `.prettierignore`), lint (`oxlint`, correctness and
  suspicious), types (`tsc -p .`, `checkJs` and `strict` over `**/*.mjs`) and tests (`node --test` over hooks, checks,
  hub, services).
- **Record:** in order. The two new log entries are appended. Verification holds only command results and the earlier
  report reduced to its verdict and findings. The item is sized small, and the diff touches no always-full case and
  no `docs/01-specs/INTERFACE.md`.
- **Commits:** in order. `2badc87` "Start an entry of its own after a closed brace, so that a line with no dash is
  still judged, as the checker asked" is one imperative sentence. It ends with `Work-Item: 261121-2242`, and both
  addresses match `commits.address`. It is the checker-requested fix, in a commit of its own.

**Findings**

none

**Not verified**

- The home is not available here, so two claims rest on the log: that the formatted entry in the test at
  `checks/record.test.mjs:185` is the form Prettier wrote in the home, and that the home's formatted entry still
  passes.

## Outcome

The record check reads an entry of `checks` over several lines, as a formatter writes one past its width, and still
judges every entry: one with no date, with a key missing, left open, or a line with no dash after a closed entry. A
project whose formatter reads its records keeps a deferred check as long as it needs.
