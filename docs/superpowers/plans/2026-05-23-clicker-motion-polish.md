# Clicker Motion Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the in-page clicker motion so the wooden fish, floaters, combo feedback, progress bar, and generated wish card feel more responsive without adding Remotion.

**Architecture:** Keep motion in CSS and existing React state. Add only minimal component classes needed to trigger short-lived visual states. Preserve the existing `prefers-reduced-motion` fallback.

**Tech Stack:** Next.js client component, React state, CSS keyframes, Node test runner.

---

### Task 1: Lock Motion CSS Requirements

**Files:**
- Modify: `test/mobile-interaction-css.test.js`

- [x] **Step 1: Add failing CSS assertions**

Assert that the stylesheet contains stronger motion primitives for fish hit feedback, floaters, progress pulse, combo emphasis, wish-card entrance, and reduced-motion fallback.

- [x] **Step 2: Run focused test and verify failure**

Run: `npm test -- test/mobile-interaction-css.test.js`

Expected: FAIL before implementation because the new keyframes/classes do not exist.

### Task 2: Add Motion Triggers

**Files:**
- Modify: `components/gongde-clicker.jsx`

- [x] **Step 1: Add a short progress pulse state**

Track recent strikes with `progressPulse`, set it on each strike, and clear it after the CSS animation window.

- [x] **Step 2: Add combo emphasis class**

Apply `is-combo-hot` to the combo line when combo is at least 3.

### Task 3: Polish CSS Motion

**Files:**
- Modify: `app/globals.css`

- [x] **Step 1: Improve hit feedback**

Use a richer `fish-hit` keyframe and a subtle `fish-pulse` ring.

- [x] **Step 2: Improve floaters**

Add per-item drift variables, scale, opacity, and rotation through `float-up`.

- [x] **Step 3: Improve progress and combo feedback**

Add a sweep on progress pulse and a compact combo pop animation.

- [x] **Step 4: Improve generated card entrance**

Animate the wish-card panel and preview image when they appear.

### Task 4: Verify

**Files:**
- No source changes expected.

- [x] **Step 1: Run tests**

Run: `npm test`

- [x] **Step 2: Run lint**

Run: `npm run lint`

- [x] **Step 3: Run Cloudflare static build**

Run: `npm run build:cloudflare`

- [x] **Step 4: Browser smoke test**

Use Playwright to click the fish, generate a wish card, inspect classes and console errors on desktop/mobile.
