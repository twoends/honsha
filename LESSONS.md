# Lessons

Lessons about this repository only, as the workflow's section 8 defines them. Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- No blank line between `Work-Item` and the co-author line: it would split the last block that workflow section 13.2
  asks for, and git would not read `Work-Item` as a trailer.
