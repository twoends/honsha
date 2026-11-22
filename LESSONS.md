# Lessons

Lessons about this repository only, the project's level (workflow, Lessons). Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- One blank line goes between a commit's subject and its trailers, where the core rules (Commits and branches) put
  them: without it, git reads the trailers as part of the subject. Run `node checks/commits.mjs` after each commit
  and before the first push of a branch.
- While the kit is in development, design a change as it should be, and change with it every reference, document and
  file it affects, here and in the home. Keep nothing as it is, and avoid no file that another open item changes, only
  so that what depends on it need not change: merge the default branch once that item lands.
