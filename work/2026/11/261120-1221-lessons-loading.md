---
id: 261120-1221
title: Give every session the lessons of its project, its technologies and its host
project: honsha
type: change
size: full
kind: fix
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

## Verification

## Deviations

- The approval's commit on this branch, never pushed, was replaced by one with the right trailer, where the rules ask
  that a work branch only grows and that a mistake be corrected by a new commit. A new commit could not correct it:
  the trailer of the wrong commit would have failed the check of the branch's commits on every later run.

## Outcome
