---
id: 261124-1616
title: Let the kit set each item's model tier and effort by its size, and an installation map the tiers to models
project: honsha
type: change
size: full
kind: rule
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, that the choice of each item's model and effort be an
approach of the kit rather than of an installation, and on 2026-11-25 to start it.

What happened: the kit's architecture, under "Models", sets Opus as the default for the hub, the workers and the
checker, the strongest model when a full item's strategy asks and the person approves, and the checker on the model of
the session that calls it; it says nothing of effort or of an item's size, and states that there is no per-activity
table. On a day of work in a project using the kit, every item's session inherited the hub's own model and effort, the
highest, from trivial changes to full ones. An installation filled the gap with a decision of its own: the hub chooses
each item's model and effort by its size, a cheaper model at high effort for trivial and small items, Opus at the
highest effort for full ones, the strategy able to ask for more, and a small item raised to Opus where the hub sees a
risk, said in the brief; every subagent is started with its model named, a small model for lookups and mechanical
steps, and the checker on Opus whatever the item's model, so that the check is never weaker than the work. Since then
the hub has named a model and an effort for every item it started.

The direction the hub proposed and the person took: the rule belongs to the kit, since the sizes are the kit's, every
installation meets the same gap, the hub's procedure that starts an item's session is the kit's, and "the checker is
never weaker than the work" is better held by the checker's definition than by each worker remembering to name a model.
The concrete models stay the installation's: the kit names tiers (light, standard, strong, strongest) and an
installation maps them to the models of its provider and plan, which change more often than the rule.

Left: the tiers and their names; the default tier and effort for each size, and for the checker, the security reviewer,
an assessment and mechanical subagents; where an installation maps tiers to models, a key of the home's settings or of
its decision log; the hub's step that names model and effort when it starts an item's session, and what a brief says
when the hub raises an item; whether the checker takes the strong tier or the calling session's model, now that a
worker may run below it; the architecture's "Models" rewritten.

## Scope and acceptance criteria

### In scope

- A section "Models" in the core rules (`rules/core.md`): the four tiers, the installation's map that a session
  receives at start, and the model and effort every subagent is started with.
- The hub's procedure (`agents/hub.md`): the tier and effort it starts an item's session on, by size; the raise of a
  small item and what its brief says; moving a full item's session once a strategy that asks for more is approved; the
  decision log no longer the place of the models.
- The definitions of the checker and the security reviewer: the effort they run at, and the tier the session that
  starts them names. The definitions of the hub and the worker name no model.
- A hook of the kit, `hooks/models.mjs`, with its test, that gives every session of an installation, at start, the map
  of tiers to models under `models` in the home's `settings.yml`; its place in `hooks/hooks.json` and in
  `hooks/hooks.test.mjs`, whose start total counts it.
- The record template's strategy comment: a full item's strategy asks for the strongest tier or the max effort when its
  work needs them.
- The documents that state what changes: the architecture ("Models" rewritten; the hook and the key in "Kit" and
  "Home"), the vision's principle "Quality first", the interface (the key `models` of `settings.yml` and the tiers'
  names), the README (the hook's row, the model of a session started as an agent).
- The budgets that these reach, each raised by this item with its reason.

### Out of scope

- The files of any installation. After the merge, an installation sets `models` in its home's `settings.yml` and
  deletes any decision of its own on models and effort by size: the hub dispatches that as an item of the home.
- A hook that rewrites the model of a subagent's start. It would have to answer the call with a permission decision,
  and no hook can tell the model of the session that makes the call, so it could lower the check of an item run on the
  strongest tier.
- The effort hook, the measures, and who writes `model` and `effort` in a record (core rules, The record).
- The workflow (`docs/01-specs/WORKFLOW.md`): models are the architecture's, and the workflow names none.
- The reader, which is not built yet.

### Boundaries

- The kit names no model, no provider and no plan: only the tiers, and the platform's names of effort levels (medium,
  high, xhigh, max). Tests use placeholders for models.
- The hook reads only `settings.yml` on the home's default branch as last fetched, as `hooks/place.mjs` reads the
  registry, runs no command but git's, gives nothing outside an installation's folders, and prints of what it read only
  the model names it accepts, never a line it refuses.
- Each part of the core rules stays under the limit of one hook's output; the start total is raised by what the change
  measures, rounded up, with its reason.
- The security review is not due: the change touches no authentication, permission, secret, deploy or CI
  configuration or data schema, and the profile lists no path under `security-review`.

### Acceptance criteria

1. The core rules have a section "Models": the kit names four model tiers, from the lightest, light, standard, strong
   and strongest; the installation maps each to a model and a session receives the map at start; every subagent is
   started with its model named, the light tier's at medium effort for a search, a lookup or a mechanical step, the
   session's own for work that needs judgement, the checker and the security reviewer as their descriptions say; a
   tier mapped to no model is named for no session or subagent, which then runs on the model of the session that
   starts it. The opening line of `rules/core.md` names the topic.
2. `agents/hub.md` starts an item's session on the tier and effort of its size: trivial and small on the standard tier
   at high effort, full on the strong tier at xhigh, an assessment on the strong tier at high; a small item on the
   strong tier where the hub sees a risk, which its brief names for the record's log. Once a full item's strategy that
   asks for the strongest tier or the max effort is approved, the hub moves its session to them. "Before the first
   answer" no longer names the models among the decision log's choices.
3. The definitions of `honsha:checker` and `honsha:security-reviewer` keep `model: inherit`, carry `effort: xhigh`, and
   their descriptions say that the session that starts them names the strong tier's model, or its own where that is
   stronger, and its own effort where that is above xhigh.
4. The definitions of `honsha:hub` and `honsha:worker` name no model.
5. `hooks/models.mjs` gives a session of an installation, at start, one line with the model of each tier from `models`
   in `settings.yml` on the home's default branch as last fetched, and says which tiers have none; a file or key that
   is missing gives a line that no tier has a model; an unknown tier, a line it cannot read or a name it does not
   accept gives a line that the map cannot be read, with the line's number and not its text; outside an installation
   it gives nothing. Its output stays within a budget that the start total counts. `hooks/hooks.json` runs it at each
   start, and `hooks/models.test.mjs` tests each of these cases.
6. The record template's strategy comment, for a full item, names the strongest tier or the max effort when the work
   needs them.
7. The architecture's "Models" states the tiers and that the kit names no model, the map and where it is, the reasons
   for each size's tier and effort, the floor of the checker and the security reviewer and why their definitions tell
   the session that starts them, the assessment's and the hub's tier, the other subagents, and the data that reviews
   the choice; "Kit" and "Home" name the hook and the key. The vision's "Quality first" agrees with it.
8. The interface names the key `models` of `settings.yml` and the four tiers' names; the README names the hook in the
   row of `hooks/` and says that a session started as the hub or the worker runs on the model it is started with.
9. No document of the kit outside `work/` names a model, a provider or a plan, or cites an entry of a decision log.
10. The start total in `hooks/hooks.test.mjs`, and any budget of `checks/budgets.test.mjs` that the change reaches, is
    raised by this item to what the change measures, with the reason.
11. The profile's `verify` commands pass.

## Strategy

**The intent's open points.**

- **The tiers.** Four, from the lightest: light, standard, strong, strongest. They name what a tier is for, not a
  model or a family, so that an installation can map them to any provider's models, and two of them can map to one
  model where a plan has fewer.
- **The map, and where it lives.** Under `models` in the home's `settings.yml`, one key per tier, rather than an entry
  of the decision log. A map is a setting that a script reads, as `max-workers` is, and the decision log holds choices
  that the hub applies by reading them; the reason for a mapping can stay beside it as a comment. Its values are names
  that the platform accepts both when it starts a session and when it starts a subagent: the platform's tool that starts
  a subagent takes only its aliases of models, and the model that an alias stands for on a provider is the platform's
  own setting. The key is optional, so the interface does not break: a tier with no model is named for no session or
  subagent, which then runs on the model of the session that starts it, as every session does today.
- **How a session knows the map.** A hook at each start, `hooks/models.mjs`, gives it in one line, as the lessons of
  the home are given: every session starts subagents, the hub reads it at once, and a session the hub did not start,
  or one compacted, has it as well. It reads `settings.yml` on the home's default branch as last fetched, as the
  registry is read, since a change of the map holds once its pull request is merged. The alternative, the hub naming
  the models in each brief, needs no code, but leaves a session started by the person, or the hub's own subagents,
  without the map.
- **Each size's tier and effort.** Trivial and small items on the standard tier at high effort: most items are of
  these sizes, one concern with a clear acceptance, which a standard model at high effort does well, and the checker
  reads a small item on the strong tier. Full items on the strong tier at xhigh: they are the ones with more than one
  reasonable design, a public interface or data at stake. A small item takes the strong tier where the hub sees a
  risk; its brief names the risk, and the worker writes it in the log, since a decision taken in an item is written in
  its record. A full item's strategy may ask for the strongest tier or the max effort, which the person approves with
  it, and the hub then moves the item's session to them: the session that wrote the strategy has run until then on the
  strong tier, and only the hub, which started it, follows it. The rule goes in the hub's procedure, which starts the
  sessions, and the strategy's ask in the template's strategy comment, which is where a worker writes a strategy.
- **The checker and the security reviewer.** On the strong tier at least and at xhigh effort, and on the work's model
  and effort where those are higher: a cheaper model is safe for the work because a strong check follows it, and a
  check is never weaker than the work it reads. The platform lets a definition fix a model only by its name, and takes
  an installation's map only when a subagent is started; so each definition keeps `model: inherit`, gets
  `effort: xhigh`, which a definition can fix, and says in its description, which the session that starts it reads at
  that moment, that it is started on the strong tier's model, or the session's own where that is stronger. The rule
  that every subagent is started with its model named, in the core rules, sends the session there. Naming a model in
  the definition would put a model back into the kit and check an item run on the strongest tier on a weaker one; a
  hook that rewrites the call is out of scope, for the reasons given there. The measures, which count each model's
  tokens by item with its subagents', show afterwards on which model each check ran.
- **An assessment.** The strong tier at high effort, whatever its size: its findings choose the items that bring a
  project in, and it reads more than it reasons, which xhigh would make costly.
- **Other subagents.** A search, a lookup or a mechanical step on the light tier at medium effort, whose result the
  session that asked reads; work that needs judgement, such as a part of an item, on the session's own model, at its
  effort. The rule holds for the hub and every worker, so it goes in the core rules, beside the tiers and the map.
- **The agents' own models.** The hub's and the worker's definitions drop `model: opus`: a session started as one of
  them runs on the model it is started with, the hub on the strong tier, which the person chooses when starting it,
  and a worker on what the hub gives. The kit then names no model anywhere.

**The texts.** The core rules' section, after "Sizes":

```text
## Models

- The kit names four model tiers, from the lightest: light, standard, strong and strongest. The installation maps
  each to a model, and a session receives that map when it starts.
- Every subagent is started with its model named: the light tier's, at medium effort, for a search, a lookup or a
  mechanical step; the session's own for work that needs judgement, such as a part of the item; the checker and the
  security reviewer as their descriptions say. A tier that the installation maps to no model is named for no session
  or subagent: it runs on the model of the session that starts it.
```

In the hub's "Dispatch", the sentence that starts the session becomes: "Then start a new session in a worktree of the
project's folder, with the record's text in its brief, on the tier and effort of its size: trivial and small on the
standard tier at high effort, full on the strong tier at xhigh, an assessment on the strong tier at high. A small item
takes the strong tier where you see a risk, which its brief names for the record's log. Its worker commits the record
on the item's branch and takes the item to a pull request." "Follow" gains: "Once a full item's strategy that asks for
the strongest tier or the max effort is approved, move its session to them."

The checker's description ends: "…with the paths of the record, of a diff file and of a list of the branch's commits,
on the strong tier's model or on its own where that is stronger, and at its own effort where that is above xhigh." The
security reviewer's, likewise. The template's strategy comment: "full: plan, assumptions, risks, the split into
parallel parts if any, and the strongest model tier or the max effort if the work needs them."

The hook's line: "Honsha models of this installation, from `settings.yml` on the home's default branch: light
`<model>`, standard `<model>`, strong `<model>`, strongest no model." A name it accepts is short and made of letters,
digits and the few signs that model names use; anything else makes the map unreadable, so that the line's length stays
bounded and no text of the file reaches a session unchecked.

**Budgets.** Today a session receives 30,047 characters at start, of a total of 30,150. The core rules' section adds
about 600, the template's comment about 70, the hook's line at its budget about 400: the total is raised to what the
measure gives, rounded up to the next fifty, since every session starts subagents and the map reaches them by no other
means. `agents/hub.md` has 349 characters left of 6,000 and gains about 300 net; its budget, and so the total, is
raised only if the text needs it. The checker's and the reviewer's files stay within theirs.

**Parts.** The hook and its test are independent of the documents: a part, on the session's model, writes
`hooks/models.mjs`, `hooks/models.test.mjs` and the hook's entry in `hooks/hooks.json`, in a worktree of the item's
branch, while this session writes the documents; both change nothing of the other's. `hooks/hooks.test.mjs`, which
counts the hook in the total, is changed after the merge of the part, by this session, which then measures the total.
`honsha:parallel-parts` is invoked before the split.

**How each criterion is shown.** Criteria 1 to 4 and 6 to 8: the diff of the documents and definitions. Criterion 5:
the hook's tests. Criterion 9: a search of the kit outside `work/` for the names of models and providers, written in the
log. Criterion 10: the diff of the two tests, with the measure. Criterion 11: the profile's `verify` on this host,
apart from oxlint if this host's application control stops it, which the pipeline then runs; and the pull request's
run.

**Choices for the person.** The map under `models` in the home's `settings.yml`, rather than the decision log; the map
given by a hook at start, rather than by the brief; the checker and the security reviewer on the strong tier at least,
named by the session that starts them as their descriptions say, rather than the caller's model as today; the defaults
above, among them the assessment on the strong tier at high and the light tier at medium; the hub's and the worker's
definitions without a model. Model and effort of this item: the strong tier at xhigh, its default.

## Approval

Approved by the person on 2026-11-25, in this item's session, as written, with its choices: the map under `models` in
the home's `settings.yml`; the map given by a hook at each start; the checker and the security reviewer on the strong
tier at least, named by the session that starts them as their descriptions say; the defaults of the strategy, the
assessment on the strong tier at high and the light tier at medium among them; the hub's and the worker's definitions
without a model.

## Log

- The branch was cut from `origin/main` after `git fetch`, and its upstream unset, so that no push can follow
  `origin/main` by default.
- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts` passed.
- Read the architecture (Kit, Home, Models), the vision, the interface, the README, the workflow's sections on where
  the rules are and on decisions, the four agents' files, the skills `honsha:parallel-parts`,
  `honsha:security-review` and `honsha:assessment`, the hooks `place.mjs`, `lessons.mjs` and `procedure.mjs`, and the
  tests of the start total and of the budgets.
- A subagent on the light tier looked up in the platform's documentation: a definition takes a model by alias or full
  name, or `inherit`, and an effort; the tool that starts a subagent takes only an alias, and its model overrides the
  definition's; a subagent on another model than its session's runs at its definition's effort, not the session's;
  the platform maps each alias to a provider's model by its own settings; no substitution of a plugin's setting in an
  agent's front matter is documented; only a session's start may carry its model in a hook's input, and not always.
- Measured: a session receives 30,047 characters at start with the worker's procedure and 30,025 with the hub's, of
  30,150; `agents/hub.md` 5,651 of 6,000, `agents/worker.md` 5,980 of 6,000, `agents/checker.md` 6,186 of 7,600,
  `agents/security-reviewer.md` 4,682 of 6,000.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
- After the approval, `honsha:parallel-parts` was invoked. The hook and its test went to a part, on the local branch
  `work/261124-1616-model-effort-by-size.hook` in a worktree of its own, cut from the approval's commit, with its
  `--setup` run there; a subagent on the session's model writes it, changing only `hooks/models.mjs`,
  `hooks/models.test.mjs`, `hooks/hooks.json` and, if needed, `hooks/place.mjs` and `hooks/scratch-home.mjs`. This
  session writes the documents and definitions, none of those files.
- Wrote the core rules' section "Models" and the topic in their opening line; the hub's tier and effort by size, the
  raise of a small item and the move of a full item's session; the checker's and the security reviewer's `effort` and
  descriptions; the hub's and the worker's definitions without `model`; the template's strategy comment; the
  architecture's "Models", "Kit" and "Home"; the vision's "Quality first"; the interface's `models`; the README's
  `hooks/` row and the model of a session started as an agent. `agents/hub.md` measures 5,987 characters, within its
  6,000, so its budget stays.
- A search of the kit outside `work/`, `node_modules/` and the lockfile for the names of models, their families and
  providers finds only the package of the platform's command line, which the pipeline installs.
- The part returned one commit, `be5eae7`: `hooks/models.mjs`, its test, its entry in `hooks/hooks.json`, and
  `homeFile` in `hooks/place.mjs`, which reads any file of the home's default branch and which the registry's reading
  now uses. Its own decisions: an empty `models` maps no model; a bare `null`, `true` or `false` is no name; one
  indentation for every entry; and, in the home, a default branch that git cannot find gives a line that says so,
  since no registry was read there before. Read it, then merged it into the item's branch as a fast-forward, the
  documents being uncommitted and in other files; its branch and worktree were removed. Its commit fails one
  assertion of `hooks/hooks.test.mjs`, which this session's commit answers.
- In the hook: a comment said that the opening of the core rules gives the reason where the place is unknown; it is
  the hook of the core rules, in their place. The test held a byte order mark as a raw character, now an escape.
- `hooks/hooks.test.mjs` counts the models' hook among those at start and its `BUDGET`, 390, in the total. Measured:
  12,541 characters of rules and template, 12,390 of lessons and models, 6,188 of the worker's procedure, 31,119 in
  all; the total goes from 30,150 to 31,150, since every session starts subagents and receives the map only so.
  `agents/hub.md` measures 5,989 of 6,000 after a paragraph of "Dispatch" was wrapped again.
- The security review is not due, as the boundaries say: the diff touches no authentication, permission, secret,
  deploy or CI configuration or data schema.
- The checker's first check, on `0f30411`, failed on one finding: the architecture gave a small item that the hub
  raises for a risk the higher effort too, where the hub's procedure raises only its tier. The architecture's
  sentence now says the strong tier at the same effort.
- Of what it could not verify: the platform's documentation, in the lookup above, also says that the tool that starts
  a subagent takes an effort for that start, which overrides the definition's, so the light tier's effort and the
  checker's effort above xhigh can be given. The phrase in quotation marks in the intent names the principle of the
  installation's decision that the intent describes, and quotes no words of the person; the intent stays as the hub
  wrote it.

## Verification

## Outcome
