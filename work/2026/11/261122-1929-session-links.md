---
id: 261122-1929
title: Refuse a push of the kit whose commits carry a link to a Claude session
project: honsha
type: change
size: small
kind: fix
state: done
areas: []
created: 2026-11-22
updated: 2026-11-22
requested-by: person
source: null
pr: 45
model: claude-opus-5-5
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
- The checker's first check, on `7b957bd`, failed on one finding: a line of `services/github/README.md` past the 120
  columns, left when its paragraph was rewrapped. Rewrapped it. It also noted five existing files changed, one more
  than the profile's `kinds` gives a fix: written under "Deviations".

## Verification

On `8c84c81`, from the project's root:

- `node checks/record.mjs`: pass, the record has the shape the rules ask for.
- `node checks/commits.mjs`: pass, the 2 commits of the branch follow the rules.
- `node hub/projects.mjs check`: not run, the root holds no `registry.yml`.
- `npx --no-install prettier --check .`: pass.
- `npx --no-install oxlint`: pass.
- `npx --no-install tsc -p .`: pass.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: pass, 194 of 194.
- `claude plugin validate .`: pass, with one warning that the README has no line installing the plugin from a
  marketplace, which the change does not touch.
- The kit's pipeline on pull request #45, at `8c84c81`: pass, `verify` on Ubuntu and on Windows, `project / checks`
  and `personal content`.

The first check, on `7b957bd`: verdict `fail`. Finding: `services/github/README.md:179` ran past the 120 columns of
the document, left unwrapped when its paragraph was rewrapped.

The repeated check, on `8c84c81` (7b957bd...8c84c81):

### Checker report

**Verdict:** pass

The last report's only finding is fixed. After the rewrap, `services/github/README.md` lines 179–181 are about 115,
116 and under 120 columns. The word "public" cannot move up to line 180, because that would make it 123 columns. The
note about five existing files against the `fix: 4` of `kinds` is now declared under "Deviations".

**Acceptance criteria**

This repeated check covers only the diff 7b957bd...8c84c81. It changes no code, test or listing document, so criteria
1–4 stand as the last check found them.

1. `personal()` finds a session link, with tests: not touched by this diff.
2. `checks/pushed.mjs` and `--range` refuse such a link, with a test: not touched by this diff.
3. The kit's README and the GitHub piece name the link: met. `services/github/README.md` lines 176–181 still name "the
   links to a Claude Code session" after the rewrap.
4. No tracked file holds such a link: met for this diff. Neither changed file adds a session link.
5. The profile's `verify` passes: met, from the results given for 8c84c81. They go into the closing commit.

- **Intent:** in order
- **Scope:** in order. The rewrap only reflows the text, with no change of words. The record adds a log entry and a
  "Deviations" section.
- **Comments and documents:** in order
- **Gates:** in order. No rule names a hosting service, nothing is about a user, and the diff adds no script.
- **Verification evidence:** in order, from the results given for 8c84c81: all three `verify` commands,
  `checks/record.mjs` and `checks/commits.mjs` pass. They go into the record's Verification in the closing commit.
  `verify` covers formatting (prettier), lint (oxlint), types (tsc) and tests (node --test of the four globs). Of
  these, `.hub/profile.yml` lines 8–11 show only the first three, and I did not read the test command.
- **Record:** in order. "Deviations" sits between Verification and Outcome, as in the template. The new log entry and
  the deviation copy nothing from another document and quote nothing the person said.
- **Commits:** in order. 8c84c81 "Rewrap the paragraph of the GitHub piece at 120 columns, as the checker asked" is
  one imperative sentence with the trailer `Work-Item: 261122-1929`. It is a commit of its own for a fix the checker
  asked for.

**Findings**

none

**Not verified**

- The column widths of `services/github/README.md` lines 179–181 were counted by hand from the diff. No tool measured
  them.
- The results of `verify`, `checks/record.mjs` and `checks/commits.mjs` on 8c84c81 come from your message, not from
  the record, because Verification is still empty until the closing commit.

## Deviations

- The change touches five existing files, one more than the four that the profile's `kinds` expects of a `fix`. The
  fifth is a document: the kit's README and the GitHub piece both list what the check finds, and a rule is updated in
  every document that states it. The concern and the size stay those of a small fix.
- The repeated check's report is copied without the list of the files it read that followed it, which named them by
  absolute paths into the user's folder: the kit's push check refuses such a path, and the files are those named in
  the report itself.

## Outcome

A push of the kit, through its pre-push hook, and every commit its pipeline reads with `--range`, are now refused when
a commit carries a link to a Claude Code session, in its message, as the `Claude-Session:` trailer puts it, in a line it
adds or in a file's name. The report names the commit and where, never the link. The description of a pull request is
not checked. Pull request: #45.
