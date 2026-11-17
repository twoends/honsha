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
pr: 7
model: claude-opus-5-5
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
- The checker passed the item with three findings, fixed in a commit of their own: section 17 made the hosting
  service's alerts mandatory, against section 14, which relies on nothing a service gives; the package manager's own
  vulnerability report is now the check on any service, at every review and in every work item that changes the
  lockfile, and the alerts are a further stop where a service has them. The reason for leaving automatic pull
  requests off now cites the work item and the commit check. A bundle with a major upgrade is full; a review that
  finds nothing moves its date; radar entries cover direct dependencies. The verdict was a pass, so the check is
  not repeated.

- After the pull request was opened, the person set the waiting period to 7 days (see the addenda). Section 17 says
  7 days; criterion 1 is read with 7 in place of 14, which is a deviation. State set back to `in-progress`.
  Committed as a fix of its own.

## Verification

### Commands

Run on `9df1ad1`, Windows 11, Node.js 26, Claude Code 2.1.325, with `node checks/verify.mjs`: all six passed.

- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed, no findings.
- `npx --no-install tsc -p .`: passed, no errors.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 56 tests, 0 failed.
- `claude plugin validate .`: passed, with the known warning that the manifests have no version.
- `node checks/commits.mjs`: passed, "The 1 commits of the branch follow the rules."

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The workflow says how dependencies are kept up to date (what a project declares, vulnerability fixes at once, ordinary updates on a cadence through the radar after 14 days, size of each kind): met. `docs/01-specs/WORKFLOW.md` lines 541-559. Line 545 covers what a project declares: exact versions, the lockfile in the repository, no install scripts. Line 550 covers vulnerability fixes: a work item the same day, no waiting period. Line 553 covers ordinary updates: a radar entry with a review date, one work item, versions released at least 14 days earlier. On size, line 552 says a vulnerability fix follows 3.2 and a major one is full, and line 556 says a patch or minor update is small and a major one full. I read "what a project declares" as the pinning bullet; no profile field is added.
2. Why the hosting service's automatic pull requests are not used: met. WORKFLOW.md lines 547-549 say their commits "carry no record and no trailer, so they cannot pass the rules on commits (section 13)".
3. The GitHub piece says how to turn the alerts on and that automatic pull requests stay off: met. `services/github/README.md` lines 48-60 give the `gh api -X PUT .../vulnerability-alerts` command, the `gh api -i` command that checks it (`204`/`404`), and say that security updates, version updates and `.github/dependabot.yml` stay off.
4. The kit's `verify` list passes: met as recorded. See the verification evidence below; I did not run the commands.

**Intent:** Answered. The person asked who checks for updates, how and when. Section 17 gives the who (the scheduler, until then the person or a session) and the how (alerts, and a review with the package manager). For the when, vulnerability fixes go in at once and ordinary updates come at the radar review date. As asked, the 14-day wait applies only to ordinary updates.

**Scope:** In order. The four changed files are those the strategy names: WORKFLOW.md section 17, the GitHub piece and README.md, plus the record. The edit to WORKFLOW.md 14.1 item 3 is in WORKFLOW.md, the log declares it, and section 5 step 9 (specifications updated in the same pull request) covers it.

**Comments and documents:** In order. The diff adds no code comments. WORKFLOW.md 14.1 item 3 was rewritten in place with nothing left beside it. The README topics line was extended in place.

**Gates:**
- the rules name no hosting service: met. WORKFLOW.md section 17 and 14.1 name none; the only service name in WORKFLOW.md is the existing `.github/**` in the profile example at line 247, which the diff does not touch. `rules/core.md` is not changed. "Dependabot" and the `gh` commands appear only in `services/github/README.md`.
- nothing about a user, a user's project or an installation: met. The GitHub piece says "Tried on two private repositories of one", with no names, like the existing line 40. The record's log mentions "the kit and the home" without naming them.
- a script comes with its test: met, since no script was added.

**Verification evidence:** In the working tree's Verification section, run on `9df1ad1` (not run again here):
- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test ...`: passed, 56 tests.
- `claude plugin validate .`: passed, with the known warning about versions.
- `node checks/commits.mjs`: passed, 1 commit.

All six commands in `verify` are recorded as passing. The list covers formatting (prettier), lint (oxlint), types (tsc) and tests (node --test). The checker line is not there yet, which is expected because it goes in the closing commit.

**Record:** In order. The intent restates the request. A small item's sections are all there: Intent, Acceptance criteria, Strategy, Log, Verification, Outcome. The log has entries. No departure needs a Deviations section. None of the always-full cases applies: no dependency is added or upgraded, and no CI configuration, schema or public interface changes. The empty Outcome, `pr: null`, `model: null` and `state: in-progress` are expected before the closing commit.

**Commits:** One commit, `9df1ad1` "Say who keeps dependencies up to date, and when".
- The trailer `Work-Item: 261117-2034` is present and matches the item: met.
- Approval gate: does not apply to a small item. The single commit is "the work with its record", as 13.3 says.
- Author and committer addresses match `commits.address`: met.

**Findings**

1. Section 17 conflicts with section 14. Section 14 (WORKFLOW.md lines 443-444) says the rules "rely on nothing that a service enforces or sells" and that what a service adds is "never something a user of the kit must have". Section 17 (lines 547-550) makes the hosting service's vulnerability alerts mandatory, and an alert is the only trigger for a vulnerability fix ("When an alert names a dependency"). 14.1 item 3 now lists the alerts among "the settings the rules rely on". Nothing says what holds on a service that lacks the alerts or charges for them: the ordinary review (line 554) only lists outdated packages, not known vulnerabilities. The merge-commit setting in the same item has a fallback (13.4, "A project that already merges in another way can keep it"); the alerts have none. One-line fix: give a fallback that works on any service, such as the package manager's own vulnerability report at each review or in `verify`, and present the alerts as a further stop. This is not one of the checker's fail conditions: no criterion, gate or commit rule is broken. That is why the verdict is pass, but the conflict is real.
2. The reason section 17 gives cites section 13 loosely (line 548-549). Section 13.2 sets the trailer rule for commits "a session makes", and its last bullet exempts commits the hosting service writes. A reader can take an automatic pull request's commits as covered by that exemption. The statement holds in practice: `checks/commits.mjs` line 83 rejects a branch not named `work/<id>-<slug>`, and line 88 rejects a commit with no trailer. It also holds under the core rule that every change is a work item with a record (`rules/core.md` line 10). The citation points at the weaker basis.
3. Minor wording points in section 17:
   - "A patch or minor update is small; a major one is full" speaks of single updates, but the review bundles updates into one work item. It does not say that a bundle containing a major update is full as a whole (3.2 implies it).
   - "Either way it ends in a work item" is wrong when the review finds nothing worth updating.
   - "Each tool a project depends on has a radar entry" does not say whether indirect dependencies count. The radar is per installation in the home (VISION.md line 93).

**Not verified**

- The six `verify` commands were not run again here; the results are as recorded.
- The record says the alerts are on for the two repositories and that automatic security updates are off. That is a setting on the hosting service and cannot be checked from the files. For the kit, no `.github/dependabot.yml` exists (only `.github/workflows/verify.yml`).
- That GitHub also reports alerts by email (`services/github/README.md` line 50) depends on the account's notification settings and cannot be checked from here.

### After the check

All three findings fixed in `4ee5e94`, as the log says. Then, on `4ee5e94`: `node checks/verify.mjs` passed all six
commands ("The 2 commits of the branch follow the rules."). The new rule applied at once: `npm audit` found 0
vulnerabilities in the kit and in the home; `npm outdated` in the kit lists only `@types/node`, which follows Node.js
22 on purpose.

## Deviations

- Criterion 1 named a waiting period of 14 days; at the person's request after the pull request was opened, it is 7.

## Outcome

The workflow's section 17 says how dependencies are kept up to date on any hosting service: the package manager's
vulnerability report at every review and lockfile change, a vulnerability fix the same day, ordinary updates at the
radar review after 14 days. The GitHub piece turns on Dependabot alerts as a further stop, without its automatic pull
requests. The radar entries for the kit's tools are in the home, with a review on 2026-12-17. No deferred check.
