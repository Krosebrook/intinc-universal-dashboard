#!/usr/bin/env bash

# ============================================================================
# Validate Refactor Script
# ============================================================================
# Validates branch structure, documentation, CI/CD workflows, and branch
# protection rules to ensure proper Git workflow implementation
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_WARNING=1
EXIT_ERROR=2

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((CHECKS_WARNING++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Branch Structure Validation
# ============================================================================

validate_branches() {
    print_header "Validating Branch Structure"
    
    # Get local branches
    local branches
    branches=$(git branch -a | sed 's/^[* ]*//' | sed 's/remotes\/origin\///')
    
    # Check for main/master branch
    if echo "$branches" | grep -q "^main$\|^master$"; then
        print_success "Main branch exists"
    else
        print_error "Main branch (main or master) not found"
    fi
    
    # Check for development branch
    if echo "$branches" | grep -q "^development$\|^develop$"; then
        print_success "Development branch exists"
    else
        print_error "Development branch not found"
    fi
    
    # Check for production branch
    if echo "$branches" | grep -q "^production$\|^prod$"; then
        print_success "Production branch exists"
    else
        print_error "Production branch not found"
    fi
    
    # List all branches for reference
    print_info "Available branches:"
    git branch -a | head -10
}

# ============================================================================
# Documentation Validation
# ============================================================================

validate_documentation() {
    print_header "Validating Documentation"
    
    # Check for BRANCHING_STRATEGY.md
    if [[ -f "${SCRIPT_DIR}/BRANCHING_STRATEGY.md" ]]; then
        print_success "BRANCHING_STRATEGY.md exists"
        
        # Validate content
        local required_sections=(
            "Branch Structure"
            "Workflow"
            "Protection Rules"
        )
        
        for section in "${required_sections[@]}"; do
            if grep -qi "$section" "${SCRIPT_DIR}/BRANCHING_STRATEGY.md"; then
                print_success "Documentation contains '$section' section"
            else
                print_warning "Documentation missing '$section' section"
            fi
        done
    else
        print_error "BRANCHING_STRATEGY.md not found in workflow-templates/"
    fi
    
    # Check for README.md updates
    if [[ -f "README.md" ]]; then
        if grep -qi "git workflow\|branching strategy" README.md; then
            print_success "README.md contains Git workflow information"
        else
            print_warning "README.md does not mention Git workflow"
        fi
    else
        print_error "README.md not found"
    fi
}

# ============================================================================
# CI/CD Workflow Validation
# ============================================================================

validate_workflows() {
    print_header "Validating CI/CD Workflows"
    
    local workflows_dir=".github/workflows"
    
    if [[ ! -d "$workflows_dir" ]]; then
        print_error "GitHub Actions workflows directory not found"
        return
    fi
    
    # Check for key workflow files
    local expected_workflows=(
        "ci.yml:CI Pipeline"
        "branch-workflow.yml:Branch Workflow"
        "pr-validation.yml:PR Validation"
        "release.yml:Release Automation"
    )
    
    for workflow in "${expected_workflows[@]}"; do
        IFS=':' read -r file description <<< "$workflow"
        
        if [[ -f "${workflows_dir}/${file}" ]]; then
            print_success "$description workflow exists ($file)"
            
            # Validate YAML syntax
            if command -v yamllint &> /dev/null; then
                if yamllint -d relaxed "${workflows_dir}/${file}" &> /dev/null; then
                    print_success "$file has valid YAML syntax"
                else
                    print_warning "$file may have YAML syntax issues"
                fi
            fi
        else
            print_warning "$description workflow not found ($file)"
        fi
    done
    
    # Check for deployment workflows
    if ls "${workflows_dir}"/deploy*.yml &> /dev/null; then
        print_success "Deployment workflows found"
    else
        print_warning "No deployment workflows found"
    fi
}

# ============================================================================
# Branch Protection Validation
# ============================================================================

validate_branch_protection() {
    print_header "Validating Branch Protection Rules"
    
    # Check if GitHub CLI is available
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI (gh) not installed - skipping branch protection checks"
        print_info "Install gh CLI to enable branch protection validation"
        return
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_warning "Not authenticated with GitHub CLI - skipping branch protection checks"
        print_info "Run 'gh auth login' to enable branch protection validation"
        return
    fi
    
    # Get repository information
    local repo_info
    if ! repo_info=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null); then
        print_warning "Could not determine repository - skipping branch protection checks"
        return
    fi
    
    print_info "Checking branch protection for $repo_info"
    
    # Check main branch protection
    if gh api "repos/${repo_info}/branches/main/protection" &> /dev/null; then
        print_success "Main branch has protection rules"
    elif gh api "repos/${repo_info}/branches/master/protection" &> /dev/null; then
        print_success "Master branch has protection rules"
    else
        print_error "Main/master branch has no protection rules"
    fi
    
    # Check production branch protection
    if gh api "repos/${repo_info}/branches/production/protection" &> /dev/null; then
        print_success "Production branch has protection rules"
    else
        print_warning "Production branch has no protection rules"
    fi
    
    # Check development branch protection
    if gh api "repos/${repo_info}/branches/development/protection" &> /dev/null; then
        print_success "Development branch has protection rules"
    else
        print_warning "Development branch has no protection rules (optional)"
    fi
}

# ============================================================================
# Additional Checks
# ============================================================================

validate_additional_files() {
    print_header "Validating Additional Configuration"
    
    # Check for CODEOWNERS
    if [[ -f ".github/CODEOWNERS" ]]; then
        print_success "CODEOWNERS file exists"
    else
        print_warning "CODEOWNERS file not found (optional)"
    fi
    
    # Check for PR template
    if [[ -f ".github/PULL_REQUEST_TEMPLATE.md" ]] || [[ -f "PULL_REQUEST_TEMPLATE.md" ]]; then
        print_success "Pull request template exists"
    else
        print_warning "Pull request template not found (recommended)"
    fi
    
    # Check for issue templates
    if [[ -d ".github/ISSUE_TEMPLATE" ]] || [[ -f ".github/ISSUE_TEMPLATE.md" ]]; then
        print_success "Issue templates exist"
    else
        print_warning "Issue templates not found (recommended)"
    fi
    
    # Check for contributing guidelines
    if [[ -f "CONTRIBUTING.md" ]]; then
        print_success "Contributing guidelines exist"
    else
        print_warning "CONTRIBUTING.md not found (recommended)"
    fi
    
    # Check for security policy
    if [[ -f "SECURITY.md" ]] || [[ -f ".github/SECURITY.md" ]]; then
        print_success "Security policy exists"
    else
        print_warning "SECURITY.md not found (recommended)"
    fi
}

# ============================================================================
# Git Configuration Checks
# ============================================================================

validate_git_config() {
    print_header "Validating Git Configuration"
    
    # Check git user configuration
    if git config user.name &> /dev/null; then
        print_success "Git user.name is configured"
    else
        print_error "Git user.name is not configured"
    fi
    
    if git config user.email &> /dev/null; then
        print_success "Git user.email is configured"
    else
        print_error "Git user.email is not configured"
    fi
    
    # Check for remote
    if git remote -v | grep -q "origin"; then
        print_success "Git remote 'origin' is configured"
    else
        print_error "Git remote 'origin' is not configured"
    fi
    
    # Check current branch
    local current_branch
    current_branch=$(git branch --show-current)
    print_info "Current branch: $current_branch"
}

# ============================================================================
# Generate Status Report
# ============================================================================

generate_report() {
    print_header "Validation Summary"
    
    local total_checks=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))
    
    echo ""
    echo -e "${GREEN}Passed:   $CHECKS_PASSED${NC}"
    echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
    echo -e "${RED}Failed:   $CHECKS_FAILED${NC}"
    echo -e "Total:    $total_checks"
    echo ""
    
    if ((CHECKS_FAILED > 0)); then
        print_error "Validation failed with $CHECKS_FAILED error(s)"
        echo ""
        print_info "Please address the errors and run validation again"
        return $EXIT_ERROR
    elif ((CHECKS_WARNING > 0)); then
        print_warning "Validation completed with $CHECKS_WARNING warning(s)"
        echo ""
        print_info "Warnings are optional but recommended to address"
        return $EXIT_WARNING
    else
        print_success "All validation checks passed!"
        echo ""
        print_info "Your Git workflow is properly configured"
        return $EXIT_SUCCESS
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "Git Workflow Validation Tool"
    print_info "Validating repository configuration and workflow setup"
    echo ""
    
    # Change to repository root if not already there
    while [[ ! -d ".git" ]] && [[ "$PWD" != "/" ]]; do
        cd ..
    done
    
    if [[ ! -d ".git" ]]; then
        print_error "Not in a git repository"
        exit $EXIT_ERROR
    fi
    
    validate_git_config
    echo ""
    
    validate_branches
    echo ""
    
    validate_documentation
    echo ""
    
    validate_workflows
    echo ""
    
    validate_branch_protection
    echo ""
    
    validate_additional_files
    echo ""
    
    generate_report
    local exit_code=$?
    
    echo ""
    print_header "End of Validation"
    
    exit $exit_code
}

# Run main function
main "$@"
