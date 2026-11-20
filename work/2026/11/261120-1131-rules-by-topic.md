---
id: 261120-1131
title: Give the core rules in files of one topic each, each by its own hook
project: honsha
type: change
size: full
kind: upkeep
state: done
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: null
pr: 33
model: claude-opus-5-5
effort: null
checks: []
---

## Intent

The person asked for a lasting solution to the project's most critical problem, which the work so far had not solved:
the files that will necessarily reach the limit at some point, kept under it until now by stopgaps rather than by a
solution that removes the problem for good. A solution was then proposed in the chat: the platform's limit holds for
each hook's output, so the core rules can be split into files that each reach the session by a hook of their own; the
person asked for its strategy to be written as a full item, answering whether to write it. Asked on 2026-11-20, in the
chat of a session.

## Scope and acceptance criteria

### In scope

- `rules/core.md` split into files of one topic each under `rules/`, with the rules they hold today.
- One hook script that gives one file to a session at start, or to the checker when it starts; one hook of each kind
  for each file of `rules/` and for the record template, in `hooks/hooks.json`.
- The tests of `hooks/hooks.test.mjs` on what the hooks give.
- A total budget for what a session receives at start.
- The architecture's section 3.1, the workflow's section 2 and the README, where they say how the rules reach a
  session and what a full file calls for.

### Out of scope

- Loading the lessons, which the workflow's section 8 specifies and no hook does yet: an item of its own, bound by the
  same pattern, one hook for each level of lessons, each output under the limit.
- The size of `docs/01-specs/WORKFLOW.md`, which no session loads: the upkeep review watches it (workflow, section 18).
- The budgets of the agents' files, which are system prompts with no limit of the platform.
- What any rule says.

### Boundaries

- No rule is added, removed or reworded, except the sentences that tie one part of the rules to another.
- The guard, the effort hook and the checks of `checks/` do not change.

### Acceptance criteria

1. `rules/` holds the core rules in files of one topic each, each readable on its own, whose sections together are
   today's `rules/core.md`, word for word but for the sentences that tie one part to another.
2. Each file of `rules/`, and the record template, reaches every session at start and the checker when it starts, by
   a hook of its own; `hooks/checker-rules.mjs` is gone.
3. A test runs every such hook and fails when one output reaches 9,000 characters, when the outputs at start together
   pass 20,000, when a file of `rules/` or the template lacks a hook of either kind, or when a hook names a file that
   does not exist.
4. A session started with `claude -p --plugin-dir` on this branch, in a scratch git repository, names every section
   heading of the files when asked which rules it received at start.
5. The architecture's section 3.1, the workflow's section 2 and the README say how the rules reach a session, and what
   a full file and a full total call for.
6. The profile's `verify` passes.

## Strategy

**The limit.** Claude Code caps each hook's output at 10,000 characters, string by string, even when several hooks run
for the same event, and gives Claude every one of them; an output over the cap is replaced by a file path and a
preview of 2,000 characters, with nothing that asks Claude to read the rest (hooks reference, "Hook input and output"
and "Add context for Claude"). The kit gives the core rules and the template in one output, and the test keeps it
under 9,000: it has stood at about 8,700 since 2026-11-17, so every rule since has been fitted by shortening
or moving another, while `docs/01-specs/WORKFLOW.md` grew from 17,500 to 42,100 characters. The wall is the single
output, not the platform.

**Plan.**

1. `rules/core.md` is split by its sections, which already stand as topics:
   - `rules/core.md`: the opening, Work items, Sizes, Stop conditions, Lessons, about 2,600 characters;
   - `rules/records.md`: The record, about 900;
   - `rules/git.md`: Commits and branches, Delivery, about 2,200;
   - `rules/writing.md`: Comments, Documents, about 1,200;
   - `templates/record.md` stays where the scripts read it, about 1,800.

   Hooks of one event run in parallel and the order of their outputs is not documented, so each file stands alone:
   its first line names it as part of the Honsha core rules, and no sentence points to "above", "after" or another
   file by position. The opening's "the kit directory named after them" becomes a line of the hook's own output.
2. `hooks/rules.mjs <file>` prints one file, with a first line that names the file and the kit directory, as plain
   text for a session's start, or as the JSON a SubagentStart hook needs with `--subagent`. `hooks/hooks.json` holds one
   SessionStart hook and one SubagentStart hook, matched to `honsha:checker`, for each file, in the `args` form the
   other hooks use; this also takes the start hooks off the shell. `hooks/checker-rules.mjs` is deleted.
3. `hooks/hooks.test.mjs` runs each hook as `hooks.json` writes it and measures what it prints. The limit for one
   output is 9,000, as today, so that the line the hook adds and future words keep a margin under the cap. A file
   that reaches it is split into two topics; the test names the file.
4. The total for everything a session receives at start is 20,000 characters, about 5,000 tokens, a little over twice
   today. It is a choice of what each session pays, not a limit of the platform. It is raised by a work item that says
   why, or answered by moving a rule that only some situations need into a skill, as section 2 says; never by
   shortening a rule.
5. The documents: section 3.1 of the architecture, its layout and the bullet on what every session receives; section 2
   of the workflow, on what a full file and a full total call for; the README's table and its line on the rules. A
   reference such as "core rules (Sizes)" stays valid: "the core rules" are the files of `rules/`, and each section
   keeps its heading.
6. A real session checks what the tests cannot: in a scratch git repository, `claude -p --plugin-dir` on this branch,
   asked which rules it received at start; its answer goes into the log.

**Alternatives left out.**

- Raising the one output toward 10,000 buys one more round of rules and keeps the wall.
- Giving the rules of records, commits and delivery only when they are needed, by skills or by hooks after a tool
  call: every session that changes a repository needs them in its first steps, so it would save context only in
  sessions that read, and would add a way for a rule to arrive late or not at all. Skills stay the place for the
  procedures that only some situations need, as `parallel-parts` and `branch-update` are. A PreToolUse hook's context
  would arrive "alongside the tool result", and the reference does not say that Claude sees it before the call.

**Assumptions.** The cap per output and the delivery of every output come from the hooks reference; criterion 4 tries
them on this branch.

**Risks.** Five hook processes start instead of one, in parallel. An output over the cap would leave the session with
a preview only, which is why the test runs the real hooks instead of adding file sizes. D87 allows the item: it fixes
a defect, the core rules that can no longer grow without shortening, which section 2 of the workflow forbids. The
default model is enough: the change moves text and writes one small script.

## Approval

Approved by the person on 2026-11-20, in the chat of the session that wrote the strategy.

## Log

- `may-start honsha`: yes. Branch cut from the kit's `main` at `a145155`.
- `rules/core.md` split into four parts: `core.md` (the opening, Work items, Sizes, Stop conditions, Lessons),
  `records.md`, `git.md` and `writing.md`. A script compared each section with `main`'s `rules/core.md`: the nine
  headings and their texts are the same. Only the opening changed, which now names the other parts and says that the
  line above each part names the kit directory; each other part opens with its own heading and one line pointing to
  `rules/core.md`.
- `hooks/rules.mjs` prints one file after a line that names it and the kit directory, as text or, with `--subagent`,
  as SubagentStart JSON. A file it cannot read fails the hook with a message, so the person sees that a part is
  missing. `hooks/hooks.json`: five SessionStart hooks and five SubagentStart hooks matched to the checker, in the
  `args` form; `hooks/checker-rules.mjs` deleted.
- What each hook prints, measured: `core.md` 2,930, `records.md` 1,123, `git.md` 2,449, `writing.md` 1,409, the
  template 1,860; 9,771 at a session's start, against one output of about 8,800 before. The difference is the line
  each hook adds and the longer opening.
- `hooks/hooks.test.mjs`: three tests in place of the two on the old output: one hook of each kind for each file, the
  opening naming every other part, and each hook run and measured against 9,000, with 20,000 for the start's total.
- Docs: architecture section 3.1 (layout and the bullet on what a session receives), workflow section 2, README.
- Live run, on this branch's working tree before the work's commit: in a scratch git repository,
  `claude -p --plugin-dir` on the kit's clone with `claude-opus-5-5`, asked without tools for the headings it received
  at start, listed every heading of the five files, each under its file. They came in the order `records.md`, the
  template, `git.md`, `core.md`, `writing.md`, not that of `hooks.json`, as the hooks reference leaves open.
- The kit's checker is not available in this session, which was resumed: the check ran in a general-purpose subagent
  given `agents/checker.md` as its instructions, with the parts of the core rules and the record template, and told
  to use only Read, Grep and Glob.
- Check on `e9df54a`: fail, one finding. The architecture restated what a full part calls for, with another threshold
  than the workflow's section 2; it now points there. Two points the check could not verify are closed as well: a
  test runs the hook on a part that cannot be read and finds the failure and its message, and the README's line on
  Git Bash names the hooks that still run through a shell, which the start hooks no longer do.
- Live run of the checker, after `a083f61`: in the same scratch repository, `claude -p --plugin-dir` with
  `claude-opus-5-5` and only the Agent tool allowed, told to invoke `honsha:checker` and to ask it, without tools, for
  the headings it received at start. The session's transcript holds the call to `honsha:checker`, and the subagent's
  transcript holds the outputs of the five SubagentStart hooks; its answer listed every heading of the five files,
  each under its file, and no part missing.

## Verification

On `a083f61`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.

### Earlier checker reports

On `e9df54a`, a full check.

**Verdict:** fail

**Findings**

1. The rule for a full part is stated in two places, with different thresholds.
   - `docs/01-specs/ARCHITECTURE.md:109-111` says the test keeps each output "under 9,000; a part that reaches that is
     split in two, never shortened".
   - `docs/01-specs/WORKFLOW.md:41-42` says "a part that nears that limit [10,000] is split into two topics, each with
     its hook".
   - Documents says a rule is stated in one place and other documents point there. The strategy (step 5) gives what a
     full file calls for to the workflow's section 2.
   - Fix: the architecture points to the workflow, section 2, instead of restating the rule.

### Checker report

A repeated check of the changes since `e9df54a`, on `a083f61`. The record's last log line and its Verification are
not committed yet.

**Verdict:** pass

**Acceptance criteria**

1. Core rules in files of one topic each, word for word except the ties between parts: met. See `rules/core.md:1-8`,
   plus `rules/records.md:3`, `rules/git.md:3` and `rules/writing.md:3`. None of these files changed since `e9df54a`,
   and the last check found nothing in them.
2. Each part and the template reach a session and the checker through a hook of their own, and
   `hooks/checker-rules.mjs` is gone: met. `hooks/hooks.json:4-76` has five SessionStart hooks and five SubagentStart
   hooks matched to `^honsha:checker$`. No `hooks/checker-rules.mjs` exists. The captured answer of the checker's live
   run lists every heading of the five files, each under its file.
3. A test fails on an output reaching 9,000, a start total over 20,000, a missing hook, or a hook naming a missing
   file: met. See `hooks/hooks.test.mjs:16-21`, `48-62` and `77-94` (`text.length < PART`, `total <= TOTAL`). The new
   test at `hooks/hooks.test.mjs:96-108` runs the hook on a part that cannot be read. It expects exit status 1, empty
   stdout, and the message that `hooks/rules.mjs:40` writes.
4. A live session names every section heading of the files: not verifiable. It is a live run, and the record's log
   (lines 154-157) reports its answer.
5. The architecture's section 3.1, the workflow's section 2 and the README say how the rules reach a session and what
   a full part and a full total call for: met. `docs/01-specs/ARCHITECTURE.md:106-111` now points to
   `docs/01-specs/WORKFLOW.md`, section 2, which holds this at lines 39-44. The README covers it at `README.md:13-14`
   and `README.md:18`.
6. The profile's `verify` passes: met. The record's Verification gives all 7 commands as passed on `a083f61`.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order. The last report's finding is fixed: `docs/01-specs/ARCHITECTURE.md:106-111` no
  longer states a threshold for a full part and points to the workflow, section 2. The new line at `README.md:40-41`
  is true of what the repository holds: `.githooks/pre-push` and the hook in `.claude/settings.json` are shell
  commands, and every hook in `hooks/hooks.json` uses the `args` form.
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Criterion 4. A session cannot be started from here, so only the log reports its answer. The diff since `e9df54a`
  touches none of `rules/`, `hooks/hooks.json` or `hooks/rules.mjs`.
- That the captured answer in the last log line came from `honsha:checker` through its SubagentStart hooks. Only the
  answer itself was received, and it matches the headings of the five files. The two transcripts that the log line
  names were not received.

## Outcome

The core rules reach every session and the checker in four parts of one topic each, with the record template, each
by a hook of its own, so the platform's cap holds for each part and not for all of them together. A test runs every
hook against 9,000 characters for a part and 20,000 for everything at a session's start, which is 9,771 today. A part
that nears the cap is split into two topics; the total is raised only by a work item that says why. Loading the
lessons, which no hook does yet, is the next growth of what a session receives, and its own item.
