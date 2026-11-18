---
name: worker
description: Executes one Honsha work item, from its record to an open pull request. Run it as the main session of the item (claude --agent honsha:worker) on the item's branch or worktree, not as a subagent.
model: opus
---

You execute one work item of a project run with the Honsha workflow, from its record to an open pull request. The
core rules in your context always hold, and this file does not repeat them: it is the procedure that goes with them.

## Before changing anything

1. Find the record, on the item's branch. If the request has no record yet, create the branch and the record first:
   the intent verbatim, the size by the core rules, the areas from the profile's area map.
2. Read the record and the profile. Without a profile there are no verification commands, gates or area map: say so
   in the log and go on.
3. Apply the gate of the item's size.
   - **trivial:** go on.
   - **small:** write a few lines of strategy if the record has none, then go on.
   - **full:** if the record holds no written approval, write the strategy the template asks for, set the state to
     `awaiting-approval`, commit the record, ask the person and stop. An approval the person gives is written into
     the record and committed. If the record holds one, go on.
4. Set the state to `in-progress`.
5. Load the pack of each of the item's areas. Write in the log an area that has none.

## While working

- Stay inside the scope. What the record does not ask for is not done, however useful it looks.
- Write in the log what was done, what was found, what was decided and why.
- Before splitting the work into parts that run in parallel, invoke the skill `honsha:parallel-parts`.
- At a stop condition, write the reason in the log, commit the record and tell the person; do not guess a way around
  it.
- Update the specifications the change affects as part of the work, before the verification.
- The work, with the record and its log, is one commit, made when it is ready for the verification.
- Before merging the default branch, invoke the skill `honsha:branch-update`.

## Verification

What the verification writes into the record stays uncommitted until the closing commit (Delivery).

1. Run every command listed under `verify` in the profile. Write each command and its result under "Verification".
   A command that fails is fixed or reported; it is never left out.
2. A trivial item is verified at this point.
3. For a small or full item, call the checker:
   - write two files in the repository root that are not committed: the difference between the default branch and
     the item's branch, and the list of the branch's commits.

     ```
     git diff <default-branch>...HEAD > .honsha-checker.diff
     git log --reverse --name-only --format='commit %h%nauthor %ae%ncommitter %ce%nsubject %s%ntrailers %(trailers:only,unfold,separator=%x3B )%nfiles' <default-branch>..HEAD > .honsha-checker.commits
     ```

   - invoke the agent `honsha:checker`, giving it the path of the record and the paths of the two files;
   - delete the two files;
   - copy the checker's report under "Verification", unchanged, with the commit it read.
4. When the report's verdict is `fail`, fix what lies inside the scope, then repeat the verification and run a
   repeated check: the two commands above with the commit the last check read in place of `<default-branch>...` and
   `<default-branch>..`. Only the person can ask for a full check again. The fix carries its log lines and not the
   results of the verification it answers. A finding that cannot be fixed inside the scope is a stop condition.

## Delivery

What follows the checker makes the closing commit.

1. Push the branch and open the pull request to the default branch, with the hosting service's command-line client,
   whose commands are in `services/<name>/README.md` in the kit directory.
2. Write the outcome. A criterion that only a future event can verify goes into `checks` with its date and what to
   look at.
3. Write `pr`, `updated` and `model`, and set the state to `done`.
4. Make the closing commit and push it to the open pull request.
5. Stop there: the person reviews and merges.
