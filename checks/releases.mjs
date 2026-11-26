// The release programs that the kit's checks run, each pinned as `honsha:dependencies` says, the install that checks
// an archive before anything of it is written or run, and the check that an installed program is at its pinned
// version. `checks/history-secrets.mjs` installs gitleaks into a temporary folder at each run, since it runs in a
// project's clone, where the kit's setup never ran; `checks/security-testing.mjs --setup` installs each program once
// in the kit's own checkout.
//
// A pin is a version released at least 7 days before it was taken, and the SHA-256 of each archive that the release
// publishes for the platforms of the kit's hosts, by `<platform>-<arch>` as Node.js names them: read from the release's
// checksums file where it publishes one, which matches the digests that GitHub lists for the release's files, and from
// those digests where it publishes none. A new version is a work item of the kit. The install fetches the archive from
// the release, refuses it unless its SHA-256 is the pinned one, and extracts the program alone, so that a release
// replaced after the pin fails and no other entry of the archive is written.

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {{ file: string, sha256: string }} Archive
 * @typedef {{
 *   name: string,
 *   version: string,
 *   versionArgs: string[],
 *   release: string,
 *   archives: Record<string, Archive>,
 * }} Release
 * `name` is the program's file name, with `.exe` on Windows, `versionArgs` the arguments that make it print its
 * version, and `release` the address its archives are fetched from.
 * @typedef {{ status: number | null, stdout: string, stderr: string, error?: Error }} Result
 * @typedef {{ cwd: string, env?: NodeJS.ProcessEnv, input?: string }} ExecOptions
 * @typedef {(program: string, args: string[], options: ExecOptions) => Result} Exec
 * How a check runs a program, which a test replaces.
 */

/** @type {Release} the scanner of secrets, from its checksums file */
export const GITLEAKS = {
  name: "gitleaks",
  version: "8.30.1",
  versionArgs: ["version"],
  release: "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/",
  archives: {
    "darwin-arm64": {
      file: "gitleaks_8.30.1_darwin_arm64.tar.gz",
      sha256: "b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5",
    },
    "darwin-x64": {
      file: "gitleaks_8.30.1_darwin_x64.tar.gz",
      sha256: "dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709",
    },
    "linux-arm64": {
      file: "gitleaks_8.30.1_linux_arm64.tar.gz",
      sha256: "e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080",
    },
    "linux-x64": {
      file: "gitleaks_8.30.1_linux_x64.tar.gz",
      sha256: "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb",
    },
    "win32-arm64": {
      file: "gitleaks_8.30.1_windows_arm64.zip",
      sha256: "b95f5e4f5c425cedca7ee203d9afd29597e692c4924a12ed42f970537c72cc0f",
    },
    "win32-x64": {
      file: "gitleaks_8.30.1_windows_x64.zip",
      sha256: "d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e",
    },
  },
};

/** @type {Release} the linter of shell scripts, from GitHub's digests: it builds nothing for Windows on Arm */
export const SHELLCHECK = {
  name: "shellcheck",
  version: "0.11.0",
  versionArgs: ["--version"],
  release: "https://github.com/koalaman/shellcheck/releases/download/v0.11.0/",
  archives: {
    "darwin-arm64": {
      file: "shellcheck-v0.11.0.darwin.aarch64.tar.gz",
      sha256: "339b930feb1ea764467013cc1f72d09cd6b869ebf1013296ba9055ab2ffbd26f",
    },
    "darwin-x64": {
      file: "shellcheck-v0.11.0.darwin.x86_64.tar.gz",
      sha256: "c2c15e08df0e8fbc374c335b230a7ee958c313fa5714817a59aa59f1aa594f51",
    },
    "linux-arm64": {
      file: "shellcheck-v0.11.0.linux.aarch64.tar.gz",
      sha256: "68a8133197a50beb8803f8d42f9908d1af1c5540d4bb05fdfca8c1fa47decefc",
    },
    "linux-x64": {
      file: "shellcheck-v0.11.0.linux.x86_64.tar.gz",
      sha256: "b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6",
    },
    "win32-x64": {
      file: "shellcheck-v0.11.0.zip",
      sha256: "8a4e35ab0b331c85d73567b12f2a444df187f483e5079ceffa6bda1faa2e740e",
    },
  },
};

/** @type {Release} the linter of workflow files, from its checksums file */
export const ACTIONLINT = {
  name: "actionlint",
  version: "1.7.12",
  versionArgs: ["-version"],
  release: "https://github.com/rhysd/actionlint/releases/download/v1.7.12/",
  archives: {
    "darwin-arm64": {
      file: "actionlint_1.7.12_darwin_arm64.tar.gz",
      sha256: "aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f",
    },
    "darwin-x64": {
      file: "actionlint_1.7.12_darwin_amd64.tar.gz",
      sha256: "5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644",
    },
    "linux-arm64": {
      file: "actionlint_1.7.12_linux_arm64.tar.gz",
      sha256: "325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6",
    },
    "linux-x64": {
      file: "actionlint_1.7.12_linux_amd64.tar.gz",
      sha256: "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
    },
    "win32-arm64": {
      file: "actionlint_1.7.12_windows_arm64.zip",
      sha256: "cadcf7ea4efe3a68728893813643cebe1185e5b1d4be5b96245f65c9a4d5ea41",
    },
    "win32-x64": {
      file: "actionlint_1.7.12_windows_amd64.zip",
      sha256: "6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9",
    },
  },
};

/** @type {Release} the auditor of workflow files, from GitHub's digests: it builds nothing for Windows on Arm */
export const ZIZMOR = {
  name: "zizmor",
  version: "1.32.0",
  versionArgs: ["--version"],
  release: "https://github.com/zizmorcore/zizmor/releases/download/v1.32.0/",
  archives: {
    "darwin-arm64": {
      file: "zizmor-aarch64-apple-darwin.tar.gz",
      sha256: "6efed18c4539a663fd3c851a2be9533fd8456c4e646d9416206da059154a0d3c",
    },
    "darwin-x64": {
      file: "zizmor-x86_64-apple-darwin.tar.gz",
      sha256: "6983143c719ada6845a69cc4dd2bacc215f971662fecd8bbd2678388e5ce5969",
    },
    "linux-arm64": {
      file: "zizmor-aarch64-unknown-linux-gnu.tar.gz",
      sha256: "cb152b207f815116d7fa1c1ee4614f61578803351395052908095e79adfd9fd0",
    },
    "linux-x64": {
      file: "zizmor-x86_64-unknown-linux-gnu.tar.gz",
      sha256: "bb110cc765eca9cd7efb2e284a956be5974c60027b0970f16397d86208a9957b",
    },
    "win32-x64": {
      file: "zizmor-x86_64-pc-windows-msvc.zip",
      sha256: "d284a16e09d9df4ce2c000357e7b59bd531be093bea5718a1ce225b449b59d49",
    },
  },
};

/**
 * The pinned archive of a release for a platform, or nothing for one the pin does not cover.
 * @param {Release} release
 * @param {string} platform
 * @param {string} arch
 */
export function archiveFor(release, platform, arch) {
  return Object.hasOwn(release.archives, `${platform}-${arch}`) ? release.archives[`${platform}-${arch}`] : undefined;
}

/**
 * The program's file name on a platform.
 * @param {Release} release
 * @param {string} platform
 */
export const programName = (release, platform) => (platform === "win32" ? `${release.name}.exe` : release.name);

/**
 * The system's `tar`. Git for Windows puts ahead of Windows's own on the path a GNU tar that reads no zip archive, the
 * form of the Windows releases, so on Windows it is called by its path.
 * @param {string} platform
 * @param {NodeJS.ProcessEnv} [env]
 */
export function tarProgram(platform, env = process.env) {
  return platform === "win32" ? path.join(env.SystemRoot ?? env.windir ?? "C:\\Windows", "System32", "tar.exe") : "tar";
}

/** @param {string} url */
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The download of ${url} failed: ${response.status} ${response.statusText}.`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * @param {string} platform
 * @param {string[]} args
 */
function tar(platform, args) {
  const result = spawnSync(tarProgram(platform), args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw new Error(`tar could not run: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`tar failed: ${result.stderr.trim()}`);
  return result.stdout;
}

/**
 * The one entry of an archive that holds the program: the entry whose last name is the program's, at whatever folder
 * the release puts it, and no path that leaves the folder it is extracted into.
 * @param {string[]} entries
 * @param {string} program
 * @param {string} file the archive's name, for the message
 */
export function programEntry(entries, program, file) {
  const found = entries.filter((entry) => entry.replaceAll("\\", "/").split("/").at(-1) === program);
  if (found.length !== 1) throw new Error(`${file} holds ${found.length} entries named ${program}, not one.`);
  const parts = found[0].replaceAll("\\", "/").split("/");
  if (path.isAbsolute(found[0]) || /^[A-Za-z]:/.test(found[0]) || parts.includes("..")) {
    throw new Error(`${file} names its ${program} ${found[0]}, outside the folder it is extracted into.`);
  }
  return found[0];
}

/**
 * Extracts from an archive the program alone, and returns the entry's path.
 * @param {string} archive
 * @param {string} dir
 * @param {string} program
 * @param {string} platform
 */
function extract(archive, dir, program, platform) {
  const entries = tar(platform, ["-tf", archive]).split(/\r?\n/).filter(Boolean);
  const entry = programEntry(entries, program, path.basename(archive));
  tar(platform, ["-xf", archive, "-C", dir, entry]);
  return entry;
}

/** @type {Exec} */
export const spawn = (program, args, { cwd, env = process.env, input }) => {
  const result = spawnSync(program, args, { cwd, env, input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error };
};

/**
 * Throws unless an installed program says it is at the pinned version, so that a program left from another pin fails
 * before it reads anything.
 * @param {Release} release
 * @param {string} program
 * @param {Exec} exec
 * @param {ExecOptions} options
 */
export function checkVersion(release, program, exec, options) {
  const result = exec(program, release.versionArgs, options);
  if (result.error) throw new Error(`${release.name} could not run: ${result.error.message}`);
  if (!result.stdout.includes(release.version)) {
    throw new Error(`${release.name} says its version is ${result.stdout.trim()}, not the pinned ${release.version}.`);
  }
}

/**
 * Downloads an archive of a release into a folder, checks its SHA-256, and extracts the program from it only if the
 * digest is the pinned one. Returns the program's path.
 * @param {string} dir
 * @param {{
 *   release: Release,
 *   archive: Archive,
 *   platform: string,
 *   fetchBytes?: (url: string) => Promise<Buffer>,
 *   unpack?: (archive: string, dir: string, program: string, platform: string) => string,
 * }} options
 */
export async function install(dir, { release, archive, platform, fetchBytes = download, unpack = extract }) {
  const bytes = await fetchBytes(release.release + archive.file);
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  if (digest !== archive.sha256) {
    throw new Error(
      `${archive.file} has the SHA-256 ${digest}, not the pinned ${archive.sha256}: it is neither extracted nor run.`,
    );
  }
  const file = path.join(dir, archive.file);
  fs.writeFileSync(file, bytes);
  const name = programName(release, platform);
  const program = path.join(dir, unpack(file, dir, name, platform));
  if (!fs.existsSync(program)) throw new Error(`${archive.file} holds no ${name}.`);
  return program;
}
