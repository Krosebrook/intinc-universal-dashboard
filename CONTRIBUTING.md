# Contributing to Intinc Universal Dashboard

Thank you for your interest in contributing to the Intinc Universal Dashboard! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/intinc-universal-dashboard.git
   cd intinc-universal-dashboard
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/intinc-universal-dashboard.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Before Making Changes

1. Sync with upstream:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/description
   # or
   git checkout -b fix/description
   ```

### During Development

- Run development server: `npm run dev`
- Run tests in watch mode: `npm run test:watch`
- Check types: `npm run lint:types`
- Lint code: `npm run lint`

### Before Committing

1. **Run all tests**:
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Check code quality**:
   ```bash
   npm run lint
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types that are used across files

### React

- Use functional components with hooks
- Follow React best practices
- Use meaningful component names
- Keep components focused and small
- Use Error Boundaries for error handling

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use Radix UI components when possible
- Ensure responsive design

### File Organization

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components
│   ├── dashboard/   # Dashboard-specific components
│   └── error/       # Error boundaries
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
│   ├── security/    # Security utilities
│   ├── validation/  # Validation schemas
│   └── rate-limiting/ # Rate limiting
├── pages/           # Page components
├── types/           # TypeScript type definitions
└── test/            # Test utilities and mocks
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all new utilities and hooks
- Aim for 70%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('sanitizeText', () => {
  it('should strip dangerous HTML content', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeText(input);
    expect(result).not.toContain('<script>');
  });
});
```

### Integration Tests

- Test critical user flows
- Test component interactions
- Mock external dependencies

### E2E Tests

- Test complete user journeys
- Test across different browsers
- Focus on happy paths and edge cases

## 📦 Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(dashboard): add widget filtering functionality

fix(security): prevent XSS in comment input

docs(readme): update installation instructions

test(hooks): add tests for useDashboard hook
```

## 🔄 Pull Request Process

1. **Update your branch** with latest changes from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub

4. **Fill out the PR template**:
   - Describe your changes
   - Reference related issues
   - Include screenshots for UI changes
   - List breaking changes if any

5. **Ensure CI passes**:
   - All tests pass
   - Code is properly linted
   - Build succeeds
   - Security scans pass

6. **Address review feedback**:
   - Make requested changes
   - Push updates to your branch
   - Respond to comments

7. **Squash commits** if requested:
   ```bash
   git rebase -i HEAD~n
   ```

## 🐛 Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)
- Error messages or logs

## 💡 Suggesting Enhancements

When suggesting enhancements:

- Provide clear use case
- Explain why it would be valuable
- Consider backward compatibility
- Include mockups for UI changes

## ❓ Questions?

- Open an issue with the `question` label
- Reach out to the team on Slack
- Email: dev@intinc.com

## 🎉 Recognition

Contributors will be:
- Listed in our contributors file
- Mentioned in release notes
- Recognized in our community channels

Thank you for contributing! 🙏
