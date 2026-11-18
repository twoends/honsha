// The registry of the projects of an installation, and the moves of a project between its states
// (workflow, section 20). Run from the home's folder:
//
//   node <kit directory>/hub/projects.mjs add <name> <repository> <folder> [--assessment <id>]
//   node <kit directory>/hub/projects.mjs choose <name>
//   node <kit directory>/hub/projects.mjs refresh
//   node <kit directory>/hub/projects.mjs may-start <name> <record>
//
// Every step here is mechanical, so no agent takes it: an interface can run the same commands.
// The script writes only `registry.yml` and the assessment's record in the home; in a project it
// runs `git fetch` and reads the default branch, which leaves the working tree as it is.
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

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseRecord, readTemplate } from "../checks/record.mjs";

export const REGISTRY = "registry.yml";
const STATES = ["assessing", "adopting", "active"];
const NAME = /^[a-z0-9][a-z0-9-]*$/;
const ID = /^\d{6}-\d{4}$/;
const KIT = new URL("..", import.meta.url);

/** @typedef {{ name: string, repository: string, paths: Record<string, string>, state: string, assessment: string }} Project */

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
  const lines = ["# Written by the kit's hub/projects.mjs (workflow, section 20).", "projects:"];
  for (const project of projects) {
    lines.push(`  - name: ${project.name}`, `    repository: ${project.repository}`, "    paths:");
    for (const [host, folder] of Object.entries(project.paths)) lines.push(`      ${host}: ${quote(folder)}`);
    lines.push(`    state: ${project.state}`, `    assessment: ${project.assessment}`);
  }
  return `${lines.join("\n")}\n`;
}

/** @param {string} home */
function load(home) {
  const file = path.join(home, REGISTRY);
  return fs.existsSync(file) ? parseRegistry(fs.readFileSync(file, "utf8")) : [];
}

/**
 * @param {string} home
 * @param {Project[]} projects
 */
function save(home, projects) {
  fs.writeFileSync(path.join(home, REGISTRY), formatRegistry(projects));
}

/**
 * The path of the home's report record with an identifier, or null.
 * @param {string} home
 * @param {string} id
 */
export function findReport(home, id) {
  const folder = path.join(home, "reports", `20${id.slice(0, 2)}`, id.slice(2, 4));
  if (!fs.existsSync(folder)) return null;
  const name = fs.readdirSync(folder).find((file) => file.startsWith(`${id}-`) && file.endsWith(".md"));
  return name ? path.join(folder, name) : null;
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
 * The text of a new assessment's record: the template's front matter and the sections a small item keeps.
 * @param {{ id: string, name: string, date: string }} item
 */
export function assessmentRecord({ id, name, date }) {
  const template = fs.readFileSync(new URL("templates/record.md", KIT), "utf8");
  const values = {
    id,
    title: `Assessment of ${name} before it joins`,
    project: name,
    type: "report",
    size: "small",
    kind: "upkeep",
    state: "ready",
    created: date,
    updated: date,
  };
  const front = [...(parseRecord(template)?.fields.keys() ?? [])].map((key) => {
    const known = /** @type {Record<string, string>} */ (values)[key];
    if (known) return `${key}: ${known}`;
    if (key === "requested-by") return `${key}: person`;
    if (key === "areas" || key === "checks") return `${key}: []`;
    return `${key}: null`;
  });
  const kept = readTemplate(template)
    .sections.filter((section) => section.names.small && !section.optional)
    .map((section) => section.names.small);
  const body = kept.map((heading) =>
    heading === "Intent"
      ? `## Intent\n\n> Add ${name} to the projects.\n\nWritten by \`hub/projects.mjs add\` on ${date}. The procedure is the workflow's section 20.\n`
      : `## ${heading}\n`,
  );
  return `---\n${front.join("\n")}\n---\n\n${body.join("\n")}`;
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
 * Whether the kit's plugin is enabled on a project's default branch, after a fetch.
 * @param {string} folder
 */
export function kitDeclared(folder) {
  /** @param {string[]} args */
  const git = (args) =>
    execFileSync("git", ["-C", folder, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git(["fetch", "-q", "origin"]);
  const head = git(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]).trim();
  let settings;
  try {
    settings = JSON.parse(git(["show", `${head}:.claude/settings.json`]));
  } catch {
    return false;
  }
  const plugin = JSON.parse(fs.readFileSync(new URL(".claude-plugin/plugin.json", KIT), "utf8")).name;
  return Object.entries(settings?.enabledPlugins ?? {}).some(
    ([key, on]) => key.startsWith(`${plugin}@`) && on === true,
  );
}

/**
 * Runs one command in the home's folder. Returns the exit code and the lines to print.
 * @param {string[]} args
 * @param {{ home?: string, host?: string, now?: Date }} [options]
 * @returns {{ code: number, out: string[] }}
 */
export function run(args, { home = ".", host = os.hostname(), now = new Date() } = {}) {
  const [command, name, ...rest] = args;
  const projects = load(home);
  const project = projects.find((each) => each.name === name);
  if (command === "add") {
    const [repository, folder, flag, given] = rest;
    if (!name || !NAME.test(name) || !repository || !folder) {
      return { code: 2, out: ["Usage: add <name> <repository> <folder> [--assessment <id>]; a name in lower case."] };
    }
    if (project) return { code: 1, out: [`\`${name}\` is in the registry already, as ${project.state}.`] };
    if (!fs.existsSync(path.join(folder, ".git")))
      return { code: 1, out: [`${folder} is not the folder of a git repository.`] };
    let assessment;
    if (flag === "--assessment") {
      if (!given || !ID.test(given) || !findReport(home, given)) {
        return { code: 1, out: [`No report \`${given ?? ""}\` in the home's reports/.`] };
      }
      assessment = given;
    } else {
      const { id, date } = stamp(now);
      if (findReport(home, id)) return { code: 1, out: [`A report ${id} exists already: add again in a minute.`] };
      const file = path.join(home, "reports", `20${id.slice(0, 2)}`, id.slice(2, 4), `${id}-${name}-assessment.md`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, assessmentRecord({ id, name, date }));
      assessment = id;
    }
    projects.push({ name, repository, paths: { [host]: path.resolve(folder) }, state: "assessing", assessment });
    save(home, projects);
    return {
      code: 0,
      out: [`\`${name}\` added as assessing. Its assessment is the report ${assessment}: the next step is to run it.`],
    };
  }
  if (command === "choose") {
    if (!project) return { code: 1, out: [`\`${name ?? ""}\` is not in the registry.`] };
    if (project.state !== "assessing") return { code: 1, out: [`\`${name}\` is ${project.state}, not assessing.`] };
    const file = findReport(home, project.assessment);
    const state = file ? field(fs.readFileSync(file, "utf8"), "state") : null;
    if (state !== "done") {
      return { code: 1, out: [`The assessment ${project.assessment} is ${state ?? "missing"}, not done.`] };
    }
    project.state = "adopting";
    save(home, projects);
    return { code: 0, out: [`\`${name}\` is adopting: only the items whose source is ${project.assessment} start.`] };
  }
  if (command === "refresh") {
    const out = [];
    for (const each of projects.filter((one) => one.state === "adopting")) {
      const folder = each.paths[host];
      if (!folder || !fs.existsSync(folder)) {
        out.push(`\`${each.name}\` has no folder on this host: left adopting.`);
      } else if (kitDeclared(folder)) {
        each.state = "active";
        out.push(`\`${each.name}\` is active: its default branch declares the kit.`);
      } else {
        out.push(`\`${each.name}\` stays adopting: its default branch does not declare the kit yet.`);
      }
    }
    save(home, projects);
    return { code: 0, out: out.length > 0 ? out : ["No project is adopting."] };
  }
  if (command === "may-start") {
    const [record] = rest;
    if (!name || !record || !fs.existsSync(record)) return { code: 2, out: ["Usage: may-start <name> <record>."] };
    if (!project) return { code: 1, out: [`No: \`${name}\` is not in the registry.`] };
    const text = fs.readFileSync(record, "utf8");
    const id = field(text, "id");
    const source = field(text, "source");
    if (project.state === "active") return { code: 0, out: [`Yes: \`${name}\` is active.`] };
    if (project.state === "assessing") {
      return id === project.assessment
        ? { code: 0, out: [`Yes: this is the assessment of \`${name}\`.`] }
        : { code: 1, out: [`No: \`${name}\` is assessing, and only its assessment ${project.assessment} runs.`] };
    }
    return source === project.assessment
      ? { code: 0, out: [`Yes: an item chosen from the assessment of \`${name}\`.`] }
      : { code: 1, out: [`No: \`${name}\` is adopting, and only items whose source is ${project.assessment} start.`] };
  }
  return { code: 2, out: ["Commands: add, choose, refresh, may-start."] };
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
