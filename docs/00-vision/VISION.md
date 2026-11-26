# Vision

## Key facts

- **Name:** Honsha (本社, "head office").
- **What:** one place from which a person runs all their software projects with AI agents: ask it about the projects,
  tell it what to build.
- **Who:** a developer who works on several repositories with Claude Code. Distributed as a template: each user
  installs it with their own accounts.
- **Core loop:** ask or request → the hub answers, or starts work in the right project with the right rules → the
  person approves → the result arrives as a pull request → everything is recorded.
- **Where:** a host, the machine where the home and the projects' clones are and the sessions run.
- **Success sign:** all projects are managed from a single point.

---

## The problem

- Work happens in one agent session per project folder. Starting, following and resuming work means going to the right
  window on the right machine.
- Rules and workflow files are copied into every repository and drift apart. Lessons about the machine are relearned
  per project.
- Every session starts from the same context whatever the task, and the model is chosen by hand.
- "What is the status of project X" has no quick answer, because the state of the work is prose kept by hand.

---

## What it does

1. **One hub.** A conversation with one session, the hub, in the user's home repository: it answers about the
   projects, keeps requests for later and starts work.
2. **Ask.** Status of a project and history of past work, answered from its records, its pull requests and the
   measures of its merged items.
3. **Dispatch.** "Develop this on project X" becomes a work item in that project, executed with that project's rules,
   delivered as a pull request.
4. **Shared layer.** One workflow, one set of rules grouped by kind of work, and one way of capturing lessons, used by
   every project and adjusted per project through a profile.
5. **Periodic review.** On a date, every repository of the installation is read again: vulnerabilities, security
   posture, accounts and credentials, the radar of the tools in use, deferred checks, lessons, documents and measures.
   What it finds becomes work items that the person chooses.
6. **Traceability.** Every piece of work, and every report that answers a question, leaves a record in git.

---

## Principles

- **Simple first.** Native features of the platform before custom code. Curate or write ad hoc; never import a
  collection wholesale.
- **Quality first.** Work runs on a model fit to its size and risk, on the strongest one when it is too complex for
  the default, and is checked by a strong model, never weaker than the work.
- **Nothing leaves without approval.** The hub may research and open pull requests. Merge and deploy belong to the
  person.
- **Records are data.** State lives in structured records, so status, lists and history are derived, not kept by hand.
- **Personal is separate.** Everything specific to a user sits outside the template.
- **Never installed outside a work item.** A tool, a skill or a plugin is adopted through a reviewed change like any
  other.
- **English by default.** A project that says nothing gets its documents in English; a project can set another
  language in its profile.

---

## Non-goals

- A hosted service or a multi-tenant product.
- An organisation of dozens of permanent agents. Kinds of work are rule packs, not characters.
- Support for coding agents other than Claude in the first version.
- Autonomous merge or deploy.
- A general note-taking application. History covers the system's own records.
- Work that needs macOS in the first version.

---

## Glossary

| Term              | Meaning                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hub               | The session in the home from which the person runs the projects, with the kit's agent `honsha:hub`               |
| Kit               | The template repository: workflow, rules, skills, agent definitions, hooks, checks, the hub's scripts, templates |
| Home              | A user's private repository: project registry, settings, decisions, inventory, backlog, radar, lessons, reports  |
| Project           | A registered repository                                                                                          |
| Profile           | A project's configuration for the kit: areas, verification commands, quality gates                               |
| Work item         | One unit of work in a project, with one record                                                                   |
| Record            | The file that holds a work item's intent, plan, log, verification and outcome                                    |
| Area              | A kind of work (deploy, backend, content, …) with its rule pack                                                  |
| Verdict           | The outcome of a checker's or a security reviewer's report: pass or fail                                         |
| Radar             | The tools in use, one entry each in the home, with its review date                                               |
| Host              | A machine where sessions run                                                                                     |
| Worker            | A session that executes one work item                                                                            |
| Checker           | A read-only agent that verifies a result against its record                                                      |
| Security reviewer | A read-only agent that looks for security holes in a change, given the change and not its author's account       |
