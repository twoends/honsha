---
name: security-review
description: Use at a work item's verification, whatever its size, when its change touches authentication, permissions or secrets, deploy or CI configuration, or the grants, roles and policies of a data schema, weakens the project's security testing, or changes a path that the profile lists under `security-review`. It holds how the security reviewer is run before the checker, where its report goes, and what a finding does to delivery.
---

The checker compares the work with its record and is no security audit. A change that touches what an attacker aims
at is also read by the security reviewer, `honsha:security-reviewer`: from a fresh context, with read-only tools, given
the change and not the worker's account of it.

**When.** The change touches authentication, permissions or secrets, deploy or CI configuration, or the grants, roles
and policies of a data schema: the cases of the always-full list (core rules, Sizes) that an attacker aims at. Or it
weakens the project's security testing (`honsha:security-testing`): it removes or narrows one of its commands or rules,
or silences one of its findings. Or it changes a file that matches a path under `security-review` in the profile: `checks/record.mjs` names those files when it
runs, and fails a `done` record that holds no review's report. Whatever the item's size. Elsewhere the review does not
run: it would cost time and tokens and find nothing.

1. After the verification's commands and before the checker, write the diff file as the worker writes it for the
   checker (`agents/worker.md`, Verification), without the record, and invoke the agent with its path and nothing
   else: no record, no strategy, no summary of the change.
2. Copy its report under "Verification", unchanged, with the commit it read, before any checker's report. Delete the
   diff file once the review and, for a small or full item, the checker have read it.
3. **A finding** fails the review, and the item is not delivered on it. Fix it inside the scope, in a commit of its
   own, repeat the verification, and run a repeated review: the diff since the commit the last review read, built as
   the worker builds a repeated check's, and the findings that the fix answers, which the agent confirms fixed. A
   finding that cannot be fixed inside the scope, or that you believe mistaken, is a stop condition: never set a
   finding aside on your own. A finding the person accepts is written under "Deviations", with who accepted it, when
   and where.
4. **A weak point** does not fail the review. Write in the log what was done with each: fixed, when the fix lies
   inside the scope, or left to the person, who reads it in the pull request.
5. **A later change** whose diff touches what the review guards, such as a fix that the checker or the person asks
   for, or a merge of the default branch with conflicts, gets a repeated review before its repeated check.
