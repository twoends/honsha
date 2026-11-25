---
id: 261124-1634
title: Say in the dependency rule that Claude Code is not held back by the waiting period, since the kit follows it
project: honsha
type: change
size: small
kind: rule
state: in-progress
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: high
checks: []
---

## Intent

The person asked the hub, on 2026-11-24 in the hub's session, to move into the kit what an installation's decision log
holds that is a rule for every installation, and on 2026-11-25 to start this part of it.

An installation's decision log holds a rule that is the kit's: Claude Code is not held back by the waiting period for
updates, and the kit follows the version that the host runs. It concerns the kit's own dependency on the platform it
runs in, and every installation meets it; `skills/dependencies/SKILL.md` asks for a waiting period with no such
exception, so the skill and what the kit does disagree. Left: where the exception goes, the skill or the kit's own
profile, and its reason. Not a new capability: the rule already holds in practice.

## Acceptance criteria

- `skills/dependencies/SKILL.md` says that Claude Code, the platform the kit runs in, is not held back by the waiting
  period and that the kit follows the version the host runs, with the reason.
- The exception sits in the skill and not in the kit's profile, since every installation meets it; no other file
  changes except this record.
- The skill still states the waiting period for every other version, and the text cites no entry of a decision log and
  names no user, project or installation.
- The kit's verification commands pass.

## Strategy

The exception belongs in the skill: the skill is what every installation reads, while the kit's profile binds only
this repository. It is one bullet after the waiting period's, saying that the platform's own updates are outside it
and why: a host decides which version of Claude Code runs the kit, so holding it back for a week would only make the
kit run an older host than the one in use, and the kit's own hooks, agents and skills are written for the version the
host runs. Then the verification commands and the checker.

## Log

- Ran the kit's setup in the new worktree (`npm ci --ignore-scripts`).
- The exception goes in the skill, as one bullet after the waiting period's, not in the kit's profile: every
  installation meets it. No other file mentions the waiting period except the kit's own `.npmrc` and the README's
  install line, which pin the kit's own npm dependencies and are not about the platform.
- No area map in the profile, so no pack was loaded.
