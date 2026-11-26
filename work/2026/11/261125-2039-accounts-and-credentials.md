---
id: 261125-2039
title: Rule the accounts and credentials of an installation and of its projects
project: honsha
type: change
size: full
kind: capability
state: in-progress
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
SSDF, in the order it proposes. This is its fifth item.

The report found that the accounts through which an installation and its projects act, their credentials, and what a
session can reach are ruled nowhere and read nowhere. No rule asks for a second factor on an account that can write,
for a token that holds no more than its work needs and expires, for a credential that deploys to be kept from the runs
that a pull request starts, or for a credential to be replaced on a date and at once when it is exposed. Nothing lists
an installation's accounts, tokens, keys and hosts, and the connectors and plugins that reach its sessions, so nothing
reads them again on a date, and the host where the agent sessions develop the work is secured by no list of what those
sessions hold. No assessment reads who and what can write to a repository or read its pipeline's secrets. And a
provider that holds an installation's data or credentials is weighed in its radar entry for its cost, its exposure of
the data and its maturity, but not for its own security.

It proposed rules for the accounts and credentials of an installation and of its projects: a second factor on every
account that can write; each token with the narrowest scopes its work needs, and an expiry; a credential that deploys
only where the default branch's runs reach it, never where a pull request's run reads it; rotation on a date, and at
once when exposed; an inventory in the home of the accounts, tokens, keys, hosts, and the connectors and plugins that
reach the installation's sessions, by name and never by value; and a provider that holds an installation's data or
credentials weighed in its radar entry for its own security too, such as the second factor it offers, where it keeps
the data and its record of incidents, and read again by the review. The assessment would read a repository's
collaborators, deploy keys, secrets by name and environments, and the review the inventory's dates. It estimated the
item at 1.5 times a full item, since the reads of a service's access were untried, and placed it after the kit's own
security testing and before the home's inventory, which follows the rule this item writes.

## Scope and acceptance criteria

### In scope

- `skills/security-posture/SKILL.md`: a step that reads who and what can reach a repository, its collaborators and
  pending invitations, its deploy keys, its secrets by name and its environments, with the rules it reads them against
  and the home's inventory; what a reading keeps of it, and what the review finds urgent; its description.
- `skills/review/SKILL.md`: a step on the accounts and credentials of the installation and of its projects: what the
  home's inventory holds and where, the rules it is read against, its dates, the account and the token that the hosting
  service's client holds on the host, and the connectors and plugins that reach the sessions; its step on the radar,
  which weighs a provider's own security too; its description.
- `services/github/README.md`: the commands that read a repository's collaborators and invitations, its deploy keys,
  its secrets by name and its environments, and the account's second factor and the token's scopes and expiry, each
  printing no value, with their answers; where GitHub keeps a credential that deploys so that only the default
  branch's runs reach it, by visibility and plan; what the kit's commands need of the token that `gh` holds.
- `agents/security-reviewer.md`: a credential that deploys, given to a run that a pull request starts, among what it
  looks for under deploy and CI configuration.
- `docs/01-specs/WORKFLOW.md`: a section "Accounts and credentials" with the reasons; what "What the piece of a service
  says", "Security posture" and "Upkeep review" say of it. `docs/01-specs/INTERFACE.md`: the home's inventory among the
  files the kit reads. `docs/01-specs/ARCHITECTURE.md`: the inventory in the home's layout, and a point of "Security".
- `checks/budgets.test.mjs`: the workflow's budget, and the review's if its step does not fit a skill's.

### Out of scope

- A new skill, and any change to the worker's file, the README or the total of a session's start: the rules go where
  they are read (Strategy).
- The inventory and any of its entries: the home's item `261125-2040`, which follows the rule written here.
- Anything set on a service or a host: a second factor turned on, a token narrowed, created, replaced or revoked, a
  secret moved or set, a connector limited. Each is the person's.
- What follows a credential's exposure beyond its replacement, from its containment to a post-mortem (`261125-2041`);
  threats and a verification standard (`261125-2042`); personal data and logging (`261125-2043`); a deployed project's
  operations, its hosts and its backups (`261125-2044`); more kinds of security testing (`261125-2045`).
- The kit's own security testing (`261125-1850`) and the files it changes; a push run from inside a script, which the
  guard does not see; the weak points of `checks/history-secrets.mjs` and of the rule on outsiders' pull requests in
  GitHub's piece. Each is an item or an idea of its own.
- A repository's webhooks and the applications installed on it: a webhook's address can hold a secret, and an
  application is authorised by an account, not by one repository. The inventory's entry of an account holds the
  applications it authorised.
- A script that reads a service's access or the inventory: the readings are commands of the service's piece, run by
  the session, as the posture's other reads are.
- An assessment or a review run in this item.

### Boundaries

- Nothing breaks (interface, Changes to the interface): a file of the home is added; no name, command, key or file's
  shape that the interface lists changes.
- The rules name no hosting service: GitHub's places, plans and commands are in its piece.
- No value reaches a session: every command of the piece and of the trial prints names, roles, dates, scopes and
  booleans, never a secret's or a token's value; no command that shows a client's token is run. A session sets no
  value either.
- On the hosting service this item only reads. The trial runs the piece's read commands with the `gh` token of this
  host, on the repositories of the installation's registry, the kit's and the home's among them, and sets nothing. The
  record is public: it gives each answer by its form, and names no collaborator, key, secret, environment or account,
  nor what any repository holds or lacks. Beside the trial, only GitHub's public documentation is read.
- Nothing of this installation enters the kit.
- `261125-1850` runs at the same time and is expected to change `.hub/profile.yml`, `package.json`, `package-lock.json`,
  new tools' configuration files, the workflows of `.github/workflows/`, `checks/history-secrets.mjs` and `LESSONS.md`:
  this item changes none of them, and asks the hub before it would, or before it relies on a change of that item.
  `checks/budgets.test.mjs` may be shared: each line this item raises, it raises by what its own change needs, as the
  log says.

### Acceptance criteria

1. `honsha:security-posture` reads, in a step of its own, a repository's collaborators with their role and its pending
   invitations, its deploy keys and whether each writes, its secrets by name with where each is kept, and its
   environments with the branches whose runs enter each, never a value. It states what they are read against: a
   credential that deploys, or that writes outside the repository, is given only to the default branch's runs, never to
   a run that a pull request starts, and where the service cannot hold that for the repository it stays out of its
   pipeline; a deploy key writes only where its work writes; access that the home's inventory lacks is a finding. What a
   reading keeps holds them by name, and at the review access that neither the last reading nor the inventory holds is
   urgent. Its description names the step; it names no hosting service, and stays within 6,000 characters.
2. `honsha:review` holds, in a step of its own:
   1. the home's inventory, `inventory.md`: its entries of accounts, credentials, hosts, connectors and plugins of the
      installation and of its projects, what each holds, by name and never by value, and the date each is read again;
   2. what the inventory is read against: a second factor on every account that can write to a repository, a host, a
      project's data or its deployment, or that holds a credential, of the strongest kind the service offers; each
      credential with the narrowest scopes and reach that its work needs, and an expiry, or where the service gives
      none a date by which it is replaced, within a year, and within 90 days for one that a session can read; one that
      may have been exposed replaced at once, and the old one revoked, by the person; a connector or a plugin whose
      tools change a service's data reaching only the sessions whose work needs it, as the person chooses; no session
      reads, prints or sets a value;
   3. what it reports: each date that has passed or falls before the next review, with what its entry reaches; the
      account and the token that the hosting service's client holds on the host, against their entries; the connectors
      and plugins that its own session received, against theirs; without an inventory, the proposal of one.

   Its step on the radar weighs a provider that holds the installation's data or credentials for its own security too:
   the second factor it offers, the scopes and expiry its credentials can have, where it keeps the data, its record of
   incidents; a provider of the inventory with no radar entry is a finding. Its description names them. It names no
   hosting service, and stays within 6,000 characters unless its budget is raised with why.
3. GitHub's piece holds a command for each reading of criteria 1 and 2: collaborators, invitations, deploy keys, the
   secrets of Actions at the repository's, the organisation's and each environment's level, of Dependabot and of
   Codespaces, the environments and their branch policies, the account's second factor, and the token's scopes and
   expiry. Each prints no value, and comes with its answers for none, some, not given and not readable. It says where
   GitHub keeps a credential that deploys so that only the default branch's runs reach it, by visibility and plan, and
   what the rule asks where GitHub gives no such place; and what the kit's commands need of the token that `gh` holds.
   Each statement is checked against GitHub's pages, and each command is tried as criterion 6 says or marked untried.
4. The security reviewer's file names a credential that deploys, or that writes outside the repository, given to a run
   that a pull request starts.
5. The workflow gives the reasons in a section of its own, why the rules have no skill of their own among them, and its
   sections "What the piece of a service says", "Security posture" and "Upkeep review" say what criteria 1 to 3 make
   true; the interface names the inventory among the home's files; the architecture lists it in the home's layout and
   points to the rules from "Security"; each raised budget says why; the kit has no new skill; nothing in the kit
   contradicts the new rules.
6. The trial: each read command of the piece, on the repositories of the installation's registry. Each answers as the
   piece says, and none prints a value. The log gives each answer's form, and nothing of its content.
7. The profile's `verify` commands pass, the security review and the checker pass, and the kit's pipeline passes on the
   pull request.

## Strategy

**Why no skill of its own.** Each skill of the kit puts its description into every session of an installation, used or
not, and the worker's file names each one that an item invokes; each is one more place where a rule must stay in step.
A skill pays for that only where a work item applies its rules and no skill or agent it already receives reaches it.
These rules are applied by the person, on the services and the hosts, and read by the assessment and the review. The
one that a change must meet, a credential that deploys kept from a pull request's runs, is checked by the security
reviewer, which reads every change that touches secrets, permissions or the pipeline's configuration. So each rule goes
where it is read: a repository's access into the posture, which was written with room for it, beside its other reads;
the accounts, the credentials, what reaches the sessions, the inventory and the providers into the review, which reads
the home; the rule on a change into the reviewer's file; the commands into the service's piece; the reasons into the
workflow.

**The rules, and why.**

- A second factor on every account that can write to a repository, a host, a project's data or its deployment, or that
  holds a credential: a password alone is taken by phishing or by a leak. The strongest kind the service offers: a
  passkey or a security key, which a phishing page cannot replay; an authenticator app otherwise; a code by text message
  only where nothing else is offered, since a number moved to another card receives it. The person turns it on, the
  inventory says it is on, and the review reads it where the service shows it.
- The narrowest scopes and reach: a token can do whatever its scopes allow for as long as it is valid, and what reaches
  a session's context can steer the session to use the token it holds. So a token reaches only the repositories and
  resources of its work, with only the permissions that work needs; a scope that none of the kit's commands needs, such
  as one that deletes a repository, is not held.
- An expiry within a year, and within 90 days for a token that a session can read; where the service gives no expiry,
  as for a deploy key, a date in the inventory by which it is replaced: a leaked credential works until it expires. The
  review reads the dates, so that a credential is replaced before it stops the sessions that need it.
- A credential that deploys, or that writes outside the repository, given only to the default branch's runs: a run that
  a pull request starts executes the workflow files of its own branch, so whoever can push a branch, a session among
  them, could have it print or send the credential. Where the service cannot limit a credential to the default branch's
  runs, as on a private repository of a plan that gives no environments, the credential stays out of the pipeline, and
  the project deploys in another way, which its own item chooses. The posture reads it in every repository, and the
  security reviewer in every change of a workflow.
- A deploy key writes only where its work writes: a key has no account and no second factor, and one that writes can do
  much more than push.
- Replaced at once, and the old one revoked, when a credential may have been seen by anyone it was not given to: in a
  commit, a log, a transcript, a message, an alert of the service, or on a host that was lost or reached by someone
  else. The person replaces and revokes it; a secret found in a commit stays under the rule of
  `honsha:security-testing`.
- No value in a session: what a session reads stays in its transcript on the host, and what a pipeline prints in its
  log. So a session reads credentials by name, never prints or sets a value, and runs no command that prints one, such
  as one that shows a client's token; the person sets each value, on the service or on the host. The scan of the
  history and the reading of the service's alerts already hold this rule; it now holds for every reading.
- What reaches the sessions: the platform gives an installation's sessions connectors, plugins and servers whose tools
  can change other services, such as a database or a store, and a session steered by what it reads can use them. Each
  is in the inventory with what its tools can change; one whose tools change a service's data reaches only the sessions
  whose work needs it, where the platform can limit it, as the person chooses, and the inventory records the choice.
  Plugins and tools still enter only through a reviewed work item (architecture, Security).
- The architecture's points on data credentials, kept on the host outside any repository and given only to that
  project's sessions, and on deploy credentials, which are not on the host, stay as they are.

**The inventory.** One file of the home, `inventory.md` at its root, since the home is the installation's private
repository and its changes are work items like any other. It holds an entry for each account, credential, host,
connector and plugin of the installation and of its projects, by name and never by value:

- an account: the service, its name, who uses it, what it can write, its second factor, and the applications it
  authorised, with what they reach;
- a credential: its name as the service shows it, its kind, the account it belongs to, where it is kept, its scopes and
  reach, what uses it, its expiry or the date by which it is replaced, and when it was made;
- a host: its name, who reaches it and with which keys, and the credentials it holds;
- a connector or a plugin: its name, the sessions it reaches, what its tools can change, and the person's choice.

Each entry has the date it is read again, within a year, as a radar entry has its review date. It is Markdown, read by
the person and by the review, as the decision log is: no script reads it, so the kit fixes what it holds and not its
layout. The review's step holds that list, since the review is its reader, and the home's item that writes the
inventory reads it there. The review and the posture name what the inventory lacks, so a credential that an item of a
project adds reaches it at the next reading at the latest. The interface lists the file, since a skill of the kit reads
it.

**A provider.** A service that holds the installation's data or credentials, such as a hosting service, a model
provider, a database, a store, a domain's registrar or a host's provider, is a way in that no rule of the kit reaches.
Its radar entry weighs, beside its cost, its exposure of the data and its maturity: the second factor it offers its
accounts, and whether an account can be made to require one; the scopes and the expiry its credentials can have; where
it keeps the data; its record of incidents, and how it tells its users of one. The review's step on the radar reads it
on the entry's date, and a provider of the inventory with no radar entry is a finding.

**The readings.**

- The posture's new step, after the open alerts: the collaborators with their role, and the invitations pending; the
  deploy keys, and whether each writes; the secrets by name, with where each is kept, the repository, an environment or
  an organisation; the environments, with the branches whose runs enter each. Each against the rules above that concern
  a repository, and against the inventory: one that the inventory lacks, a key that writes where its work only reads,
  and a credential that deploys within reach of a pull request's run are findings, each with its item proposed. What a
  reading keeps holds the access by name, so that the review compares; access that neither the last reading nor the
  inventory holds came outside any work item, and is urgent.
- The review's new step, after the posture: what the inventory holds and the rules it is read against; the inventory's
  dates, each that has passed or falls before the next review named with what its entry reaches; the account and the
  token that the hosting service's client holds on the host, read as the piece says, against their entries; the
  connectors and plugins that the review's own session received, which it sees by their tools, against theirs. Its step
  on the radar weighs a provider's own security. Without an inventory, the review proposes one.
- The assessment reads the access through the posture, its first step, and needs no change.

**GitHub's piece.**

- A section on who and what can reach a repository, a command for each read, naming the `<owner>/<repository>` of the
  clone's remote as the piece's other reads do, with `--paginate`, and printing only names, roles, dates and booleans:
  the collaborators, with `affiliation=all`, and their `role_name`; the invitations; the deploy keys, without the public
  key; the secrets of Actions at the repository's level, the organisation's that reach it and each environment's, of
  Dependabot and of Codespaces, by name and date, since the API gives no value; the environments, with their deployment
  branch policy and their protection rules.
- Where a credential that deploys is kept: an environment's secret, with the environment's deployment branches limited
  to the default branch by name, so that the limit holds whatever protects the branch, and the deploying job naming the
  environment. Environments are given on a public repository on every plan and on a private one with Pro, Team or
  Enterprise; on a private repository of the free plan they are not, and any account with write access reads every
  secret of the repository, so there such a credential stays out of the pipeline. A deploy key that writes can do what
  GitHub says an organisation's administrator can, and has no expiry.
- A section on the account and its token: what the kit's commands need, as a classic token's scopes and as a
  fine-grained token's permissions; what `gh auth login` gets and when it lapses; the reads of the token's scopes and
  expiry, from the headers of a request to GitHub's API, and of the account's second factor, which GitHub shows only to
  a token that holds `read:user` or `user`, so that otherwise the person reads it on the site. GitHub requires a second
  factor of every account that contributes code.

**The documents and their budgets,** measured as characters:

- `skills/security-posture/SKILL.md`, at 4,431 of 6,000, takes about 900: about 5,350.
- `skills/review/SKILL.md`, at 4,457 of 6,000, takes about 1,500, for the inventory's list, the rules and the radar's
  provider: about 5,950. Where it passes 6,000, its budget rises by what it needs, since it holds what the home's
  inventory holds, which no other skill reads; the later items that extend the review raise it, or move a step, with
  their own reason.
- `docs/01-specs/WORKFLOW.md`, at 45,039 of 45,100, takes about 1,700 for the section's reasons and the piece's point: a
  budget of about 46,800.
- `agents/security-reviewer.md`, at 5,093 of 6,000, takes about 150; `docs/01-specs/INTERFACE.md`, at 7,041 of 9,000,
  about 200. GitHub's piece has no budget.
- The worker's file, the README and the total of a session's start do not change.

**The files.** Changed: `skills/security-posture/SKILL.md`, `skills/review/SKILL.md`, `services/github/README.md`,
`agents/security-reviewer.md`, `docs/01-specs/WORKFLOW.md`, `docs/01-specs/INTERFACE.md`,
`docs/01-specs/ARCHITECTURE.md` and `checks/budgets.test.mjs`. No new file. Eight existing files, beyond the three that
a capability is expected to touch: the rules land where each is read, and the measures will show it.

**Plan.** After the approval, a second lookup of GitHub's pages, on what the first left open (Log), runs in a subagent
on the light tier at medium effort, while this session runs the trial, reading by name only, and writes the steps of the
posture and of the review. Then GitHub's piece, from the lookup and the trial; then the reviewer's file, the workflow,
the interface, the architecture and the budgets. The change is not split into parallel parts (`honsha:parallel-parts`):
the posture, the review, the piece and the workflow say one thing in several places and rely on each other's wording.
Then the verification; the security review, due since the change rules permissions and secrets and how they are read,
where a value must never reach a transcript; the checker; the pull request and its checks, read as the workflow's rule
on pushes says; and the closing commit. The work runs on the strong tier at xhigh, as a full item does.

**How each criterion is shown.** 1 to 5: the files, read by the checker, and the budgets by their test. 6: the trial, in
the log. 7: the verification on this host, the reports, and the pull request's run.

**Assumptions,** from the first lookup or still open, which the second lookup and the trial check.

- On GitHub, any account with write access to a repository reads every secret of the repository, through a run of a
  branch it pushes; a run of a pull request from a fork receives none, and a run that Dependabot starts receives
  Dependabot's secrets alone. An environment's secrets reach only a job that names the environment and that its
  deployment branches let in.
- Environments are given on public repositories on every plan, and on private ones with Pro, Team or Enterprise, not on
  the free plan. Open: whether environment secrets and deployment branches have limits of their own on a private
  repository.
- The lists of secrets give names and dates and never a value; the list of deploy keys gives the public key, which the
  filter leaves out, whether the key writes, who added it and when it was last used.
- GitHub shows an account's second factor only to a token that holds `read:user` or `user`; it requires a second factor
  of every account that contributes code; it offers passkeys, security keys, authenticator apps, its mobile application
  and text messages, and advises an authenticator app over text messages.
- A token that `gh auth login` gets in the browser has no expiry, and GitHub revokes a token unused for a year; a classic
  personal access token may have no expiry, and a fine-grained one too unless an organisation sets a limit. A deploy
  key has no expiry.
- Open: whether the headers of an API response give a token's scopes and its expiry; the fine-grained permission that
  each read needs; whether `gh` runs the kit's commands with a fine-grained token, which its manual has given through
  `GH_TOKEN`.

**Risks.**

- A command that printed a value would put it in the transcript: every read names only fields that hold none, no
  command shows a token, and the security review reads them.
- The trial brings the names of the installation's collaborators, keys and secrets into this session's transcript, on
  this host: names only, which the rule allows; the record gives forms alone.
- An expiry adds work, and a token that expires stops the sessions that use it: the review names each date before it
  comes.
- Most of these rules rest on what the person does on a service, which no command of the kit enforces: the review reads
  them again, where a service shows them.
- A work item that adds a credential to a project reads none of these rules but the reviewer's: the posture and the
  review find at their next reading what it did otherwise, and the inventory takes it then.
- The posture and the review come close to a skill's budget, which the later items that extend them meet sooner.
- GitHub changes what it gives: the piece already says to check its statements against GitHub's pages.
- `261125-1850` may raise a line of `checks/budgets.test.mjs` too: each item raises it by what it needs, and the one
  brought up to date sets the sum.

**For the person.** Choices made here, each against an alternative:

- No skill of its own: the rules where they are read, in the posture, the review and the reviewer's file; not a skill
  `honsha:credentials`, which every session would pay for and few items would invoke.
- A year at most for any credential, and 90 days for a token that a session can read; not a year for every one. The
  shorter limit costs a token's replacement each quarter on each host.
- The inventory as one Markdown file, `inventory.md`, which the kit names by what it holds and not by its layout, each
  entry with a date to read it again; not a YAML file of fixed shape, which a script could read but whose layout would
  join the interface.
- Where a service cannot keep a credential that deploys from a pull request's runs, it stays out of the pipeline; not a
  repository's secret with the risk accepted.
- A session sets no value either: the person does.
- A repository's webhooks and the applications installed on it are not read; the inventory holds the applications that
  each account authorised.

## Approval

Approved by the person on 2026-11-26, in this item's session, as written in `c6f74cd`: the choices and the trial's
reads listed under "For the person" and "Boundaries" included.

## Log

- The hub gave the record from the home's backlog when it started the item; its intent is restated as the core rules
  ask of a public project, and the gaps of the report are stated by what they are. The branch was cut from
  `origin/main` at `287ce93` after `git fetch`, and its upstream removed, so that no push follows `origin/main` by
  default. `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is
  loaded.
- `node <kit directory>/checks/verify.mjs --setup` ran once in the worktree before the first commit:
  `npm ci --ignore-scripts` passed.
- The hub's brief names `261125-1850`, which runs at the same time, with the files it is expected to change; this item
  changes none of them, and `checks/budgets.test.mjs` may be shared.
- Read, as merged: the skills `honsha:security-posture`, `honsha:assessment`, `honsha:review` and
  `honsha:security-testing`; GitHub's piece; the workflow's sections on the rules' places, the hosting service, the
  guard, decisions, dependencies, the security review, the security testing, the security posture and the upkeep
  review; the interface; the architecture's layouts, flows, security, assumptions and open points; the files of the hub,
  the worker and the security reviewer; the profile's template; `checks/budgets.test.mjs`, `checks/interface.test.mjs`
  and the total of `hooks/hooks.test.mjs`; the record of `261125-2038`. In the home: this item's report, on the gaps it
  answers; the record of `261125-2040` in its backlog, which follows this one; two radar entries, for what an entry
  weighs today.
- Measured the documents: `skills/security-posture/SKILL.md` 4,431 characters, `skills/review/SKILL.md` 4,457,
  `docs/01-specs/WORKFLOW.md` 45,039 of 45,100, `agents/worker.md` 6,530 of 6,600, `agents/security-reviewer.md` 5,093
  of 6,000, `docs/01-specs/INTERFACE.md` 7,041 of 9,000.
- Applied the test of `honsha:parallel-parts`: the change is not split (Strategy, Plan).
- A lookup of GitHub's public documentation ran in a subagent on Haiku at medium effort, before the strategy. Found:
  free accounts configure environments only on public repositories, and Pro on private ones too; any user with write
  access to a repository reads all its secrets; a run from a fork receives no secret, and one that Dependabot starts
  only Dependabot's; the environments' list gives each environment's protection rules and deployment branch policy, to
  anyone who reads the repository; the lists of secrets give names and dates without the values; the list of deploy
  keys gives whether each reads only, who added it and when it was last used; the collaborators' list needs write
  access and gives each `role_name`; `two_factor_authentication` is in the authenticated account's answer with
  `read:user` or `user` alone; GitHub requires a second factor of every account that contributes code, and advises an
  authenticator app over text messages; OAuth tokens have no expiry and are revoked after a year unused; classic and
  fine-grained personal access tokens may have none; `gh`'s manual has a fine-grained token given through `GH_TOKEN`; a
  deploy key that writes can do what an organisation's administrator can. Left open: an explicit statement that a pull
  request's run from a branch of the repository receives its secrets; the plans of environment secrets and deployment
  branches; the headers that give a token's scopes and expiry; the permission each read needs, as a fine-grained
  token's; whether a deploy key can expire; the lists of Dependabot's and Codespaces' secrets.
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval, in this
  session.
- Before approving, the person asked whether a new skill was worth its cost: each puts its description into every
  session of the installation and is one more place to keep in step, and few items would invoke this one. The strategy
  is rewritten with no skill of its own: the repository's access in the posture, the accounts, the credentials, what
  reaches the sessions, the inventory and the providers in the review, the one rule that a change must meet in the
  security reviewer's file. The worker's file, the README and the total of a session's start no longer change. The
  first strategy is in commit `540660d`. The state stays `awaiting-approval`.
- The person approved the strategy (Approval); the state is `in-progress`.
- The hub lets `261125-1850` change, after its approval, one line in three files that this item changes too. In
  `docs/01-specs/INTERFACE.md`, `261125-1850` changes the paragraph of "Commands" that names the kit's other scripts,
  and this item the home's files under "Files". In `docs/01-specs/ARCHITECTURE.md`, `261125-1850` changes the kit's
  layout's `checks/` line, and this item the home's layout and "Security". In `services/github/README.md`,
  `261125-1850` changes the zizmor bullet of "Static testing of the workflows", and this item adds the reads of a
  repository's access and the account's token, in sections of their own. This item rewords and moves none of the lines
  of `261125-1850`. Once `261125-1850` is merged, the profile lists `skills/security-posture/SKILL.md` under
  `security-review`, whose review this item already calls for; whichever of the two merges second is brought up to date
  first (`honsha:branch-update`), as the hub says.
- The second lookup of GitHub's pages ran in a subagent on Haiku at medium effort. Found: on the free plan environment
  secrets are given on public repositories only, deployment branches on a private repository with Pro or Team, and
  required reviewers and wait timers on public repositories only on the free, Pro and Team plans; a deploy key has no
  expiry; `X-OAuth-Scopes` lists a token's scopes, and no page describes `GitHub-Authentication-Token-Expiration`;
  `gh`'s manual names `repo`, `read:org` and `gist` as the least scopes, has a fine-grained token given through
  `GH_TOKEN`, and has `--show-token` print the token; the `workflow` scope adds and updates workflow files; the list of
  Dependabot's secrets gives names and dates only. Left open: an explicit sentence that a pull request's run from a
  branch of the repository receives its secrets, where the security hardening page's statement that write access reads
  every secret stands for it; whether "Protected branches only" counts rulesets, which the piece sidesteps by naming
  the default branch; the fine-grained permission of each read, which the piece leaves untried.
- The trial ran each read command of the piece with this host's `gh` token on the three repositories of the
  installation's registry, one public and two private, all of a free personal account, through a script in the
  scratchpad that printed of each answer only its exit status, its number of lines, and the keys and types of its first
  line; the commands that take an environment's name ran for each environment the list gave. Nothing was set on the
  service. Each list answered exit 0 with a line per entry in its filter's shape, or with none; the secrets that an
  organisation shares answered `422` "Validation Failed" in each repository, as the piece says of a personal account's;
  the collaborators' list names the owner as `admin`; `gh auth status` printed the token masked and a line of scopes;
  `gh api -i user` gave `X-OAuth-Scopes` and `X-Accepted-OAuth-Scopes`, and `two_factor_authentication` `null`, as the
  piece says of a token without `read:user` or `user`. No command printed a value. The header of an expiry stays
  untried.
- Decided, from the lookups: the piece counts no limit of an environment on a private repository of the free plan,
  whatever the API lists there, since GitHub's pages give neither environment secrets nor deployment branches on it,
  and a rule rests on nothing that a service does not say it gives.
- Wrote the posture's step "Access" and its part of "What is kept", and the review's step "Accounts and credentials",
  with the list of what the inventory holds and the rules it is read against, and its radar step on a provider's own
  security; renumbered the review's later steps. Wrote GitHub's sections "Who and what can reach a repository", with
  "Where a credential that deploys is kept", and "The account and its token"; the security reviewer's line; the
  workflow's section "Accounts and credentials", the piece's ninth point and the changes to "Security posture" and
  "Upkeep review"; the inventory in the interface's "Files" and in the architecture's home and "Security". Prettier
  added a blank line in the review's step.
- Measured: `skills/security-posture/SKILL.md` 5,628 characters; `skills/review/SKILL.md` 6,676, so its budget is 6,700,
  with the reason beside the security testing's in `checks/budgets.test.mjs`, as the strategy foresaw;
  `docs/01-specs/WORKFLOW.md` 47,593, so its budget is 47,600: about 2,550 more, beyond the strategy's 1,700, for the
  section's reasons, the piece's ninth point and the two sections that name the new reading; written once and then
  rewritten shorter, with each reason kept. `agents/security-reviewer.md` 5,264, `docs/01-specs/INTERFACE.md` 7,264.
- The profile's `verify` commands pass on the work before its commit.
- The security review ran on `a1977ec`, in a subagent on Opus at its own effort: verdict `pass`, no finding, five weak
  points. Fixed, in GitHub's piece and the workflow: the first, that an environment's limit does not hold against a
  token that administers the repository, now said with the token that would keep it; the second, a private
  repository's setting that sends secrets to forks' pull requests, and the workflows on `pull_request_target` and
  `workflow_run`, which run the default branch's files with its secrets, now in the piece's premise, the setting named
  as not read; the fourth, an environment's name now encoded so that no character ends the quoted argument, and the
  free-text names read as data. Left to the person: the third, the applications installed on a repository and its
  webhooks, which the approved strategy leaves out (Out of scope), the inventory holding the applications each account
  authorised; the fifth, that the guard refuses no command that prints `gh`'s token, which only the rule forbids, a
  change to the guard and an idea of its own. The workflow's budget is 47,700, for the fixes' 91 characters.
- The repeated security review ran on `1f79820`, on the diff since `a1977ec`, in a subagent on Opus at its own effort:
  verdict `pass`, no finding, the three weak points confirmed fixed, and three more, left to the person. The first:
  where the host's token administers the repository, a session could widen an environment's branches and restore them
  between two readings, so the posture's reading is no check against it, and no rule says what follows; whether a
  session's token may administer a repository that holds a credential that deploys is a decision that the approved
  strategy does not take, and the person takes it, as the home's inventory records the token. The second: events that
  someone outside the repository can start, such as a comment, also run on the default branch's ref, and the private
  repository's setting that sends secrets to forks' runs is not read; a reading the approved strategy does not name, and
  untried. The third: the wording of the name's encoding leaves letters outside ASCII, characters of more than one
  byte and a name of dots loose, none of which ends the quoted argument.
- The checker read `1f79820`, in a subagent on Opus at its own effort: verdict `fail`, one finding, four prose lines
  past the 120 characters that the kit's documents wrap to and a paragraph not wrapped again, in the posture, the
  workflow and GitHub's piece, where an edit had joined two lines; Prettier, which preserves prose as written, does not
  see them. Fixed by wrapping the five paragraphs again, with no word changed. Its points not verified: GitHub's
  statements, which the two lookups read (Log); and whether the reads that take an environment's name ran, which the
  trial's entry says they did, for each environment the list gave.

## Verification

## Outcome
