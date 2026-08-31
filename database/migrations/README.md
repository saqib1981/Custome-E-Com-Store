# SQL migrations

Run these in **Supabase → SQL Editor** in order.

| Order | File | When to run |
|------:|------|-------------|
| 1 | [`../store-settings.sql`](../store-settings.sql) | **New project** — table + default rows |
| 2 | [`002-announcement-bar-colors.sql`](./002-announcement-bar-colors.sql) | Old DB — missing color fields |
| 3 | [`003-announcement-bar-height.sql`](./003-announcement-bar-height.sql) | Old DB — missing height |
| 4 | [`004-logo-favicon.sql`](./004-logo-favicon.sql) | Old DB — add logo/favicon settings row |
| 5 | [`005-store-assets-bucket.sql`](./005-store-assets-bucket.sql) | **Optional** — only if using Supabase Storage (uploads now go to Shopify) |
| 6 | [`007-header-nav-settings.sql`](./007-header-nav-settings.sql) | Old DB — header nav colors row |
| 7 | [`008-header-menu-highlights.sql`](./008-header-menu-highlights.sql) | Old DB — menu highlight blocks on header nav |
| 8 | [`009-header-menu-selection.sql`](./009-header-menu-selection.sql) | Old DB — Shopify menu id/handle for header navigation |
| 9 | [`010-hero-banner.sql`](./010-hero-banner.sql) | Old DB — homepage hero banner section |
| 10 | [`011-hero-banner-mobile-image.sql`](./011-hero-banner-mobile-image.sql) | Old DB — separate mobile hero image fields |
| 11 | [`012-hero-slider-slides.sql`](./012-hero-slider-slides.sql) | Old DB — hero banner → multi-slide slider |
| 12 | [`013-home-divider.sql`](./013-home-divider.sql) | Old DB — divider below hero (color & gaps) |

## Fresh install

Run **`store-settings.sql`** then **`005-store-assets-bucket.sql`** (for admin image uploads).

## Already have `store_settings`?

Run any migrations you have not applied yet (002 → 013).
