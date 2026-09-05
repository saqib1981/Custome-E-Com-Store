# Custom E-Com Store

Custom E-Commerce Store for displaying Shopify products and details.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) — admin / theme settings
- Lucide React icons
- Dark/light theme (default: dark)

## Getting started

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run [`database/store-settings.sql`](database/store-settings.sql)
3. In **Project Settings → API**, copy keys into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

See [`database/README.md`](database/README.md) for details.

### 3. Shopify (logo / favicon uploads)

Add your dev app credentials to `.env.local`:

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_API_VERSION=2025-07
```

Legacy names from `.env.local` also work: `Shopify_Store_URL`, `Shopify_Store_Client_ID`, `Shopify_Store_Client_Secret`, `API_version`.

Optional: set `SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...` instead of client credentials.

### Required access scopes (every store)

In **Shopify Dev Dashboard → your app → Configuration → Access scopes**, enable:

| Scope | Used for |
| --- | --- |
| `read_online_store_navigation` | Header / mobile menus from Online Store → Navigation |
| `read_products` | Collections, product pages, search, catalog |
| `read_files` | Resolve CDN URLs after theme media upload |
| `write_files` | Logo, favicon, hero images/videos → Shopify Files |
| `write_orders` | Custom checkout → create order directly in Shopify Orders |
| `read_orders` | Order status + history on your domain (`/orders`) |
| `write_customers` | Checkout marketing checkbox → email/SMS subscriber in Shopify |
| `read_customers` | Match existing customers by email/phone (avoids “phone already taken”) |

**Recommended (checkout polish):**

| Scope | Used for |
| --- | --- |
| `read_markets` | Checkout Country/Region from Markets |

Then **release a new app version** and **install / approve the app** on that store.  
If menus fail with *Access denied for menus field*, this scope is missing on that store's app install.

Check connection from admin: `GET /api/admin/shopify-connection` (also shown in Header → Navigation menu panel).

Main menu is loaded from the menu you pick in admin (or Shopify handle **`main-menu`** by default). Override fallback with `SHOPIFY_MAIN_MENU_HANDLE`.

Admin uploads (logo, favicon) go to **Shopify Files** (CDN URLs saved in Supabase `store_settings`).

### 4. Run

```bash
npm run dev
```

- Store: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/myadmin](http://localhost:3000/myadmin)

## Project structure

```
app/           # Pages + API routes
components/    # UI, admin editor, announcement bar
context/       # Admin editor state
database/      # Supabase SQL migrations
lib/           # Supabase clients, announcement, menu, theme
public/        # Static assets
```

Menu items are defined in `lib/menu.ts`. Currently only **Home** is configured.

## Admin panel

Open **`/myadmin`** to edit the announcement bar (Shopify-style theme editor with live preview).

Settings are saved to Supabase table **`store_settings`** (key: `announcement`) via `PUT /api/admin/announcement`. Works on **Vercel** and locally — no JSON file on disk.

## Vercel deploy

Add the same three Supabase env vars in **Vercel → Project → Environment Variables** (Production + Preview).

## Note

`Courier-Dashboard/` is a local reference project only (gitignored, not pushed to GitHub).
