# Honsha

Honsha (本社, "head office") is one place from which a person runs all their software projects with AI agents: send
it anything, ask it anything about the projects, tell it what to build.

This repository is the **kit**: the shareable part of the system, packaged as a Claude Code plugin. Everything
specific to a user, a project or an installation lives in that user's separate home repository, never here.

## What is in the kit

| Path                 | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rules/`             | The core rules, in parts of one topic each, that every session of a project, and the checker, receives when it starts                                                                                                                                                                                                                                                                                                                                              |
| `templates/`         | The work-item record, which sessions receive together with the rules, and the profile of a project, with what each key holds                                                                                                                                                                                                                                                                                                                                       |
| `agents/worker.md`   | `honsha:worker`: executes one work item, from its record to an open pull request                                                                                                                                                                                                                                                                                                                                                                                   |
| `agents/checker.md`  | `honsha:checker`: verifies a finished item against its record, with read-only tools                                                                                                                                                                                                                                                                                                                                                                                |
| `skills/`            | The procedures that only some situations need: parallel parts, a merge of the default branch, an assessment, a change to dependencies, the periodic review                                                                                                                                                                                                                                                                                                         |
| `hooks/`             | The hook definitions; the script that gives each part of the core rules, and the template, to a session and to the checker when they start; the script that gives a session the lessons of its project, technologies and host; the script that gives the worker's procedure to a session that runs as no agent; the script that writes the effort level into a record; the guard that refuses merging, a push to the default branch and a forced push; their tests |
| `checks/`            | The runner of a profile's verification commands, the checks of a work branch's record and commits and of the default branch's commits, the measures of merged items with their sessions, and their tests                                                                                                                                                                                                                                                           |
| `services/github/`   | What is specific to GitHub, apart from the rules: commands, settings, what it can enforce, the wiring of the checks                                                                                                                                                                                                                                                                                                                                                |
| `.hub/profile.yml`   | The kit's own profile: its verification commands and its gates                                                                                                                                                                                                                                                                                                                                                                                                     |
| `LESSONS.md`         | The lessons about this repository, named by the profile                                                                                                                                                                                                                                                                                                                                                                                                            |
| `.github/workflows/` | The GitHub wiring that runs the verification commands on pull requests                                                                                                                                                                                                                                                                                                                                                                                             |
| `.claude-plugin/`    | The plugin manifest and the marketplace manifest                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `package.json`       | The development tools of the kit's own checks, with their configuration files beside it. The plugin needs none of them to run                                                                                                                                                                                                                                                                                                                                      |
| `docs/`              | Vision and specifications                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `work/`              | The kit's own work records                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Hosting service

The kit's rules name no hosting service; a user of a service other than GitHub writes its piece from the contract
of a service's piece (workflow, The hosting service).

## Requirements

- Claude Code 2.1.325 or later, the version the kit was tried with, on Windows 11. Not tried yet: a session on Linux
  or macOS (the kit's checks do run on Linux, in its pipeline), a session in the terminal interface, a session of the
  desktop application with the kit installed, a project other than the kit whose profile has verification commands and
  gates, what happens after a compaction, and the project setting that starts new worktrees from the current branch.
- git. On Windows, Git for Windows: a hook written as a shell command, such as git's `pre-push` and the hook of the
  kit's own settings, runs through Git Bash.
- Node.js 26 or later, for the hook scripts and the checks. The plugin installs no packages.
- The plugin's setting `home`, the folder of the installation's home on the machine, which Claude Code asks for when
  the plugin is enabled. Without it a session receives its project's lessons only (workflow, Lessons).
- For a change to the kit, its development tools: `npm ci`, which installs the versions in `package-lock.json` and
  runs no install scripts.
- A command-line client for the service that hosts the repositories, to open pull requests and to read them. The
  piece of that service names it.

## Trying it

Load the kit for one session, without installing anything:

```
claude --plugin-dir <path to this repository>
```

A session started so in a project, or started there by an application or by another session, receives the worker's
procedure when it starts, after the core rules, and runs on the model it was started with. In the main working tree of
a home, a repository holding `registry.yml` at its root, it does not: that folder is the hub's.

Started as the worker, a session has the worker's file as its system prompt, in place of the platform's, and runs on
Opus unless it is started with another model (`--model`):

```
claude --plugin-dir <path to this repository> --agent honsha:worker
```

## Working on the kit

The repository declares its own marketplace and enables its plugin in `.claude/settings.json`, from the repository on
its hosting service and with automatic updates, as every project does (architecture, Kit). A session opened
in a clone runs under the kit as merged: the core rules at start, the guard, the effort hook, the core rules given to
the checker when it starts, and the skills. The platform reads that file only in a folder you trust. Each clone
installs the plugin once, as the architecture says (architecture, Project).

A change to a hook, the rules or an agent is not in force until it is merged. To try it before, start the session
with `claude --plugin-dir <the clone>`, which takes the place of the declared plugin for that session. If the merged
kit breaks a session, start it with `--plugin-dir` on a clone of a working commit, or set `"honsha@honsha": false`
under `enabledPlugins` in `.claude/settings.local.json`, which git does not track, until it is fixed.

A host registers one source for the marketplace's name, for all its projects. A host that registered it from a
clone's folder moves it once, with the command in the piece of its hosting service.

Whatever is committed to the kit counts as public from its first commit, whether its repository is public or private.
So a push from a clone is checked by the hook `.githooks/pre-push`: it refuses a push when any commit it sends, and
that no remote holds yet, adds an e-mail address, a path into a user's folder or the name of the machine's user, in a
line, a file's name, the message or the author. It names the commit, the file and the line, never what it found. A
session that opens in the clone points git at the hook; a clone used without sessions does it with
`node checks/pushed.mjs --install`. Neither changes a hooks folder that git's configuration already names. The kit's
pipeline checks every commit of a pull request and of a push to `main` again, for the addresses and the paths, so that
a clone without the hook is caught too; the name of the machine's user only the hook can look for.

## Checking a change to the kit

```
npm ci
node checks/verify.mjs
```

It runs the verification commands that `.hub/profile.yml` lists: formatting with Prettier, lint with oxlint, types
with TypeScript checking the JavaScript files, the tests, `claude plugin validate .`, and the checks of the branch's
record and commits. The same list runs on every pull request and every push to `main`, on Linux and on Windows.
`npm ci` is needed once, and again when `package-lock.json` changes.

The validator warns that the plugin has no version, which is deliberate (O10; architecture, Open design points). It also
remarks that there is no licence and no icon, which matters only for a submission to the public plugin directory.

## Documents

- [Vision](docs/00-vision/VISION.md): what it does, for whom, principles, non-goals, glossary.
- [Architecture](docs/01-specs/ARCHITECTURE.md): components, repositories, flows, security, assumptions to verify.
- [Workflow](docs/01-specs/WORKFLOW.md): the reasons behind the rules, and the specifications of the kit's own
  mechanisms: work items, records, the backlog, lessons, the profile, commits and branches, the hosting service's
  contract, decisions, measures, how a project joins an installation.

The rules every session receives are the files of `rules/`, opened by `rules/core.md`; the rules only some situations
need are in `skills/` and `templates/`. The workflow points to them and gives their reasons. Identifiers such as O02
are open design points (architecture, Open design points). Why a rule is as it is can be read in the document where a
reason helps, or in the record of the change that made it, under `work/`.
