# Database setup

Run **once** in **Supabase → SQL Editor**:

[`store-settings.sql`](./store-settings.sql)

That single file creates:

- `store_settings` table
- `updated_at` trigger
- `get_store_setting` / `upsert_store_setting` / `force_upsert_store_setting` RPCs
- Default rows for every theme section (announcement, header, hero, cart, checkout, account, …)

It is **idempotent**: safe to re-run. Existing keys are **not** overwritten (`on conflict do nothing`).

## Environment

Copy [`.env.example`](../.env.example) to `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

## Notes

- Theme media (logo, hero, etc.) is stored on **Shopify Files CDN**, not Supabase Storage.
- `/myadmin` login uses **Supabase Authentication → Users** (email/password) — no extra SQL table.
- Admin reads/writes go through Next.js with the service role key.
