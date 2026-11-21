// The registry of the projects of an installation, and the moves of a project between its states
// (workflow, Joining an installation). Run from the home's folder:
//
//   node <kit directory>/hub/projects.mjs add <name> <repository> <folder> [--assessment <id>]
//   node <kit directory>/hub/projects.mjs choose <name>
//   node <kit directory>/hub/projects.mjs refresh
//   node <kit directory>/hub/projects.mjs folder <name> <folder>
//   node <kit directory>/hub/projects.mjs check
//   node <kit directory>/hub/projects.mjs may-start <name> <record>
//
// Every step here is mechanical, so no agent takes it: an interface can run the same commands.
//
// The home is a project, so a move is a work item of the home, made by code; so is a change of a
// project's folder, which `folder` makes. `add`, `choose`, `refresh` and `folder` read the registry
// from the home's default branch, create a work branch from it, and commit there the registry's
// change with the item's record. They do it in a temporary worktree,
// so that the home's own working tree and branch, where a session may be working, stay as they
// are. None of them pushes or opens a pull request: the hub does, with the commands of the hosting
// service's piece. A move holds once its pull request is merged, which is why `may-start` reads
// the default branch too, and why it is not asked for the assessment that `add` starts: that
// assessment runs on `add`'s branch, before its entry is merged. `check` reads the working tree, for the verification of a branch of the
// home. In a project, the script runs `git fetch` and reads the default branch, which leaves the
// working tree as it is.
//
// The registry is written by this script in one shape, which it reads back strictly: a line it
// cannot read stops it before it changes anything.
//
//   projects:
//     - name: example-shop
//       repository: example-owner/example-shop
//       paths:
//         example-host: '/srv/projects/example-shop'
//       state: assessing
//       assessment: 261201-0930
//
// A project has a folder on each host, by the name the system gives the host.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseRecord, readTemplate } from "../checks/record.mjs";
import { attempt, defaultRef, git, inWorktree, writeFiles } from "./home.mjs";

export const REGISTRY = "registry.yml";
const STATES = ["assessing", "adopting", "active"];
export const NAME = /^[a-z0-9][a-z0-9-]*$/;
const ID = /^\d{6}-\d{4}$/;
const KIT = new URL("..", import.meta.url);
// A report merged before its home ran as a project stays where it was written, as a project's earlier documents do.
const RECORD_FOLDERS = ["work", "reports"];

/** @typedef {{ name: string, repository: string, paths: Record<string, string>, state: string, assessment: string }} Project */
/** @typedef {{ read: (file: string) => string | null, list: (folder: string) => string[] }} Files */

/** @param {string} raw */
function unquote(raw) {
  const text = raw.trim();
  if (/^'.*'$/.test(text)) return text.slice(1, -1).replace(/''/g, "'");
  return text;
}

/** @param {string} value */
const quote = (value) => `'${value.replace(/'/g, "''")}'`;

/**
 * The projects of a registry's text. Throws on a line that is not in the shape this script writes.
 * @param {string} text
 * @returns {Project[]}
 */
export function parseRegistry(text) {
  /** @type {Project[]} */
  const projects = [];
  /** @type {Record<string, any> | null} */
  let current = null;
  let inPaths = false;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/^\s*(#.*)?$/.test(line) || line === "projects:" || line === "projects: []") return;
    const fail = () => {
      throw new Error(`${REGISTRY}, line ${index + 1}: not in the shape this script writes: ${line}`);
    };
    const first = /^ {2}- name: (.+)$/.exec(line);
    const key = /^ {4}([a-z]+):(?: (.+))?$/.exec(line);
    const host = /^ {6}([^:\s]+): (.+)$/.exec(line);
    if (first) {
      current = { name: unquote(first[1]), paths: {} };
      projects.push(/** @type {Project} */ (current));
      inPaths = false;
    } else if (current && key) {
      inPaths = key[1] === "paths" && key[2] === undefined;
      if (!inPaths && key[2] === undefined) fail();
      if (!inPaths) current[key[1]] = unquote(key[2] ?? "");
    } else if (current && inPaths && host) {
      current.paths[host[1]] = unquote(host[2]);
    } else fail();
  });
  for (const project of projects) {
    for (const key of ["repository", "state", "assessment"]) {
      if (!(/** @type {Record<string, unknown>} */ (project)[key])) {
        throw new Error(`${REGISTRY}: project \`${project.name}\` has no \`${key}\``);
      }
    }
    if (!STATES.includes(project.state)) {
      throw new Error(`${REGISTRY}: project \`${project.name}\` has the state \`${project.state}\``);
    }
  }
  return projects;
}

/**
 * The registry's text for a list of projects.
 * @param {Project[]} projects
 */
export function formatRegistry(projects) {
  const lines = ["# Written by the kit's hub/projects.mjs (workflow, Joining an installation).", "projects:"];
  for (const project of projects) {
    lines.push(`  - name: ${project.name}`, `    repository: ${project.repository}`, "    paths:");
    for (const [host, folder] of Object.entries(project.paths)) lines.push(`      ${host}: ${quote(folder)}`);
    lines.push(`    state: ${project.state}`, `    assessment: ${project.assessment}`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * The files of the home's working tree, by their paths from the home's root.
 * @param {string} home
 * @returns {Files}
 */
export function workingTree(home) {
  return {
    read: (file) => (fs.existsSync(path.join(home, file)) ? fs.readFileSync(path.join(home, file), "utf8") : null),
    list: (folder) =>
      fs.existsSync(path.join(home, folder))
        ? fs.readdirSync(path.join(home, folder)).map((name) => `${folder}/${name}`)
        : [],
  };
}

/**
 * The files of a commit of the home.
 * @param {string} home
 * @param {string} ref
 * @returns {Files}
 */
function commitFiles(home, ref) {
  return {
    read: (file) => attempt(home, ["show", `${ref}:${file}`]),
    list: (folder) => (attempt(home, ["ls-tree", "--name-only", ref, `${folder}/`]) ?? "").split("\n").filter(Boolean),
  };
}

/**
 * Files with some of them replaced or added, as a branch holds them once they are committed.
 * @param {Files} files
 * @param {Record<string, string>} written
 * @returns {Files}
 */
function overlay(files, written) {
  return {
    read: (file) => written[file] ?? files.read(file),
    list: (folder) => {
      const added = Object.keys(written).filter((file) => path.posix.dirname(file) === folder);
      return [...new Set([...files.list(folder), ...added])];
    },
  };
}

/**
 * The path of a record with an identifier, from the root of the home, or null.
 * @param {Files} files
 * @param {string} id
 */
export function findRecord(files, id) {
  for (const top of RECORD_FOLDERS) {
    const found = files
      .list(`${top}/20${id.slice(0, 2)}/${id.slice(2, 4)}`)
      .find((file) => path.posix.basename(file).startsWith(`${id}-`) && file.endsWith(".md"));
    if (found) return found;
  }
  return null;
}

/**
 * A front matter value of a record's text.
 * @param {string} text
 * @param {string} key
 */
function field(text, key) {
  return parseRecord(text)?.fields.get(key)?.value ?? null;
}

/**
 * The state of the record with an identifier: null when there is no record, empty when it has no state.
 * @param {Files} files
 * @param {string} id
 */
function recordState(files, id) {
  const file = findRecord(files, id);
  const text = file ? files.read(file) : null;
  return text === null ? null : (field(text, "state") ?? "");
}

/**
 * A record's text: the template's front matter with `values`, and the sections the size keeps, with `bodies`.
 * @param {Record<string, string>} values
 * @param {Record<string, string>} bodies
 */
function writeRecord(values, bodies) {
  const template = fs.readFileSync(new URL("templates/record.md", KIT), "utf8");
  const front = [...(parseRecord(template)?.fields.keys() ?? [])].map((key) => {
    if (values[key]) return `${key}: ${values[key]}`;
    if (key === "areas" || key === "checks") return `${key}: []`;
    return `${key}: null`;
  });
  const kept = readTemplate(template)
    .sections.filter((section) => section.names[values.size] && !section.optional)
    .map((section) => section.names[values.size]);
  const body = kept.map((heading) => `## ${heading}\n${bodies[heading] ? `\n${bodies[heading]}\n` : ""}`);
  return `---\n${front.join("\n")}\n---\n\n${body.join("\n")}`;
}

/**
 * The text of a new assessment's record: the template's front matter and the sections a small item keeps.
 * @param {{ id: string, name: string, date: string }} item
 */
export function assessmentRecord({ id, name, date }) {
  return writeRecord(
    {
      id,
      title: `Assessment of ${name} before it joins`,
      project: name,
      type: "report",
      size: "small",
      kind: "upkeep",
      state: "ready",
      created: date,
      updated: date,
      "requested-by": "person",
    },
    {
      Intent: `> Add ${name} to the projects.\n\nWritten by \`hub/projects.mjs add\` on ${date}. The procedure is the skill \`honsha:assessment\`.`,
    },
  );
}

/**
 * The text of the trivial record of a move, written whole but for what its pull request gives: `pr`, `model` and the
 * state `done`, which the closing commit writes.
 * @param {{ id: string, date: string, home: string, title: string, requestedBy: string, command: string,
 *   outcome: string[] }} move
 */
export function moveRecord({ id, date, home, title, requestedBy, command, outcome }) {
  return writeRecord(
    {
      id,
      title,
      project: home,
      type: "change",
      size: "trivial",
      kind: "upkeep",
      state: "in-progress",
      created: date,
      updated: date,
      "requested-by": requestedBy,
    },
    {
      Intent: `> \`hub/projects.mjs ${command}\`\n\nThe command, run on ${date}. The script wrote this record and the change to \`${REGISTRY}\` (workflow, Joining an installation).`,
      Verification: "`hub/projects.mjs check` on the registry this branch holds: passed.",
      Outcome: outcome.join(" "),
    },
  );
}

/**
 * The home's name as a project: the profile's `name` on the default branch, or the name of its folder.
 * @param {string} home
 * @param {Files} files
 */
function homeName(home, files) {
  const named = /^name:\s*['"]?([^'"#\s]+)/m.exec(files.read(".hub/profile.yml") ?? "")?.[1];
  return named ?? path.basename(path.resolve(home));
}

/**
 * The current UTC time as a record identifier and a date.
 * @param {Date} now
 */
function stamp(now) {
  const iso = now.toISOString();
  return {
    id: `${iso.slice(2, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}`,
    date: iso.slice(0, 10),
  };
}

/**
 * The problems of a registry and of the assessments it names, one line each.
 * @param {Files} files
 */
export function checkRegistry(files) {
  const text = files.read(REGISTRY);
  if (text === null) return [`There is no ${REGISTRY}.`];
  let projects;
  try {
    projects = parseRegistry(text);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
  /** @type {string[]} */
  const problems = [];
  const seen = new Set();
  for (const project of projects) {
    if (seen.has(project.name)) problems.push(`${REGISTRY}: \`${project.name}\` is written twice`);
    seen.add(project.name);
    if (!ID.test(project.assessment)) {
      problems.push(`${REGISTRY}: the assessment of \`${project.name}\` is not an identifier`);
      continue;
    }
    const state = recordState(files, project.assessment);
    if (state === null) {
      problems.push(`${REGISTRY}: the assessment ${project.assessment} of \`${project.name}\` has no record`);
    } else if (project.state !== "assessing" && state !== "done") {
      problems.push(
        `${REGISTRY}: \`${project.name}\` is ${project.state}, but its assessment ${project.assessment} is ${state || "without a state"}, not done`,
      );
    }
  }
  return problems;
}

/**
 * Whether the kit's plugin is enabled on a project's default branch, after a fetch.
 * @param {string} folder
 */
export function kitDeclared(folder) {
  git(folder, ["fetch", "-q", "origin"]);
  const head = git(folder, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]).trim();
  let settings;
  try {
    settings = JSON.parse(git(folder, ["show", `${head}:.claude/settings.json`]));
  } catch {
    return false;
  }
  const plugin = JSON.parse(fs.readFileSync(new URL(".claude-plugin/plugin.json", KIT), "utf8")).name;
  return Object.entries(settings?.enabledPlugins ?? {}).some(
    ([key, on]) => key.startsWith(`${plugin}@`) && on === true,
  );
}

/**
 * Whether a work item has this identifier already, as a branch or as a record on the default branch.
 * @param {string} home
 * @param {Files} files
 * @param {string} id
 */
function taken(home, files, id) {
  const refs = attempt(home, ["for-each-ref", "--format=%(refname)", "refs/heads/work/", "refs/remotes/"]) ?? "";
  return refs.split(/\r?\n/).some((ref) => ref.includes(`/work/${id}-`)) || findRecord(files, id) !== null;
}

/**
 * Commits a move as a work item of the home, its record with the registry, on a new branch; nothing when the
 * registry it would hold fails its check.
 * @param {string} home
 * @param {{ base: string, files: Files, id: string, slug: string, title: string, projects: Project[],
 *   record: string }} move
 * @returns {{ code: number, out: string[] }}
 */
function commitMove(home, { base, files, id, slug, title, projects, record }) {
  const branch = `work/${id}-${slug}`;
  const file = `work/20${id.slice(0, 2)}/${id.slice(2, 4)}/${id}-${slug}.md`;
  const written = { [file]: record, [REGISTRY]: formatRegistry(projects) };
  const problems = checkRegistry(overlay(files, written));
  if (problems.length > 0) return { code: 1, out: [...problems, "Nothing was committed."] };
  inWorktree(home, { base, branch }, (dir) => {
    writeFiles(dir, written);
    git(dir, ["add", "--", ...Object.keys(written)]);
    git(dir, ["commit", "-q", "-m", `${title}\n\nWork-Item: ${id}`]);
  });
  return {
    code: 0,
    out: [
      `Committed on \`${branch}\`, from ${base}: ${file} and ${REGISTRY}.`,
      "Next: push the branch and open its pull request. The move holds once the person merges it.",
    ],
  };
}

/**
 * Runs one command in the home's folder. Returns the exit code and the lines to print.
 * @param {string[]} args
 * @param {{ home?: string, host?: string, now?: Date }} [options]
 * @returns {{ code: number, out: string[] }}
 */
export function run(args, { home = ".", host = os.hostname(), now = new Date() } = {}) {
  const [command, name, ...rest] = args;
  if (command === "check") {
    const problems = checkRegistry(workingTree(home));
    if (problems.length > 0) return { code: 1, out: problems };
    return { code: 0, out: [`${REGISTRY} is readable, and the assessment of every project has its record.`] };
  }
  if (!["add", "choose", "refresh", "folder", "may-start"].includes(command)) {
    return { code: 2, out: ["Commands: add, choose, refresh, folder, check, may-start."] };
  }
  const base = defaultRef(home);
  const files = commitFiles(home, base);
  const projects = parseRegistry(files.read(REGISTRY) ?? "");
  const project = projects.find((each) => each.name === name);
  const { id, date } = stamp(now);
  const busy = { code: 1, out: [`An item ${id} exists already: run again in a minute.`] };
  /** @param {{ title: string, requestedBy: string, command: string, outcome: string[] }} move */
  const record = (move) => moveRecord({ id, date, home: homeName(home, files), ...move });

  if (command === "add") {
    const [repository, folder, flag, given] = rest;
    if (!name || !NAME.test(name) || !repository || !folder) {
      return { code: 2, out: ["Usage: add <name> <repository> <folder> [--assessment <id>]; a name in lower case."] };
    }
    if (project) return { code: 1, out: [`\`${name}\` is in the registry already, as ${project.state}.`] };
    if (!fs.existsSync(path.join(folder, ".git")))
      return { code: 1, out: [`${folder} is not the folder of a git repository.`] };
    if (taken(home, files, id)) return busy;
    const entry = { name, repository, paths: { [host]: path.resolve(folder) }, state: "assessing" };
    if (flag === "--assessment") {
      const state = given && ID.test(given) ? recordState(files, given) : null;
      if (state === null) return { code: 1, out: [`No report \`${given ?? ""}\` on the home's ${base}.`] };
      const title = `Add ${name} to the projects, assessed by ${given}`;
      const outcome = `Once merged, \`${name}\` is in the registry as assessing, with the report ${given} as its assessment.`;
      const result = commitMove(home, {
        base,
        files,
        id,
        slug: `add-${name}`,
        title,
        projects: [...projects, { ...entry, assessment: given }],
        record: record({ title, requestedBy: "person", command: args.join(" "), outcome: [outcome] }),
      });
      const next =
        state === "done" ? "it is done, so `choose` follows the merge" : `it is ${state || "without a state"}`;
      if (result.code === 0) result.out.unshift(`${outcome} The assessment ${given}: ${next}.`);
      return result;
    }
    const result = commitMove(home, {
      base,
      files,
      id,
      slug: `${name}-assessment`,
      title: `Add ${name} to the projects, with the record of its assessment`,
      projects: [...projects, { ...entry, assessment: id }],
      record: assessmentRecord({ id, name, date }),
    });
    if (result.code === 0) {
      result.out.unshift(
        `\`${name}\` is added as assessing on the branch of its assessment ${id}: the assessment runs there, and its pull request registers the project.`,
      );
    }
    return result;
  }

  if (command === "choose") {
    if (!project) return { code: 1, out: [`\`${name ?? ""}\` is not in the registry on the home's ${base}.`] };
    if (project.state !== "assessing") return { code: 1, out: [`\`${name}\` is ${project.state}, not assessing.`] };
    const state = recordState(files, project.assessment);
    if (state !== "done") {
      return { code: 1, out: [`The assessment ${project.assessment} is ${state ?? "missing"}, not done.`] };
    }
    if (taken(home, files, id)) return busy;
    project.state = "adopting";
    const title = `Move ${name} to adopting`;
    const outcome = `Once merged, \`${name}\` is adopting: only the items whose source is ${project.assessment} start.`;
    const result = commitMove(home, {
      base,
      files,
      id,
      slug: `choose-${name}`,
      title,
      projects,
      record: record({ title, requestedBy: "person", command: args.join(" "), outcome: [outcome] }),
    });
    if (result.code === 0) result.out.unshift(outcome);
    return result;
  }

  if (command === "refresh") {
    const out = [];
    const moved = [];
    for (const each of projects.filter((one) => one.state === "adopting")) {
      const folder = each.paths[host];
      if (!folder || !fs.existsSync(folder)) {
        out.push(`\`${each.name}\` has no folder on this host: left adopting.`);
      } else if (kitDeclared(folder)) {
        each.state = "active";
        moved.push(each.name);
        out.push(`\`${each.name}\` is active once merged: its default branch declares the kit.`);
      } else {
        out.push(`\`${each.name}\` stays adopting: its default branch does not declare the kit yet.`);
      }
    }
    if (moved.length === 0) return { code: 0, out: [...out, "Nothing moved, so nothing was committed."] };
    if (taken(home, files, id)) return busy;
    const title = `Move ${moved.join(", ")} to active`;
    const result = commitMove(home, {
      base,
      files,
      id,
      slug: "refresh",
      title,
      projects,
      record: record({ title, requestedBy: "check", command: "refresh", outcome: out }),
    });
    return { code: result.code, out: [...out, ...result.out] };
  }

  if (command === "folder") {
    const [folder] = rest;
    if (!name || !folder) return { code: 2, out: ["Usage: folder <name> <folder>."] };
    if (!project) return { code: 1, out: [`\`${name}\` is not in the registry on the home's ${base}.`] };
    if (!fs.existsSync(path.join(folder, ".git")))
      return { code: 1, out: [`${folder} is not the folder of a git repository.`] };
    const resolved = path.resolve(folder);
    if (project.paths[host] === resolved) {
      return { code: 1, out: [`\`${name}\` is in ${resolved} on ${host} already: nothing to change.`] };
    }
    if (taken(home, files, id)) return busy;
    project.paths[host] = resolved;
    const title = `Set the folder of ${name} on ${host}`;
    const outcome = `Once merged, \`${name}\` is in ${resolved} on ${host}.`;
    const result = commitMove(home, {
      base,
      files,
      id,
      slug: `folder-${name}`,
      title,
      projects,
      record: record({ title, requestedBy: "person", command: args.join(" "), outcome: [outcome] }),
    });
    if (result.code === 0) result.out.unshift(outcome);
    return result;
  }

  const [file] = rest;
  if (!name || !file || !fs.existsSync(file)) return { code: 2, out: ["Usage: may-start <name> <record>."] };
  if (!project) {
    return {
      code: 1,
      out: [
        `No: \`${name}\` is not in the registry on the home's ${base}. The assessment that \`add\` starts is not asked for: it runs on \`add\`'s branch.`,
      ],
    };
  }
  const text = fs.readFileSync(file, "utf8");
  if (project.state === "active") return { code: 0, out: [`Yes: \`${name}\` is active.`] };
  if (project.state === "assessing") {
    return field(text, "id") === project.assessment
      ? { code: 0, out: [`Yes: this is the assessment of \`${name}\`.`] }
      : { code: 1, out: [`No: \`${name}\` is assessing, and only its assessment ${project.assessment} runs.`] };
  }
  return field(text, "source") === project.assessment
    ? { code: 0, out: [`Yes: an item chosen from the assessment of \`${name}\`.`] }
    : { code: 1, out: [`No: \`${name}\` is adopting, and only items whose source is ${project.assessment} start.`] };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    const { code, out } = run(process.argv.slice(2));
    for (const line of out) (code === 0 ? console.log : console.error)(line);
    process.exitCode = code;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
