---
id: 261119-1200
title: Say how an assessment started by add is let through before its branch is merged
project: honsha
type: change
size: full
kind: flow
state: done
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: 27
model: claude-opus-5-5
effort: high
checks: []
---

## Intent

The person asked to cover the four points listed to them in a session's chat; this item covers point 4, the kit's
item that finding 7 of the home's assessment `261118-2152` calls for, full and of kind flow. `add` commits a project's
entry as `assessing`, with the assessment's record, on a branch of the home, and the assessment runs on that branch;
`may-start`, asked before an item starts, reads the registry of the home's default branch, where the entry is not yet,
and so answers no to that assessment. Asked on 2026-11-19, in that chat, answering whether to cover the four points.

## Scope and acceptance criteria

### In scope

- The workflow's section 20: which items `may-start` is asked for, and what lets the assessment that `add` starts
  through.
- `hub/projects.mjs`, its header and `may-start`, and its tests, only as far as the chosen design needs.

### Out of scope

- The home's `CLAUDE.md`: its step for `add` already starts the assessment on `add`'s branch without asking
  `may-start`, and its dispatch step asks it for every other item.
- The other commands of `hub/projects.mjs`, and the states and their moves.

### Boundaries

- A project's state is still the one on the home's default branch: no design reads a state from an unmerged branch
  for any item other than the assessment.

### Acceptance criteria

1. Section 20 says, in one place, whether `may-start` is asked for the assessment that `add` starts, and, if not, what
   stands in its place.
2. Asked for any other item, `may-start` answers as it does now in each state, and its test still shows it.
3. No document of the kit says that every item, the assessment included, asks `may-start` first.
4. The profile's `verify` passes.

## Strategy

Three designs, as the assessment named them.

- **A. `may-start` is not asked for the assessment that `add` starts** (recommended). Running `add` is the person's
  decision that the project joins, and `add` writes the assessment's record itself, on the branch where it runs: the
  question has already been answered. Section 20's bullet on `may-start` says so.
  `may-start` keeps its answer for an assessment of a project already `assessing` on the default branch: that happens
  when `add`'s pull request, opened before the assessment runs, is merged before the assessment is done, and the
  assessment then goes on in a branch of its own.
- **B. `may-start` lets an assessment through when it is not in the registry**, from the record alone: a `report`
  whose project is the home. It would let through any record shaped that way, for a project nobody added.
- **C. `may-start` reads the registry from a branch given to it**, `add`'s, for the assessment. It adds an option and
  a second source of state to a command whose point is that the state is the merged one.

With A, the change is section 20's bullet on `may-start`; the header of `hub/projects.mjs` names `may-start` as
asked for every item but the assessment `add` starts; and the answer of `may-start` for a project not in the registry
says that an assessment started by `add` is not asked, so that a hub that asks anyway learns why it got a no. The
test checks that message; the other answers do not change. With B or C, `may-start` and its test change as the design
says.

Risks: with A, nothing in code stops a hub that skips `may-start` for an item that is not an assessment; that is the
case today, and the home's instructions ask it for every dispatched item.

## Approval

Approved by the person on 2026-11-19, in the chat of the session that wrote the strategy, in one approval for the
items `261119-1200`, `261119-1201` and `261119-1202` as their strategies are
written, each with the design its strategy recommends.

## Log

- 2026-11-19: design A, as approved. Section 20's bullet on `may-start` names the assessment that `add` starts as
  the one item it is not asked for, with the reason, and says that an assessment of a project already `assessing` on
  the default branch is asked like any item. The header of `hub/projects.mjs` gives the same reason beside the one
  for reading the default branch. `may-start`'s answer for a project not in the registry adds that the assessment
  `add` starts is not asked for; the test of `may-start` checks that answer. No other document of the kit says that
  `may-start` is asked for every item: a search outside `work/` finds it only in section 20 and the script.

## Verification

On `eb230a9`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.

### Checker report

On `eb230a9`, a full check.

**Verdict:** pass

**Acceptance criteria**

1. Section 20 says in one place whether `may-start` is asked for the assessment that `add` starts, and what stands in its place: met, `docs/01-specs/WORKFLOW.md` lines 612-615. It says `may-start` is not asked for that assessment because running `add` is the person's decision that the project joins. It also covers an assessment of a project already `assessing` on the default branch, which is asked like any item.
2. `may-start` answers other items as it does now in each state, and its test still shows it: met. In `hub/projects.mjs` lines 581-590 the logic for `active`, `assessing` and `adopting` is unchanged. For a project that is not in the registry, the exit code is still 1 (lines 573-580); only the message is longer, as the strategy planned. In `hub/projects.test.mjs` lines 352-367 the checks for every state are kept, and lines 353-355 add a check of the new message.
3. No document of the kit says that every item, the assessment included, asks `may-start` first: met. A search outside `work/` finds `may-start` only in `docs/01-specs/WORKFLOW.md` (line 612) and in `hub/projects.mjs` / `hub/projects.test.mjs`. Both now state the exception (`hub/projects.mjs` lines 17-19).
4. The profile's `verify` passes: not verifiable from the record. Its Verification section is still empty. You report that `node checks/verify.mjs` passed all 7 commands on eb230a9.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** not yet in the record; the closing commit is to add it (see Not verified); covers formatting (Prettier over `.`, `work/` ignored), lint (oxlint), types (tsc, `**/*.mjs` with `checkJs`, strict), tests (`hooks`, `checks`, `hub`, `services`).
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Criterion 4 and the Verification evidence: the record's Verification section is empty at eb230a9. The result of the 7 `verify` commands, `checks/record.mjs` and `checks/commits.mjs` included, comes only from your message. The closing commit has to write it into the record.

## Outcome

`may-start` is not asked for the assessment that `add` starts: section 20 of the workflow says so, with the reason,
and `may-start`'s answer for a project not in the registry says it too, so that a hub that asks anyway learns why it
got a no. Every other answer of `may-start` is unchanged.
