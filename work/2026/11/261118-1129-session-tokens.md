---
id: 261118-1129
title: Add tokens, models and active time to the measures
project: honsha
type: change
size: full
kind: capability
state: in-progress
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked for the tokens of the sessions to come first, before the pilot's assessment. The item continues item
`261118-1103`, whose measures come from git and lack what git does not know: the tokens, the models and the active time
of the sessions that did an item. Asked on 2026-11-18, in the chat of a session on the kit.

## Scope and acceptance criteria

### In scope

- Per merged item: tokens by class (input, output, cache read, cache write), by model, and active minutes, of every
  session and subagent that worked on it.
- How a session's activity is attributed to an item.
- The same report, `node checks/measures.mjs`, printing them where the data is on the machine.

### Out of scope

- Cost in money: prices change and are not the kit's business; tokens by model are enough to compute it.
- Storing the figures anywhere: they are read when the report runs.
- A dashboard: phase 2.

### Boundaries

- Nothing from a transcript is written to a repository, and only sums are printed: no prompt, no message, no path.
- When the data is missing or its format is not recognised, the report says so and the git measures are unchanged.

### Acceptance criteria

1. `node checks/measures.mjs` prints, for each merged item, the tokens by class and by model and the active minutes
   of the sessions and subagents attributed to it, or "no session data" when there is none on the machine.
2. A session's activity is attributed to an item by the branch it was on; activity on no work branch, in the
   repository's folder, is attributed to the one item whose time window holds it, and left unattributed otherwise.
3. The workflow's section 19 says what is read, how it is attributed, and that the source is the platform's own
   session files, whose format is not documented as stable.
4. The test covers the attribution, the classes, the models, subagents, repeated lines of one response, and a line in
   an unknown format.
5. The kit's `verify` list passes; budgets hold.

## Strategy

### Facts it rests on

Checked on 2026-11-18 on this PC and in the platform's documentation:

- Claude Code keeps one JSONL file per session in `~/.claude/projects/<folder>/`, with subagents in
  `<session>/subagents/`. Each response of the model has `message.id`, `message.model`, `message.usage` with
  `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, and `timestamp`, `cwd`
  and `gitBranch`. A response appears on several lines, one per streamed part, with the same `message.id`.
- For this session, attributed by branch: item `261118-1103` took 58 responses and 55,363 output tokens on Opus.
  Most earlier lines have `gitBranch: HEAD`, because the session started in a folder that was not yet a repository.
- The format is not documented as stable: the hooks reference calls the transcript internal, written asynchronously.
- The documented alternatives: OpenTelemetry metrics `claude_code.token.usage` and `claude_code.cost.usage`, by
  `session.id`, which need a collector and give no branch; the status line's per-session totals, with no split per
  item. A `SessionEnd` hook has a 1.5-second budget, and the documentation does not say whether it runs when the
  desktop application closes a session.

### Design

- **Read, do not record.** `checks/measures.mjs` reads the session files when it runs, with no hook and nothing
  stored. It finds them under the folder `CLAUDE_CONFIG_DIR` names, or `~/.claude`, `projects/`; an option points it
  elsewhere, for the test.
- **Attribution.** A response on a branch `work/<id>-<slug>` belongs to that item, wherever its session ran. A
  response in the repository's folder on no work branch belongs to the item whose window, from creation to delivery,
  holds its time, when exactly one does. The rest is not attributed.
- **Counting.** One response counts once, by `message.id`. Tokens by class and by model. Active minutes: the distinct
  minutes in which the item had a response.
- **Unknown format.** A line that does not parse, or a response without the fields, is skipped and counted; the report
  says how many were skipped. When no session file is found, the item says "no session data".
- **Workflow 19:** the source, the attribution, the caveat that the format is the platform's and may change; the
  documented alternative, OpenTelemetry, named for an installation that wants it.

### Plan

1. Session reading and attribution in `checks/measures.mjs`, with its tests on invented session files.
2. Workflow section 19 and the README.
3. Verification, the checker, the pull request, the closing commit.

### Assumptions to confirm while building

- The fields read are present in the files of the subagents too.
- Reading every session file of the machine stays fast enough: about 50 MB today.

### Risks

- **The format changes.** The report then shows skipped lines and "no session data", and the git measures stay; the
  monthly review notices.
- **A session that worked on two items on no work branch** is split by the time windows; overlap leaves it
  unattributed rather than guessed.
- **Privacy.** Only sums leave the session files, and only to the terminal.

### Decisions for the person

1. **Read the platform's session files**, rather than set up OpenTelemetry. Recommended: it needs nothing installed,
   works on the items already done, and gives the branch; the format risk is stated and visible in the report.
2. **Attribute by branch, then by time window**, never by guess. Recommended.
3. **Tokens, not money.** Recommended.

## Approval

Approved by the person on 2026-11-18, in the chat of the session that wrote the strategy, with the three decisions as
recommended.

## Log

- 2026-11-18: session files and the documentation read; tokens of this session summed per item as a trial. The
  strategy is written and the item waits for approval.

## Verification

## Outcome
