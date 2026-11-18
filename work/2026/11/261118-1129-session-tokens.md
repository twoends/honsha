---
id: 261118-1129
title: Add tokens, models and active time to the measures
project: honsha
type: change
size: full
kind: capability
state: done
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: null
pr: 12
model: claude-opus-5-5
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
- Approved; state set to `in-progress`.
- `checks/sessions.mjs`, new: reads the session files under `CLAUDE_CONFIG_DIR` or `~/.claude`, `projects/`, keeps
  one response per `message.id` (the last line of a streamed one), counts the lines it cannot read, attributes by
  branch, then by the one window that holds a response in the repository's folder, and sums tokens by class and by
  model and the active minutes. Its test uses invented session files: a streamed response, two models, a subagent on
  a branch in another folder, a response attributed by window, one in no window, one in another folder, two
  unreadable lines, and overlapping windows.
- `checks/measures.mjs`: each item also has its delivery time; the report adds the sessions' figures, "no session
  data", or the number of unreadable lines; `--sessions <folder>` for another folder. Workflow 19: the sessions.
  README: the checks.
- Both assumptions hold: the subagents' files have the same fields; reading every session file of this PC takes about
  9 seconds. On the kit every item since `261117-1903` gets figures; for example `261117-2114`: 201 responses,
  250,629 output tokens on Opus, 42 active minutes against 89 minutes of agent time.
- The capability is in a new file; the existing files changed are the measures script, the workflow and the README.
- Work committed in one commit.
- On the kit, `261117-1150` has no session data and `261117-1234` only 8 responses: their sessions ran in other
  folders on no work branch, which the attribution leaves out by design.
- The first check failed on four findings, fixed in a commit of their own: tokens by model held only output tokens,
  so the cost of an item on two models could not be computed; each model now has every class, and the report prints
  them per model. A response with `usage: null` would have stopped the whole report; it is now skipped and counted,
  and so is every line that does not parse, whatever it holds. `--json` reports the unreadable lines. The module's
  comment says what holds: the report prints only sums and model names. An observation that had gone under
  Verification is in this log.

## Verification

On `8cd326e` and `0cbc3bd`, Windows 11, Node.js 26.13.0, Claude Code 2.1.325: `node checks/verify.mjs` passed all
six each time — Prettier, oxlint, TypeScript, 66 tests with the sessions test, the plugin validator with its known
warning, and the commit check, last "The 4 commits of the branch follow the rules."

### First checker report: fail, read `8cd326e`

Findings: (1) tokens by model held only output tokens; (2) `usage: null` stopped the report, a line that did not
parse was counted only if it held "assistant", and `--json` did not report unreadable lines; (3) the module's comment
said only sums leave it; (4) an observation sat under Verification.

### Checker report

**Verdict:** pass

Repeated check on the diff `8cd326e...HEAD` (commit `0cbc3bd`). The four earlier findings are fixed:
1. Tokens by model held only output tokens: fixed. Each model now carries every class (`checks/sessions.mjs:21-22`, `:136-137`), the report prints them per model (`:146-160`), and the test asserts it (`checks/sessions.test.mjs:91-94`, `:100-104`).
2. `usage: null` stopped the report, and a line that did not parse was counted only if it held "assistant": fixed. A null `usage` is now skipped and counted (`checks/sessions.mjs:74-78`). Any non-empty line that does not parse is counted (`:62-70`). `--json` reports `unreadableSessionLines` (`checks/measures.mjs:171`). The test adds both cases and expects 4 skipped lines (`checks/sessions.test.mjs:49-50`, `:78`).
3. The module's comment overstated what leaves the module: fixed. It now says the report prints only sums and model names (`checks/sessions.mjs:8-10`). That matches what `describeUsage` and the `--json` output contain.
4. An observation sat under Verification: fixed. It is now in the Log (record lines 143-144). Verification holds only the commands and the earlier report's verdict and findings.

**Acceptance criteria**

1. Tokens by class and by model, active minutes, or "no session data": met, `checks/sessions.mjs:146-160`, `checks/measures.mjs:175-179`.
2. Attribution by branch, then by the one window: met, unchanged by this diff (`checks/sessions.mjs:118-144`).
3. Workflow section 19 covers the source, the attribution and the format caveat: met, unchanged by this diff. `docs/01-specs/WORKFLOW.md:547-552` is now accurate on "tokens by class and by model".
4. The test covers attribution, classes, models, subagents, repeated lines and an unknown format: met, `checks/sessions.test.mjs:36-57`, `:74-115`. The classes per model are now asserted.
5. The `verify` list passes and budgets hold: met as recorded. Verification reports all six passing on `8cd326e` and on `0cbc3bd`.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting (Prettier), lint (oxlint), types (tsc) and tests (`node --test`), plus the plugin validator and the commit check, all through `node checks/verify.mjs`.
- **Record:** in order
- **Commits:** in order. `0cbc3bd` "Count tokens by class for each model, and never stop on an unreadable line" carries `Work-Item: 261118-1129`. Its author and committer addresses match `commits.address`.

**Findings**

none

**Not verified**

- The top level of `node checks/measures.mjs --json` changed from an array to an object `{ items, unreadableSessionLines }` (`checks/measures.mjs:171`). Nothing in this repository reads it. Whether a consumer outside the repository reads it, such as the home's monthly task, cannot be seen from here.

## Outcome

Each merged item now shows, beside its git measures, the tokens by class for each model and the active minutes of
the sessions and subagents that worked on it, read from the platform's session files when the report runs and
attributed by branch, then by the one window that holds them. Nothing is stored and only sums are printed. The
format of those files is the platform's: what cannot be read is counted, and the git measures stand alone. The
monthly task reads the text output, not `--json`. No deferred check.
