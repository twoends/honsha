---
id: 261119-1157
title: Say that each clone installs the kit's plugin once
project: honsha
type: change
size: small
kind: fix
state: in-progress
areas: []
created: 2026-11-19
updated: 2026-11-19
requested-by: person
source: null
pr: null
model: null
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

## Verification

## Outcome
