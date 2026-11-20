---
id: 261120-1131
title: Give the core rules in files of one topic each, each by its own hook
project: honsha
type: change
size: full
kind: upkeep
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

## Verification

## Outcome
