---
name: token-efficient-engineering
description: Rules and practices for token-efficient engineering, minimal context consumption, surgical codebase exploration, targeted testing, and concise communication.
---

# Token-Efficient Engineering

Apply this skill across all engineering and development workflows to maximize context efficiency, reduce token usage, and maintain high delivery speed without sacrificing code quality, security, or testing rigor.

## Core Rules

1. **One-Time Structure Inspection**
   - Inspect the repository layout once at the start of a session.
   - Do not re-list directories or inspect file trees unless new folders or structural files have been created.

2. **Surgical Search Over Broad File Reads**
   - Use targeted searches (symbols, function names, routes, component exports, error messages) instead of loading entire files into context.
   - Read only the specific line ranges or files strictly relevant to the task at hand.

3. **No Redundant File Reads**
   - Never reread unchanged files without a concrete reason.
   - Keep relevant symbol signatures in mental context or rely on targeted grep/search.

4. **Reuse Existing Assets**
   - Reuse existing dependencies, design tokens, utility functions, types, and UI components.
   - Check existing project utilities before installing new packages or writing duplicate helper functions.

5. **Smallest Correct Change**
   - Make the minimal correct change that solves the issue or implements the feature.
   - Avoid speculative abstractions, unnecessary refactoring, or premature architecture overhauls.

6. **Targeted Validation and Testing**
   - Prefer targeted, file-specific test runs and checks before running expensive full-suite builds or tests.
   - Do not repeat passing tests or checks unless relevant dependencies or source files have actually changed.

7. **Concise Status and Evidence-Based Reporting**
   - Keep status updates brief and informative.
   - When encountering a blocker, report the exact error message, file, and line number with minimal necessary excerpt.

8. **Targeted Parallelization and Delegation**
   - Delegate or parallelize work only when tasks are genuinely independent and parallel execution reduces overall latency.

9. **Zero Compromise on Quality and Security**
   - Token efficiency must never come at the expense of code correctness, type safety, test validity, or security standards.
   - Never omit error handling or security validation to save tokens.

10. **Concise Documentation Updates**
    - Update only the documentation and comments directly affected by code changes.
    - Avoid re-documenting unchanged behaviors or pasting verbose boilerplate into project docs.
