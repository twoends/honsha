---
name: branch-update
description: Use when the default branch must be merged into a work item's branch, on a conflict, a need or a request. It holds the merge, when it may happen, and the verification and repeated check that follow it.
---

The default branch is merged only into the item's branch, before parts are split or after they are integrated, never
into the branch of a part. Never merge between a failed check and its repeated check.

1. Merge the default branch into the item's branch: `git fetch`, then `git merge origin/<default-branch>`, with the
   trailer on the merge commit. Do not use a button of the hosting service that updates the branch.
2. A conflict that cannot be resolved inside the scope is a stop condition.
3. Run the verification again and say so in the log. If a check has already run and the merge had conflicts, run a
   repeated check on the merge commit `<merge>`: the diff `git show --cc <merge>`, which holds only what the merge
   itself changed, and the list of commits with `<merge>^!` as the range. Where that diff touches what the security
   review guards, a repeated review reads it first (`honsha:security-review`).
