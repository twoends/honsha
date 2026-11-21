---
id: 261121-1922
title: Give the kit to every session of a registered project from its first item, on a fresh base
project: honsha
type: change
size: full
kind: fix
state: done
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: 42
model: claude-opus-5-5
effort: xhigh
checks:
  - { due: 2026-11-28, what: "Once the plugin is installed for the user on the computer, in the desktop application: a session opened in a worktree of a registered project receives the worker's procedure, one in the home's own folder the hub's, and one in a folder the registry does not name nothing from the kit; the guard refuses a push to the default branch in the first two and not in the third." }
---

## Intent

The person asked to start on the two defects that a readiness review found before the first real project joins. This
item is the first. A project's sessions get the kit only once the plugin is installed in that clone, and nothing tells
the hub or the person to do it. So while a project is adopting, its items, the one that declares the kit first, run
with no core rules, no procedure and no guard, under the project's own older instructions. The pilot's `.gitignore`
ignores the whole `.claude/` folder, so the declaration cannot be committed as it is. `refresh` marks a project active
from its settings on the hosting service, not from whether its sessions get the kit. And sessions work from bases that
nobody brings up to date: the main folders of the home and of the projects. Asked on 2026-11-21, in the session of the
readiness review.

## Scope and acceptance criteria

### In scope

- How the plugin reaches a host and a project's sessions: the design the person chooses from the strategy.
- What makes a project `active`, and `refresh` with it.
- Fresh bases: the branch of an item, the checker's comparison and the hub's reading of the home, from the default
  branch as the hosting service holds it.
- What a project must ignore for the platform's worktrees and the checker's input files, in the assessment.
- The documents that describe installing the kit, declaring it, the states and the worker's start: the README, the
  interface, the GitHub piece, the architecture, the workflow, the hub's, the worker's and the checker's files, and the
  assessment's skill.

### Out of scope

- The other defect, preparing a fresh checkout: item `261121-1920`.
- The guard's gaps, the plugin's place in the repository, the measures and records in other languages: later items.
- How the hub starts a session in a project: a later item.
- The home's own files: a work item of the home after this one, if the chosen design changes them.

### Boundaries

- No session that gets the kit today, in the kit's clone or in the home, loses it.
- Outside the home and the projects it registers, the kit changes nothing in a session.

### Acceptance criteria

The criteria are those of the recommended design, A; if the person chooses B, they are rewritten before the approval.

1. The hooks give the core rules, the template, the lessons and the procedure, and the guard judges commands, only in a
   session whose `cwd` is in the home's main working tree or one of its worktrees, or in the folder that the home's
   registry gives a project for this host, or one of that folder's worktrees. Anywhere else they give nothing and let
   every command through. With tests, the guard's included.
2. The registry is read from the home's default branch as last fetched. When the home or its registry cannot be read,
   the hooks that give context say so in one line, and the guard judges the command as in a project.
3. Installing the kit is one step per host, written in the README and the interface: the plugin installed for the
   user, with the setting `home`. No project holds a file for the kit, and the kit's own `.claude/settings.json` no
   longer declares it.
4. A project is `active` once every item chosen from its assessment is merged as `done`; `refresh` reads that from the
   records on the project's default branch, and no longer reads its settings; with tests.
5. The worker cuts an item's branch from `origin/<default branch>` after a fetch; the checker's two input files compare
   with it; the hub fetches the home before it reads the decisions and the registry.
6. The assessment checks that the project ignores the platform's worktrees and the checker's input files, and proposes
   the change when it does not.
7. Live run in the scratchpad, with the plugin given by `--plugin-dir` and a scratch home whose registry names a scratch
   project: a session in an unregistered folder gets nothing and can push to its `main`; one in the project's folder and
   one in a worktree of it get the rules and the worker's procedure, and the guard refuses a push to `main`; one in the
   home gets the hub's procedure.
8. The documents say what holds now; the profile's `verify` passes.

## Strategy

**What the platform does** (Claude Code documentation, read on 2026-11-21):

- A plugin that a project's `.claude/settings.json` enables does not load until each user installs it in that clone.
- A plugin installed for the user is enabled in every project of the machine, and its hooks run in every session;
  nothing limits them to some folders, so only the hook can decide from its input's `cwd`.
- A session that the desktop app starts in a worktree reads settings, hooks, skills and agents from the main checkout,
  and gives the worktree's path as `cwd`.

**Design A, recommended: the kit for the user, active where the registry says.** Install the plugin once per host at
user scope. Each hook first finds whether the session's folder belongs to the home or to a project that the registry
gives this host a folder for, its worktrees included through git's common directory, and gives nothing otherwise.

- One step per host instead of one per clone, and the same step on a new host, after `folder`.
- A project carries no file for the kit, so neither its `.gitignore` nor a pull of its main folder matters.
- A project gets the kit from its first item after `add` is merged: the items of `adopting` run under the rules and
  the guard.
- The registry already holds which folder is which project on which host, so nothing new is declared.
- `active` can no longer mean "declares the kit". It becomes "the items chosen from its assessment are merged", which
  the records show.

**Design B: the kit per clone, installed by the hub.** Keep a project's declaration. The hub installs the plugin in the
project's clone for the local scope at `add` and at `folder`, before any item; the declaration item commits it for the
project, with `.gitignore` exceptions; `refresh` checks the declaration on the default branch as today. B changes less
and keeps the kit visible in each repository. But it is a step per clone and per host that someone has to remember,
and the project's files must change to adopt the kit, which is what the person objected to.

**Fresh bases.** Whatever the design: the worker fetches and cuts the item's branch from `origin/<default branch>`,
since a worktree may start from a main folder that lags; the checker's files compare with the same ref; the hub
fetches the home before reading `decisions.md` and the registry, and reads them from that ref. On the always-on host
(architecture, Key facts) nobody works in the main folders, so without the fetch every base would lag.

**The cost of A in every session.** Each of the nine hooks at a session's start spends a git call or two to find the
folder's place, about 30 ms each as measured on Windows. On the always-on host, whose dedicated user (architecture,
Security) runs only Honsha's sessions, every folder is the home's or a project's, and the test only confirms it. On a
personal computer, where an installation can run first (architecture, Key facts), the cost also falls on the person's
other sessions, and there the test is what keeps the kit out of them. The guard runs before each shell command
everywhere, so its first test is the cheapest: a folder outside every registered one ends the hook before it parses
the command. The plugin's skills and agents are listed in every session, a few hundred tokens of descriptions; the
platform gives no way to hide them.

**Measures.** About fourteen existing files against the four of `fix`: the change reaches every document that says how
the kit is installed and declared.

**Risks.**

- A wrong decision about the folder silences the kit in a project: the tests cover the home, its worktrees, a
  project's folder, its worktrees and a folder outside, on Windows and Linux paths.
- A home that cannot be read: the hooks say so, and the guard judges as in a project.
- A user-scope install is per user: a second person on the same repository gets no kit, which this installation does
  not have.
- D87 of the installation allows the item, which fixes a defect found before the pilot.

**Order.** This item and `261121-1920` both change the worker's start and the GitHub piece: the one merged second
merges the default branch first.

**Parallel parts.** None. The default model is enough.

## Approval

Approved by the person on 2026-11-21, with design A, in the chat of the session that wrote the strategy.

## Log

- 2026-11-21: before approving, the person asked whether the item is needed when the installation's goal is the
  always-on host. Every part is needed there too, the fresh bases more than on a computer; only the registry's test
  and the cost in other sessions concern a personal computer. `6598c72` added that to the strategy.
- 2026-11-21: `hooks/place.mjs` places a session's folder for every hook. The folder's working tree and main working
  tree are read from its `.git` file or folder, with no git process; a folder outside every repository is outside
  without reading the registry, since every registered folder is a clone. The registry is one `git show` of the home's
  `origin/HEAD`, and the branch is looked for only in a home without an origin. Measured on this computer, ten runs
  each: a bare `node` 43 ms, a hook outside git 57 ms, a hook in a registered folder 97 to 99 ms, so about 40 ms for
  the registry's read.
- 2026-11-21: where the installation cannot be read, only the hook of the opening part, `rules/core.md`, gives the
  line that says so, in its place: each of the nine hooks giving it would put nine copies of it into the session. The
  guard adds the reason to a refusal there. The procedure's hook reports an unreadable input only inside the
  installation.
- 2026-11-21: the records alone cannot say which items were chosen: an item in progress is on no default branch, and
  one waiting in the backlog is in the home. So `choose` takes the chosen items' identifiers, each a record in the
  home's backlog of the project with the assessment as its `source`, and writes them into the entry as `chosen`;
  `refresh` reads each on the project's default branch after a fetch, and in the backlog for one the person dropped.
  The hub's procedure captures the chosen items before `choose`. No registry of the installation has a project
  adopting, so none lacks the new key.
- 2026-11-21: the platform's documentation, read through a subagent: a plugin can ship no settings; a marketplace
  other than the official one updates automatically only when set to, in `/plugin` or with `autoUpdate` on its entry
  of `extraKnownMarketplaces`; a required option of `userConfig` is asked for when the plugin is enabled and kept
  under `pluginConfigs`; a hook's `cwd` in a worktree is the worktree's root. So `worktree.baseRef`, which only a
  project's settings could give, goes with the declaration, and `honsha:parallel-parts` makes the parts' worktrees
  with git from the item's branch; the GitHub piece's "Declaring the kit" becomes "Installing the kit".
- 2026-11-21: the tests of the hooks run them with a scratch home whose registry names their folders,
  `hooks/scratch-home.mjs`, which `hooks/place.test.mjs` also covers.
- 2026-11-21: live run (criterion 7) on `692aea2`, in the scratchpad: a scratch home whose registry, pushed to its
  origin, names a scratch project on this machine; the project with a worktree; a repository the registry does not
  name. In each folder a real session, `claude -p --plugin-dir <this clone> --model haiku`, with
  `CLAUDE_PLUGIN_OPTION_HOME` set to the scratch home, was asked what the hooks gave it at start and to run
  `git push origin main`:
  - the repository not named: no context from the kit, and the push ran;
  - the project's folder and its worktree: the four parts of the core rules, the template and the worker's procedure;
    the guard refused the push;
  - the home: the same parts, the template and the hub's procedure; the guard refused the push.
- 2026-11-21: the check on `692aea2` failed with two findings: three lines past the 120 characters the documents wrap
  to, and this live run written under "Verification". The fix rewraps them, with one comment line of
  `hooks/procedure.mjs` found the same way, and moves the live run into the log. The check also named two things left
  unsaid, which the pull request and the outcome now say: the change-over, and what an installation changes.
- 2026-11-21: the change-over. Once this is merged, the kit's clone and the home declare the plugin no more, or not for
  long, so a session there keeps the kit only once the plugin is installed for the user on the host. That install
  changes the user's own settings, which an item does not do on its own: the pull request asks the person to run it
  before merging, and the boundary holds once it is run.

## Verification

On `a7ac7cb`, `node checks/verify.mjs`, which runs the profile's `verify`: passed.

- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 187 tests, 187
  passed.
- `claude plugin validate .`: passed, with the warning that the manifests carry no version.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: the 5 commits of the branch follow the rules.

The check on `692aea2`, by `honsha:checker`: **fail**, with two findings:

1. Three prose lines the diff adds pass the 120 characters the documents wrap to: `docs/01-specs/ARCHITECTURE.md`
   twice and `agents/hub.md` once.
2. The live run of criterion 7 is under "Verification", which holds only the verification commands and the checker's
   reports; it belongs in the log.

The repeated check on `a7ac7cb`: **fail**, with one finding:

1. "Verification" keeps more of the check on `692aea2` than its verdict and findings: its tally of the criteria and a
   paragraph of what it could not verify.

The repeated check of the record's uncommitted "Verification" on `a7ac7cb`, copied unchanged:

> **Verdict:** pass
>
> The last report's one finding is fixed. In `work/2026/11/261121-1922-kit-reaches-projects.md`, "Verification" now
> keeps only the verdict and the two findings of the check on `692aea2` (lines 204-209). The tally of the criteria and
> the paragraph of what that check could not verify are gone. The repeated check on `a7ac7cb` is kept the same way,
> with its verdict and its one finding (lines 211-214).
>
> **Acceptance criteria**
>
> 1. Hooks give the kit only in the home, its worktrees, a registered project's folder and its worktrees, with tests:
>    met. This diff does not touch it, and the last check found it met.
> 2. Registry read from the home's default branch, with one line and the guard's fallback when it cannot be read: met.
>    Unchanged by this diff.
> 3. Install is one step per host, no project file, the kit's `.claude/settings.json` no longer declares it: met.
>    Unchanged by this diff.
> 4. `active` comes from the merged chosen items, `refresh` reads the records, with tests: met. Unchanged by this diff.
> 5. Worker branches from `origin/<default branch>`, the checker's files compare with it, the hub fetches the home:
>    met. Unchanged by this diff.
> 6. The assessment checks the ignores for the worktrees and the checker's files: met. Unchanged by this diff.
> 7. Live run in the scratchpad: met. Unchanged by this diff; the run is in the log, lines 173-181.
> 8. The documents say what holds now and `verify` passes: met. Verification lines 193-202 show every `verify` command
>    passing on `a7ac7cb`, and this diff changes no document.
>
> - **Intent:** in order
> - **Scope:** in order
> - **Comments and documents:** in order
> - **Gates:** in order
> - **Verification evidence:** in order. The record lists all seven `verify` commands with their results, including
>   `checks/record.mjs` and `checks/commits.mjs`. The results from `a7ac7cb` still hold for the working tree:
>   - `.prettierignore` excludes `work/`, and no other command reads the record's text.
>   - At `in-progress`, `checks/record.mjs` does not check what "Verification" contains (`checks/record.mjs` lines
>     228-233 and 250-259).
>   - The list covers formatting, lint, types and tests.
> - **Record:** in order
> - **Commits:** in order. There is no commit since `a7ac7cb`.
>
> **Findings**
>
> none
>
> **Not verified**
>
> none

## Deviations

- The scope adds four files the strategy did not name, each a consequence of the design: `skills/parallel-parts`,
  since the setting that started a part's worktree from the item's branch leaves the projects;
  `.claude-plugin/plugin.json`, where `home` becomes required and says what it is for; `hub/home.mjs`, whose read of
  the default branch without a fetch the hooks share; and the description in `hooks/hooks.json`.
- Criterion 4 is extended: a chosen item that the person drops, in the backlog, ends the adoption as one merged as
  done does; otherwise a dropped item would keep its project adopting for ever. The registry gains the key `chosen`
  and `choose` its identifiers, which the interface lists.
- The boundary that no session which gets the kit today loses it holds only once the person has installed the plugin
  for the user on the host, a step the item leaves to the person (log, the change-over).

## Outcome

The kit is installed once on each host, for the user, with the setting `home`, and acts only in the sessions of the
home's folder, of the folders that the home's registry gives the projects on that host, and of their worktrees:
anywhere else it gives nothing and refuses nothing. No project holds a file for it, so a registered project's sessions
get the core rules, the procedure and the guard from its first item, adoption included. A project is `active` once the
items chosen from its assessment, which `choose` now writes into the registry, are merged as done or dropped. The
worker cuts its branch and the checker's comparison from the default branch on the hosting service, and the hub
reads the home from it. Before the merge the person installs the plugin for the user on this computer, so that the
kit's clone and the home keep the kit; after it, an item of the home drops its declaration. The deferred check in
`checks`, due 2026-11-28, looks at the desktop application once the plugin is installed so.
