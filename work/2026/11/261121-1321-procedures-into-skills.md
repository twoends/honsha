---
id: 261121-1321
title: Give sessions the assessment's procedure and the rules on dependencies as skills
project: honsha
type: change
size: full
kind: upkeep
state: awaiting-approval
areas: []
created: 2026-11-21
updated: 2026-11-21
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked for the record of an item that moves out of the workflow two sets of rules that sessions need only
in some situations, and that no session receives today: the procedure of a project's assessment and the rules on
dependencies. They become skills of the kit, which a session loads whole when the situation comes. The same item
gives the workflow a size limit, and replaces with a pointer to the code the implementation details that the code's
comments already state. Asked on 2026-11-21, in the session of the kit's readiness review, after the person observed
that a workflow of about 44,000 characters risks losing pieces once projects start using it.

## Scope and acceptance criteria

### In scope

- `skills/assessment/SKILL.md`: what an assessment reads and its report, today's workflow 20.1 and 20.2.
- `skills/dependencies/SKILL.md`: the rules on dependencies, today's workflow 17.
- The workflow's sections 17 and 20, which keep the reasons, the registry's states and the scripts, and point to the
  skills; its section 2, which names the two skills among the situational procedures.
- `agents/worker.md`: when to invoke each skill.
- `hub/projects.mjs` and its test: the record that `add` writes names the assessment's skill.
- `rules/writing.md`: the exception that lets a file restate a rule its reader does not otherwise receive covers a
  skill as well as an agent's file.
- The workflow's sections 8 (the lessons' budget) and 14.3 (how the guard follows a move to another folder): the rule
  stays, the mechanics are left to the comments of `hooks/lessons.mjs` and `hooks/guard.mjs`.
- `checks/budgets.test.mjs`: budgets for the two skills and for the workflow.
- The README's row on `skills/`.

### Out of scope

- What any rule requires: the steps of an assessment, its report and the rules on dependencies stay as they are; only
  where they live changes.
- The workflow's section 16 on decisions, which the record's own sections already give a place to, and its other
  sections' length.
- Splitting the workflow into several files: once these rules move, no session needs to read it to do its work.
- The workflow's sections 14.1 and 14.2 and `services/github/`, which the open item `261121-1306` changes.
- The home, whose `CLAUDE.md` and monthly review name the sections 17 and 20: both sections stay, so the references
  hold.

### Boundaries

- No rule is dropped. The log names, for each paragraph that leaves the workflow, where it went.
- A reference to the sections 17 or 20 anywhere in the kit still finds there what it cites, or is updated.
- The core rules' parts stay within the limits of `hooks/hooks.test.mjs`.

### Acceptance criteria

1. `skills/assessment/SKILL.md` holds today's 20.1 and 20.2 word for word, apart from pointers. Each step whose
   criterion another section states has that criterion written in the skill, with the section named, so that a session
   needs only the skill, the project and the hosting service's piece to run the assessment.
2. `skills/dependencies/SKILL.md` holds the five rules of today's section 17 word for word, apart from pointers.
3. The workflow's section 17 keeps why dependencies are handled this way and points to its skill; section 20 keeps the
   states, the scripts and why, and points to its skill; 20.1 and 20.2 are gone from it. Section 2 names both skills.
4. `agents/worker.md` says to invoke `honsha:assessment` for an item that assesses a project, and
   `honsha:dependencies` for an item that changes a dependency or answers a vulnerability report. It stays within its
   budget of 5,800 characters.
5. The record that `hub/projects.mjs add` writes names the skill `honsha:assessment` in place of the workflow's section
   20, and its test checks that text.
6. `rules/writing.md` lets a skill, as an agent's file, restate a rule its reader does not otherwise receive.
7. Sections 8 and 14.3 state their rules and point to `hooks/lessons.mjs` and `hooks/guard.mjs` for how the code
   applies them; each sentence removed there is already in that file's comments.
8. `checks/budgets.test.mjs` holds `skills/assessment/SKILL.md` at 6,000 characters, `skills/dependencies/SKILL.md` at
   3,000 and `docs/01-specs/WORKFLOW.md` at 42,000, and its comment says why the workflow has a budget.
9. The README's row on `skills/` names the four skills.
10. A session started with `claude -p --plugin-dir` on this branch, in a scratch repository, lists both skills, and
    after invoking `honsha:assessment` names its ten steps.
11. The profile's `verify` passes.

## Strategy

**Why.** The core rules reach every session by hooks and the situational procedures reach the worker as skills, but
two sets of rules that sessions need live only in the workflow, which no session receives. The rules on dependencies
(the 7-day wait, the same-day fix of a vulnerability, automatic pull requests off, the vulnerability report at each
change of the lockfile) appear in no rule, agent or skill: a worker that updates a package meets them only if it
decides to open a 44,724-character file. The assessment, the first step of every project that joins, is pointed to by
the record `add` writes, but its ten steps and its report send the session to the sections 8, 9, 11, 14.1, 14.2, 17,
18 and 19 and to the architecture's 3.3. A session that skims there skips a step. This is a defect of the kit, the rules
it states for sessions not reaching them, so D87 of the installation lets the item start; the person decides.

**The skills.** As `honsha:parallel-parts` and `honsha:branch-update` are: a `SKILL.md` with a `name` and a
`description` that says when it applies, whose text the platform puts in the context whole when it is invoked.

- `honsha:assessment` holds 20.1 and 20.2. Where a step checks a criterion that another section states, the skill
  writes the criterion in a line, with the section in brackets: what `verify` must cover (section 9), when and what
  the pipeline runs (14.2), the settings (14.1), what pinned dependencies are (17), what declaring the kit means
  (architecture, 3.3), where a lesson belongs (8), what `legacy` holds (11), the default kinds (19). Its commands stay
  in the hosting service's piece and in `checks/measures.mjs`, which it names.
- `honsha:dependencies` holds the five rules of section 17.

**The design chosen.** Restating each criterion in the assessment's skill copies a line from another section, which
the core rules allow only to an agent's file that must check a rule its agent does not otherwise receive. A skill is
in the same position: it is the procedure an agent follows, and its reader receives no workflow. So the exception is
extended to a skill, in one clause of `rules/writing.md`; naming the section beside each copied criterion lets the
upkeep review compare them. Left out: pointers instead of copies, which keep today's scattering; moving the whole of
section 20 into the skill, which would take the registry's states away from the hub and the scripts that cite them.

**The workflow.** Sections 17 and 20 keep their headings, so the references to them in the kit's other documents and
in the home still hold. Section 17 keeps, in a few lines, why the rules are as they are, and points to the skill;
section 20 keeps the states, the scripts and the reasons, and points to the skill for the assessment itself. In
section 8, the sentence on how a full level makes room for the names of the files it leaves out gives way to a
pointer to `hooks/lessons.mjs`; in section 14.3, the paths and shells the guard follows give way to a pointer to
`hooks/guard.mjs`. Both files' opening comments already say this. Measured today, the paragraphs that move hold about
6,200 characters, and their pointers take back about 1,000: the workflow should come to about 39,500.

**The budgets.** The two skills at about 1,500 and 1,000 characters above their expected size; the workflow at 42,000,
which leaves room for the item `261121-1306`. The workflow is not read at every start, so its budget's reason is a
different one: nothing else stops its growth, which went from 17,507 to 44,724 characters in five days.

**Live check.** In a scratch repository, `claude -p --plugin-dir` on this branch, asked which skills of the kit it has
and, after invoking `honsha:assessment`, which steps it holds.

**Measures.** Seven existing files against the six of `upkeep`: the record that `add` writes is tested, so its test
changes with it.

**Risks.** A restated criterion can drift from its section: the section named beside it is the upkeep review's
handle. A skill the worker does not invoke changes nothing: the record that `add` writes names it, and the worker's
file says when. The item `261121-1306` is open and changes section 14.2 and `services/github/`: this item stays out
of both and changes only the last bullet of 14.3; if a conflict comes anyway, `honsha:branch-update` resolves it.

**Parallel parts.** None: the files are few and depend on one another's wording. The default model is enough.

## Approval

## Log

## Verification

## Outcome
