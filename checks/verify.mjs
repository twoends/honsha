// Runs the verification commands of a project's profile, one after the other; its command is in the kit's interface
// (interface, Commands).
//
// The commands are the `verify` list of the profile, `.hub/profile.yml` unless the command names another. Each runs
// in the current directory, through the default shell of the platform, so a command is written to work in that shell.
// The first command that fails stops the run, and the exit code is 1.
//
// A worker, a person at a terminal and the wiring of a hosting service all run this one list.
//
// With `--setup` it runs the profile's `setup` list instead, in the same way: the commands that prepare a fresh
// checkout for the `verify` commands and for the project's own git hooks, run once in each new checkout, a worktree
// or a pipeline's, and not at each verification, since an install takes minutes.
//
// With `--dynamic` it runs the profile's `dynamic-testing` list, in the same way: the commands that start a local
// instance of the project and attack it from outside, run after the `verify` commands at every verification. They are
// kept apart from `verify`, which a worker runs more than once and which must run on a host without a container engine.
//
//   node checks/verify.mjs [--setup | --dynamic] [<profile>]

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { readProfile } from "./profile.mjs";

/**
 * Runs the commands in order. Returns true when all pass, false at the first that fails.
 * @param {string[]} commands
 * @param {{
 *   spawn?: (command: string, options: import("node:child_process").SpawnSyncOptions) => { status: number | null },
 *   log?: (line: string) => void,
 * }} [options]
 * @returns {boolean}
 */
export function run(commands, { spawn = spawnSync, log = console.log } = {}) {
  for (const command of commands) {
    log(`\n$ ${command}`);
    const result = spawn(command, { shell: true, stdio: "inherit" });
    if (result.status !== 0) {
      log(`failed (exit code ${result.status ?? "none"}): ${command}`);
      return false;
    }
    log(`passed: ${command}`);
  }
  return true;
}

/**
 * What each flag runs, none for the verification: the profile's list, and how the output names it.
 * @type {Map<string, { key: "verify" | "setup" | "dynamicTesting", what: string, failed: string }>}
 */
const LISTS = new Map([
  ["", { key: "verify", what: "verification", failed: "Verification failed." }],
  ["--setup", { key: "setup", what: "setup", failed: "Setup failed." }],
  ["--dynamic", { key: "dynamicTesting", what: "dynamic testing", failed: "Dynamic testing failed." }],
]);

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith("--"));
  const list = flags.length > 1 ? undefined : LISTS.get(flags[0] ?? "");
  if (!list) {
    console.error("Usage: node checks/verify.mjs [--setup | --dynamic] [<profile>]");
    return 1;
  }
  const { key, what, failed } = list;
  const file = args.find((arg) => !arg.startsWith("--")) ?? ".hub/profile.yml";
  const profile = readProfile(file);
  if (!profile) {
    console.error(`There is no profile at ${file}.`);
    return 1;
  }
  const commands = profile[key];
  if (commands.length === 0) {
    console.log(`${file} lists no ${what} commands.`);
    return 0;
  }
  const passed = run(commands);
  console.log(passed ? `\nAll ${commands.length} ${what} commands passed.` : `\n${failed}`);
  return passed ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
