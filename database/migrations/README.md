# SQL migrations

Run these in **Supabase → SQL Editor** in order.

| Order | File | When to run |
|------:|------|-------------|
| 1 | [`../store-settings.sql`](../store-settings.sql) | **New project** — table + default rows |
| 2 | [`002-announcement-bar-colors.sql`](./002-announcement-bar-colors.sql) | Old DB — missing color fields |
| 3 | [`003-announcement-bar-height.sql`](./003-announcement-bar-height.sql) | Old DB — missing height |
| 4 | [`004-logo-favicon.sql`](./004-logo-favicon.sql) | Old DB — add logo/favicon settings row |
| 5 | [`005-store-assets-bucket.sql`](./005-store-assets-bucket.sql) | **Optional** — only if using Supabase Storage (uploads now go to Shopify) |

## Fresh install

Run **`store-settings.sql`** then **`005-store-assets-bucket.sql`** (for admin image uploads).

## Already have `store_settings`?

Run any migrations you have not applied yet (002 → 005).
