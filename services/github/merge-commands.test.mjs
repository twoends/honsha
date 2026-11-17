// Run with: node checks/verify.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

import { judge } from '../../hooks/guard.mjs';

test('the list is one the guard can read', () => {
  const list = JSON.parse(fs.readFileSync(new URL('./merge-commands.json', import.meta.url), 'utf8')).merge;
  assert.ok(Array.isArray(list) && list.length > 0);
  for (const pattern of list) assert.doesNotThrow(() => new RegExp(pattern), pattern);
});

test("the guard refuses GitHub's commands that merge a pull request", () => {
  for (const line of [
    'gh pr merge 12',
    'gh pr merge --merge --delete-branch',
    'gh pr merge 12 --squash --auto',
    'gh -R owner/repository pr merge 3',
    'gh api -X PUT repos/owner/repository/pulls/3/merge',
    "gh api graphql -f query='mutation { mergePullRequest(input: {pullRequestId: \"x\"}) { clientMutationId } }'",
    'curl -X PUT https://api.github.com/repos/owner/repository/pulls/3/merge',
    'gh pr checks 12 && gh pr merge 12',
  ]) {
    assert.match(judge(line) ?? '', /merges a pull request/, line);
  }
});

test('the guard lets through the commands of this piece that open and read a pull request', () => {
  for (const line of [
    'gh pr create --base main --title "Export orders as CSV" --body-file body.md',
    'gh pr view --json number,state,mergedAt',
    'gh pr view 12 --json mergedBy,mergeCommit',
    'gh pr checks',
    'gh api repos/owner/repository/pulls/3',
    'gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --delete-branch-on-merge',
    'cat > notes.md <<EOF\ngh pr merge 12\nEOF',
    'echo "gh pr merge 12"',
  ]) {
    assert.equal(judge(line), null, line);
  }
});
