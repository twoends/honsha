---
id: 261116-1856
title: First version of the kit as a Claude Code plugin
project: honsha
type: change
size: full
state: in-progress
areas: []
created: 2026-11-16
updated: 2026-11-16
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked for the first version of the Honsha kit to be prepared in this repository and, once approved, built:

1. A Claude Code plugin holding the kit: the few core rules always loaded, the work-item record template that
   `WORKFLOW.md` section 4 describes, the definitions of the worker and checker agents, and the hook that writes model
   and effort into a record.
2. Small tests, with their results recorded here, of the three assumptions of the architecture that concern the kit: A4,
   that the plugin can deliver the core rules; A6, that an area pack named in a record is loaded; A7, that a hook can
   write model and effort into the record. If one turns out false, the fallback written next to it in the architecture
   applies, and the record says so.

The passages of the request left out here concern one installation only and add no requirement. Asked on 2026-11-16,
through a dispatching session.

### Addenda

2026-11-16. The person answered the five decisions of the strategy. Decisions 1 and 3 were accepted as proposed, and so
was decision 4, the marketplace owner written as Honsha. On decision 2 the person found Fable too much as the default
model: the default is to be Opus, with Fable called on when the tasks are too complex for it. Answered in the
conversation with the session working on this item.

## Scope and acceptance criteria

### In scope

1. The manifests that make this repository a plugin and its own marketplace.
2. The core rules and the session-start hook that delivers them.
3. The record template.
4. The worker and checker agent definitions.
5. The hook that writes model and effort into a record, with an automated test of its script.
6. Tests of A4, A6 and A7, recorded here. A false assumption gets the fallback of
   [ARCHITECTURE.md](../../../docs/01-specs/ARCHITECTURE.md), section 8.
7. The documents this change affects: the README, the architecture (sections 3.1, 7 and 8), the vision's principle
   on models, and the workflow where what is built differs from what is written.

### Out of scope

- Any other repository, including the pilot project.
- The hub session, messaging, the board, the index, triage, the radar, the reader agent, the scheduler.
- Area packs. The A6 test uses a throwaway pack that never enters this repository (D52).
- Skills, the profile template and a profile for the kit itself: nothing in this item needs them.
- Installing the plugin into any Claude Code configuration. Tests load it for one session only. Installing from the
  marketplace belongs to the step that adopts the kit in a project.
- Anything that needs a server.

### Boundaries

- Nothing about a user, a user's project, a provider, a server or an earlier workflow; examples are invented; the
  workflow carries no version number (D57, D59).
- Nothing from third parties is installed. The only runtime the kit asks for, besides git and Claude Code, is Node.js
  for one hook script, and only if the person approves it (decision 1 below).
- `main` changes only through the pull request of this item. No merge, no force-push.

### Acceptance criteria

1. **Manifests.** `claude plugin validate --strict .` passes for the plugin and the marketplace manifest. The Claude
   Code version used is recorded.
2. **Core rules.** `rules/core.md` covers: where a record lives and how its branch is named; the three sizes and the
   approval gate; pull requests only, the person merges; what may not be rewritten in a record; the stop conditions;
   area packs; the profile and the language rule; lessons. It is under 6,000 characters and names no project.
3. **A4.** In a session started in a repository that has no `CLAUDE.md`, with the plugin loaded: (a) the hook's output
   is in the session's context, shown by the hook event in the session stream and by a correct answer to a question
   only the core rules answer; (b) asked for a full-size change, the session writes the record on a `work/…` branch,
   sets it to `awaiting-approval` and changes nothing else.
4. **Record template.** `templates/record.md` has the front matter of [WORKFLOW.md](../../../docs/01-specs/WORKFLOW.md)
   section 4.1, same keys in the same order, and the sections of section 4.2 with what each size keeps.
5. **Agents.** The definitions load as `honsha:worker` and `honsha:checker`. The checker's tools in a real run are
   `Read`, `Grep` and `Glob` and nothing else. The worker names Opus as its default model, and a worker started on
   another model runs on that one. The checker runs on the model of the session that calls it.
6. **A6.** With a throwaway pack in a scratch copy of the kit and a record that names its area, the worker loads the
   pack: the session stream shows the skill being invoked and the result follows a rule only the pack states. Three
   runs out of three, or the assumption is recorded as false and the fallback is applied.
7. **A7.** After a session edits a record, the record's front matter holds that session's model identifier and effort
   level, written by the hook and not by the model. Shown for two different combinations of model and effort and for
   a record created during the session. The script's automated test passes.
8. **Checker.** The checker built here verifies this item against this record. Its report is in this record and in the
   pull request.
9. **Public from the first commit.** No commit of this item contains anything listed under the first boundary, and
   every commit is authored with a GitHub noreply address (D58).
10. **Delivery.** A pull request from `work/261116-1856-kit-first-version` to `main` holds the plugin files and this
    record with its log, verification and outcome. It is not merged by the worker.
11. **Documents.** The README says what exists and how to load it. The architecture's sections 3.1 and 8 match what
    was built and what the tests showed, including anything that could not be verified. Its section 7 and the
    vision's principle on models state the model policy of the addendum.

## Strategy

### Facts it rests on

Claude Code documentation read on 2026-11-16. The hooks reference was read directly. The plugin, marketplace, agent
and skill pages were read through a summarising tool, so those facts are confirmed by the validator and the tests
before anything depends on them.

- A plugin is a directory with `.claude-plugin/plugin.json` (only `name` is required) and components in default
  folders at its root: `skills/`, `agents/`, `hooks/hooks.json`. A repository can be a marketplace
  (`.claude-plugin/marketplace.json`) whose plugin is the repository root.
- A plugin cannot ship always-on instructions as a file: a `CLAUDE.md` at the plugin root is not loaded, and there is
  no rules component. The documented routes are a skill, or a hook when a rule must hold every time.
- A `SessionStart` hook's plain output is added to the session's context as a system reminder, on startup, resume,
  clear, compaction and fork. Output over 10,000 characters is replaced by a file path and a 2,000-character preview.
  The documentation advises writing such text as statements of fact: text framed as commands can be treated as an
  injection attempt. It also says that static instructions belong in `CLAUDE.md`, which is A4's fallback.
- The model reaches a hook only in `SessionStart` (the field can be missing, for example after `/clear`) and in
  `PostModelSwitch`. The effort level reaches a hook in events with a tool-use context (`PreToolUse`, `PostToolUse`,
  `Stop`, `SubagentStop`) as `effort.level`, and in `$CLAUDE_EFFORT`. No single event carries both, and a subagent's
  model is not visible to any hook.
- Agent definitions shipped by a plugin ignore `permissionMode`, `hooks` and `mcpServers`. Their `tools` list is
  honoured, but a tool is granted whole: Bash cannot be limited to read-only commands there.
- A hook command runs through `sh` on Linux and macOS and through Git Bash on Windows. With `args` it is spawned
  directly, with no shell, which the documentation recommends for scripts referenced by a plugin path.
- The documentation describes versions up to 2.1.319. The two Claude Code builds on the test machine are 2.1.195 and
  2.1.325; `PostModelSwitch` needs 2.1.251 or later.

### Design

1. **Layout.** The repository root is the plugin root and the marketplace root, as in the architecture's section 3.1.
   An installed copy therefore includes `docs/` and `work/`. Plugin and marketplace are both named `honsha`. The
   manifest carries no `version`, so an installation follows commits.
2. **Core rules (A4).** `rules/core.md`, printed by a `SessionStart` hook with no matcher. The command is a plain
   `cat`, so delivery depends on a shell and on nothing else. The hook also prints the path of the installed kit, so
   a session can open the record template and the workflow document. The rules are written as statements about how
   the project works.
3. **No skills yet.** The procedure stays in `docs/01-specs/WORKFLOW.md`; the core rules point to it. `skills/` appears
   with the first area pack.
4. **Record template.** `templates/record.md`: the full-size shape, with a comment on each section saying which sizes
   keep it.
5. **Model and effort (A7).** One Node.js script, three hook entries. `SessionStart` and `PostModelSwitch` store the
   session's model in the plugin's data directory, keyed by session. `PostToolUse` on `Write` and `Edit`, when the
   file is a record (`work/<yyyy>/<mm>/<id>-<slug>.md` with the two keys in its front matter), writes `model` and
   `effort` into it. The values are those of the last main session that edited the record. An edit made inside a
   subagent is skipped, because the subagent's model is unknown to the hook. When the model is unknown the key is
   left as it is. `model` holds the identifier the platform reports, not an alias.
6. **Worker.** `agents/worker.md`, meant to run as the main session of a work item (`claude --agent honsha:worker`, or
   the session a person opens in the project), not as a subagent: only a main session's model reaches the hook. It
   reads the record first, refuses a full item that has no approval, loads the packs of the record's areas, appends
   to the log, stops on the workflow's stop conditions, runs the profile's verification commands, calls the checker,
   writes the outcome and opens the pull request.
7. **Checker.** `agents/checker.md`, a subagent with `tools: Read, Grep, Glob`. Without Bash it cannot read a diff by
   itself, so the worker writes the diff to a file outside the repository and passes the path. The checker compares
   the record, the diff and the files, and returns a report the worker copies into the record unchanged. It does not
   re-run commands: it checks the output the worker recorded.
8. **Models.** `model: opus` in the worker: Opus is the default. The strongest model is for work too complex for the
   default. For a full item the strategy says so and is approved with that choice; whoever starts the worker then
   starts it on that model, which overrides the definition. The checker has `model: inherit`: it runs on the model
   of the session that calls it, so it is never weaker than the work it checks. Effort is not fixed in the
   definitions: the level of the session applies and the hook records it.
9. **Area packs (A6).** A pack is a skill of the kit in `skills/area-<name>/`, invoked as `honsha:area-<name>`. The
   core rules and the worker definition say to load the pack of each area in the record. None is written now.
10. **Tests.** Live tests run Claude Code without a terminal interface (`claude -p`) in a disposable repository
    outside this one, with `--plugin-dir`, so nothing is installed. The A6 pack exists only in a scratch copy of the
    kit. The commands and their results go into this record. One test is committed: `node --test` on the hook script,
    which becomes the kit's verification command.

### Plan

1. Manifests; run the validator.
2. Core rules and their hook; run the A4 delivery check at once, since it is the cheapest way to find A4 false.
3. Record template.
4. Model hook and its automated test; A7 live test.
5. Worker and checker; A6 test; the A4 run with a full-size request, which needs the worker's rules in place.
6. Documents.
7. Verification: validator, `node --test`, then the checker on this item.
8. Outcome, pull request.

One worker, in sequence. The parts are small and two of them change the same file (`hooks/hooks.json`), so they fail
the independence test of the workflow's section 5.1. Only the reading fanned out.

### Assumptions to confirm while building

- A plugin loaded with `--plugin-dir` runs its hooks in a `claude -p` session.
- `CLAUDE_PLUGIN_DATA` is set for a plugin loaded that way. If not, the script falls back to the system's temporary
  directory.
- The `PostToolUse` input for `Write` and `Edit` carries `tool_input.file_path` and `effort.level`.
- A hook that changes a record right after the session edited it costs the session one re-read at most.
- A model given when the worker is started (`--model`) overrides the model in its definition.

### Risks

- **Injected rules weigh less than `CLAUDE.md`.** Criterion 3(b) tests behaviour, not only delivery. If the rules are
  delivered but not followed, A4 is recorded as false and the fallback applies: a short block in each project's
  `CLAUDE.md`, with the text kept in the kit.
- **Loading a pack depends on the model following an instruction.** If A6 fails, the fallback applies: whoever
  dispatches the work names the packs in the prompt, and the worker definition says so.
- **Formats move.** The validator and the hook test are the two commands to run again after any Claude Code update.
  The README states the lowest version the kit was tested with.
- **Older Claude Code.** A build that does not know `PostModelSwitch` may reject or ignore the entry. It is tried on
  2.1.195 and the result recorded.
- **Linux is not tested here.** The script and the `cat` command use nothing specific to Windows, but only a run on
  Linux proves it. It is recorded as not verified.
- **Usage.** About ten short sessions. The runs that test judgement (A4 behaviour, A6) use the strongest model; the
  mechanical ones use a small one.

### Decisions for the person

1. **Node.js for the hook script.** It parses the hook's JSON input and edits front matter reliably, and `node` is
   one executable name on every platform. It makes Node.js a requirement of every host. The alternative is a POSIX
   shell script with no extra requirement and hand-written JSON extraction, which is fragile.
2. **`model: fable` in the worker and the checker,** against `inherit` (the session's model, chosen by whoever starts
   it).
3. **Effort left to the session,** against a level fixed in the definitions.
4. **Marketplace owner written as "Honsha".** The manifest requires an owner name; a person's or an account's name
   would break D57.
5. **Live tests need a Claude Code command line that is logged in** on the test machine.

## Approval

Approved by the person on 2026-11-16, in the conversation with the session working on this item, with one change:
decision 2. The default model is Opus, not Fable; Fable is used when the work is too complex for the default (see
the addendum to the intent). Decisions 1, 3 and 4 were accepted as proposed, and the command line of decision 5 was
logged in by the person.

What the change did to this record before work started: design point 8, acceptance criteria 5 and 11, and item 7 of
the scope. Because the approved specifications gave every judgement task to the strongest model, the architecture's
section 7 and the vision's principle on models are reworded in this pull request.

## Log

- 2026-11-16. Read the vision, the architecture and the workflow. Checked the current Claude Code documentation for
  plugins, marketplaces, agents, skills and hooks; the facts that shape the design are listed in the strategy.
- 2026-11-16. Found that no single hook event carries both model and effort, and that a plugin agent cannot be given
  a read-only Bash. Both changed the design before any file was written (design points 5 and 7).
- 2026-11-16. Record written on its branch. State set to `awaiting-approval`.
- 2026-11-16. Approved with one change (see Approval). State set to `in-progress`.
- Manifests written. `claude plugin validate .` passes with warnings on Claude Code 2.1.325. The only warning about
  the manifests is the missing version, which is deliberate; `--strict` turns it into a failure (deviation 1).
- The command line on the test machine was updated to 2.1.325 before the build started, so nothing could be tried
  on an older build.
- Core rules written, 4,077 characters. A4, delivery: the session stream shows the `SessionStart` hook ending with
  exit code 0 and the rules as its output, and the session answered from its context alone, with no tool call,
  where a record lives, how its branch is named, what a full item waits for and which directory holds the kit.
- A7, first live run: the hook ran and wrote nothing. A throwaway plugin that dumps the input of each hook showed
  why. In a session started without a terminal interface (`claude -p`, with text input or with stream input) the
  `SessionStart` input has no `model` field, and no other event carries the model. `effort.level` is in the
  `PostToolUse` and `Stop` inputs, and `$CLAUDE_EFFORT` holds the same value. A7 is true for the effort level and
  false for the model. The architecture's fallback is applied to the model: the session that finishes the item
  writes its own identifier. The hook was reduced to the effort level: one hook entry, no stored state
  (deviation 2).
- A7, live runs with the reduced hook. (1) Effort low, two edits of a record: `effort: low` after the first edit,
  and the second edit went through without a re-read. (2) Effort high, a session asked to finish an item "as this
  project's rules say": the hook wrote `effort: high` and the session wrote `model: claude-sonnet-5-5`, the
  identifier in the stream's init event. (3) A record created in the session with `Write` and a relative path:
  `effort: medium`. The script now resolves a relative path against the session's working directory.
- Found in run 2: a session in a project is refused when it reads a file of the kit, because the kit lies outside
  the project. The record template is therefore delivered at session start, after the core rules, and a test keeps
  the two under the platform's 10,000-character limit (deviation 3).
- Worker and checker written. Both load, as `honsha:worker` and `honsha:checker`. Run as the agent of a session, the
  checker has exactly `Read`, `Grep` and `Glob`. The worker runs on `claude-opus-5-5`, and on the model given with
  `--model` when there is one. For the same reason as the template, the diff for the checker goes to an uncommitted
  file in the repository root, not outside the repository (deviation 4).
- A6: three runs of the worker on a record that names the area `labels`, with a throwaway pack in a scratch copy of
  the kit. In all three the session stream shows the skill `honsha:area-labels` invoked before the first change,
  the new file starts with the line only the pack requires, and the log of the rehearsed item names the pack. The
  prompt never mentioned packs, areas or skills. A6 is true.
- A4, behaviour: a plain session (no agent, no `CLAUDE.md`, the plugin as the only source of rules) received "add
  login with email and password, so that only signed-in users can read the notes". It sized the item full because
  it touches authentication, created `work/261116-2154-login-email-password`, wrote the record from the template
  with the intent verbatim and `awaiting-approval`, committed only the record and asked for approval. No other file
  changed. A4 is true.
- Documents updated: README, the vision's principle on models, the architecture (sections 3.1, 7 and 8) and the
  workflow (who writes `model`, the example's model identifier).
- Rehearsal of a whole small item, in the A6 project, with only the push and the pull request left out. The worker
  loaded the pack, made and committed the change, wrote the diff file, invoked `honsha:checker` as a subagent,
  deleted the diff file, copied the report into the record, wrote the outcome, set `done` and wrote
  `model: claude-opus-5-5`; the hook had written `effort: medium`. The checker ran on the worker's model, used only
  `Read` and `Glob`, and returned a report in the shape its definition asks for, verdict `pass`.
- The rehearsal's report listed two things the checker could not check: the "always full" cases, which it did not
  know, and the rule of the area pack, which it cannot load. The cases are now written in the checker's definition.
  The second is left as a known limit until a real pack exists.
- Core rules reworded after the live runs: sessions tried to open the workflow document in the kit directory and
  were refused. The rules now say that they and the template are enough for ordinary work, and that reading the kit
  can need a permission.

## Verification

Environment: Windows 11, Claude Code 2.1.325, Node.js 26, Git for Windows. The live checks ran `claude -p` in
disposable repositories outside this one, with the kit loaded by `--plugin-dir` and the machine's user settings
left out (`--setting-sources project`). Nothing was installed into Claude Code. The kit has no profile yet: its
verification commands are the two below.

### Commands

- `claude plugin validate .`: passed with warnings, exit code 0. The warning about the manifests: no version
  (deviation 1). The validator's other remarks concern a submission to the public plugin directory: no licence and
  no icon.
- `node --test hooks/`: 16 tests, 16 passed.

### Acceptance criteria

1. **Manifests:** met without `--strict` (deviation 1).
2. **Core rules:** met. `rules/core.md` is 4,239 characters, covers the eight subjects and names no project.
3. **A4:** met. (a) The hook event in the session stream ends with exit code 0 and carries the rules, and the
   session answered four questions about them without a tool call. (b) A plain session, asked for a login, wrote
   only the record, on its `work/…` branch, with `awaiting-approval`.
4. **Record template:** met. A committed test compares its keys and their order with the workflow's section 4.1.
5. **Agents:** met. The init event of a session lists `honsha:worker` and `honsha:checker`. A session run as the
   checker has the tools `Read`, `Grep`, `Glob`. A worker session runs on `claude-opus-5-5`; started with
   `--model sonnet` it runs on `claude-sonnet-5-5`. The checker's model as a subagent is in the rehearsal below.
6. **A6:** met, three runs out of three.
7. **A7:** met for the effort level, by the hook, with three different levels and for a record created in the
   session. The model is written by the session, not by the hook (deviation 2); in two runs it matched the
   identifier reported by the platform.
8. **Checker:** its report on this item is below.
9. **Public from the first commit:** before each commit the author address was read from the repository's local
   configuration, a GitHub noreply address, and the staged diff was searched for names of people, accounts,
   projects and providers and for machine paths. Nothing was found.
10. **Delivery:** the pull request is opened after this section is written; its number is in the front matter.
11. **Documents:** met. README, the vision's principle, the architecture's sections 3.1, 7 and 8, the workflow.

### Rehearsal of a whole item

One small item in a disposable repository, executed by `honsha:worker` up to the commit that sets `done`: the
record ends with `state: done`, `model: claude-opus-5-5` (the identifier the platform reported), `effort: medium`
(written by the hook) and the checker's report under "Verification". In the session stream the checker is a
subagent of type `honsha:checker`, runs on `claude-opus-5-5` like the worker, and calls only `Read` and `Glob`.

### Not verified

- Linux and macOS.
- An installation from the marketplace manifest. Only `--plugin-dir` was used.
- A session in the terminal interface, where the session-start input may carry the model.
- A session of the desktop application with the kit installed. Sessions driven through stream input, as an
  application drives them, were tested from the command line only.
- What a session holds after a compaction. The documentation says the session-start hook runs again then.
- A project whose profile has verification commands and gates. The rehearsals' profile had none.
- Whether a result follows the rules of an area pack: the checker has no tool to load a pack.

## Deviations

1. **Criterion 1, `--strict`.** Strict mode turns the validator's "no version" warning into a failure, and the
   version is left out on purpose (design point 1). The manifests are validated without `--strict`: they pass, with
   that one warning.
2. **Design point 5 and criterion 7: the hook writes the effort level only.** No hook receives the model in a
   session started without a terminal interface, which is how workers run. The model is written by the session
   that finishes the item, which is A7's fallback. The script is `hooks/record-effort.mjs`, with one hook entry and
   no stored state. Criterion 7 is met for the effort level; for the model it is met by the session, not by a hook.
3. **Design points 2 and 3: the record template is delivered at session start,** after the core rules, not opened
   from a path. A session in a project needs a permission to read a file of the kit. The core rules still name the
   kit directory for the workflow document, which a session can open only where reading the kit is allowed.
4. **Design point 7: the diff for the checker is an uncommitted file in the repository root,** deleted after the
   check, not a file outside the repository, for the same reason.
5. **Design point 10: the committed tests are `node --test hooks/`,** two files, not one: the second checks that
   every file a hook names exists, that what a session receives at start stays under the platform's limit, and
   that the template's front matter matches the workflow's.
6. **Risk "Older Claude Code": not tried.** The older build was no longer on the test machine when the build
   started, and the event the risk was about (`PostModelSwitch`) is no longer used.

## Outcome

Not yet.
