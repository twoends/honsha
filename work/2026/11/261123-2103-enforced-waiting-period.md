---
id: 261123-2103
title: Have a project's package manager enforce the dependency rule's waiting period, where it can
project: honsha
type: change
size: full
kind: rule
state: awaiting-approval
areas: []
created: 2026-11-23
updated: 2026-11-25
requested-by: person
source: null
pr: null
model: null
effort: xhigh
checks: []
---

## Intent

The person asked the hub, on 2026-11-23 in the hub's session, to keep this idea in the home's backlog, after an
assessment compared the stacks of the kit and of a Node.js project using it, and on 2026-11-25 to start it.

`skills/dependencies/SKILL.md` asks for 7 days between a version's release and its adoption, and for installs without
install scripts, but leaves both to whoever takes a version. A package manager can enforce them itself: npm 12 does,
with `min-release-age` and `strict-allow-scripts` in the project's `.npmrc`, as a project using the kit does and as the
kit's item `261123-2056` has the kit do. The rule could say that, where the project's package manager can enforce the
waiting period and the refusal of install scripts, the project's configuration does it; and step 4 of the assessment,
"Dependencies", could check it, so that every project receives it from its assessment rather than from a comparison.

Left: the rule's wording for any package manager, with npm 12 as the example; whether the assessment's step 4, the
profile's template or a check of the kit carries it; and the exceptions the rule already makes, for vulnerability
fixes, which no waiting period holds back, and for Claude Code, which the kit follows.

## Scope and acceptance criteria

### In scope

- `skills/dependencies/SKILL.md`: the rule that, where the project's package manager can refuse a version released
  less than 7 days earlier and an install script, the project's configuration in the repository has it do so, and asks
  for a version of the package manager that applies it; npm 12 as the example; how a vulnerability fix and Claude Code
  stay outside the waiting period under such a configuration.
- `skills/assessment/SKILL.md`, step 4, "Dependencies": the assessment reads whether the project's configuration holds
  the waiting period and the refusal of install scripts, where its package manager can.
- `docs/01-specs/WORKFLOW.md`, section "Dependencies": the reason, in one sentence.
- `checks/budgets.test.mjs`: the budget of `docs/01-specs/WORKFLOW.md`, which has 7 characters left, raised by what
  that sentence needs.

### Out of scope

- The profile and its template: a package manager reads its settings from the project's own files, and a key of the
  profile would repeat them where no script of the kit reads them.
- A check of the kit that reads a project's package manager configuration (Strategy).
- The kit's own `.npmrc`, `package.json` and pipeline, which already hold what the rule will ask.
- `.github/workflows/project.yml` and `services/github/`, which already install before the setup the npm that a
  project's `devEngines` asks, and install Claude Code with `--global`.
- The other parts of `skills/assessment/SKILL.md` and of `docs/01-specs/WORKFLOW.md`.
- Any package manager other than npm by name: the rule says "where it can", and npm 12 is its example.

### Boundaries

- The waiting period of 7 days, its two exceptions and installs without install scripts stay what they are: the change
  says what holds them, not what they ask.
- An exception is made on the command that takes the version, or, for Claude Code where a project holds it as a
  dependency, by naming that one package in the configuration; never by turning the configuration's settings off.
- Nothing names a user, a project or an installation, and nothing cites an entry of a decision log.

### Acceptance criteria

1. `skills/dependencies/SKILL.md` says that, where the project's package manager can refuse a version released less
   than 7 days earlier and an install script, the project's configuration in the repository has it do so, and asks for
   a version of the package manager that applies that configuration; it gives the reason, and npm 12's settings as the
   example.
2. The skill says how a vulnerability fix and Claude Code stay outside the waiting period under such a configuration,
   with npm 12's way, while the configuration keeps holding every other version.
3. Step 4 of `skills/assessment/SKILL.md` reads whether the project's configuration holds the waiting period and the
   refusal of install scripts, where its package manager can, so that a gap becomes a finding with a proposed item.
4. The section "Dependencies" of `docs/01-specs/WORKFLOW.md` gives the reason, and the budget of that document in
   `checks/budgets.test.mjs` is raised by what the change needs, as the log says.
5. Each behaviour of npm 12 that the skill states is shown on this host, with its command and result in this record;
   the kit's own `.npmrc` and `package.json` meet the rule as the skill words it.
6. No other file changes but this record, and the profile's `verify` commands pass.

## Strategy

**The design.**

- `skills/dependencies/SKILL.md` gains a last bullet, after the two exceptions it refers to, "The package manager holds
  the rule, where it can". It says:
  - where the project's package manager can refuse a version released less than 7 days earlier, and an install script,
    the project's configuration, committed in the repository, has it do so: the rule then holds at every install, a
    person's, a session's or the pipeline's, and not only at those where someone remembers it;
  - the configuration also asks for a version of the package manager that applies those settings and stops any other,
    since an older one reads them as unknown and may run what they would refuse;
  - an exception is made on the command that takes the version, so that the configuration keeps holding every other
    one;
  - with npm 12: `.npmrc` holds `min-release-age=7` and `strict-allow-scripts=true`, which fails an install that meets
    an install script that `allowScripts` in `package.json` does not name, where npm 12 alone would skip it with a
    warning; it holds no `ignore-scripts`, which overrides that setting and would skip such a script unseen; and
    `package.json` asks npm 12 under `devEngines.packageManager`, with `onFail: error`. A fix is taken with its package
    named on the command, as `--min-release-age-exclude=<package>`; the lockfile then holds the version, and an install
    from the lockfile takes it whatever its age. Claude Code installed with `--global`, as a pipeline installs it, is
    outside the project's `.npmrc`, which npm does not read in global mode; a project that holds Claude Code as a
    dependency names that package under `min-release-age-exclude` in `.npmrc`.

  The bullet "Pinned" stays: an install from the lockfile, such as the setup's `npm ci --ignore-scripts`, still runs no
  install script at all.

- `skills/assessment/SKILL.md`, step 4, reads beside the lockfile and the install without scripts: "the waiting period
  and the refusal of install scripts held by the project's configuration, where its package manager can, with the
  version of the package manager that applies it". A gap is then a finding, and "What is proposed" already closes it
  with what the kit gives, here the settings the skill names.
- `docs/01-specs/WORKFLOW.md`, "Dependencies", gains after the waiting period one sentence of about 170 characters:
  where the package manager can hold the wait and refuse install scripts, the project's configuration has it do so, so
  that the rules hold at every install and not only where someone remembers them. Its budget in
  `checks/budgets.test.mjs` goes from 39300 to 39500.

**What carries it, and what does not.**

- The assessment's step 4 carries it: every project is assessed before it joins an installation and again when the
  person asks, so each receives the settings from its assessment, as the intent asks.
- Not the profile's template: the settings live where the package manager reads them, in the project's own files.
- Not a check of the kit: the kit's checks are the same in every project whatever its technology, and a check of one
  package manager's files would break that; the configuration is itself what refuses, at every install, so a check
  would only restate it.
- The wording names no package manager but npm, the example the intent asks for: "where it can" covers the others
  without the kit vouching for settings it has not tried.

**Found while writing this strategy,** with npm 12.2.1 on this host, in scratch projects outside the repository whose
`.npmrc` holds `min-release-age=7` and `strict-allow-scripts=true`:

- `npm install undici-types@8.13.1`, released 4.8 days earlier: exit 1, `ETARGET`, "No matching version found for
  undici-types@8.13.1 with a date before 18/11/2026, 17:39:00". The same command with
  `--min-release-age-exclude=undici-types`: exit 0, installed. `npm ci --ignore-scripts` from the lockfile that then
  holds 8.13.1: exit 0, installed 8.13.1. A later `npm install semver@7.8.6`, 23 days old, and a bare `npm install`:
  exit 0, 8.13.1 kept. The waiting period applies when a version is chosen, not when a lockfile is installed, so an
  exception made on one command lasts with no change to the configuration. `--min-release-age=0` on the command also
  overrides the file.
- `npm install --global --prefix <scratch> --dry-run undici-types@8.13.1`, from the same folder: exit 0, "add
  undici-types 8.13.1". npm's documentation of `.npmrc` says that the project's file is not read in global mode.
- A local package whose `postinstall` writes a file: npm 12 alone blocks the script with a warning, exit 0; with
  `strict-allow-scripts=true` the install fails, exit 1, naming the package and its script; with `ignore-scripts=true`
  beside it, exit 0 and the script skipped with no warning. In none of the three did the script run.
- npm 11.12.1, from npm's cache, with the same `.npmrc`: refuses the young version, `ETARGET`, but installs the local
  package and runs its `postinstall`. npm 11.20.0 refuses both. With `devEngines` asking npm `>=12 <13` and
  `onFail: error`, both stop with `EBADDEVENGINES` before they install anything.
- npm 12's documentation of `min-release-age` names `min-release-age-exclude` as the way to take a fix released too
  recently, which `npm audit fix` otherwise leaves out with a warning and a non-zero exit. npm 12.0.2's definitions of
  its settings already hold `min-release-age`, `min-release-age-exclude` and `strict-allow-scripts`.

**How each criterion is shown.**

- Criteria 1 and 2: the skill's text, against the results above, which show each npm 12 behaviour it states.
- Criterion 3: step 4's text, and the paragraph "What is proposed" unchanged.
- Criterion 4: the section's text, and `checks/budgets.test.mjs` passing within the new budget.
- Criterion 5: the results above; the kit's `.npmrc` and `package.json`, read at the work.
- Criterion 6: `git diff --stat` against the default branch on the hosting service, and the profile's `verify`.

**Plan.** After the approval, one commit of the work: the four files with the record's log. Then the verification, the
checker on the strong tier, the closing commit and the pull request. The security review is not due: the change is to
the text of rules and a budget, and touches no authentication, permission, secret, deploy or CI configuration or data
schema, and the profile lists no path under `security-review`. No part runs in parallel: three short texts that must
agree with each other, and one number.

**Assumptions.** The other npm 12 releases behave as 12.2.1 does for these settings: `devEngines` admits any npm 12.

**Risks.** A project on an npm 12 that lacked `min-release-age-exclude` would read it as unknown: a fix or Claude Code
would then be refused, never let through, and the item that meets it sees the error.

**For the person.** The change touches four existing files, one more than the profile's `kinds` expects of a rule: the
fourth is the budget's line. The measure only reports it; nothing fails on it.

## Log

- `git config user.email` matches the profile's `commits.address`. The item has no areas, so no area pack is loaded.
- `node checks/verify.mjs --setup` ran once in the worktree before the first commit: `npm ci --ignore-scripts` passed.
- The other open item, `261124-1550`, also changes `skills/assessment/SKILL.md`, `docs/01-specs/WORKFLOW.md` and
  `checks/budgets.test.mjs`. This item changes only step 4 of the first, the section "Dependencies" of the second, and
  in the third the budget of `docs/01-specs/WORKFLOW.md`, a number both items may raise, each by what its own change
  needs, the one brought up to date setting it for both (`honsha:parallel-parts`).
- Read the rule on dependencies, the assessment, the workflow's "Dependencies", the profile's template, the budgets,
  the kit's `.npmrc`, the README's requirements, `project.yml` and the GitHub piece, and npm 12.2.1's documentation of
  `min-release-age`, `min-release-age-exclude`, `strict-allow-scripts`, `allow-scripts`, `ignore-scripts`, `before`
  and the project's `.npmrc`. Tried npm 12.2.1, 11.12.1 and 11.20.0 in scratch projects (Strategy).
- The strategy is written and the state set to `awaiting-approval`; the work waits for the person's approval.
