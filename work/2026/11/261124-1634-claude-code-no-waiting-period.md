---
id: 261124-1634
title: Say in the dependency rule that Claude Code is not held back by the waiting period, since the kit follows it
project: honsha
type: change
size: small
kind: rule
state: done
areas: []
created: 2026-11-24
updated: 2026-11-25
requested-by: person
source: null
pr: 54
model: claude-sonnet-5-5
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
- The first check failed on one finding: the record had no "Verification" section, since the worker had not yet
  written the commands' results into it. They were written, and a repeated check ran on commit 2955ebe.
- The repeated check failed on one finding: the record did not keep the first report's verdict and finding, nor say in
  the log what followed it. Both were added, and a second repeated check ran on the same commit.

## Verification

Commit read: 2955ebe.

- `npx --no-install prettier --check .`: all matched files use Prettier code style.
- `npx --no-install oxlint`: exit 0.
- `npx --no-install tsc -p .`: exit 0.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 223 tests, 223 pass,
  0 fail.
- `claude plugin validate .`: validation passed, with the warning about the missing `version` in `plugin.json` and in
  the marketplace manifest that the kit already had.
- `node checks/record.mjs`: the record has the shape the rules ask for.
- `node checks/commits.mjs`: the 1 commit of the branch follows the rules.

First check, commit 2955ebe: verdict `fail`. One finding: the record had no "Verification" section, so criterion 4
had no evidence.

First repeated check, commit 2955ebe: verdict `fail`. One finding: the record did not keep the first report's verdict
and finding under "Verification", and the log did not say what followed the checks.

Second repeated check, commit 2955ebe, input files empty since only the record had changed:

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The skill says Claude Code is not held back, says the kit follows the host's version and gives the reason: met, at
   `skills/dependencies/SKILL.md` lines 21-24.
2. The exception is in the skill and not in the kit's profile, and no other file changes: met. The diff since the last
   check is empty, and the branch is unchanged at 2955ebe.
3. The waiting period still applies to every other version, and the text cites no decision-log entry and names no user,
   project or installation: met, at `skills/dependencies/SKILL.md` lines 18-24.
4. The kit's verification commands pass: met, as recorded under "Verification" at
   `work/2026/11/261124-1634-claude-code-no-waiting-period.md` lines 63-73.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order. Nothing changed since the last check.
- **Verification evidence:** in order. The `verify` list covers formatting (prettier), lint (oxlint), types (tsc) and
  tests (node --test).
- **Security review:** not due
- **Record:** in order. The last report's finding is fixed:
  - Under "Verification", line 75 keeps the first check's verdict and finding, and the repeated check's report is the
    one kept in full (lines 78-117).
  - The log, lines 56-59, says what followed each check.
- **Commits:** in order. No commits were added since 2955ebe, which the last check found in order.

**Findings**

none

**Not verified**

none

## Outcome

`skills/dependencies/SKILL.md` now says that the waiting period does not apply to Claude Code, the platform the kit runs
in, and that the kit follows the version the host runs, with the reason. The waiting period for every other version is
unchanged. Pull request 54 is open; no deferred check.
