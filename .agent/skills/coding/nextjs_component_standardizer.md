---
name: Next.js Component Standardizer
description: Skill to drastically reduce token usage and UI hallucination by forcing the AI to strictly locate and re-use existing Next.js components before writing new HTML.
---

# Next.js Component Standardizer Skill

## Overview
To prevent "Token Bloat" and inconsistent UI design, the agent must NEVER hallucinate raw semantic HTML or generic Tailwind components if a purpose-built React component already exists in the workspace.

## Execution Rules
1. **Component Discovery First**: Before writing *any* new UI code, the agent must use the `filesystem` MCP to scan the `components/` directory (e.g. `SmartFocusCard.js`, `TimeDurationCards.js`, `TippSkill.js`).
2. **Prop Analysis**: Read the existing components to understand their expected props and state requirements.
3. **Re-use over Re-build**: Always import and implement the existing components. Only construct new components if the required design pattern genuinely does not exist in the codebase.
4. **Tailwind Class Sync**: If a new component must be built, ensure its styling directly mirrors the primary CSS variables defined in `tailwind.config.js` and `styles/globals.css`. Do not inject arbitrary color hex codes or rogue margin values.
