---
name: dependencies
description: Use when a work item adds, removes or updates a dependency, changes a lockfile, or answers a report or an alert of a vulnerable dependency. It holds how dependencies are pinned, checked for known vulnerabilities and taken at a new version.
---

These rules are the same in every project that has dependencies. A project adds to them only in its own rules.

- **Pinned.** Every dependency is at an exact version, with the lockfile in the repository, and is installed from the
  lockfile, without install scripts where the package manager can turn them off.
- **Known vulnerabilities are looked for in every item that changes the lockfile:** the package manager's own
  vulnerability report runs. Where the hosting service offers alerts on vulnerable dependencies, they are on, as a
  further stop between reviews; the service's piece, `services/<name>/README.md` in the kit directory, says how. Its
  automatic pull requests stay off: a change that is not a work item has no record, and its commits fail the check
  of a work branch.
- **A fix of a known vulnerability goes in at once.** When a report or an alert names a dependency, a work item starts
  the same day, with the version that fixes it as soon as that version is out. No waiting period applies. Its size
  follows the core rules (Sizes): a major upgrade is full, and its approval is asked the same day.
- **Any other version waits.** A version is taken only when it was released at least 7 days earlier, so that a release
  withdrawn or found compromised in its first days is not taken. Ordinary updates come from the periodic review
  (`honsha:review`).
- **Claude Code is not held back.** The waiting period does not apply to Claude Code, the platform the kit runs in:
  the kit follows the version that the host runs. The host updates it on its own schedule, and the kit's hooks, agents
  and skills are written for that version, so a project that held it back would run the kit on a platform older than
  the one in use.
- **The package manager holds the rule, where it can.** Where the project's package manager can refuse a version
  released less than 7 days earlier, and an install script, the project's configuration in the repository has it do
  both: the rule then holds at every install, a person's, a session's or the pipeline's, and not only where someone
  remembers it. The configuration also asks for a version of the package manager that applies it, so that any other
  stops: an older one reads the settings as unknown, and may run what they would refuse. The two exceptions above
  leave the settings on: a fix sets the waiting period aside for its own package, on the command that takes it, and
  Claude Code is left out by name where the configuration reaches it. With npm 12:
  - `.npmrc` holds `min-release-age=7` and `strict-allow-scripts=true`, which fails an install that meets an install
    script that `allowScripts` in `package.json` does not name, where npm would only skip it with a warning. It holds
    no `ignore-scripts`, which overrides that setting and skips such a script unseen.
  - `package.json` asks npm 12 under `devEngines.packageManager`, with `onFail: error`.
  - A fix is taken with `--min-release-age-exclude=<package>` on its command. The lockfile then holds the version, and
    an install from the lockfile takes it whatever its age.
  - Claude Code installed with `--global`, as a pipeline installs it, is outside the configuration: npm does not read
    a project's `.npmrc` in global mode. A project that holds Claude Code as a dependency names its package under
    `min-release-age-exclude` in `.npmrc`.
