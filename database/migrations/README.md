# SQL migrations

Run these in **Supabase → SQL Editor** in order.

| Order | File | When to run |
|------:|------|-------------|
| 1 | [`../store-settings.sql`](../store-settings.sql) | **New project** — creates `store_settings` table + default announcement |
| 2 | [`002-announcement-bar-colors.sql`](./002-announcement-bar-colors.sql) | **Existing project** — only if you ran step 1 before color fields were added |
| 3 | [`003-announcement-bar-height.sql`](./003-announcement-bar-height.sql) | **Existing project** — only if `height` is missing from announcement |

## Fresh install

Run only **`store-settings.sql`** (it already includes colors and height).

## Already have `store_settings`?

Run migrations you have not applied yet (002, then 003). Each only adds missing fields.

## Future migrations

New admin features will get their own numbered file here, e.g. `004-...sql`.
