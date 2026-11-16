# Honsha

Honsha (本社, "head office") is one place from which a person runs all their software projects with AI agents: send
it anything, ask it anything about the projects, tell it what to build.

**Status:** design. Nothing is built yet.

This repository is the **kit**: the shareable part of the system. It will hold the workflow, the rules, the skills,
the agent definitions, the hooks and the templates. Everything specific to a user, a project or an installation lives
in that user's separate home repository, never here.

## Documents

- [Vision](docs/00-vision/VISION.md): what it does, for whom, principles, non-goals, glossary.
- [Architecture](docs/01-specs/ARCHITECTURE.md): components, repositories, flows, security, assumptions to verify.
- [Workflow](docs/01-specs/WORKFLOW.md): work items, sizes, records, parallel work, lessons, project profile.

All three were approved as the starting base on 2026-11-16. Several parts of the architecture rest on assumptions
that have not been tested yet; they are listed in its section 8.

Identifiers such as D21 or O02 in these documents refer to the author's decision log, which is kept outside this
repository.
