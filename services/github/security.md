# GitHub: what the security posture reads

What the security posture (`honsha:security-posture`), the review's step on accounts (`honsha:review`) and an item of
security testing (`honsha:security-testing`) read of GitHub; the rest of its piece is in [README.md](README.md). Tried
on a public and on private repositories of a free personal account, except where a read says it is untried.

## Reading a repository

Each command names the owner and the repository of the remote that the clone fetches from, not `{owner}/{repo}`, which
`gh` fills by its own rules and can take from another remote. First, what the repository is and what the account may do
there:

```
gh repo view <owner>/<repository> --json visibility,viewerPermission
```

With a `viewerPermission` other than `ADMIN`, GitHub hides some of what follows, so the posture reads the clone alone.

GitHub gives a list in pages, of 30 entries unless asked for more, and `gh api` reads one page unless `--paginate` has
it follow every page: each list below is read over every page, since an entry past the first would go unseen, and
anyone who can open an issue on a public repository can add alerts that push a real one there. A list prints a line for
each entry, and nothing, with exit status 0, where it is empty; a failure exits with another status, its message on the
error output, and is no answer. No command prints a secret's value.

## The protections it gives free

Each protection, where GitHub gives it at no cost, and its read. The person turns one on in the repository's settings,
on the site.

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

  The first lists the rules in force on the branch, each with its ruleset: `deletion`, `non_fast_forward`,
  `pull_request` and `required_status_checks` once all are on, `[]` with none, and `403` "Upgrade to GitHub Pro…"
  where GitHub gives no rulesets. A rule counts as on only where the second, read for each ruleset the first names,
  gives `active` and `bypass_actors` `[]`, and the required check only with the wiring's job among its `checks`;
  `null` in `bypass_actors` is not read, since GitHub shows the list only to an account that may change the ruleset.
  The second is untried. The older branch protection, under Settings, Branches, counts for none of these: its answer
  does not show the accounts that may force-push past it, so a repository that has only it is asked for the ruleset.

- **Secret scanning, with push protection,** which refuses a push that holds a secret it knows. Free on a public
  repository; on a private one it needs GitHub Secret Protection, which GitHub sells to organisations. Under Settings,
  Advanced Security.
  `gh api repos/<owner>/<repository> --jq .security_and_analysis` gives `secret_scanning` and
  `secret_scanning_push_protection`, each `enabled` or `disabled`, and prints nothing where GitHub does not offer them.
- **Code scanning,** with CodeQL's default setup. Free on a public repository; on a private one it needs GitHub Code
  Security, which GitHub sells to organisations. Under Settings, Advanced Security, CodeQL analysis, Default. It is
  never the required check, since its queries change by themselves (`honsha:security-testing`, The tools).
  `gh api repos/<owner>/<repository>/code-scanning/default-setup --jq .state` gives `configured` or `not-configured`,
  and `403` "Code scanning is not enabled for this repository" where GitHub does not offer it.
- **Private reporting of vulnerabilities,** which lets someone outside the project report a hole without making it
  public. Public repositories only. Under Settings, Advanced Security.
  `gh api repos/<owner>/<repository>/private-vulnerability-reporting` gives `{"enabled":true}` or `false`, and `404`
  on a private repository.

### The open alerts

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

Who and what can write to a repository or read its pipeline's secrets, by names, roles, dates and booleans only:

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

- **The collaborators,** each with its `role`: `admin`, `maintain`, `write`, `triage`, `read`, or an organisation's own
  role. `affiliation=all` takes in those who reach the repository through an organisation's teams, and lists the owner
  of a personal account's repository as `admin`. Then the invitations not yet accepted.
- **The deploy keys:** `read_only` is `false` for one that writes; `added_by` and `last_used` say who added it and when
  it was last used. A deploy key has no expiry.
- **The secrets,** by name and date: those of Actions at the repository's level; those an organisation shares with the
  repository, which answer `422` "Validation Failed" in a repository of a personal account, where there are none;
  those of Dependabot, which only the runs that Dependabot starts receive; those of Codespaces, which a codespace of the
  repository receives; and each environment's.
- **The environments:** `branches` is `null` where every branch's runs may enter, has `protected_branches` `true` where
  the protected branches' runs may, and `custom_branch_policies` `true` where those of the last command's branches and
  tags may, each by its `name` and `type`. `rules` names its protection rules, such as `branch_policy`,
  `required_reviewers` and `wait_timer`. An environment's name goes into the path with each byte of its UTF-8 form
  other than an ASCII letter, a digit, `-` and `_` written as `%` and two hexadecimal digits, so that no name can end
  the quoted argument or make `.` or `..` a step of the path. A key's title and an environment's name are written by
  whoever made them, and are read as data.

### Where a credential that deploys is kept

Any account that can write to a repository reads every secret of its level, through a run of a branch it pushes, a
pull request's included. A fork's pull request gets none, unless a private repository's settings send secrets to such
runs, which no read here covers, and a run that Dependabot starts gets Dependabot's alone; but a workflow on
`pull_request_target`, `workflow_run`, `issue_comment` or another event that someone outside the project can cause runs
the default branch's files with its secrets. So a credential that deploys, or that writes outside the repository, is an
environment's secret: its deployment branches are "Selected branches and tags" with the default branch by its name, and
only the job that deploys names the environment, in a workflow on `push` to the default branch, `workflow_dispatch` or
`schedule` alone. The limit stops an account that writes to the repository and does not administer it; one that
administers it can change the branches, so against a session the limit holds only where the host's token cannot
administer the repository, as a fine-grained token whose Administration and Environments permissions only read,
untried with `gh`, and the posture reads the branches at every reading. GitHub gives
environment secrets and deployment branches on a public repository on every plan, and on a private one with GitHub Pro,
Team or Enterprise; on the free plan's private repository its pages give neither, so the posture counts no such limit
there, whatever the API lists, and such a credential stays out of the pipeline. Required reviewers and wait timers are
given, below Enterprise, on public repositories only.

## The account and its token

`gh` keeps one token for the account it signs in on a host, and every session of the host uses it. The kit's commands
need it to push branches, workflow files among them, to open pull requests, and to read what this file and the README
read: by GitHub's pages a classic token does that with `repo`, `read:org` and `workflow`, and `gh`'s manual names
`repo`, `read:org` and `gist` as the least it takes, neither set tried alone. A scope beyond these, such as one that
deletes repositories, is none of the kit's. A fine-grained token, which `gh` takes through `GH_TOKEN`, reaches only the
repositories it names; the permissions that the kit's commands need of it are untried.

The token that `gh auth login` gets in the browser has no expiry. A personal access token has the expiry chosen when it
is made, possibly none, and GitHub revokes one unused for a year. The person makes it on the site, under Settings,
Developer settings, with the expiry the rules allow (`honsha:review`, Accounts and credentials), and gives it to `gh` as
`gh auth login` asks: a session never does, since the value would reach its transcript.

```
gh auth status
gh api -i user --jq '{login, two_factor_authentication}'
```

The first gives the account and the token's scopes, the token masked; `gh auth status --show-token` and `gh auth token`
print it whole, and are never run. The second gives the headers before the body: `X-OAuth-Scopes`, a classic or an
OAuth token's scopes, and for a token with an expiry `GitHub-Authentication-Token-Expiration`, untried. In the body,
`two_factor_authentication` is `true` or `false` for a token that holds `read:user` or `user`, which nothing else of
the kit needs, and `null` otherwise: the person then reads it on the site, under Settings, Password and authentication.
GitHub requires a second factor of every account that contributes code, and offers passkeys, security keys, an
authenticator app, GitHub Mobile and text messages.

## Static testing of the workflows

A project's pipeline configuration on GitHub is its workflow files, `.github/workflows/`, which its static security
testing reads (workflow, Security testing). Two free tools under the MIT licence read them, each run from the command
line on any host and in the pipeline:

- **zizmor** looks for the holes of a workflow: untrusted input in a script, permissions wider than needed, actions not
  pinned to a commit, credentials left in the checkout. With `--offline` it makes no request, and leaves out the few
  audits that read GitHub's API.
- **actionlint** checks a workflow's syntax and expressions, and runs ShellCheck on the scripts of its steps when
  ShellCheck is installed.

Both come as release binaries, among other forms.

GitHub's own scanners, its secret scanning and its code scanning, are further stops where GitHub gives them free (The
protections it gives free), and no part of the rules.

## The refs of the history

The scan of a repository's history (workflow, Security testing) reads every ref that a mirror clone takes. Beside the
branches, `refs/heads/`, and the tags, `refs/tags/`, GitHub serves for each pull request `refs/pull/<number>/head`, the
tip of its branch, and, while it is open, `refs/pull/<number>/merge`, the merge that GitHub tests. The `head` ref stays
after the branch is deleted and after the pull request is closed without a merge, so it keeps the branch's commits for
anyone who can read the repository: `git ls-remote origin 'refs/pull/*'` lists them. The namespace is read-only, and
only GitHub Support removes a pull request's refs. Anyone who can open a pull request adds one, from a fork too, which
any account can make of a public repository.
`gh api repos/<owner>/<repository>/pulls/<number> --jq .author_association`, with the owner and the repository of the
remote that the scan read, gives its author's tie to the repository: `OWNER`, `MEMBER` and `COLLABORATOR` are the
project's, and any other, such as `CONTRIBUTOR` or `NONE`, is someone outside it. Whether the branch lived in a fork
tells nothing of who wrote it.

What GitHub keeps beyond any ref, no clone and no scan reaches:

- a commit that no branch holds any longer is still shown by its hash in GitHub's cached views, and through the pull
  requests that reference it;
- the repositories of a fork network share their git data, so a commit pushed to one can be read through another, the
  upstream included; and a fork keeps its copy whatever the upstream does.

So a secret that reached GitHub is revoked first, as GitHub's guide to removing sensitive data advises. A rewritten
history removes it from the branches; GitHub Support, given the pull requests concerned and the first commit changed,
then removes the cached views and the pull requests' refs, once no fork references the data. A fork's owner removes it
from the fork, and no one from the clones that hold it.
