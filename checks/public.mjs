// Finds in a text what a kit that is public from its first commit must not hold, and that can
// be found without a list of words: an e-mail address that is not a placeholder, and a path
// into a user's folder.
//
// Names of people, projects, providers and servers need a list, and that list is personal: it
// is kept outside this repository, with the hook that reads it before a push.

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
 * One entry for each line of the text that holds something personal: `{ line, kind }`. The text itself is not returned.
 * @param {string} text
 * @returns {{ line: number, kind: string }[]}
 */
export function personal(text) {
  /** @type {{ line: number, kind: string }[]} */
  const found = [];
  text.split(/\r?\n/).forEach((content, index) => {
    if ((content.match(ADDRESS) ?? []).some((address) => !placeholder(address))) {
      found.push({ line: index + 1, kind: "an e-mail address" });
    }
    if (FOLDER.test(content)) found.push({ line: index + 1, kind: "a path into a user's folder" });
  });
  return found;
}
