# AdSense-Ready Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Gongde Clicker into a more complete custom-domain tool site that is better prepared for AdSense review without adding ad code yet.

**Architecture:** Keep the current Next.js App Router static-export architecture. Expand static informational pages under `app/`, enhance the existing client-side clicker component in `components/gongde-clicker.jsx`, and update shared navigation, sitemap, and CSS in place.

**Tech Stack:** Next.js App Router, React, plain CSS, Node test runner, static export to Cloudflare Workers assets.

---

## File Map

- Modify `app/layout.js`: add new navigation links and keep canonical domain metadata.
- Modify `components/gongde-clicker.jsx`: add richer play feedback, level progress copy, and home-page explanatory sections below the tool.
- Modify `app/globals.css`: style new home sections, motion states, content pages, and responsive navigation.
- Modify `app/about/page.js`: expand product story and use cases.
- Modify `app/privacy/page.js`: add advertising-ready privacy language without claiming AdSense is active.
- Modify `app/contact/page.js`: make contact reasons clearer and more formal.
- Create `app/faq/page.js`: add review-friendly FAQ content.
- Create `app/how-it-works/page.js`: document storage, controls, sound, vibration, and reset behavior.
- Modify `public/sitemap.xml`: add `/faq` and `/how-it-works`.
- Modify tests only if implementation changes existing tested behavior.

## Tasks

### Task 1: Navigation And Static Content Pages

- [ ] Create `/faq` and `/how-it-works` pages with original, specific copy.
- [ ] Expand `/about`, `/privacy`, and `/contact`.
- [ ] Add `FAQ` and `How it works` links to the shared navigation.
- [ ] Update `public/sitemap.xml` with the two new routes.

### Task 2: Home Page Product Depth And Playability

- [ ] Extend the clicker component with progress copy and daily ritual prompts.
- [ ] Add explanatory sections below the game surface: what it is, how to use it, privacy/local storage, and intended use.
- [ ] Keep any future ad-sensitive content away from the main click button.
- [ ] Preserve keyboard Space behavior and current localStorage stats.

### Task 3: Visual Polish And Motion

- [ ] Improve wooden fish hit feedback with restrained transform, shadow, and pulse effects.
- [ ] Add non-obstructive ambience and progress styling using CSS only.
- [ ] Ensure mobile text does not overlap and navigation wraps cleanly.
- [ ] Respect reduced-motion users where practical.

### Task 4: Verification

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build:cloudflare`.
- [ ] Check generated routes exist in `out/`.
- [ ] Commit implementation and push to `origin/main`.

## Self-Review

- Spec coverage: all required pages, navigation, sitemap, static export, and deferred ad-code boundaries are represented.
- Placeholder scan: no deferred implementation placeholders are left inside the plan tasks; deferred items are intentionally out of scope.
- Scope check: this is one cohesive site-readiness iteration, not multiple independent subsystems.
