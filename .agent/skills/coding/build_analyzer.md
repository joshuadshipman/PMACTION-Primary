---
name: Build Log Analyzer
description: Skill for debugging compile-time errors and analyzing full build processes to self-heal code.
---

# Build Log Analyzer Skill

## Overview
When a build fails (e.g. `npm run build` exits with a non-zero code), the agent should automatically invoke this skill to find the root cause, propose a fix, and recursively build again until success.

## Instructions
1. **Execute Build**: Run the primary build command (e.g. `npm run build`).
2. **Capture Logs**: If the build fails, read the stdout/stderr into memory. Limit to the final 100-200 lines if the log is extremely verbose.
3. **Identify Root Causes**: Look for syntax errors, missing modules, type mismatches, or missing API keys.
4. **Auto-Fix Phase**:
    - **Missing Dependency**: Run `npm install <missing-dep>`.
    - **TypeScript Error**: Inspect the exact file and line number. Rewrite the signature to conform to the required Typescript interfaces.
    - **Lint Error**: Auto-fix using standard rules or disable the rule locally if explicitly allowed by project conventions.
5. **Re-Build**: Recursively repeat the process up to 3 times. If it fails 3 times, immediately notify the user for a manual review.
