# designsystem

The design system `@lmfaole/designsystem`. See README.md for what is in it, its guides and its releases; the skills for building with it are in
`.claude/skills/`.

## Git: work on main

- **Everything is committed straight to `main` and pushed.** There are no other branches: no feature branch, no release branch, no pull
  request of our own, not for a large change or a major version either. A change too big for one commit is several commits on `main`, each
  one that builds and passes the tests.
- Start with `git switch main && git pull --rebase`. Before a push, the checks this file names pass (typecheck, tests, build). Push with
  `git push origin main`; when it is refused, `git pull --rebase` and push again. Never `--force`, never rewrite what is pushed.
- A branch that turns up anyway (from a tool, an agent or a bot) is merged into `main` (fast-forward or rebase) and deleted, here and on
  GitHub (`git push origin --delete <branch>`), in the same session.
- A release (minor or major) is made on `main` too: the version and its notes in the README, then the tag. The apps are workspaces of the
  same repository and use the design system as it is on `main`.
