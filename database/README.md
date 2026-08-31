# Database setup

Run in **Supabase → SQL Editor**.

## New project (first time)

1. [`store-settings.sql`](./store-settings.sql) — table + default announcement (includes colors + height)

## Existing project (already ran old SQL)

Run any missing migrations from [`migrations/`](./migrations/):

- [`002-announcement-bar-colors.sql`](./migrations/002-announcement-bar-colors.sql)
- [`003-announcement-bar-height.sql`](./migrations/003-announcement-bar-height.sql)
- [`004-logo-favicon.sql`](./migrations/004-logo-favicon.sql)
- [`005-store-assets-bucket.sql`](./migrations/005-store-assets-bucket.sql) — optional (legacy Supabase uploads)

**Image uploads** (logo, favicon) go to **Shopify Files** — configure `SHOPIFY_*` in `.env.local` (see `.env.example`).

See [`migrations/README.md`](./migrations/README.md) for the full migration list.

## Environment

Copy [`.env.example`](../.env.example) to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the browser)

## `store_settings` keys

| Key | Description |
|-----|-------------|
| `announcement` | Top marquee bar |
| `logo-favicon` | Logo, favicon, logo widths |

### `logo-favicon` JSON fields

| Field | Type | Example |
|-------|------|---------|
| `faviconUrl` | string | `https://...` |
| `faviconFileName` | string | `favicon.png` |
| `logoUrl` | string | `https://...` |
| `logoFileName` | string | `logo.png` |
| `logoTransparentUrl` | string | `https://...` |
| `logoTransparentFileName` | string | `logo-white.png` |
| `logoWidthDesktop` | number | `200` (40–400) |
| `logoWidthMobile` | number | `150` (40–400) |

### `announcement` JSON fields

| Field | Type | Example |
|-------|------|---------|
| `enabled` | boolean | `true` |
| `message` | string | `Free shipping...` |
| `speed` | string | `15s` (8–90 seconds) |
| `gap` | string | `3rem` |
| `backgroundColor` | string | `#0369a1` |
| `textColor` | string | `#ffffff` |
| `height` | string | `36px` (24–80px) |

More admin sections can use the same table with new keys later.
