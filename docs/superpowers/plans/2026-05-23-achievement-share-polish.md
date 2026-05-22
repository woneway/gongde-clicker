# Achievement Share Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the home page around achievements and share-card generation by removing the low-value rest area and making progress/share actions clearer.

**Architecture:** Keep the existing single React clicker component and CSS file. Add pure achievement-progress helpers in `lib/gongde-growth.js` so tests can validate the "next achievement" copy without rendering React.

**Tech Stack:** Next.js client component, localStorage-backed stats, Canvas share card, Node test runner, CSS.

---

### Task 1: Add Failing Product-Surface Tests

**Files:**
- Modify: `test/gongde-growth.test.js`
- Modify: `test/site-structure.test.js`

- [x] Add tests for achievement summary and next achievement copy.
- [x] Add a structural test that the home component no longer renders `quiet-space`, and does render朋友圈-oriented share-card copy.
- [x] Run the focused tests and verify they fail before implementation.

### Task 2: Implement Achievement Progress Helpers

**Files:**
- Modify: `lib/gongde-growth.js`

- [x] Export `getAchievementProgress(stats)`.
- [x] Return unlocked count, total count, next locked achievement, remaining amount, and a compact summary line.

### Task 3: Update Home Component

**Files:**
- Modify: `components/gongde-clicker.jsx`

- [x] Remove the `今日休息区` aside.
- [x] Use `getAchievementProgress(stats)` in the achievement card.
- [x] Render an achievement summary and next-achievement hint above the badge grid.
- [x] Add朋友圈-oriented instructions and a copy-share action in the generated image panel.

### Task 4: Refine Styles

**Files:**
- Modify: `app/globals.css`

- [x] Remove unused `quiet-space` styling.
- [x] Add compact achievement progress and share-card action styles.
- [x] Preserve mobile layout and reduced-motion behavior.

### Task 5: Verify

**Files:**
- No source changes expected.

- [x] Run `npm test`.
- [x] Run `npm run lint`.
- [x] Run `npm run build:cloudflare`.
- [x] Use Playwright to inspect desktop/mobile layout after generating a share card.
