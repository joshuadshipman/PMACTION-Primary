---
name: Pre-Flight Check & Type Verification
description: Instructions for pre-flight code validation ensuring no code is committed that fails linting or typing.
---

# Pre-Flight Code Check Skill

## Overview
Before making any updates to production code, the AI must automatically perform a series of checks. No new code logic should be written across multiple files if basic types, linting, or immediate tests are broken.

## Steps
1. **Analyze Incoming Changes**: Parse what the user wants to change.
2. **Run Linting**: Run `npm run lint` or `npx eslint .` to see if there are preexisting errors.
3. **Type Check**: Run `npx tsc --noEmit` if this is a TypeScript project.
4. **Draft Changes Locally**: Apply the code change in a dry-run or one file at a time.
5. **Re-Run Checks**: Verify that introducing this code did not break the Typescript compiler or linter.
6. **Proceed**: If all tests pass, finalize the changes and notify the user.
