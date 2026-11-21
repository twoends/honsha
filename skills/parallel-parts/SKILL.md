---
name: parallel-parts
description: Use before splitting a work item's work into parts that run in parallel, and before the hub starts a work item in a project where another one is running. It holds the test that decides whether work may run in parallel, the limits on how much may, and how the parts' worktrees and branches are made and merged back into the item's branch.
---

Work runs in parallel only when no part needs another part's result, no two parts change the same files, schema or
configuration, and each part can be verified on its own. Parts that fail this test run in sequence.

**Parts of one request.** One request is one work item and one pull request, even when its parts could land
separately. Verification and the checker run once, on the integrated result.

1. Run such parts in separate worktrees, each on a local branch cut from the tip of the item's branch and never
   pushed, named `work/<id>-<slug>.<part>`: git refuses a branch named below an existing one. Each worktree is a new
   checkout, so `checks/verify.mjs --setup` runs in it before the part's first commit, as in the item's.
2. Merge the parts into the item's branch.
3. Remove their branches and worktrees.
4. Write in the log which parts ran in parallel and how they were integrated.

When the default branch must be merged, the skill `honsha:branch-update` says into which branch and when.

**Separate requests.** Each is its own work item, with its own worker, branch and pull request. Two run at the same
time in one project when they pass the test against each other and their pull requests can be merged in either
order; otherwise the later one waits.

**Limits.** `max-workers` in the home's settings caps the workers on a host; `parallel.max` in a project's profile caps
them in the project; `parallel.exclusive` there names the resources only one worker may use at a time, such as a test
database or a development server, and a worker that needs one waits its turn. Work beyond a limit is queued, not
dropped.
