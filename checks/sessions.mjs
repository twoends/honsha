// Reads the platform's session files and attributes their responses to work items.
//
// Claude Code keeps one JSONL file per session under `<config>/projects/`, and one per subagent
// under `<session>/subagents/`. A response of the model is a line with `type: "assistant"` and a
// `message` holding `id`, `model` and `usage`, beside `timestamp`, `cwd` and `gitBranch`. One
// response can span several lines with the same `message.id`; the last one counts.
//
// The format is the platform's and is not documented as stable: a line that cannot be read is
// skipped and counted, never guessed. Only sums leave this module.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WORK_BRANCH = /^work\/(\d{6}-\d{4})-/;

/**
 * @typedef {{ id: string, model: string, time: number, branch: string, cwd: string, input: number, output: number,
 *   cacheRead: number, cacheWrite: number }} Response
 * @typedef {{ responses: number, input: number, output: number, cacheRead: number, cacheWrite: number,
 *   models: Record<string, number>, activeMinutes: number }} Usage
 * @typedef {{ id: string, created: number, delivered: number }} Window
 */

/**
 * The folder of the session files: `CLAUDE_CONFIG_DIR` or `~/.claude`, then `projects`.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function sessionsDir(env = process.env) {
  return path.join(env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude"), "projects");
}

/**
 * Every `.jsonl` file under `dir`, at any depth.
 * @param {string} dir
 * @returns {string[]}
 */
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return entry.name.endsWith(".jsonl") ? [full] : [];
  });
}

/** @param {unknown} value */
const count = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

/**
 * The responses of every session file under `dir`, one per `message.id`, and how many lines were skipped.
 * @param {string} dir
 * @returns {{ responses: Response[], skipped: number } | null}
 */
export function readResponses(dir) {
  if (!fs.existsSync(dir)) return null;
  /** @type {Map<string, Response>} */
  const byId = new Map();
  let skipped = 0;
  for (const file of files(dir)) {
    for (const text of fs.readFileSync(file, "utf8").split("\n")) {
      if (!text.includes('"assistant"')) continue;
      /** @type {any} */
      let line;
      try {
        line = JSON.parse(text);
      } catch {
        skipped += 1;
        continue;
      }
      if (line?.type !== "assistant") continue;
      const message = line.message;
      const time = Date.parse(line.timestamp);
      if (typeof message?.id !== "string" || typeof message.usage !== "object" || Number.isNaN(time)) {
        skipped += 1;
        continue;
      }
      byId.set(message.id, {
        id: message.id,
        model: typeof message.model === "string" ? message.model : "unknown",
        time,
        branch: typeof line.gitBranch === "string" ? line.gitBranch : "",
        cwd: typeof line.cwd === "string" ? line.cwd : "",
        input: count(message.usage.input_tokens),
        output: count(message.usage.output_tokens),
        cacheRead: count(message.usage.cache_read_input_tokens),
        cacheWrite: count(message.usage.cache_creation_input_tokens),
      });
    }
  }
  return { responses: [...byId.values()], skipped };
}

/** @param {string} folder */
const normal = (folder) => folder.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();

/**
 * The usage of each item: a response on a branch `work/<id>-<slug>` belongs to that item; a response in the
 * repository's folder on no work branch belongs to the item whose window, from creation to delivery, holds it, when
 * exactly one does. Anything else is left out.
 * @param {Response[]} responses
 * @param {Window[]} windows
 * @param {string} root the repository's folder
 * @returns {Map<string, Usage>}
 */
export function attribute(responses, windows, root) {
  const ids = new Set(windows.map((window) => window.id));
  /** @type {Map<string, Usage & { minutes: Set<number> }>} */
  const usage = new Map();
  for (const response of responses) {
    const branchId = WORK_BRANCH.exec(response.branch)?.[1];
    let id = branchId && ids.has(branchId) ? branchId : null;
    if (!branchId && normal(response.cwd) === normal(root)) {
      const holding = windows.filter((window) => window.created <= response.time && response.time <= window.delivered);
      if (holding.length === 1) id = holding[0].id;
    }
    if (!id) continue;
    let sum = usage.get(id);
    if (!sum) {
      sum = {
        responses: 0,
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        models: {},
        activeMinutes: 0,
        minutes: new Set(),
      };
      usage.set(id, sum);
    }
    sum.responses += 1;
    sum.input += response.input;
    sum.output += response.output;
    sum.cacheRead += response.cacheRead;
    sum.cacheWrite += response.cacheWrite;
    sum.models[response.model] = (sum.models[response.model] ?? 0) + response.output;
    sum.minutes.add(Math.floor(response.time / 60000));
  }
  /** @type {Map<string, Usage>} */
  const result = new Map();
  for (const [id, { minutes, ...sum }] of usage) result.set(id, { ...sum, activeMinutes: minutes.size });
  return result;
}

/**
 * One line: output and input tokens, the cache, the models by output tokens, the active minutes.
 * @param {Usage} usage
 */
export function describeUsage(usage) {
  const models = Object.entries(usage.models)
    .toSorted((a, b) => b[1] - a[1])
    .map(([model]) => model)
    .join(", ");
  return (
    `${usage.responses} responses, ${usage.output} output and ${usage.input} input tokens, ` +
    `cache ${usage.cacheRead} read and ${usage.cacheWrite} written; ${models}; active ${usage.activeMinutes} min`
  );
}
