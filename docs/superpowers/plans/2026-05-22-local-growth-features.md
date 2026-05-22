# Local Growth Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local daily fortune, achievements, and copy sharing to increase repeat use, click depth, and organic sharing.

**Architecture:** Put deterministic growth logic in pure helpers under `lib/gongde-growth.js` and test it with Node tests. Render the new compact growth UI inside the existing client clicker component, using current local stats and CSS-only styling.

**Tech Stack:** Next.js App Router, React client component, localStorage-derived stats, plain CSS, Node test runner, static export.

---

## Tasks

### Task 1: Pure Growth Helpers

**Files:**
- Create: `lib/gongde-growth.js`
- Create: `test/gongde-growth.test.js`

- [ ] Add tests for deterministic daily fortunes, achievement unlocks, and share text.
- [ ] Implement `getDailyFortune(date)`, `getAchievements(stats)`, and `getShareText(stats, fortune)`.
- [ ] Run `npm test` and confirm helper tests pass.

### Task 2: Clicker UI Integration

**Files:**
- Modify: `components/gongde-clicker.jsx`

- [ ] Import helper functions.
- [ ] Render the daily fortune card.
- [ ] Render the achievement badge grid.
- [ ] Add a copy-share button with success/failure feedback.
- [ ] Preserve existing stats, keyboard, sound, vibration, and analytics behavior.

### Task 3: Styling

**Files:**
- Modify: `app/globals.css`
- Modify: `test/mobile-interaction-css.test.js` if CSS structure requires test updates.

- [ ] Add compact styling for fortune, achievements, and share controls.
- [ ] Ensure mobile layout does not overlap or resize fixed click targets.
- [ ] Keep reduced-motion handling intact.

### Task 4: Verification And Publish

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build:cloudflare`.
- [ ] Confirm `out/index.html` still includes AdSense verification script.
- [ ] Commit and push to `origin/main`.

## Self-Review

- Spec coverage: daily fortune, achievements, share text, local-only state, no backend, and no ad placement are covered.
- Placeholder scan: no implementation placeholders remain.
- Scope check: this is one cohesive local UI growth iteration.
