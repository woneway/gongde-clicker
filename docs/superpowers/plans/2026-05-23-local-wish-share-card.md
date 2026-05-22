# Local Wish Share Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local daily wish ritual and client-generated wish share card to Gongde Clicker.

**Architecture:** Keep wish state in localStorage through pure helpers, then wire those helpers into the existing client clicker. Canvas card generation stays isolated in a library helper so React owns UI state while the rendering code owns text wrapping and PNG creation.

**Tech Stack:** Next.js app router, React client component, browser localStorage, browser Canvas, Node test runner, plain CSS.

---

### Task 1: Wish Data And Share Text Helpers

**Files:**
- Modify: `lib/gongde-growth.js`
- Modify: `test/gongde-growth.test.js`

- [x] **Step 1: Write failing helper tests**

Add tests for `normalizeWish`, `getDefaultWish`, `getActiveWish`, `saveWish`, and `getWishShareText`.

- [x] **Step 2: Run tests to verify RED**

Run: `npm test test/gongde-growth.test.js`
Expected: FAIL because the new exports do not exist.

- [x] **Step 3: Implement helper functions**

Add default wish definitions, normalize input by trimming and collapsing whitespace, enforce 32 user-perceived characters with `Array.from`, save `{ date, wish }` to localStorage, reset stale dates to deterministic defaults, and create wish-aware share text.

- [x] **Step 4: Run tests to verify GREEN**

Run: `npm test test/gongde-growth.test.js`
Expected: PASS.

### Task 2: Canvas Share Card Helper

**Files:**
- Create: `lib/wish-card.js`
- Create: `test/wish-card.test.js`

- [x] **Step 1: Write failing model tests**

Add tests for `createWishCardModel` and `wrapTextForCard` using plain fake measure functions so the tests do not need a DOM canvas.

- [x] **Step 2: Run tests to verify RED**

Run: `npm test test/wish-card.test.js`
Expected: FAIL because `lib/wish-card.js` does not exist.

- [x] **Step 3: Implement the model and renderer**

Export `createWishCardModel`, `wrapTextForCard`, and `renderWishCardToDataUrl`. The renderer should create a 1200x1500 4:5 PNG, draw the wish, count, fortune, and canonical site URL, and return a PNG data URL.

- [x] **Step 4: Run tests to verify GREEN**

Run: `npm test test/wish-card.test.js`
Expected: PASS.

### Task 3: React UI Integration

**Files:**
- Modify: `components/gongde-clicker.jsx`

- [x] **Step 1: Add wish state and actions**

Use the wish helpers to initialize, edit, rotate, and persist the active wish without sending it to analytics.

- [x] **Step 2: Wire wish into sharing and feedback**

Update copy-share to include the wish. Add wish-aware floating feedback on click. Generate a card preview with `renderWishCardToDataUrl`.

- [x] **Step 3: Preserve existing behavior**

Keep score updates, keyboard spacebar, sound, vibration, daily fortune, achievements, and analytics event payloads working without wish text.

### Task 4: Styling And Verification

**Files:**
- Modify: `app/globals.css`

- [x] **Step 1: Add compact wish UI styles**

Style the wish editor, helper note, rotate action, share-card action, card preview, and fallback status inside the existing growth panel.

- [x] **Step 2: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build:cloudflare
```

Expected: all pass.

- [x] **Step 3: Review diff**

Confirm the implementation matches the spec, especially that wish text is local-only and absent from analytics payloads.
