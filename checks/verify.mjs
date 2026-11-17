// Runs the verification commands of a project's profile, one after the other.
//
//   node checks/verify.mjs [path of the profile]
//
// The commands are the `verify` list of `.hub/profile.yml`. Each runs in the current directory,
// through the default shell of the platform, so a command is written to work in that shell. The
// first command that fails stops the run, and the exit code is 1.
//
// A worker, a person at a terminal and the wiring of a hosting service all run this one list.

import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { readProfile } from './profile.mjs';

/** Runs the commands in order. Returns true when all pass, false at the first that fails. */
export function run(commands, { spawn = spawnSync, log = console.log } = {}) {
  for (const command of commands) {
    log(`\n$ ${command}`);
    const result = spawn(command, { shell: true, stdio: 'inherit' });
    if (result.status !== 0) {
      log(`failed (exit code ${result.status ?? 'none'}): ${command}`);
      return false;
    }
    log(`passed: ${command}`);
  }
  return true;
}

function main() {
  const file = process.argv[2] ?? '.hub/profile.yml';
  const profile = readProfile(file);
  if (!profile) {
    console.error(`There is no profile at ${file}.`);
    return 1;
  }
  if (profile.verify.length === 0) {
    console.log(`${file} lists no verification commands.`);
    return 0;
  }
  const passed = run(profile.verify);
  console.log(passed ? `\nAll ${profile.verify.length} verification commands passed.` : '\nVerification failed.');
  return passed ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
