---
id: 261118-2039
title: Make the assessment the way every project enters, with the entry done by code
project: honsha
type: change
size: full
kind: capability
state: awaiting-approval
areas: []
created: 2026-11-18
updated: 2026-11-18
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person asked that, whenever it is decided to bring a new project into the ecosystem, its assessment be
mandatory. The person then made clear that adding a project is not necessarily a request to Claude: it may be, but
in the future there may be an interface with a button to add a project, which starts the assessment. The part
described is code, with no agent behind it doing that mechanical work. Asked on 2026-11-18; the clarification came
while a first, smaller version of this item was under way.

## Scope and acceptance criteria

### In scope

- The rule: every project that joins an installation is assessed first, and its entry in the home's registry says
  what work may start in it.
- The registry's format, in the architecture.
- A script of the kit that does the mechanical part: adding a project, moving it between states, and answering
  whether a work item may start in it.

### Out of scope

- The interface with a button to add a project, and the scheduler.
- The hub's instructions in the home, and the registry file itself: the home's own commits, after this item.
- The entry of any particular project.
- Starting an agent from the script, unless the person chooses it (decision 1).

### Boundaries

- The script reads and writes only the home's registry and the home's report records, and reads the projects'
  repositories through git; it never starts work in a project and never writes there.
- No agent is needed for any step the script does.
- Nothing about this installation enters the kit: examples use invented names.

### Acceptance criteria

1. The workflow, section 20, says that every project joining an installation is assessed first; names the states
   `assessing`, `adopting` and `active`, what work each allows and what moves a project from one to the next; says
   that code, not an agent, does the entry and the moves; and that a project not in the registry gets no work item.
2. The architecture, section 3.2, gives the registry's format and points to section 20.
3. `hub/projects.mjs`, run from the home's folder:
   - `add <name> <repository> <folder>` refuses a name already present, writes the entry as `assessing`, and writes
     the assessment's record into the home's `reports/`, from the template, ready to start;
   - `choose <name>` moves a project from `assessing` to `adopting`, and refuses while its assessment's record is not
     `done`;
   - `refresh` moves each `adopting` project whose default branch declares the kit's plugin to `active`;
   - `may-start <name> <record>` answers, by its exit code and one line, whether that work item may start: in an
     `assessing` project only its assessment; in an `adopting` one only items whose `source` is the assessment;
     anything in an `active` one; nothing in a project that is not in the registry.
4. Each command has tests on a home and a project repository built by the test.
5. The kit's `verify` list passes, the record and commit checks included.

## Strategy

### Design

- **States and their moves.** `assessing` when the project is added; `adopting` when the person has taken the
  report's decisions and chosen its items, which the person says through `choose`, from a command now and from an
  interface later; `active` when the kit's plugin is found enabled in `.claude/settings.json` on the project's default
  branch. Each move is a fact a script can check, so none needs an agent.
- **Which items an adopting project takes.** The items chosen from the assessment carry its identifier as their
  `source`, which the record template already has; `may-start` reads it. No list of chosen items is kept elsewhere.
- **The registry**, `registry.yml` in the home:

  ```yaml
  projects:
    - name: example-shop
      repository: example-owner/example-shop
      paths: { example-host: /srv/projects/example-shop } # the folder on each host, by the host's name
      state: assessing
      assessment: 261201-0930 # the identifier of its assessment's record
  ```

  The host's name is the one the system gives, so the script finds its own folder without a setting.
- **Where the script lives.** `hub/` in the kit, a new folder: it is the hub's code, not a check of a work branch. It
  reads YAML with the profile's reader (`checks/profile.mjs`), extended only if the list of projects needs it, and
  records with `checks/record.mjs`.
- **The rule is stated once,** in section 20; the architecture gives the format and points there.

### Plan

1. Section 20 and the architecture.
2. `hub/projects.mjs` with its tests, command by command: `add`, `may-start`, `choose`, `refresh`.
3. The verification and the checker, then the pull request.

No parallel parts: the four commands share one file and the registry's reader.

### Assumptions to confirm while building

- The profile's YAML reader handles a list of mappings; if not, it is extended with a test, or the script gets a
  reader of its own for the registry.
- `git fetch` and `git show origin/<branch>:.claude/settings.json` in the project's folder read the default branch
  without changing the working tree.

### Risks

- A registry edited by hand into a shape the script cannot read: the script stops with the line it could not read,
  and changes nothing.
- `refresh` on a project whose folder is missing on this host: it says so and leaves the state.

### Measure

One to two times a full item at the kit's medians: 10 to 40 minutes of agent time, 60,000 to 200,000 output tokens.

### Decisions for the person

1. **Who starts the assessment after `add`.** Recommended: the script writes the record ready and prints the next
   step; the hub, or the person, starts the session. The alternative, the script starting a read-only session of
   Claude Code itself, fits the future interface better, but runs an agent with the permissions the assessment
   needs (git, the hosting service's client, the package manager's audit) from a script, and is better decided with
   the interface.
2. **The kit in the registry.** Recommended: the kit is entered as `active` directly, since it declares itself and
   was assessed in report `261118-1348` of the home; this one entry skips `add`.
3. **The pilot's assessment already written** (home report `261118-1900`): enter the pilot with `add` and a new
   assessment, or let `add` take an existing report's identifier. Recommended: a new assessment, since the kit has
   changed since that report; the earlier one stays as history.

## Log

- 2026-11-18: a first version of this item, sized small, wrote the rule in section 20; its check, by the new checker,
  failed it as a full item: it defines the values of the registry's `state` and chooses what moves each one. Its
  branch was never pushed and was deleted; its text is the starting point of step 1. Branch cut from `main` at
  `0b7ad63`.
