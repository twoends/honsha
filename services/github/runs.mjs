// Tells whether the latest run of the current workflow on a pull request's earlier tip concluded with success, read
// from GitHub's API, so that project.yml leaves a project's setup and verification out of a later push that changes
// only records only after a run that passed (the piece's README, "Checks on pull requests and on the default branch").
//
//   node services/github/runs.mjs <commit> <branch>
//
// Run in a job of GitHub Actions, with the run's token in GH_TOKEN and the variables that GitHub sets in every run:
// GITHUB_API_URL, GITHUB_REPOSITORY and GITHUB_RUN_ID. The workflow is the current run's, which in a called workflow
// is its caller's. The runs that count are those on <commit> for the `pull_request` event, from <branch> of the same
// repository: what a run carries from the moment it starts, where the pull requests GitHub lists beside a run are left
// empty for a fork. The latest of them, by its identifier, must be completed with the conclusion `success`. A run that
// left the verification out passed only after such a run on its own earlier tip, so a chain of them always goes back
// to a run that checked the code.
//
// The exit code is 0 when that run passed, and 1 otherwise and whenever the answer is not sure: no such run, one still
// going, cancelled or failed, a token the API refuses, as one without `actions: read`, an answer it cannot read. It
// prints no text that the API returned, so that no line of its output begins as a command to the runner.

import { pathToFileURL } from "node:url";

const COMMIT = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/;
// An owner and a name as GitHub allows them; a name of dots alone would climb the API's path.
const REPOSITORY = /^[A-Za-z0-9][A-Za-z0-9-]*\/(?!\.+$)[\w.-]+$/;

/**
 * A workflow run as GitHub's API gives it, with only the fields read here, each of any type until checked.
 * @typedef {{ id?: unknown, event?: unknown, head_sha?: unknown, head_branch?: unknown, status?: unknown,
 *   conclusion?: unknown, head_repository?: { full_name?: unknown } | null }} Run
 */

/**
 * The run that decides, among a workflow's runs: the latest on `commit` for the `pull_request` event, from `branch` of
 * `repository`; undefined when there is none.
 * @param {Run[]} runs
 * @param {{ commit: string, branch: string, repository: string }} on
 * @returns {(Run & { id: number }) | undefined}
 */
export function latest(runs, { commit, branch, repository }) {
  /** @type {(Run & { id: number }) | undefined} */
  let found;
  for (const run of runs) {
    if (typeof run.id !== "number") continue;
    if (run.event !== "pull_request" || run.head_sha !== commit || run.head_branch !== branch) continue;
    if (run.head_repository?.full_name !== repository) continue;
    if (found === undefined || run.id > found.id) found = { ...run, id: run.id };
  }
  return found;
}

/**
 * Whether a run is completed and concluded with success.
 * @param {Run | undefined} run
 */
export const passed = (run) => run?.status === "completed" && run.conclusion === "success";

/** An answer of the API with a status other than success. */
class Refused extends Error {
  /** @param {number} status */
  constructor(status) {
    super(`GitHub answered ${status}`);
    this.status = status;
  }
}

/**
 * Whether the latest run of the current workflow on the commit, from the branch, passed, with the line that says so.
 * @param {string[]} args the commit and the branch
 * @param {{ env?: NodeJS.ProcessEnv, request?: typeof fetch }} [options]
 * @returns {Promise<{ passed: boolean, line: string }>}
 */
export async function judge(args, { env = process.env, request = fetch } = {}) {
  const runs = "the setup and the verification commands run.";
  if (args.length !== 2)
    return { passed: false, line: `Usage: node services/github/runs.mjs <commit> <branch>; ${runs}` };
  const [commit = "", branch = ""] = args;
  if (!COMMIT.test(commit) || branch === "") {
    return { passed: false, line: `The arguments are not a full commit identifier and a branch: ${runs}` };
  }
  const { GH_TOKEN: token = "", GITHUB_API_URL: api = "", GITHUB_REPOSITORY: repository = "" } = env;
  const { GITHUB_RUN_ID: id = "" } = env;
  if (token === "" || !api.startsWith("https://") || !REPOSITORY.test(repository) || !/^\d+$/.test(id)) {
    return { passed: false, line: `This is not a run of GitHub Actions with its token: ${runs}` };
  }
  /** @param {string} path */
  const read = async (path) => {
    const response = await request(`${api}/repos/${repository}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Refused(response.status);
    return /** @type {unknown} */ (await response.json());
  };
  try {
    const current = /** @type {{ workflow_id?: unknown } | null} */ (await read(`/actions/runs/${id}`));
    const workflow = current?.workflow_id;
    if (typeof workflow !== "number") return { passed: false, line: `GitHub names no workflow for this run: ${runs}` };
    const query = new URLSearchParams({ head_sha: commit, event: "pull_request", per_page: "100" });
    const listed = /** @type {{ workflow_runs?: unknown } | null} */ (
      await read(`/actions/workflows/${workflow}/runs?${query}`)
    );
    const all = Array.isArray(listed?.workflow_runs) ? /** @type {Run[]} */ (listed.workflow_runs) : [];
    const found = latest(all, { commit, branch, repository });
    if (found === undefined)
      return { passed: false, line: `No run of this workflow on ${commit} from its branch: ${runs}` };
    if (!passed(found)) return { passed: false, line: `The run ${found.id} on ${commit} did not pass: ${runs}` };
    return { passed: true, line: `The run ${found.id} on ${commit} passed.` };
  } catch (error) {
    const said = error instanceof Refused ? `GitHub answered ${error.status}` : "GitHub's API cannot be read";
    return { passed: false, line: `${said}: ${runs}` };
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { passed: ok, line } = await judge(process.argv.slice(2));
  console.log(line);
  process.exitCode = ok ? 0 : 1;
}
