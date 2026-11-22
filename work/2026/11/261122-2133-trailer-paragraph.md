---
id: 261122-2133
title: Say that a commit's trailers stand together in its last paragraph, and say it in the commit check's refusal
project: honsha
type: change
size: small
kind: fix
state: in-progress
areas: []
created: 2026-11-22
updated: 2026-11-22
requested-by: person
source: null
pr: null
model: null
effort: medium
checks: []
---

## Intent

The person asked the hub for a change to the kit after a friction seen in a project's work item. A commit message
whose `Work-Item` trailer stood in a paragraph of its own, before the paragraph that held `Co-Authored-By`, has no
trailer for git, which reads trailers only in a message's last paragraph. The kit's commit check then refused the
commit with "no `Work-Item` trailer", which does not say why, and the session had to find the reason itself. The
workflow puts the trailer in the message's last block, where other trailers "can share" it; the core rules, which every
session receives, say only that every commit on a work branch ends with the trailer. The change says in the core rules
that the trailer stands with the other trailers in the last paragraph, and makes the commit check's refusal say when a
`Work-Item` line is in the message but outside its last paragraph.

## Acceptance criteria

- The core rules, `rules/git.md` "Commits and branches", say that `Work-Item` stands in the message's last paragraph
  together with the other trailers, such as the co-author's.
- The workflow's "The trailer" no longer states the placement itself: it gives the reason, that git reads trailers only
  in a message's last paragraph, and points to the core rules; nothing in it says that other trailers merely "can
  share" the block.
- `node checks/commits.mjs` refuses a commit whose message has a `Work-Item:` line that git does not read as a trailer
  with a refusal that says so and why; a commit with no such line keeps the refusal "no `Work-Item` trailer", and
  every other refusal is unchanged.
- `checks/commits.test.mjs` tests the new refusal, for a `Work-Item` paragraph before the co-author's paragraph, and
  keeps the test of a commit with no trailer at all.
- `docs/01-specs/INTERFACE.md` does not change.
- The profile's `verify` passes, apart from a failure that this host's application control causes, which the pipeline
  then runs.

## Strategy

The rule goes in one place, the core rules, since every session receives them: the bullet on the trailer in
`rules/git.md` gains where it stands. The workflow's "The trailer" gives the reasons for the core rules, so its first
bullet is reworded into the reason (git reads trailers only in the last paragraph) with a pointer to the core rules,
and the "can share" wording goes. The `Backlog` trailer needs no words: only `hub/backlog.mjs` writes it, in a message
it builds itself with the trailer as the last paragraph, and no session writes one by hand.

`checks/commits.mjs` reads the raw message, `%B`, as a last field of its `git log` format. When a commit has no
`Work-Item` trailer but a line of the message starts with `Work-Item:`, the refusal says that git does not read it as a
trailer, because trailers are read only in the last paragraph, with the others and no blank line between them.
Otherwise the refusals stay as they are. The new case gets its tests in `checks/commits.test.mjs`.

Four existing files: `rules/git.md`, `docs/01-specs/WORKFLOW.md`, `checks/commits.mjs`, `checks/commits.test.mjs`,
the most a fix is expected to touch. The interface lists the trailers, not where they stand, so it does not change.
`LESSONS.md` keeps its lesson on the trailers: it is about the blank line after the subject and running the check after
each commit, which the core rules do not say.

## Log

- The item has no areas, so no area pack is loaded. No part runs in parallel: the four files are one small change,
  each a few lines.
- `node <kit>/checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts`
  passed. `git config user.email` matches the profile's `commits.address`.
- `rules/git.md`: the bullet on the trailer now says where it stands, in the last paragraph with the other trailers and
  no blank line between them.
- `docs/01-specs/WORKFLOW.md`, "The trailer": the first bullet now gives the reason, that git reads trailers only in a
  message's last paragraph, and points to the core rules; the "can share" wording is gone.
- `checks/commits.mjs` reads the raw message, `%B`, as the last field of its format. A commit with no `Work-Item`
  trailer but a line starting with `Work-Item:` (case-insensitive, as git's trailer keys are) is refused with "a
  `Work-Item` line that git does not read as a trailer", and why; this covers both a paragraph of its own before the
  co-author's and a line left in the subject's paragraph. Every other refusal is unchanged.
- `checks/commits.test.mjs`: two tests for the new refusal; the test of a commit with no trailer still expects "no
  `Work-Item` trailer". `node --test checks/commits.test.mjs`: 14 tests pass.
- The checker read 9dec6c9 and failed it on one finding: the lesson on the trailers in `LESSONS.md` still restated the
  rule now in the core rules and pointed to the workflow's "The trailer" as the text that asks for the block. The
  lesson is reduced to what the core rules do not say, the blank line after the subject and running the check, and
  points to the core rules. That is a fifth existing file: see Deviations.

## Verification

## Deviations

- The change touches five existing files, one more than the profile's `kinds` expects of a fix: `LESSONS.md` also
  changes, since its lesson on the trailers restated the rule that the core rules now hold.

## Outcome
