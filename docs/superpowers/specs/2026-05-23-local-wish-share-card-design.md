# Local Wish Share Card Design

## Goal

Increase Chinese-language organic sharing by letting each visitor turn Gongde Clicker into a personal daily wish ritual. The first version keeps all user-authored wish text local to the browser and avoids public UGC, accounts, backend storage, moderation queues, or social platform integrations.

## Scope

### Required

- Add a local "今日愿望" module on the home page.
- Let users write or select one wish for the current day.
- Store the wish only in browser localStorage.
- Use the active wish in click feedback, copy-share text, and a generated share image.
- Add a "生成愿望功德图" action that renders a mobile-friendly image card on the client.
- Preserve the existing clicker, keyboard behavior, daily fortune, achievements, analytics opt-out build behavior, static export, and Cloudflare deployment.
- Do not send wish text to Vercel Analytics or any other service.

### Deferred

- Public wish wall.
- Popular wishes.
- Shareable wish URLs.
- Backend storage.
- User accounts.
- Real leaderboards.
- Social OAuth.
- Server-side content moderation.
- Platform-specific auto-posting.

## Product Positioning

The feature should feel like a Chinese internet "打工人许愿" ritual, not a productivity form. Users share the result because the wish expresses their current situation.

Example wishes:

- 愿今天不临时拉会
- 愿甲方一次过稿
- 愿周五不要发版
- 愿构建一次通过
- 愿老板忘记周报
- 愿工资准时到账

## UX

The home page remains focused on the wooden fish clicker. The wish feature appears as a compact ritual control near the existing daily fortune and share area.

- Show a label: `今日愿望`.
- Show one editable text field.
- Pre-fill a deterministic default wish when the user has not set one for the day.
- Limit wish text to 32 user-perceived characters.
- Show a small privacy note: `愿望仅保存在本机，请勿填写隐私信息。`
- Provide a small "换一个" action that rotates through default wishes.
- Save edits automatically after normalization, without a separate save button.
- Use the active wish in click feedback, such as `正在加持：愿今天不临时拉会`.
- Keep all controls usable on mobile without covering the wooden fish.

## Share Image

The generated image should be a clean vertical card suitable for saving and posting to WeChat groups, Moments, Xiaohongshu, Weibo, or chat screenshots.

Recommended first version:

- Canvas-generated PNG on the client.
- Portrait ratio 4:5, optimized for chat previews and social feeds.
- Text is drawn directly into the image with wrapping.
- The image preview appears inline after generation.
- Provide `保存图片` when browser support allows.
- Provide a fallback message if image generation or download is unavailable.

Card content:

```text
今日愿望
愿今天不临时拉会

我已为此敲下 108 点功德
今日签：宜准点下班，忌临时需求
功德敲敲敲 gongdeclicker.com
```

The card should not imply the site endorses user-entered content. It should present the wish as the user's local ritual.

## Share Text

Update copy-share text to include the wish when present:

```text
我今天为「{wish}」敲了 {today} 下功德，今日功德签：{fortuneTitle}。https://gongdeclicker.com
```

If no custom wish exists, use the active default wish. If wish text is blank after trimming, fall back to the current share text format.

## Data Model

Store wish data in localStorage under a new key, separate from click stats.

Suggested shape:

```json
{
  "date": "2026-05-23",
  "wish": "愿今天不临时拉会"
}
```

Rules:

- A saved wish applies only to its date.
- On a new local date, initialize from the deterministic default wish list.
- Never include wish text in analytics events.
- Do not sync wish text across tabs except through normal localStorage events if the existing stats subscription pattern is reused.

## Input Rules

- Trim leading and trailing whitespace.
- Collapse repeated whitespace into a single space.
- Maximum length: 32 user-perceived characters.
- Empty value is allowed only transiently while editing; sharing falls back to default copy if saved value is blank.
- Do not add profanity, political, or sensitive-topic filtering in the first version because the content is local-only and never published by the service.
- Do not block user text based on keywords in this version.

## Technical Design

Add pure helpers to `lib/gongde-growth.js` or a small adjacent module:

- `getDefaultWish(date)`
- `normalizeWish(input)`
- `getActiveWish(storage, date)`
- `saveWish(storage, date, wish)`
- `getWishShareText(stats, fortune, wish)`
- `createWishCardModel(stats, fortune, wish)`

Update `components/gongde-clicker.jsx`:

- Track the active wish.
- Render the wish editor.
- Include wish-aware click feedback.
- Add copy-share text that includes the wish.
- Add a share-card generation action.

Add focused rendering helpers for Canvas:

- Keep Canvas drawing isolated from React state logic.
- Wrap long text to fit card width.
- Ensure mobile and desktop browsers can generate the card without layout shifts.
- Keep fallback behavior explicit when Canvas or download support is missing.

Update `app/globals.css`:

- Add compact wish controls.
- Add share-card preview styles.
- Preserve the page's current clicker-first hierarchy.

## Privacy And Moderation Boundary

This feature avoids content moderation scope by keeping user-authored wishes local.

- The site does not upload wish text.
- The site does not publish wish text.
- The site does not provide public wish pages.
- The site does not rank, recommend, or aggregate wishes.
- The site does not send wish text to analytics.

If any future version introduces public display, server storage, shareable wish links, or aggregated trends, that version must include a separate moderation and abuse-prevention design before implementation.

## Verification

- `npm test`
- `npm run lint`
- `npm run build:cloudflare`
- Unit tests for wish normalization, default wish selection, date reset, localStorage helper behavior, and wish-aware share text.
- Browser verification on mobile and desktop for:
  - editing a wish
  - rotating a default wish
  - clicking with wish-aware feedback
  - copying share text
  - generating a share image
  - saving or downloading the image when supported
- Confirm wish text is not present in analytics event payloads.

## Acceptance Criteria

- A user can set a 32-character daily wish from the home page.
- The wish persists locally for the current date and resets to a default wish on the next local date.
- The clicker remains the primary first-screen interaction.
- Click feedback, share text, and share image use the active wish.
- Generated share image includes wish, today's count, daily fortune title, and `gongdeclicker.com`.
- User-entered wish text is never uploaded, tracked, ranked, or publicly displayed by the site.
- Existing daily fortune, achievements, keyboard click behavior, static export, and AdSense verification behavior continue to work.
