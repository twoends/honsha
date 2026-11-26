---
id: 261126-2214
title: Keep the kit's documents to what is built, and drop the profile's keys that nothing reads
project: honsha
type: change
size: full
kind: upkeep
state: done
areas: []
created: 2026-11-26
updated: 2026-11-27
requested-by: person
source: null
pr: 66
model: claude-opus-5-5
effort: xhigh
checks: []
---

## Intent

The person asked, on 2026-11-26 in the hub's session, after a critical review of what the workflow costs in practice,
to simplify the kit where it can be done without losing value. This item takes the documents.

The review found that the kit's documents describe parts that do not exist, which every session that reads them takes
for real: `docs/01-specs/ARCHITECTURE.md` names a board and its generator, a reader agent, an inbox, skills for a
workflow, triage, a radar and a status, templates for an inbox item and a radar entry, an index, a scheduler and hosts
of their own, and `docs/00-vision/VISION.md` and `README.md` lean on some of them. It found too that the profile's
template, `templates/profile.yml`, holds keys that no script reads, `data`, `playbooks` and `legacy` among them, the
last at odds with the rule that a project's earlier documents are deleted rather than kept.

Proposed, for the strategy to weigh: each document says what is built and how it is used; what is planned and not
built leaves the kit's documents, since a plan of the kit is no rule of it; each key of the profile that nothing reads,
in scripts, skills, agents or rules, leaves the template and the kit's own profile, checked one by one before it goes.

## Scope and acceptance criteria

### In scope

- `docs/01-specs/ARCHITECTURE.md`: its key facts, components and diagram, the layout lines of the kit other than
  `hooks/`, `checks/`, `hub/` and `services/`, the home's and the project's layouts, "Files and index", the flows,
  "Native first", "Security", the assumptions and the open design points, each kept to what is built.
- `docs/00-vision/VISION.md`: its key facts, the problem, what it does, its principles and its glossary, kept to what
  is built.
- `README.md`: its opening and its list of documents; the rows of scripts and the paragraph on checking a change are
  not this item's.
- `templates/profile.yml` and `.hub/profile.yml`: the keys that nothing reads leave them.
- `docs/01-specs/WORKFLOW.md`: the passages on the keys that leave and on parts that are not built.

### Out of scope

- The home: its documents that cite an identifier this item deletes, its profile's keys, its plan. Each is the home's
  own item; nothing of the kit's plan moves there in this one.
- Building any part the documents stop naming.
- `checks/profile.mjs` and its test: no dropped key is refused (Strategy, The interface).
- What the review of the documents turns up beyond parts that are not built and keys that nothing reads, which the
  log names for the hub: the README's requirements count a session of the desktop application with the kit installed
  among what is not tried, which may no longer hold; the README's table has no row for `hub/`, which is among the rows
  of scripts; with the reader gone from the documents, no rule of the kit says how a session treats untrusted content.
- `docs/01-specs/INTERFACE.md`: no file, template or command goes, and its "Templates" and "Files" name no key.

### Boundaries

- Files of the other two open items, `261126-2213` and `261126-2215`, change only with the hub's leave, asked before
  the work (Strategy, Asked of the hub). One refused becomes a deviation, and its reference is named to the item that
  owns the file.
- Lines that another open item may also change: in the workflow, the key fact on the home and step 8 of "Procedure";
  in the architecture, the flow "Dispatch" and the rules of "Files" on the records' folders and the backlog, which
  describe the path of a work item (`261126-2213`); the layout's line of skills, the README's row of skills and the
  vision's line on the periodic review, which name skills that `261126-2215` may merge or rename. Whichever item merges
  second brings them in line (`honsha:parallel-parts`).
- `checks/budgets.test.mjs`: this item changes no line of it; every document it changes shrinks.
- The record is public: it names nothing that an installation holds.
- The breaking parts (Strategy, The interface) are approved with this strategy, or the item stops there.

### Acceptance criteria

1. The architecture names no part that the kit lacks: no board or board generator, no reader, no inbox, no skill of a
   workflow, a triage, a radar or a status, no template of an inbox item or a radar entry, no index, no scheduler, no
   messaging channel or allowlist of senders, no `hosts.yml`, no setting of `settings.yml` beside `max-workers` and
   `models`, no data source or playbook, no always-on host. Each component, layout line, flow, point of security,
   assumption and open point it keeps is a part that the kit holds, or that the home holds and a script, a skill, an
   agent's file or a rule of the kit reads or writes. Its flows are those the kit runs: ask, dispatch, joining and the
   periodic review.
2. Of the architecture's identifiers, A5 and O10 stay; A1, A2, A3, A8, A9, O02, O06 and O07 are deleted, and none is
   reused. The architecture's and the README's examples of an identifier name ones that exist.
3. "Files and index" is renamed "Files", and every reference to it in the kit names the new heading.
4. The vision describes the hub, the kit and the home as built: no evaluation of what is sent, no inbox or its
   verdicts, no board, no messaging channel, no always-on host, no reader, no data sources. Its glossary defines no
   term for a part that is not built, and "Verdict" is the checker's and the security reviewer's.
5. The README's opening says what the hub does as built, and its list of documents names the architecture's sections
   as they are.
6. `templates/profile.yml` and `.hub/profile.yml` hold no `description`, `merge-deploys`, `data` or `playbooks`, and no
   `legacy` if the approval drops it. Every key the template keeps has a reader in a script, a skill, an agent's file or
   a rule, which the log names key by key. `checks/profile.mjs` and its test are unchanged and pass.
7. The workflow names no inbox, no verdict of an inbox, no scheduler that runs the deferred checks and no
   `merge-deploys`. If `legacy` is dropped, no document of the kit names it as a key of the profile, and the workflow,
   the architecture, the core rules and `honsha:assessment` say that a project's earlier workflow documents are deleted
   once its adoption no longer reads them.
8. Each reference that the change leaves wrong in a file of another open item is changed here with the hub's leave, or
   named to the hub for that item; none is left wrong in silence.
9. The outcome and the pull request say, for each breaking part, what an installation changes.
10. Every verification command of the profile passes.

## Strategy

**What the documents name that is not there.** Each part below was looked for as a file or folder of the kit (`ls` of
the root, `agents/`, `skills/`, `templates/`), and by name in every file of `agents/`, `rules/`, `skills/`, `hooks/`,
`hub/`, `checks/`, `services/`, `templates/`, `.hub/`, `.claude-plugin/` and `.github/`, outside `work/`.

| Part named                                       | Where                                                 | What the kit holds                                                                                |
| ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Board, its generator, `board/`                   | architecture, vision                                  | Nothing                                                                                           |
| Reader agent                                     | architecture, vision                                  | No `agents/reader.md`; no file names one                                                          |
| Inbox, its items and verdicts; Evaluate          | architecture, vision, workflow, record's front matter | Nothing writes or reads one; `agents/hub.md` has no Evaluate                                      |
| Skills of a workflow, triage, a radar, a status  | architecture                                          | None in `skills/`                                                                                 |
| Templates of an inbox item and of a radar entry  | architecture                                          | `templates/` holds the record and the profile                                                     |
| Index, SQLite                                    | architecture, vision                                  | Nothing; `agents/hub.md` answers from the records, pull requests and measures                     |
| Scheduler, timed runs, proactive research        | architecture, workflow                                | Nothing; `agents/hub.md` and `honsha:review` say what holds until an installation has one         |
| Messaging, Channels, allowlisted senders, voice  | architecture, vision                                  | Nothing                                                                                           |
| `hosts.yml`; quiet period and notification rules | architecture                                          | Nothing reads them; the kit reads `max-workers` and `models` of `settings.yml` (interface, Files) |
| Always-on Linux host                             | architecture, vision                                  | The kit is tried on Windows 11 (README); nothing in it needs such a host                          |
| Data sources, playbooks, operations questions    | architecture, vision, template                        | Nothing reads them                                                                                |
| Background sessions read as JSON (A3)            | architecture                                          | The hub starts each worker's session in a worktree; no state is read as JSON                      |

What is built and stays: the hub, the workers, the checker and the security reviewer; the hooks and the scripts; the
home's registry, settings, decision log, inventory, backlog, radar, lessons and reports, each read or written by a
script, a skill or an agent's file of the kit, the radar by `honsha:review` at its entries' dates.

**The profile's keys,** each searched by name in the same places and in the workflow:

| Key                                  | Read by                                                                                        | Kept        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------- |
| `name`                               | `hub/projects.mjs`, for the home's name                                                        | yes         |
| `description`                        | nothing                                                                                        | no          |
| `language`                           | `rules/core.md`, `agents/security-reviewer.md`                                                 | yes         |
| `stack`                              | `checks/profile.mjs`, `hooks/lessons.mjs`                                                      | yes         |
| `default-branch`                     | `checks/profile.mjs`, the guard and the checks                                                 | yes         |
| `merge-deploys`                      | nothing; the workflow's "Procedure" restates it                                                | no          |
| `public`                             | `checks/profile.mjs`, `rules/records.md`, `agents/checker.md`                                  | yes         |
| `areas`                              | `rules/core.md`, `agents/worker.md`, `agents/hub.md`                                           | yes         |
| `verify`, `setup`, `dynamic-testing` | `checks/profile.mjs`, `checks/verify.mjs`, `agents/worker.md`, `agents/checker.md`             | yes         |
| `gates`                              | `agents/checker.md`, `rules/core.md`                                                           | yes         |
| `always-full`                        | `rules/core.md`, `agents/checker.md`                                                           | yes         |
| `security-review`                    | `checks/profile.mjs`, `checks/record.mjs`, `honsha:security-review`, the reviewer, the checker | yes         |
| `kinds`, `commits`, `lessons`        | `checks/profile.mjs` and the scripts that use it                                               | yes         |
| `parallel`                           | `honsha:parallel-parts`                                                                        | yes         |
| `data`, `playbooks`                  | nothing                                                                                        | no          |
| `legacy`                             | `rules/writing.md` (Documents), `honsha:assessment`                                            | as approved |

**The open choice: `legacy`.** It is read by a rule and a skill, so the intent's own test keeps it. But the kit holds
no rule that a project's earlier documents are deleted: its rule on documents says that what a change replaces is
deleted because git keeps it, and names `legacy` as the exception. An earlier workflow document kept unchanged in a
project is what any session there can take for a rule. Recommended: drop it, and with it the exception in
`rules/writing.md`, so that `honsha:assessment` proposes, for a project's earlier workflow documents, an item that
deletes them once the adoption no longer reads them. The other choice keeps `legacy` and its rule, and this item
changes neither.

**The interface.** `templates/profile.yml` is in the interface, and so are the identifiers `A<n>` and `O<n>` (interface,
Identifiers). Removing an optional key or an identifier is breaking by the letter of "Changes to the interface":

- A dropped key breaks no profile. `checks/profile.mjs` reads only the keys the scripts use and passes over every other,
  so a profile that keeps one reads as before and no check fails; the key then means nothing. Refusing it, as the
  reader refuses `direct-commits`, would stop every check of a project until its profile changed, for a key that
  grants nothing; so the reader stays as it is. An installation deletes the dropped keys from its projects' profiles
  and its home's, in an item of its own; with `legacy` dropped, the documents it listed then fall under the rule on
  documents, and the periodic review names them.
- A deleted identifier breaks a citation of it in an installation's documents, which no check of the kit reads. An
  installation that cites one states the point in its own words or drops it, in an item of its own.

**What each document becomes.**

- Architecture. Key facts: the host as the machine where the sessions run, the Claude Code application as where the
  person talks with the hub and the workers, state answered from front matter, custom code as the hooks, the checks
  and the hub's scripts. Components: host, hub, application, worker, checker, security reviewer, hooks, scripts,
  hosting identity, each built from what it is; the diagram without the parts that go. Layouts: the skills, agents and
  templates there are; the home's settings as `max-workers` and `models`, its radar as entries with a review date,
  without `hosts.yml` and `inbox/`; a project's profile without data sources and playbooks, its own rules where the
  platform reads them, and its earlier documents as the choice on `legacy` says. "Files": the source of truth and the
  rules that keep the files manageable, without the index. Flows: ask, dispatch, joining and the periodic review, each
  pointing to where it is specified rather than restating it, so that a change to the path of a work item leaves it
  true. "Native first": the principle and the hub that resumes from files. "Security": the points that hold, without
  the reader, the senders, the data credentials and the host's hardening, which describe parts that are not built.
  Assumptions: A5; open points: O10.
- Vision. What the hub does as built: one hub, ask, dispatch, the shared layer, the periodic review with the radar,
  traceability. The problem without the tools sent as links, the principles without evaluation, the glossary without
  the reader and the inbox's verdict.
- README. The opening as the vision's; the architecture's sections in its list of documents; O10 as the example.
- Workflow. The key fact on the home, "Derived views" and "Deferred checks" without inbox, verdicts and scheduler; step
  8 of "Procedure" without `merge-deploys`; with `legacy` dropped, the line on earlier documents in "Comments and
  documents".

**Asked of the hub,** for files of the other items, each a few words:

- `docs/01-specs/WORKFLOW.md`, "The record" (`261126-2213`): its reference "(architecture, Files and index)" names the
  renamed heading, or `checks/references.test.mjs` fails.
- `templates/record.md` and the front matter in the workflow's "The record" (`261126-2213`): the comment of `source`
  names an inbox item; it would name the item that a record comes from, such as an assessment.
- With `legacy` dropped: `rules/writing.md`, Documents (`261126-2213`), loses the exception of `legacy`;
  `skills/assessment/SKILL.md`, step 5 (`261126-2215`), proposes deleting earlier workflow documents instead of listing
  them.

**Files.** Changed: the architecture, the vision, the README, the workflow, the profile's template and the kit's
profile; with the hub's leave, `templates/record.md`, and with `legacy` dropped `rules/writing.md` and
`skills/assessment/SKILL.md`. Six to nine existing files, against the six an upkeep is expected to touch.

**Parallel parts.** None: the documents cite one another's headings and terms, and one writer keeps them consistent;
each edit is short.

**Model.** The strong tier at xhigh effort, as the item runs; nothing calls for the strongest.

**Risks.** An installation cites a deleted identifier or keeps a dropped key: nothing fails, and the item says what it
changes. A line that another item also changes conflicts at the second merge, which `honsha:branch-update` resolves.

## Approval

Approved by the person on 2026-11-26, in this item's session, as written in `8b6012c`, with the open choice taken:
`legacy` is dropped, together with its exception in `rules/writing.md` and the step of `honsha:assessment` that reads
it.

## Log

- 2026-11-26: branch `work/261126-2214-documents-as-built` created from `origin/main` after `git fetch`, the record as
  the hub's brief gave it. `node <kit directory>/checks/verify.mjs --setup` run once in the worktree: both setup
  commands passed.
- Read the architecture, the vision, the README, the workflow, the interface, the profile's template and the kit's
  profile, then `agents/hub.md`, `skills/assessment/SKILL.md` and `skills/review/SKILL.md`, the procedures that the
  documents' parts would serve. Each claim of the intent checked as the strategy's tables say; all hold, but for the
  rule on earlier documents, which the kit does not hold (Strategy, The open choice).
- The references to the architecture's headings were listed with `references` of `checks/references.test.mjs`: "Kit",
  "Home" and "Open design points" are cited outside it and stay; "Files and index" is cited in the workflow's "The
  record" too.
- No area: the item has none, and the kit holds no pack.
- The hub's answer on the files of the other items. `templates/record.md` and the workflow's "The record" stay with
  `261126-2213`, which takes the comment of `source` into its own change: this item does not touch it. In "The record"
  this item changes, on its branch and whatever the order of the merges, exactly the reference "(architecture, Files
  and index)" into "(architecture, Files)", and nothing else in that section; `261126-2213` leaves the sentence that
  holds it unchanged. This replaces the hub's first ruling, that the item merged second would change it, since this
  branch's references test fails until it does. With `legacy` dropped, this item changes exactly the exception of
  `legacy` in `rules/writing.md`, Documents, and step 5 of `skills/assessment/SKILL.md`, and nothing else in those two
  files; the hub tells `261126-2213` and `261126-2215`.
- The person approved the strategy, with `legacy` dropped (Approval); the state is `in-progress`.
- The architecture: key facts, components and diagram as the strategy says, with rows for the hooks and the scripts,
  which point to "Kit" and to the interface's "Commands"; the layout's lines of skills, agents and templates, without
  `board/`; the home's layout without `hosts.yml` and `inbox/`, its settings as `max-workers` and `models`, its radar
  as entries read by the review; a project's layout as what the kit reads and writes there (interface, Files), its own
  rules in the platform's places, and its earlier workflow documents deleted. "Files and index" is "Files", without the
  index. Flows: "Ask", "Dispatch", "Joining" and "Review", each pointing to where it is specified; "Evaluate" and
  "Scheduled" are gone. "Native first" holds the principle without the table of planned pieces. "Security" keeps four
  points; the reader, the senders, the data credentials and the host's hardening are gone. Assumptions: A5, with where
  it is tested; open points: O10. Deleted: A1, A2, A3, A8, A9, O02, O06, O07.
- The vision: "What it does" is one hub, ask, dispatch, the shared layer, the periodic review and traceability; the
  tools sent as links leave the problem; "Evaluate, never install" becomes a principle on installing; the glossary
  loses the reader, and "Verdict" is the checker's and the security reviewer's.
- The README: its opening, its line on the architecture, and O10 as the example of an identifier.
- The workflow: the key fact on the home, step 8 of "Procedure", "Deferred checks", "Derived views", the reference of
  "The record" to "Files", and the line on earlier documents in "Comments and documents".
- `templates/profile.yml` without `description`, `merge-deploys`, `data`, `playbooks` and `legacy`; `.hub/profile.yml`
  without `description` and `merge-deploys`. The readers of every key the template keeps are those of the strategy's
  table. `rules/writing.md` without the exception of `legacy`; step 5 of `honsha:assessment` reads a project's earlier
  workflow documents for an item that deletes them.
- Searched again outside `work/` for the parts and keys that went: what remains is `agents/hub.md` and
  `honsha:review`, which name a scheduler only to say what holds until an installation has one, as a reader needs to
  know; and the comment of `source` in `templates/record.md` and in the workflow's front matter, which `261126-2213`
  takes (criterion 8).
- The hub: the sentence of the workflow's "Joining an installation" on the closing commit, and the interface's "Changes
  to the interface", are `261126-2213`'s. This item changes neither: it touches no line of that section of the
  workflow, and nothing in the interface.
- The security review runs: no path of the profile's `security-review` changes, but the change deletes points of the
  architecture's "Security" on untrusted content, on who may talk to the hub and on the credentials of a project's
  data, and the profile's key that named a data source's secret, which touch permissions and secrets
  (`honsha:security-review`).
- The security review passed, with three weak points. The first, no rule on untrusted content in what a session
  receives, is the observation for the hub below, left to the person: a rule of the core rules is beyond this item's
  scope. The second, no word on hardening a host, is left to the person too: the kit has no host of its own to say it
  of, and the review reads each host's access in the inventory. The third is the interface's consequence that the
  strategy states, and needs nothing.
- The checker, on `c192a55`: `fail`, with three findings. The first, the comment of `source` in the workflow's "The
  record" that still names an inbox item against criterion 7, is declared under "Deviations": the hub gave that line to
  `261126-2213`. The second, the README and `honsha:assessment` grown against the Boundaries: the README's line on the
  architecture is back to its words on the default branch, which name sections that all still exist, and step 5 of the
  assessment is shortened to what it reads, the rule on earlier documents being the workflow's; every document the
  change touches is now shorter than on the default branch. The third, the comment of `hub/projects.mjs` on reports
  that stay where they were written "as a project's earlier documents do", false once `legacy` goes: asked of the hub,
  since the script is in no item's list.
- The hub's leave: this item changes that comment of `hub/projects.mjs`, the one line, no code; `261126-2213` has leave
  for another comment of the same file, far from it. The comment now gives as its reason that every record stays where
  it was written. Declared under "Deviations", with the first finding.
- The person accepted both deviations. The fixes are commit `76022ec`, which by mistake also carries the
  verification's results and the first reports, kept for the closing commit (`agents/worker.md`, Verification); the
  branch is not rewritten, and the closing commit holds the verification as it then stands. The fix touches nothing
  the security review guards, so no repeated review runs.
- The hub: `261126-2213` changes, in the architecture's "Models", the bullet on the tier and effort of an item's size.
  This branch changes nothing in "Models", that bullet and its neighbours included.
- The verification on `76022ec` passed, all 11 commands. The repeated check, on `76022ec`, of the diff since
  `c192a55`: `fail`, with two findings. The first, step 5 of `honsha:assessment` shortened past the condition that
  criterion 7 names, which the workflow cites the skill for: it states again that earlier workflow documents are
  deleted once the adoption no longer reads them, so the skill ends 12 characters longer than on the default branch,
  declared under "Deviations"; shortening its other clauses to make room would change what they say. The second, the
  comment of `hub/projects.mjs` claiming that every record stays where it was written, which a record of the backlog
  does not: it now names every merged record, the same line under the hub's leave.
- For the hub, outside this item: the README's requirements count a session of the desktop application with the kit
  installed among what is not tried; the README's table has no row for `hub/`; no rule of the kit says how a session
  treats untrusted content, now that the reader is gone from the documents.
- The entries from the person's acceptance of the first two deviations to the second fix were written above the
  previous one, by mistake; this one and those after it follow in order. The third check, on `b9408db`: `pass`. Its
  report gives the files it read by their absolute paths on this host, which the public record cannot hold: they are
  copied from the repository's root.
- The branch pushed at `b9408db`, and pull request #66 opened to `main`, its description from this record. Its four
  checks were still running when first read.
- Told by the hub that they had ended, read once: run 45909230507 on `b9408db` passed its four checks, the personal
  content, `project / checks`, and `verify` on Linux and on Windows.

## Verification

On `b9408db`, on this host, as on `c192a55` and `76022ec` before it:

- `node <kit directory>/checks/record.mjs`: passed. `node <kit directory>/checks/commits.mjs`: passed, 5 commits.
- `node checks/verify.mjs`, the profile's `verify` list: all 11 commands passed.
  - `npx --no-install prettier --check .`: passed.
  - `npx --no-install oxlint`: passed.
  - `npx --no-install tsc -p .`: passed.
  - `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "hub/*.test.mjs" "services/*/*.test.mjs"`: 292 tests, 292
    passed.
  - `node checks/security-testing.mjs gitleaks`: 5 commits from `516e0db` to `b9408db`, 0 findings.
  - `node checks/security-testing.mjs shellcheck`, `actionlint`, `zizmor`: nothing found.
  - `claude plugin validate .`: passed, with the warning that the plugin has no version (O10) and the directory's
    remarks on the licence and the icon.
  - `node checks/record.mjs`, `node checks/commits.mjs`: passed.
- No `dynamic-testing` in the profile.

The security review, on `c192a55`, of the diff from `origin/main`:

### Security review report

**Verdict:** pass

**Read:** the change touches only documentation and profile keys. I found no exploitable hole.

- `.hub/profile.yml`
- `README.md`
- `docs/00-vision/VISION.md`
- `docs/01-specs/ARCHITECTURE.md`, `docs/01-specs/WORKFLOW.md`
- `rules/writing.md`
- `skills/assessment/SKILL.md`
- `templates/profile.yml`

To check what the change relies on, I also read:

- `checks/profile.mjs`, to see which profile keys code reads and how it handles keys it does not know.
- `agents/hub.md`, `agents/` (which agents exist), `skills/review/SKILL.md` and `rules/`.
- A search of `hooks/`, `checks/`, `hub/` and `services/` for any code that reads the dropped keys, and for imports of
  outside packages.

**Findings**

none

**Weak points**

1. `docs/01-specs/ARCHITECTURE.md:229-242`: Security item 1 is gone ("Untrusted content goes through the reader ...
   What it returns is data, never instructions."). Now nothing that a hub or worker session receives says that text
   from outside the project is data and not instructions. The only such sentences left are in
   `agents/security-reviewer.md:14` and `services/github/README.md:238`. This cannot be exploited as written:
   - No reader agent was ever built (`agents/` holds only hub, worker, checker and security reviewer).
   - `agents/hub.md` fetches no web pages, links or transcripts.
   - The architecture document is not one of the files sessions receive (`rules/` are), so what sessions are told is
     unchanged.
2. `docs/01-specs/ARCHITECTURE.md:229-242`: Security item 6 is gone ("The host is minimal": key-only SSH, a firewall, a
   dedicated user, automatic security updates). The specifications no longer say how a host should be hardened. This
   cannot be exploited as written:
   - No code ever enforced it.
   - The periodic review still reads, for each host, who reaches it, with which keys, and the credentials it holds
     (`skills/review/SKILL.md:30`).
3. `templates/profile.yml` and `.hub/profile.yml`: the `data`, `playbooks`, `legacy`, `merge-deploys` and
   `description` keys are dropped. `checks/profile.mjs:136-216` ignores top-level keys it does not know, so an existing
   profile that still has them is read as before. A search outside `work/` finds no code that reads these keys or hands
   a session a secret named under `data`. Removing them changes no decision, no guard and no grant.

**Not reviewed**

- Installations' homes and registered projects' profiles. An installation that set up project-data credentials on its
  host (under the removed `data` key) did so outside the kit. Whether those credentials are still scoped to their
  project's sessions cannot be seen from this repository.

The first check, on `c192a55`, of the diff from `origin/main`: verdict `fail`; findings:

1. Criterion 7 says the workflow names no inbox, yet `docs/01-specs/WORKFLOW.md`:107 still does, in the comment of
   `source`, as `templates/record.md`:13 does; the hub kept both with `261126-2213`, and no deviation declares it.
2. `README.md` and `skills/assessment/SKILL.md` grow, against the Boundaries' "every document it changes shrinks", and
   no deviation declares it.
3. The comment at `hub/projects.mjs`:43 gives a project's earlier documents as its reason, false once `legacy` goes,
   and the log names it to no one.

The repeated check, on `76022ec`, of the diff since `c192a55`: verdict `fail`; findings:

1. Step 5 of `skills/assessment/SKILL.md` no longer says that earlier workflow documents are deleted once the adoption
   no longer reads them, though criterion 7 names it and the workflow cites the skill for it; no deviation declares it.
2. The comment at `hub/projects.mjs`:43 says that every record stays where it was written, which a record of the
   backlog does not.

The third check, a repeated one, on `b9408db` and the record as it then stood, of the diff since `76022ec`:

### Checker report

**Verdict:** pass

Both findings of the last report, on `76022ec`, are fixed:

1. Step 5 of `skills/assessment/SKILL.md` again says that earlier workflow documents are deleted once the adoption no
   longer reads them (lines 27-28). This matches `docs/01-specs/WORKFLOW.md`:459-460 and
   `docs/01-specs/ARCHITECTURE.md`:163. The growth is as the third deviation states. Against the installed kit at
   `516e0db`, the changed clause goes from 55 to 67 characters and the rest of the step is the same text wrapped
   differently, so the skill ends 12 characters longer. The person accepted this on 2026-11-27.
2. The comment at `hub/projects.mjs`:43 now names "every merged record", and that holds:
   - A backlog record reaches the default branch through `hub/backlog.mjs` without a pull request (`rules/git.md`,
     Delivery).
   - It leaves `backlog/` when its item starts (`docs/01-specs/ARCHITECTURE.md`:179).
   - A merged record in `work/` or `reports/` stays where it is, which is what `RECORD_FOLDERS` relies on.

**Acceptance criteria**

1. The architecture names no part the kit lacks: not touched by this diff.
2. Identifiers A5 and O10 kept, the others deleted: not touched by this diff.
3. "Files and index" renamed "Files": not touched by this diff.
4. The vision as built: not touched by this diff.
5. The README's opening and list of documents: not touched by this diff.
6. The profile's dropped keys, and a reader for each kept key: not touched by this diff.
7. The workflow, the architecture, the core rules and `honsha:assessment` say that earlier workflow documents are
   deleted: met for the skill, `skills/assessment/SKILL.md`:27-28. The comment of `source` is still a declared and
   accepted deviation.
8. References in files of other open items: met. Both changed lines are under the hub's leave: the one line of
   `hub/projects.mjs`:43 and step 5 of the skill (Log, Deviations).
9. The outcome and the pull request name what each breaking part changes: not touched by this diff. The outcome comes
   with the closing commit.
10. Every verification command passes: met as recorded. Verification on `b9408db` lists all 11 commands as passed.

- **Intent:** in order
- **Scope:** in order
- **Comments and documents:** in order
- **Gates:** in order
- **Verification evidence:** in order; covers formatting, lint, types, tests, security
- **Security review:** not due
- **Record:** in order
- **Commits:** in order

**Findings**

none

**Not verified**

- Whether the log entry for this fix was added at the end of the log, or put in front of the entry "For the hub,
  outside this item", which now comes last. The diff leaves out the record, and the record as it stood at `76022ec`
  cannot be read here.
- Whether the default branch has moved past `516e0db` in `skills/assessment/SKILL.md`. I made the 12-character
  comparison against the installed kit at `516e0db`, which the record gives as the branch's base.

Files read: `work/2026/11/261126-2214-documents-as-built.md`, `skills/assessment/SKILL.md`, `hub/projects.mjs`,
`.hub/profile.yml`

## Deviations

- Criterion 7 does not hold in one line: the comment of `source` in the front matter of the workflow's "The record"
  still names an inbox item, as `templates/record.md` does. The hub keeps both with `261126-2213`, which takes them into
  its own change (Log), as the Boundaries foresee for a file that another item holds.
- The change reaches a file outside "In scope": the comment of `hub/projects.mjs` that gave a project's earlier
  documents as its reason, false once `legacy` goes, now gives that of every merged record. The checker found it; the
  hub gave leave for that one line.

Both accepted by the person on 2026-11-26, in this item's session.

- The Boundaries say that every document the change touches shrinks, but `skills/assessment/SKILL.md` ends 12
  characters longer than on the default branch, well within its budget: its step 5 states when a project's earlier
  workflow documents are deleted, which is where the workflow points for it. The repeated check found it. Accepted by
  the person on 2026-11-27, in this item's session.

## Outcome

The kit's architecture, vision and README describe only what is built. The architecture names no board, reader,
inbox, index, scheduler, messaging channel, `hosts.yml`, data source or always-on host. Its flows are ask, dispatch,
joining and the periodic review, its section on files is "Files", and of its identifiers only A5 and O10 remain. The
profile's template and the kit's profile hold only keys that a script, a skill, an agent's file or a rule reads.
`legacy` is gone with its exception in the core rules, so a project's earlier workflow documents are deleted once its
adoption no longer reads them. The workflow and `honsha:assessment` say so. All criteria hold but one line of criterion
7: the comment of `source` that names an inbox item, which `261126-2213` changes (Deviations).

What an installation changes, each in an item of its own, with nothing failing until then:

- it deletes `description`, `merge-deploys`, `data`, `playbooks` and `legacy` from its projects' profiles and its
  home's;
- a document of its own that cites A1, A2, A3, A8, A9, O02, O06 or O07 states the point in its own words, or drops it.

Pull request #66. No deferred check.
