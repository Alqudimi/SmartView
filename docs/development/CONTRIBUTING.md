# Contribution Guidelines

We welcome contributions from the community and internal teams.

## Workflow
1. **Branch Naming:** `feature/your-feature-name`, `bugfix/issue-description`, `hotfix/critical-patch`.
2. **Commit Messages:** Follow the Conventional Commits specification.
   - `feat: add new RTSP packet parser`
   - `fix: resolve UI jitter on TV mode`
   - `docs: update deployment architecture`
3. **Pull Requests:** 
   - All PRs must target the `main` branch.
   - PRs must pass all CI checks (lint, build).
   - Require at least one approving review from a core maintainer.

## Code Review Expectations
- Reviewers will check for performance regressions, strict typing compliance, and Tailwind usage.
- All new features must be accompanied by relevant documentation updates in `/docs`.
