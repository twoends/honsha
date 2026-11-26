---
name: review
description: Use for the periodic review of an installation, on the date its radar and upkeep review is due or when the person asks for one. It holds what the review reads, in order, the inventory's accounts and credentials among them, and how it reports. It changes nothing.
---

The review is started on its date (workflow, Upkeep review) by the installation's scheduler where it has one; until
then, by a scheduled task of the installation, or by a session the person asks. It reads and reports: it edits,
commits, installs and upgrades nothing. What it finds worth doing becomes work items, which the person chooses, and
whose pull requests the person merges.

It reads the repositories of the installation: the kit's clone, the home, and each project the home's registry
holds. In each, it fetches first and reads the default branch as the hosting service holds it, and it reports a clone
that is behind or has changes not committed.

1. **Vulnerabilities.** The package manager's vulnerability report, in each repository with dependencies. A finding is
   urgent: its fix is a work item that starts the same day (`honsha:dependencies`). Name the package, the advisory,
   the version that fixes it and whether that version is out.
2. **Security posture.** The security posture of each repository (`honsha:security-posture`), which says what a review
   compares and what is urgent.
3. **Accounts and credentials.** The home's inventory, `inventory.md`, holds an entry for each account, credential,
   host, connector and plugin of the installation and of its projects, by name and never by value, each with the date
   it is read again, within a year:
   - an account: its service and name, who uses it, what it can write, its second factor, and the applications it
     authorised, with what they reach;
   - a credential: its name as the service shows it, its kind, its account, where it is kept, its scopes and reach,
     what uses it, when it was made, and its expiry or the date by which it is replaced;
   - a host: who reaches it, with which keys, and the credentials it holds;
   - a connector or a plugin: the sessions it reaches, what its tools can change, and the person's choice.

   Its rules: every account that can write to a repository, a host, a project's data or its deployment, or that holds
   a credential, has a second factor, the strongest kind its service offers. Each credential holds the narrowest scopes
   and reach its work needs, and expires or is replaced within a year, within 90 days one that a session can read, and
   at once, the old one revoked, one that may have been exposed. A connector or a plugin whose tools change a service's
   data reaches only the sessions whose work needs it, as the person chooses. The person sets each value; no session
   reads one. Name each date that has passed or falls before the next review, with what its entry reaches; read the
   account and the token that the hosting service's client holds on the host, as `services/<name>/security.md` says,
   and the connectors and plugins of this session, against their entries. Without an inventory, propose one.

4. **Ordinary updates.** Each direct dependency of a project is covered by a radar entry of the installation, with a
   review date. The outdated dependencies are listed with the package manager, each with the newest version that
   `honsha:dependencies` lets an item take. The updates worth making become one work item, full if it holds a major
   upgrade and small otherwise. A review that finds none moves the entries' review dates.
5. **Radar.** The radar entries whose review date is today or past. The entry of a provider that holds the
   installation's data or credentials also weighs its own security: the second factor it offers, the scopes and expiry
   its credentials can have, where it keeps the data, its record of incidents. A provider of the inventory with no entry
   is a finding.
6. **Deferred checks.** The checks that merged records declare under `checks` whose date has passed with no outcome
   in the home: each is named, with its item and what it asks.
7. **Lessons.** A lesson tied to a version of a tool whose upgrade the radar records is reviewed. A level that gives
   less than its files hold (workflow, Lessons) is answered by promoting a lesson of general worth to the kit,
   reviewing one tied to a version, or deleting one that no longer holds; its budget is raised only by a work item
   that says why. A technology or host lesson that has proved generally valid can be proposed for the kit, which
   takes only reviewed lessons, since the home that holds them is personal.
8. **Documents.** The documents and logs of the kit, of the home and of each project, for a rule stated in more than
   one place, text that no longer holds or is history, and anything that contradicts another document (core rules,
   Documents); the core rules and the agents' files for rules that could move to a script or a skill (workflow, Where
   the rules are). Each document's size. The findings become one work item.
9. **Measures.** `node <kit directory>/checks/measures.mjs` in each repository with merged items. The items merged
   since the last review, each with its size, kind and times; every item that touched more existing files than its
   kind expects, with the files it touched and what they have in common, which points to where the project is too
   coupled; the median agent time and output tokens by size and kind, the basis for estimates; and the count of
   session lines the script could not read.

The report comes first with what is urgent; then the proposed work items, each with its size by the core rules
(Sizes) and one line of why, and the protections asked of the person; then the findings on documents; then the
measures and the items over their kind's expectation. It ends with the one question the person must answer to start
the proposed work. When nothing needs doing, it says so in two lines.
