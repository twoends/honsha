# Honsha

Honsha (本社, "head office") is one place from which a person runs all their software projects with AI agents: send
it anything, ask it anything about the projects, tell it what to build.

**Status:** the first version of the kit exists: the core rules of the workflow, the record template, a worker, a
checker, three hooks and the kit's own checks. The hub, the channels, the board and the rest of the design are not
built yet.

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
| `checks/`             | The runner of a profile's verification commands, the check of a work branch's commits, and their tests                                                                   |
| `services/github/`    | What is specific to GitHub, apart from the rules: commands, settings, what it can enforce, the wiring of the checks                                                      |
| `.hub/profile.yml`    | The kit's own profile: its verification commands and its gates                                                                                                           |
| `.github/workflows/`  | The GitHub wiring that runs the verification commands on pull requests                                                                                                   |
| `.claude-plugin/`     | The plugin manifest and the marketplace manifest                                                                                                                         |
| `docs/`               | Vision and specifications                                                                                                                                                |
| `work/`               | The kit's own work records                                                                                                                                               |

## Hosting service

The kit's rules name no hosting service. What is specific to one service is a separate piece. `services/github/` is
the only piece so far, because GitHub is the service the kit has been tried with. A user of another service writes
their own piece from the contract in the workflow, section 14.

## Requirements

- Claude Code 2.1.325 or later. It is the version the kit was tested with, on Windows 11. The kit's checks also run
  on Linux, in its pipeline; a session on Linux or macOS has not been tried yet.
- git. On Windows, Git for Windows: the hooks run through Git Bash.
- Node.js 22 or later, for the hook scripts and the checks. No packages are installed.
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

Installing the kit from its marketplace manifest has not been tried yet. It is part of adopting the kit in a first
project.

## Checking a change to the kit

```
node checks/verify.mjs
```

It runs the verification commands that `.hub/profile.yml` lists: the tests, `claude plugin validate .` and the check
of the branch's commits. The same list runs on every pull request, on Linux and on Windows.

The validator reports one warning about the manifests: the plugin has no version. That is deliberate, so that an
installation follows the repository's commits. Whether and when a version is added is an open point in the
architecture, section 9. The validator also remarks that there is no licence and no icon, which matters only for a
submission to the public plugin directory.

## Documents

- [Vision](docs/00-vision/VISION.md): what it does, for whom, principles, non-goals, glossary.
- [Architecture](docs/01-specs/ARCHITECTURE.md): components, repositories, flows, security, assumptions to verify.
- [Workflow](docs/01-specs/WORKFLOW.md): work items, sizes, records, parallel work, lessons, project profile, commits
  and branches, the hosting service.

All three were approved as the starting base on 2026-11-16. Several parts of the architecture rest on assumptions
that have not all been tested yet; they are listed in its section 8, with the results of those tested so far.

Identifiers such as D21 or O02 in these documents refer to the author's decision log, which is kept outside this
repository.
