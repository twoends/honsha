---
id: 261121-2242
title: Read an entry of a record's deferred checks over several lines, as a formatter writes it
project: honsha
type: change
size: small
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

## Outcome
