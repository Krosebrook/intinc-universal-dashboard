# Git Branching Strategy for Intinc Universal Dashboard

## Table of Contents
- [Overview](#overview)
- [Branch Structure](#branch-structure)
- [Workflow Examples](#workflow-examples)
- [Branch Protection Rules](#branch-protection-rules)
- [Merge Strategy](#merge-strategy)
- [Conflict Resolution](#conflict-resolution)
- [Team Migration Guide](#team-migration-guide)
- [Emergency Procedures](#emergency-procedures)

---

## Overview

This repository follows a **three-branch workflow** designed for modern continuous delivery with development, staging, and production environments.

### Key Principles
- 🔄 **Continuous Integration**: All code changes are automatically tested
- 🚀 **Continuous Deployment**: Automated deployments to development and staging
- 🛡️ **Production Safety**: Manual approval required for production releases
- 📋 **Code Review**: Required reviews before merging to main and production
- 🔒 **Branch Protection**: Enforced rules prevent accidental changes

---

## Branch Structure

### 🌱 Development Branch (`development`)
**Purpose**: Active development and feature integration

- **Environment**: https://dev.intinc-dashboard.example.com
- **Auto-Deploy**: Yes, on every push
- **Protection Level**: Basic (status checks required)
- **Review Requirements**: Optional but recommended
- **Use Case**: Day-to-day development work

```bash
# Work on development branch
git checkout development
git pull origin development

# Make changes
git add .
git commit -m "feat: add new feature"
git push origin development

# Auto-deploys to dev environment
```

### 🚀 Main Branch (`main`)
**Purpose**: Staging and release preparation

- **Environment**: https://staging.intinc-dashboard.example.com
- **Auto-Deploy**: Yes, after tests pass
- **Protection Level**: Medium (1 approval + tests)
- **Review Requirements**: 1 approval required
- **Use Case**: Pre-production testing and QA

```bash
# Promote to staging
git checkout main
git merge development
git push origin main

# Triggers:
# 1. Full test suite
# 2. Security scanning
# 3. Auto-deploy to staging
```

### 🏭 Production Branch (`production`)
**Purpose**: Production releases

- **Environment**: https://intinc-dashboard.com
- **Auto-Deploy**: No (manual approval required)
- **Protection Level**: High (2 approvals + signed commits + all tests)
- **Review Requirements**: 2 approvals required
- **Use Case**: Production-ready releases only

```bash
# Create production release
git checkout production
git merge main
git push origin production

# Requires:
# 1. Manual approval in GitHub Actions
# 2. Full test suite passing
# 3. Security scans clear
# 4. 2 team member approvals
```

---

## Workflow Examples

### Feature Development
Typical workflow for developing a new feature:

```bash
# 1. Start from development
git checkout development
git pull origin development

# 2. Create feature branch (optional)
git checkout -b feature/user-authentication

# 3. Develop and commit
git add src/auth/
git commit -m "feat(auth): implement JWT authentication"

# 4. Push to remote
git push origin feature/user-authentication

# 5. Create PR to development
# - PR is automatically validated
# - Tests run automatically
# - Deploy preview created

# 6. After approval, merge to development
# - Automatically deploys to dev environment
# - Delete feature branch

# 7. Test in dev environment
# Visit: https://dev.intinc-dashboard.example.com

# 8. When ready, promote to staging
git checkout main
git pull origin main
git merge development
git push origin main
# Auto-deploys to staging

# 9. QA testing in staging
# Visit: https://staging.intinc-dashboard.example.com

# 10. Production release
git checkout production
git pull origin production
git merge main
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin production --tags
# Requires manual approval for deployment
```

### Hotfix Workflow
For urgent production fixes:

```bash
# 1. Create hotfix from production
git checkout production
git pull origin production
git checkout -b hotfix/critical-bug-fix

# 2. Fix the issue
git add .
git commit -m "fix(critical): resolve payment processing bug"

# 3. Create PR to production
# - Requires 2 approvals
# - All tests must pass

# 4. After merge, backport to main and development
git checkout main
git cherry-pick <hotfix-commit-sha>
git push origin main

git checkout development
git cherry-pick <hotfix-commit-sha>
git push origin development
```

### Release Workflow
Creating a versioned release:

```bash
# 1. Ensure main is ready
git checkout main
git pull origin main

# 2. Merge to production
git checkout production
git pull origin production
git merge main

# 3. Create release tag
git tag -a v1.2.3 -m "Release v1.2.3: New features and improvements"
git push origin production --tags

# 4. GitHub Actions will:
#    - Run full test suite
#    - Build production artifacts
#    - Create GitHub release
#    - Deploy to production (with approval)
#    - Publish Docker image
```

---

## Branch Protection Rules

### Development Branch
```yaml
Protection Rules:
  - Require status checks to pass: ✅
  - Required checks: [test, lint]
  - Allow force pushes: ✅ (for maintainers)
  - Allow deletions: ❌
  - Require pull request reviews: ⚠️  (Optional)
```

### Main Branch
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required approvals: 1
  - Require status checks to pass: ✅
  - Required checks: [test, build, lint, security-scan]
  - Require branches to be up to date: ✅
  - Allow force pushes: ❌
  - Allow deletions: ❌
  - Require signed commits: ⚠️  (Recommended)
```

### Production Branch
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required approvals: 2
  - Require status checks to pass: ✅
  - Required checks: [test, build, lint, security-scan, e2e]
  - Require branches to be up to date: ✅
  - Require signed commits: ✅
  - Require CODEOWNERS review: ✅
  - Allow force pushes: ❌
  - Allow deletions: ❌
  - Lock branch: ⚠️  (During critical periods)
```

To configure these rules, run:
```bash
cd workflow-templates
export GITHUB_TOKEN='your_personal_access_token'
./setup-branch-protection.sh
```

---

## Merge Strategy

### Allowed Merge Methods

**Development Branch**:
- ✅ Merge commits (preserves full history)
- ✅ Squash and merge (clean history)
- ✅ Rebase and merge (linear history)

**Main Branch**:
- ✅ Merge commits (recommended)
- ✅ Squash and merge (for small PRs)
- ❌ Rebase and merge (not recommended)

**Production Branch**:
- ✅ Merge commits only (preserves exact history)
- ❌ Squash merging (loses granular history)
- ❌ Rebase merging (risk of conflicts)

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes (dependencies, etc.)

**Examples**:
```bash
feat(auth): add OAuth2 authentication
fix(dashboard): resolve widget rendering issue
docs(readme): update installation instructions
refactor(api): simplify error handling logic
```

---

## Conflict Resolution

### Common Conflict Scenarios

#### 1. Development → Main Conflicts
```bash
# Update development with latest main
git checkout development
git pull origin main
# Resolve conflicts
git add .
git commit -m "merge: resolve conflicts with main"
git push origin development
```

#### 2. Main → Production Conflicts
```bash
# Should rarely happen if workflow is followed
# If it does, prefer production's version for critical files

git checkout production
git pull origin production
git merge main
# Resolve conflicts carefully
# Test thoroughly before pushing
git push origin production
```

#### 3. Feature Branch Conflicts
```bash
# Update feature with latest development
git checkout feature/my-feature
git pull origin development
# Resolve conflicts
git add .
git commit -m "merge: sync with development"
git push origin feature/my-feature
```

### Conflict Resolution Best Practices

1. **Communicate**: Let your team know you're resolving conflicts
2. **Understand**: Read both versions carefully before choosing
3. **Test**: Always run tests after resolving conflicts
4. **Review**: Have someone else review conflict resolutions
5. **Document**: Add comments explaining complex resolutions

---

## Team Migration Guide

### Onboarding New Team Members

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Krosebrook/intinc-universal-dashboard.git
   cd intinc-universal-dashboard
   ```

2. **Configure Git**:
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   
   # Optional: Set up commit signing
   git config commit.gpgsign true
   ```

3. **Set up development environment**:
   ```bash
   npm install
   npm run dev
   ```

4. **Understand the branches**:
   ```bash
   # View all branches
   git branch -a
   
   # Set up tracking
   git checkout development
   git checkout main
   git checkout production
   ```

### Transitioning from Old Workflow

If your team is migrating from a different workflow:

#### From Single-Branch Workflow:
```bash
# Old: main (everything)
# New: development → main → production

# 1. Keep existing main as staging
git branch main-staging main
git push origin main-staging

# 2. Create new branches
git checkout main
git branch development main
git branch production main
git push origin development production

# 3. Update protection rules (see above)
```

#### From GitFlow:
```bash
# Old: develop, main, feature/*, release/*, hotfix/*
# New: development, main, production

# Map:
# develop → development (active dev)
# main → production (releases only)
# Create new main → staging

# Migration:
git checkout develop
git branch development develop
git push origin development

git checkout main
git branch production main
git push origin production

git branch main develop  # Reset main to develop
git push origin main --force
```

---

## Emergency Procedures

### 🚨 Production Incident Response

#### 1. Immediate Rollback
```bash
# Option A: Revert last commit
git checkout production
git revert HEAD
git push origin production
# Triggers auto-deployment with previous version

# Option B: Rollback to specific version
git checkout production
git reset --hard v1.2.2  # Last known good version
git push origin production --force
# Requires admin override of branch protection
```

#### 2. Hotfix Deployment
```bash
# Fast-track critical fix
git checkout production
git checkout -b hotfix/emergency-fix

# Make minimal fix
git add .
git commit -m "fix(critical): emergency fix for [issue]"

# Create PR with "URGENT" label
# Tag team members for immediate review
# After 1 approval (emergency exception):
git checkout production
git merge hotfix/emergency-fix
git push origin production

# Manual approval in GitHub Actions
# Monitor deployment closely
```

#### 3. Branch Lock
For critical production issues:
```bash
# Via GitHub UI:
# Settings → Branches → production → Edit
# Enable: "Lock branch" (temporary)

# This prevents all pushes except admins
# Use during active incident investigation
```

### 🔧 Broken Deployment Recovery

#### Development/Staging Issues
```bash
# 1. Revert problematic commit
git checkout development
git log --oneline  # Find bad commit
git revert <bad-commit-sha>
git push origin development

# 2. Or reset to last good state
git reset --hard <last-good-commit>
git push origin development --force
```

#### Production Issues
```bash
# Never force push to production!
# Always use revert or approved emergency procedures

# 1. Create revert commit
git revert <bad-commit-sha>

# 2. Or cherry-pick fix
git cherry-pick <fix-commit-sha>

# 3. Push and wait for approval
git push origin production
```

### 📞 Emergency Contacts

When in doubt, contact:
- **DevOps Lead**: @devops-lead
- **CTO**: @cto
- **On-Call Engineer**: Check PagerDuty

---

## Automation Scripts

The repository includes several automation scripts in `workflow-templates/`:

### Pre-Flight Check
Run before making changes:
```bash
./workflow-templates/pre-flight-check.sh
```

Checks:
- Repository access
- Branch status
- Open PRs
- CI/CD configuration

### Validation
Verify workflow setup:
```bash
./workflow-templates/validate-refactor.sh
```

Checks:
- Branch structure
- Documentation
- CI/CD workflows
- Branch protection

### Quick Refactor
Generate AI prompts for workflow setup:
```bash
./workflow-templates/quick-refactor.sh
```

Creates AI prompts for:
- Branch setup
- CI/CD configuration
- Code quality improvements

---

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Semantic Versioning](https://semver.org/)

---

## Questions or Issues?

If you have questions about this branching strategy:
1. Check the [Team Wiki](https://github.com/Krosebrook/intinc-universal-dashboard/wiki)
2. Ask in #dev-support Slack channel
3. Create an issue with the `question` label

---

**Last Updated**: January 2026  
**Maintained by**: DevOps Team
