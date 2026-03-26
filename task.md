# Task List
- [x] Implement Email Sign Up in `pages/onboarding/signup.js`.
- [x] Verify Email Sign Up functionality.
- [x] Verify Google Sign Up functionality (regression test).
- [x] Enhance Journal with Legacy Features
- [x] Implement Reminders Feature
- [x] Implement Library Feature
- [x] Integrate YouTube Data
- [x] Frontend-to-Backend Verification
- [x] Restructure Dashboard & Implement Self-Care
    - [x] Create `lib/selfCareData.js` (Structure + Samples).
    - [x] Update `components/AddWinModal.js` to support Self-Care tab, filtering, and auto-journaling.
    - [x] Update `pages/dashboard.js` to replace Quick Actions with 3 Focus Cards.
    - [x] Update `pages/onboarding/goals.js` to include "Self-care".
    - [x] Verify new layout and Self-Care functionality.

## Phase 2: Engagement & Reporting
- [x] Notifications System
    - [x] Research & Plan Web Push vs. Email strategy.
    - [x] Implement Notification Settings UI.
- [x] Reporting & Analytics
    - [x] Implement Charts/Graphs for XP, Mood, Habits.
    - [x] Create "Print Report" functionality (PDF generation or print-friendly view).
- [x] Gamification UI
    - [x] Make Badges/Points/Levels cards bigger and easier to read.
    - [x] Redesign "Why Daily Use Matters" section (distinct style but consistent feel).

## Dashboard Refinement (Final Polish)
- [x] Optimize Top Layout (Fill the blank)
    - [x] Combine Recommendation Widget and Top Nav Buttons into a single row (4 columns).
    - [x] This utilizes the empty space next to the widget.
- [x] Enhance Button Styling (Make it pop)
    - [x] Add white borders/shadows to Top Nav buttons to make them look more like "cards".
- [x] Layout Reordering (Break up colors)
    - [x] Move "Today's Wins" between Top Nav and Stats.
- [x] Floating Action Button (FAB)
    - [x] Add global "Log Win" (+) button.

## Dashboard Logic & Flow (New Feedback)
- [x] "Daily Overview" Checklist (Replaces simple "Today's Wins")
    - [x] Display core daily goals: Daily Win, Mood Check-in, Self-Care/Mindfulness.
    - [x] Visuals: "Checked" (Completed) vs "Pending" (Empty Circle).
    - [x] Add "Free Form" text input for quick win logging.
- [x] Smart Rotating Focus Card (Replaces "Weekly Challenge")
    - [x] Logic: Rotates based on Time of Day (Morning/Midday/Evening).
    - [x] Content:
        - Morning: Small Wins (e.g., Make Bed).
        - Midday: Habit/Mindfulness/Self-Care.
        - Evening: Mood/Gratitude.
    - [x] "Completion Aware": If current task is done, show the next one.
- [ ] Small Wins Logic
    - [x] Add "Reason" field (Why it helps)
    - [x] Refine Small Wins (Multiple Entries, Benefit Messages)
    - [x] Expand Self-Care Features (Self-Care Hub)
        - [x] New Content Types (Quizzes, Blogs)
        - [x] Dynamic Activity Display (Time-based: 1, 3, 5, 10, 20+ min)
        - [x] Personalization Settings.
    - [x] Personalization Settings.
    - [ ] (Future) Dynamic difficulty/scoring.

## Phase 3: Dashboard Refinement & New Features (Completed)
- [x] **Dashboard UI Overhaul**
    - [x] Remove "Daily Overview" (Redundant).
    - [x] Enhance Top Nav Buttons (Mood/Self-Care) with completion status.
    - [x] Reorder Cards: Active Challenge below Smart Focus.
    - [x] Header: Replace "Welcome back" with **Daily Quote**.
    - [x] Left Column: Add **Smart Insight** (bottom) and **Content Recommendation Card** (middle).
    - [x] Right Column: Add **Time-Based Cards** (1, 5, 10 min).
- [x] **New Features**
    - [x] **AI Self-Help:** `/self-help` with Gemini integration.
    - [x] **Privacy Policy:** `/privacy`.
    - [x] **Community Page:** `/community` (placeholder).
    - [x] **FAQ Page:** `/faq`.
    - [x] **Crisis Support:** Crisis Modal linked to dashboard button.




## Phase 4: AI Merchandise & Autonomous Growth (In Progress)
- [x] Integrate AI Merchandise Recommendations (MerchandiseSection)
- [x] Implement AEO/SEO Structured Data (SEOHead)
- [x] Create Autonomous Content Service (autonomousContentService.js)
- [x] Develop Daily SEO Maintenance Script
- [ ] Finalize " Firescan\ Automated Product Scanning logic (Connect real APIs)
- [ ] Connect Social Media APIs for \AEO Blast\ logic
- [ ] Automate Daily Content Cycle on Vercel Cron
- [ ] Implement Stripe Payments for \Pro\ and \Store\ items
- [ ] Launch \Founding Member\ lifetime license waitlist
- [ ] Partner with 5 Neurodiversity Social Media Creators
- [ ] Monitor AEO Rankings for key topics (Daily Rank Tracking)

## Concept Ideas (Backlog)
- [ ] **Wearable Stress Management:** Connect to watch/ring via fitness app. Monitor BP/Stress levels in real-time. Trigger alerts with instant 2-min or 5-min calming exercise recommendations.
