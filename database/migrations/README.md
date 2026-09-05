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
| 13 | [`014-collection-cards.sql`](./014-collection-cards.sql) | Old DB — 4 Shopify collection cards (3:4) |
| 14 | [`015-collection-cards-title-position.sql`](./015-collection-cards-title-position.sql) | Old DB — card title overlay vs below |
| 15 | [`016-home-divider-after-cards.sql`](./016-home-divider-after-cards.sql) | Old DB — divider below collection cards |
| 16 | [`017-collection-tabs.sql`](./017-collection-tabs.sql) | Old DB — tabbed collection product rows |
| 17 | [`018-home-divider-after-tabs.sql`](./018-home-divider-after-tabs.sql) | Old DB — divider below collection tabs |
| 18 | [`019-trust-banner.sql`](./019-trust-banner.sql) | Old DB — trust banner (shipping / returns / support) |
| 19 | [`020-floating-buttons.sql`](./020-floating-buttons.sql) | Old DB — back to top + WhatsApp floating buttons |
| 20 | [`021-home-divider-after-trust-banner.sql`](./021-home-divider-after-trust-banner.sql) | Old DB — divider below trust banner |
| 21 | [`022-store-footer.sql`](./022-store-footer.sql) | Old DB — store footer (info, links, newsletter) |
| 22 | [`023-collections-list.sql`](./023-collections-list.sql) | Old DB — /collections page (all collection cards) |
| 23 | [`024-collections-list-pagination.sql`](./024-collections-list-pagination.sql) | Old DB — collections list pagination settings |
| 24 | [`025-collection-products.sql`](./025-collection-products.sql) | Old DB — collection page product grid settings |
| 25 | [`026-collection-products-card-aspect.sql`](./026-collection-products-card-aspect.sql) | Old DB — uniform product card image aspect |
| 26 | [`027-collection-products-new-badge.sql`](./027-collection-products-new-badge.sql) | Old DB — New badge on product cards |
| 27 | [`028-product-page.sql`](./028-product-page.sql) | Old DB — product detail page settings |
| 28 | [`029-store-settings-rpc.sql`](./029-store-settings-rpc.sql) | **Required** — `get_store_setting` / `upsert_store_setting` RPCs |
| 29 | [`030-store-settings-write-fix.sql`](./030-store-settings-write-fix.sql) | **Required NOW** — disable RLS no-op writes + repair collection-products |
| 30 | [`031-search.sql`](./031-search.sql) | Old DB — search popup theme settings |
| 31 | [`032-cart.sql`](./032-cart.sql) | Old DB — cart drawer + cart page settings |
| 32 | [`033-cart-free-shipping.sql`](./033-cart-free-shipping.sql) | Old DB — cart free-shipping progress threshold |
| 33 | [`034-checkout.sql`](./034-checkout.sql) | Old DB — custom checkout page theme settings |
| 34 | [`035-checkout-payment-methods.sql`](./035-checkout-payment-methods.sql) | Old DB — checkout payment method instructions |
| 35 | [`036-product-page-content-width.sql`](./036-product-page-content-width.sql) | Old DB — product page Full / Container / Stretch width |

## Fresh install

Run **`store-settings.sql`** then **`005-store-assets-bucket.sql`**, then **`029`** + **`030`**, then **`031`**–**`036`**.

## Already have `store_settings`?

Run any migrations you have not applied yet (002 → 036). **030 is required** if saves show “saved” but reload restores old toggles.
