# Honsha

Honsha (本社, "head office") is one place from which a person runs all their software projects with AI agents: send
it anything, ask it anything about the projects, tell it what to build.

This repository is the **kit**: the shareable part of the system, packaged as a Claude Code plugin. Everything
specific to a user, a project or an installation lives in that user's separate home repository, never here.

## What is in the kit

| Path                  | What it is                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rules/core.md`       | The rules every session of a project receives when it starts                                                                                                             |
| `templates/record.md` | The work-item record. Sessions receive it together with the rules                                                                                                        |
| `agents/worker.md`    | `honsha:worker`: executes one work item, from its record to an open pull request                                                                                         |
| `agents/checker.md`   | `honsha:checker`: verifies a finished item against its record, with read-only tools                                                                                      |
| `hooks/`              | The hook definitions; the script that writes the effort level into a record; the guard that refuses merging, a push to the default branch and a forced push; their tests |
| `checks/`             | The runner of a profile's verification commands, the check of a work branch's commits, the measures of merged items with their sessions, and their tests                 |
| `services/github/`    | What is specific to GitHub, apart from the rules: commands, settings, what it can enforce, the wiring of the checks                                                      |
| `.hub/profile.yml`    | The kit's own profile: its verification commands and its gates                                                                                                           |
| `.github/workflows/`  | The GitHub wiring that runs the verification commands on pull requests                                                                                                   |
| `.claude-plugin/`     | The plugin manifest and the marketplace manifest                                                                                                                         |
| `package.json`        | The development tools of the kit's own checks, with their configuration files beside it. The plugin needs none of them to run                                            |
| `docs/`               | Vision and specifications                                                                                                                                                |
| `work/`               | The kit's own work records                                                                                                                                               |

## Hosting service

The kit's rules name no hosting service; a user of a service other than GitHub writes its piece from the contract in
the workflow, section 14.

## Requirements

- Claude Code 2.1.325 or later, the version the kit was tried with, on Windows 11. Not tried yet: a session on Linux
  or macOS (the kit's checks do run on Linux, in its pipeline), an installation from the marketplace, a session in the
  terminal interface, a session of the desktop application with the kit installed, a project other than the kit whose
  profile has verification commands and gates, what happens after a compaction, and the project setting that starts
  new worktrees from the current branch.
- git. On Windows, Git for Windows: the hooks run through Git Bash.
- Node.js 26 or later, for the hook scripts and the checks. The plugin installs no packages.
- For a change to the kit, its development tools: `npm ci`, which installs the versions in `package-lock.json` and
  runs no install scripts.
- A command-line client for the service that hosts the repositories, to open pull requests and to read them. The
  piece of that service names it.

## Trying it

Load the kit for one session, without installing anything:

```
claude --plugin-dir <path to this repository>
```

Run the worker as the session of a work item:

```
claude --plugin-dir <path to this repository> --agent honsha:worker
```

The worker runs on Opus unless the session is started with another model (`--model`).

## Working on the kit

The repository declares itself as a marketplace and enables its own plugin, in `.claude/settings.json`, so that a
session opened in a clone runs under the kit as the clone holds it: the core rules at start, the guard, the effort
hook. The platform reads that file only in a folder you trust. The first session in a new clone adds the
marketplace; the plugin is active from the next one. An edit to a hook or the rules takes effect in the next session.
If an edit breaks a session, set `"honsha@honsha": false` under `enabledPlugins` in `.claude/settings.local.json`,
which git does not track, until it is fixed.

## Checking a change to the kit

```
npm ci
node checks/verify.mjs
```

It runs the verification commands that `.hub/profile.yml` lists: formatting with Prettier, lint with oxlint, types
with TypeScript checking the JavaScript files, the tests, `claude plugin validate .` and the check of the branch's
commits. The same list runs on every pull request, on Linux and on Windows. `npm ci` is needed once, and again when
`package-lock.json` changes.

The validator warns that the plugin has no version, which is deliberate (architecture, O10). It also remarks that
there is no licence and no icon, which matters only for a submission to the public plugin directory.

## Documents

- [Vision](docs/00-vision/VISION.md): what it does, for whom, principles, non-goals, glossary.
- [Architecture](docs/01-specs/ARCHITECTURE.md): components, repositories, flows, security, assumptions to verify.
- [Workflow](docs/01-specs/WORKFLOW.md): work items, sizes, records, parallel work, lessons, project profile, commits
  and branches, the hosting service, comments and documents, decisions, dependencies, the upkeep review, measures.

The rules every session receives are in `rules/core.md`; the workflow points to them and gives their reasons.
Identifiers such as O02 are the open design points of the architecture, section 9. Why a rule is as it is can be read
in the document where a reason helps, or in the record of the change that made it, under `work/`.
