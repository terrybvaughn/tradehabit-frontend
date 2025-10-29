# Shared Documentation Sync Protocol

## Overview
This protocol ensures that changes to shared documentation in `docs/shared/` are properly synchronized across all repositories that use it as a submodule.

**Repository Structure:**
- **`tradehabit-docs`**: Source repository containing the actual documentation files
- **`tradehabit-backend`**: Contains `docs/shared/` as a git submodule pointing to `tradehabit-docs`
- **`tradehabit-frontend`**: Contains `docs/shared/` as a git submodule pointing to `tradehabit-docs`

Use `./scripts/update-shared-docs.sh` (from the root of this repo) to automatically pull the latest docs in the source repo and commit submodule pointer updates in both backend and frontend repos.

## 🚀 Standard Workflow (Use This!)

```bash
# 1) Make your doc changes inside the submodule
cd /Users/terry/projects/tradehabit-frontend
cd docs/shared
git checkout main
# edit files under docs/
git add docs/<file>.md
git commit -m "docs: <message>"
git push

# 2) From frontend root, sync submodule pointers
cd /Users/terry/projects/tradehabit-frontend
./scripts/update-shared-docs.sh
# This:
# - Fast-forwards the submodule in backend and frontend
# - Commits the updated submodule pointers in each parent repo
# - Prints a success message when complete
```

## ⚠️ Common Issues to Avoid

### 1. Detached HEAD State
- **Problem**: Submodules can end up in detached HEAD state, preventing updates
- **Symptom**: `git pull` fails with "You are not currently on a branch"
- **Solution**: Always run `git checkout main` in the submodule before pulling

### 2. Stale Submodule Pointers
- **Problem**: Changes pushed to `tradehabit-docs` don't appear in other repos
- **Symptom**: Updated files not visible in backend/frontend repos
- **Solution**: Update submodule pointers after pushing to source repo

### 3. Uncommitted Changes (Clean Working Trees Required)
- **Problem**: Sync script fails due to uncommitted changes in submodule
- **Symptom**: "Uncommitted changes in docs/shared" error
- **Solution**: Commit or stash changes before running sync

## 🆘 Quick Fixes for Common Errors

### "You are not currently on a branch" (Detached HEAD)
```bash
cd /Users/terry/projects/tradehabit-frontend
git -C docs/shared checkout main
git -C docs/shared pull
```

### "Uncommitted changes in docs/shared"
```bash
cd /Users/terry/projects/tradehabit-frontend/docs/shared
git status
# Either commit or stash the changes
```

### Changes not showing up in other repos
```bash
# If you just updated tradehabit-docs, run the sync script to bump submodule pointers
cd /Users/terry/projects/tradehabit-frontend
./scripts/update-shared-docs.sh
```

## 🔧 Manual Sync (If Script Fails)

If the automated sync script fails, follow these steps:

1. **Fix backend detached HEAD**:
   ```bash
   cd /Users/terry/projects/tradehabit-frontend
   git -C docs/shared checkout main
   git -C docs/shared pull
   ```

2. **Update backend submodule pointer**:
   ```bash
   git add docs/shared
   git commit -m "chore(docs): bump shared docs pointer"
   git push
   ```

## ✅ Verification & Auth

```bash
# Check if your changes are there
grep -n "Your New Content" docs/shared/docs/mentor.md

# Check submodule status
git -C docs/shared status

# If pushes prompt for credentials, ensure your Git auth is set up
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
# For HTTPS, use a credential helper or a personal access token
git config --global credential.helper osxkeychain  # macOS
git config --global credential.helper store        # fallback

# Check recent commits
git -C docs/shared log --oneline -3
```

## 💡 Key Points

- `docs/shared/` = git submodule pointing to `tradehabit-docs`
- Always commit to source repo first, then sync
- Use the sync script: `./scripts/update-shared-docs.sh` (requires clean working trees in parent repos)
- If script fails, fix detached HEAD in backend first
- Always verify changes appear in all repos after sync

## 🧭 Why Two Steps Are Needed

`docs/shared` is a Git submodule, which is a separate repository. You must:
1) Commit and push your changes in the submodule itself (so a new commit exists to point to), then
2) Update the parent repositories to point at that new commit (the script does this fast-forward + commit for you).

The script will abort if any parent repo has uncommitted changes under `docs/shared` or elsewhere. Commit or stash first, then re-run.

---

**For Agent Reference**: When updating shared documentation, follow the Standard Workflow above and use the Quick Fixes if errors occur.
