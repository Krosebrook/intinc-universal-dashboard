#!/usr/bin/env bash

# ============================================================================
# Setup Branch Protection Script
# ============================================================================
# Configures branch protection rules via GitHub API
# Requires GITHUB_TOKEN environment variable
# ============================================================================

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    if [[ -f "$CONFIG_FILE" ]]; then
        # shellcheck source=/dev/null
        source "$CONFIG_FILE"
        print_success "Configuration loaded from $CONFIG_FILE"
    else
        print_error "Configuration file not found: $CONFIG_FILE"
        print_info "Using environment variables and defaults"
    fi
    
    # Set defaults if not configured
    : "${REPO_OWNER:=}"
    : "${REPO_NAME:=}"
    : "${MAIN_BRANCH:=main}"
    : "${DEV_BRANCH:=development}"
    : "${PROD_BRANCH:=production}"
}

# ============================================================================
# Validation
# ============================================================================

validate_prerequisites() {
    print_header "Validating Prerequisites"
    
    local errors=0
    
    # Check for GitHub token
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        print_error "GITHUB_TOKEN environment variable not set"
        print_info "Set with: export GITHUB_TOKEN='your_personal_access_token'"
        print_info "Token needs 'repo' scope for branch protection"
        ((errors++))
    else
        print_success "GITHUB_TOKEN is set"
    fi
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        ((errors++))
    else
        print_success "curl is installed"
    fi
    
    # Check for jq (optional but recommended)
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed (recommended for better output)"
    else
        print_success "jq is installed"
    fi
    
    # Check repository configuration
    if [[ -z "$REPO_OWNER" ]]; then
        print_error "REPO_OWNER not configured"
        ((errors++))
    else
        print_success "REPO_OWNER: $REPO_OWNER"
    fi
    
    if [[ -z "$REPO_NAME" ]]; then
        print_error "REPO_NAME not configured"
        ((errors++))
    else
        print_success "REPO_NAME: $REPO_NAME"
    fi
    
    if ((errors > 0)); then
        print_error "$errors prerequisite check(s) failed"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# ============================================================================
# GitHub API Functions
# ============================================================================

github_api() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"
    
    local url="https://api.github.com${endpoint}"
    local response
    local http_code
    
    if [[ -n "$data" ]]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo "$body"
        return 0
    else
        echo "$body" >&2
        return 1
    fi
}

# ============================================================================
# Branch Protection Configuration
# ============================================================================

configure_production_protection() {
    print_header "Configuring Production Branch Protection"
    
    local branch="$PROD_BRANCH"
    local required_checks="${PROD_REQUIRED_CHECKS:-test,build,security-scan,lint}"
    
    # Convert comma-separated list to JSON array
    local checks_array="[]"
    if command -v jq &> /dev/null; then
        checks_array=$(echo "$required_checks" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')
    fi
    
    local protection_data
    protection_data=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": $checks_array
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": ${PROD_REQUIRED_APPROVALS:-2},
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
    )
    
    print_info "Applying protection to $branch branch..."
    
    if github_api PUT "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" "$protection_data" > /dev/null; then
        print_success "Production branch protection configured"
    else
        print_error "Failed to configure production branch protection"
        print_info "Branch may not exist yet - create it first"
    fi
}

configure_main_protection() {
    print_header "Configuring Main Branch Protection"
    
    local branch="$MAIN_BRANCH"
    local required_checks="${MAIN_REQUIRED_CHECKS:-test,build,lint}"
    
    local checks_array="[]"
    if command -v jq &> /dev/null; then
        checks_array=$(echo "$required_checks" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')
    fi
    
    local protection_data
    protection_data=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": $checks_array
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": ${MAIN_REQUIRED_APPROVALS:-1},
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
    )
    
    print_info "Applying protection to $branch branch..."
    
    if github_api PUT "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" "$protection_data" > /dev/null; then
        print_success "Main branch protection configured"
    else
        print_error "Failed to configure main branch protection"
    fi
}

configure_development_protection() {
    print_header "Configuring Development Branch Protection"
    
    local branch="$DEV_BRANCH"
    local required_checks="${DEV_REQUIRED_CHECKS:-test,lint}"
    
    local checks_array="[]"
    if command -v jq &> /dev/null; then
        checks_array=$(echo "$required_checks" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')
    fi
    
    local protection_data
    protection_data=$(cat <<EOF
{
  "required_status_checks": {
    "strict": false,
    "contexts": $checks_array
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": true,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
    )
    
    print_info "Applying protection to $branch branch..."
    
    if github_api PUT "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" "$protection_data" > /dev/null; then
        print_success "Development branch protection configured"
    else
        print_warning "Failed to configure development branch protection"
        print_info "This is optional - branch may not exist yet"
    fi
}

# ============================================================================
# Verification
# ============================================================================

verify_protection() {
    print_header "Verifying Branch Protection"
    
    local branches=("$MAIN_BRANCH" "$PROD_BRANCH" "$DEV_BRANCH")
    
    for branch in "${branches[@]}"; do
        print_info "Checking $branch..."
        
        if github_api GET "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" > /dev/null 2>&1; then
            print_success "$branch has protection rules"
        else
            print_warning "$branch has no protection rules"
        fi
    done
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "GitHub Branch Protection Setup"
    print_info "Configuring branch protection via GitHub API"
    echo ""
    
    load_config
    echo ""
    
    validate_prerequisites
    echo ""
    
    # Confirm before proceeding
    print_warning "This will modify branch protection rules for:"
    print_info "  - $PROD_BRANCH (production)"
    print_info "  - $MAIN_BRANCH (main/staging)"
    print_info "  - $DEV_BRANCH (development)"
    echo ""
    
    read -rp "Continue? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        print_info "Aborted by user"
        exit 0
    fi
    
    echo ""
    configure_production_protection
    echo ""
    
    configure_main_protection
    echo ""
    
    configure_development_protection
    echo ""
    
    verify_protection
    echo ""
    
    print_header "Branch Protection Setup Complete"
    print_success "Branch protection rules have been configured"
    print_info "Verify settings at: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
}

# Run main function
main "$@"
