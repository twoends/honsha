---
id: 261119-1157
title: Say that each clone installs the kit's plugin once
project: honsha
type: change
size: small
kind: fix
state: done
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: 26
model: claude-opus-5-5
effort: high
checks: []
---

## Intent

The person asked to cover the four points listed to them in a session's chat; this item covers points 1 and 2, both
found while the home declared the kit (the home's item `261119-0904`). First, the kit's README says that the first
session in a new clone adds the marketplace and that the plugin is active from the next one, while a clone needs
`claude plugin install honsha@honsha --scope project` once. Second, that command writes `.claude/settings.json` again
with the same values in another order of keys, which `git checkout` restores. Asked on 2026-11-19, in that chat,
answering whether to cover the four points.

## Acceptance criteria

1. The kit's documents say, in one place, that each clone of a project installs the plugin once with
   `claude plugin install honsha@honsha --scope project`, that the plugin is active from the next session, and that the
   command rewrites `.claude/settings.json` in another order of keys, which `git checkout .claude/settings.json`
   restores.
2. The README's "Working on the kit" no longer says that the plugin is active without that command, and points to that
   place. Its list of what has not been tried no longer names an installation from the marketplace.
3. The profile's `verify` passes.

## Strategy

The place is the architecture's section 3.3, beside the paragraph on the declaration that every project carries: the
install belongs to the platform, not to a hosting service, so not to `services/github/`. The key order is stated
there, with the command, rather than as a lesson in `LESSONS.md`: it holds for every project's clone, not only the
kit's, and a rule is stated in one place.

## Log

- 2026-11-19: branch cut from `main` at `c117339`. The architecture's section 3.3 gains the install, the next
  session and the order of keys, after the paragraph on the declaration. The README's "Working on the kit" points
  there in place of the sentence on the first session; its requirements no longer list an installation from the
  marketplace as not tried, since the home's item `261119-0904` installed the plugin from the marketplace on GitHub.
- `claude plugin validate .` also warns that the README has no line installing `honsha` in the form
  `/plugin install honsha --marketplace <owner>/<repo>`. That form was not tried, so the README does not give it; the
  warning does not fail the command.

## Verification

On `83d90c0`, `node checks/verify.mjs`: all 7 commands passed.

- `prettier --check .`: passed.
- `oxlint`: passed.
- `tsc -p .`: passed.
- `node --test`: passed.
- `claude plugin validate .`: passed with warnings (no version, licence or icon; no install line in the README's
  form).
- `node checks/record.mjs`: passed.
- `node checks/commits.mjs`: passed, 1 commit.

### Checker report

On `83d90c0`, a full check.

**Verdict:** pass

**Acceptance criteria**

1. One place says a clone installs the plugin once with the command, that the plugin is active from the next session, and that `git checkout .claude/settings.json` restores the reordered settings: met, `docs/01-specs/ARCHITECTURE.md` lines 149-152, section 3.3. No other document repeats it: a search of the repository outside `work/` finds the install command and the key order only there.
2. The README no longer says the plugin is active without the command, points to that place, and no longer lists an installation from the marketplace as not tried: met, `README.md` lines 68-69 ("Each clone installs the plugin once, as the architecture says in section 3.3.") and lines 36-39.
3. The profile's `verify` passes: not verifiable from the record. Its Verification section is still empty. The caller reports that all 7 commands passed on 83d90c0.

- **Intent:** in order. Points 1 and 2 of the person's four are both covered: the wrong first-session sentence is gone, and the install step and the key order are now stated.
- **Scope:** in order. The diff touches only `README.md`, `docs/01-specs/ARCHITECTURE.md` and the record. That is 2 existing files, within the 4 the profile allows for kind `fix`.
- **Comments and documents:** in order. The diff adds no comments. The replaced README sentence was deleted, not kept with a note, and the rule is stated once, with the README pointing to it.
- **Gates:** in order. "The rules name no hosting service": the new architecture paragraph names none. "Nothing about a user, a user's project or an installation": the changed documents hold nothing of the kind. "A script comes with its test": no script changed.
- **Verification evidence:** not yet in the record; it goes into the closing commit (see Not verified); covers formatting (`prettier --check .`), lint (`oxlint`), types (`tsc -p .`), tests (`node --test` over hooks, checks, hub and services). `claude plugin validate .`, `node checks/record.mjs` and `node checks/commits.mjs` are also in `verify`.
- **Record:** in order. The size is small, and the item is a change to two documents with no case from the always-full list. The extra context after the quoted intent follows the same convention as earlier records. The log's second line, on the validator's warning, is in the working tree and not yet committed.
- **Commits:** in order. One commit, 83d90c0 "Say that each clone installs the kit's plugin once, and how to restore the settings it reorders". It is one imperative sentence with the trailer `Work-Item: 261119-1157`, and its author and committer match the profile's address pattern.

**Findings**

none

**Not verified**

- The results of the 7 `verify` commands, including `checks/record.mjs` and `checks/commits.mjs`, are not under Verification yet. The core rules put them in the closing commit, so they can only be checked against the caller's statement that all passed on 83d90c0.
- The record does not say where points 3 and 4 of the person's four are handled, so whether they are covered elsewhere cannot be checked from this repository.
- The platform behaviour now stated in `docs/01-specs/ARCHITECTURE.md` lines 149-152 rests on the home item `261119-0904`, which lives in another repository. That behaviour is that the plugin is active only from the next session after the install, and that the command rewrites the settings in another key order. It cannot be confirmed from here.

## Outcome

The architecture's section 3.3 says that each clone of a project installs the plugin once, with
`claude plugin install honsha@honsha --scope project`, that the plugin is active from the next session, and that
`git checkout .claude/settings.json` restores the file the command writes in another order of keys. The README points
there, and no longer lists an installation from the marketplace as not tried. Points 3 and 4 of the person's four are
the home's pull request 5 and the kit's item `261119-1200`.
