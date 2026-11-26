# Honsha

Honsha (本社, "head office") is one place from which a person runs all their software projects with AI agents: ask
it about the projects, tell it what to build.

This repository is the **kit**: the shareable part of the system, packaged as a Claude Code plugin. Everything
specific to a user, a project or an installation lives in that user's separate home repository, never here.

## What is in the kit

| Path                          | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rules/`                      | The core rules, in parts of one topic each, that every session of a project, and the checker, receives when it starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `templates/`                  | The work-item record, which sessions receive together with the rules, and the profile of a project, with what each key holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `agents/hub.md`               | `honsha:hub`: the hub of an installation, whose procedure a session opened in a home's own folder receives when it starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `agents/worker.md`            | `honsha:worker`: executes one work item, from its record to an open pull request                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `agents/checker.md`           | `honsha:checker`: verifies a finished item against its record, with read-only tools                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `agents/security-reviewer.md` | `honsha:security-reviewer`: looks for security holes in a change that touches what an attacker aims at, with read-only tools                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `skills/`                     | The procedures that only some situations need: parallel parts, a merge of the default branch, an assessment, a change to dependencies, a security review, security testing, the security posture, the periodic review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `hooks/`                      | The hook definitions; the script that gives each part of the core rules, and the template, to a session and to the checker when they start; the script that gives a session the lessons of its project, technologies and host; the script that gives a session the models that the installation maps to the kit's tiers; the script that gives a session that runs as no agent its procedure, the hub's in the home's main working tree and the worker's in its worktrees and in the projects; the script that places a session's folder in the installation, outside which every hook gives nothing; the script that writes the effort level into a record; the guard that refuses merging, a push to the default branch and a forced push; their tests |
| `checks/`                     | The runner of a profile's verification commands, the checks of a work branch's record and commits and of the default branch's commits, the measures of merged items with their sessions, the scan of a repository's whole history for secrets, the pins of the release programs that the checks run, the kit's own static security testing, and their tests                                                                                                                                                                                                                                                                                                                                                                                              |
| `services/github/`            | What is specific to GitHub, apart from the rules: commands, settings, what it can enforce, the wiring of the checks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `.hub/profile.yml`            | The kit's own profile: its verification commands, its gates and the paths that call for its security review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `LESSONS.md`                  | The lessons about this repository, named by the profile                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `.github/workflows/`          | The GitHub wiring that runs the verification commands on pull requests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `.claude-plugin/`             | The plugin manifest and the marketplace manifest                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `package.json`                | The development tools of the kit's own checks, with their configuration files beside it. The plugin needs none of them to run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/`                       | Vision and specifications                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `work/`                       | The kit's own work records                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Hosting service

The kit's rules name no hosting service; a user of a service other than GitHub writes its piece from the contract
of a service's piece (workflow, The hosting service).

## Requirements

- Claude Code 2.1.325 or later, the version the kit was tried with, on Windows 11. Not tried yet: a session on Linux
  or macOS (the kit's checks do run on Linux, in its pipeline), a session in the terminal interface, a session of the
  desktop application with the kit installed, a project other than the kit whose profile has verification commands and
  gates, what happens after a compaction, and the install for the user with the commands of the hosting service's
  piece.
- git. On Windows, Git for Windows: a hook written as a shell command, such as git's `pre-push` and the hook of the
  kit's own settings, runs through Git Bash.
- Node.js 26 or later, for the hook scripts and the checks. The plugin installs no packages.
- The plugin's setting `home`, the folder of the installation's home on the machine, which Claude Code asks for when
  the plugin is enabled. The kit acts only in the folders that the home's registry names, so without it a session
  receives one line that says so, and nothing else, and the guard judges its commands as in a project.
- For a change to the kit, npm 12, which `package.json` asks in `devEngines`: under another npm the setup stops before
  it installs anything. Where Node.js carries an older npm, `npm install --global --min-release-age=7 npm@12` installs
  the newest npm 12 released at least 7 days earlier. With it, the development tools, which
  `node checks/verify.mjs --setup` installs at the versions in `package-lock.json`, with no install scripts.
- A command-line client for the service that hosts the repositories, to open pull requests and to read them. The
  piece of that service names it.

## Installing it

Once on each host, for the user that runs the installation's sessions, with the commands of the hosting service's
piece (`services/github/README.md` for GitHub): the plugin installed for the user, with the setting `home`. No project
holds a file for the kit. Its hooks run in every session of that user, and act only in the home's folder, in the
folders that the home's registry gives the projects on this host, and in their worktrees (architecture, Kit): anywhere
else a session receives nothing from the kit, and its guard refuses nothing.

## Trying it

Load the kit for one session, without installing anything:

```
claude --plugin-dir <path to this repository>
```

A session started so in a registered project or a worktree of it, or started there by an application or by another
session, receives the worker's procedure when it starts, besides the core rules, and runs on the model it was started
with. In the home's main working tree it receives the hub's procedure instead, so that the home needs no instructions
of its own.

Started as the worker, or as the hub in a home's folder, a session has that agent's file as its system prompt, in
place of the platform's, and runs on the model it is started with (`--model`), since the kit's agents name none:

```
claude --plugin-dir <path to this repository> --agent honsha:worker
claude --plugin-dir <path to this repository> --agent honsha:hub
```

## Working on the kit

The kit is a registered project of its installation, so a session opened in a clone that the registry names runs
under the kit as installed and merged: the core rules at start, the guard, the effort hook, the core rules given to
the checker when it starts, and the skills.

A change to a hook, the rules or an agent is not in force until it is merged. To try it before, start the session
with `claude --plugin-dir <the clone>`, which takes the place of the installed plugin for that session. If the merged
kit breaks a session, start it with `--plugin-dir` on a clone of a working commit, or set `"honsha@honsha": false`
under `enabledPlugins` in `.claude/settings.local.json`, which git does not track, until it is fixed.

A host registers one source for the marketplace's name, for all its projects. A host that registered it from a
clone's folder moves it once, with the command in the piece of its hosting service.

Whatever is committed to the kit counts as public from its first commit, whether its repository is public or private.
So a push from a clone is checked by the hook `.githooks/pre-push`: it refuses a push when any commit it sends, and
that no remote holds yet, adds an e-mail address, a path into a user's folder, a link to a Claude Code session or the
name of the machine's user, in a line, a file's name, the message or the author. It names the commit, the file and the
line, never what it found. A session that opens in the clone points git at the hook; a clone used without sessions
does it with `node checks/pushed.mjs --install`. Neither changes a hooks folder that git's configuration already names.
The kit's pipeline checks every commit of a pull request and of a push to `main` again, for the addresses, the paths
and the links, so that a clone without the hook is caught too; the name of the machine's user only the hook can look
for.

## Checking a change to the kit

```
node checks/verify.mjs --setup
node checks/verify.mjs
```

The first command runs the profile's `setup`, which installs the development tools from the lockfile without their
install scripts, then the programs of the kit's security testing from their releases, each refused unless its archive
has the digest that `checks/releases.mjs` pins: it is needed once in each clone or worktree, and again when
`package-lock.json` or a pin changes. The second runs the verification commands that `.hub/profile.yml` lists:
formatting with Prettier, lint with oxlint and the security rules of `eslint-plugin-security`, types with TypeScript
checking the JavaScript files, the tests, the scan of the branch's commits for secrets with gitleaks, ShellCheck on the
shell scripts, actionlint and zizmor on the workflow files, `claude plugin validate .`, and the checks of the branch's
record and commits. Both run on every pull request and every push to `main`, on Linux and on Windows.

The validator warns that the plugin has no version, which is deliberate (O10; architecture, Open design points). It also
remarks that there is no licence and no icon, which matters only for a submission to the public plugin directory.

## Documents

- [Vision](docs/00-vision/VISION.md): what it does, for whom, principles, non-goals, glossary.
- [Architecture](docs/01-specs/ARCHITECTURE.md): components, repositories, flows, security, assumptions to verify.
- [Interface](docs/01-specs/INTERFACE.md): what an installation may rely on, and the one part of the kit that its
  documents cite.
- [Workflow](docs/01-specs/WORKFLOW.md): the reasons behind the rules, and the specifications of the kit's own
  mechanisms: work items, records, the backlog, lessons, the profile, commits and branches, the hosting service's
  contract, decisions, measures, how a project joins an installation.

The rules every session receives are the files of `rules/`, opened by `rules/core.md`; the rules only some situations
need are in `skills/` and `templates/`. The workflow points to them and gives their reasons. Identifiers such as O10
are open design points (architecture, Open design points). Why a rule is as it is can be read in the document where a
reason helps, or in the record of the change that made it, under `work/`.
