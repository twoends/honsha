// For the tests of the hooks: a scratch home, a repository whose registry on its `main` gives each of some folders to
// a project on this machine, and the variables that make it the plugin's setting `home` for a hook run as a process.
// The hooks act only in the folders of an installation (`hooks/place.mjs`), so a test that runs one needs a home.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { formatRegistry } from "../hub/projects.mjs";

/**
 * A scratch home in a new folder of the system's temporary one, registering each of `folders` as a project, with
 * `files` beside its registry.
 * @param {string[]} folders
 * @param {Record<string, string>} [files] by their paths from the home's root
 * @returns {{ home: string, env: NodeJS.ProcessEnv, remove: () => void }}
 */
export function scratchHome(folders, files = {}) {
  const home = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "honsha-scratch-home-")));
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(home, file)), { recursive: true });
    fs.writeFileSync(path.join(home, file), text);
  }
  const projects = folders.map((folder, index) => ({
    name: `project-${index + 1}`,
    repository: `example-owner/project-${index + 1}`,
    paths: { [os.hostname()]: path.resolve(folder) },
    state: "active",
    assessment: "261201-0930",
  }));
  fs.writeFileSync(path.join(home, "registry.yml"), formatRegistry(projects));
  const identity = ["-c", "user.name=Tester", "-c", "user.email=tester@example.org", "-c", "commit.gpgsign=false"];
  /** @param {string[]} args */
  const git = (args) => execFileSync("git", ["-C", home, ...identity, ...args], { stdio: "ignore" });
  git(["init", "-q", "-b", "main"]);
  git(["add", "--all"]);
  git(["commit", "-q", "-m", "Register the projects"]);
  return {
    home,
    env: { ...process.env, CLAUDE_PLUGIN_OPTION_HOME: home },
    remove: () => fs.rmSync(home, { recursive: true, force: true }),
  };
}
