---
id: 261125-2038
title: Hold the security posture that an assessment reads and the periodic review reads again in one skill
project: honsha
type: change
size: full
kind: capability
state: done
areas: []
created: 2026-11-25
updated: 2026-11-26
requested-by: person
source: 261125-1956
pr: 63
model: claude-opus-5-5
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

Approved by the person on 2026-11-26, in this item's session, as written in `6404117`: the choices and the trial's
reads listed under "For the person" included.

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
- The person approved the strategy (Approval); the state is `in-progress`.
- No part of the change ran in parallel, as the strategy says. The second lookup ran in a subagent on Haiku at medium
  effort while this session wrote the posture and the changes to the three skills.
- The second lookup, in GitHub's public pages: GitHub's plans list Dependabot alerts for a personal account on Free;
  secret scanning runs free on a public repository, and on a private one needs GitHub Secret Protection, on Team or
  Enterprise Cloud; push protection of a repository is off by default; `hide_secret` defaults to `false`, and the list
  of alerts on secrets answers `404` where scanning is off; code scanning's endpoints answer `403` where it is not
  offered; CodeQL's queries are "regularly updated"; the paths in the settings. The pages say a required check must
  pass before a merge, and nothing of a direct push; who may bypass a rule in a personal account's repository is
  stated both ways, by the page on protected branches and by the one on rulesets; the reference of the endpoint for
  private reporting could not be read. So the piece claims neither of the two unsettled points: in the home the
  ruleset holds only the refusals of forced pushes and deletion, unless the backlog's account is on its bypass list.
- The trial ran `posture-reads.sh` in the scratchpad: every read of the piece, on the kit's own repository, public, and
  on the home's, private, both of a free personal account whose `gh` token has the scopes `repo`, `workflow`,
  `read:org` and `gist`; 14 seconds for both, every call a read. The answers, by form:
  - `gh repo view --json visibility,viewerPermission` gives `PUBLIC` or `PRIVATE`, and `ADMIN` on both; the merge
    settings and `vulnerability-alerts`, `204`, as the piece already said.
  - `security_and_analysis`: on the public repository, `secret_scanning` and `secret_scanning_push_protection`, each
    with a `status`, beside keys the posture does not read; on the private one, nothing, with `ADMIN`.
  - The rules of the default branch: `[]` with none on the public repository, and `404` "Branch not protected" from
    the older branch protection; on the private one, both and the list of rulesets `403` "Upgrade to GitHub Pro or
    make this repository public to enable this feature".
  - Code scanning's default setup: `state` with `configured` or `not-configured` on the public repository; `403`
    "Code scanning is not enabled for this repository" on the private one, as for its alerts. Its open alerts on the
    public one: `404` "no analysis found", with a hint of `gh` on a scope, `admin:repo_hook`, that no read here needs.
  - Private reporting: `{"enabled":…}` on the public repository, `404` on the private one.
  - The token's default: `default_workflow_permissions` and `can_approve_pull_request_reviews` on both.
  - Open alerts: on dependencies a list on both; on secrets a list on the public repository, read with
    `hide_secret=true` and its filter, and `404` "Secret scanning is disabled on this repository" on the private one.
    No alert was open on either, so the locations of an alert on a secret are untried, and the piece says so.
  - No output held a secret, a value or a repository's name; the script numbered the repositories.
- `gh pr checks 62` names the kit's wiring job `project / checks`, so a project's file, whose caller job is `checks`,
  gives `checks / checks`.
- Decided while writing: the piece first reads `viewerPermission`, so that an account that does not administer the
  repository is told from a protection that is off; the review's report puts the protections asked of the person with
  its proposed items; GitHub's own scanners, at the end of "Static testing of the workflows", become a pointer to the
  new section. The opening comment of `checks/history-secrets.mjs`, which says the scan runs at an assessment and at
  the periodic review, still holds and is unchanged.
- Sizes: `skills/security-posture/SKILL.md` 4,429 characters, within the 4,500 of criterion 1;
  `skills/assessment/SKILL.md` 4,719; `skills/review/SKILL.md` 4,423; `skills/security-testing/SKILL.md` 7,852, whose
  pointers to the posture and longer description take more than the reading of the kinds gave, so its budget is 7,900;
  `docs/01-specs/WORKFLOW.md` 44,886, its budget 44,900, about 400 more than the strategy expected, for the points of a
  service's piece; `docs/01-specs/INTERFACE.md` 7,041. The assessment's later steps are renumbered; nothing in the kit
  cites them by number.
- The security review of `7683fb6` fails on one finding: the reads of the open alerts took one page, 30 alerts, so an
  alert past it went unseen, and on a public repository anyone who can open an issue could push a real alert on a
  secret off the page. Fixed in a commit of its own: the three reads and that of an alert's locations follow every page
  with `--paginate` and `per_page=100`, and print a line for each alert. Tried on the same two repositories: each
  answered as before, with no alert, open or closed, on either; so `--paginate` was tried on the kit's own pull
  requests, 10 a page, which gave 10 lines without it and all 27 with it.
- Its weak points. 1, fixed: an account on a ruleset's bypass list passes every rule of it, so the piece puts no
  account there, and the home's ruleset holds only the refusals of forced pushes and deletion. 2, fixed: a protection
  weakened read as on; the piece reads the ruleset of each rule in force, `active` with an empty `bypass_actors`,
  untried since neither repository has a ruleset, and the older branch protection's `enforce_admins`, forced pushes and
  deletion. 3, fixed: a review commits nothing, so no later reading of its was kept; the posture keeps the
  repository's visibility, the review compares with the assessment's record, and a repository made public, or a
  setting or protection that was on and is now off or not read, is urgent. 4, left to the person: that a session never
  turns a protection on, off or around is a rule, which no guard holds, and a push that the service refuses for a
  secret has no rule of its own beyond the stop conditions; a guard of the service's writes, or such a rule, lies in
  the guard or the core rules, outside this item's files. 5, left to the person: an alert on a secret that only an
  outsider's issue holds stops an assessment and is urgent; it fails closed, and setting it apart would set apart too a
  secret of the project that someone outside posted. 6, fixed: the piece says that a required check holds back a change
  that fails, not a hostile one, since a pull request runs the workflow file of its own branch.
- With the fix, `skills/security-posture/SKILL.md` holds 4,468 characters, `skills/review/SKILL.md` 4,431, and
  `docs/01-specs/WORKFLOW.md` 45,002, its budget 45,100.
- The verification ran again on `71f0745`, and passed.
- The repeated security review, of the diff since `7683fb6` at `71f0745`, confirms the finding fixed and fails on a new
  one, which the fix brought: its narrower read of the older branch protection dropped the pull request it requires,
  that requirement's allowances and the protection's restrictions, so a protection that takes direct pushes, or lets
  one account past the pull request, read as on, and its weakening after the assessment went unseen. Fixed in a commit
  of its own: the read prints the three, and the protection counts as on only with a pull request required and no
  account allowed past it, but in the home. Both new filters ran on an object of the API, with exit status 0.
- Its weak points. 1, fixed: `bypass_actors` `[]` counts as on, and `null`, which GitHub gives an account that may not
  change the ruleset, as not read. 2, fixed: a protection turned on after the assessment was compared as off, and what
  no reading held went unnamed; the person's answers, a protection turned on as well as one declined, go into the
  home's decision log, the review compares with it beside the assessment's record, and names what neither holds. 3,
  fixed: an empty output is no alert only with exit status 0. 4, fixed: the read of a ruleset gives the names of its
  required checks, untried as the rest of that command.
- The posture's step 4 named the settings that the piece lists; it now points to the piece alone. Sizes:
  `skills/security-posture/SKILL.md` 4,431, `skills/review/SKILL.md` 4,457, `docs/01-specs/WORKFLOW.md` 45,039.
- The verification ran again on `c28a94c`, and passed.
- The third security review, of the diff since `71f0745` at `c28a94c`, confirms the second finding fixed and fails on
  a new one: the older branch protection's answer says whether everyone may force-push, and not which accounts are
  named to force-push past it, so a home whose older protection lets a named account force-push read as refusing
  forced pushes. Fixed in a commit of its own: no protection is counted from the older branch protection; the posture
  counts the rules of the rulesets in force, whose bypass list the read shows, and a repository that has only the
  older protection is asked for the ruleset. The read of the older protection goes, and with it the second finding's
  case.
- Its weak point, left to the person: a ruleset's required check is matched by its name and not by the app that
  reports it, so an account that may write commit statuses could meet it; no gain follows, since a collaborator of a
  personal account's repository can merge anyway, and the piece says the check holds back a failing change, not a
  hostile one.
- The verification ran again on `76960b9`, and passed. The fourth security review, of the diff since `c28a94c`,
  passes and confirms the third finding fixed. Its weak point, fixed in a commit of its own: the sentence that counts a
  rule as on could be read as asking the wiring's job of every rule, so the home's ruleset, which holds no required
  check, would always read as off; the job is now asked of the required check alone. The fix touches what the review
  guards, so a repeated review reads it. A line of the fix wider than 120 characters, which the formatter leaves in
  prose, is wrapped in a commit of its own before that review.
- The fifth security review, of the diff since `76960b9` at `02e518b`, passes, with no finding and no weak point, and
  confirms the weak point fixed. The verification ran again on `02e518b`, and passed.
- The verification had also run on `7683fb6`, before the first security review, and on `941d302`, before its line was
  wrapped; both passed.
- The first check, of `02e518b` (full), fails on four findings. 4: GitHub's piece still said that in the home only the
  backlog's account may push to the default branch, where the home's ruleset now refuses only forced pushes and
  deletion; fixed in a commit of its own, the piece now says that any account that can write may push there, and that
  the rules and the guard keep the sessions from it. 2 and 3: the criteria met in part, and the comparison of a review
  changed, are written under "Deviations". 1: the record's log says, by the trial's answers, which protections the
  kit's own repository lacks, which the boundary ruled out; the piece's two sentences that said the same of "the
  repositories where the commands ran" go in that commit, while the log, whose lines the commits from `7683fb6` hold,
  stays as written, since it only grows and so does the branch (Deviations).
- GitHub's REST reference for repositories, read in a subagent on Haiku at medium effort, gives
  `GET /repos/{owner}/{repo}/private-vulnerability-reporting` with a boolean `enabled`, as the piece says; it names no
  other answer but `422` and no scope.
- Read without a token on 2026-11-26: GitHub answers anyone that the kit's `main` is not protected, and gives `[]` for
  the rules of that branch.
- The verification ran on `af0183c`, and passed. The item stops before any push, since the work went beyond its
  boundary (core rules, Stop conditions): the branch's commits hold what the boundary ruled out, and a push would
  publish them. The person decides whether the branch is pushed as it is. The repeated security review of the piece's
  change and the repeated check wait for that decision. The state is `blocked`.
- The person decided, on 2026-11-26 in this item's session, that the branch is pushed as it is (Deviations); the state
  is `in-progress`.
- The verification ran on `24e6c16`, and passed. The sixth security review, of the diff since `02e518b` at `24e6c16`,
  passes with no finding. Its weak point, fixed in a commit of its own: the piece said that the rules and the guard
  keep the sessions from the home's default branch, where the guard stops a mistake and is no boundary (workflow, The
  guard); it now says that GitHub lets any account that can write push there, that the guard stops a session's
  mistake, and that the check of the commits on the default branch fails on a direct commit that is not the backlog's.
  A repeated review reads it.
- The verification ran on `6a008ff`, and passed. The seventh security review, of the diff since `24e6c16`, passes with
  no finding and confirms the weak point fixed. Its two weak points, left to the person, lie outside this item's files
  and were there before it: `checks/commits.mjs` reads no merge commit on a default branch, taking each for a pull
  request's, so a merge made locally and pushed to the home's default branch would pass it; and a direct push that also
  changes the home's own workflow file runs that file, which could leave the check out.
- The repeated check, of the diff since `02e518b` at `6a008ff`, fails on two findings, each fixed in a commit of its
  own. 1: the piece's paragraph on the home restated two rules of its section on the protections, the bypass list and
  the home's ruleset; it now points there. 2: the line above was wrong on the seventh review's first weak point, which
  lies also in the piece's sentence, broader than `checks/commits.mjs`, since that check reads no merge on a default
  branch; the sentence now says that it fails on a direct commit that is not the backlog's, though not on a merge, as
  that weak point proposed. The change touches what the security review guards, so a repeated review reads it.
- A line of that fix wider than 120 characters is wrapped in a commit of its own, `9b4599f`. The verification ran on
  `9b4599f`, and passed. The eighth security review, of the diff since `6a008ff`, passes with no finding, and confirms
  the weak point fixed; the second stays the person's.
- The second repeated check, of the diff since `6a008ff` at `9b4599f`, fails on one finding: the line above on the
  first repeated check says that its two findings were each fixed in a commit of their own, where both were fixed in
  one, `4c56e17`, and `9b4599f` only wraps a line of it. So it is: both in `4c56e17`.
- The verification ran on `cff6207`, which adds that line, and passed.
- The third repeated check, of `cff6207` since `9b4599f`, passes with no finding. The branch is pushed at `cff6207`,
  and the pull request is #63. Its checks were still running when read once after the opening.
- The kit's pipeline on #63, run 45887000587 at `cff6207`, passed: `personal content`, `project / checks`, and
  `verify` on Linux and on Windows, read once after the hub said the run had ended. Criterion 8 is met.

## Verification

On this host, at `cff6207`, with npm 12.2.1, the same results as at each earlier commit that the log names, but for
the count of commits:

- `node <kit directory>/checks/record.mjs`: passed, the record has the shape the rules ask for.
- `node <kit directory>/checks/commits.mjs`: passed, the 15 commits of the branch follow the rules.
- `node <kit directory>/hub/projects.mjs check`: not run, the root holds no `registry.yml`.
- `npx --no-install prettier --check .`: passed.
- `npx --no-install oxlint`: passed.
- `npx --no-install tsc -p .`: passed.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 274 tests, 274 pass.
- `claude plugin validate .`: passed, with warnings on the plugin's version and icon and a licence that the plugin
  directory would ask for, none of which this change touches.
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed.
- The kit's profile lists no `dynamic-testing`: `node checks/verify.mjs --dynamic` says so and passes.

The first security review, of `7683fb6` (full): verdict `fail`, one finding. `services/github/README.md`: the reads of
the open alerts fetched one page, 30 alerts by default, so the reading looked complete when it was not; on a public
repository an outsider could push a real alert on a secret off the page with strings that match a pattern GitHub
detects, and the secret would never be made urgent.

The second security review, of `71f0745` (since `7683fb6`): verdict `fail`, the first finding confirmed fixed, one
finding. `services/github/README.md`: the narrowed read of the older branch protection dropped
`required_pull_request_reviews`, its `bypass_pull_request_allowances` and `restrictions`, so a protection that takes
direct pushes, or lets one account past the pull request, read as refusing direct pushes, and such a change after the
assessment left the reading unchanged.

The third security review, of `c28a94c` (since `71f0745`): verdict `fail`, the second finding confirmed fixed, one
finding. `services/github/README.md`: the older protection's `allow_force_pushes.enabled` says whether everyone may
force-push, and its REST answer shows no list of the accounts named to force-push past it, so a home whose older
protection lets a named account force-push read as refusing forced pushes.

The fourth security review, of `76960b9` (since `c28a94c`): verdict `pass`, the third finding confirmed fixed, no
finding. The fifth, of `02e518b` (since `76960b9`), the sixth, of `24e6c16` (since `02e518b`), and the seventh, of
`6a008ff` (since `24e6c16`): verdict `pass`, no finding.

The eighth security review, of `9b4599f` (since `6a008ff`):

### Security review report

**Verdict:** pass

**Read:** `services/github/` (README.md, the changed paragraph and the section "The protections it gives free" it
points to); `checks/` (commits.mjs, the reading of the default branch, to check the new sentence against it)

**Findings**

none

**Weak points**

1. Weak point 1 of the last review (`services/github/README.md:104-105`) is fixed. The sentence now says the check of
   the commits fails on a direct commit that is not the backlog's, "though not on a merge, which it takes for a pull
   request's". That matches `checks/commits.mjs:176-178`: on the default branch, `if (commit.merge) continue;` skips
   every merge commit whether it came from a pull request or from a direct push. It also matches the assumption the
   script's header states at `checks/commits.mjs:20-24`. The paragraph drops its old sentence on the bypass list ("An
   account on a ruleset's bypass list passes every rule of it, so the home's ruleset refuses only forced pushes and
   deletion"), but nothing is lost. That fact is still stated where the paragraph points:
   `services/github/README.md:130-132` says no account goes on the bypass list and the home's ruleset holds only
   "Restrict deletions" and "Block force pushes". The new wording, that GitHub lets any account that can write push
   there "whatever its ruleset holds", claims no stop the server does not give.
2. Weak point 2 of the last review (a direct push that also edits the home's caller workflow) is unchanged by this diff
   and is still the person's to decide.

**Not reviewed**

- Whether the home repository's live ruleset on GitHub matches what `services/github/README.md:130-132` describes. That
  cannot be read from the clone.

The first check, of `02e518b` (full): verdict `fail`, four findings. 1. The record says which protections the kit's
own public repository lacks, which its boundary rules out: the trial's log gives `[]` for the rules of its default
branch, `404` "Branch not protected" and `404` "no analysis found", and says neither repository has a ruleset, as the
piece repeated. 2. Criteria 5 and 7 met in part with no entry under "Deviations": the reads of a ruleset and of an
alert's locations never ran, the endpoint of private reporting was not checked against GitHub's pages, and no answer
for "not readable" was seen. 3. Criterion 1's comparison was changed, from the last reading to the assessment's record
and the home's decision log, with no entry under "Deviations". 4. `services/github/README.md` contradicted itself on
the home's default branch: one paragraph said that only the backlog's account may push there, where the new section's
ruleset leaves direct pushes open to every account that can write.

The repeated check, of `6a008ff` (since `02e518b`): verdict `fail`, the four findings settled, two findings. 1.
`services/github/README.md`: the paragraph on the home restated two rules of the section on the protections, the
bypass list and the home's ruleset, so a rule stood in two places. 2. The record's log reduced the seventh security
review's first weak point to `checks/commits.mjs`, where the report places it also in the piece's sentence, which read
broader than that check.

The second repeated check, of `9b4599f` (since `6a008ff`): verdict `fail`, the two findings settled, one finding. The
record's log said that the first repeated check's two findings were each fixed in a commit of their own, where both
were fixed in `4c56e17`.

The third repeated check, of `cff6207` (since `9b4599f`):

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. The posture skill, its description, its steps in order, no service named, at most 4,500 characters: met. The diff
   since `9b4599f` is empty, so the criterion stands as the last check found it.
2. `honsha:assessment` reads the posture first and its own steps go: met, unchanged by this diff.
3. `honsha:review` reads the posture in each repository, puts what is urgent first, and names it in its description:
   met, unchanged by this diff.
4. `honsha:security-testing` points to the posture, its rules on the scan's findings are unchanged, and its
   description says when it applies: met, unchanged by this diff.
5. GitHub's piece covers the five protections, the token's default permissions and the three kinds of alerts, checked
   against GitHub's pages: met in the part that "Deviations" does not exclude (a ruleset's read and an alert's
   locations untried, no answer seen for "not readable"), unchanged by this diff.
6. The workflow, interface, architecture, README and budgets: met, unchanged by this diff.
7. The trial on both repositories, with each answer's form in the log: met in the part that "Deviations" does not
   exclude, as for criterion 5, unchanged by this diff.
8. Verify, the security review, the checker and the pipeline: verify passed at `cff6207` (Verification). The eighth
   security review passes at `9b4599f`, and `cff6207` changes only the record. This report passes. The pipeline on the
   pull request is not verifiable from here (Not verified).

- **Intent:** in order. The lines added since `9b4599f` (log lines 450-453, the Verification preamble and the summary
  of the second repeated check) quote nothing the person said.
- **Scope:** in order. The diff is empty, and `cff6207` touches only the record.
- **Comments and documents:** in order. The diff adds no comment and changes no document besides the record.
- **Gates:** in order. No gate is touched by this diff, since no file of the kit changes.
- **Verification evidence:** in order. Every `verify` command of `.hub/profile.yml` has a result at `cff6207`, as do
  the kit's `checks/record.mjs` and `checks/commits.mjs`. The profile lists no `dynamic-testing`, and the record says
  so. The `verify` list covers formatting (`prettier --check`), lint (`oxlint` with `correctness` and `suspicious`,
  `.oxlintrc.json`), types (`tsc -p .`) and tests (`node --test`). It covers no static security testing, and the
  profile has no comment saying why. No gate asks for it, so this is not a finding; the record puts the kit's own
  security testing out of scope (`261125-1850`).
- **Security review:** in order. The review was due for the branch. Verification holds reports one to eight. The
  findings of the first, second and third are confirmed fixed by the second, third and fourth. The log says what was
  done with each weak point, the eighth review's second left to the person. Since `9b4599f` only the record changed,
  and nothing triggers a review for it; the profile lists no `security-review` paths.
- **Record:** in order. The last report's finding is fixed. Log line 441 still says "each fixed in a commit of its
  own", as an append-only log must. Lines 450-452 correct it by a new line: "both in `4c56e17`". That matches the
  subjects of `4c56e17` ("Point the paragraph on the home to the section on the protections, and say that the check of
  commits reads no merge") and `9b4599f` ("Wrap the line of the home's paragraph that the last commit left too wide").
  The summary of the second repeated check under Verification matches its log line. The "15 commits" under
  Verification matches the branch's commits from `6404117` to `cff6207`.
- **Commits:** in order. `cff6207`, "Say that both findings of the first repeated check were fixed in one commit", is
  one imperative sentence. Its last paragraph holds `Work-Item: 261125-2038` and the co-author trailer with no blank
  line between them. Its author and committer addresses match the profile's `commits.address`. It is a fix asked by the
  checker, in a commit of its own.

**Findings**

none

**Not verified**

- Criterion 8's run of the kit's pipeline on the pull request. Nothing in the record shows the branch pushed or the
  pull request opened yet.
- Whether the home's live ruleset on GitHub matches what `services/github/README.md` describes. That is read on the
  service, not in the clone.

## Deviations

- Criterion 1, from the first two security reviews' weak points: a review commits nothing, so no reading of a review's
  is kept to compare with. The review compares with the assessment's record of the repository and with the person's
  answers in the home's decision log, a protection turned on as well as one declined, and names what neither holds. The
  reading keeps the repository's visibility, and a repository made public, or a setting or a protection that either has
  on and is now off or not read, is urgent. With it, two choices approved under "For the person" change: no account is
  on a ruleset's bypass list, in the home neither, since an account there passes every rule of the ruleset, and the
  home's ruleset holds only the refusals of forced pushes and deletion; and, from the third security review, the older
  branch protection counts for no protection, since its answer does not show who may force-push past it.
- Criteria 5 and 7, in part. Two reads of the piece are untried, a ruleset's bypass list with its checks and an alert's
  locations: neither repository of the trial had a ruleset or an alert, and making one would set something on the
  service, which the boundary rules out; the piece marks both untried. Every read ran as the administrator of both
  repositories, so the answers to an account that does not administer one were not seen: the piece reads
  `viewerPermission` first, and the posture then reads the clone alone.
- The boundary on what the record says, from the first check's finding 1: the trial's log says, by its answers, that
  the kit's own public repository has no rule or older protection in force on its default branch, no ruleset, and no
  analysis of code scanning. The commits from `7683fb6` hold it, and the branch only grows. GitHub shows anyone the
  first two without a token (Log), and the checks of the kit's pull requests show that code scanning does not run on
  them. Nothing of the home's protections is said beyond what GitHub gives every private repository of a free personal
  account. The person accepted it on 2026-11-26, in this item's session: the branch is pushed as it is.

## Outcome

An assessment and the periodic review read a repository's security posture with one skill, `honsha:security-posture`:
the scan of the history first, the kinds of security testing that its files call for, the pipeline's wiring and its
token, the hosting service's settings, the protections it gives free, each asked of the person and never turned on by
a session, and its open alerts, read with no secret's value. `honsha:assessment` and `honsha:review` invoke it in place
of their own steps, and `honsha:security-testing` keeps the rules of the scan's findings. A review compares with the
assessment's record and the person's answers in the home's decision log, and a repository made public, or a setting
or a protection turned off, is urgent. GitHub's piece says where GitHub gives each protection free, how the person
turns it on and how each is read: only the rules of the rulesets in force with an empty bypass list count, the home's
ruleset refuses only forced pushes and deletion, and the open alerts are read over every page. The skill holds 4,431
of a skill's 6,000 characters, so the later items' readings have room.

Left to the person: the weak points of the security reviews that the pull request lists; the reads of a ruleset's
bypass list and of an alert's locations, untried until a repository has one; the protections of the kit's own
repository. No check is deferred.
