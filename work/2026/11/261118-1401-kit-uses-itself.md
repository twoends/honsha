---
id: 261118-1401
title: Run the kit's own work under the kit
project: honsha
type: change
size: full
kind: flow
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

The person asked to start with the first item of the assessment of Honsha (home report `261118-1348`): the kit
does not declare its own plugin, so the sessions that work on it get neither the core rules, nor the guard, nor the
hook that writes the effort level; all twelve records have `effort: null`. Asked on 2026-11-18, choosing which item
of that assessment to take first.

## Scope and acceptance criteria

### In scope

- The kit's repository declaring the kit as its own plugin, so that a session opened in it loads the plugin from the
  checked-out files.
- The project settings the architecture's section 3.3 gives every project, `worktree.baseRef: "head"` included.
- The README: how a session on the kit gets the kit.

### Out of scope

- Installing the kit in the pilot from the hosting service: it comes with the pilot.
- Running the kit's items as `honsha:worker`: a choice of how a session is started, not a setting.

### Boundaries

- Nothing specific to this installation in the kit: no absolute path, no account.
- No change to the user's own settings of the platform without the person's approval.

### Acceptance criteria

1. A new session opened in the kit's folder receives the core rules and the template at start, and has the guard and
   the effort hook active, from the files of the checked-out branch.
2. What makes it so is committed in the kit, or, if the platform cannot resolve a path relative to the project, kept
   out of the kit and described in the README for any clone.
3. `worktree.baseRef` is `"head"` in the kit's project settings.
4. The trial is recorded: which declaration worked, how it was tried, and that the effort hook wrote a level.
5. The kit's `verify` list passes.

## Strategy

### Facts it rests on

From the platform's documentation, read on 2026-11-18:

- A repository declares a marketplace in `.claude/settings.json` under `extraKnownMarketplaces`, with a `source` of
  type `github`, `git`, `url`, `file` or `directory`, and enables a plugin under `enabledPlugins` as
  `"<plugin>@<marketplace>": true`. The platform honours these only after the folder is trusted.
- A plugin from a marketplace added from a local directory loads its current files at every session start, in place,
  with `CLAUDE_PLUGIN_ROOT` pointing at them: edits to the kit take effect in the next session.
- The kit's marketplace manifest already lists the plugin with `"source": "./"`.
- Whether a relative `path` in a `directory` source resolves against the project is not documented.
- A plugin loaded with `--plugin-dir` replaces a same-named installed one.

### Design

- `.claude/settings.json` in the kit: `extraKnownMarketplaces.honsha` with `{ "source": "directory", "path": "." }`,
  `enabledPlugins` with `"honsha@honsha": true`, `worktree.baseRef: "head"`.
- Trial in the kit's folder, which is trusted: a nested session on a small model, asked to quote the start of what it
  received and to edit a throwaway record copy; it passes if it quotes the core rules and the kit directory, and if
  the effort hook writes a level. If the relative path is not resolved, the committed file keeps
  `worktree.baseRef` only, and the README tells a developer of the kit to add the marketplace from the clone's own
  folder with `claude plugin marketplace add <clone> --scope local`, which writes to the clone's untracked local
  settings.
- README: one paragraph replacing "Trying it" for a session on the kit.

### Plan

1. Write the settings; run the trial; fall back if needed.
2. README, architecture 3.3 if the trial changes what it says.
3. Verification, the checker, the pull request, the closing commit.

### Assumptions to confirm while building

- A relative `directory` path in project settings resolves against the project's folder.
- A nested `claude -p` run in a trusted folder loads project-declared plugins without an install step.

### Risks

- **The guard in the kit's own sessions** refuses merging and pushing to the default branch there too, as intended.
- **An edit that breaks a hook** breaks the next session in the kit; `claude --plugin-dir` of an earlier clone, or
  disabling the plugin in local settings, recovers it. Said in the README.

### Decisions for the person

1. **Declare the kit as its own plugin in the committed settings,** with a local fallback if the path does not
   resolve. Recommended.
2. **The trial runs a nested session in the kit's folder** on a small model, which may ask you to allow it. Recommended.

## Approval

Approved by the person on 2026-11-18, in the conversation with the session that wrote the strategy, the two
decisions as recommended.

## Log

- 2026-11-18: the platform's documentation on plugins, marketplaces and settings read; the strategy is written and
  the item waits for approval.
- Approved; state set to `in-progress`.
- `.claude/settings.json`: the marketplace `honsha` from the directory `"."`, the plugin `honsha@honsha` enabled,
  `worktree.baseRef: "head"`.
- Trial in the kit's folder with nested sessions on Haiku:
  - first session: the platform added the marketplace, resolving `"."` to the kit's folder; the plugin was not loaded
    yet: no rules received, `effort` left `null` in a throwaway record;
  - second session: it received `# Honsha core rules` and the `Kit directory:` line, and the effort hook wrote
    `effort: medium` into the throwaway record, which was then deleted;
  - third session: the guard refused `git push --force origin no-such-branch-honsha-trial`, naming the kit's hook.
- Both assumptions hold: the relative path resolves against the project, and a nested run in a trusted folder loads
  the declared plugin from its second session on, with no install step. No fallback needed.
- README: a section "Working on the kit". `.gitignore`: `.claude/settings.local.json`, which the README names as the
  place to switch the plugin off, and which was ignored on this PC only by a global setting.
- Work committed in one commit.

## Verification

## Outcome
