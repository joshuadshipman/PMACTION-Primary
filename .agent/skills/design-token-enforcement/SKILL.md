# Skill: PMAction Design Enforcement

Use when building or modifying any User Interface (UI), CSS, or styling components specifically for the PMAction Platform.

## The Iron Law
**NO RAW HEX CODES.**
You are strictly forbidden from hardcoding color values (e.g., `#0d9488`) directly into styling or components. You MUST reference the standardized tokens defined in the PMAction `theme.json`.

## Workflow
1. **Load Tokens**: Always read `pmaction-platform/theme.json` first.
2. **Translate Tailwind**: Even when using Tailwind utility classes, ensure the underlying color is a registered token.
3. **Verify**: After finishing your edits, run `node scripts/verifier.js` to ensure no "Mistakes" (rogue hexes) were introduced.

## Triggers
- Use when requested to perform UI overhaul, modernization, or styling on PMAction.
- Use when `verifier.js` reports a violation.
- Use to ensure WCAG 2.1 compliance for performance dashboards.
