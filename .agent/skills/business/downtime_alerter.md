---
name: Downtime Alerter
description: Business operations script to continuously ping active APIs, crons, and DBs to ensure minimal system downtime.
---

# Downtime & Health Alerter Skill

## Overview
The application generates revenue, so any downtime is unacceptable. This skill is meant to be run periodically or as part of a post-deploy step to ensure 100% of external integrations are alive.

## Checklist for Agent
When invoked, you MUST verify the following:
1. **API Keys**: Ensure `.env.local` contains all vital keys: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, etc.
2. **Cron Jobs**: If using Vercel, check the `vercel.json` or `next.config.js` to ensure crons are mapped correctly. 
3. **Database Liveness**: Execute a basic `SELECT 1;` query leveraging the `postgres` MCP or via `node scripts/test-db.js`.
4. **Endpoint Pings**: Query `localhost:3000/api/health` or similar core application routes to ensure they return a `200 OK`.

## Escalation
If any service returns `4xx` or `5xx`, you must immediately stop current development tasks and notify the user with a "CRITICAL DOWNTIME ALERT" header.
