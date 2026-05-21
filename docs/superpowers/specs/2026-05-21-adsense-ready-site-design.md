# AdSense-Ready Gongde Clicker Site Design

## Goal

Prepare `gongdeclicker.com` as a credible lightweight tool site for the first advertising monetization loop:

Site available on a custom domain -> AdSense site review -> ads can be enabled later -> traffic and ad reports can be observed.

This change improves the live product and review surface, but does not add AdSense code until the publisher ID and verification code are available.

## Scope

### Required In This Iteration

- Keep the clicker as the first-screen product experience.
- Add enough explanatory content around the tool to make the site feel complete rather than a thin single-button page.
- Add two new informational routes:
  - `/faq`
  - `/how-it-works`
- Expand `/about`, `/privacy`, and `/contact` with more complete, review-friendly copy.
- Update navigation and sitemap for the new routes.
- Improve motion, interaction feedback, and replay value without placing any future ad surface near the main click target.
- Preserve static export and Cloudflare Workers deployment.

### Explicitly Deferred

- AdSense verification script and Auto ads script.
- `ads.txt`.
- Manual ad placements.
- Google Analytics.
- Domestic China hosting or CDN optimization.
- Account, leaderboard, backend, or database features.

## UX Direction

The site should feel like a polished, playful micro-tool rather than a marketing landing page. The first screen remains the wooden fish interaction, with supporting content below it. Motion should be tactile and calm:

- The wooden fish responds with scale, glow, and subtle hit motion.
- Floating merit phrases stay lightweight and non-obstructive.
- Progress feedback gives users a reason to keep clicking without creating addictive pressure.
- Content sections are visible below the tool and use restrained panels instead of a separate hero page.

## Page Plan

### Home

- Retain the current clicker interface.
- Add concise explanatory content below the interaction:
  - What the tool is.
  - How to use it.
  - Why counts are stored locally.
  - A clear note that it is for relaxation and playful ritual, not real religious scoring.
- Improve playfulness:
  - Add daily mood/ritual prompts.
  - Add level progress copy.
  - Make hit feedback feel more responsive.

### FAQ

Answer practical questions:

- What is Gongde Clicker?
- Is it free?
- Does it store personal data?
- Can I use keyboard shortcuts?
- Why does the counter reset daily?
- Is this a religious service?

### How It Works

Explain:

- Click or press Space.
- Counts are stored locally in the browser.
- Daily count resets by local date.
- Total count and best combo remain on the same device.
- Sound and vibration are device/browser dependent.

### About

Expand the current page into a more complete product description with purpose, tone, and intended use.

### Privacy

Cover:

- No accounts.
- LocalStorage usage.
- Anonymous analytics possibility.
- Future advertising or third-party services may use cookies or similar technologies according to their own policies.
- Contact channel.

### Contact

Keep email and WeChat, but make the page more formal and include appropriate contact reasons.

## SEO And Review Surface

- Canonical domain remains `https://gongdeclicker.com`.
- Sitemap includes all public routes.
- Navigation exposes all important pages.
- Copy should be original and specific to the tool.
- Avoid clickbait, ad-click encouragement, or any text that could be interpreted as asking users to click ads.

## Technical Design

- Continue using Next.js app router with static export.
- Add new route files under `app/`.
- Reuse existing global styles and component structure.
- Keep the main interactive component client-side.
- Keep static content server-rendered where possible.
- Avoid new dependencies.

## Testing And Verification

- Existing storage and CSS behavior tests must pass.
- Add focused tests if shared behavior changes.
- Run:
  - `npm test`
  - `npm run lint`
  - `npm run build:cloudflare`
- Manually inspect home and new content routes locally or from the generated static output.

## Acceptance Criteria

- `https://gongdeclicker.com` remains the canonical production domain in metadata and sitemap.
- Home page is more informative while still opening directly into the clickable tool.
- `/faq` and `/how-it-works` exist and are linked from navigation.
- `/about`, `/privacy`, and `/contact` have materially fuller content.
- No AdSense script or ad placement is added in this iteration.
- Cloudflare static build still succeeds.
