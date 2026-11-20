---
id: 261120-1219
title: In a public project, restate the request and quote nothing the person said
project: honsha
type: change
size: full
kind: rule
state: in-progress
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked that the records and pull requests of a public repository, the kit's today, stop carrying their own
words: in such a project the intent restates the request in neutral words, and nothing the person said, answered or
approved is quoted. The reason given: the kit is public, its personal references were taken out with care, and the
person's words, which can be mistaken or loosely put, now stand in every record and pull request. Private projects and
the home keep the words verbatim. Asked on 2026-11-20, in the chat of a session on the kit.

## Scope and acceptance criteria

### In scope

- A key of the profile, `public`, that says the project's repository is public.
- The rule on the intent, in `rules/records.md`, and the template's comment on the intent.
- `checks/profile.mjs`, which reads the key, and `checks/record.mjs`, which checks the intent of a public project;
  their tests.
- The checker's step on the intent, and the worker's first step.
- The workflow: the capture step of section 5, and the profile in section 9.
- The kit's own profile, which says `public: true`.

### Out of scope

- The records already in the kit's history. The person chose to start the repository again from a history whose
  records are restated: an operation of its own after this item is merged, which the person completes on the hosting
  service.
- The home's instructions for the hub's dispatch, which write an item's intent: a home item after this one.
- Telling a paraphrase of the person's words from a restatement: no script can, and the checker reads for it.

### Boundaries

- A private project and the home keep the intent verbatim, as today.
- The guard, the hooks and the other checks do not change.

### Acceptance criteria

1. A profile can say `public: true`; the profile's reader accepts `true` and `false` and refuses any other value.
2. The core rules (The record) say that in a public project the intent restates the request in the record's language,
   that nothing the person said is quoted in the repository, its commits or its pull requests, and that an approval
   names who gave it, when and where. The template's comment on the intent points to that rule.
3. `checks/record.mjs` fails a record of a public project whose intent holds a quote, and still fails a record of any
   other project whose intent holds none; a test covers both cases and the profile's key.
4. The checker reports as a finding, in a public project, the person's words quoted in the diff or the record; the
   worker's first step writes the intent as the core rules say.
5. The workflow's sections 5 and 9 say it, the kit's profile says `public: true`, and this item's record follows the
   rule.
6. The profile's `verify` passes.

## Strategy

**Where publicness is read.** `public` is a key of the project's profile, because the scripts and the agents read the
profile and nothing else about a project; the rules name no hosting service, and a repository's visibility can change
after its records are written. A profile without the key is private.

**The rule.** The first bullet of The record becomes: "The intent is the person's words, verbatim. In a project whose
profile says `public: true`, it is instead the request restated in plain words in the record's language, and nothing
the person said is quoted anywhere in the repository, its commits or its pull requests; an approval names who gave
it, when and where. Either way, the intent is later only extended, under "Addenda"." The part grows by about 330
characters, far under its limit. The template's comment on the intent says "the person's words, as a quote, or the
request restated in a public project (core rules, The record)".

**The checks.** `readProfile` returns `public`, from `true` or `false`, and throws on another value. `checkRecord`
takes the option: in a public project a line of the intent that begins with `>` fails with "the intent quotes the
person in a public project"; elsewhere the present check stands. The checker's step 2 adds one sentence: in a public
project, words of the person quoted in the diff or in the record are a finding. The worker's step 1 writes "the
intent as the core rules say (The record)" in place of "the intent verbatim". Both agents' files stay well within
their budgets.

**What is given up.** In a public project the intent is no longer the person's exact words, so it can drift from what
was asked. The person sees the restatement when approving a full item's strategy, and in the pull request of every
item before merging it; the checker checks the result against the restatement, and only the person can say whether
the restatement is faithful.

**This record.** It follows the rule it introduces, as the person decided before it started, so its intent quotes
nothing. Until the work commit gives the kit's profile `public: true`, `checks/record.mjs` on this branch reports the
intent as not quoted; the verification runs after that commit.

**Risks.** A restatement written loosely loses what the request meant; the rule asks for plain words and the request's
whole content. D87 of the installation allows the item: it fixes a defect, a rule that put the person's words into a
public repository. The default model is enough.

## Approval

Approved by the person on 2026-11-20, in the chat of the session that wrote the strategy.

## Log

- `may-start honsha`: yes. Branch cut from the kit's `main` at `a845b46`.
- The approval's first commit, on this branch and on item `261120-1221`'s, carried a placeholder for the trailer: a
  heredoc in quotes left a variable as written, and `checks/commits.mjs` was not run after the commit, as the
  repository's lessons ask. Neither commit was pushed; each was replaced by one with the right trailer before the
  first push, the one point where these branches did not only grow.
- `checks/profile.mjs` reads `public`, `true` or `false`, and throws on any other value; a profile without it is
  private. `checks/record.mjs` takes the option: in a public project a line of the intent that begins with `>` fails;
  elsewhere the check is as before. Its runner reads the option from the profile.
- Tests: in a public project a quoted intent fails and a restated one passes; the runner reads the key from the
  profile; the profile reads the key, its default and the values it refuses. The test of the kit's merged records
  checks each in the form its intent was written in, since every record before this one quotes the person and the
  rewrite of the history restates them.
- The rule in `rules/records.md`, the template's comment, the checker's step 2, the worker's step 1, the workflow's
  sections 5 and 9, and `public: true` in the kit's profile.
- A script passed inline to `node -e` through Git Bash broke on its escapes after writing `checks/profile.mjs` and
  before `checks/record.mjs`; the rest was done with the editor. The home holds that lesson for this host and for
  Node.js, and no hook gives lessons to a session yet: item `261120-1221` does.
- The kit's checker is not available in this session, which was resumed: the check ran in a general-purpose subagent
  given `agents/checker.md` as its instructions, with the parts of the core rules and the record template, and told
  to use only Read, Grep and Glob.
- Check on `381828e`: fail, three findings. The comment of `.prettierignore` said that the intent is verbatim, and
  the doc comment of `parseProfile` did not name `public`: both corrected. The replaced commits are declared under
  Deviations.

## Verification

## Deviations

- The approval's commit on this branch, never pushed, was replaced by one with the right trailer, where the rules ask
  that a work branch only grows and that a mistake be corrected by a new commit. A new commit could not correct it:
  the trailer of the wrong commit would have failed the check of the branch's commits on every later run.

## Outcome
