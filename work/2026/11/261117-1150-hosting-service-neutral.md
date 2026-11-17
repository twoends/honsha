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
- 2026-11-17. `ARCHITECTURE.md` reworded in six places and one key fact added. Reworded: the outputs in the key
  facts, the component (now "Hosting identity"), the diagram, the reason for folders by year and month, security
  rule 3 and assumption A5. Added: the key fact "Hosting service", which states the principle.
- 2026-11-17. The two commands were run before and after the change, with the same result.

## Verification

### Commands

The kit has no `.hub/profile.yml` yet. The commands are the two its README names.

- `claude plugin validate .`: passed with warnings, exit code 0, before and after the change.
- `node --test hooks/`: 16 tests, 16 passed, before and after the change.

### Acceptance criteria

1. **Worded for any hosting service:** met. Key facts ("Outputs"), section 2 (component and diagram), section 6
   (rule 3), section 8 (A5).
2. **Meaning unchanged:** met. The identity still pushes branches, opens pull requests and cannot merge; default
   branches are still protected; A5 keeps its fallback.
3. **The principle, once:** met. Key fact "Hosting service".
4. **GitHub only as an example or as what was tried:** met. It is still named in four places:
   - `ARCHITECTURE.md`, key fact "Hosting service": the one service the kit has been tried with;
   - `ARCHITECTURE.md`, section 3.4: an example of a page that stops listing a large folder;
   - `ARCHITECTURE.md`, section 8, A5: what the assumption means on that service;
   - `WORKFLOW.md`, section 9, the indicative profile: `.github/**`, a folder of an example project.
5. **Same result from the two commands:** met.

## Outcome
