// Run with: node checks/verify.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { personal } from "./public.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

// The samples are put together here, so that this file holds none of what it looks for.
/**
 * @param {string} local
 * @param {string} domain
 */
const at = (local, domain) => `${local}@${domain}`;
const windows = ["C:", "Users", "someone", "project"].join("\\");
const linux = ["", "home", "someone", "project"].join("/");
const mac = ["", "Users", "someone", "project"].join("/");

test("finds an e-mail address and says on which line, without repeating it", () => {
  const found = personal(`first line\nwrite to ${at("someone", "mail.provider.io")} for help\n`);
  assert.deepEqual(found, [{ line: 2, kind: "an e-mail address" }]);
});

test("lets placeholder addresses through", () => {
  for (const address of [
    at("worker", "example.org"),
    at("someone", "elsewhere.example"),
    at("nobody", "host.invalid"),
    at("noreply", "provider.io"),
    at("12345+name", "users.noreply.provider.io"),
    at("git", "provider.io"),
  ]) {
    assert.deepEqual(personal(`an address: ${address}`), [], address);
  }
});

test("does not take a version, a plugin or a pinned action for an address", () => {
  for (const text of [
    "tool@2.1.325",
    "plugin@marketplace",
    "owner/action@3d3c42e5aac5ba805825da76410c181273ba90b1",
    "'@example\\.org$'",
  ]) {
    assert.deepEqual(personal(text), [], text);
  }
});

test("finds a path into a user's folder on Windows, Linux and macOS", () => {
  for (const folder of [windows, windows.replace(/\\/g, "/"), linux, mac]) {
    assert.deepEqual(personal(`see ${folder}`), [{ line: 1, kind: "a path into a user's folder" }], folder);
  }
  assert.deepEqual(personal("see /home/<name>/project and C:\\Users\\<name>"), []);
});

test("finds the names it is given as whole words, ignoring case, and only when given", () => {
  const words = ["Zorblat", "Quix Corp", "a.b+c"];
  assert.deepEqual(personal("made for zorblat\nby QUIX CORP.\nfor a.b+c"), [], "no list");
  assert.deepEqual(personal("made for zorblat\nby QUIX CORP.\nfor a.b+c", words), [
    { line: 1, kind: "a personal name" },
    { line: 2, kind: "a personal name" },
    { line: 3, kind: "a personal name" },
  ]);
  for (const text of ["zorblatted", "superzorblat", "zorblat2", "Quix Corporation", "aXb+c"]) {
    assert.deepEqual(personal(text, words), [], text);
  }
});

test("no tracked file of the kit holds an address or a path of that kind", () => {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
  assert.ok(files.length > 0);
  const found = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    if (text.includes("\0")) continue;
    for (const { line, kind } of personal(text)) found.push(`${file}:${line} holds ${kind}`);
  }
  assert.deepEqual(found, []);
});
