---
id: 261120-1219
title: In a public project, restate the request and quote nothing the person said
project: honsha
type: change
size: full
kind: rule
state: done
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: null
pr: 34
model: claude-opus-5-5
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

On `20db7ce`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.

### Earlier checker reports

On `381828e`, a full check.

**Verdict:** fail

**Findings**

1. `.prettierignore:1` gives the reason `work/` is not formatted: records' "intent is verbatim". This repository's
   profile now says `public: true` (`.hub/profile.yml:7`), so its intent is restated (`rules/records.md:7-9`), as this
   record's is. The comment no longer holds (Comments; Documents: a document says what holds now). Fix: say that the
   intent is fixed once written, without "verbatim".
2. `checks/profile.mjs:59-60`: the doc comment of `parseProfile` says it returns
   `{ defaultBranch, verify, commitsAddress, kinds }`. It also says the function throws when "one of these keys" is in
   a form it does not accept. The diff makes it also return `public` (line 67) and throw on it (line 102), so the
   comment no longer says what the function does.
3. The record's log (lines 107-110) says the approval's first commit on this branch was replaced before the first
   push, "the one point where these branches did not only grow". This breaks `rules/git.md:16`: "A work branch only
   grows … A mistake is corrected by a new commit". It also breaks WORKFLOW 13.2 (`docs/01-specs/WORKFLOW.md:424-425`),
   which says commits are never rewritten. The record reports this only in the log, with no "Deviations" section,
   unlike items `261118-1532` and `261118-1822` in the same case. Fix: declare it under "Deviations", with the reason.

### Checker report

A repeated check of the changes since `381828e`, on `20db7ce`, with the record's Verification not yet committed.

**Verdict:** pass

**Acceptance criteria**

1. A profile can say `public: true`, and the reader refuses any value other than `true` or `false`: met. See
   `checks/profile.mjs:101-104` and `checks/profile.test.mjs:45-49`. The diff only corrects the doc comment at
   `checks/profile.mjs:59`.
2. The core rules say the intent is restated, nothing is quoted, and an approval names who, when and where, and the
   template points to that rule: met. See `rules/records.md:7-10` and `templates/record.md:27`. The diff does not
   change either file.
3. `checks/record.mjs` fails a quote in a public project and still fails an unquoted intent elsewhere, with tests for
   both cases and for the profile key: met. See `checks/record.mjs:245-250`, and `checks/record.test.mjs:191-199` and
   `305-308`. The diff does not change these files.
4. The checker reports the person's quoted words as a finding, and the worker writes the intent as the core rules say:
   met. See `agents/checker.md:36-38` and `agents/worker.md:13`.
5. The workflow's sections 5 and 9, the kit's profile, and this record all follow the rule: met. See
   `docs/01-specs/WORKFLOW.md:127` and `286-288`, and `.hub/profile.yml:7`. The intent (record lines 22-26) quotes
   nothing, and the record text the diff adds quotes nothing the person said.
6. The profile's `verify` passes: met. The record's Verification gives all 7 commands as passed on `20db7ce`.

- **Intent:** in order
- **Scope:** in order. Both changes outside the record fix findings of the last report. The `.prettierignore` comment
  was one the item's rule had made untrue. The doc comment is in `checks/profile.mjs`, which is in scope.
- **Comments and documents:** in order. Finding 1 of the last report is fixed. `.prettierignore:1` now says the intent
  is "fixed once written". That holds under `rules/records.md:9-10` and `docs/01-specs/WORKFLOW.md:120`, and the
  comment still gives the reason `work/` is not formatted. Finding 2 is fixed. `checks/profile.mjs:59` now names
  `public`, which matches the returned object (line 67), the `Profile` typedef (lines 24-25) and the throw at line
  102.
- **Gates:** in order. The diff changes no rule, adds nothing about a user, a user's project or an installation, and
  adds no script. `checks/profile.mjs` keeps its test.
- **Verification evidence:** in order; covers formatting (`prettier --check`), lint (`oxlint`), types (`tsc -p .`),
  tests (`node --test`)
- **Record:** in order. Finding 3 of the last report is fixed. The replaced approval commit is declared under
  "Deviations" (record lines 164-168), with the reason. The reason holds: `checks/commits.mjs:143-144` fails every
  commit on the branch whose `Work-Item` trailer is missing or wrong, and it has no exception. The log only grows
  (lines 123-128). Verification holds the commands with their results, and the earlier report keeps only its verdict
  and findings.
- **Commits:** in order. `20db7ce` "Correct two comments the rule left untrue and declare the replaced commit, as the
  checker asked" is a commit of its own for the checker's fix. It is one imperative sentence and carries
  `Work-Item: 261120-1219`.

**Findings**

none

**Not verified**

- The deviation and the log say the replaced approval commit was never pushed. Neither the hosting service nor git's
  history of the branch can be read from here, so this stays the record's claim.

## Deviations

- The approval's commit on this branch, never pushed, was replaced by one with the right trailer, where the rules ask
  that a work branch only grows and that a mistake be corrected by a new commit. A new commit could not correct it:
  the trailer of the wrong commit would have failed the check of the branch's commits on every later run.

## Outcome

In a project whose profile says `public: true`, as the kit's now does, the intent restates the request and nothing the
person said is quoted in the repository, its commits or its pull requests; `checks/record.mjs` fails a quoted intent
there, and the checker reports quoted words. Private projects and the home keep the intent verbatim. Next: the
rewrite of the kit's history, which restates the records written before this rule, and a home item for the hub's
dispatch.
