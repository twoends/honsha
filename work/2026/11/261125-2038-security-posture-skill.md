---
id: 261125-2038
title: Hold the security posture that an assessment reads and the periodic review reads again in one skill
project: honsha
type: change
size: full
kind: capability
state: awaiting-approval
areas: []
created: 2026-11-25
updated: 2026-11-26
requested-by: person
source: 261125-1956
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person chose, on 2026-11-25 in the hub's session, every item that the home's report `261125-1956` proposes after
mapping the security of the kit and of the hub against a questionnaire of SDLC security controls, OWASP SAMM and NIST
SSDF, in the order it proposes. This is its second item.

The report found three gaps. The periodic review reads again nothing of a project's security that its assessment read:
not the kinds of security testing, nor the pipeline's wiring, nor the hosting service's settings. The protections that
a hosting service gives free are no rule: a default branch that refuses direct and forced pushes, a check that must
pass before a merge, the service's own scanning for secrets and for holes in the code; so a failed check stops a merge
only where the service happens to enforce it. And the assessment's and the review's skills have no room for more steps.

It proposed one skill that holds the security posture, invoked by the assessment and by the review: the kinds of
security testing against the project's files; the pipeline's wiring and its token's permissions; the service's settings
and its open alerts; the step that scans the history, moved there from the two skills; and the protections that the
service gives free, each asked for where it is free, as the service's piece says: a default branch that refuses direct
and forced pushes, a required check, the service's scanning for secrets with push protection, code scanning, and
private reporting of vulnerabilities. It estimated the item at 1 to 1.5 times a full item, since the assessments of
that day had tried these readings in part, and placed it after `261125-1913`, whose step it moves.

## Scope and acceptance criteria

### In scope

- A new skill, `skills/security-posture/SKILL.md`, `honsha:security-posture`: what a repository's security posture is,
  read in order by an assessment and again by the periodic review; what each finding becomes; what a reading keeps for
  the next one, and what the review compares.
- `skills/assessment/SKILL.md`: the posture as its first step, in place of its steps on the history, on the checks'
  wiring and on the service's settings, and of the security testing in its step on the profile; its report's log keeps
  what the posture keeps.
- `skills/review/SKILL.md`: the posture in each repository it reads, in place of its step on the history; its
  description.
- `skills/security-testing/SKILL.md`: the posture named where the kinds are read and where the scan of the history runs;
  its description. Its rules on the scan's findings stay as they are.
- `services/github/README.md`: the protections that GitHub gives free, by the repository's visibility and the account's
  plan, how the person turns each on, the command that reads each and what its answers mean; the default permissions of
  a workflow's token; the open alerts of Dependabot, of secret scanning and of code scanning, read with no secret's
  value. The paragraph on GitHub's own scanners moves there.
- `docs/01-specs/WORKFLOW.md`: a section "Security posture" with the reasons; what "The hosting service", "What the
  piece of a service says" and "Upkeep review" say of it. `docs/01-specs/INTERFACE.md`: the skill's name.
  `docs/01-specs/ARCHITECTURE.md` and `README.md`: where they list the skills.
- `checks/budgets.test.mjs`: the workflow's budget, and the reason of the security testing's.

### Out of scope

- Setting a setting or turning on a protection on any repository: they are the person's, on the service. The kit's own
  repository's protections, which the report leaves to the person, stay the person's.
- The readings that later items add to the posture: a repository's collaborators, deploy keys, secrets by name and
  environments (`261125-2039`); a verification standard named in the profile (`261125-2042`); personal data and logging
  (`261125-2043`); a deployed project's exposure and operations (`261125-2044`); built images, infrastructure files, an
  SBOM and provenance (`261125-2045`). The hub's reading of the service's alerts between reviews, and a `SECURITY.md`
  (`261125-2041`).
- The reading of dependencies: it stays the assessment's step, and the review reads it again in its own steps on
  vulnerabilities and on updates.
- The kit's own security testing (`261125-1850`); the testing's weak points (`261125-1849`); a push run from inside a
  script, which the guard does not see; the weak points of `checks/history-secrets.mjs` and of the rule on outsiders'
  pull requests in GitHub's piece. Each is an item or an idea of its own.
- A script that reads the service's side: the readings are commands of the service's piece, run by the session.
- An assessment or a review run in this item.

### Boundaries

- Nothing breaks (interface, Changes to the interface): a skill is added; the assessment's and the review's steps change
  what they hold, and no name, command, key or file's shape that the interface lists changes.
- The rules name no hosting service: what GitHub gives, where, and its commands are in its piece.
- On the hosting service this item only reads. The trial runs the piece's read commands, with the `gh` token of this
  host, on the kit's own repository and on one private repository of the person's account, the home's, and sets
  nothing. The record is public: it gives each answer by its form, and does not say which protections either repository
  lacks. Besides the trial, only GitHub's public documentation is read.
- No secret's value reaches the session: no command of the piece or of the trial prints one.

### Acceptance criteria

1. `skills/security-posture/SKILL.md`, named `security-posture`, has a description that says when it applies, at an
   assessment and at the periodic review, and what it holds. It holds, in order: the scan of the history first, with
   why; the kinds of security testing that the files and surface call for, against `verify` and `dynamic-testing`, by
   the list of `honsha:security-testing`; the wiring and its token's permissions, the repository's default for a
   workflow's token included; the settings that the rules rely on, as the piece lists them; the five protections, each
   asked of the person where the piece says the service gives it free, never set by a session, one the person declined
   named in a line, one the service sells no gap; the open alerts on dependencies, secrets and code, each with what it
   becomes, read with no secret's value; what is read of a repository whose settings the account cannot read; what a
   reading keeps, and the review's comparison with the last reading, where a setting or a protection that was on and is
   off is urgent. It names no hosting service, and holds at most 4,500 characters, so that later items have room.
2. `honsha:assessment` reads the posture as its first step, and no longer holds the steps on the history, the wiring and
   the service's settings, nor the security testing in its step on the profile; its report's log keeps what the posture
   keeps.
3. `honsha:review` reads the posture in each repository it reads, in place of its step on the history; what the posture
   finds urgent comes first in its report; its description names the posture.
4. `honsha:security-testing` says that the posture reads the kinds and runs the scan of the history, at every assessment
   and periodic review; its rules on the scan's findings say what they said; its description says when it applies.
5. GitHub's piece holds, for each of the five protections: where GitHub gives it free, by visibility and plan; what the
   person turns on, the required check with its name and the options that suit the kit's rules, and what the home asks;
   the command that reads it, and its answers for on, off, not given free and not readable. It holds the read of a
   workflow token's default permissions, and the read of the open alerts of the three kinds, the secrets' with no value.
   Each statement is checked against GitHub's pages, and each command is tried as criterion 7 says.
6. The workflow gives the posture's reasons in a section of its own, and its sections "The hosting service", "What the
   piece of a service says" and "Upkeep review" say what criteria 1 to 5 make true; the interface names the skill; the
   architecture and the README list it; each raised budget says why; nothing in the kit contradicts the new rules, or
   still has the assessment or the review read the history, the wiring or the service's settings in a step of its own.
7. The trial: each read command of the piece, on the kit's own repository, which is public, and on the home's, a private
   repository of a free personal account. Each answers, and its answers tell on, off, not given free and not readable
   apart as the piece says; the read of the alerts on secrets prints no value. The log gives each answer's form.
8. The profile's `verify` commands pass, the security review and the checker pass, and the kit's pipeline passes on the
   pull request.

## Strategy

**Why one skill.** An assessment reads a project's security once, before it joins, and nothing reads it again. Between
two readings a setting changes, a protection goes off, an alert opens, and new files call for a kind of testing that
the profile lacks, as a first container file or a first route served over HTTP does. The same steps copied into the
review would drift apart, since a rule stated twice does (core rules, Documents); one skill that both invoke reads the
same in both, and a later item adds its reading in one place.

**What moves, and what stays.**

- Into the posture: the assessment's first step, the scan; the security testing of its step on the profile; its steps
  on the checks' wiring and on the service's settings; the review's step on the history. The settings move whole, the
  merge method with the alerts on dependencies: the piece lists them as one, a reading takes them in two commands, and a
  merge method changed between readings makes the check of commits on the default branch take a squashed pull request
  for a direct commit (workflow, The backlog).
- Stays: the dependencies, in the assessment's own step and the review's two, which already read them again; the
  profile's other keys, the ignored files, the project's rules, the records, the measures and the documents; and the
  rules on the scan's findings, in `honsha:security-testing` beside its rule on a secret found in a commit, where an
  item that answers findings reads them. The posture points there and copies nothing.

**The steps, in order.**

1. The history, first: a secret stops an assessment and is urgent at the review, and its revocation waits for nothing.
2. The kinds of security testing, by the list of `honsha:security-testing`, against `verify` and `dynamic-testing`. A
   kind that a later item adds there, as `261125-2045` will, is read with no change to the posture.
3. The wiring and its token: the wiring as the piece shows it, on every pull request and each push to the default
   branch; its token no wider than the piece names; and the repository's default for a workflow's token, reading only,
   since every workflow that names no permissions gets it, the project's own included.
4. The settings that the rules rely on, as the piece lists them.
5. The five protections, each where the piece says the service gives it free.
6. The open alerts.

A repository whose settings the account cannot read, as a clone of a kit that another account publishes, is read in its
clone alone, and the report says what was not read. Later items add their steps after these, the reads of the service
beside step 6 and those of a deployed instance at the end.

**The protections.**

- Asked, never set. The rules still rely on nothing that a service enforces, and hold on a free account with no
  protection at all (workflow, The hosting service). But a protection given free is a stop on the server, which the
  guard is not: the guard reads the text of a command, and a push run from a script gets past it (workflow, The guard).
  So the posture asks the person for each one that is off. A session never turns one on: each limits what the person's
  own account can do, as a rule that binds administrators too, or a required check that holds a merge while the
  service's runners fail, so its cost is the person's to weigh.
- One the person declines goes into the home's decision log, as a choice about one installation (workflow, Decisions);
  a later reading names it in a line and does not ask again. One the service sells is named in a line, and is no gap.
- The required check is the wiring's job, with no approval required, since the person merges pull requests that nobody
  else reviews, and without asking that a branch be up to date before its merge, since the kit merges the default branch
  into a work branch only on a conflict, a need or a request (core rules, Commits and branches). Code scanning is never
  the required check: its queries are the service's and can change with no change to the repository, and a check that
  changes by itself fails code that did not (`honsha:security-testing`, The tools).
- The home's default branch takes the backlog's direct commits (workflow, The backlog). On GitHub only a repository of
  an organisation has a list of who may bypass a rule, so the piece asks the home for no refusal of direct pushes, nor a
  required check if a ruleset's check also refuses such a push, unless an organisation owns it with the backlog's
  account on that list; forced pushes and deletion are refused there as anywhere.

**The alerts.** The service's alerts are a further stop between reviews (`honsha:dependencies`), and they reach the
person as notifications that nothing turns into work. The posture reads the open ones. One on a dependency is a
vulnerability, fixed the same day (`honsha:dependencies`). One on a secret is a finding of the history, under its rules
(`honsha:security-testing`, The history), whatever its location: the service's scanning also reads what no clone holds,
such as a public repository's issues and comments. One on code is a finding of static testing, whose fix is an item of
the project; dismissing it on the service is the person's. GitHub's API gives each alert on a secret with its value
unless asked not to, so the piece's command asks with `hide_secret=true` and prints only the fields it names: type,
state, validity, and where the secret is, from the alert's locations.

**What the review compares.** A reading keeps, in the record of the assessment or the review: the commit read and the
date the service was read; the scan as it printed it, with the reason of each finding set aside, which the assessment's
log already keeps; and, for each setting and protection, whether it is on, off, not given free or not read. The review
compares with the last reading of the same repository, in the home: a setting or a protection that was on and is off
changed outside any work item, by a mistake or by an account that should not, and is urgent, so the person gets it at
once. The first review after this item compares what the last assessment read, and says what had no earlier reading.

**GitHub's piece.** A section on the protections: for each, where GitHub gives it free; what the person turns on, on
the site; the command that reads it, and its answers for on, off, not given free and not readable, as an account that
does not administer the repository gets. The token's default, under the wiring. The open alerts, a command for each
kind. The commands name `<owner>/<repository>`, those of the remote that the clone fetches from, as the piece's other
reads do: `gh` fills `{owner}/{repo}` by its own rules, which can pick another remote. GitHub's own scanners, now at the
end of "Static testing of the workflows", move into the new section.

**The documents and their budgets.**

- `skills/security-posture/SKILL.md`, new, at most 4,500 of the 6,000 characters of a skill: the later items' steps
  take the rest, and an item that needs more raises its budget with its reason. It holds the readings and what each
  finding becomes, and points to the skills and the piece for the rules and the commands, so each later step stays a
  few lines.
- `skills/assessment/SKILL.md`, at 5,543, loses about 1,000; `skills/review/SKILL.md`, at 4,339, about as many as it
  gains.
- `skills/security-testing/SKILL.md`, at 7,798 of 7,800, gives the reading of the kinds to the posture and takes a
  pointer; its budget follows what remains, and the test's comment no longer names the assessment's skill as the reason.
- `docs/01-specs/WORKFLOW.md`, at 43,088 of 43,100, takes about 1,300 for the posture's reasons and the piece's points:
  a budget of about 44,500.
- `docs/01-specs/INTERFACE.md`, at 7,012 of 9,000, takes one name.

**The files.** Changed: `skills/assessment/SKILL.md`, `skills/review/SKILL.md`, `skills/security-testing/SKILL.md`,
`services/github/README.md`, `docs/01-specs/WORKFLOW.md`, `docs/01-specs/INTERFACE.md`,
`docs/01-specs/ARCHITECTURE.md`, `README.md` and `checks/budgets.test.mjs`. New: `skills/security-posture/SKILL.md`.

**Plan.** After the approval, a second lookup of GitHub's pages, on what the first left open (Log), runs in a subagent
on the light tier at medium effort, while this session writes the posture and the changes to the three skills. Then the
trial, which this session runs, since it is a few read commands whose output must hold no value. Then GitHub's piece,
from the lookup and the trial, and the workflow, the interface, the architecture and the README. The change is not split
into parallel parts: the skills, the piece and the workflow say one thing in several places, and
`checks/interface.test.mjs` reads the skills' folder with the interface. Then the verification; the security review,
due since the change sets how alerts on secrets are read, where a value must never reach a transcript, and moves the
scan of the history, which a slip would drop; the checker; the pull request and its checks, read as the workflow's rule
on pushes says; and the closing commit. The work runs on the strong tier at xhigh, as a full item does.

**How each criterion is shown.** 1 to 6: the files, read by the checker, and the budgets by their test. 7: the trial, in
the log. 8: the verification on this host, the reports, and the pull request's run.

**Assumptions,** from the first lookup or still open, which the second lookup and the trial check. On a public
repository GitHub gives free, on every plan, branch protection and rulesets, secret scanning with push protection, code
scanning's default setup and private reporting of vulnerabilities; on a private repository of a personal account,
branch protection and rulesets come with Pro, and neither scanning is offered; Dependabot alerts are free everywhere.
Only a repository of an organisation has a list of who may bypass a rule. The person's token reads each as the
repository's administrator, and `hide_secret=true` leaves the value out of an
alert on a secret. Code scanning's default setup takes new queries with no change to the repository. Whether a check
that a ruleset requires also refuses a direct push decides only the home's line in the piece.

**Risks.**

- A command that printed an alert on a secret whole would put its value in the transcript: the command asks the service
  to leave it out and prints only the fields it names, and the security review reads it.
- A protection that holds a merge stops the person while the service fails; the piece says so, and the person weighs it.
- A protection declined and asked again at every review would be noise: the decision log stops it.
- The comparison rests on the last reading in the home; a repository first read by this skill has none for some steps,
  and the review says so.
- GitHub changes what it gives: the piece already says to check its statements against GitHub's pages, and the review
  reads the posture again.
- The later items fill the room left in the posture's skill; one that needs more raises its budget.

**For the person.**

- Choices made here, each against an alternative: one skill that both invoke, not steps in each; the service's settings
  moved whole with the protections, not only those that guard; the dependencies left where they are; the rules on the
  scan's findings left in `honsha:security-testing`; the protections asked for and never set, one declined kept in the
  home's decision log and not asked again, one sold no gap; in the home no refusal of direct pushes, unless an
  organisation owns it with the backlog's account allowed to bypass; the required check without required approvals or
  an up-to-date branch, and code scanning never required; the review comparing with the last reading, a setting or a
  protection turned off urgent; the reads as commands of the piece, not a script of the kit, which a later item can make
  if the reviews show the commands misread.
- The trial reads, with this host's `gh` token and nothing more, the settings, protections and open alerts of the kit's
  own repository and of the home's; it sets nothing, and the record does not say which protections either lacks.
  Approving this strategy gives leave for those reads.
- The kit's own repository's protections stay the person's decision: this item turns nothing on.
- The change touches 9 existing files, where the profile's `kinds` expects 3 of a capability; the measure only reports
  it.

## Approval

## Log

- The hub gave the record from the home's backlog when it started the item; its intent is restated as the core rules
  ask of a public project, and the gaps of the report are stated by what they are. The branch was cut from
  `origin/main` at `02edf12` after `git fetch`, with no upstream, so that no push can follow `origin/main` by default.
  `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node <kit directory>/checks/verify.mjs --setup` ran once in the worktree before the first commit:
  `npm ci --ignore-scripts` passed.
- Read the skills `honsha:assessment`, `honsha:review`, `honsha:security-testing`, `honsha:dependencies` and
  `honsha:security-review`; the workflow; the interface; the architecture's and the README's lists of skills; GitHub's
  piece; `checks/budgets.test.mjs`, `checks/interface.test.mjs` and `checks/references.test.mjs`; the record of
  `261125-1913`; the job names of `.github/workflows/project.yml` and `verify.yml`. In the home: this item's report, on
  the gaps it answers; the records of the kit's later items in its backlog, for what they add to the same reading; the
  log of the assessments of 2026-11-25, which read the merge settings, the alerts on dependencies, secret scanning, push
  protection, branch protection, rulesets and code scanning's default setup with `gh`, and found protection of a private
  repository absent on the free plan.
- Measured the documents: `skills/assessment/SKILL.md` 5,543 characters, `skills/review/SKILL.md` 4,339,
  `skills/security-testing/SKILL.md` 7,798 of 7,800, `docs/01-specs/WORKFLOW.md` 43,088 of 43,100,
  `docs/01-specs/INTERFACE.md` 7,012 of 9,000.
- A lookup of GitHub's public documentation ran in a subagent on Haiku at medium effort, before the strategy. Found: the
  list of alerts on secrets gives each value unless `hide_secret=true`, and gives the type, state and validity, with a
  link to the alert's locations, without it; branch protection is in public repositories on every plan and in private
  ones with Pro, Team or Enterprise Cloud; only a repository of an organisation has a list of who may bypass a rule; a
  ruleset's rule on pull requests may require no approval; code scanning's default setup needs a public repository or
  GitHub Code Security; private reporting of vulnerabilities is for public repositories; the API reads code scanning's
  default setup and a workflow token's default permissions. Left open: where Dependabot alerts and secret scanning are
  free on a private repository of a personal account; whether a required check refuses a direct push; the endpoint that
  reads private reporting; whether default setup's queries change by themselves; and each endpoint's answer when a
  feature is off, not given, or read by an account that does not administer the repository.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval, in this
  session.

## Verification

## Outcome
