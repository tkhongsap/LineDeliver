---
description: Sync repository with remote main branch while preserving local branches (especially replit-agent)
allowed-tools: Bash(git status:*), Bash(git stash:*), Bash(git checkout:*), Bash(git pull:*), Bash(git fetch:*), Bash(git branch:*)
argument-hint: Optionally provide a message for any stashing operations
---

# Repository Sync Command

This command safely synchronizes your local repository with the remote main branch while preserving important local branches like `replit-agent`.

## Pre-sync Status Check
First, let me check the current repository state:

**Current Status:**
!`git status`

**Current Branch:**
!`git branch --show-current`

**Local Branches:**
!`git branch -v`

## Sync Process

I'll now perform the following operations safely:

### 1. Handle Uncommitted Changes
If there are uncommitted changes, I'll stash them temporarily with a descriptive message.

### 2. Switch to Main Branch
Safely switch to the main branch, handling any conflicts or issues.

### 3. Pull Latest Changes
Pull the latest changes from origin/main to get all merged updates.

### 4. Fetch and Prune
Run `git fetch --prune` to sync remote references and remove deleted branches.

### 5. Clean Up Merged Branches
Remove local branches that have been merged into main, but **NEVER** delete:
- `replit-agent` branch (explicitly protected)
- `main` branch (current working branch)
- Any branch that hasn't been fully merged

### 6. Restore Working State
If changes were stashed, restore them back to the working directory.

## Safety Features
- ✅ **replit-agent branch protection**: Never deleted under any circumstances
- ✅ **Stash preservation**: Uncommitted work is safely stored and restored
- ✅ **Merge verification**: Only delete branches that are fully merged
- ✅ **Error handling**: Safe fallbacks if any operation fails

## Usage Notes
- Run this command from any branch - it will safely return you to main
- Any uncommitted changes will be preserved through stashing
- The command provides status updates at each step
- All important local branches (like replit-agent) are explicitly protected

Let me execute this sync process now:

**Step 1: Check for uncommitted changes**
!`git status --porcelain`

**Step 2: Stash changes if needed (will be skipped if no changes)**
!`git stash push -m "Auto-stash before sync: ${ARGUMENTS:-$(date)}"`

**Step 3: Switch to main branch**
!`git checkout main`

**Step 4: Pull latest changes from origin/main**
!`git pull origin main`

**Step 5: Fetch with prune to sync remote references**
!`git fetch --prune`

**Step 6: Show merged branches**
!`git branch --merged main`

**Step 7: Clean up merged branches (manual verification recommended)**
Note: Use `git branch -d <branch-name>` to delete specific merged branches, but protect replit-agent

**Step 8: Restore stashed changes**
!`git stash pop`

**Final Status Check:**
!`git status`

!`echo "✅ Repository sync completed successfully!"`
!`echo "📋 Current branches:"`
!`git branch -v`