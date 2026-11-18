# Lessons

Lessons about this repository only, as the workflow's section 8 defines them. Each is a short preventive rule.

- Stage the change's paths by name. `git add -A` and `git add .` also take up untracked files left in the working
  tree; the checker's input files `.honsha-checker.*` are ignored, other scratch files are not.
- Write `Work-Item: <id>` in the message's last paragraph, with the other trailers and no blank line between them:
  git reads only that paragraph as trailers, so the commit check finds none in a line above it.
