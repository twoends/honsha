// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { judge, latest, passed } from "./runs.mjs";

const script = fileURLToPath(new URL("./runs.mjs", import.meta.url));
const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const BRANCH = "work/261124-1626-push-only-verified-work";
const REPOSITORY = "example-owner/example-shop";
const ON = { commit: COMMIT, branch: BRANCH, repository: REPOSITORY };
const ENV = {
  GH_TOKEN: "token-for-tests",
  GITHUB_API_URL: "https://api.example.test",
  GITHUB_REPOSITORY: REPOSITORY,
  GITHUB_RUN_ID: "900",
};

/**
 * A run on the commit, from the branch of the repository, completed with success, with `changes` over it.
 * @param {number} id
 * @param {Record<string, unknown>} [changes]
 */
const run = (id, changes = {}) => ({
  id,
  event: "pull_request",
  head_sha: COMMIT,
  head_branch: BRANCH,
  head_repository: { full_name: REPOSITORY },
  status: "completed",
  conclusion: "success",
  ...changes,
});

/**
 * A stand-in for `fetch` that answers each path from `answers`, records what was asked, and answers 404 otherwise.
 * @param {Record<string, { status?: number, body?: unknown, text?: string } | Error>} answers by the path after
 *   `/repos/<repository>`, with its query
 */
function api(answers) {
  /** @type {{ url: string, headers: Record<string, string> }[]} */
  const asked = [];
  /** @type {typeof fetch} */
  const request = async (url, init) => {
    asked.push({ url: String(url), headers: /** @type {Record<string, string>} */ (init?.headers ?? {}) });
    const path = String(url).slice(`${ENV.GITHUB_API_URL}/repos/${REPOSITORY}`.length);
    const answer = answers[path] ?? { status: 404, body: {} };
    if (answer instanceof Error) throw answer;
    const text = answer.text ?? JSON.stringify(answer.body);
    return new Response(text, { status: answer.status ?? 200 });
  };
  return { request, asked };
}

const LIST = `/actions/workflows/77/runs?head_sha=${COMMIT}&event=pull_request&per_page=100`;
const THIS = "/actions/runs/900";

test("the run that decides is the latest on the commit, from the branch of the same repository", () => {
  assert.equal(latest([run(5), run(9), run(7)], ON)?.id, 9);
  assert.equal(latest([], ON), undefined);
  for (const other of [
    { event: "push" },
    { head_sha: "f".repeat(40) },
    { head_branch: "work/261124-1700-another" },
    { head_repository: { full_name: "someone/example-shop" } },
    { head_repository: null },
    { id: "12" },
  ]) {
    assert.equal(latest([run(3), run(12, other)], ON)?.id, 3, JSON.stringify(other));
  }
});

test("only a completed run that concluded with success passed", () => {
  assert.equal(passed(run(1)), true);
  for (const changes of [
    { status: "in_progress", conclusion: null },
    { conclusion: "failure" },
    { conclusion: "cancelled" },
    { conclusion: "skipped" },
    { conclusion: null },
  ]) {
    assert.equal(passed(run(1, changes)), false, JSON.stringify(changes));
  }
  assert.equal(passed(undefined), false);
});

test("a latest run that passed lets the push skip, read with the run's token", async () => {
  const { request, asked } = api({
    [THIS]: { body: { workflow_id: 77 } },
    [LIST]: { body: { workflow_runs: [run(40, { conclusion: "failure" }), run(41)] } },
  });
  const result = await judge([COMMIT, BRANCH], { env: ENV, request });
  assert.deepEqual(result, { passed: true, line: `The run 41 on ${COMMIT} passed.` });
  assert.deepEqual(
    asked.map(({ url }) => url),
    [`${ENV.GITHUB_API_URL}/repos/${REPOSITORY}${THIS}`, `${ENV.GITHUB_API_URL}/repos/${REPOSITORY}${LIST}`],
  );
  for (const { headers } of asked) assert.equal(headers.Authorization, `Bearer ${ENV.GH_TOKEN}`);
});

test("whatever is not a passed run runs everything", async () => {
  const cases = [
    { name: "the latest run failed", list: { body: { workflow_runs: [run(40), run(41, { conclusion: "failure" })] } } },
    { name: "the latest run was cancelled", list: { body: { workflow_runs: [run(41, { conclusion: "cancelled" })] } } },
    {
      name: "the run still goes",
      list: { body: { workflow_runs: [run(41, { status: "queued", conclusion: null })] } },
    },
    { name: "no run on the commit", list: { body: { workflow_runs: [] } } },
    { name: "a run from a fork only", list: { body: { workflow_runs: [run(41, { head_repository: null })] } } },
    { name: "an answer of another shape", list: { body: { runs: [run(41)] } } },
    { name: "an answer that is not JSON", list: { text: "<html>" } },
    { name: "a token without actions: read", list: { status: 403, body: { message: "::set-output name=x::y" } } },
    { name: "the API cannot be reached", list: new TypeError("fetch failed") },
  ];
  for (const { name, list } of cases) {
    const { request } = api({ [THIS]: { body: { workflow_id: 77 } }, [LIST]: list });
    const { passed: ok, line } = await judge([COMMIT, BRANCH], { env: ENV, request });
    assert.equal(ok, false, name);
    assert.match(line, /the setup and the verification commands run\.$/, name);
    assert.ok(!line.startsWith("::") && !line.includes("set-output"), name);
  }
  const { request } = api({ [THIS]: { status: 403, body: {} } });
  assert.equal((await judge([COMMIT, BRANCH], { env: ENV, request })).passed, false);
  const named = api({ [THIS]: { body: { workflow_id: "77" } } });
  assert.equal((await judge([COMMIT, BRANCH], { env: ENV, request: named.request })).passed, false);
});

test("arguments or a run that are not GitHub's run everything, and ask nothing of the API", async () => {
  const { request, asked } = api({});
  const cases = [
    { args: [COMMIT], env: ENV },
    { args: [COMMIT.slice(0, 12), BRANCH], env: ENV },
    { args: [COMMIT.toUpperCase(), BRANCH], env: ENV },
    { args: [COMMIT, ""], env: ENV },
    { args: [COMMIT, BRANCH], env: { ...ENV, GH_TOKEN: "" } },
    { args: [COMMIT, BRANCH], env: { ...ENV, GITHUB_API_URL: "http://api.example.test" } },
    { args: [COMMIT, BRANCH], env: { ...ENV, GITHUB_REPOSITORY: "../other" } },
    { args: [COMMIT, BRANCH], env: { ...ENV, GITHUB_REPOSITORY: "example-owner/.." } },
    { args: [COMMIT, BRANCH], env: { ...ENV, GITHUB_REPOSITORY: "example-owner" } },
    { args: [COMMIT, BRANCH], env: { ...ENV, GITHUB_RUN_ID: "900/../1" } },
  ];
  for (const { args, env } of cases) {
    assert.equal((await judge(args, { env, request })).passed, false, JSON.stringify({ args, env }));
  }
  assert.equal(asked.length, 0);
});

test("the script outside a run of GitHub Actions exits 1", () => {
  const env = { ...process.env, GH_TOKEN: "", GITHUB_TOKEN: "", GITHUB_RUN_ID: "" };
  const result = spawnSync(process.execPath, [script, COMMIT, BRANCH], { encoding: "utf8", env });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /not a run of GitHub Actions/);
});
