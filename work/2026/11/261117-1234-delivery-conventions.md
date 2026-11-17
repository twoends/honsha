---
id: 261117-1234
title: Delivery conventions, checks on pull requests and the guard
project: honsha
type: change
size: full
state: awaiting-approval
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: null
effort: null
checks: []
---

## Intent

The person accepted, as written, all fourteen recommendations on delivery conventions that had been put to them. Twelve
of them concern the kit: they are D62 to D73 in the author's decision log, which is kept outside this repository, and
the scope below restates what they ask of the kit.

Earlier the same day the person had said what the kit must hold. The commit and branching strategy goes into the kit,
because other users must be able to repeat it too. For the checks on a pull request, the version specific to GitHub is
to be built, since GitHub is the service the person chose; a user of the kit who chooses another service, Bitbucket for
one, must still find in the kit what guides building the checks there.

Asked on 2026-11-17, in the chat of a session on the kit, answering whether the fourteen recommendations were accepted
as written.

### Addenda

2026-11-17, after the pull request was opened. The checker had left to the person whether the GitHub piece may name
GitHub's plans. The person decided that it should not: no other user can be required to take a paid plan to use the kit,
so by default everything must run on the free plan.

## Scope and acceptance criteria

### In scope

1. **Commits and branches, as rules every user gets** (D62, D63, D65 to D68), in `rules/core.md`, `agents/worker.md` and
   a new section of `docs/01-specs/WORKFLOW.md`:
   - a commit message is one plain imperative sentence in English, with a body only when the reason is not in the
     record; a project's own convention lives in the project's own rules;
   - every commit a session makes on a work branch ends with the trailer `Work-Item: <id>`;
   - for a full item, the record with its strategy and then the approval are two commits that touch only the record and
     come before any other file; a work branch only grows: no amend, no rebase, no squash;
   - a pull request is merged with a merge commit; the merged branch is deleted, on the hosting service and locally;
   - a work branch is brought up to date only on a conflict, a need or a request, by merging the default branch into it,
     after which the verification and the checker run again; parallel parts work on local branches cut from the item's
     branch.
2. **The checker reads the commits.** The worker writes the list of the branch's commits to a file that is not
   committed, next to the diff. The checker checks the trailer, the order of the approval gate of a full item, and what
   the profile's gates say about commits (`agents/worker.md`, `agents/checker.md`).
3. **The kit's checks as one list of commands** (D70): a profile for the kit, whose `verify` lists the tests, the plugin
   validator and a new check of the branch's commits; a small script that runs a profile's `verify` list, so that a
   worker, a person and the wiring of any hosting service run the same commands.
4. **Two contracts in the workflow,** in words that name no service: what the wiring of a hosting service has to meet to
   run the checks on a pull request; and what the piece of a hosting service has to say (the commands that open, read
   and merge a pull request there; what the service can enforce and under which conditions; how to see who merged).
5. **The GitHub piece,** apart from the rules: a text that answers both contracts for GitHub and lists the repository
   settings the rules rely on; the list of GitHub's merge commands; the workflow file that runs the kit's `verify` list
   on pull requests, on Linux and on Windows.
6. **The guard** (D73): a hook that runs before a shell command and refuses a push to the default branch, a forced push,
   and the merge commands that the pieces of the hosting services list. With tests, and tried in a session without a
   terminal.
7. **Patterns that need no list** (D71): a test that the kit's files hold no e-mail address other than documented
   placeholders and no path into a user's folder.
8. **Documents.** `docs/01-specs/ARCHITECTURE.md`: the layout (3.1); what the kit adds to a project (3.3), with the
   worktree setting; one sentence in section 6 on what holds where; the direction of O10 (D69). `README.md`: the
   requirements, with the Node.js versions and a client for the hosting service, and how a change to the kit is checked.

### Out of scope

- Settings on a hosting service or in an account. They belong to each installation, and the person applies them.
- The hook against personal content that runs before a push, and its word list: they live outside this repository (D71).
- A pipeline template for projects (D72); wiring for any hosting service other than GitHub; a check of Markdown
  formatting; the append-only check on records; tags, releases and a version in the manifests (D69).
- Any rule about the co-author trailer that the platform adds (D64).
- The hub, the index, the board, and any other repository.

### Boundaries

- Nothing about a user, a user's project, an account, a plan or a price (D57).
- The rules name no hosting service (D61). GitHub is named only in the GitHub piece, in the kit's own profile and
  workflow file, and where a document says what the kit has been tried with.
- The kit's scripts use Node.js and git only: no package is installed. What the pipeline downloads is decision 3 below.
- The core rules and the record template together stay under the limit the kit's test sets.
- `docs/01-specs/ARCHITECTURE.md` is changed only after the pull request that words it for any hosting service is in the
  default branch, and the default branch has been merged into this one.
- `main` changes only through this item's pull request. No merge, no force-push. This branch follows the rules it
  introduces from its first commit: the trailer, the two gate commits, no rewriting.

### Acceptance criteria

1. **Rules.** `rules/core.md`, `agents/worker.md` and the new section of the workflow state the five rules of scope 1
   and name no hosting service. In a disposable repository, a session with the kit loaded that is asked for a small
   change makes commits with a plain imperative subject that end with `Work-Item: <id>`.
2. **Checker.** Given a list of commits in which one lacks the trailer, or in which a file other than the record changes
   before the approval of a full item, the checker's verdict is `fail` and it names the commit. Given a clean list it
   reports the trailer and the gate order as met. Shown in one run of each kind.
3. **Commit check.** The script passes on this branch. On a throwaway branch it fails, naming the commit, for a commit
   without the trailer, for a trailer with another identifier, and for an author or committer address outside the
   pattern. Its automated tests pass.
4. **One list.** The kit has a profile. The runner runs its `verify` list, prints each command with its result and exits
   with an error when one fails. The verification of this item is that list.
5. **Contracts.** `docs/01-specs/WORKFLOW.md` holds both contracts and names no service in them.
6. **GitHub piece.** Its text answers every point of both contracts for GitHub. The workflow file gives its token read
   access only and pins the actions it uses to a commit. It runs the `verify` list on this item's own pull request, on
   Linux and on Windows, and the result of that run is written in this record.
7. **Guard.** With the kit loaded, in a session without a terminal, a push to the default branch, a forced push and a
   merge command are each refused and the session is told why; an ordinary push of a work branch goes through. The
   automated tests pass and include commands the guard must let through.
8. **Patterns.** The test passes on the kit, and fails when a file with an e-mail address or with a path into a user's
   folder is added.
9. **Documents.** `ARCHITECTURE.md` and `README.md` match what was built. The direction of O10 names the second route.
   Linux is recorded as verified or as not verified, according to what the pipeline's run showed.
10. **Budget.** The core rules and the record template stay under the limit, and the tests that existed before this item
    still pass.
11. **Public from the first commit.** No commit of this item holds anything the first boundary excludes. Every commit
    ends with this item's trailer, and its author and committer addresses match the pattern in the kit's profile.
12. **Delivery.** A pull request from `work/261117-1234-delivery-conventions` to `main` holds the change and this
    record, with its log, verification and outcome. It is not merged by the worker.

## Strategy

### Facts it rests on

Read on 2026-11-17 in the documentation of git, of Claude Code and of GitHub, and tried on Windows 11 with git 2.53,
Node.js 26 and Claude Code 2.1.325 where marked as tried. The research behind the decisions is in the author's discovery
notes, outside this repository.

- `git commit --trailer` writes a trailer and `git log --format='%(trailers:key=Work-Item,valueonly)'` reads it. Tried.
- A push that is not forced can only fast-forward a branch, so the pushed commits of a work branch and their order stay
  as they are.
- After the default branch is merged into a work branch, `git diff <default-branch>...HEAD` still shows only the item's
  changes. Tried.
- A branch cannot be created below the name of an existing one: with `work/1-item` present, `work/1-item/part-a` is
  refused. Tried.
- A worktree that Claude Code creates starts from the default branch on the remote unless the setting `worktree.baseRef`
  is `"head"`.
- A plugin's hook on `PreToolUse` can stop a tool call by exiting with code 2, and its message reaches the session. The
  documentation says that matching a shell command by its text is not a security boundary, and does not say whether the
  stop holds in a session without a terminal.
- `claude plugin validate .` runs without a login. Tried.
- On GitHub a workflow started by a pull request checks out the merge of the pull request with its base branch; workflow
  files are read only from `.github/workflows/`; the workflow's token can be limited to reading; a checkout fetches one
  commit unless told otherwise; the runners come with Node.js 22 or 24.

### Design

1. **Where the rules go.** `rules/core.md` gets a short block on commits and two lines under "Delivery". The detail goes
   into a new section of the workflow, "Commits and branches", added after the existing sections so that no section
   number changes. `agents/worker.md` gets the trailer, the two gate commits, the list of commits for the checker, how a
   branch is brought up to date, the branches of parallel parts and the clean-up after a merge.
2. **The trailer.** `Work-Item: <id>` in the last block of the message, after the body if there is one. The trailer the
   platform adds may sit in the same block. A commit that the hosting service writes, such as a merge made on its site,
   is exempt.
3. **The list of commits for the checker.** A file `.honsha-checker.commits` next to `.honsha-checker.diff`, neither
   committed: for each commit of `<default-branch>..HEAD`, in order, its identifier, author and committer addresses,
   subject, trailers and the files it touches.
4. **New places.** `checks/` for the runner (`verify.mjs`), the commit check (`commits.mjs`) and their tests;
   `services/github/` for the GitHub piece (`README.md`, `merge-commands.json`); `.github/workflows/verify.yml`;
   `.hub/profile.yml`.
5. **The address pattern.** A new optional key of the profile, `commits.address`, holds a regular expression that the
   author and committer addresses of every commit must match. The kit's own profile sets it to the noreply addresses of
   the service that hosts the kit. A profile without the key has no such check.
6. **The runner.** `node checks/verify.mjs` reads the `verify` list of `.hub/profile.yml`, runs each command through the
   shell, prints each command with its result and stops at the first failure. It reads only a plain list of strings
   under `verify:` and refuses any other form, so no YAML library is needed.
7. **The guard.** `hooks/guard.mjs` on `PreToolUse` for the shell tool. It refuses: a `git push` whose destination is
   the default branch, or that pushes every branch; a `git push` with a force option or with a refspec that starts with
   `+`; and a command that matches a pattern in the `merge-commands.json` of a service's piece. The default branch comes
   from the profile, and is `main` or `master` when there is no profile. It exits with code 2 and one line of reason. A
   command it cannot read is let through: it guards against a mistake, and it must not stop work by failing.
8. **The GitHub piece.** `services/github/README.md` answers the two contracts for GitHub: when the workflow runs and on
   what, what it reports, what can stop a merge and under which conditions, what it costs; the commands that open, read
   and merge a pull request; the two repository settings the rules rely on (merge commits only, merged branches
   deleted); with which address a merge made on the site is authored. `merge-commands.json` lists the patterns of
   GitHub's merge commands.
9. **The workflow file.** It runs on pull requests to the default branch. Its token can only read. A newer run cancels
   an older one of the same pull request. Two jobs, Linux and Windows: check out the whole history, set up Node.js,
   install Claude Code at a named version, run `node checks/verify.mjs`. The actions are pinned to a commit.
10. **Node.js versions.** The README states Node.js 22 or later. The Linux job runs on 22 and the Windows job on the
    version the kit was built with, so the pipeline is what shows the claim. If the tests fail on 22 because of the
    version, the lowest version is raised and the record says so.
11. **The architecture.** Changed last, once the other pull request is in the default branch and merged into this one:
    the layout in 3.1; in 3.3 the project's settings also set `worktree.baseRef` to `"head"`; one sentence in section 6
    (the guard holds everywhere; protection on the server holds where the hosting service gives it); the second route in
    O10.
12. **Patterns that need no list.** A test in `checks/` over the tracked files outside `work/`: no e-mail address except
    documented placeholders, no path into a user's folder on Windows, Linux or macOS.

### Plan

1. The runner, the commit check and their tests; the kit's profile.
2. The guard and its tests; the live run without a terminal.
3. The core rules, the worker and the checker; the live runs of criteria 1 and 2.
4. The workflow's new sections; the GitHub piece; the workflow file.
5. The README; the patterns test.
6. The architecture, after the default branch has been merged into this one.
7. Verification: the `verify` list, then the checker.
8. Outcome and pull request; the pipeline's first run, and its result into this record together with the pull request's
   number.

One worker, in sequence. Several parts change the same files (`docs/01-specs/WORKFLOW.md`, `hooks/hooks.json`,
`README.md`) and the guard reads a file of the GitHub piece, so they fail the independence test of the workflow's
section 5.1.

### Assumptions to confirm while building

- A `PreToolUse` hook that a plugin ships stops a shell call in a `claude -p` session.
- The kit's tests pass on Node.js 22.
- Claude Code installs on GitHub's Linux and Windows runners without a login, and the validator runs there.
- A workflow file that a pull request adds runs on that same pull request.
- The additions to the core rules fit the budget.

### Risks

- **The guard matches text.** It stops a mistake, not a session that was manipulated, and the architecture's sentence
  says so. A command hidden in a script or an alias gets past it.
- **A guard that refuses too much stops work.** Its tests list commands it must let through: an ordinary push of a work
  branch, the first push that sets the upstream, a commit whose message mentions a force option.
- **Longer rules are followed less.** The block on commits is kept short, and criterion 1 tests behaviour, not only the
  text.
- **The pipeline's first run comes after delivery.** A failure is corrected by further commits on this branch, and the
  record says what happened.
- **Order with the other pull request.** If it is not merged when step 6 is reached, the item stops there and asks.
- **Windows runner.** If Claude Code cannot be installed there, that job leaves the validator out and the record states
  it as a deviation.
- **Usage.** About ten short sessions for the live runs, and a few minutes of the hosting service's runners for each run
  of the pipeline.

### Decisions for the person

1. **Names and places.** `checks/`, `services/github/`, `.hub/profile.yml` for the kit, the trailer `Work-Item`, the
   file `.honsha-checker.commits`.
2. **A new profile key, `commits.address`.** It makes the address rule a value that a script can check. The alternative
   is a sentence among the profile's `gates`, which only the checker reads.
3. **What the pipeline downloads.** Two of GitHub's own actions, for the checkout and for Node.js, and Claude Code for
   the validator, each at a fixed version. They are needed by the pipeline only, not by the kit when it runs. The
   alternative is a pipeline that runs the tests and the commit check, with the validator left to the worker.
4. **Node.js 22 as the lowest supported version.**
5. **The model.** The work is not beyond the default model: a worker on the default model can do it from this record.
   The session that wrote this record runs on the strongest model and holds the research; continuing there is quicker to
   start and departs from the rule that the strongest model is for work too complex for the default. The recommendation
   is to continue in that session, because the record cannot carry everything that was read.
6. **One item or two.** One request is one work item, so this is one. If the person prefers, it is split: the rules of
   scope 1 and 2 first, then the checks, the GitHub piece and the guard.

## Approval

## Log

- 2026-11-17. Record written on its branch, cut from the default branch. The session that wrote it ran without the kit
  loaded, so no hook wrote `effort`. The pull request that words the architecture for any hosting service was still
  open.

## Verification

## Deviations

## Outcome
