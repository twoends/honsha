---
id: 261117-1954
title: Cite no decision log in the kit, and say what a decision is
project: honsha
type: change
size: small
state: in-progress
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person had asked whether a decision log whose numbers keep growing loses value as its entries pile up, and approved
the proposal made in answer, asking for it to be done first. The kit's part of the proposal: the kit's documents stop
citing entries of a decision log kept outside the kit, and the workflow says what is recorded as a decision and where.
The reorganisation of the log itself happens in the home, outside this pull request. Asked on 2026-11-17, in the chat of
a session on the kit.

### Addenda

2026-11-17, after the pull request was opened. The person had asked whether entries that are fully replaced should be
deleted instead of kept with a state, since they add noise when one looks for something. The answer proposed: delete
them, since git keeps the earlier wording; rewrite an entry that holds in part; never reuse an identifier; make the
change in this pull request as a fix asked by the person. The person approved it and asked for the same reasoning to be
applied to the whole project. That is read here as the rule for every document of a project, so it goes into the core
rules; the home is cleaned the same way, outside this pull request.

## Acceptance criteria

1. No document of the kit outside `work/` cites a decision of a log kept outside the kit (`D` followed by a number).
   Where a citation carried a reason, the reason is stated in words.
2. The open design points `O02`, `O06`, `O07` and `O10`, which the architecture lists in its own section 9, stay; the
   status lines say they are listed there instead of pointing to an outside log.
3. The workflow says what a decision is, where it is recorded (the record of the work item that takes it; otherwise
   the home's decision log, with a state), that entries are replaced and not rewritten, and that current rules are
   read from the specifications, not from a log.
4. The architecture lists the decision log among the home's files.
5. The kit's `verify` list passes.

## Strategy

- **Size: small.** Wording in four documents and one new section of the workflow. No rule a session follows while
  working changes, apart from where a decision is written; no script, no configuration.
- **Citations:** most are tags after a sentence that already states the rule; they are removed. None changes a
  meaning.
- **Records** under `work/` keep their citations: they are history.

## Log

- 2026-11-17: 30 citations of `D` numbers in `README.md`, `VISION.md`, `ARCHITECTURE.md` and `WORKFLOW.md`; the
  three status lines and the README say they point to a log kept outside the repository.
- Every citation was a tag after a sentence that already stated the rule; all removed, none rewritten. The status
  lines of the vision and the workflow drop the note; the architecture's now says that `O` identifiers are its own
  section 9 and `A` identifiers its section 8; the README says where the reasons are: the records of the changes.
- Workflow, new section 16, "Decisions". Architecture, section 3.2: `decisions.md` in the home's layout. README: the
  workflow's topics include decisions.
- Work committed in one commit.

## Verification

## Outcome
