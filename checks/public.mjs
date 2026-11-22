// Finds in a text what a kit that is public from its first commit must not hold: an e-mail address that is not a
// placeholder, a path into a user's folder, a link to a user's Claude Code session, and the personal names it is given.
// A session driven from the web or through Remote Control adds that link to its commits, in a `Claude-Session:` trailer.
//
// No pattern finds a name; the caller gives those it knows. The hook that runs before a push
// (checks/pushed.mjs) gives the machine's user. Without names, only the patterns run.
//
// The caller can also allow addresses by a pattern: those the project publishes on purpose, as the
// profile's `commits.address` does for the authors and committers of every commit.

const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// A placeholder such as `session_<id>` has no letter or digit after the underscore, so it is no finding.
const SESSION = /claude\.ai\/code\/session_[A-Za-z0-9]/i;
const FOLDER = /[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+|\/home\/[A-Za-z0-9._-]+|\/Users\/[A-Za-z0-9._-]+/;

/**
 * An address nobody receives mail at: a reserved domain, a noreply address, or the user of a git URL.
 * @param {string} address
 */
function placeholder(address) {
  const [local, domain] = address.toLowerCase().split("@");
  return (
    /(^|\.)example\.(com|org|net)$/.test(domain) ||
    /\.(example|invalid|test|localhost)$/.test(domain) ||
    address.toLowerCase().includes("noreply") ||
    local === "git"
  );
}

/**
 * A pattern that finds any of the words, ignoring case, only where no letter or digit touches it.
 * @param {string[]} words
 */
function wordPattern(words) {
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${escaped.join("|")})(?![\\p{L}\\p{N}])`, "iu");
}

/**
 * One entry for each line of the text that holds something personal: `{ line, kind }`. The text itself is not returned.
 * @param {string} text
 * @param {string[]} [words] personal names
 * @param {RegExp | null} [allowed] the addresses that are not personal
 * @returns {{ line: number, kind: string }[]}
 */
export function personal(text, words = [], allowed = null) {
  /** @type {{ line: number, kind: string }[]} */
  const found = [];
  const listed = words.length > 0 ? wordPattern(words) : null;
  text.split(/\r?\n/).forEach((content, index) => {
    if ((content.match(ADDRESS) ?? []).some((address) => !placeholder(address) && !allowed?.test(address))) {
      found.push({ line: index + 1, kind: "an e-mail address" });
    }
    if (FOLDER.test(content)) found.push({ line: index + 1, kind: "a path into a user's folder" });
    if (SESSION.test(content)) found.push({ line: index + 1, kind: "a link to a Claude session" });
    if (listed?.test(content)) found.push({ line: index + 1, kind: "a personal name" });
  });
  return found;
}
