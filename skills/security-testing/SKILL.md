---
name: security-testing
description: Use when a work item assesses a project, sets up or changes its static or dynamic security testing, or answers one of their findings. It holds which kinds of security testing a project receives, where the profile names them, how their tools are chosen, and what a finding, a silenced finding and a found secret do.
---

Static testing reads the project's files and history; dynamic testing attacks a running instance from outside. Both
read the whole project at every verification, with tools that know classes of holes that no reader keeps in mind.

## The kinds

A project receives each kind that its files and its surface call for:

- **Secrets committed by mistake:** every project, since any change can commit one.
- **The security rules of each of its languages,** where a free tool has them.
- **Its shell scripts, its container files and its pipeline's configuration,** where it has them. The piece of the
  hosting service, `services/<name>/README.md` in the kit directory, names tools that read its pipeline's files.
- **Dynamic testing:** where the project serves HTTP, as a web application or an API does.

An assessment reads which kinds apply and which the profile has, and proposes an item for each that is missing.

## Where the profile names them

- **Static testing is part of `verify`,** a command for each kind or one command for several: it runs at every
  verification, on the worker's host before the push and in the pipeline alike, whatever the change. The scan for
  secrets reads every commit of the branch and not only its last tree, since a push sends the history: from
  `HONSHA_BASE` to `HONSHA_HEAD` where a pipeline gives them, from the default branch on the hosting service otherwise.
  It prints no secret it finds, only where it is: others read the pipeline's output, anyone on a public repository.
- **Dynamic testing is `dynamic-testing`,** a list of commands that every verification runs after `verify`. They
  start a local instance from the checkout and attack it, with no secret: the pipeline's job holds none, and a test
  value stands in for each. On a worker's host too, nothing reaches the instance from the host's environment or from a
  file of variables that is not committed, and it publishes no port, or only on the host's loopback, so that neither a
  real credential nor the network around the host is within the scan's reach. The instance and the scanner run best in containers on one network, so that one command
  runs on every host and in the pipeline, and stops both when the scan ends. A passive baseline scan at least; an
  active scan of the instance, which the run throws away, where it is worth its minutes.
- **A deployed instance,** preview or production, is never a target of these commands. Scanning one is a work item
  that names it, and production needs the person's leave in that item's approval.

## The tools

- Free, run from the command line on any host and in the pipeline, with no account. A hosting service's own scanners
  can be paid on private repositories, and the rules rely on nothing a service sells; one that a service gives free
  is a further stop.
- A dependency, pinned and taken at a new version as `honsha:dependencies` says: a package of the project's lockfile,
  a container image by its digest, or a release by its checksum.
- Its rules pinned with it, read from the tool or the repository: rules fetched at each run change without a work
  item, and a check that changes by itself fails on code that did not.
- Nothing sent out while it runs: telemetry, checks for updates and online rule registries are off.
- A finding fails its command.
- One that every host of the installation can run. A host that cannot run a command whatever the change leaves it to
  the pipeline (`agents/worker.md`, Verification), but not the scan for secrets: what the pipeline finds there is
  already on the hosting service. So that scanner is one that every host runs, such as one written in the language of
  the project's own package manager.

Examples, each free: gitleaks, secretlint or detect-secrets for secrets; Semgrep's community edition, with a pinned rule
set, for languages; ShellCheck for shell scripts; hadolint for container files; OWASP ZAP's baseline scan for HTTP.

## A finding

- **It is fixed in the item that meets it.** One in the item's own change is the change's; one that a new tool, or a
  new version of a tool or of its rules, brings up belongs to the item that takes it.
- **A finding believed mistaken** is silenced only where it stands, by an inline suppression or an entry of the tool's
  ignore file, with its reason beside it. That change, and any change that removes or narrows a command or a rule of
  the security testing, calls for the security review (`honsha:security-review`): silencing a finding is a judgement
  on a possible hole, which the worker that wrote the change does not make alone. List the tools' configuration and
  ignore files under `security-review` in the profile, so that `checks/record.mjs` names a change to them.
- **A secret found in a commit** is a stop condition (core rules, Stop conditions), before any push: the branch only
  grows, so the commit stays in the history that a push sends, and a secret that reaches the hosting service must be
  revoked. The person decides.
