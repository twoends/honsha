// Finds in a text what a kit that is public from its first commit must not hold: an e-mail
// address that is not a placeholder, a path into a user's folder, and the entries of a word list.
//
// Names of people, projects, providers and servers need the list, and the list is personal: it
// is kept outside this repository and given by the clone's configuration to the hook that runs
// before a push (checks/pushed.mjs). Without a list, only the patterns are checked.

const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
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
 * @param {string[]} [words] the entries of the personal list
 * @returns {{ line: number, kind: string }[]}
 */
export function personal(text, words = []) {
  /** @type {{ line: number, kind: string }[]} */
  const found = [];
  const listed = words.length > 0 ? wordPattern(words) : null;
  text.split(/\r?\n/).forEach((content, index) => {
    if ((content.match(ADDRESS) ?? []).some((address) => !placeholder(address))) {
      found.push({ line: index + 1, kind: "an e-mail address" });
    }
    if (FOLDER.test(content)) found.push({ line: index + 1, kind: "a path into a user's folder" });
    if (listed?.test(content)) found.push({ line: index + 1, kind: "a word from the personal list" });
  });
  return found;
}
