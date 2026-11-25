# Interface

What an installation may rely on: the names, commands, templates and shapes of files that its home, its projects,
their pipelines and the people who run them use. It is the kit's public interface, and the one part of the kit that an
installation's documents may cite (core rules, Documents): the kit's other documents are rewritten as it grows, and
this one changes only as "Changes to the interface" says.

## The plugin

- The marketplace `honsha`, and its plugin `honsha`, enabled as `honsha@honsha` and installed once on each host, for
  the user that runs the installation's sessions. The commands, and the marketplace's source, are in the piece of the
  hosting service, `services/<name>/README.md`.
- The plugin's setting `home`, which it requires: the folder of the installation's home on the machine. The kit acts
  only in the sessions of the home's folder, of the folders that the registry gives the projects on this host, and of
  their worktrees.
- The kit directory: the folder where the platform keeps the installed plugin. The line above each part of the core
  rules that a session receives at start names it.

## Agents and skills

- Agents: `honsha:hub`, the hub of an installation, whose procedure a session opened in a home's own folder receives
  when it starts; `honsha:worker`, which takes one work item from its record to an open pull request;
  `honsha:checker`, which verifies a finished item against its record; and `honsha:security-reviewer`, which looks for
  security holes in a change before the checker.
- Skills: `honsha:assessment`, `honsha:branch-update`, `honsha:dependencies`, `honsha:parallel-parts`, `honsha:review`
  and `honsha:security-review`. The description of each says when it applies.
- The pack of an area: the skill `honsha:area-<name>`, for the area of that name in a project's profile.

## Commands

The hub's scripts run from the home's folder, the checks from a project's root. What each command does, and what it
refuses, is in its script's opening comment. A check that fails exits with a code other than 0.

```
node <kit directory>/hub/projects.mjs add <name> <repository> <folder> [--assessment <id>]
node <kit directory>/hub/projects.mjs choose <name> [<id>...]
node <kit directory>/hub/projects.mjs refresh
node <kit directory>/hub/projects.mjs folder <name> <folder>
node <kit directory>/hub/projects.mjs check
node <kit directory>/hub/projects.mjs may-start <name> <record>
node <kit directory>/hub/backlog.mjs add <project> <file>
node <kit directory>/hub/backlog.mjs take <project> <id>
node <kit directory>/checks/record.mjs
node <kit directory>/checks/commits.mjs
node <kit directory>/checks/verify.mjs [--setup] [<profile>]
node <kit directory>/checks/measures.mjs [--json] [--sessions <folder>]
```

The kit's other scripts are not part of the interface: `checks/pushed.mjs`, which checks the kit's own pushes;
`checks/changes.mjs`, which a hosting service's wiring runs to tell a push that changes only records;
`services/github/runs.mjs`, which GitHub's wiring runs to read whether the run on a pull request's earlier tip passed;
and the hooks, which the plugin runs.

## Templates

- `templates/record.md`: the record of a work item, which every session receives at start.
- `templates/profile.yml`: the profile of a project, with every key and what it holds.

## Files

What the kit reads or writes in a project and in a home, by its path from the repository's root:

- In every project: the profile, `.hub/profile.yml`; a work item's record, `work/<yyyy>/<mm>/<id>-<slug>.md`, on the
  branch `work/<id>-<slug>`; the file that the profile names under `lessons`.
- In the home, besides what every project holds: the registry, `registry.yml`; the backlog,
  `backlog/<project>/<id>-<slug>.md`; the lessons of a technology, `lessons/tech/<technology>.md`, and those of a host,
  `lessons/host/<host>.md`, named by the machine's name in lower case; the decision log, `decisions.md`, whose choices
  the hub applies; `settings.yml`, whose `max-workers` caps the workers on a host and whose `models` maps each of the
  kit's model tiers, `light`, `standard`, `strong` and `strongest`, to a model, one key per tier.
- The home is the repository whose folder the plugin's setting `home` names; it holds `registry.yml` at its root.

## The registry

`registry.yml` is written by `hub/projects.mjs` alone, in one shape, which the script reads back strictly: a line it
cannot read stops it before it changes anything.

```
projects:
  - name: example-shop
    repository: example-owner/example-shop
    paths:
      example-host: '/srv/projects/example-shop'
    state: adopting
    assessment: 261201-0930
    chosen: [261202-1000, 261202-1005]
```

A project has a folder on each host, by the name the system gives the host. Its state is `assessing`, `adopting` or
`active`, and `assessment` is the identifier of its assessment's record. `chosen`, written by `choose` and kept after
it, lists the identifiers of the items chosen from the assessment; a project `adopting` has it, an empty list when no
item was chosen.

## Checks and their wiring

- The checks read `HONSHA_BRANCH`, `HONSHA_BASE` and `HONSHA_HEAD` where a pipeline checks out something other than
  the branch itself; what each holds is in the contract of a service's wiring (workflow, Checks on pull requests and
  on the default branch).
- The trailers: `Work-Item: <id>` on every commit of a work branch, `Backlog: <id>` on the commits of the backlog.
- What the piece of a hosting service gives an installation's pipeline is named in that piece: for GitHub, the
  workflow `.github/workflows/project.yml`, which a project's own workflow calls, with its inputs `claude-code` and
  `npm` and the permissions that the caller grants it.

## Identifiers

The identifiers of the architecture's assumptions, `A<n>`, and of its open design points, `O<n>`. None is ever reused.

## Changes to the interface

- What this document lists is the kit's public interface, so that a change to it is full (core rules, Sizes); the
  kit's profile also makes full every change to this file.
- Adding a name, a command, an optional argument or an optional key is not breaking. Renaming or removing one, or
  changing a command's arguments or a file's shape so that what an installation holds no longer works, is breaking,
  and stops the work for the person (core rules, Stop conditions).
- A breaking change stops because the plugin's manifests carry no version (architecture, Open design points): a
  change reaches every installation at once, at its next update. When the person approves one, the item says what an
  installation changes, and each installation changes it in a work item of its own.
- `checks/interface.test.mjs` fails when this document names an agent, a skill, a template, a script or a command that
  the kit lacks, or when the kit has one that this document does not name.
