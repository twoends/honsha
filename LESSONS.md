# Lessons

Lessons about this repository only, as the workflow's section 8 defines them. Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- Keep every trailer, `Work-Item` and the co-author line, in one last block with no blank line between them: a blank
  line splits the block that workflow section 13.2 asks for, git does not read `Work-Item` as a trailer, and no later
  commit can supply it. Run `node checks/commits.mjs` after each commit and before the first push of a branch.
