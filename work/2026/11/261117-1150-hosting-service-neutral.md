---
id: 261117-1150
title: Word the architecture for any hosting service
project: honsha
type: change
size: small
state: in-progress
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

The person asked to go ahead with an alignment the person had just been told about: the kit must not depend on the
service that hosts the repositories (D61). The core rules, the worker and the record template already speak only of pull
requests, with no service named. The architecture does not: it names GitHub in a component, in the diagram, in security
rule 3 and in assumption A5. Asked on 2026-11-17, in the chat of a session on the kit.

## Acceptance criteria

1. In `docs/01-specs/ARCHITECTURE.md` the identity that pushes branches and opens pull requests, the diagram,
   security rule 3 and assumption A5 are worded for any hosting service.
2. Their meaning is unchanged: the identity can push branches and open pull requests and cannot merge; default
   branches are protected.
3. The architecture says once, in words, that the kit does not depend on the hosting service, that the service is
   each installation's choice, and which service the kit has been tried with so far.
4. Where the kit's documents still name GitHub, it is as an example or as a statement of what was tried, never as
   something the kit requires. This record lists those places.
5. `claude plugin validate .` and `node --test hooks/` give the same result as before the change.

## Strategy

- **Size: small.** One concern, one file, wording only. Security rule 3 is reworded, not changed: no permission,
  credential or configuration is touched. If the rewording turns out to need a design choice, the item stops and is
  raised to full.
- **Term.** "Hosting service", explained where it is first used, in the key facts. The component "GitHub identity"
  becomes "Hosting identity".
- **Left as they are.** The indicative profile in `WORKFLOW.md` lists `.github/**` among an example project's paths:
  that is a project's own folder, not something the kit reads. The records under `work/` are history. Nothing
  specific to a service is built. The vision already holds the principle this follows from ("Personal is separate").
- **Not part of this item.** What a given service allows for protected branches, and how checks on a pull request
  are wired to a service.

## Log

- 2026-11-17. Record written on its branch, cut from the default branch after the first item was merged. Every
  mention of a hosting service outside `work/` was listed first: six in `ARCHITECTURE.md`, one in `WORKFLOW.md`,
  none anywhere else.

## Verification

## Outcome
