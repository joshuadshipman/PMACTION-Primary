---
name: Training Material Generator
description: Skill to automatically ingest application features and external documentation to generate comprehensive training materials, tutorials, and onboarding guides.
---

# Training Material Generator Skill

## Overview
This skill instructs the agent to analyze the current application state, existing documentation, and database schemas to automatically generate training modules, step-by-step UI walkthroughs, and educational content for end-users or internal staff.

## Duties
1. **Feature Ingestion**: Use the `filesystem` MCP to scan the application components (e.g., Next.js pages, React components) and identify core user flows (e.g., login, profile creation, content submission).
2. **Curriculum Design**: Draft a structured curriculum. Break down complex features into bite-sized "lessons" or "modules".
3. **Content Generation**: Let the AI draft clear, concise, and engaging tutorial text. 
4. **Interactive Walkthroughs**: Propose application code changes to implement integrated tooltips (e.g., using `react-joyride`) that map directly to the newly generated training material.
5. **Knowledge Base Export**: Automatically format the generated material into Markdown files suitable for a Help Center or Documentation site.
