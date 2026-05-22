# Local Growth Features Design

## Goal

Increase return visits, click depth, and organic sharing for Gongde Clicker without adding accounts, backend services, user tracking, or ad placements.

## Scope

### Required

- Add a deterministic daily fortune tied to the local date.
- Add a local achievement badge set based on existing stats.
- Add a copy-share action that produces a concise share message with today's count, fortune, and site URL.
- Keep all new state local to the browser or derived from existing localStorage stats.
- Preserve the existing clicker, keyboard behavior, static export, AdSense verification script, and Cloudflare deployment.

### Deferred

- Login, leaderboard, backend storage, social OAuth, comments, generated image sharing, and manual ad slots.
- Any feature that asks users to click ads or places advertising near the main click target.

## UX

The home page remains a product-first clicker. New growth features should feel like part of the tool, not like a marketing block.

- Daily fortune appears as a compact ritual card near the clicker feedback.
- Achievements appear as a small badge grid below the main play area.
- Sharing appears as a single button with a short copied-state message.
- No modal is required.
- No popups fire on click milestones.

## Feature Details

### Daily Fortune

- Use the local date key already used by stats.
- Same date produces the same fortune.
- Different dates should usually produce different fortunes.
- Fortune contains:
  - title
  - short text
  - "宜"
  - "忌"

### Achievements

First version includes six achievements:

- `first`: total count at least 1.
- `ten`: total count at least 10.
- `hundred`: total count at least 100.
- `daily-thirty`: today's count at least 30.
- `combo-ten`: best combo at least 10.
- `combo-thirty`: best combo at least 30.

Each badge shows a name, condition copy, and locked/unlocked state.

### Share Text

Copy text format:

```text
我今天在功德敲敲敲了 {today} 下，今日功德签：{fortuneTitle}。https://gongdeclicker.com
```

Use `navigator.clipboard.writeText` when available. Fall back to a hidden textarea copy only if practical; otherwise show a clear failure message.

## Technical Design

- Create `lib/gongde-growth.js` for pure deterministic helpers:
  - `getDailyFortune(date)`
  - `getAchievements(stats)`
  - `getShareText(stats, fortune)`
- Add focused Node tests for those helpers.
- Update `components/gongde-clicker.jsx` to render fortune, achievements, and share action.
- Update `app/globals.css` for compact cards, badge states, and responsive layout.

## Verification

- `npm test`
- `npm run lint`
- `npm run build:cloudflare`
- Confirm generated home HTML contains the growth sections.
- Confirm AdSense script remains in the generated home HTML.

## Acceptance Criteria

- Daily fortune is deterministic for a given date.
- Achievement unlock logic is tested and based only on local stats.
- Copy-share text includes today's count, fortune title, and `https://gongdeclicker.com`.
- Home page remains focused on the clicker and does not reintroduce long explanatory review copy.
- No backend, account, or ad placement is added.
