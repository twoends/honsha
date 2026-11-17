---
id: 261117-1234
title: Delivery conventions, checks on pull requests and the guard
project: honsha
type: change
size: full
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: null
model: claude-fable-5-2
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

Approved by the person on 2026-11-17, in the chat of the session that wrote this record, when asked whether the
strategy was approved. The approval takes the six decisions for the person as the strategy
recommends them: the names and places; the profile key `commits.address`; what the pipeline downloads; Node.js 22 as the
lowest version; the work continues in the session that wrote the record, on the strongest model; one work item.

## Log

- 2026-11-17. Record written on its branch, cut from the default branch. The session that wrote it ran without the kit
  loaded, so no hook wrote `effort`. The pull request that words the architecture for any hosting service was still
  open.
- 2026-11-17. Approval written. The work starts with the checks, as the plan says.
- 2026-11-17. Checks built in `checks/`: `profile.mjs` reads the three keys of a profile that the scripts need,
  `verify.mjs` runs the `verify` list, `commits.mjs` checks the trailer and the addresses of the branch's commits. The
  kit has a profile, `.hub/profile.yml`, whose `verify` lists the tests, the validator and the commit check.
- Found while building: the checkout of a hosting service is often not on the branch itself, so the commit check takes
  the name of the branch and the two ends of its commits from three environment variables that the wiring sets
  (`HONSHA_BRANCH`, `HONSHA_BASE`, `HONSHA_HEAD`), and from git when they are not set. They go into the contract of a
  wiring.
- Decided while building: the profile lists the tests by pattern (`"hooks/*.test.mjs" "checks/*.test.mjs"`) and not by
  folder, so that the command does not depend on how a Node.js version reads a folder name. The runner uses the default
  shell of the platform, which on Windows is not the shell the hooks use; the kit's three commands work in both. The
  commit check never prints an address.
- 36 tests pass, 16 from before and 20 new. The list of three commands passes through the runner, and the commit check
  passes on this branch (Windows 11, Node.js 26, Claude Code 2.1.325).
- 2026-11-17. The guard built: `hooks/guard.mjs`, a `PreToolUse` hook, and the list of GitHub's merge commands in
  `services/github/merge-commands.json`.
- Decided while building the guard: its matcher covers both shell tools of the platform, `Bash` and `PowerShell`,
  because a command refused in one would pass in the other. The bodies of here-documents and the text inside quotes are
  not read as commands, so that writing about a command is not refused. Deleting a work branch on the remote is let
  through, because the clean-up after a merge needs it. A push with no destination is judged by the branch the checkout
  is on.
- Live run without a terminal (`claude -p`, the kit loaded with `--plugin-dir`, model `claude-haiku-5-5`, a disposable
  repository with a local remote): a push to the default branch, a forced push and `gh pr merge` were each refused, and
  the session reported the guard's reason for each; an ordinary push of the work branch went through; the remote's
  `main` did not move. The assumption that a plugin's `PreToolUse` hook stops a shell call in such a session holds.
- 47 tests pass, 11 of them the guard's.
- 2026-11-17. Rules written. `rules/core.md` has a block on commits and branches and two more sentences under
  "Delivery". `agents/worker.md` has the trailer, the two gate commits, the branches of parallel parts, what to do when
  the default branch moves, the list of commits for the checker and the clean-up after a merge. `agents/checker.md`
  reads the list and has a seventh check, on commits. The core rules and the record template are 7,304 bytes together.
- Decided while writing the rules: the worker's two commands for the checker's files sit in a code block, because the
  second cannot be wrapped. The checker never quotes an address: it says whether it matches. A missing list of commits
  does not stop the checker: it reports the checks on commits as not verifiable.
- Live run for criterion 1 (`claude -p`, the kit loaded with `--plugin-dir`, `claude-opus-5-5`, a disposable
  repository): asked for a short section in a README, the session sized the request trivial, worked on a branch
  `work/<id>-<slug>` and made one commit with a plain imperative subject that ends with `Work-Item: <id>`. It pushed the
  work branch and said that merging, with a merge commit, is the person's. One run.
- Live runs for criterion 2 (`claude -p --agent honsha:checker`, `claude-opus-5-5`, a disposable repository with a
  finished full-size item and a profile that sets `commits.address`). On the real list of commits the verdict was
  `pass`, with the trailer, the order of the approval gate and the addresses reported as met. On a list in which the
  first commit also touched a file other than the record and the third had no trailer, the verdict was `fail` and both
  commits were named by identifier and subject. Neither report quoted an address.
- 2026-11-17. The workflow has two new sections after the existing ones: 13, "Commits and branches", and 14, "The
  hosting service", with what the piece of a service says, the contract of a wiring in six points and the guard.
  Sections 1, 5, 5.1 and 9 were touched where they speak of merging, of the two gate commits, of the branches of parts
  and of the profile's new key.
- The GitHub piece is `services/github/`: `README.md` answers the two contracts for GitHub and `merge-commands.json` is
  the list the guard reads. The wiring is `.github/workflows/verify.yml`: two jobs, Linux with Node.js 22 and Windows
  with Node.js 26, each installing Claude Code 2.1.325 and running `node checks/verify.mjs`; the token can only read and
  the two actions are pinned to a commit.
- Decided while writing: the contract of a wiring has a point that the strategy did not list, the three environment
  variables. The piece states no price and no figure of a plan, only what a plan gives, and says to check GitHub's own
  pages. Both jobs run the whole list; whether Claude Code installs on the Windows runner is seen at the first run.
- 2026-11-17. The test of the patterns that need no list is `checks/public.test.mjs`, on `checks/public.mjs`. It reads
  every tracked file, the records under `work/` included, and reports the file and the line, never the text. It passes
  on the kit. With a file that held an e-mail address, and then with one that held a path into a user's folder, it
  failed and named the file and the line; both files were removed.
- The README names the new folders, says in a section of its own that the rules name no hosting service, asks for
  Node.js 22 or later and for a client of the hosting service, and gives `node checks/verify.mjs` as the way to check a
  change.
- 52 tests pass.
- 2026-11-17. Steps 1 to 5 of the plan are done and the list of three commands passes. Step 6 changes
  `docs/01-specs/ARCHITECTURE.md`, and the pull request that words it for any hosting service is still open. The item
  stops here, as the strategy says, until that pull request is in the default branch: state set to `blocked`. Still to
  do after it: the architecture, the verification with the checker, the outcome, the pull request and the first run of
  the pipeline.
- 2026-11-17. The pull request that words the architecture for any hosting service is in the default branch: the person
  asked the session to merge it, and it was merged with a merge commit. The default branch was then merged into this
  branch, as section 13.5 of the workflow says, without conflict. State back to `in-progress`.
- 2026-11-17. The architecture changed in four places: the layout of 3.1, with the checks, the pieces of the hosting
  services and the kit's profile, and a line on where what is specific to a service sits; in 3.3 the project's settings
  also set `worktree.baseRef` to `"head"`, read in the platform's documentation and not tried; one sentence on the guard
  in section 6, rule 3; the second route in the direction of O10, also named where 3.1 speaks of the version.
- 2026-11-17. First check by `honsha:checker`: verdict `fail`, with one finding. GitHub was named outside the places the
  second boundary allows: in the guard's test, in the README's list of folders and in one line of its requirements.
- Corrected: the guard's test uses the piece of an invented service, and GitHub's commands are tested in
  `services/github/merge-commands.test.mjs`; the profile lists the tests of the pieces as well; the README's requirement
  names no service. Declared as deviation 8: the README and the architecture name GitHub where they list what is in the
  kit. 55 tests pass, and the list of three commands passes again.
- 2026-11-17. Second check by `honsha:checker`: verdict `pass`, no finding. Outcome written, state `done`, model
  `claude-fable-5-2`. `effort` stays null: the session ran without the kit loaded.

## Verification

On Windows 11, with Node.js 26.13, git 2.53 and Claude Code 2.1.325, on 2026-11-17.

The commands of the kit's profile, run through `node checks/verify.mjs`, which ended with exit code 0:

- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 55 tests.
- `claude plugin validate .`: passed with warnings, exit code 0. The warnings are the ones the README names: no version
  in the manifests, and no licence and no icon for the public plugin directory.
- `node checks/commits.mjs`: passed. Every commit of the branch ends with this item's trailer, and its author and
  committer addresses match the pattern of the profile.

The criteria, one by one:

1. **Rules:** met. The five rules are in `rules/core.md` ("Commits and branches" and "Delivery"), in `agents/worker.md`
   and in section 13 of the workflow; a search of those three files and of the record template for the name of a hosting
   service finds none. Live run: `claude -p` with the kit loaded by `--plugin-dir`, on `claude-opus-5-5`, in a
   disposable repository, asked for a short section in a README. It made one commit, on a branch `work/<id>-<slug>`,
   with a plain imperative subject and the trailer `Work-Item: <id>`. One run.
2. **Checker:** met. Two runs of `honsha:checker` on `claude-opus-5-5`, in a disposable repository that held a finished
   full-size item. With the real list of commits: `pass`, with the trailer, the order of the approval gate and the
   addresses reported as met. With a list in which the first commit also touched a file other than the record and the
   third had no trailer: `fail`, with both commits named by identifier and subject.
3. **Commit check:** met. It passes on this branch. The failing cases are automated, in `checks/commits.test.mjs`, each
   in a throwaway repository: a commit without the trailer, a trailer with another identifier, an author address and a
   committer address outside the pattern; each test asserts that the commit is named.
4. **One list:** met. The kit has `.hub/profile.yml`; `checks/verify.mjs` prints each command with its result and exits
   with 1 at the first failure (`checks/verify.test.mjs`); the verification above is that list.
5. **Contracts:** met. Section 14 of the workflow holds what the piece of a service says (14.1) and the contract of a
   wiring (14.2). The only mention of a service in the whole document is the `.github/**` path of the indicative
   profile, which was there before.
6. **GitHub piece:** met in the files, not yet in a run. `services/github/README.md` answers the five points of 14.1 and
   the six of 14.2. `.github/workflows/verify.yml` sets `permissions: contents: read` and pins its two actions to a
   commit; the two commits were read from GitHub as those of the tags `v7.0.1` of `actions/checkout` and `v7.1.0` of
   `actions/setup-node`. Its first run needs this item's pull request: the result is written below once it has run.
7. **Guard:** met. Live run: `claude -p` with the kit loaded, on `claude-haiku-5-5`, in a disposable repository with a
   local remote. A push to the default branch, a forced push and `gh pr merge` were each refused, and the session
   reported the guard's reason; an ordinary push of the work branch went through; the remote's default branch did not
   move. `hooks/guard.test.mjs` has 11 tests, with 26 command lines that must be let through; they use the piece of an
   invented service. GitHub's own commands are tested in its piece, `services/github/merge-commands.test.mjs`.
8. **Patterns:** met. `checks/public.test.mjs` passes on the kit. With a file that held an e-mail address, and then with
   one that held a path into a user's folder, it failed and named the file and the line.
9. **Documents:** met, but for one line. `ARCHITECTURE.md` (3.1, 3.3, section 6 rule 3, O10) and `README.md` match what
   was built. The README still says that the kit has not been tried on Linux: that line is settled by the pipeline's
   first run.
10. **Budget:** met. The core rules and the record template are 7,304 bytes; the test that sets the limit passes, and so
    do the other 15 tests that existed before this item.
11. **Public from the first commit:** met as far as the checks reach. The commit check and the patterns test pass.
    GitHub is named in the GitHub piece, in the kit's profile and workflow file, where a document says what the kit was
    tried with, and where the README and the architecture list what is in the kit (deviation 8). The rules and the hooks
    name no service.
12. **Delivery:** follows this section.

### First check

The checker, `honsha:checker`, ran on `claude-fable-5-2`, the model of the session that did the work. Its reply began
with one line that said it had finished reading; the report is copied from its heading on, unchanged. It was
made before the corrections listed after it: the 52 tests and the line numbers it names are those of that moment.

### Checker report

**Verdict:** fail

**Acceptance criteria**

1. Rules stated, no hosting service named, live run: met in the files. The five rules are in `rules/core.md` lines 40-55, in `agents/worker.md` (lines 21-23, 34-58, 94-100) and in `docs/01-specs/WORKFLOW.md` section 13. A search of `rules/`, `agents/` and `templates/` for a service's name finds nothing. The live run is recorded (log, "Live run for criterion 1") and cannot be verified from here.
2. Checker fails on a bad list and passes on a clean one: not verifiable. `agents/checker.md` holds check 7 and the "Commits" line of the report; the two runs are recorded in the log only.
3. Commit check: met, with declared deviation 6. `checks/commits.test.mjs` covers the missing trailer, another identifier, and author and committer outside the pattern, each naming the commit. The pass on this branch is recorded, not run again.
4. One list: met. `.hub/profile.yml` lines 7-10; `checks/verify.mjs` prints `$ <command>`, then `passed:` or `failed (exit code …)`, and returns 1 at the first failure; the Verification section is that list.
5. Contracts: met. `WORKFLOW.md` 14.1 (five points) and 14.2 (six points). The only service name in the document is `.github/**` at line 245, which was there before.
6. GitHub piece: met in the files; the run is not verifiable. `services/github/README.md` answers 14.1 and 14.2 point by point. `.github/workflows/verify.yml` sets `permissions: contents: read` and pins both actions to a 40-character commit. No pipeline run is in the record, because no pull request exists yet (`pr: null`).
7. Guard: met in the files; the live run is not verifiable. `hooks/hooks.json` lines 14-26 wire `hooks/guard.mjs` on `Bash|PowerShell`. `hooks/guard.test.mjs` has 11 tests, with 26 command lines that must pass (lines 137-168).
8. Patterns: met as far as it can be read. `checks/public.test.mjs` line 50 reads every tracked file. A search of the repository with the two patterns of `checks/public.mjs` finds only placeholder addresses. The two failing trials are recorded in the log only.
9. Documents: partly met; the rest is not verifiable yet. `ARCHITECTURE.md` 3.1, 3.3, section 6 rule 3 and O10 match what was built, and O10 names the second route. `README.md` line 38-39 still says the kit has not been tried on Linux, while line 71 says the list runs on Linux on every pull request. The record says the pipeline's first run settles that line.
10. Budget: not verifiable beyond the record. `hooks/hooks.test.mjs` line 21 holds the limit test; 7,304 bytes and the pass are recorded. The test count is consistent: 16 from before (13 + 3) and 36 new (8 + 7 + 5 + 5 + 11) make 52.
11. Public from the first commit: met for the trailer and the addresses (see Commits). No personal address or user path was found in the tracked files. The naming of GitHub goes beyond the second boundary: finding 1.
12. Delivery: not verifiable yet. `pr: null`, state `in-progress`, "Outcome" empty.

**Intent:** The result does what was asked. The commit and branch rules are in the kit for every user, GitHub's version is built as a separate piece, and `WORKFLOW.md` section 14 gives a user of another service the contract to write their own.

**Scope:** Every file in the diff belongs to the item. The undeclared modules, the `PowerShell` matcher, the wider patterns test and the touched workflow sections are declared as deviations 1 to 5. One departure from a boundary is not declared: finding 1.

**Gates:**
- "the rules name no hosting service": met. `rules/core.md`, `agents/worker.md`, `agents/checker.md` and `templates/` name none.
- "nothing about a user, a user's project or an installation": met as far as it can be read. No name, address or user path is in the diff.
- "a script comes with its test": met. `commits.mjs`, `profile.mjs`, `public.mjs`, `verify.mjs` and `guard.mjs` each have a `.test.mjs`.

**Verification evidence:** Recorded, not run again.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs"`: passed, 52 tests.
- `claude plugin validate .`: passed with warnings, exit code 0.
- `node checks/commits.mjs`: passed.

**Record:** The intent restates the request, with when and where it was made. Scope, strategy, approval, log, verification and deviations are present, and the size is full, as CI configuration and a new hook require. Deviation 7 declares that the session merged another item's pull request at the person's request, against the rule that a session never merges. Not in order: the departure in finding 1 is missing from "Deviations". "Outcome", `model` and `pr` are empty and the state is `in-progress`, which fits a check made before delivery.

**Commits:** met.
- Trailer: all 11 commits carry `Work-Item: 261117-1234` in the last block, together with the platform's co-author trailer.
- Approval gate: `d8a84d5` "Add the record for the delivery conventions" and `1ff95ef` "Record the approval of the delivery conventions" touch only the record. The first other file appears in `243f251` "Add the kit's checks as one list of commands".
- Addresses: the author and committer of every commit match `commits.address`.
- `ARCHITECTURE.md` changes in `e66cbdb`, after the merge of the default branch in `af153ff`, as the boundary requires.

**Findings**

1. GitHub is named outside the places the second boundary allows, and "Deviations" does not declare it. The boundary allows only the GitHub piece, the kit's profile and workflow file, and where a document says what the kit was tried with. The diff also names it in:
   - `hooks/guard.test.mjs` lines 124-131, 158-161, 180 and 187 (`gh pr merge`, `api.github.com`);
   - `README.md` lines 23 and 25 (the layout table);
   - `README.md` line 43 ("With GitHub it is `gh`").

   The Verification text for criterion 11 mentions the README's layout section, but not line 43 or the guard's test. Declare it under "Deviations", or move the GitHub-specific test cases into the piece.

**Not verified**

- The live runs for criteria 1, 2 and 7, and the two failing trials of criterion 8: they ran in disposable repositories and exist only as log entries.
- The three verification commands and the 7,304-byte figure: I cannot run commands.
- Criteria 6 (the pipeline's run), 9 (the Linux line) and 12 (the pull request), and the "Outcome": they come after this check. The item does not meet them until the record holds them.
- Whether the two pinned commits in `verify.yml` are the releases the comments name (v7.0.1, v7.1.0): no network access.
- Whether the first boundary ("an account, a plan or a price") covers `services/github/README.md`. It names GitHub's plans and says which runner minutes are counted and cost more, without figures. The approved design, point 8, asks for "what it costs" and "under which conditions", so I read it as allowed; the person decides.
- Whether the first commit held the state `awaiting-approval`: the list of commits shows files, not content.

### After the first check

- **Finding 1, corrected in part and declared in part.** The commands of GitHub left the guard's test, which now uses
  the piece of an invented service. They are tested in the piece itself, and the profile's list of tests reads the
  pieces too. The README's requirement no longer names a service. The README and the architecture still name GitHub
  where they list what is in the kit: deviation 8.
- **The two pinned commits** were read from GitHub as those of the two tags, as criterion 6 above now says.
- **The first commit** holds the record in the state `awaiting-approval`, and the commit of the approval holds it in
  `in-progress`: read with `git show`.
- **Plans in the GitHub piece.** The piece names GitHub's plans and says which minutes are counted, with no figure. The
  checker read the approved design as allowing it and left the judgement to the person. It is left as it is.
- The verification commands ran again after the corrections: the results at the top of this section are those.

### Second check

The checker ran again after the corrections, on `claude-fable-5-2`. Its reply again began with one line before its report; the
report is copied from its heading on, unchanged.

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. Rules stated, no service named, live run: met in the files; the live run is not verifiable. The five rules are in the diff of `rules/core.md` ("Commits and branches", "Delivery"), of `agents/worker.md` (start step 3, "When the default branch moves", "After the merge") and in `docs/01-specs/WORKFLOW.md` section 13. A search of `rules/`, `agents/`, `templates/`, `hooks/` and `checks/` for the service's name finds nothing. `rules/core.md` does not carry the clause on the branches of parallel parts; the approved design (point 1) places it in the worker and in 13.6, where it is.
2. Checker fails on a bad list, passes on a clean one: not verifiable. `agents/checker.md` holds check 7 and the "Commits" line. The two runs exist only as log entries, and the failing run combined both defects in one list.
3. Commit check: met, with declared deviation 6. `checks/commits.test.mjs` covers the missing trailer, another identifier, and an author and a committer outside the pattern, and asserts the commit is named and no address is printed. The pass on this branch is recorded, not run again.
4. One list: met. `.hub/profile.yml` lines 7-10 hold `verify`. `checks/verify.mjs` prints `$ <command>`, then `passed:` or `failed (exit code …)`, and exits with 1 at the first failure. The Verification section is that list.
5. Contracts: met. `WORKFLOW.md` 14.1 (five points) and 14.2 (six points) name no service. The only service name in the document is the `.github/**` path at line 245, which is not in the diff.
6. GitHub piece: met in the files; the run is not verifiable. `services/github/README.md` answers each point of 14.1 and 14.2. `.github/workflows/verify.yml` sets `permissions: contents: read`, pins both actions to a 40-character commit, and has a Linux and a Windows job running `node checks/verify.mjs`. No pipeline run is in the record (`pr: null`).
7. Guard: met in the files; the live run is not verifiable. `hooks/hooks.json` wires `hooks/guard.mjs` on `PreToolUse` for `Bash|PowerShell`. `hooks/guard.test.mjs` has 11 tests, with 26 command lines that must be let through.
8. Patterns: met as far as it can be read. `checks/public.test.mjs` reads every tracked file. A search of the repository with the two patterns of `checks/public.mjs` finds only placeholder addresses (`checks/commits.test.mjs` lines 15, 16, 62; `hooks/guard.test.mjs` lines 35, 37). The two failing trials exist only as log entries.
9. Documents: partly met; the rest is not verifiable yet. `ARCHITECTURE.md` 3.1, 3.3, section 6 rule 3 and O10 match what was built, and O10 names the second route. `README.md` lines 38-39 still say the kit has not been tried on Linux; the record says the pipeline's first run settles that line.
10. Budget: not verifiable beyond the record. `hooks/hooks.test.mjs` line 21 holds the limit test (under 9,000 characters). The 7,304 bytes and the pass are recorded. The test count is consistent: 16 from before plus 8 + 7 + 5 + 5 + 11 + 3 new make 55.
11. Public from the first commit: met for the trailer and the addresses (see Commits). No personal address or user path is in the tracked files. The content of each single commit cannot be read from here.
12. Delivery: not verifiable yet. `pr: null`, state `in-progress`, "Outcome" empty.

**Intent:** The result does what was asked. The commit and branch rules are in the kit for every user, the GitHub version is built as a separate piece, and `WORKFLOW.md` section 14 gives a user of another service the contract to write their own.

**Scope:** Every file in the diff belongs to the item. Departures are declared as deviations 1 to 6 and 8. GitHub is now named only in its piece, the profile, the workflow file, the README's "tried with" sentence (lines 32-33), and the places deviation 8 declares (`README.md` lines 23 and 25, `ARCHITECTURE.md` lines 95 and 107). `services/github/merge-commands.test.mjs` is not named in the design; it is a test of the guard inside the piece, which I read as covered by scope 6.

**Gates:**
- "the rules name no hosting service": met. `rules/core.md`, `agents/worker.md`, `agents/checker.md` and `templates/record.md` name none.
- "nothing about a user, a user's project or an installation": met as far as it can be read. No name, personal address or user path is in the diff.
- "a script comes with its test": met. `commits.mjs`, `profile.mjs`, `public.mjs`, `verify.mjs` and `guard.mjs` each have a `.test.mjs`; `merge-commands.json` has `merge-commands.test.mjs`.

**Verification evidence:** Recorded, not run again.
- `node --test "hooks/*.test.mjs" "checks/*.test.mjs" "services/*/*.test.mjs"`: passed, 55 tests. The command matches the profile word for word.
- `claude plugin validate .`: passed with warnings, exit code 0.
- `node checks/commits.mjs`: passed.

**Record:** In order: the intent restates the request; scope, strategy, approval (who, when, channel), log, verification and deviations are present; the size is full, as CI configuration and a hook require; the first checker report is copied with what was done after it. "Outcome", `model`, `pr` and `effort` are empty and the state is `in-progress`, which fits a check made before delivery. Deviation 7 declares that the session merged another item's pull request at the person's request, against the rule that a session never merges; it is not a change of this diff and is the person's to accept.

**Commits:** met.
- Trailer: all 12 commits carry `Work-Item: 261117-1234`, together with the platform's co-author trailer.
- Approval gate: `d8a84d5` "Add the record for the delivery conventions" and `1ff95ef` "Record the approval of the delivery conventions" touch only the record. The first other file appears in `243f251` "Add the kit's checks as one list of commands".
- Addresses: the author and committer of every commit match `commits.address`.
- `ARCHITECTURE.md` changes in `e66cbdb` "Say in the architecture where the new pieces sit", after `af153ff` "Merge the default branch into the delivery conventions", as the boundary requires.

**Findings**

none

**Not verified**

- The live runs for criteria 1, 2 and 7 and the two failing trials of criterion 8: they ran in disposable repositories and exist only as log entries.
- Whether "one run of each kind" in criterion 2 means two runs or three. The record shows one clean run and one failing run with both defects.
- The three verification commands and the 7,304-byte figure: I cannot run commands.
- Criteria 6 (the pipeline's run), 9 (the Linux line), 12 (the pull request) and the "Outcome": they come after this check. The item does not meet them until the record holds them.
- Whether the two pinned commits in `verify.yml` are the releases v7.0.1 and v7.1.0: no network access. The record says they were read from GitHub.
- Whether the first boundary ("an account, a plan or a price") covers `services/github/README.md`. It names GitHub's plans, an account setting and which runner minutes cost more, without figures. I read it as allowed, because scope 4 and design point 8 ask for the conditions and the cost and say nothing about any user's account. The record leaves it as it is without a deviation; the person decides.
- Whether the first commit held the state `awaiting-approval`, whether the scope and criteria are unchanged since the approval, and whether the log was only appended to: the list of commits shows files, not content.
- That the person asked for the merge in deviation 7: it is stated only in the record.

### After the second check

- Nothing to correct. What it lists as not verified stays so: the live runs exist only as log entries, and criteria 6, 9
  and 12 are completed by the delivery that follows.
- The scope and the acceptance criteria were not changed after the approval, and the log was only appended to: the
  commits of the record show it to anyone who reads them.

## Deviations

1. **The contract of a wiring has one more point than the strategy described:** the three environment variables through
   which the wiring gives the commands the branch and the two ends of its commits. Without them the commit check cannot
   run in the checkout of a hosting service, which is often not on the branch.
2. **Two modules that the design did not name:** `checks/profile.mjs`, the one reader of a profile that the runner, the
   commit check and the guard share, and `checks/public.mjs`, which the patterns test uses.
3. **The guard's hook covers both shell tools of the platform,** `Bash` and `PowerShell`. The design spoke of the shell
   tool.
4. **The patterns test reads every tracked file,** the records under `work/` included. The design left `work/` out; a
   record is as public as the rest.
5. **Existing sections of the workflow were touched,** beyond the two new ones: 1 and 5 where they speak of merging and
   of the two gate commits, 5.1 for the branches of parts, 9 for the profile's new key and the form of `verify`.
6. **Criterion 3 is shown by automated tests** in throwaway repositories, not by hand on a throwaway branch.
7. **The session merged the pull request of another work item,** the one that words the architecture for any hosting
   service, because the person asked it to. The rules say that the person merges and a session never does. It was merged
   with a merge commit, authored with the noreply address the kit's commits use. Nothing of this item was merged.
8. **The README and the architecture name GitHub where they list what is in the kit:** the folders `services/github/`
   and `.github/workflows/`, and the piece that is built. The second boundary named neither document for this, and a
   reader of the kit has to be told what is in it. The checker's first report found it.

## Outcome

The kit now says how work is delivered, in words that name no hosting service.

- **Rules every user gets.** A commit message is a plain imperative sentence that ends with the trailer
  `Work-Item: <id>`. The record of a full item and then its approval are two commits that hold only the record. A work
  branch only grows. A pull request is merged with a merge commit and its branch is then deleted. A branch is brought up
  to date only when there is a reason, by merging the default branch into it. They are in `rules/core.md`, in the worker
  and in section 13 of the workflow, and the checker reads the commits of a branch to check them.
- **Checks as commands.** The kit has a profile of its own. One command runs the `verify` list of any profile; a second
  checks the commits of a work branch; a test looks for personal content that needs no list.
- **The guard.** A hook refuses merging, a push to the default branch and a forced push in every session.
- **The hosting service.** Section 14 of the workflow says what the piece of a service holds. The piece for GitHub is
  the first: its commands, its settings, what it can enforce, and the workflow file that runs the checks on pull
  requests.

Left out by the scope: the settings on the hosting service, the hook with the word list, a pipeline template for
projects.

Not verified here: Linux and Node.js 22, which the pipeline's first run on this item's pull request shows; the guard
under the `PowerShell` tool in a live session, where only the reading of commands is tested; the setting
`worktree.baseRef`; macOS.
