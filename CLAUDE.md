# CLAUDE.md - AI Assistant Guide for stockfox

> This document provides context and guidelines for AI assistants working on the stockfox codebase.

## Project Overview

**stockfox** is a stock market / financial data application project. The project is currently in its initial setup phase.

**Repository:** `aby0607-maker/stockfox`
**Status:** Early development / Initialization phase

## Current Project State

### File Structure

```
stockfox/
├── .git/           # Git version control
├── CLAUDE.md       # This file - AI assistant guidelines
└── README.md       # Project readme (minimal)
```

### What Exists

- Git repository initialized
- Basic README.md with project title

### What Needs to Be Built

This is a greenfield project. Key setup tasks include:

1. **Package Management** - Set up package.json/requirements.txt
2. **Project Structure** - Create src/, tests/, docs/ directories
3. **Configuration** - Add linter, formatter, and build configs
4. **Core Features** - Implement stock data functionality

## Development Guidelines

### Git Workflow

- **Main Branch:** Use for stable, production-ready code
- **Feature Branches:** Create branches prefixed with `feature/` for new features
- **Commit Messages:** Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

### Code Style Conventions

When code is added to this project, follow these conventions:

#### General

- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names
- Add comments for complex logic, not obvious code
- Handle errors appropriately - don't silently fail

#### File Organization

- Group related functionality in modules/directories
- Keep configuration separate from business logic
- Place tests adjacent to or mirroring source structure

### Security Considerations

For a financial data application:

- Never commit API keys or secrets to the repository
- Use environment variables for sensitive configuration
- Validate and sanitize all external data inputs
- Be cautious with financial data accuracy

## Commands Reference

> Commands will be added as the project develops

### Build & Run

```bash
# Commands to be defined when project structure is established
```

### Testing

```bash
# Test commands to be defined
```

### Linting & Formatting

```bash
# Lint commands to be defined
```

## Architecture Notes

> Architecture decisions will be documented here as the project evolves

### Planned Components

- **Data Layer** - Stock market data fetching and caching
- **Business Logic** - Analysis and processing of financial data
- **API/Interface** - User-facing interface (CLI, web, or API)

## Dependencies

> Dependencies will be listed here once package management is configured

Currently: No dependencies declared

## Environment Setup

### Prerequisites

> Prerequisites will be documented as the stack is chosen

### Local Development

1. Clone the repository
2. (Additional steps to be added)

## AI Assistant Instructions

### When Working on This Project

1. **Check Current State First** - The project is evolving; verify what exists before making assumptions
2. **Follow Established Patterns** - Once conventions are set, maintain consistency
3. **Update This Document** - Keep CLAUDE.md current as the project develops
4. **Prioritize Security** - Financial data requires careful handling

### Things to Avoid

- Don't commit sensitive data (API keys, credentials)
- Don't break existing functionality without discussion
- Don't add unnecessary complexity to a simple solution
- Don't create files unless necessary

### Helpful Context

- Project name "stockfox" suggests focus on stock market/financial data
- The project is in early stages - be prepared to help with initial setup
- Consider financial data accuracy and reliability in all implementations

---

*Last Updated: 2026-01-14*
*Document Version: 1.0*
