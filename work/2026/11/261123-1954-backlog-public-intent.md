---
id: 261123-1954
title: Let the backlog take an idea of a public project with its intent restated
project: honsha
type: change
size: small
kind: fix
state: in-progress
areas: []
created: 2026-11-23
updated: 2026-11-24
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-23 in the hub's session, to keep this defect in the home's backlog, and on
2026-11-24 to start it.

`hub/backlog.mjs add` checks a captured record with `checkRecord` and passes it no `public` (`backlogProblems`), so the
check applies the rule of a private project: the intent must quote the person, or the capture is refused with "the
intent is not quoted". An idea of a public project, whose intent the core rules ask to restate in plain words with no
quote, cannot enter the backlog unless it quotes the person, the opposite of what that project's rules ask. The home
does not hold a project's profile, which says whether the project is public, as the comment on the kinds in
`backlogProblems` already notes for the kinds. The change has the backlog accept the intent in either form and leaves
its form to the check of the record when the item starts in its project, where the profile is, as the kind already is.

## Acceptance criteria

- `hub/backlog.mjs add` captures an idea whose intent restates the request with no quote, as an idea of a public
  project has it.
- It still captures an idea whose intent quotes the person, as an idea of a private project has it.
- It still refuses a record with no intent, or with an intent that holds nothing but the template's placeholder.
- `checks/record.mjs` checks a project's own record as it does now: in a public project the intent quotes nothing, in
  a private one it quotes the person.
- `hub/backlog.test.mjs` captures an idea with a restated intent and one with a quoted intent, and refuses one with an
  empty intent.
- The kit's interface does not change.

## Strategy

`checkRecord` in `checks/record.mjs` takes `public` as true, false or null. Null stands where the project's profile is
not at hand, as in the home's backlog: the intent may then quote the person or restate the request, and only an intent
with nothing in it but blank lines, comments or the template's placeholder is refused, as "the intent is not written".
`public` keeps its default, false, and the command passes the profile's value as it does now, so a project's own record
is checked as before. A quote line that says nothing, the template's `> …` or a bare `>`, becomes one pattern that the
private rule and the new case both read. `backlogProblems` passes null, and its comment on the kinds says that the
intent's form waits for the profile too.

Four existing files: `hub/backlog.mjs`, `hub/backlog.test.mjs`, `checks/record.mjs`, `checks/record.test.mjs`, the
most a fix is expected to touch. No document states the rule the backlog applies to the intent, so no document
changes; the interface lists the commands, not the options of `checkRecord`, so it does not change.

## Log

- The item has no areas, so no area pack is loaded. No part runs in parallel: the four files are one small change,
  each a few lines.
- `git config user.email` matches the profile's `commits.address`.
- Decided against checking each intent in the form it has, as the test of the kit's merged records does: an intent
  that holds only the template's `> …` would then be refused as "not quoted", which points the author of a public
  project's idea to a quote. The backlog says instead that it does not know the form.
- `node <kit>/checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts`
  passed.
- `checks/record.mjs`: `checkRecord` reads `public: null` as a profile not at hand and then refuses only an intent that
  says nothing, with "the intent is not written"; the template's `> …` and a bare `>` are one pattern, `EMPTY_QUOTE`,
  which the private rule reads too, with the same result as its two expressions before. `public` still defaults to
  false, and `check` still passes the profile's value.
- `hub/backlog.mjs`: `backlogProblems` passes `public: null`, and the comment on the kinds now covers the intent's form.
- `checks/record.test.mjs`: a test with `public: null`, where a quoted and a restated intent pass and an empty one, the
  placeholder, a bare `>` and a comment with the placeholder are named.
- `hub/backlog.test.mjs`: `draft` takes the intent's text, or null for no section; a test captures an idea with a
  restated intent and one with a quoted intent, and the refusals add a record with no intent, one with an empty intent
  and one with the template's comment and placeholder. `node --test checks/record.test.mjs hub/backlog.test.mjs`: 28
  tests pass.
- oxlint runs on this PC and refused the new test of `checks/record.test.mjs` (`consistent-function-scoping`): its
  helper captured nothing from the test. The test now builds the quoted idea once and replaces its intent in place.
