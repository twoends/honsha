# GitHub

This folder is the kit's piece for GitHub: everything that is specific to that hosting service, kept apart from the
rules. What a piece has to say is in [WORKFLOW.md](../../docs/01-specs/WORKFLOW.md), section 14. A user of another
service writes a piece like this one for it, next to this folder or outside the kit; the rules do not change either way.

Read in GitHub's documentation on 2026-11-17, and tried where it says so. GitHub changes what its plans include: check a
statement about plans or costs against GitHub's own pages before relying on it.

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
match the patterns in [merge-commands.json](merge-commands.json). Tried: `gh pr create`, `gh pr view` and `gh pr checks`.

## Settings the rules rely on

In the repository:

- **Merge commits only.** Merge commits are allowed; squash merging and rebase merging are switched off, so that a pull
  request cannot be merged in another way by mistake.
- **Head branches are deleted automatically** after a merge.
- **The default message of a merge commit is kept.** Its first line names the branch, and so the work item.

```
gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --delete-branch-on-merge
```

GitHub's documentation states no plan restriction for these settings.

Two things on the site are not used:

- **"Update branch" on a pull request.** A session merges the default branch into the work branch itself and runs the
  verification again (WORKFLOW.md, section 13.5). "Update with rebase" would also rewrite the branch.
- **Squash and rebase in the merge menu,** which the first setting removes.

In the account of whoever merges:

- **"Keep my email addresses private".** A merge made on the site is authored with the account's noreply address when it
  is on, and with the address chosen in the merge dialog when it is off. The committer of such a merge is GitHub itself.

## What GitHub can enforce

- **Protected branches and rulesets** are available in public repositories on the Free plan, and in public and private
  repositories with the Pro, Team and Enterprise plans.
- **With them,** the default branch can refuse direct pushes, forced pushes and deletion, also from administrators, and
  a check can be required before a merge.
- **Without them,** nothing on GitHub stops an account that can write to the repository from pushing to the default
  branch or from merging. The kit's guard is then the only stop, and it stops a mistake, not a session that was
  manipulated.
- **An identity that cannot merge.** In a repository owned by a personal account every other account is a collaborator,
  and a collaborator can merge. No permission of a token separates pushing a branch from merging a pull request: both
  need write access to the contents. In a repository owned by an organisation an account can have a role that reads but
  does not write, and pushes to a branch can be restricted to named accounts; the restriction needs a plan with
  protected branches for that repository.

## Checks on a pull request

The wiring is a workflow file. GitHub reads workflow files only from `.github/workflows/` in the repository, so the
kit's own is [verify.yml](../../.github/workflows/verify.yml): this piece applied to the kit's repository. It answers
the contract of WORKFLOW.md, section 14.2, in this way.

1. **When.** On the `pull_request` event for the default branch: when a pull request is opened and at every push to its
   branch. A newer run cancels an older one of the same pull request.
2. **What it runs.** `node checks/verify.mjs`, which runs the `verify` list of the profile. GitHub checks out the merge
   of the pull request with its base branch, so the commands test the merged result; the workflow does not run while the
   pull request has a conflict. The checkout fetches the whole history (`fetch-depth: 0`), which the check of the
   commits needs.
3. **What it gives the commands.** `HONSHA_BRANCH` from `github.head_ref`, `HONSHA_BASE` and `HONSHA_HEAD` from the base
   and head commits of the pull request.
4. **What it reports.** One result for each job, shown on the pull request and read with `gh pr checks`.
5. **What can block.** A failed job stops a merge only where a protected branch or a ruleset requires it. Elsewhere it
   is shown and nothing more.
6. **What it may not do.** The workflow's token has read access to the contents and nothing else. The actions it uses
   are pinned to a commit.

What it costs: on a private repository the minutes of GitHub's runners are counted against an amount the plan includes
each month, each job rounded up to a whole minute, and Windows minutes cost more than Linux ones. With no payment method
on the account, runs stop when the included amount is used. On a public repository the standard runners are free.

A template of this workflow for other projects is not written yet.
