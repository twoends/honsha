# Honsha core rules

This project is run with the Honsha workflow. Its core rules come in parts, each given whole when a session starts,
together with the record template: this one, on work items, sizes, stop conditions and lessons; `rules/records.md`,
on the record; `rules/git.md`, on commits, branches and delivery; and `rules/writing.md`, on comments and documents.
Together they hold in every session and are enough for ordinary work. For a case they do not cover, read
`docs/01-specs/WORKFLOW.md` in the kit directory, which the line above each part names; it lies outside the project,
so reading it can need a permission.

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

## Stop conditions

Work stops, the record's state becomes `blocked` and the person is told why, when:

- the intent or an acceptance criterion is ambiguous;
- a breaking change is required;
- security or permissions are unclear;
- the work conflicts with the documented architecture;
- the work goes beyond the scope;
- a case from the "always full" list appears in an item that was sized smaller.

## Lessons

When a tool is misused or the person corrects an approach, the correct action is written down as a short preventive
rule, with no history. A lesson about this repository goes into the file the profile names under `lessons`, in the
same pull request. A lesson about a technology or about the machine is reported to the person: it belongs outside
the project.
