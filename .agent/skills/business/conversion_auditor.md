---
name: Conversion Auditor
description: Skill to regularly parse marketing analytics and intake forms to ensure optimal lead conversion strategies are maintained.
---

# Conversion Auditor & Marketing Intelligence Skill

## Overview
This skill acts as a robotic marketing analyst, identifying friction points on intake forms and generating actionable conversion enhancement reports.

## Duties
1. **Analyze Forms**: Use `puppeteer` to click through the live Next.js forms (like Texas Total Loss pages).
2. **Measure Interaction Speed**: Log the time it takes an average user flow to go from "Page Load" to "Submission". If it takes >30 seconds, flag it for complexity review.
3. **A/B Strategy Testing Prompting**: Automatically suggest new A/B test variations to headers, CTA buttons, or layout to the user based on "competitor best practices" derived from Brave MCP searches.
4. **Lead Scoring Validation**: Check the incoming data schemas (DB) against the ideal "High Intent" scoring metrics. Ensure nothing is broken in the database trigger logic.

## Command Hooks
- Agent should query the Supabase/Postgres DB for recent conversions and categorize their speed and success rate.
