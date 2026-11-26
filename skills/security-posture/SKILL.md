---
name: security-posture
description: Use when an assessment or the periodic review reads a repository's security posture, as `honsha:assessment` and `honsha:review` ask. It holds what is read, in order: the scan of the whole history for secrets, the kinds of security testing that the files call for, the pipeline's wiring and its token, the hosting service's settings, the protections it gives free, its open alerts, and who and what can reach the repository; what each finding becomes; and what a reading keeps for the next.
---

A repository's security rests also on what lies around its code: the testing that reads it, the pipeline that runs
that testing, the hosting service's settings and protections, who and what can reach it, and the history already
pushed. An assessment reads it before a project joins, and the periodic review reads it again in each repository it
reads: between two readings a setting changes, a protection goes off, an alert opens, a key or an account gains access,
and new files call for a kind of testing. The reading changes nothing. The hosting service's commands are in its piece, `services/<name>/README.md` in the kit directory.

## What is read

In this order. A step that finds the repository in order says so in a line; a gap is a finding. Of a repository whose
settings the account cannot read, as one that another account owns, the service's side is not read, and the report says
so.

1. **The history:** `node <kit directory>/checks/history-secrets.mjs` in the repository's clone
   (`honsha:security-testing`, The history). It comes first: a secret stops an assessment and is urgent at the review,
   and its revocation waits for nothing else.
2. **The kinds of security testing** that the repository's files and surface call for (`honsha:security-testing`, The
   kinds), against the commands of `verify` and `dynamic-testing` in its profile, or what a profile would hold. Each
   kind that is missing is a finding, with its item proposed.
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
   is asked of the person, who turns it on as the piece says. A session never turns one on: each limits what the
   person's own account can do. The person's answer, on or declined, goes into the home's decision log, and later
   readings name a declined one in a line without asking again; one the service sells is named in a line, and is no
   gap.
6. **The open alerts** of the service on dependencies, secrets and code, each read with the piece's command, which
   prints no secret's value. One on a dependency is a vulnerability (`honsha:dependencies`). One on a secret is a secret
   found in the history (`honsha:security-testing`, The history), wherever the service found it. One on code is a
   finding of static testing, whose fix is an item of the project. Closing or dismissing an alert on the service is the
   person's.
7. **Access:** who and what can write to the repository or read its pipeline's secrets, each read as the piece says, by
   name and never by value: its collaborators with their role, and the invitations pending; its deploy keys, and
   whether each writes; its secrets, with where each is kept, the repository, an environment or an organisation; its
   environments, with the branches whose runs enter each. A credential that deploys, or that writes outside the
   repository, is given only to the default branch's runs, never to a run that a pull request starts, which runs the
   workflow files of its own branch; where the piece says that the service cannot hold that limit for the repository,
   such a credential stays out of its pipeline. A deploy key writes only where its work writes. One that breaks these
   rules is a finding, whose fix is an item of the project; one that the home's inventory lacks (`honsha:review`,
   Accounts and credentials), a finding that an item of the home answers.

## What is kept

In the record of the assessment, and in the review's report, for each repository: its visibility, the commit read and
the date the service was read; the scan of the history as it printed it, the scanner's version, the refs and commits
read and each finding, with the reason of each set aside; for each setting and protection, whether it is on, off, not
given free or not read; and the access, by name. A review commits nothing, so it compares with the assessment's record
of the repository and the home's decision log and inventory, and names what none holds. A repository made public, a
setting or a protection that either has on and is now off or not read, or access that neither the last reading nor
the inventory holds, changed outside any work item, and is urgent.
