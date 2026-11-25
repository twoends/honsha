# Honsha core rules: commits, branches and delivery

A part of the Honsha core rules, which `rules/core.md` opens.

## Commits and branches

- A commit message is one plain imperative sentence in English. It gets a body only when the reason is not in the
  record. A convention of the project's own is stated in the project's rules.
- Every commit on a work branch ends with the trailer `Work-Item: <id>`, in the message's last paragraph together with
  the other trailers, such as the co-author's, and no blank line between them.
- An item makes as few commits as it can. Small or trivial: the work with its record, then one closing commit. Full:
  the record with its strategy, then its approval, two commits that hold only the record, since no other file changes
  before the approval is committed; then the work and one closing commit. An item that grows to full keeps the commits
  of its smaller size. The closing commit holds the verification with its reports, the outcome and the pull request's
  number together.
- The work is split into more than one commit only where its parts are separate enough to be reviewed one at a time.
  A stop, a merge of the default branch and a fix asked by the security reviewer, the checker or the person are
  commits of their own.
- A work branch only grows: no amend, no rebase, no squash. A mistake is corrected by a new commit.
- A work branch is brought up to date only on a conflict, a need or a request, by merging the default branch into
  it. The verification commands run again, and the checker on what changed.

## Delivery

- The default branch changes only through pull requests, and the person merges them, with a merge commit unless the
  project's rules name another method. The one exception: the kit's script `hub/backlog.mjs` pushes the records of the
  home's backlog there without a pull request, in commits that only add or remove one file under `backlog/`. A session
  never merges, never pushes to the default branch, never force-pushes and never skips a push's hooks; a guard of the
  kit refuses those commands.
  A session that finds a merged branch deletes it, with its worktrees, locally and on the hosting service.
- The record travels in the same pull request as the change. The pull request's description comes from the record:
  intent, what changed, verification evidence, the agents' reports, deviations.
- Before delivery the profile's verification commands run. Where `honsha:security-review` applies, at any size, the
  security reviewer then looks for holes in the change. For small and full items the checker, `honsha:checker`, then
  compares the result with the record from a fresh context.
- A work branch is pushed only with work that has passed those steps, and as seldom as its commits allow: the work,
  then the closing commit; a fix once verified and checked again, a line of the log never alone. The session then
  waits for the checks that the hosting service runs on the work, and never starts them again: a failure that comes
  from the change is fixed; one that does not is reported to the person, who decides, and nothing is pushed for it.
  Once they pass, the closing commit is pushed and its run is not waited for: it changes only the record, and the
  session has run on it the checks that read the record, the kit's checks of the record and of the commits and those
  of the verification commands that read it, such as a formatter.
