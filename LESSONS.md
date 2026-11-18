# Lessons

Lessons about this repository only, as the workflow's section 8 defines them. Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- Put `Work-Item` in the same paragraph as the other trailers, the last of the message: git reads only that
  paragraph as trailers, so a blank line before the co-author line hides it, and the commit check refuses it.
