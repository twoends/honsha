---
id: 261120-1221
title: Give every session the lessons of its project, its technologies and its host
project: honsha
type: change
size: full
kind: fix
state: done
areas: []
created: 2026-11-20
updated: 2026-11-20
requested-by: person
source: null
pr: 35
model: claude-opus-5-5
effort: null
checks: []
---

## Intent

The person asked to go on with the loading of lessons, which the workflow's section 8 specifies and no hook performs:
a session should receive the lessons of its project, of each technology in its profile's `stack` and of the host it
runs on, within limits of the same kind as those the core rules' parts now follow, so that the lessons do not become
the next file that grows until it no longer fits. Asked on 2026-11-20, after the item that gives the core rules in
parts was merged.

## Scope and acceptance criteria

### In scope

- A hook script that gives one level of lessons, the project's, the technologies' or the host's, at a session's
  start, with three SessionStart hooks in `hooks/hooks.json`.
- A setting of the plugin that names the home's folder on the machine, where the technologies' and the host's lessons
  are.
- `checks/profile.mjs`, which reads `stack` and `lessons`.
- A budget for each level of lessons, and the total at start that counts them; their tests.
- The workflow's section 8 on loading, its section 2 on the total, the architecture's section 3.1 on what a session
  receives at start, and the README on the setting.

### Out of scope

- Setting the home's folder on this machine: the person does it once, when the plugin asks or in its settings.
- A check that fails a pull request whose lessons file passes its budget; the hook's own notice comes first.
- Giving lessons to the checker, which checks against the rules and the record, not against lessons.
- Moving, promoting or deleting any lesson.

### Boundaries

- The core rules' parts, their hooks and their tests of each part do not change.
- A session in a project with no profile, or on a machine with no home set, starts as today, with nothing missing
  but the lessons it cannot have.

### Acceptance criteria

1. At a session's start, three hooks give the project's lessons file named by `lessons` in its profile, the home's
   `lessons/tech/<technology>.md` of each technology in `stack`, and the home's `lessons/host/<host>.md` of the machine,
   each output opening with a line that names what it holds.
2. The home's folder comes from a setting of the plugin of type `directory`. With no home set, the technologies' hook
   of a profile that has a `stack` says in one line that their lessons are not loaded and why, and the host's hook
   gives nothing. A level with no file gives nothing.
3. Each level's output stays under 4,000 characters. A level whose files are longer gives its whole lessons that fit,
   then a line naming each file whose lessons were left out and its path, so that nothing is left out without a word.
4. The total for what a session receives at start becomes 25,000 characters, the parts of the core rules and three
   levels of lessons at their budget together; the test of the total counts the lessons' budgets.
5. Tests cover each level, a missing profile, file or home, a level over its budget, and the profile's two keys.
6. A session started with `claude -p --plugin-dir` on this branch, in the kit's clone with the home set, names the
   lessons it received from each of the three levels.
7. The workflow's sections 8 and 2, the architecture's section 3.1 and the README say it.
8. The profile's `verify` passes.

## Strategy

**Where the home is.** A session's project does not know where the home is, and the path differs on each machine. The
plugin's manifest declares a user setting, `home`, of type `directory`: Claude Code asks for it when the plugin is
enabled, keeps it in the user's settings, shows it in its configuration panel, and gives it to each hook as
`CLAUDE_PLUGIN_OPTION_HOME` (plugins reference, "User configuration"). A hook process reads files as the user does,
as the hooks that read the kit's own files already show.

**The levels.** `hooks/lessons.mjs <level>`, with the level `project`, `technologies` or `host`:

- `project` reads `.hub/profile.yml` under `CLAUDE_PROJECT_DIR` and gives the file its `lessons` key names.
- `technologies` gives `lessons/tech/<technology>.md` of the home for each technology of `stack`, in its order.
- `host` gives `lessons/host/<host>.md` of the home, `<host>` being the machine's name in lower case, as the home's
  file for this PC is already named.

Each output opens with a line that names the level and the files. A lesson is a top-level item of its file's list, so
a level over its budget gives each file's heading and whole lessons while they fit, and closes with a line that names
each file left in part and its path: the session can read the rest and tell the person. The hooks run at every
SessionStart, a compaction's included, as the rules' hooks do.

**The budgets.** 4,000 characters for each level: about fifteen lessons of the length they have today. The total at
start becomes 25,000 characters, about 6,000 tokens: 13,000 for the core rules' parts, which hold 9,771 today, and
12,000 for three levels of lessons at their budget. A level that fills is answered as section 8 already says: a
lesson of general worth is promoted to the kit, one tied to a version is reviewed at the tool's upgrade, one that no
longer holds is deleted; the budget itself is raised only by a work item that says why. The test of the total checks
the rules' outputs against the total less the lessons' budgets, since the lessons' files are the installation's and
not the kit's.

**The profile.** `readProfile` returns `stack`, from the inline form `[node, postgres]` or a list, and `lessons`, a
path; both are optional, and a form it cannot read throws, as for its other keys.

**The documents.** Section 8's "Loading" bullet says how a session receives the lessons, the setting, the budget and
what a full level calls for; section 2's paragraph on the total counts the lessons; the architecture's bullet on what
every session receives names them; the README's requirements name the setting.

**Live check.** In the kit's clone, `claude -p --plugin-dir` on this branch, with the home given to the hooks as the
setting would give it, asked which lessons it received.

**This record.** Its intent restates the request and quotes nothing the person said, as the person decided for a
public project before this item started (item `261120-1219`, not merged yet). The record check on this branch reports
the intent as not quoted until that item is merged and the default branch is merged here, a need the work will meet
before the verification.

**Alternatives left out.** One hook for each technology: the stack differs per project while `hooks.json` is fixed,
and today's files are far under one budget. An environment variable set by hand: the plugin's own setting is asked for
and shown by the platform. Lessons for the checker: it checks the work against the rules and the record.

**Risks.** A path given wrongly leaves the technologies and the host without lessons, with the hook's line saying
which file it did not find. D87 of the installation allows the item: the workflow specifies the loading of lessons
and nothing performs it. The default model is enough.

## Approval

Approved by the person on 2026-11-20, in the chat of the session that wrote the strategy.

## Log

- `may-start honsha`: yes. Branch cut from the kit's `main` at `a845b46`.
- The approval's first commit carried a placeholder for the trailer and was replaced before the first push, as item
  `261120-1219`'s log tells; it is declared under Deviations.
- `checks/profile.mjs` reads `stack`, inline or as a list, and `lessons`. A technology names a file of the home, so a
  name that could lead out of the lessons' folder is refused, as is an empty `lessons`.
- `hooks/lessons.mjs <level>` gives the project's, the technologies' or the host's lessons, after a line that names
  the level and its files, each file's head and then its lessons while they fit in 4,000 characters, 400 of them kept
  for the closing line that names, by its full path, each file left in part. A profile the reader refuses is named
  instead of being passed over; a file that cannot be read fails the hook with a message. `hooks/hooks.json`: three
  SessionStart hooks. `.claude-plugin/plugin.json`: the setting `home`, of type `directory`, not required;
  `claude plugin validate .` accepts it.
- Tests: `hooks/lessons.test.mjs` for each level, a missing profile, file or home, a level over its budget, a profile
  the reader refuses, and the hook run with the platform's variables; `hooks/hooks.test.mjs` for the three lessons
  hooks and for the total of 25,000 with the lessons counted at their budget; `checks/profile.test.mjs` for the two
  keys.
- Docs: the workflow's section 8 (Loading, and a new bullet on the budget) and its section 2 on the total, the
  architecture's section 3.1, the README's table and requirements.
- Live run, on this branch's working tree before the work's commit: in the kit's clone, `claude -p --plugin-dir` on
  the clone with `claude-opus-5-5`, with the home's folder given to the hooks as `CLAUDE_PLUGIN_OPTION_HOME`, asked
  without tools for the lessons it received. It named the three levels with their files, the project's two lessons,
  the technology's one and the host's one. The run also printed that the plugin is enabled in the project's settings
  but not installed, which a session with `--plugin-dir` reports when that folder takes the installed plugin's place:
  `claude plugin list` shows `honsha@honsha` installed and enabled.
- Item `261120-1219` merged into the default branch as `bcc4b86`; the default branch merged here as `811ae09`, the need
  the strategy named. The conflicts were in `checks/profile.mjs` and its test, where both items add keys: resolved by
  keeping both. The verification ran again after the merge.
- The kit's checker is not available in this session, which was resumed: the check runs in a general-purpose
  subagent given `agents/checker.md` as its instructions, with the parts of the core rules and the record template,
  and told to use only Read, Grep and Glob.
- Check on `811ae09`: fail, three findings.
  - The room kept for the closing line was fixed while the line grows with the files it names: a level now gives a
    prefix of its pieces, each file opened by a line that names it, and the closing line is counted at its real
    length; past its room it counts the files it cannot name. The opening line names the level only, so that no list
    of files escapes the count. A test leaves 79 files with long paths out and stays within the budget.
  - `lessons` could name a file outside the project: the profile's reader now refuses an absolute path and a path
    with `..`, and the workflow's section 9 says the file is inside the project.
  - A home's folder that does not exist left two levels silent, against the strategy's risks: the technologies' and
    the host's levels now name it, and the workflow's section 8 says so.
- The edits of the tests' assertions were first tried through a script in a file, whose quoting lost a level of
  escapes; they were made with the editor.
- Live run again on `758b2a4`, as before: the session named the three levels by their opening lines, each with its
  `From` line and the number of its lessons: the host's one, the technology's one and the project's two.
- Repeated check on `758b2a4`: fail, one finding. The closing line could count a file where one lesson fewer left
  room for its name: a level now gives the most lessons whose closing line names every file left out, and counts the
  files only when even no lessons leave room for every name, which is declared under Deviations. The hook's opening
  comment and the workflow's section 8 say it. A test gives the case at five sizes of lesson; it fails on the code
  before this fix.
- Through this host's shell, a heredoc with a quoted delimiter also turns a pair of backslashes into one, which the
  home's lesson for this host does not say. A lesson about the machine belongs to the home: it is reported to the
  person.

## Verification

On `3ffc0b9`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with its warnings.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.

### Earlier checker reports

On `811ae09`, a full check.

**Verdict:** fail

**Findings**

1. Criterion 3 is not met.
   - `hooks/lessons.mjs:22` and `95` reserve 400 characters for the closing line at line 115.
   - That line's fixed words take 129 characters. Each entry after them is an absolute path followed by ", all of it"
     or ", N of its M lessons" (lines 102 and 112).
   - Once the entries pass about 270 characters, the output passes 4,000. Example: a technologies level whose first
     file fills the room and that leaves four more files out, each named by a path of about 70 characters.
   - Line 101 also counts 2 characters for the 3 that line 105 adds.
   - The test over budget has a single file in a short temporary path (`hooks/lessons.test.mjs:96-107`), so it does
     not catch this.
   - The total of criterion 4 assumes each level stays within 4,000.

   Fix: count the closing line's real length against the budget before giving lessons.

2. Intent: the project's level reads whatever file `lessons` names, including a path that leads out of the project.
   - `checks/profile.mjs:102-105` accepts any non-empty value, and `hooks/lessons.mjs:39-40` joins it to the project's
     folder.
   - So `lessons: ../<path>` makes the hook put a file outside the repository into the session's context at every
     start. A session needs a permission to read outside its project (`docs/01-specs/ARCHITECTURE.md:106`).
   - The project's lessons belong to the repository: the file is changed "in the same pull request"
     (`rules/core.md:45-46`; `docs/01-specs/WORKFLOW.md:230`).
   - The item already refuses the same escape for a technology's name (`checks/profile.mjs:24-25` and `99-100`; record
     log, lines 132-133).

   Fix: refuse a `lessons` value that leads out of the project.

3. Intent: a mistyped home makes the technologies' and the host's levels go silent.
   - The approved strategy's Risks (record, lines 119-120) say that a path given wrongly leaves those levels without
     lessons, "with the hook's line saying which file it did not find".
   - The result gives nothing whenever no file exists (`hooks/lessons.mjs:88` and `94`), whether or not the home's
     folder itself exists. So with a mistyped `home`, both levels say nothing.
   - Criterion 2's "a level with no file gives nothing" does not ask for silence when the home's folder is missing.

   Fix: when the home's folder does not exist, those levels say so in one line.

On `758b2a4`, a repeated check.

**Verdict:** fail

**Findings**

1. Criterion 3 is not met. The closing line can name no file and no path, even when a single file is left out.
   - **How it happens.** `closing` (`hooks/lessons.mjs:82-91`) first tries the line that names the files. When that
     line does not fit, it returns a bare count such as "1 file of this level, in whole or in part", without checking
     `room` (line 90). `context` keeps the first output that fits within the budget (lines 135-140). So the level
     keeps one more lesson rather than the file's name.
   - **Example.** A project's `LESSONS.md` with an absolute path of 45 characters holds
     `lessonsFile("Lessons", 60, 110)`. After 30 lessons, 173 characters are left. The line that names the file takes
     196; the count takes 170. The output ends at 3,997 characters with a count that names neither the file nor a
     path for "there". With one lesson fewer, the file's name would fit.
   - **Undeclared change.** Past the room, the line counts the files instead of naming each with its path (lines
     85-87). That changes criterion 3. The log says so (record, lines 161-162), but Deviations does not.
   - **Documents.** `docs/01-specs/WORKFLOW.md:242-243` and the hook's opening comment (`hooks/lessons.mjs:8-9`)
     still say that a level names each file it left in part.
   - **Tests.** The tests do not catch it. In `hooks/lessons.test.mjs:104-115` the room happens to fit the name. In
     `117-133` a count is accepted.

   Fix: give fewer lessons until the closing line names every file left out, and declare under Deviations any count
   kept for when even that cannot fit.

### Checker report

A repeated check of the changes since `758b2a4`, on `3ffc0b9`, with Verification not yet committed. The last report's
one finding is fixed:

- **How it happened.** `hooks/lessons.mjs:138-147` now gives the most lessons whose closing line names every file
  left out. It falls back to a count only when no number of lessons allows that. `closing` reports whether it named
  every file (lines 83-92).
- **Undeclared change.** The count is now declared under Deviations (record, lines 264-266).
- **Documents.** The hook's opening comment (`hooks/lessons.mjs:8-11`) and `docs/01-specs/WORKFLOW.md:242-244` now
  say this.
- **Tests.** `hooks/lessons.test.mjs:117-128` tests the case. At size 110, 173 characters are left after 30 lessons,
  and the line that names the file needs 151 plus the path's length. So the code before the fix returned the count,
  as the log says. The test at lines 130-146 still accepts a count, but its 80 files with long paths are the declared
  case.

**Verdict:** pass

**Acceptance criteria**

1. Three hooks give the three levels, each opening with a line that names it: outside the changes since `758b2a4`;
   no finding in the last report.
2. Home from a `directory` setting; one line when no home is set; nothing for a level with no file: outside the
   changes since `758b2a4`; no finding in the last report.
3. Each level under 4,000 characters, and every file left out named with its path: met. Each file is named by its
   absolute path (`hooks/lessons.mjs:129-130`, `88`). The budget holds at line 143. The level gives fewer lessons
   until every name fits (lines 138-147). The count kept for when even no lessons leave room is declared under
   Deviations.
4. Total of 25,000 with the lessons' budgets counted: outside the changes since `758b2a4`; no finding in the last
   report.
5. Tests cover each level, the missing cases, a level over its budget and the profile's keys: met. The new case is in
   `hooks/lessons.test.mjs:117-128`.
6. A live session names the lessons of the three levels: met, as recorded on `758b2a4` (record, Log, lines 169-170).
   The changes since then touch only a level over its budget, which that run does not reach.
7. Workflow sections 8 and 2, architecture section 3.1 and README: met for this diff, at
   `docs/01-specs/WORKFLOW.md:242-247`. The other documents are not in the diff.
8. The profile's `verify` passes: met, on `3ffc0b9` (record, Verification, lines 182-190).

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

none

## Deviations

- The approval's commit on this branch, never pushed, was replaced by one with the right trailer, where the rules ask
  that a work branch only grows and that a mistake be corrected by a new commit. A new commit could not correct it:
  the trailer of the wrong commit would have failed the check of the branch's commits on every later run.
- Criterion 3 asks that a level name each file it left in part, with its path. When the names cannot fit even with
  no lessons given, because a level leaves out many files or their paths are long, the closing line names those that
  fit and counts the rest: the budget, on which the total at start rests, comes first.

## Outcome

Every session receives, at its start, the lessons of its project, of the technologies of its profile's `stack` and of
its host, each level by a hook of its own and within 4,000 characters, the home's folder coming from the plugin's
setting `home`. The total at start is 25,000 characters, the lessons counted at their budget. Each machine sets
`home` once; until then a session receives its project's lessons only, and says why.
