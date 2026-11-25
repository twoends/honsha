---
name: parallel-parts
description: Use before splitting a work item's work into parts that run in parallel; before the hub starts a work item in a project where another one is open; when a worker asks the hub to change a file that another open item changes; and when one of two items that share a file is merged. It holds the test that decides whether work may run in parallel, what the hub tells the workers of items that run at once, the limits on how much may, and how the parts' worktrees and branches are made and merged back into the item's branch.
---

Work runs in parallel only when no part needs another part's result, no two parts change the same schema or
configuration, and each part can be verified on its own. Two parts may change one file only where their changes lie
apart: in different sections, paragraphs or functions, with lines that neither changes between them, so that git merges
them in either order without a conflict, and neither rewords, moves or relies on what the other changes. A file that a
tool writes whole, such as a lockfile or a generated file, is never shared. Parts that fail this test run in sequence.

**Parts of one request.** One request is one work item and one pull request, even when its parts could land
separately. Verification, the security review where it is due, and the checker run once, on the integrated result.

1. Run such parts in separate worktrees, each on a local branch cut from the tip of the item's branch and never
   pushed, named `work/<id>-<slug>.<part>`: git refuses a branch named below an existing one. Make each with
   `git worktree add -b <part's branch> <folder> HEAD` from the item's worktree, and give the part's agent its folder:
   a worktree that the platform makes for an agent starts from the default branch, without the item's commits. Each
   worktree is a new checkout, so `checks/verify.mjs --setup` runs in it before the part's first commit, as in the
   item's.
2. Merge the parts into the item's branch.
3. Remove their branches and worktrees.
4. Write in the log which parts ran in parallel and how they were integrated.

When the default branch must be merged, the skill `honsha:branch-update` says into which branch and when.

**Separate requests.** Each is its own work item, with its own worker, branch and pull request, open from its start
until its pull request is merged or it is dropped. Two open items of one project run at the same time when they pass
the test against each other; otherwise the later one waits. The hub decides, from their records and branches, before
it starts the later one and whenever a worker asks; in doubt, the later one waits.

- The brief of an item that starts while others are open in the project lists each of them with the files it changes,
  and asks the worker to stop and ask the hub before it changes one of those files or relies on another item's change.
- When the hub lets two items share a file, it tells the other item's worker if that item is still running, and the
  log of each running item names the other item, the file and the part of it that each changes. Once one of them is
  merged, the hub has the other brought up to date (`honsha:branch-update`) before its merge, since each was verified
  without the other's change. An item the hub refuses waits until the other is merged, then merges the default branch
  and goes on.
- A number that limits what items add, such as a budget, is shared although both change its line: each raises it by
  what its own change needs and says so in its record, and the one brought up to date sets it to what the two changes
  need together, which the merge's conflict or its verification shows.

**Limits.** `max-workers` in the home's settings caps the workers on a host; `parallel.max` in a project's profile caps
them in the project; `parallel.exclusive` there names the resources only one worker may use at a time, such as a test
database or a development server, and a worker that needs one waits its turn. Work beyond a limit is queued, not
dropped.
