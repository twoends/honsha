---
name: security-posture
description: Use when an assessment or the periodic review reads a repository's security posture, as `honsha:assessment` and `honsha:review` ask. It holds what is read, in order: the scan of the whole history for secrets, the kinds of security testing that the files call for, the pipeline's wiring and its token, the hosting service's settings, the protections it gives free and its open alerts; what each finding becomes; and what a reading keeps for the next.
---

A repository's security rests also on what lies around its code: the testing that reads it, the pipeline that runs
that testing, the hosting service's settings and protections, and the history already pushed. An assessment reads it
before a project joins, and the periodic review reads it again in each repository it reads: between two readings a
setting changes, a protection goes off, an alert opens, and new files call for a kind of testing. The reading changes
nothing. The hosting service's commands are in its piece, `services/<name>/README.md` in the kit directory.

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
4. **The settings** that the piece lists under "Settings the rules rely on": the merge method, merged branches deleted,
   and alerts on vulnerable dependencies without automatic pull requests.
5. **The protections given free:** each one that the piece says the service gives this repository at no cost, by its
   visibility and the account's plan. A default branch that refuses direct and forced pushes and its deletion, but for
   what the piece says of the home; the wiring's check, required before a merge; the service's scanning for secrets,
   with the refusal of a push that holds one; its code scanning; private reporting of vulnerabilities. One that is off
   is asked of the person, who turns it on as the piece says. A session never turns one on: each limits what the
   person's own account can do. One the person declines goes into the home's decision log, and later readings name it
   in a line without asking again; one the service sells is named in a line, and is no gap.
6. **The open alerts** of the service on dependencies, secrets and code, each read with the piece's command, which
   prints no secret's value. One on a dependency is a vulnerability (`honsha:dependencies`). One on a secret is a secret
   found in the history (`honsha:security-testing`, The history), wherever the service found it. One on code is a
   finding of static testing, whose fix is an item of the project. Closing or dismissing an alert on the service is the
   person's.

## What is kept

In the record of the assessment or the review, for each repository: the commit read and the date the service was read;
the scan of the history as it printed it, the scanner's version, the refs and commits read and each finding, with the
reason of each set aside; and, for each setting and protection, whether it is on, off, not given free or not read. The
review compares with the last reading of the same repository, in the home, and names what had none: a setting or a
protection that was on and is now off changed outside any work item, and is urgent, so the person gets it at once.
