// Checks the commits of a work branch against the rules every project shares and the profile.
//
//   node checks/commits.mjs
//
// For every commit the branch adds to the default branch:
//   - the message ends with the trailer `Work-Item: <id>`, where <id> is the one in the name of
//     the branch, `work/<id>-<slug>`;
//   - the author and committer addresses match `commits.address` of the profile, when it is set.
//
// The branch and the two ends of its commits are read from git. A hosting service often checks
// out something other than the branch itself, so its wiring gives them in three environment
// variables: HONSHA_BRANCH (the name of the branch), HONSHA_BASE and HONSHA_HEAD (the commit
// before the first of the range, and the last one).
//
// The exit code is 1 when a commit breaks a rule. An address is never printed.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { readProfile } from './profile.mjs';

const WORK_BRANCH = /^work\/(\d{6}-\d{4})-[^/]+$/;
const FIELD = '\x1f';
const RECORD = '\x1d';
const VALUE = '\x1e';

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function attempt(cwd, args) {
  try {
    return git(cwd, args);
  } catch {
    return '';
  }
}

/**
 * Returns `{ commits, problems, note }` for the repository in `cwd`: how many commits were read,
 * one line for each rule a commit breaks, and a remark when there was nothing to check.
 */
export function check({ cwd = '.', env = process.env } = {}) {
  const profile = readProfile(path.join(cwd, '.hub', 'profile.yml'));
  const defaultBranch = profile?.defaultBranch ?? 'main';
  const head = env.HONSHA_HEAD || 'HEAD';
  const base =
    env.HONSHA_BASE ||
    [`origin/${defaultBranch}`, defaultBranch].find((ref) => attempt(cwd, ['rev-parse', '--verify', '--quiet', ref]));
  if (!base) return { commits: 0, problems: [`the default branch \`${defaultBranch}\` was not found`] };

  // The separators are written as git's own escapes and come back as the characters themselves.
  const format = ['%H', '%ae', '%ce', '%s', '%(trailers:key=Work-Item,valueonly,separator=%x1e)'].join('%x1f');
  const commits = git(cwd, ['log', '--reverse', `--format=${format}%x1d`, `${base}..${head}`])
    .split(RECORD)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, author, committer, subject, trailers = ''] = entry.split(FIELD);
      const items = trailers.split(VALUE).map((value) => value.trim()).filter(Boolean);
      return { hash, author, committer, subject, items };
    });
  if (commits.length === 0) return { commits: 0, problems: [], note: 'The branch adds no commit to the default branch.' };

  const problems = [];
  const branch = env.HONSHA_BRANCH || attempt(cwd, ['symbolic-ref', '--short', '-q', 'HEAD']);
  const id = WORK_BRANCH.exec(branch)?.[1];
  if (!id) problems.push(`the branch \`${branch || '(none)'}\` is not named work/<id>-<slug>`);
  const address = profile?.commitsAddress ? new RegExp(profile.commitsAddress) : null;
  for (const commit of commits) {
    const say = (problem) => problems.push(`${commit.hash.slice(0, 7)} ${commit.subject}: ${problem}`);
    if (commit.items.length === 0) say('no `Work-Item` trailer');
    else if (id && commit.items.some((item) => item !== id)) say(`\`Work-Item\` is not ${id}, the one of the branch`);
    if (address && !address.test(commit.author)) say('the author address does not match `commits.address`');
    if (address && !address.test(commit.committer)) say('the committer address does not match `commits.address`');
  }
  return { commits: commits.length, problems };
}

function main() {
  const { commits, problems, note } = check();
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) {
    console.error(`\nThe commits of the branch break ${problems.length === 1 ? 'a rule' : 'the rules'} above.`);
    return 1;
  }
  console.log(note ?? `The ${commits} commits of the branch follow the rules.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
