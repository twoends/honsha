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
