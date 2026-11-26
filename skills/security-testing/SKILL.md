---
name: security-testing
description: Use when a work item sets up or changes a project's static or dynamic security testing, or answers one of their findings, and when the security posture reads the kinds a repository calls for or scans its history. It holds the kinds, the tools, what a finding does, and the scan of the history.
---

Static testing reads the project's files and history; dynamic testing attacks a running instance from outside.

## The kinds

A project receives each kind that its files and its surface call for:

- **Secrets committed by mistake:** every project, since any change can commit one.
- **The security rules of each of its languages,** where a free tool has them.
- **Its shell scripts, its container files and its pipeline's configuration,** where it has them; a script that only
  hands its quoted arguments to another program, as `exec node <script> "$@"` does, holds nothing for a linter. Its
  hosting service's `services/<name>/security.md`, in the kit directory, names tools that read its pipeline's files.
- **Dynamic testing:** where the project serves HTTP, as a web application or an API does.

The security posture (`honsha:security-posture`) reads which kinds apply and which the profile has.

## Where the profile names them

- **Static testing is part of `verify`,** a command for each kind or one command for several: it runs at every
  verification, on the worker's host before the push and in the pipeline alike, whatever the change. The scan for
  secrets reads every commit of the branch and not only its last tree, since a push sends the history: from
  `HONSHA_BASE` to `HONSHA_HEAD` where a pipeline gives them, from the default branch on the hosting service otherwise.
  It prints no secret it finds, only where it is: others read the pipeline's output, anyone on a public repository.
- **Dynamic testing is `dynamic-testing`,** a list of commands that every verification runs after `verify`. They
  start a local instance from the checkout and attack it, with no secret: the pipeline's job holds none, and a test
  value stands in for each. On a worker's host too, nothing reaches the instance from the host's environment or from a
  file of variables that is not committed, and it publishes no port, or only on the host's loopback, so that no real
  credential reaches the instance and no other machine reaches it while it runs. The instance and the scanner run best
  in containers on one network, so that one command runs on every host and in the pipeline and stops both when the
  scan ends. A passive baseline scan at least; an active scan, which the run throws away, where it is worth its
  minutes, on a network with no way out, so that nothing it makes the instance call reaches beyond it.
- **A deployed instance,** preview or production, is never a target of these commands. Scanning one is a work item
  that names it, and production needs the person's leave in that item's approval.

## The tools

- Free, run from the command line on any host and in the pipeline, with no account. A hosting service's own scanner
  is no part of the rules; one that it gives free is a further stop, which the security posture asks for.
- A dependency, pinned and taken at a new version as `honsha:dependencies` says: a package of the project's lockfile,
  a container image by its digest, or a release by its checksum.
- Its rules pinned with it, read from the tool or the repository, never fetched at each run.
- Nothing sent out while it runs: telemetry, checks for updates and online rule registries are off.
- A finding fails its command.
- One that every host of the installation can run. A host that cannot run a command whatever the change leaves it to
  the pipeline (`agents/worker.md`, Verification), but not the scan for secrets, so that scanner is one that every host
  runs, such as one written in the language of the project's own package manager.

Free examples: gitleaks, secretlint or detect-secrets for secrets; Semgrep's community edition, with a pinned rule
set, for languages; ShellCheck for shell scripts; hadolint for container files; OWASP ZAP's baseline scan for HTTP.

## A finding

- **It is fixed in the item that meets it.** One in the item's own change is the change's; one that a new tool, or a
  new version of a tool or of its rules, brings up belongs to the item that takes it.
- **A finding believed mistaken** is silenced only where it stands, by an inline suppression or an entry of the tool's
  ignore file, with its reason beside it. That change, and any change that removes or narrows a command or a rule of
  the security testing, calls for the security review (`honsha:security-review`). List the tools' configuration and
  ignore files under `security-review` in the profile, so that `checks/record.mjs` names a change to them.
- **A secret found in a commit,** by a scan or by the hosting service refusing the push that holds it, is a stop
  condition (core rules, Stop conditions), before any further push: the branch only grows, so the commit stays in the
  history that a push sends, and a secret that reaches the hosting service must be revoked. The person decides.

## The history

A scan of a branch misses a secret committed before the project had one, or pushed outside a work item: every clone
still holds it.

- **The scan,** `node <kit directory>/checks/history-secrets.mjs` in the repository's clone, reads every ref the hosting
  service serves, those it keeps for pull requests included, which hold deleted branches' commits; what it keeps
  beyond any ref, and who opened a pull request, are in `services/<name>/security.md`. A host that cannot run the
  scanner says so, with the system's message.
- **A session never reads a value:** it opens no file at a finding's commit, and scans with the script alone, whose
  report masks each finding's line.
- **A finding is a secret** unless its file, rule and masked line show otherwise, as a test's fixture, an example or an
  identifier does, with the reason written. A secret stops an assessment (core rules, Stop conditions) and is urgent at
  the review: the person gets the list at once, revokes the secret at its provider and decides whether the history
  changes. No session changes a history, nor writes anywhere public where a live secret is. In a public repository, one
  that only the refs of pull requests reach, each opened by someone outside the project, can be a stranger's: listed
  apart, it is neither a stop nor urgent.
- **A public repository's history is public:** a secret there is taken for used, and revoking it is the remedy, since
  forks, clones and archives keep it whatever the history becomes. In a private one revoking comes first too, and a new
  history narrows who reads it later, at the cost of every clone and open branch. Made public, a repository publishes
  its whole history.
- **The findings answered** are listed in `.gitleaksignore` on the default branch by an item that the assessment or the
  review proposes, each fingerprint under a comment line with its outcome: revoked on a date, or no secret and why. An
  entry silences a finding, so that item calls for the security review (A finding).
