#!/usr/bin/env bash

# ============================================================================
# Pre-Flight Check Script
# ============================================================================
# Performs comprehensive repository analysis before applying Git workflow
# Checks repository access, existing branches, PRs, CI/CD config, and activity
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_section() {
    echo -e "${CYAN}--- $1 ---${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Repository Access Validation
# ============================================================================

validate_repository_access() {
    print_header "Repository Access Validation"
    
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    print_success "Git repository detected"
    
    # Get repository information
    local repo_url
    repo_url=$(git config --get remote.origin.url || echo "unknown")
    print_info "Remote URL: $repo_url"
    
    # Check if we can fetch from remote
    print_section "Testing remote connectivity"
    if git ls-remote origin &> /dev/null; then
        print_success "Can connect to remote repository"
    else
        print_warning "Cannot connect to remote repository"
        print_info "This may be expected if working offline"
    fi
    
    # Check authentication
    if command -v gh &> /dev/null; then
        if gh auth status &> /dev/null; then
            print_success "Authenticated with GitHub CLI"
        else
            print_warning "Not authenticated with GitHub CLI"
            print_info "Some checks may be limited without authentication"
        fi
    else
        print_info "GitHub CLI not installed - install for enhanced checks"
    fi
}

# ============================================================================
# Existing Branch Analysis
# ============================================================================

analyze_branches() {
    print_header "Existing Branch Analysis"
    
    # Get all branches
    print_section "Local Branches"
    local local_branches
    local_branches=$(git branch | sed 's/^[* ]*//')
    
    if [[ -n "$local_branches" ]]; then
        echo "$local_branches" | while read -r branch; do
            if [[ -n "$branch" ]]; then
                local commit_count
                commit_count=$(git rev-list --count "$branch" 2>/dev/null || echo "0")
                print_info "  $branch ($commit_count commits)"
            fi
        done
    else
        print_info "No local branches found"
    fi
    
    # Get remote branches
    print_section "Remote Branches"
    if git ls-remote --heads origin &> /dev/null; then
        git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||' | while read -r branch; do
            print_info "  $branch"
        done
    else
        print_warning "Cannot fetch remote branches"
    fi
    
    # Check current branch
    print_section "Current Branch"
    local current_branch
    current_branch=$(git branch --show-current)
    print_info "Currently on: $current_branch"
    
    # Check if working directory is clean
    if git diff-index --quiet HEAD --; then
        print_success "Working directory is clean"
    else
        print_warning "Working directory has uncommitted changes"
        print_info "Number of modified files: $(git diff --name-only | wc -l)"
    fi
}

# ============================================================================
# Open Pull Request Detection
# ============================================================================

detect_open_prs() {
    print_header "Open Pull Requests"
    
    if ! command -v gh &> /dev/null; then
        print_info "GitHub CLI not installed - skipping PR check"
        return
    fi
    
    if ! gh auth status &> /dev/null; then
        print_info "Not authenticated - skipping PR check"
        return
    fi
    
    local pr_count
    pr_count=$(gh pr list --json number --jq '. | length' 2>/dev/null || echo "0")
    
    if ((pr_count > 0)); then
        print_warning "Found $pr_count open pull request(s)"
        gh pr list --json number,title,headRefName,state --limit 5 2>/dev/null | \
            jq -r '.[] | "  #\(.number): \(.title) (\(.headRefName))"' || true
    else
        print_success "No open pull requests"
    fi
}

# ============================================================================
# CI/CD Configuration Detection
# ============================================================================

detect_cicd_config() {
    print_header "CI/CD Configuration"
    
    print_section "GitHub Actions"
    if [[ -d ".github/workflows" ]]; then
        local workflow_count
        workflow_count=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
        print_success "Found $workflow_count GitHub Actions workflow(s)"
        
        find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | while read -r workflow; do
            print_info "  $(basename "$workflow")"
        done
    else
        print_info "No GitHub Actions workflows found"
    fi
    
    print_section "Other CI/CD Systems"
    
    # Check for other CI systems
    local ci_files=(
        ".gitlab-ci.yml:GitLab CI"
        ".circleci/config.yml:CircleCI"
        ".travis.yml:Travis CI"
        "Jenkinsfile:Jenkins"
        ".drone.yml:Drone CI"
        "azure-pipelines.yml:Azure Pipelines"
    )
    
    for ci_file in "${ci_files[@]}"; do
        IFS=':' read -r file system <<< "$ci_file"
        if [[ -f "$file" ]]; then
            print_info "$system configuration found ($file)"
        fi
    done
    
    print_section "Deployment Configuration"
    
    # Check for deployment configs
    local deploy_files=(
        "vercel.json:Vercel"
        "netlify.toml:.netlify.toml:Netlify"
        "Dockerfile:Docker"
        "docker-compose.yml:Docker Compose"
        ".platform:Elastic Beanstalk"
        "app.yaml:Google App Engine"
    )
    
    for deploy_file in "${deploy_files[@]}"; do
        IFS=':' read -r file system <<< "$deploy_file"
        if [[ -f "$file" ]] || [[ -d "$file" ]]; then
            print_info "$system configuration found"
        fi
    done
}

# ============================================================================
# Package Manager Detection
# ============================================================================

detect_package_manager() {
    print_header "Package Manager Detection"
    
    local detected_managers=()
    
    # Node.js package managers
    if [[ -f "package.json" ]]; then
        print_success "Node.js project detected (package.json)"
        
        if [[ -f "package-lock.json" ]]; then
            detected_managers+=("npm")
        fi
        if [[ -f "yarn.lock" ]]; then
            detected_managers+=("yarn")
        fi
        if [[ -f "pnpm-lock.yaml" ]]; then
            detected_managers+=("pnpm")
        fi
        if [[ -f "bun.lockb" ]]; then
            detected_managers+=("bun")
        fi
        
        if ((${#detected_managers[@]} > 0)); then
            print_info "Detected: ${detected_managers[*]}"
        else
            print_warning "No lock file found - cannot determine package manager"
        fi
    fi
    
    # Python
    if [[ -f "requirements.txt" ]] || [[ -f "setup.py" ]] || [[ -f "pyproject.toml" ]]; then
        print_success "Python project detected"
        
        if [[ -f "poetry.lock" ]]; then
            print_info "Using Poetry"
        elif [[ -f "Pipfile" ]]; then
            print_info "Using Pipenv"
        fi
    fi
    
    # Rust
    if [[ -f "Cargo.toml" ]]; then
        print_success "Rust project detected (Cargo)"
    fi
    
    # Go
    if [[ -f "go.mod" ]]; then
        print_success "Go project detected"
    fi
    
    # Java/Kotlin
    if [[ -f "pom.xml" ]]; then
        print_success "Maven project detected"
    fi
    if [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        print_success "Gradle project detected"
    fi
    
    # Ruby
    if [[ -f "Gemfile" ]]; then
        print_success "Ruby project detected (Bundler)"
    fi
}

# ============================================================================
# Recent Activity Analysis
# ============================================================================

analyze_recent_activity() {
    print_header "Recent Activity Analysis"
    
    print_section "Recent Commits (Last 5)"
    git log --oneline --decorate -5 2>/dev/null || print_warning "Cannot access commit history"
    
    print_section "Commit Statistics (Last 30 days)"
    local days_ago
    days_ago=$(date -d '30 days ago' '+%Y-%m-%d' 2>/dev/null || date -v-30d '+%Y-%m-%d' 2>/dev/null || echo "")
    
    if [[ -n "$days_ago" ]]; then
        local commit_count
        commit_count=$(git log --since="$days_ago" --oneline | wc -l)
        print_info "Commits in last 30 days: $commit_count"
        
        local contributors
        contributors=$(git log --since="$days_ago" --format='%an' | sort -u | wc -l)
        print_info "Active contributors: $contributors"
    else
        print_warning "Cannot calculate date range"
    fi
    
    print_section "Repository Size"
    local repo_size
    repo_size=$(du -sh .git 2>/dev/null | cut -f1 || echo "unknown")
    print_info "Repository size: $repo_size"
}

# ============================================================================
# Risk Assessment
# ============================================================================

perform_risk_assessment() {
    print_header "Risk Assessment"
    
    local risks=()
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        risks+=("Uncommitted changes present - commit or stash before proceeding")
    fi
    
    # Check for untracked files
    local untracked_count
    untracked_count=$(git ls-files --others --exclude-standard | wc -l)
    if ((untracked_count > 0)); then
        risks+=("$untracked_count untracked file(s) - review and commit if needed")
    fi
    
    # Check if main branches exist
    if git show-ref --verify --quiet refs/heads/main || git show-ref --verify --quiet refs/heads/master; then
        : # Main branch exists
    else
        risks+=("No main/master branch found - unusual repository structure")
    fi
    
    # Check for open PRs
    if command -v gh &> /dev/null && gh auth status &> /dev/null; then
        local pr_count
        pr_count=$(gh pr list --json number --jq '. | length' 2>/dev/null || echo "0")
        if ((pr_count > 5)); then
            risks+=("$pr_count open PRs - high activity, coordinate with team")
        fi
    fi
    
    if ((${#risks[@]} > 0)); then
        print_warning "Found ${#risks[@]} potential risk(s):"
        for risk in "${risks[@]}"; do
            echo -e "  ${YELLOW}•${NC} $risk"
        done
    else
        print_success "No significant risks detected"
    fi
}

# ============================================================================
# Recommendations
# ============================================================================

provide_recommendations() {
    print_header "Recommendations"
    
    local recommendations=()
    
    # Check if branches need to be created
    if ! git show-ref --quiet refs/heads/development; then
        recommendations+=("Create 'development' branch for active development")
    fi
    
    if ! git show-ref --quiet refs/heads/production; then
        recommendations+=("Create 'production' branch for production releases")
    fi
    
    # Check for CI/CD
    if [[ ! -d ".github/workflows" ]]; then
        recommendations+=("Set up GitHub Actions for automated testing and deployment")
    fi
    
    # Check for documentation
    if [[ ! -f "workflow-templates/BRANCHING_STRATEGY.md" ]]; then
        recommendations+=("Document branching strategy in BRANCHING_STRATEGY.md")
    fi
    
    # Check for branch protection
    if command -v gh &> /dev/null && gh auth status &> /dev/null; then
        if ! gh api "repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/branches/main/protection" &> /dev/null && \
           ! gh api "repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/branches/master/protection" &> /dev/null; then
            recommendations+=("Configure branch protection rules for main/master branch")
        fi
    fi
    
    if ((${#recommendations[@]} > 0)); then
        print_info "Consider the following improvements:"
        for rec in "${recommendations[@]}"; do
            echo -e "  ${CYAN}→${NC} $rec"
        done
    else
        print_success "Repository is well-configured"
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "Pre-Flight Check"
    print_info "Repository analysis before applying Git workflow"
    echo ""
    
    # Change to repository root
    while [[ ! -d ".git" ]] && [[ "$PWD" != "/" ]]; do
        cd ..
    done
    
    if [[ ! -d ".git" ]]; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    validate_repository_access
    echo ""
    
    analyze_branches
    echo ""
    
    detect_open_prs
    echo ""
    
    detect_cicd_config
    echo ""
    
    detect_package_manager
    echo ""
    
    analyze_recent_activity
    echo ""
    
    perform_risk_assessment
    echo ""
    
    provide_recommendations
    echo ""
    
    print_header "Pre-Flight Check Complete"
    print_success "You can proceed with applying the Git workflow"
    print_info "Review the recommendations above before proceeding"
}

# Run main function
main "$@"
