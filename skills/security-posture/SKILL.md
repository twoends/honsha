---
name: security-posture
description: Use when an assessment or the periodic review reads a repository's security posture, as `honsha:assessment` and `honsha:review` ask. It holds what is read, in order, from the scan of the history to who and what can reach the repository, what each finding becomes, and what a reading keeps.
---

An assessment reads a repository's security posture before a project joins, and the periodic review reads it again in
each repository it reads (workflow, Security posture). The reading changes nothing. The hosting service's commands are
in its piece in the kit directory: the wiring and the settings in `services/<name>/README.md`, the rest in
`services/<name>/security.md`.

## What is read

In this order. A step that finds the repository in order says so in a line; a gap is a finding. Of a repository whose
settings the account cannot read, as one that another account owns, the service's side is not read, and the report says
so.

1. **The history:** `node <kit directory>/checks/history-secrets.mjs` in the repository's clone
   (`honsha:security-testing`, The history). It comes first: a secret stops an assessment and is urgent at the review,
   and its revocation waits for nothing else.
2. **The kinds of security testing** that the repository's files and surface call for (`honsha:security-testing`, The
   kinds), against the commands of `verify` and `dynamic-testing` in its profile, or what a profile would hold. Each
   kind that is missing is a finding, with its item proposed; so is a configuration or ignore file of their tools that
   the profile does not list under `security-review` (`honsha:security-testing`, A finding).
3. **The wiring and its token:** the wiring that the piece shows under "Checks on pull requests and on the default
   branch", which runs the kit's checks, `verify` and `dynamic-testing` on every pull request and on each push to the
   default branch; its token, which holds no more than the piece names; and, where the service has one, the
   repository's default for a pipeline's token, set to read only, since every workflow that names no permissions gets
   it.
4. **The settings** that the piece lists under "Settings the rules rely on".
5. **The protections given free:** each one that the piece says the service gives this repository at no cost, by its
   visibility and the account's plan. A default branch that refuses direct and forced pushes and its deletion, but for
   what the piece says of the home; the wiring's check, required before a merge; the service's scanning for secrets,
   with the refusal of a push that holds one; its code scanning; private reporting of vulnerabilities. One that is off
   is asked of the person, who turns it on as the piece says; a session never turns one on. The person's answer, on or
   declined, goes into the home's decision log, and later readings name a declined one in a line without asking again;
   one the service sells is named in a line, and is no gap.
6. **The open alerts** of the service on dependencies, secrets and code, each read with the piece's command, which
   prints no secret's value. One on a dependency is a vulnerability (`honsha:dependencies`). One on a secret is a secret
   found in the history (`honsha:security-testing`, The history), wherever the service found it. One on code is a
   finding of static testing, whose fix is an item of the project. Closing or dismissing an alert on the service is the
   person's.
7. **Access:** who and what can write to the repository or read its pipeline's secrets, each read as the piece says, by
   name and never by value: its collaborators with their role, and the invitations pending; its deploy keys, and
   whether each writes; its secrets, with where each is kept, the repository, an environment or an organisation; its
   environments, with the branches whose runs enter each. A credential that deploys, or that writes outside the
   repository, is given only to the default branch's runs that no one outside the project can start, as a push to it,
   a run started by hand or a schedule: never to a pull request's run, which runs the workflow files of its own branch,
   nor to one that a comment or another run starts. Where the piece says that the service cannot hold that limit for
   the repository, such a credential stays out of its pipeline. A deploy key writes only where its work writes. One
   that breaks these rules is a finding, whose fix is an item of the project; one that the home's inventory lacks
   (`honsha:review`, Accounts and credentials), a finding that an item of the home answers.

## What is kept

In the record of the assessment, and in the review's report, for each repository: its visibility, the commit read and
the date the service was read; the scan of the history as it printed it, with the reason of each finding set aside; for
each setting and protection, whether it is on, off, not given free or not read; and the access, by name. A review
commits nothing, so it compares with the assessment's record of the repository and the home's decision log and
inventory, and names what none holds. A repository made public, a setting or a protection that either has on and is
now off or not read, or access that neither the last reading nor the inventory holds, is urgent.
