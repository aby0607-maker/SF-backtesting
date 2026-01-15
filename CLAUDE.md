# CLAUDE.md - AI Assistant Guide for stockfox

> This document provides context and guidelines for AI assistants working on the stockfox codebase.

## Quick Reference

| Item | Status |
|------|--------|
| **Project** | stockfox - Stock market/financial data application |
| **Repository** | `aby0607-maker/stockfox` |
| **Stage** | Greenfield / Initialization |
| **Package Manager** | Not yet configured |
| **Test Framework** | Not yet configured |
| **CI/CD** | Not yet configured |

## Project Overview

**stockfox** is a stock market / financial data application project currently in its initial setup phase. The project aims to provide stock data functionality, though the specific implementation details are yet to be defined.

## Current Project State

### File Structure

```
stockfox/
├── .git/           # Git version control
├── CLAUDE.md       # This file - AI assistant guidelines
└── README.md       # Project readme (minimal - title only)
```

### What Exists

- Git repository initialized
- Basic README.md with project title
- CLAUDE.md with AI assistant guidelines

### What Needs to Be Built

This is a greenfield project. Key setup tasks include:

1. **Package Management** - Set up package.json or requirements.txt (depending on chosen stack)
2. **Project Structure** - Create src/, tests/, docs/ directories
3. **Configuration** - Add linter, formatter, and build configs
4. **Environment Setup** - Create .gitignore, .env.example
5. **Core Features** - Implement stock data functionality

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
- Prefer explicit over implicit behavior

#### File Organization

- Group related functionality in modules/directories
- Keep configuration separate from business logic
- Place tests adjacent to or mirroring source structure
- Use index files for clean exports where appropriate

### Security Considerations

For a financial data application:

- **Never commit API keys or secrets** to the repository
- Use environment variables for sensitive configuration
- Create `.env.example` with placeholder values (not real secrets)
- Validate and sanitize all external data inputs
- Be cautious with financial data accuracy
- Log errors without exposing sensitive information

## Commands Reference

> Commands will be added as the project develops

```bash
# Build & Run
# (to be defined)

# Testing
# (to be defined)

# Linting & Formatting
# (to be defined)
```

## Architecture Notes

> Architecture decisions will be documented here as the project evolves

### Planned Components

- **Data Layer** - Stock market data fetching and caching
- **Business Logic** - Analysis and processing of financial data
- **API/Interface** - User-facing interface (CLI, web, or API)

### Technology Stack

> To be determined. Likely candidates:
> - **Backend:** Node.js/TypeScript or Python
> - **Data Sources:** Financial APIs (Alpha Vantage, Yahoo Finance, etc.)
> - **Database:** TBD based on requirements

## Dependencies

> Dependencies will be listed here once package management is configured

Currently: No dependencies declared

## Environment Setup

### Prerequisites

> Prerequisites will be documented as the stack is chosen

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/aby0607-maker/stockfox.git
   cd stockfox
   ```
2. (Additional steps to be added once project structure is established)

## AI Assistant Instructions

### Before Starting Work

1. **Read this document** - Understand current project state
2. **Check file structure** - Verify what exists before making assumptions
3. **Review recent commits** - Understand recent changes and patterns

### When Working on This Project

1. **Follow Established Patterns** - Once conventions are set, maintain consistency
2. **Update This Document** - Keep CLAUDE.md current as the project develops
3. **Prioritize Security** - Financial data requires careful handling
4. **Keep It Simple** - Avoid over-engineering; build what's needed

### Things to Avoid

- Don't commit sensitive data (API keys, credentials, .env files)
- Don't break existing functionality without discussion
- Don't add unnecessary complexity to simple solutions
- Don't create files unless necessary
- Don't add dependencies without clear justification

### When Adding New Features

1. Check if similar functionality exists
2. Follow existing code patterns and conventions
3. Add appropriate error handling
4. Update documentation if needed
5. Consider security implications for financial data

### Helpful Context

- Project name "stockfox" suggests focus on stock market/financial data
- The project is in early stages - be prepared to help with initial setup
- Consider financial data accuracy and reliability in all implementations
- This is a single-developer project currently

---

*Last Updated: 2026-01-15*
*Document Version: 1.1*
