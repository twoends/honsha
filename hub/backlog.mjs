// The home's backlog: the records kept for later, one file each under `backlog/<project>/` on the home's default
// branch (workflow, The backlog). Run from the home's folder:
//
//   node <kit directory>/hub/backlog.mjs add <project> <file>
//   node <kit directory>/hub/backlog.mjs take <project> <id>
//
// A captured record changes nothing and has nothing for the person to review, so it is the one write that reaches the
// default branch without a pull request (core rules, Delivery). This script is what keeps that exception narrow: each
// of its commits adds or removes one record under `backlog/<project>/` and nothing else, carries the trailer
// `Backlog: <id>`, and is pushed before the script returns, so that a capture is on the hosting service at once and
// the person does nothing for it. The check of commits accepts no other direct commit on the default branch.
//
// Both commands read the registry and the backlog from the default branch after a fetch, and commit in a temporary
// worktree of its tip, so that the home's own working tree and branch, where a session may be working, stay as they
// are. A push refused because the default branch moved in the meantime is made again from the new tip. `take` prints
// the record it removes, for the session that starts the item in its project.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { notCapture } from "../checks/commits.mjs";
import { checkRecord, parseRecord } from "../checks/record.mjs";
import { attempt, defaultRef, git, hasOrigin, inWorktree, writeFiles } from "./home.mjs";
import { NAME, parseRegistry, REGISTRY } from "./projects.mjs";

export const BACKLOG = "backlog";
const STATES = ["idea", "ready", "dropped"];
const ID = /^\d{6}-\d{4}$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
// Another capture landing between the fetch and the push is rare; one that keeps landing is not a race.
const TRIES = 5;

/** @typedef {{ code: number, out: string[], note?: string[] }} Result */
/** @typedef {{ file: string, text: string | null, message: string, done: Result }} Change */

/**
 * The problems that keep a text from entering a project's backlog as a record, one line each.
 * @param {string} text
 * @param {{ name: string, project: string }} given the file's name and the project it is captured for
 */
export function backlogProblems(text, { name, project }) {
  const fields = parseRecord(text)?.fields;
  if (!fields) return [`${name}: no front matter between two \`---\` lines`];
  /** @param {string} key */
  const value = (key) => fields.get(key)?.value ?? "";
  const id = value("id");
  const kind = value("kind");
  // The project's kinds are in its own profile, which the home does not hold: the kind is checked when the item starts.
  const problems = checkRecord(text, { file: name, id, kinds: { [kind]: 0 } });
  if (!ID.test(id)) problems.push(`${name}: \`id\` is not an identifier YYMMDD-HHMM`);
  else if (!name.startsWith(`${id}-`) || !name.endsWith(".md") || !SLUG.test(name.slice(id.length + 1, -3))) {
    problems.push(`${name}: the name is not ${id}-<slug>.md, a slug in lower case`);
  }
  if (kind === "") problems.push(`${name}: \`kind\` is empty`);
  if (!STATES.includes(value("state"))) {
    problems.push(`${name}: \`state\` is \`${value("state")}\`, not one of ${STATES.join(", ")}`);
  }
  if (value("project") !== project) problems.push(`${name}: \`project\` is \`${value("project")}\`, not ${project}`);
  return problems;
}

/**
 * The file of a record of a project's backlog at a commit, or null.
 * @param {string} home
 * @param {string} tip
 * @param {string} project
 * @param {string} id
 */
function backlogFile(home, tip, project, id) {
  const files = (attempt(home, ["ls-tree", "--name-only", tip, `${BACKLOG}/${project}/`]) ?? "").split("\n");
  return files.find((file) => path.posix.basename(file).startsWith(`${id}-`)) ?? null;
}

/**
 * Commits one change of the backlog on the tip of the default branch and pushes it; from the new tip again when the
 * branch moved before the push. `plan` reads the tip and returns the change, or the result that refuses it.
 * @param {string} home
 * @param {string} ref the default branch, as `origin/<name>`
 * @param {(tip: string) => Change | Result} plan
 * @param {() => void} [beforePush] lets a test move the default branch between the commit and the push
 * @returns {Result}
 */
function publish(home, ref, plan, beforePush) {
  const branch = ref.slice("origin/".length);
  for (let tries = 0; tries < TRIES; tries += 1) {
    const tip = git(home, ["rev-parse", ref]).trim();
    const change = plan(tip);
    if (!("file" in change)) return change;
    const refused = inWorktree(home, { base: tip }, (dir) => {
      if (change.text === null) git(dir, ["rm", "-q", "--", change.file]);
      else {
        writeFiles(dir, { [change.file]: change.text });
        git(dir, ["add", "--", change.file]);
      }
      git(dir, ["commit", "-q", "-m", change.message]);
      const ids = git(dir, ["log", "-1", "--format=%(trailers:key=Backlog,valueonly)"]).trim().split("\n");
      const changes = git(dir, ["diff-tree", "--no-commit-id", "--name-status", "-r", "HEAD"]).trim().split("\n");
      const why = notCapture(ids.filter(Boolean), changes.filter(Boolean));
      if (why) throw new Error(`Nothing was pushed: the commit is not a capture of the backlog, since ${why}.`);
      beforePush?.();
      try {
        git(dir, ["push", "-q", "origin", `HEAD:refs/heads/${branch}`]);
        return null;
      } catch (error) {
        return error;
      }
    });
    if (refused === null) return change.done;
    git(home, ["fetch", "-q", "origin"]);
    if (git(home, ["rev-parse", ref]).trim() === tip) throw refused;
  }
  throw new Error(`The home's ${branch} moved at each of ${TRIES} pushes: nothing was pushed.`);
}

/**
 * Runs one command in the home's folder. Returns the exit code, the lines to print and the lines to report beside
 * them.
 * @param {string[]} args
 * @param {{ home?: string, beforePush?: () => void }} [options]
 * @returns {Result}
 */
export function run(args, { home = ".", beforePush } = {}) {
  const [command, project, given] = args;
  if (!["add", "take"].includes(command) || !project || !given) {
    return { code: 2, out: ["Usage: add <project> <file>, or take <project> <id>."] };
  }
  if (!NAME.test(project)) return { code: 2, out: [`\`${project}\` is not a project's name.`] };
  if (command === "add" && !fs.existsSync(given)) return { code: 2, out: [`There is no file ${given}.`] };
  if (command === "take" && !ID.test(given)) return { code: 2, out: [`\`${given}\` is not an identifier.`] };
  if (!hasOrigin(home)) return { code: 1, out: ["The home has no origin, so a capture cannot be pushed."] };
  const ref = defaultRef(home);
  const branch = ref.slice("origin/".length);
  const folder = `${BACKLOG}/${project}`;

  /**
   * The refusal when the project is not in the registry at a commit, or null.
   * @param {string} tip
   * @returns {Result | null}
   */
  const unknown = (tip) => {
    const registry = parseRegistry(attempt(home, ["show", `${tip}:${REGISTRY}`]) ?? "");
    if (registry.some((entry) => entry.name === project)) return null;
    return { code: 1, out: [`\`${project}\` is not in the registry on the home's ${branch}.`] };
  };

  if (command === "add") {
    const text = fs.readFileSync(given, "utf8");
    const name = path.basename(given);
    const problems = backlogProblems(text, { name, project });
    if (problems.length > 0) return { code: 1, out: [...problems, "Nothing was captured."] };
    const id = /** @type {string} */ (parseRecord(text)?.fields.get("id")?.value);
    return publish(
      home,
      ref,
      (tip) =>
        unknown(tip) ??
        (backlogFile(home, tip, project, id)
          ? { code: 1, out: [`${id} is in the backlog of \`${project}\` already.`] }
          : {
              file: `${folder}/${name}`,
              text,
              message: `Capture ${id} in the backlog of ${project}\n\nBacklog: ${id}`,
              done: { code: 0, out: [`${id} is in the backlog: ${folder}/${name} on the home's ${branch}, pushed.`] },
            }),
      beforePush,
    );
  }

  return publish(
    home,
    ref,
    (tip) => {
      const refused = unknown(tip);
      if (refused) return refused;
      const file = backlogFile(home, tip, project, given);
      if (!file)
        return { code: 1, out: [`No record ${given} in the backlog of \`${project}\` on the home's ${branch}.`] };
      const text = git(home, ["show", `${tip}:${file}`]);
      return {
        file,
        text: null,
        message: `Take ${given} from the backlog of ${project}\n\nBacklog: ${given}`,
        done: {
          code: 0,
          out: [text.trimEnd()],
          note: [`${given} is taken from ${file} on the home's ${branch}, pushed.`],
        },
      };
    },
    beforePush,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    const { code, out, note = [] } = run(process.argv.slice(2));
    for (const line of out) (code === 0 ? console.log : console.error)(line);
    for (const line of note) console.error(line);
    process.exitCode = code;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
