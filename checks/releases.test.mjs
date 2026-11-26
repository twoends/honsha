import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import {
  ACTIONLINT,
  GITLEAKS,
  SHELLCHECK,
  ZIZMOR,
  archiveFor,
  install,
  programEntry,
  programName,
  tarProgram,
} from "./releases.mjs";

// Every folder the tests make is in one, deleted at the end.
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "honsha-releases-test-"));
after(() => fs.rmSync(ROOT, { recursive: true, force: true, maxRetries: 5 }));

/** @param {string} prefix */
const temporary = (prefix) => fs.mkdtempSync(path.join(ROOT, prefix));

const PLATFORMS = ["darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64", "win32-arm64", "win32-x64"];

test("gitleaks's pin covers Windows, Linux and macOS on x64 and arm64, and refuses another platform", () => {
  for (const platform of ["win32", "linux", "darwin"]) {
    for (const arch of ["x64", "arm64"]) {
      const archive = archiveFor(GITLEAKS, platform, arch);
      assert.ok(archive, `${platform}-${arch}`);
      const name = { win32: "windows", linux: "linux", darwin: "darwin" }[platform];
      const form = platform === "win32" ? "zip" : "tar.gz";
      assert.equal(archive.file, `gitleaks_${GITLEAKS.version}_${name}_${arch}.${form}`);
    }
  }
  assert.equal(archiveFor(GITLEAKS, "linux", "ia32"), undefined);
  assert.equal(archiveFor(GITLEAKS, "freebsd", "x64"), undefined);
  assert.equal(archiveFor(GITLEAKS, "constructor", ""), undefined);
});

test("each pin names its release by its version, and each archive by its digest, for the kit's hosts", () => {
  for (const release of [GITLEAKS, SHELLCHECK, ACTIONLINT, ZIZMOR]) {
    assert.match(release.version, /^\d+\.\d+\.\d+$/, release.name);
    assert.ok(release.release.startsWith("https://github.com/"), release.name);
    assert.ok(release.release.endsWith(`/releases/download/v${release.version}/`), release.name);
    for (const [platform, archive] of Object.entries(release.archives)) {
      assert.ok(PLATFORMS.includes(platform), `${release.name} ${platform}`);
      assert.match(archive.sha256, /^[0-9a-f]{64}$/, `${release.name} ${platform}`);
      assert.match(archive.file, platform.startsWith("win32") ? /\.zip$/ : /\.tar\.gz$/, `${release.name} ${platform}`);
    }
    assert.ok(archiveFor(release, "linux", "x64"), `${release.name} runs in the pipeline`);
    assert.ok(archiveFor(release, "win32", "x64"), `${release.name} runs on the Windows hosts`);
  }
  // Neither builds for Windows on Arm, and a pin names no archive that its release does not publish.
  assert.equal(archiveFor(SHELLCHECK, "win32", "arm64"), undefined);
  assert.equal(archiveFor(ZIZMOR, "win32", "arm64"), undefined);
});

test("the program's name takes `.exe` on Windows alone", () => {
  assert.equal(programName(ZIZMOR, "win32"), "zizmor.exe");
  assert.equal(programName(ZIZMOR, "linux"), "zizmor");
  assert.equal(programName(ZIZMOR, "darwin"), "zizmor");
});

test("Windows's own tar extracts the archive, not one that comes first on the path", () => {
  assert.equal(tarProgram("win32", { SystemRoot: "C:\\Windows" }), path.join("C:\\Windows", "System32", "tar.exe"));
  assert.equal(tarProgram("linux", {}), "tar");
  assert.equal(tarProgram("darwin", {}), "tar");
});

test("the program is the one entry of its name, in whatever folder, and never one outside the folder", () => {
  const entries = ["shellcheck-v0.11.0/", "shellcheck-v0.11.0/README.txt", "shellcheck-v0.11.0/shellcheck"];
  assert.equal(programEntry(entries, "shellcheck", "a.tar.gz"), "shellcheck-v0.11.0/shellcheck");
  assert.equal(programEntry(["LICENSE", "zizmor.exe"], "zizmor.exe", "a.zip"), "zizmor.exe");
  assert.throws(() => programEntry(["README.md"], "zizmor", "a.tar.gz"), /holds 0 entries named zizmor/);
  assert.throws(() => programEntry(["a/zizmor", "b/zizmor"], "zizmor", "a.tar.gz"), /holds 2 entries/);
  assert.throws(() => programEntry(["zizmors", "my-zizmor"], "zizmor", "a.tar.gz"), /holds 0 entries/);
  for (const outside of ["../zizmor", "a/../../zizmor", "/usr/bin/zizmor", "C:/zizmor", "a\\..\\..\\zizmor"]) {
    assert.throws(() => programEntry([outside], "zizmor", "a.tar.gz"), /outside the folder/, outside);
  }
});

test("an archive whose checksum differs stops before anything is written or extracted", async () => {
  const dir = temporary("honsha-releases-install-");
  let unpacked = false;
  await assert.rejects(
    install(dir, {
      release: GITLEAKS,
      archive: GITLEAKS.archives["linux-x64"],
      platform: "linux",
      fetchBytes: async () => Buffer.from("not the archive"),
      unpack: () => {
        unpacked = true;
        return "";
      },
    }),
    /neither extracted nor run/,
  );
  assert.equal(unpacked, false);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test("an archive with the pinned checksum is fetched from its release and its program alone extracted", async () => {
  const bytes = Buffer.from("an archive");
  const archive = { file: "tool.zip", sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
  for (const [release, platform, member] of /** @type {const} */ ([
    [GITLEAKS, "win32", "gitleaks.exe"],
    [GITLEAKS, "linux", "gitleaks"],
    [SHELLCHECK, "linux", "shellcheck"],
  ])) {
    const dir = temporary("honsha-releases-install-");
    /** @type {string[]} */
    const urls = [];
    /** @type {string[]} */
    const members = [];
    const program = await install(dir, {
      release,
      archive,
      platform,
      fetchBytes: async (url) => {
        urls.push(url);
        return bytes;
      },
      unpack: (file, into, name) => {
        assert.equal(fs.readFileSync(file, "utf8"), "an archive");
        members.push(name);
        fs.mkdirSync(path.join(into, "inner"));
        fs.writeFileSync(path.join(into, "inner", name), "");
        return `inner/${name}`;
      },
    });
    assert.deepEqual(urls, [`${release.release}tool.zip`]);
    assert.deepEqual(members, [member]);
    assert.equal(program, path.join(dir, "inner", member));
  }
});

test("an archive that holds no program fails after its digest is checked", async () => {
  const bytes = Buffer.from("an archive");
  const archive = { file: "tool.tar.gz", sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
  const dir = temporary("honsha-releases-install-");
  await assert.rejects(
    install(dir, { release: ACTIONLINT, archive, platform: "linux", fetchBytes: async () => bytes, unpack: () => "x" }),
    /holds no actionlint/,
  );
});
