---
id: 261122-1929
title: Refuse a push of the kit whose commits carry a link to a Claude session
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

The person asked the hub that the kit's check of what a push publishes also refuse links to Claude sessions. A Claude
Code session driven from the web or through Remote Control adds to each commit a trailer, `Claude-Session:`, whose
value is a link to that session on claude.ai, and adds the same link to the end of a pull request's description. The
kit's check of a push, `checks/pushed.mjs` with the patterns of `checks/public.mjs`, looks in commit messages and files
for e-mail addresses, paths into a user's folder and the machine's user name, but not for such a link. A commit of the
kit made by such a session would publish a link to a user's own session, which is content about a user that the kit
must not hold. The Claude Code setting that leaves the link out can be lost or never set, so the check is the guard.

## Acceptance criteria

1. `personal()` in `checks/public.mjs` finds a link to a Claude Code session, with or without its scheme, and reports
   its line with the kind `a link to a Claude session`, without the link; it leaves alone a placeholder such as
   `session_<id>` and other links to claude.ai; with tests.
2. `checks/pushed.mjs` refuses a push whose commit carries such a link in its message, as the trailer does, or in an
   added line, and `--range` does the same; with a test.
3. The documents that list what the check finds, the kit's README and the GitHub piece, name the link too.
4. No tracked file of the kit holds such a link, so the kit's own push and its pipeline's `--range` run pass.
5. The profile's `verify` passes.

## Strategy

Add a pattern to `checks/public.mjs` beside the address and the folder: `claude.ai/code/session_` followed by the
session's identifier, letters and digits, ignoring case. A placeholder like `session_<id>` or `session_…` has no letter
or digit after the underscore, so the pattern leaves it alone; the tests do not rely on that, they build their sample
at run time from parts, as they already do for addresses and folders, so that no tracked file holds a link the pattern
finds. `pushed.mjs` calls `personal()` on the message, the names and the added lines, so it and `--range` need no
change of their own beyond a test of a message with the trailer.

The description of a pull request is out of scope: it is not part of what a push publishes, so the pre-push hook never
sees it, and checking it would mean a new job in the kit's pipeline reading it from the hosting service, a change to
the CI configuration that is always full. The description is built from the record, which the push does check, and a
session that adds the link to it adds it after; that guard stays with the Claude Code setting. Links to other things
on claude.ai, such as artifacts, are out of scope too: the intent names sessions.

## Log

- Created the branch from `origin/main` after a fetch; `git config user.email` matches the profile's
  `commits.address`. Ran the kit's `checks/verify.mjs --setup` in the worktree: `npm ci --ignore-scripts` passed.
- The item has no areas, so no pack is loaded. One concern in three or four files: no parallel parts.
- Added the pattern `SESSION` to `checks/public.mjs`, with the kind `a link to a Claude session`, and said in its
  opening comment what it finds and where such a link comes from. `pushed.mjs` needed no change: it already passes the
  message, the names of files and the added lines through `personal()`.
- Tests: in `checks/public.test.mjs`, the link in a trailer, without the scheme and in capitals, and what is let
  through, a placeholder and other links to claude.ai; in `checks/pushed.test.mjs`, a trailer and an added line,
  refused by the hook and by `--range`. Both build the sample link from parts at run time; the existing test that no
  tracked file holds a finding now covers the link too, and passes.
- Updated the paragraph of the kit's README on the hook and the one of `services/github/README.md` on the job
  `personal content`, which list what the check finds. No specification under `docs/` lists the patterns, so none
  changes; `docs/01-specs/INTERFACE.md` is untouched.

## Verification

## Outcome
