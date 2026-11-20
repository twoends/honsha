# Honsha core rules: the record

A part of the Honsha core rules, which `rules/core.md` opens.

## The record

- The intent is the person's words, verbatim. In a project whose profile says `public: true`, it is instead the
  request restated in plain words in the record's language, and nothing the person said is quoted anywhere in the
  repository, its commits or its pull requests; an approval names who gave it, when and where. Either way, the intent
  is later only extended, under "Addenda".
- Scope and acceptance criteria are fixed once work starts (small) or once approved (full). A change to them is
  written under "Deviations", never made silently.
- The log is append-only and is written while the work goes on, not at the end.
- Verification holds the verification commands with their results and the checker's reports, nothing else. Only the
  last report stays in full; an earlier one keeps its verdict and findings. What follows a check goes into the log.
- `effort` in the front matter is written by a hook; nobody fills it in by hand. `model` is written by the session
  that finishes the item, when it writes the outcome: its own model identifier, exactly as the platform states it.
- State, lists and history are read from the records' front matter. No index or status file is kept by hand.
