# Honsha core rules

This project is run with the Honsha workflow. These rules hold in every session of the project, whatever the task.
Together with the record template that follows them, they are enough for ordinary work. The full procedure is
`docs/01-specs/WORKFLOW.md` in the kit directory named after these rules. It is the reference for a case the rules
do not cover; the kit lies outside the project, so reading it can need a permission.

## Work items

- Every change to this repository is a work item with one record, `work/<yyyy>/<mm>/<id>-<slug>.md`, on a branch
  named `work/<id>-<slug>`. `<id>` is the creation time in UTC, `YYMMDD-HHMM`.
- A change starts only after its record exists. A request that has no record gets one first, from the template.
- The project's profile is `.hub/profile.yml`. It names the language of documents and records (English when it says
  nothing), the areas, the verification commands and the quality gates. Code, comments, commit messages and pull
  requests are in English in every project.

## Sizes

- **trivial**: one obvious change of a few lines, with no effect beyond what the intent states. No strategy.
- **small**: one concern, a few files, clear acceptance. A few lines of strategy, then the work continues.
- **full**: everything else. Always full, whatever the number of lines: a data schema change, a migration or a
  deletion of data; a new dependency or a major upgrade; authentication, permissions or secrets; deploy or CI
  configuration; a change to a public interface; anything ambiguous, or with more than one reasonable design;
  anything the profile adds to this list.
- A full item stops once its strategy is written: the record's state becomes `awaiting-approval` and the person is
  asked.
- Work that turns out larger than its size stops, takes the larger size and its gate, and gets a deviation.

## The record

- The intent is the person's words, verbatim. Later it is only extended, under "Addenda".
- Scope and acceptance criteria are fixed once work starts (small) or once approved (full). A change to them is
  written under "Deviations", never made silently.
- The log is append-only and is written while the work goes on, not at the end.
- Verification holds the verification commands with their results and the checker's reports, nothing else. Only the
  last report stays in full; an earlier one keeps its verdict and findings. What follows a check goes into the log.
- `effort` in the front matter is written by a hook; nobody fills it in by hand. `model` is written by the session
  that finishes the item, when it writes the outcome: its own model identifier, exactly as the platform states it.
- State, lists and history are read from the records' front matter. No index or status file is kept by hand.

## Commits and branches

- A commit message is one plain imperative sentence in English. It gets a body only when the reason is not in the
  record. A convention of the project's own is stated in the project's rules.
- Every commit on a work branch ends with the trailer `Work-Item: <id>`.
- An item makes as few commits as it can. Small or trivial: the work with its record, then one closing commit. Full:
  the record with its strategy, then its approval, two commits that hold only the record, since no other file changes
  before the approval is committed; then the work and one closing commit. The closing commit holds the verification,
  the checker's report, the outcome and the pull request's number together.
- The work is split into more than one commit only where its parts are separate enough to be reviewed one at a time.
  A stop, a merge of the default branch and a fix asked by the checker or the person are commits of their own.
- A work branch only grows: no amend, no rebase, no squash. A mistake is corrected by a new commit.
- A work branch is brought up to date only on a conflict, a need or a request, by merging the default branch into
  it. The verification commands and the checker then run again.

## Comments

In code and in every other file of the project:

- A comment says why, not what: the reason, a constraint, a trap. What the code does is read from the code.
- No history: no "changed for", no dates, no mention of earlier versions or of finished work items. History is in
  the records and in git.
- No code left commented out. Git keeps it.
- A TODO names the identifier of the record that will do it: `TODO(<id>): …`. A TODO without one is not written.

## Documents

- A document says what holds now. What a change replaces is deleted, not kept beside the new text with a note; an
  entry of a list that no longer holds is deleted, one that holds in part is rewritten, and the entry that deletes
  another may name its identifier once. An identifier is never reused. Git and the records keep the history.
  Exceptions: records, which follow their own rules; notes of a past discussion kept as such; documents listed under
  `legacy` in the profile.
- A rule is stated in one place; another document that needs it points there. The exception is an agent's file that
  must check a rule its agent does not otherwise receive. A record copies nothing that another document holds.

## Delivery

- The default branch changes only through pull requests, and the person merges them, with a merge commit unless the
  project's rules name another method. A session
  never merges, never pushes to the default branch and never force-pushes; a guard of the kit refuses those commands.
  A session that finds a merged branch deletes it, with its worktrees, locally and on the hosting service.
- The record travels in the same pull request as the change. The pull request's description comes from the record:
  intent, what changed, verification evidence, checker report, deviations.
- Before delivery the profile's verification commands run. For small and full items the checker, `honsha:checker`,
  then compares the result with the record from a fresh context.

## Stop conditions

Work stops, the record's state becomes `blocked` and the person is told why, when:

- the intent or an acceptance criterion is ambiguous;
- a breaking change is required;
- security or permissions are unclear;
- the work conflicts with the documented architecture;
- the work goes beyond the scope;
- a case from the "always full" list appears in an item that was sized smaller.

## Area packs

An area named in a record's `areas` can have a rule pack: the skill `honsha:area-<name>`. A session that works on
the item loads the pack of each of its areas before it changes anything. An area without a pack has no extra rules.

## Lessons

When a tool is misused or the person corrects an approach, the correct action is written down as a short preventive
rule, with no history. A lesson about this repository goes into the file the profile names under `lessons`, in the
same pull request. A lesson about a technology or about the machine is reported to the person: it belongs outside
the project.
