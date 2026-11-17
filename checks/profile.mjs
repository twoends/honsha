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
//
// A value can be bare or in quotes. A regular expression is best written in single quotes, where
// YAML keeps a backslash as it is.

import fs from "node:fs";

const BLANK = /^\s*(#.*)?$/;

/** The value of a scalar: without its quotes, or without a trailing comment when it is bare. */
function scalar(raw) {
  const text = raw.trim();
  const single = /^'((?:[^']|'')*)'(?:\s+#.*)?$/.exec(text);
  if (single) return single[1].replace(/''/g, "'");
  const double = /^"((?:[^"\\]|\\.)*)"(?:\s+#.*)?$/.exec(text);
  if (double) return double[1].replace(/\\(["\\])/g, "$1");
  return text.replace(/(^|\s+)#.*$/, "");
}

/** The lines that follow `start` and belong to its block: blank lines, comments and `test` matches. */
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
 * Returns `{ defaultBranch, verify, commitsAddress }` from the text of a profile.
 * Throws when one of these keys is written in a form the reader does not accept.
 */
export function parseProfile(text) {
  const lines = text.split(/\r?\n/);
  const profile = { defaultBranch: null, verify: [], commitsAddress: null };
  lines.forEach((line, index) => {
    const top = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (!top) return;
    const [, key, rest] = top;
    const value = scalar(rest);
    if (key === "default-branch") profile.defaultBranch = value || null;
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
  });
  if (profile.commitsAddress !== null) {
    try {
      new RegExp(profile.commitsAddress);
    } catch {
      throw new Error("profile: `commits.address` is not a regular expression");
    }
  }
  return profile;
}

/** The profile at `file`, or null when there is no such file. */
export function readProfile(file = ".hub/profile.yml") {
  if (!fs.existsSync(file)) return null;
  return parseProfile(fs.readFileSync(file, "utf8"));
}
