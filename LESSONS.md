# Lessons

Lessons about this repository only, as the workflow's section 8 defines them. Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- The trailers are the last block of a commit message: one blank line between the subject and `Work-Item`, none
  between `Work-Item` and the co-author line. Without the first, git reads the trailers as part of the subject; with
  the second, the block that workflow section 13.2 asks for is split. Run `node checks/commits.mjs` after each commit
  and before the first push of a branch.
