# Database setup

Run in **Supabase → SQL Editor**.

## New project (first time)

1. [`store-settings.sql`](./store-settings.sql) — table + default announcement (includes colors + height)

## Existing project (already ran old SQL)

Run any missing migrations from [`migrations/`](./migrations/):

- [`002-announcement-bar-colors.sql`](./migrations/002-announcement-bar-colors.sql)
- [`003-announcement-bar-height.sql`](./migrations/003-announcement-bar-height.sql)

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
