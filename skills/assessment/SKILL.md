---
name: assessment
description: Use when a work item assesses a project against the kit's rules, before the project joins an installation or when the person asks for a project to be assessed again. It holds what an assessment reads, in order, and the report it writes.
---

An assessment reads a project against the kit's rules and proposes the work that would close each gap. It changes
nothing in the project: it is a small report item of the home, and the person chooses which of its proposed items
start.

## What is read

In this order. A step that finds the project in order says so in a line; a gap is a finding.

1. **The security posture** (`honsha:security-posture`), in the project's clone and on its hosting service. It comes
   first, since its first step, the scan of the history, can stop the assessment.
2. **Profile:** present, or what it would hold, against the template `templates/profile.yml` in the kit directory:
   `verify` covering formatting, lint, types, tests and the static security testing that the posture reads, as the
   template says; `setup`, which installs in a fresh checkout what `verify` and the project's own git hooks need,
   wherever its packages are; gates, kinds, the lessons file.
3. **Dependencies,** against the skill `honsha:dependencies`: pinned with a lockfile and installed without install
   scripts; the waiting period and the refusal of install scripts held by the project's configuration, where its
   package manager can, with the version of the package manager that applies it; the package manager's vulnerability
   report and its list of outdated dependencies.
4. **What the project ignores:** its `.gitignore` holds `.claude/worktrees/`, where the platform makes its worktrees,
   and `.honsha-checker.*`, the checker's input files, which hold a diff; otherwise a commit may take them up. The kit
   needs no other file in the project: its sessions receive it once the project is registered.
5. **The project's own rules,** such as `CLAUDE.md`, for anything that conflicts with the core rules; earlier
   workflow documents, for the item that deletes them; an existing lessons file, for entries that belong at another
   level: only lessons about this repository stay in it (core rules, Lessons).
6. **Records,** where there are any: complete front matter, sizes and kinds.
7. **Measures,** where items have been merged: `node <kit directory>/checks/measures.mjs` run in the project; items
   over their kind's expectation; size budgets the project sets on its documents, close to their limit.
8. **Documents:** their size. Duplication and text that no longer holds are the periodic review's (`honsha:review`).
9. **Open points:** the project's open questions, and the assumptions the adoption rests on that nobody has tried.

## What is proposed

A gap is closed with what the kit gives every project, as the kit and the home hold it: the profile's keys, the wiring
of the checks, the hosting service's settings, the ignored files, the lessons file. That way projects of different
technologies run alike. A convention of the project stays only where its technology needs it, never because the project
already had it.

## The report

The record of an assessment has the sections of a small item, from the template.

- **Acceptance criteria:** every step above read, and every gap given a proposed item or the reason it has none.
- **Strategy:** the costs the estimates use, the median agent time and output tokens of a small and of a full item,
  and the items they come from.
- **Log:** the commit read in each repository, and what the security posture keeps (`honsha:security-posture`, What
  is kept).
- **Verification:** the project's `verify` commands, where they ran, with their results.
- **Outcome:** the findings, in one table: number, finding, proposed item, size and kind, estimated cost. A finding
  with no item says why: a decision only the person can take, or nothing to do now and the review that watches it.
  After the table, one paragraph lists what was read and found in order; then the state in a few lines, the proposed
  order of the items, and the decisions waiting for the person. The items the person chooses wait in the home's
  backlog until they start, and the project is active once each is merged as done or dropped.

The size and kind of a proposed item follow the core rules (Sizes) and the project's `kinds`, or the defaults the
template names. Its cost is a multiple of a typical item of that size, from `checks/measures.mjs` run on the project;
while the project has no merged items, on another project of the installation, the kit included. An item that rests on
something untried is estimated higher, and says why.
