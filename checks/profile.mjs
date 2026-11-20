// Reads the few keys of a project's profile that the kit's scripts need.
//
// The profile is `.hub/profile.yml`. No YAML library is used: the reader accepts the plain forms
// below and refuses anything else, so that a profile it cannot read is an error and never a
// silent pass.
//
//   default-branch: main
//   verify:
//     - npm run check
//   commits:
//     address: '@example\.org$'
//   kinds:
//     feature: 10
//   public: true
//   stack: [node, postgres]
//   lessons: LESSONS.md
//
// A value can be bare or in quotes. A regular expression is best written in single quotes, where
// YAML keeps a backslash as it is.

import fs from "node:fs";

const BLANK = /^\s*(#.*)?$/;
// A technology names a file of the home's lessons, so it may not lead out of their folder.
const TECHNOLOGY = /^[A-Za-z0-9][\w.+-]*$/;

/**
 * @typedef {{ defaultBranch: string | null, verify: string[],
 *   commitsAddress: string | null, kinds: Record<string, number> | null, public: boolean,
 *   stack: string[], lessons: string | null }} Profile
 */

/**
 * The value of a scalar: without its quotes, or without a trailing comment when it is bare.
 * @param {string} raw
 */
function scalar(raw) {
  const text = raw.trim();
  const single = /^'((?:[^']|'')*)'(?:\s+#.*)?$/.exec(text);
  if (single) return single[1].replace(/''/g, "'");
  const double = /^"((?:[^"\\]|\\.)*)"(?:\s+#.*)?$/.exec(text);
  if (double) return double[1].replace(/\\(["\\])/g, "$1");
  return text.replace(/(^|\s+)#.*$/, "");
}

/**
 * The lines that follow `start` and belong to its block: blank lines, comments and `test` matches.
 * @param {string[]} lines
 * @param {number} start
 * @param {RegExp} test
 */
function block(lines, start, test) {
  const found = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (BLANK.test(lines[index])) continue;
    const match = test.exec(lines[index]);
    if (!match) break;
    found.push(match);
  }
  return found;
}

/**
 * Returns `{ defaultBranch, verify, commitsAddress, kinds, public, stack, lessons }` from the text of a profile.
 * Throws when one of these keys is written in a form the reader does not accept.
 * @param {string} text
 * @returns {Profile}
 */
export function parseProfile(text) {
  const lines = text.split(/\r?\n/);
  /** @type {Profile} */
  const profile = {
    defaultBranch: null,
    verify: [],
    commitsAddress: null,
    kinds: null,
    public: false,
    stack: [],
    lessons: null,
  };
  lines.forEach((line, index) => {
    const top = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (!top) return;
    const [, key, rest] = top;
    const value = scalar(rest);
    if (key === "default-branch") profile.defaultBranch = value || null;
    if (key === "stack") {
      const inline = /^\[(.*)\]$/.exec(value);
      if (inline) {
        profile.stack = inline[1]
          .split(",")
          .map((item) => scalar(item))
          .filter(Boolean);
      } else if (value === "") {
        profile.stack = block(lines, index, /^\s*-\s+(.*)$/).map((match) => scalar(match[1]));
      } else {
        throw new Error("profile: `stack` must be a list of technologies");
      }
      const wrong = profile.stack.find((technology) => !TECHNOLOGY.test(technology));
      if (wrong !== undefined) throw new Error(`profile: \`${wrong}\` in \`stack\` is not the name of a technology`);
    }
    if (key === "lessons") {
      if (value === "") throw new Error("profile: `lessons` must name a file");
      // A hook gives this file to every session, so it may not lead out of the project, as a session may not.
      if (/^([\\/]|[A-Za-z]:)/.test(value) || value.split(/[\\/]/).includes("..")) {
        throw new Error("profile: `lessons` must name a file inside the project");
      }
      profile.lessons = value;
    }
    if (key === "direct-commits") {
      // A profile that expects pushes to its default branch is refused, so the mismatch is seen when it is read.
      throw new Error(
        "profile: `direct-commits` no longer exists: the default branch changes only through pull requests, in every repository",
      );
    }
    if (key === "verify") {
      if (value === "") {
        profile.verify = block(lines, index, /^\s*-\s+(.*)$/).map((match) => scalar(match[1]));
      } else if (value !== "[]") {
        throw new Error("profile: `verify` must be a list with one command on each line");
      }
      if (profile.verify.some((command) => command === "")) {
        throw new Error("profile: `verify` holds an empty command");
      }
    }
    if (key === "commits") {
      const inline = /^\{\s*address:\s*(.+?)\s*\}$/.exec(value);
      if (inline) {
        profile.commitsAddress = scalar(inline[1]);
      } else if (value === "") {
        const address = block(lines, index, /^\s+([\w-]+):(.*)$/).find((match) => match[1] === "address");
        if (address) profile.commitsAddress = scalar(address[2]);
      } else if (value !== "{}") {
        throw new Error("profile: `commits` must be a map with the key `address`");
      }
    }
    if (key === "public") {
      if (value !== "true" && value !== "false") throw new Error("profile: `public` must be true or false");
      profile.public = value === "true";
    }
    if (key === "kinds") {
      if (value === "{}") {
        profile.kinds = {};
      } else if (value === "") {
        /** @type {Record<string, number>} */
        const kinds = {};
        for (const match of block(lines, index, /^\s+([\w-]+):(.*)$/)) {
          const most = scalar(match[2]);
          if (!/^\d+$/.test(most)) throw new Error(`profile: kind \`${match[1]}\` needs a whole number of files`);
          kinds[match[1]] = Number(most);
        }
        profile.kinds = kinds;
      } else {
        throw new Error("profile: `kinds` must be a map from a kind to a number of files");
      }
    }
  });
  if (profile.commitsAddress !== null) {
    try {
      RegExp(profile.commitsAddress);
    } catch {
      throw new Error("profile: `commits.address` is not a regular expression");
    }
  }
  return profile;
}

/**
 * The profile at `file`, or null when there is no such file.
 * @param {string | URL} [file]
 * @returns {Profile | null}
 */
export function readProfile(file = ".hub/profile.yml") {
  if (!fs.existsSync(file)) return null;
  return parseProfile(fs.readFileSync(file, "utf8"));
}
