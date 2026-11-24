# Vision

## Key facts

- **Name:** Honsha (本社, "head office").
- **What:** one place from which a person runs all their software projects with AI agents. Send it anything, ask it
  anything about the projects, tell it what to build.
- **Who:** a developer who works on several repositories with Claude Code. Distributed as a template: each user
  installs it with their own accounts.
- **Core loop:** send or ask → the hub evaluates, answers, or starts work in the right project with the right rules →
  the person approves → the result arrives as a pull request → everything is recorded.
- **Where:** an always-on Linux host. No personal device has to be switched on.
- **Success sign:** all projects are managed from a single point.

---

## The problem

- Work happens in one agent session per project folder. Starting, following and resuming work means going to the right
  window on the right machine.
- Rules and workflow files are copied into every repository and drift apart. Lessons about the machine are relearned
  per project.
- Every session starts from the same context whatever the task, and the model is chosen by hand.
- Interesting tools and techniques arrive as links and short videos. Judging them takes time, so most are forgotten or
  adopted without scrutiny.
- "What is the status of project X" has no quick answer, because the state of the work is prose kept by hand.

---

## What it does

1. **One channel.** A conversation with the hub from a messaging app and from a web interface. Text, links, voice
   notes and screenshots are accepted.
2. **Evaluate.** Anything sent is judged against the registered projects and the tools already in use. The verdict is
   Adopt, Trial, Watch or Ignore, with the reasons and, when useful, how to fit it in. The hub also looks for relevant
   things on a schedule.
3. **Ask.** Status of a project, history of past work and verdicts, and questions about how a project is performing,
   answered from records and from the project's own data.
4. **Dispatch.** "Develop this on project X" becomes a work item in that project, executed with that project's rules,
   delivered as a pull request.
5. **Shared layer.** One workflow, one set of rules grouped by kind of work, and one way of capturing lessons, used by
   every project and adjusted per project through a profile.
6. **Tool radar.** For every tool in use: the current choice, the alternatives, the evidence, and what would overturn
   it. Reviewed on a schedule.
7. **Board.** A page that shows projects, open work, running sessions and what is waiting for approval.
8. **Traceability.** Every item sent, every verdict, every piece of work and every answer leaves a record in git.

---

## Principles

- **Simple first.** Native features of the platform before custom code. Curate or write ad hoc; never import a
  collection wholesale.
- **Quality first.** Work that needs judgement runs on a strong model, and on the strongest one when it is too
  complex for the default.
- **Nothing leaves without approval.** The hub may research and open pull requests. Merge and deploy belong to the
  person.
- **Records are data.** State lives in structured records, so status, indexes and history are derived, not kept by
  hand.
- **Personal is separate.** Everything specific to a user sits outside the template.
- **Evaluate, never install.** The hub proposes adoption; adopting is a reviewed change like any other.
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

| Term              | Meaning                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Hub               | The running system on the host: the agent a person talks to, with its channel and board                    |
| Kit               | The template repository: workflow, rules, skills, agent definitions, hooks, templates, board               |
| Home              | A user's private repository: project registry, settings, inbox with verdicts, radar, reports               |
| Project           | A registered repository                                                                                    |
| Profile           | A project's configuration for the kit: areas, verification commands, quality gates, data sources           |
| Work item         | One unit of work in a project, with one record                                                             |
| Record            | The file that holds a work item's intent, plan, log, verification and outcome                              |
| Area              | A kind of work (deploy, backend, content, …) with its rule pack                                            |
| Verdict           | The outcome of evaluating an inbox item                                                                    |
| Radar             | The list of tools in use, each with choice, alternatives, evidence and review date                         |
| Host              | A machine where sessions run                                                                               |
| Worker            | A session that executes one work item                                                                      |
| Reader            | A restricted agent that reads untrusted content and returns a summary                                      |
| Checker           | A read-only agent that verifies a result against its record                                                |
| Security reviewer | A read-only agent that looks for security holes in a change, given the change and not its author's account |
