---
name: parallel-parts
description: Use before splitting a work item's work into parts that run in parallel. It holds the test that decides whether parts may run in parallel, and how their worktrees and branches are made and merged back into the item's branch.
---

Split the work into parts that run in parallel only when no part needs another part's result, no two parts change the
same files, schema or configuration, and each part can be verified on its own. Parts that fail this test run in
sequence.

1. Run such parts in separate worktrees, each on a local branch cut from the tip of the item's branch and never
   pushed, named `work/<id>-<slug>.<part>`: git refuses a branch named below an existing one.
2. Merge the parts into the item's branch.
3. Remove their branches and worktrees.
4. Write in the log which parts ran in parallel and how they were integrated.

When the default branch must be merged, the skill `honsha:branch-update` says into which branch and when.
