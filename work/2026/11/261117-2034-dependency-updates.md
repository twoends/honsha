---
id: 261117-2034
title: Say who keeps dependencies up to date, and when
project: honsha
type: change
size: small
state: in-progress
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked who checks, how and when, that the dependencies the kit now has are kept up to date, and set a
condition already discussed on the first project: adopting a version only once at least 14 days have passed since its
release is right for features, but not for vulnerability fixes, which are installed as soon as the fixed version is
released. The person also agreed to turning on GitHub's Dependabot alerts.

The answer proposed: security alerts of the hosting service, without its automatic pull requests; ordinary updates
reviewed on a cadence through the radar, as normal work items; the waiting period for ordinary updates only. The person
then asked to start with this item. The alerts were turned on for the kit's repository and the home on the same day,
outside this item. Asked on 2026-11-17, in the chat of a session on the kit.

### Addenda

2026-11-17, after the pull request was opened, while approving another item: the person lowered the waiting period for
ordinary updates from 14 days to 7, and kept Claude Code as an exception to it.

## Acceptance criteria

1. The workflow says how a project's dependencies are kept up to date: what a project declares, how a fix of a known
   vulnerability is handled (at once, no waiting period), how ordinary updates are handled (on a cadence, through
   the radar, only versions released at least 14 days earlier), and the size each kind of update takes.
2. It says why automatic pull requests of a hosting service are not used: their commits carry no record and no
   trailer.
3. The GitHub piece says how to turn the security alerts on and that its automatic pull requests stay off.
4. The kit's `verify` list passes.

## Strategy

- **Size: small.** A new section of the workflow and a part of the GitHub piece. No script, no configuration, no
  dependency; the core rules are not touched, since they are close to their size limit.
- **Where.** Workflow, new section 17 "Dependencies"; `services/github/README.md`, under the settings; README, the
  workflow's topics.
- **Who and when, until a scheduler exists.** The radar entries carry a review date; the person, or a session asked
  to, runs the review. From the phase that brings the scheduler, it starts the review on that date. The workflow
  states the duty, not the machine that runs it.

## Log

- 2026-11-17: Dependabot alerts were already turned on for the kit and the home, with the API commands now in the
  GitHub piece; both answered `204` afterwards. Neither has automatic pull requests or a `dependabot.yml`.
- Workflow, new section 17 "Dependencies"; section 14.1 lists the alerts among the settings a piece describes. GitHub
  piece: the alerts, the commands, what stays off. README: the workflow's topics.
- Work committed in one commit.

## Verification

## Outcome
