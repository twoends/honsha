# Honsha core rules: comments and documents

A part of the Honsha core rules, which `rules/core.md` opens.

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
- Outside the kit, a document other than a record names the kit only by what the kit's interface lists
  (`docs/01-specs/INTERFACE.md` in the kit directory), and cites no section of the kit's documents but that
  interface's own headings.
