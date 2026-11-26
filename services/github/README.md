# GitHub

This folder is the kit's piece for GitHub: everything that is specific to that hosting service, kept apart from the
rules. What a piece has to say is the contract in [the workflow](../../docs/01-specs/WORKFLOW.md) (workflow, The hosting
service).

Everything here works with a free account: the kit asks no user for more. It is read in GitHub's documentation. Tried
on private repositories of a free account: `gh pr create`, `gh pr view --json number,state,mergedAt`, `gh pr checks`,
the repository settings and the alerts below. The reads of the protections and of the open alerts were tried on a
public and on a private repository of a free personal account, and those of a repository's access and of the
account's token on a public and on private repositories of such an account, except where they say they are untried.
GitHub changes what it offers: check a statement about what it gives or what it costs against GitHub's own pages
before relying on it.

## Commands

With `gh`, GitHub's command-line client.

| To                                         | Command                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Open a pull request to the default branch  | `gh pr create --base <default-branch> --title "<title>" --body-file <file>` |
| Read its number and its state              | `gh pr view --json number,state,mergedAt`                                   |
| Read the results of its checks             | `gh pr checks`                                                              |
| Wait until its checks finish               | `gh pr checks --watch`                                                      |
| See who merged it, and with which commit   | `gh pr view <number> --json mergedBy,mergeCommit`                           |
| Delete a merged branch that is still there | `git push origin --delete <branch>`                                         |

The person merges, on the site or with `gh pr merge --merge`. A session never does: the guard refuses the commands that
match the patterns in [merge-commands.json](merge-commands.json).

## Settings the rules rely on

In the repository:

- **Merge commits only.** Merge commits are allowed; squash merging and rebase merging are switched off, so that a pull
  request cannot be merged in another way by mistake.
- **Head branches are deleted automatically** after a merge.
- **The default message of a merge commit is kept.** Its first line names the branch, and so the work item.

```
gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --delete-branch-on-merge
gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge
```

The first command sets them; the second reads them, as the security posture does (`honsha:security-posture`). A free
account has these settings.

Two things on the site are not used:

- **"Update branch" on a pull request.** A session merges the default branch into the work branch itself and runs the
  verification again (the core rules, "Commits and branches"). "Update with rebase" would also rewrite the branch.
- **Squash and rebase in the merge menu,** which the first setting removes.

For dependencies (workflow, Dependencies):

- **Dependabot alerts on,** as the further stop between reviews. GitHub reports a dependency with a known
  vulnerability on the repository, and notifies as the account's notification settings say. The package manager's own
  report, such as `npm audit`, stays the check that works on any service.
- **Dependabot security updates and version updates off,** and no `.github/dependabot.yml`: their pull requests carry
  no record and no `Work-Item` trailer.

```
gh api -X PUT repos/<owner>/<repository>/vulnerability-alerts
gh api -i repos/<owner>/<repository>/vulnerability-alerts
```

The first command turns the alerts on; the second answers `204` when they are on and `404` when they are off. A free
account has them on private repositories.

In the account of whoever merges:

- **"Keep my email addresses private".** A merge made on the site is authored with the account's noreply address when it
  is on, and with the address chosen in the merge dialog when it is off. The committer of such a merge is GitHub itself.

## Installing the kit

Each host installs the plugin once, for the user that runs the installation's sessions, from the kit's repository on
GitHub (architecture, Kit); no project holds a file for it:

```
claude plugin marketplace add <owner>/<repository of the kit> --scope user
claude plugin install honsha@honsha --scope user
```

Claude Code asks for the plugin's setting `home` when the plugin is enabled, and keeps it under `pluginConfigs` in the
user's settings. A marketplace other than the official one is not updated automatically until it is set to be: in
`/plugin`, under Marketplaces, or with `"autoUpdate": true` on its entry under `extraKnownMarketplaces` in the user's
settings, `~/.claude/settings.json`.

A private repository of the kit is read with the machine's git credentials, which `gh auth setup-git` sets. A host
whose registration of the marketplace comes from another source, such as a clone's folder, moves it once with the
first command. Tried without `--scope` with a private repository: the command replaces the registration for every
project of the host, and says so.

## What GitHub enforces, and what it does not

- **In a private repository of a free account nothing on GitHub stops an account that can write** from pushing to the
  default branch or from merging: branch protection and rulesets are not there. The kit's guard is the stop
  (workflow, The guard).
- **Where a repository has branch protection or rulesets,** as a public one can, the default branch can refuse direct
  pushes, forced pushes and deletion, also from administrators, and a check can be required before a merge. The kit
  works the same with them: they add a stop on the server and change no rule. In the home, the account that the
  backlog's script pushes with must be able to push to the default branch (workflow, The backlog), so GitHub lets any
  account that can write push there, whatever its ruleset holds: the guard stops a session's mistake, and the check of
  the commits on each push to the default branch fails on a direct commit that is not the backlog's, though not on a
  merge, which it takes for a pull request's. Which of them GitHub gives free, what the home's ruleset holds, and how
  they are read, is below (The protections it gives free).
- **An identity that cannot merge.** In a repository owned by a personal account every other account is a collaborator,
  and a collaborator can merge. No permission of a token separates pushing a branch from merging a pull request: both
  need write access to the contents. So there the hub's identity is kept from merging by the rules and by the guard,
  not by GitHub. In a repository owned by an organisation an account can have a role that reads but does not write.

## The protections it gives free

The security posture (`honsha:security-posture`) reads each protection below, and asks the person for each one that is
off where GitHub gives it at no cost. The person turns it on, in the repository's settings on the site; a session never
does. The commands name the owner and the repository of the remote that the clone fetches from, not `{owner}/{repo}`,
which `gh` fills by its own rules and can take from another remote. First, what the repository is and what the account
may do there:

```
gh repo view <owner>/<repository> --json visibility,viewerPermission
```

With a `viewerPermission` other than `ADMIN`, GitHub hides some of what follows, so the posture reads the clone alone.

- **A default branch that refuses direct and forced pushes and its deletion.** Free on a public repository on every
  plan; on a private one with GitHub Pro for a personal account, or GitHub Team for an organisation. Under Settings,
  Rules, Rulesets: a branch ruleset on the default branch, active, with "Restrict deletions", "Block force pushes" and
  "Require a pull request before merging" with no approval required, since the person merges pull requests that nobody
  else reviews. No account is on the ruleset's bypass list, since an account there passes every rule of the ruleset. In
  the home, whose default branch takes the backlog's direct commits, the ruleset holds the first two rules only: the
  third would refuse those commits, and a required check could too.
- **A required check:** in the same ruleset, "Require status checks to pass" with the wiring's job, as `gh pr checks`
  names it, `checks / checks` for a project's file and `project / checks` in the kit, without "Require branches to be
  up to date before merging": the kit merges the default branch into a work branch only on a conflict, a need or a
  request (core rules, Commits and branches). It holds back a change that fails its checks, not a hostile one: a pull
  request runs the workflow file of its own branch, so one that changes the wiring can report the check as passed, and
  the person reads such a change before the merge.

  ```
  gh api repos/<owner>/<repository>/rules/branches/<default branch> --jq 'map({type, ruleset_id})'
  gh api repos/<owner>/<repository>/rulesets/<ruleset id> --jq '{enforcement, bypass_actors, checks: [.rules[]? | select(.type == "required_status_checks") | .parameters.required_status_checks[].context]}'
  ```

  The first lists the rules in force on the branch, each with the ruleset that holds it: `deletion`,
  `non_fast_forward`, `pull_request` and `required_status_checks` once all are on, and `[]` with none; where GitHub
  does not give rulesets, `403` "Upgrade to GitHub Pro or make this repository public to enable this feature". A rule
  counts as on only where the second, read for each ruleset that the first names, gives `active` and `bypass_actors`
  `[]`, and the required check only with the wiring's job among that ruleset's `checks`; `null` in `bypass_actors` is
  not read, since GitHub shows the list only to an account that may change the ruleset. The second is untried. The
  older branch protection, under Settings, Branches, counts for none of these, though GitHub enforces it: its answer,
  `GET repos/<owner>/<repository>/branches/<default branch>/protection`, does not show the accounts that may force-push
  past it, so a repository that has only the older protection is asked for the ruleset.

- **Secret scanning, with push protection,** which refuses a push that holds a secret it knows. Free on a public
  repository; on a private one it needs GitHub Secret Protection, which GitHub sells to organisations on Team or
  Enterprise Cloud, and a personal account's private repository has neither. Under Settings, Advanced Security.
  `gh api repos/<owner>/<repository> --jq .security_and_analysis` gives `secret_scanning` and
  `secret_scanning_push_protection`, each `enabled` or `disabled`, and prints nothing where GitHub does not offer them.
- **Code scanning,** with CodeQL's default setup. Free on a public repository; on a private one it needs GitHub Code
  Security, which GitHub sells to organisations. Under Settings, Advanced Security, CodeQL analysis, Default. It is
  never the required check: its queries are GitHub's, updated regularly, and default setup pins none in the repository,
  so a check on it can fail on code that did not change (`honsha:security-testing`, The tools).
  `gh api repos/<owner>/<repository>/code-scanning/default-setup --jq .state` gives `configured` or `not-configured`,
  and `403` "Code scanning is not enabled for this repository" where GitHub does not offer it.
- **Private reporting of vulnerabilities,** which lets someone outside the project report a hole without making it
  public. Public repositories only. Under Settings, Advanced Security.
  `gh api repos/<owner>/<repository>/private-vulnerability-reporting` gives `{"enabled":true}` or `false`, and `404`
  on a private repository.

### The open alerts

Each command prints a line for each open alert, and nothing with exit status 0 when there is none; a failure exits
with another status, its message on the error output, and is no answer. GitHub gives a list in pages, of 30
alerts unless asked for more, and `gh api` reads one page unless `--paginate` has it follow every page: read without
it, the alerts past the first page would go unseen, and anyone who can open an issue on a public repository can push a
real alert there with strings that only look like secrets.

```
gh api --paginate 'repos/<owner>/<repository>/dependabot/alerts?state=open&per_page=100' --jq '.[] | {number, package: .dependency.package.name, severity: .security_advisory.severity, advisory: .security_advisory.ghsa_id, fixed: .security_vulnerability.first_patched_version.identifier}'
gh api --paginate 'repos/<owner>/<repository>/secret-scanning/alerts?state=open&hide_secret=true&per_page=100' --jq '.[] | {number, secret_type, validity, publicly_leaked}'
gh api --paginate 'repos/<owner>/<repository>/code-scanning/alerts?state=open&per_page=100' --jq '.[] | {number, rule: .rule.id, severity: .rule.security_severity_level, path: .most_recent_instance.location.path}'
```

GitHub gives each alert on a secret with the secret's value unless `hide_secret=true` asks it not to, and the filter
prints only the fields it names, so neither alone lets a value through: an alert on a secret is never read into a
session in another way. Where one is, without its value, untried:

```
gh api --paginate 'repos/<owner>/<repository>/secret-scanning/alerts/<number>/locations?per_page=100' --jq '.[] | {type, path: .details.path, line: .details.start_line, commit: .details.commit_sha}'
```

Secret scanning also reads a public repository's issues, pull requests, discussions and wiki, where no clone reaches;
the location's `type` names them. The alerts on secrets answer `404` "Secret scanning is disabled on this repository"
where scanning is off or not offered; those on code answer `404` "no analysis found" where code scanning is offered
and has not run, and `403` where it is not offered.

## Who and what can reach a repository

The security posture reads, in each repository, who and what can write to it or read its pipeline's secrets
(`honsha:security-posture`). As for the protections, the commands name the owner and the repository of the clone's
remote, and an account whose `viewerPermission` is not `ADMIN` leaves them to the clone alone. Each reads every page
and prints a line for each entry, with names, roles, dates and booleans only, and nothing, with exit status 0, where
the list is empty; GitHub gives no secret's value in any of them. A failure exits with another status, its message on
the error output, and is no answer.

```
gh api --paginate 'repos/<owner>/<repository>/collaborators?affiliation=all&per_page=100' --jq '.[] | {login, role: .role_name}'
gh api --paginate 'repos/<owner>/<repository>/invitations?per_page=100' --jq '.[] | {invitee: .invitee.login, permissions, created_at}'
gh api --paginate 'repos/<owner>/<repository>/keys?per_page=100' --jq '.[] | {id, title, read_only, added_by, created_at, last_used}'
gh api --paginate 'repos/<owner>/<repository>/actions/secrets?per_page=100' --jq '.secrets[] | {name, updated_at}'
gh api --paginate 'repos/<owner>/<repository>/actions/organization-secrets?per_page=100' --jq '.secrets[] | {name, updated_at}'
gh api --paginate 'repos/<owner>/<repository>/dependabot/secrets?per_page=100' --jq '.secrets[] | {name, updated_at}'
gh api --paginate 'repos/<owner>/<repository>/codespaces/secrets?per_page=100' --jq '.secrets[] | {name, updated_at}'
gh api --paginate 'repos/<owner>/<repository>/environments?per_page=100' --jq '.environments[] | {name, branches: .deployment_branch_policy, rules: [.protection_rules[]?.type]}'
gh api --paginate 'repos/<owner>/<repository>/environments/<environment>/secrets?per_page=100' --jq '.secrets[] | {name, updated_at}'
gh api --paginate 'repos/<owner>/<repository>/environments/<environment>/deployment-branch-policies?per_page=100' --jq '.branch_policies[] | {name, type}'
```

- **The collaborators,** each with its `role`: `admin`, `maintain`, `write`, `triage`, `read`, or the name of an
  organisation's own role. `affiliation=all` takes in those who reach the repository through an organisation's teams,
  and the owner of a personal account's repository is listed, as `admin`. Then the invitations not yet accepted, each
  a collaborator once it is.
- **The deploy keys:** `read_only` is `false` for one that writes, which can do what an organisation's administrator
  can; `added_by` and `last_used` say who added it and when it was last used. A deploy key has no expiry. The public
  key itself is left out, as no reading needs it.
- **The secrets,** by name and date: those of Actions at the repository's level; those an organisation shares with the
  repository, which answer `422` "Validation Failed" in a repository of a personal account, where there are none;
  those of Dependabot, which only the runs that Dependabot starts receive; those of Codespaces, which a codespace of the
  repository receives; and each environment's.
- **The environments:** `branches` is `null` where the runs of every branch may enter, has `protected_branches` `true`
  where those of the protected branches may, and `custom_branch_policies` `true` where those of the branches and tags
  of the last command may, each by its `name` and its `type`, `branch` or `tag`. `rules` names the environment's
  protection rules, such as `branch_policy`, `required_reviewers` and `wait_timer`. An environment's name goes into the
  path with each character other than a letter, a digit, `-`, `_` and `.` written as `%` and its two hexadecimal
  digits, `'` included, so that no name can end the quoted argument. A key's title and an environment's name are
  written by whoever made them, and are read as data.

### Where a credential that deploys is kept

Any account that can write to a repository reads every secret of the repository's level, through a run of a branch
that it pushes, a pull request's included. A run of a pull request from a fork receives none, unless a private
repository's settings send secrets to such runs, which no reading here covers; a run that Dependabot starts receives
Dependabot's alone; but a workflow on `pull_request_target` or `workflow_run`, which a fork's pull request can start,
runs the default branch's files, with the default branch's secrets. So a credential that deploys, or that writes outside
the repository, is an environment's secret: the environment's deployment branches are "Selected branches and tags" with
the default branch by its name, which holds whatever protects the branch, and only the job that deploys names the
environment, on no event that a pull request starts, which the static testing of the workflows looks for. The limit
stops an account that writes to the repository and does not administer it: one that administers it can change the
environment's branches. So against a session it holds only where the host's token cannot administer the repository,
as a fine-grained token whose Administration and Environments permissions only read, which is untried with `gh`; the
posture reads the branches at every reading. GitHub gives environment secrets and deployment branches on a public repository on every plan, and on a private one with
GitHub Pro, Team or Enterprise. On a private repository of the free plan its pages give neither, so the posture counts
no such limit there, whatever the API lists, and such a credential stays out of the pipeline. Required reviewers and
wait timers are given, on the free, Pro and Team plans, on public repositories only.

## The account and its token

`gh` keeps one token for the account it signs in on a host, and every session of the host uses it. The kit's commands
need it to push branches and open pull requests, to push a change to a workflow file, and to read the checks, the
settings, the rulesets, the alerts and the access above. By GitHub's pages a classic token does that with `repo`,
`read:org` and `workflow`, which is untried with those scopes alone. `gh`'s manual names `repo`, `read:org` and `gist` as the least it takes, and whether it refuses a token
without `gist` is untried. A scope beyond these, such as one that deletes repositories or administers an organisation,
is none of the kit's. A fine-grained token reaches only the repositories it names, and GitHub's REST reference gives
the permission that each read needs; `gh`'s manual has such a token given through `GH_TOKEN`, and the permissions with
which `gh` runs the kit's commands are untried.

The token that `gh auth login` gets in the browser has no expiry. A personal access token, classic or fine-grained,
has the expiry chosen when it is made, and may have none unless an organisation sets a limit; GitHub revokes a token
unused for a year. The person makes one on the site, under Settings, Developer settings, with the expiry that the rules
allow (`honsha:review`, Accounts and credentials), and gives it to `gh` on the host as `gh auth login` asks: a session
never does, since the value would reach its transcript.

```
gh auth status
gh api -i user --jq '{login, two_factor_authentication}'
```

The first gives the account and the token's scopes, with the token masked; `gh auth status --show-token` and
`gh auth token` print it whole, and are never run. The second gives the answer's headers before its body:
`X-OAuth-Scopes` lists the scopes of a classic or an OAuth token, and a token with an expiry is answered with
`GitHub-Authentication-Token-Expiration` too, which the pages of GitHub's documentation do not describe and which is
untried. In the body, `two_factor_authentication` is `true` or `false` for a token that holds `read:user` or `user`,
which nothing else of the kit needs, and `null` otherwise: the person then reads it on the site, under Settings,
Password and authentication.

GitHub requires a second factor of every account that contributes code. It offers passkeys, security keys, an
authenticator app, GitHub Mobile and text messages, and advises an authenticator app over text messages. In an
organisation, its owners can require a second factor of its members, and
`gh api --paginate 'orgs/<organisation>/members?filter=2fa_disabled&per_page=100' --jq '.[].login'` lists, to an owner
alone, those who have none; untried.

## Checks on pull requests and on the default branch

The wiring is a workflow file. GitHub reads workflow files only from `.github/workflows/` in each repository, so a
project holds a short file of its own that calls the kit's reusable workflow,
[project.yml](../../.github/workflows/project.yml), which does the work. The kit's own wiring is
[verify.yml](../../.github/workflows/verify.yml), on the same two events as a project's file: one job runs the kit's
profile on Linux and on Windows, another calls project.yml on the kit itself, so that a change to it runs on the kit's
pull request before it reaches a project, and its path for a push runs at each merge of the kit, and a third checks
the commits for personal content (below). `gh workflow list` lists the workflows a repository has.

A project's file, `.github/workflows/checks.yml`, with its own default branch and the kit's repository and default
branch in place of the placeholders:

```yaml
name: checks
on:
  pull_request:
    branches: [<default branch>]
  push:
    branches: [<default branch>]
permissions:
  contents: read
  actions: read
concurrency:
  group: checks-${{ github.event.pull_request.number || github.sha }}
  cancel-in-progress: true
jobs:
  checks:
    uses: <owner>/<repository of the kit>/.github/workflows/project.yml@<default branch of the kit>
```

For what the runner needs beyond Node.js 26 and the npm it carries, the job adds `with:` and, under it, a line for each
input:

- `claude-code: "<version>"`, for a profile that runs `claude`, as the kit's does with `claude plugin validate .`:
  Claude Code, installed after the setup.
- `npm: "<version>"`, for a project that asks another npm, as one whose `package.json` asks npm 12 in `devEngines`,
  which npm checks at the setup's first `npm ci`: that npm, installed before the setup. The version is an exact one
  that `devEngines` allows.

`actions: read` lets project.yml read whether the run on a pull request's earlier tip passed, before it leaves a
project's verification out of a push that changes only records (below). A file without it keeps working, and every
push of its pull requests runs everything. project.yml names no permission of its own: a called workflow may only keep
or lower what its caller grants, and one that named `actions: read` would ask more than such a file grants. The
caller's `permissions` is so the one limit of the token, and a file without it would give the token the repository's
default permissions.

GitHub lets a workflow of a private or a public repository call a reusable workflow of a public one, as long as the
caller's Actions settings allow reusable workflows, which they do by default. project.yml checks out the kit with the
caller's own token, which reads its own repository and any public one but no other private one: a project calls it
from a public repository of the kit, and the kit calls it from its own repository whatever its visibility.

It answers the contract for the checks (workflow, Checks on pull requests and on the default branch) in this way.

1. **When.** In a project's file and in the kit's alike, on the `pull_request` event for the default branch: when a pull
   request is opened and at every push to its branch. A newer run cancels an older one of the same pull request. And on
   the `push` event for the default branch: the group of such a run is its commit, so no push cancels another, since
   each run checks only what its push added.
2. **What it runs.** project.yml checks out the project in `project/` and, beside it in `kit/`, the kit at the commit
   project.yml was read from, which is the kit's default branch for a project and, for the kit, the pull request or the
   pushed commit itself.
   On Linux, with Node.js 26 and the npm the caller names, if any, it prepares the checkout with the kit's
   `checks/verify.mjs --setup`, which runs the `setup` list of the profile and installs nothing when the profile has
   none, then runs from `project/` the kit's `checks/record.mjs`, on a pull request only, and `checks/commits.mjs`,
   `hub/projects.mjs check` where the project holds a `registry.yml`, `checks/verify.mjs`, which runs the `verify`
   list of the profile, and, once it passes, `checks/verify.mjs --dynamic`, which runs the `dynamic-testing` list and
   passes at once when the profile has none. The runner has Docker with Docker Compose, which those commands can use
   to start the instance and its scanner. The kit's first job runs `node checks/verify.mjs --setup` and
   `node checks/verify.mjs` alone, as its profile lists the kit's checks, and at every push: the kit's repository is
   public, where its runs cost nothing. GitHub checks out the merge of the pull request with its base branch, so the
   commands test the merged result, and the workflow does not run while the pull request has a conflict; on a push it
   checks out the pushed commit. The checkout fetches the whole history (`fetch-depth: 0`), which the check of the
   commits needs.
   On a push to a pull request's branch, project.yml first runs the kit's `checks/changes.mjs` on the commits that the
   push added, from `github.event.before`, the branch's tip before the push, to `HONSHA_HEAD`. When they change only
   records, [runs.mjs](runs.mjs) reads from GitHub's API, with the run's token, the latest run of the same workflow on
   that earlier tip, from the same branch of the same repository. When that run passed, project.yml skips the steps
   that install npm, run the setup and install Claude Code, and the two that run `checks/verify.mjs`; a notice on the
   run says so, and the kit's checks run. A run that skipped them passed only after such a run on its own earlier tip,
   so a chain of them goes back to a run that checked the code. Everything runs otherwise: at the opening of a pull
   request, whose event has no earlier tip; after a run that failed, was cancelled, still goes or never ran, as for a
   pull request retargeted to the default branch; for a pull request from a fork; for a token without `actions: read`;
   on any failure of either script; and at every push to the default branch.
3. **What it gives the commands.** project.yml, and the kit's file for its own jobs, set `HONSHA_BRANCH` from
   `github.head_ref`, `HONSHA_BASE` and `HONSHA_HEAD` from the base and head commits of the pull request. On a push,
   `github.ref_name`, `github.event.before` and `github.sha`.
4. **What it reports.** One result for each job, shown on the pull request and read with `gh pr checks`, or, for a push,
   on the commit and read with `gh run list --branch <default branch>`.
5. **What can block.** A failed job stops a merge only where branch protection or a ruleset requires it. Elsewhere, and
   so in a private repository of a free account, it is shown and nothing more.
6. **What it may not do.** The workflow's token has read access to the contents and to the runs of Actions, and
   nothing else: the caller grants no more. The actions take the token as an input; of the steps that run commands,
   only the one that reads the earlier run gets it, in its environment, before any of the project's commands runs.
   Code that runs in the job can still read it from the runner's memory, so what the token may do is what the whole job
   may do. The checkouts leave no token in the git configuration. The actions are pinned to a commit. A workflow that
   names no `permissions`, as a project's own may, gets the repository's default for the token, set under Settings,
   Actions, General, Workflow permissions, on every plan:
   `gh api repos/<owner>/<repository>/actions/permissions/workflow` gives `default_workflow_permissions`, `read` for
   the setting that reads only, and `can_approve_pull_request_reviews`, `false` when the token cannot approve a pull
   request.

The kit's third job, `personal content`, is its own and no part of the contract: the kit's repository is public, and
the kit's hook checks a push only in a clone that has it (the kit's README). On Linux it runs
`node checks/pushed.mjs --range`, which checks each commit from `HONSHA_BASE` to `HONSHA_HEAD` for the e-mail addresses,
the paths into a user's folder and the links to a Claude Code session that `checks/public.mjs` finds, and lets through
the addresses that the profile's `commits.address` allows. It names the commit, the file and the line, never what it
found. So it reads what a clone without the hook, or a push that skipped it, sent, and on a push the merges, which
GitHub writes and no clone's hook sees. It does not look for the name of the machine's user, as the hook does: on a
runner the system's user is the runner's, not whoever made the commits. It finds content once the commits are on the
public branch: a finding shows before the merge, and taking it out of the history is the person's.

What it costs: nothing on a free account, within a limit. On a private repository the minutes of GitHub's runners are
counted against an amount that the account has included each month, each job rounded up to a whole minute, and Windows
minutes count for more than Linux ones. A run of project.yml is one Linux job, counted to the account that owns the
calling project; on a later push that changes only records, after a run that passed, it holds the checkouts, the read
of that run and the kit's checks alone, and counts as one minute while they take less. A project's dynamic testing adds
to every other run the minutes that the pull of its images, the start of its instance and its scan take. With no
payment method on the account, runs stop when that amount is used and nothing is billed. On a public repository the
standard runners are free.

A project's own workflows, such as its application's checks, are the project's: this wiring does not reach them, and
they run at every push they are wired for, which the rule on pushes (core rules, Delivery) keeps few.

## Static testing of the workflows

A project's pipeline configuration on GitHub is its workflow files, `.github/workflows/`, which its static security
testing reads (workflow, Security testing). Two free tools under the MIT licence read them, each run from the command
line on any host and in the pipeline:

- **zizmor** looks for the holes of a workflow: untrusted input in a script, permissions wider than needed, actions not
  pinned to a commit, credentials left in the checkout. It comes as a Python package, a Rust crate and a container
  image. With `--offline` it makes no request, and leaves out the few audits that read GitHub's API.
- **actionlint** checks a workflow's syntax and expressions, and runs ShellCheck on the scripts of its steps when
  ShellCheck is installed. It comes as release binaries and a container image.

GitHub's own scanners, its secret scanning and its code scanning, are further stops where GitHub gives them free (The
protections it gives free), and no part of the rules.

## The refs of the history

The scan of a repository's history (workflow, Security testing) reads every ref that a mirror clone takes. Beside the
branches, `refs/heads/`, and the tags, `refs/tags/`, GitHub serves for each pull request `refs/pull/<number>/head`, the
tip of its branch, and, while it is open, `refs/pull/<number>/merge`, the merge that GitHub tests. The `head` ref stays
after the branch is deleted and after the pull request is closed without a merge, so it keeps the branch's commits for
anyone who can read the repository: `git ls-remote origin 'refs/pull/*'` lists them. The namespace is read-only, and
only GitHub Support removes a pull request's refs. Anyone who can open a pull request adds one, from a fork too, which
any account can make of a public repository. `gh api repos/{owner}/{repo}/pulls/<number> --jq .author_association`
gives its author's tie to the repository: `OWNER`, `MEMBER` and `COLLABORATOR` are the project's, and any other, such as
`CONTRIBUTOR` or `NONE`, is someone outside it. Whether the branch lived in a fork tells nothing of who wrote it.

What GitHub keeps beyond any ref, no clone and no scan reaches:

- a commit that no branch holds any longer is still shown by its hash in GitHub's cached views, and through the pull
  requests that reference it;
- the repositories of a fork network share their git data, so a commit pushed to one can be read through another, the
  upstream included; and a fork keeps its copy whatever the upstream does.

So a secret that reached GitHub is revoked first, as GitHub's guide to removing sensitive data advises. A rewritten
history removes it from the branches; then GitHub Support, given the pull requests concerned and the first commit
changed, removes the cached views and the pull requests' refs, once no fork references the data. A fork's owner removes
it from the fork, and no one removes it from the clones that hold it.
