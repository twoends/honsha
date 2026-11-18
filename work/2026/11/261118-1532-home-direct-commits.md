---
id: 261118-1532
title: Let a repository declare direct commits on its default branch
project: honsha
type: change
size: full
kind: fix
state: in-progress
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: 261118-1348
pr: null
model: null
effort: high
checks: []
---

## Intent

The person decided that the guard be fixed, not the home. On finding 5 of the assessment of Honsha (home report
`261118-1348`), the guard had refused a push to the home's `main`, while the architecture (section 3.2) says the hub
writes to the home directly, with direct commits on `main`. The person chose to keep those direct commits and to
have the guard allow them for a repository that declares it. Decided on 2026-11-18 and relayed by the session that
started this item.

## Scope and acceptance criteria

### In scope

- A profile key by which a repository declares that its default branch takes direct commits, read by
  `checks/profile.mjs`.
- The guard letting a plain push to that repository's default branch through.
- The workflow's section 9 and 14.3, and the architecture's section 3.2.
- In the home, outside this pull request: a minimal `.hub/profile.yml` with the key, committed directly on `main` and
  pushed.

### Out of scope

- The core rules. A session in the home still receives "never pushes to the default branch" with them; the home
  already departs from the core rules as a whole (no records), as the architecture states. Changing them is a choice
  for the person, not part of this item.
- The home following the workflow in any other way.

### Boundaries

- Forced pushes, pushes of every branch, deletions of the default branch and merges of pull requests stay refused in
  every repository, the declaring one included.
- A profile the reader refuses grants nothing: the guard then behaves as it does today.
- Nothing about the home or this installation in the kit beyond what the architecture already says.

### Acceptance criteria

1. `checks/profile.mjs` reads `direct-commits: true` and `false`, gives `false` when the key is absent, and refuses
   any other value; with tests.
2. In a repository whose profile sets `direct-commits: true`, the guard lets through a plain push to the default
   branch, with and without a named destination; with tests.
3. In that repository it still refuses a forced push, a push of every branch, a deletion of the default branch and a
   merge command; in a repository without the key, every current refusal holds; with tests.
4. Section 9 states the key and its one use, the home; section 14.3 points to it; architecture 3.2 says the home has
   a profile with it. Each rule in one place.
5. The kit's `verify` list passes, and the checker passes.
6. The home's profile is committed directly on `main` and pushed through the guard.

## Strategy

### Design

- Key `direct-commits`, a boolean at the top level of the profile. The reader adds `directCommits` to its result:
  `true` for `true`, `false` for `false` or when absent; any other value throws, so a typo is an error, never a
  silent pass.
- The guard reads the profile once per `git push` and takes from it the default branch and `directCommits`. When
  `directCommits` is true, a destination that is the default branch is let through, except a deletion of it: a
  refspec with an empty source (`:main`) or a push with `--delete` or `-d`, refused with a reason of its own. The
  checks that come before it are unchanged and keep their order: forced (`--force*`, `-f`, a `+` refspec) and every
  branch (`--all`, `--branches`, `--mirror`). Merge commands are judged apart from pushes and are untouched.
- The profile is the one in the working tree of the repository the push runs in (`-C` honoured), as today. The guard
  stays what 14.3 says it is: it stops a mistake, not a manipulated session, which could write the key itself; the
  documents say so where the key is stated.
- Documents: section 9 gets one bullet stating the key, what the guard then lets through and what it still refuses,
  and that the home is the one repository that sets it (architecture 3.2); the example profile stays without it,
  since a project never sets it. Section 14.3 says "a push to the default branch, unless the profile declares direct
  commits (section 9)". Architecture 3.2 adds `.hub/profile.yml` to the home's tree and says it declares direct
  commits.
- The home: `.hub/profile.yml` with `name`, `default-branch: main` and `direct-commits: true`, committed directly on
  `main` with a one-sentence message and pushed; that push, run in a session under the kit's plugin from this
  branch's files, is the live test. The home's Prettier check runs first, as it formats YAML.

### Plan

1. Reader and its tests; guard and its tests.
2. The three document changes.
3. `node checks/verify.mjs`, the checker (Opus), the pull request, the closing commit.
4. The home's profile, committed and pushed; a forced push tried in a throwaway form (`git push --force-with-lease
   --dry-run`) to show it is still refused by the guard before git runs.

### Risks

- A marketplace added from a clone of the kit runs the guard checked out there, this branch's while the item is open.
  If the session in the home runs another copy, the push waits for the merge, and the outcome says so; the guard is
  tested against the home's profile from this branch meanwhile.
- The kind's expectation: `fix` expects at most 4 existing files; this touches 6 (reader, guard, their tests, two
  documents), since a key read by two scripts is stated in the workflow and the architecture.

## Approval

Approved by the person on 2026-11-18, in the session's chat.

## Log

- 2026-11-18: record and branch created by a session that received the core rules and the template at start.
- The first commit of the record had a blank line between `Work-Item` and the next trailer, so the commit
  check found no trailer. The branch, one commit old and without a pull request, was deleted and created again with
  the commit corrected; see Deviations.
- Approved; work started. The reader gives `directCommits` and throws on any value but `true` or `false`, quoted or
  bare. The guard takes the default branch and `directCommits` from one read of the profile; with the key, a push
  to the default branch passes unless it deletes it, by `:main`, `--delete` or `-d`. The forced and every-branch
  checks come first and are unchanged. Without the key, a deletion keeps the reason about the default branch, so the
  existing tests hold as they are.
- Section 9 states the key; 14.3 points to it; architecture 3.2 lists the home's profile.
- A lesson in `LESSONS.md` about the trailer paragraph, from the mistake in the record's first commit.

## Verification

## Deviations

- The work branch was deleted and created again once, against "a work branch only grows", to correct a commit
  whose trailer the commit check could not read. It had one commit and no pull request; nobody had reviewed it.

## Outcome
