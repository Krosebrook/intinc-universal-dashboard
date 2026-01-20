#!/usr/bin/env bash

# ============================================================================
# Quick Refactor Script
# ============================================================================
# Loads configuration from refactor-config.env and generates customized
# prompts for AI-assisted refactoring
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="${SCRIPT_DIR}/refactor-config.env"

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
# Configuration Loading
# ============================================================================

load_config() {
    print_header "Loading Configuration"
    
    if [[ ! -f "$CONFIG_FILE" ]]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        print_info "Please copy refactor-config.template.env to refactor-config.env"
        print_info "and customize it for your project."
        exit 1
    fi
    
    # Source the configuration file
    # shellcheck source=/dev/null
    source "$CONFIG_FILE"
    
    print_success "Configuration loaded from $CONFIG_FILE"
}

# ============================================================================
# Validation
# ============================================================================

validate_prerequisites() {
    print_header "Validating Prerequisites"
    
    local errors=0
    
    # Check for required tools
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        ((errors++))
    else
        print_success "git is installed"
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        ((errors++))
    else
        print_success "curl is installed"
    fi
    
    # Validate required configuration variables
    if [[ -z "${REPO_OWNER:-}" ]]; then
        print_error "REPO_OWNER is not set in configuration"
        ((errors++))
    else
        print_success "REPO_OWNER: $REPO_OWNER"
    fi
    
    if [[ -z "${REPO_NAME:-}" ]]; then
        print_error "REPO_NAME is not set in configuration"
        ((errors++))
    else
        print_success "REPO_NAME: $REPO_NAME"
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        ((errors++))
    else
        print_success "Git repository detected"
    fi
    
    if ((errors > 0)); then
        print_error "$errors prerequisite check(s) failed"
        exit 1
    fi
    
    print_success "All prerequisite checks passed"
}

validate_repository_access() {
    print_header "Validating Repository Access"
    
    local repo_url="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}"
    
    if curl -s -f -o /dev/null "$repo_url"; then
        print_success "Repository ${REPO_OWNER}/${REPO_NAME} is accessible"
    else
        print_error "Cannot access repository ${REPO_OWNER}/${REPO_NAME}"
        print_info "Please verify the repository exists and is accessible"
        exit 1
    fi
}

# ============================================================================
# Prompt Generation
# ============================================================================

generate_refactor_prompt() {
    print_header "Generating Refactor Prompts"
    
    local prompt_file="${SCRIPT_DIR}/generated-prompts.md"
    
    cat > "$prompt_file" << EOF
# AI Refactoring Prompts for ${REPO_OWNER}/${REPO_NAME}

## Project Configuration
- **Project Type**: ${PROJECT_TYPE}
- **Primary Language**: ${PRIMARY_LANGUAGE}
- **Package Manager**: ${PACKAGE_MANAGER}

## Branch Structure
- **Main Branch**: ${MAIN_BRANCH}
- **Development Branch**: ${DEV_BRANCH}
- **Production Branch**: ${PROD_BRANCH}

## Build & Test Commands
\`\`\`bash
# Install dependencies
${INSTALL_CMD}

# Build project
${BUILD_CMD}

# Run tests
${TEST_CMD}

# Run linter
${LINT_CMD}

# Type checking
${TYPE_CHECK_CMD:-Not configured}
\`\`\`

## Refactoring Prompts

### 1. Branch Setup Prompt
\`\`\`
Please help me set up the Git workflow for the ${REPO_OWNER}/${REPO_NAME} repository:

1. Create the following branches from ${MAIN_BRANCH}:
   - ${DEV_BRANCH} (for active development)
   - ${PROD_BRANCH} (for production releases)

2. Update the documentation to reflect this branching strategy

3. Configure GitHub Actions workflows for:
   - Automated testing on all pull requests
   - Auto-deployment of ${DEV_BRANCH} to development environment
   - Auto-deployment of ${MAIN_BRANCH} to staging environment
   - Manual deployment of ${PROD_BRANCH} to production

The project is a ${PROJECT_TYPE} application using ${PRIMARY_LANGUAGE}.
Build command: ${BUILD_CMD}
Test command: ${TEST_CMD}
\`\`\`

### 2. CI/CD Enhancement Prompt
\`\`\`
Please enhance the CI/CD pipeline for ${REPO_OWNER}/${REPO_NAME}:

1. Add comprehensive testing:
   - Unit tests: ${TEST_CMD}
   - Linting: ${LINT_CMD}
   - Type checking: ${TYPE_CHECK_CMD:-Not configured}
   - Security scanning (CodeQL, Dependabot)

2. Implement the following deployment strategy:
   - Development: Auto-deploy ${DEV_BRANCH} → ${DEV_DEPLOY_URL}
   - Staging: Auto-deploy ${MAIN_BRANCH} → ${STAGING_DEPLOY_URL}
   - Production: Manual approval for ${PROD_BRANCH} → ${PROD_DEPLOY_URL}

3. Use ${DEPLOY_PLATFORM} as the deployment platform

The CI provider is ${CI_PROVIDER}.
\`\`\`

### 3. Branch Protection Prompt
\`\`\`
Please configure branch protection rules for ${REPO_OWNER}/${REPO_NAME}:

**Production Branch (${PROD_BRANCH})**:
- Require ${PROD_REQUIRED_APPROVALS} pull request reviews
- Require signed commits: ${PROD_REQUIRE_SIGNED_COMMITS}
- Required status checks: ${PROD_REQUIRED_CHECKS}
- No force pushes allowed
- No deletions allowed

**Main Branch (${MAIN_BRANCH})**:
- Require ${MAIN_REQUIRED_APPROVALS} pull request review
- Required status checks: ${MAIN_REQUIRED_CHECKS}
- No force pushes allowed

**Development Branch (${DEV_BRANCH})**:
- Required status checks: ${DEV_REQUIRED_CHECKS}
- Allow force pushes for maintainers
\`\`\`

### 4. Code Quality Improvement Prompt
\`\`\`
Please improve code quality for ${REPO_OWNER}/${REPO_NAME}:

1. Set up linting and formatting:
   - Linter command: ${LINT_CMD}
   - Type checker: ${TYPE_CHECK_CMD:-Not configured}

2. Add pre-commit hooks to enforce:
   - Code formatting
   - Linting checks
   - Type checking
   - Test requirements

3. Configure IDE settings for consistent formatting

Project uses ${PRIMARY_LANGUAGE} with ${PACKAGE_MANAGER} for dependency management.
\`\`\`

## AI CLI Execution Instructions

### Using Claude CLI
\`\`\`bash
# Read the prompt from generated-prompts.md and execute
claude --prompt "\$(cat ${prompt_file})"
\`\`\`

### Using OpenAI Codex
\`\`\`bash
# Use the GitHub Copilot CLI
gh copilot suggest --prompt "\$(cat ${prompt_file})"
\`\`\`

### Using Google Gemini
\`\`\`bash
# Use the Gemini CLI
gemini --model ${AI_MODEL} --prompt "\$(cat ${prompt_file})"
\`\`\`

## Rollback Procedures

If something goes wrong during refactoring:

1. **Undo local changes**:
   \`\`\`bash
   git reset --hard HEAD
   git clean -fd
   \`\`\`

2. **Restore from backup branch**:
   \`\`\`bash
   git branch backup-\$(date +%Y%m%d-%H%M%S)
   git checkout ${MAIN_BRANCH}
   git reset --hard origin/${MAIN_BRANCH}
   \`\`\`

3. **Revert specific commit**:
   \`\`\`bash
   git revert <commit-hash>
   git push origin HEAD
   \`\`\`

## Error Handling

### Common Issues and Solutions

**Issue**: Branch already exists
\`\`\`bash
git branch -D ${DEV_BRANCH}  # Delete local branch
git push origin --delete ${DEV_BRANCH}  # Delete remote branch
# Then re-run the script
\`\`\`

**Issue**: Merge conflicts
\`\`\`bash
git status  # Check conflicted files
# Resolve conflicts manually
git add .
git commit -m "Resolve merge conflicts"
\`\`\`

**Issue**: Build failures
\`\`\`bash
${INSTALL_CMD}  # Reinstall dependencies
${BUILD_CMD}     # Rebuild
${TEST_CMD}      # Run tests
\`\`\`

EOF
    
    print_success "Generated prompts saved to: $prompt_file"
    print_info "Review the prompts and use them with your preferred AI CLI tool"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "Quick Refactor Tool"
    print_info "AI-Assisted Git Workflow Setup"
    echo ""
    
    load_config
    echo ""
    
    validate_prerequisites
    echo ""
    
    validate_repository_access
    echo ""
    
    generate_refactor_prompt
    echo ""
    
    print_header "Next Steps"
    print_info "1. Review generated-prompts.md in the workflow-templates directory"
    print_info "2. Choose your preferred AI assistant (Claude, Copilot, Gemini)"
    print_info "3. Execute the prompts using the AI CLI instructions"
    print_info "4. Review and test all changes before committing"
    echo ""
    
    print_success "Quick refactor preparation complete!"
}

# Run main function
main "$@"
