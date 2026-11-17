---
id: 261117-1150
title: Word the architecture for any hosting service
project: honsha
type: change
size: small
state: done
areas: []
created: 2026-11-17
updated: 2026-11-17
requested-by: person
source: null
pr: 2
model: claude-fable-5-2
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
- 2026-11-17. The checker ran in a separate session, with `Read`, `Grep` and `Glob` only. Verdict `pass`, no
  findings. The diff file written for it was deleted after the check.

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

### Checker report

**Verdict:** pass

**Acceptance criteria**

1. Identity, diagram, security rule 3 and A5 worded for any hosting service: met. In `docs/01-specs/ARCHITECTURE.md`: line 44 ("Hosting identity … plus protected branches"), line 59 (`GH[Hosting service]`), lines 254-255 ("The hosting identity cannot merge. Default branches are protected on the hosting service"), line 290 ("An identity on the hosting service can push and open pull requests without merge rights"). The key fact "Outputs" (lines 19-20) is reworded too.
2. Meaning unchanged: met. Line 44 still says "Pushes branches and opens pull requests in the registered repositories; cannot merge". Rule 3 still says the identity cannot merge, default branches are protected and deploy credentials are not on the host. A5 keeps its fallback, "A different identity per organisation"; its clause "in a personal account and in an organisation" is kept, now introduced by "On GitHub:".
3. The principle stated once, in words: met. `ARCHITECTURE.md` lines 21-24, key fact "Hosting service": each installation chooses the service, the kit does not depend on which one, and "So far the kit has been tried with GitHub only". It appears nowhere else in the file.
4. GitHub only as an example or as what was tried, with the places listed: met. A case-insensitive search of the repository outside `work/` finds four mentions, and they are the four the record lists:
   - `ARCHITECTURE.md:23`: what the kit was tried with.
   - `ARCHITECTURE.md:162`: an example ("GitHub, for one, lists at most 1,000 entries per folder").
   - `ARCHITECTURE.md:290`: A5, what the assumption means on that service.
   - `WORKFLOW.md:244`: `.github/**` in the indicative profile of an example project.
   
   No other hosting service is named anywhere.
5. Same result from `claude plugin validate .` and `node --test hooks/`: not verifiable. The record states the same result before and after; I cannot run commands. The diff touches one Markdown specification and the record, and nothing under `hooks/` or `.claude-plugin/`.

**Intent:** Met. The intent is to make the architecture independent of the service that hosts the repositories. The architecture no longer requires GitHub anywhere and states the principle in its key facts.

**Scope:** In scope. The diff changes `docs/01-specs/ARCHITECTURE.md` and adds the record, nothing else. Two rewordings go beyond the places criterion 1 names: the key fact "Outputs" and the reason for folders by year and month in section 3.4. Both are needed for criterion 4 and both are in the log.

**Gates:** no gates. The repository has no `.hub/profile.yml`, and the record says so.

**Verification evidence:** With no profile there are no `verify` commands. The record uses the two commands the README names (`README.md:54-55`); neither was run again.
- `claude plugin validate .`: recorded as passed with warnings, exit code 0, before and after.
- `node --test hooks/`: recorded as 16 tests, 16 passed, before and after.

**Record:** In order for a small item at the point of checking.
- The intent restates the request and says what it refers to.
- Acceptance criteria, a short strategy, a log with three entries and the verification section are present.
- No "Deviations" section, and none is needed.
- No always-full case: rule 3 is reworded in a specification, and no permission, credential, CI or deploy configuration, schema, dependency or public interface is touched.
- Still open: "Outcome" is empty, `state` is `in-progress`, and `model` and `pr` are null. These are for the finishing session to fill in before delivery.

**Findings**

none

**Not verified**

- The results of the two commands, because I cannot run them. The record also does not say what the warnings of `claude plugin validate .` are, so "same result as before" rests on the record alone.
- The decision "D61" that the record cites. It appears nowhere in this repository outside the record, so I could not compare the wording with it.
- The new key fact also says "anything specific to one service is a separate piece that another installation can replace with its own". No such piece exists in the repository yet, so this is a statement of design and cannot be checked against anything.
- The Mermaid node keeps the internal identifier `GH` (`ARCHITECTURE.md:59-60`). It is not displayed, since the label is "Hosting service", and I did not render the diagram.

### After the report

The report above is copied unchanged. The checker ran as `honsha:checker` on `claude-fable-5-2`, the model of the
session that did the work.

On what it could not verify:

- The warnings of `claude plugin validate .`: the manifests have no version, which is deliberate. For a submission
  to the public plugin directory it also remarks that there is no licence and no icon, and it advises a line in the
  README that installs the plugin from a marketplace. The full list was read after the change; before it, the
  verdict was the same, passed with warnings and exit code 0.
- D61 is an entry of the author's decision log, which is kept outside this repository.
- The sentence about a separate piece is a rule of design: nothing specific to a service exists in the kit yet.

`effort` is null because the session that did the work ran without the kit loaded: no hook was there to write it.

## Outcome

The architecture no longer requires GitHub. The identity that pushes branches and opens pull requests is the
"hosting identity", on whatever service an installation uses. A key fact says that the kit does not depend on that
service and that it has been tried with GitHub only. The rules the architecture describes are the same as before.

Left as it is: `.github/**` in the indicative profile of `WORKFLOW.md`. Nothing specific to a service was built or
moved, because nothing of that kind exists in the kit yet.

No deferred check.
