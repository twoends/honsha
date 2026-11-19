# GitHub

This folder is the kit's piece for GitHub: everything that is specific to that hosting service, kept apart from the
rules. What a piece has to say is in [WORKFLOW.md](../../docs/01-specs/WORKFLOW.md), section 14.

Everything here works with a free account: the kit asks no user for more. It is read in GitHub's documentation. Tried
on private repositories of a free account: `gh pr create`, `gh pr view --json number,state,mergedAt`, `gh pr checks`,
the repository settings and the alerts below.
GitHub changes what it offers: check a statement about what it gives or what it costs against GitHub's own pages
before relying on it.

## Commands

With `gh`, GitHub's command-line client.

| To                                         | Command                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Open a pull request to the default branch  | `gh pr create --base <default-branch> --title "<title>" --body-file <file>` |
| Read its number and its state              | `gh pr view --json number,state,mergedAt`                                   |
| Read the results of its checks             | `gh pr checks`                                                              |
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

The first command sets them; the second reads them, as an assessment does (WORKFLOW.md, section 20). A free account
has these settings.

Two things on the site are not used:

- **"Update branch" on a pull request.** A session merges the default branch into the work branch itself and runs the
  verification again (the core rules, "Commits and branches"). "Update with rebase" would also rewrite the branch.
- **Squash and rebase in the merge menu,** which the first setting removes.

For dependencies (WORKFLOW.md, section 17):

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

## Declaring the kit

Every repository that runs under the kit, the kit's own included, declares its marketplace from the kit's repository
on GitHub, in `.claude/settings.json` (architecture, section 3.1):

```json
{
  "extraKnownMarketplaces": {
    "honsha": {
      "source": { "source": "github", "repo": "<owner>/<repository of the kit>" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "honsha@honsha": true },
  "worktree": { "baseRef": "head" }
}
```

A private repository of the kit is read with the machine's git credentials, which `gh auth setup-git` sets. A host
whose registration of the marketplace comes from another source, such as a clone's folder, moves it once:

```
claude plugin marketplace add <owner>/<repository of the kit>
```

Tried with a private repository: the command replaces the registration for every project of the host, and says so.

## What GitHub enforces, and what it does not

- **In a private repository of a free account nothing on GitHub stops an account that can write** from pushing to the
  default branch or from merging: branch protection and rulesets are not there. The kit's guard is the stop
  (WORKFLOW.md, section 14.3).
- **Where a repository has branch protection or rulesets,** as a public one can, the default branch can refuse direct
  pushes, forced pushes and deletion, also from administrators, and a check can be required before a merge. The kit
  works the same with them: they add a stop on the server and change no rule. In the home, the account that the
  backlog's script pushes with must be allowed to push to the default branch (WORKFLOW.md, section 5.2), and nothing
  else may be.
- **An identity that cannot merge.** In a repository owned by a personal account every other account is a collaborator,
  and a collaborator can merge. No permission of a token separates pushing a branch from merging a pull request: both
  need write access to the contents. So there the hub's identity is kept from merging by the rules and by the guard,
  not by GitHub. In a repository owned by an organisation an account can have a role that reads but does not write.

## Checks on a pull request

The wiring is a workflow file. GitHub reads workflow files only from `.github/workflows/` in the repository, so the
kit's own is [verify.yml](../../.github/workflows/verify.yml): this piece applied to the kit's repository. It answers
the contract of WORKFLOW.md, section 14.2, in this way. `gh workflow list` lists the workflows a repository has.

1. **When.** On the `pull_request` event for the default branch: when a pull request is opened and at every push to its
   branch. A newer run cancels an older one of the same pull request.
2. **What it runs.** `node checks/verify.mjs`, which runs the `verify` list of the profile. GitHub checks out the merge
   of the pull request with its base branch, so the commands test the merged result; the workflow does not run while the
   pull request has a conflict. The checkout fetches the whole history (`fetch-depth: 0`), which the check of the
   commits needs.
3. **What it gives the commands.** `HONSHA_BRANCH` from `github.head_ref`, `HONSHA_BASE` and `HONSHA_HEAD` from the base
   and head commits of the pull request.
4. **What it reports.** One result for each job, shown on the pull request and read with `gh pr checks`.
5. **What can block.** A failed job stops a merge only where branch protection or a ruleset requires it. Elsewhere, and
   so in a private repository of a free account, it is shown and nothing more.
6. **What it may not do.** The workflow's token has read access to the contents and nothing else. The actions it uses
   are pinned to a commit.

What it costs: nothing on a free account, within a limit. On a private repository the minutes of GitHub's runners are
counted against an amount that the account has included each month, each job rounded up to a whole minute, and Windows
minutes count for more than Linux ones. With no payment method on the account, runs stop when that amount is used and
nothing is billed. On a public repository the standard runners are free.
