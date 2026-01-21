# Code Review Guide

**Status:** 🟡 Not Started  
**Priority:** MEDIUM  
**Owner:** TBD  
**Last Updated:** Not yet implemented

---

## ⚠️ PLACEHOLDER DOCUMENT

This document has been identified as **MEDIUM PRIORITY** for code quality and consistency but has not yet been created.

### Required Content

This document must include:

1. **Code Review Philosophy**
   - Code reviews are learning opportunities
   - Be constructive, not critical
   - Assume good intent
   - Ask questions rather than demand changes
   - Approve when "good enough," don't demand perfection

2. **Review Checklist**

   #### Functionality
   - [ ] Code does what it's supposed to do
   - [ ] Edge cases are handled
   - [ ] Error handling is appropriate
   - [ ] Tests cover new functionality
   - [ ] No obvious bugs

   #### Security
   - [ ] No security vulnerabilities introduced
   - [ ] Input validation present
   - [ ] No secrets in code
   - [ ] Authentication/authorization correct
   - [ ] XSS/SQL injection prevention
   - [ ] Refer to [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

   #### Performance
   - [ ] No obvious performance issues
   - [ ] Database queries optimized
   - [ ] Large datasets handled appropriately
   - [ ] No unnecessary re-renders
   - [ ] Bundle size impact acceptable
   - [ ] Refer to [PERFORMANCE.md](./PERFORMANCE.md)

   #### Code Quality
   - [ ] Code is readable and maintainable
   - [ ] Naming is clear and consistent
   - [ ] Functions are reasonably sized
   - [ ] No code duplication
   - [ ] Comments explain "why," not "what"
   - [ ] Follows project conventions

   #### Testing
   - [ ] Unit tests for new functions
   - [ ] Integration tests for new features
   - [ ] Tests are meaningful, not just for coverage
   - [ ] Edge cases tested
   - [ ] Refer to [TESTING.md](./TESTING.md)

   #### Accessibility
   - [ ] Keyboard navigation works
   - [ ] ARIA labels appropriate
   - [ ] Color contrast sufficient
   - [ ] Screen reader compatible
   - [ ] Semantic HTML used

   #### Documentation
   - [ ] README updated if needed
   - [ ] API docs updated if needed
   - [ ] JSDoc comments for complex functions
   - [ ] Inline comments for non-obvious code
   - [ ] Changelog updated

3. **What to Look For**
   - Logic errors
   - Security vulnerabilities
   - Performance issues
   - Readability problems
   - Missing tests
   - Inconsistent styling
   - Breaking changes

4. **What NOT to Focus On**
   - Nitpicking style (let the linter handle it)
   - Personal preferences (if it follows conventions)
   - Unrelated code changes (separate PRs)

5. **PR Size Guidelines**
   - Keep PRs small (< 400 lines of code)
   - Large PRs should be split
   - Refactoring separate from feature work
   - Breaking changes flagged clearly

6. **Review Response Times**
   - Initial review within 1 business day
   - Follow-up reviews within 4 hours
   - Urgent PRs (hotfixes) within 2 hours

7. **Approval Guidelines**
   - 1 approval required for most PRs
   - 2 approvals for breaking changes
   - Security team approval for security-related changes
   - No self-approvals

8. **Comment Types**
   - **Blocking:** Must be addressed before merge
   - **Non-blocking:** Suggestions for improvement
   - **Question:** Clarification needed
   - **Nit:** Minor style issue (non-blocking)

9. **Conflict Resolution**
   - Discuss in PR comments first
   - Escalate to team lead if unresolved
   - Prefer in-person/video discussion for complex issues

### Estimated Time to Complete

⏱️ **2-3 hours**

### Dependencies

- Team agreement on standards
- Established code conventions
- Review tooling (GitHub, linters, etc.)

### Related Documents

- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Coding standards
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Security review
- [TESTING.md](./TESTING.md) - Testing requirements
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

---

**Action Required:** This document should be created to ensure consistent code reviews.

**Assigned To:** _Pending assignment_  
**Target Completion Date:** _To be determined_
