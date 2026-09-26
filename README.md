# Custom E-Com Store

Headless Shopify storefront built with Next.js. Customers shop on your domain; catalog, checkout, theme media, and customer login stay wired to Shopify. Theme settings live in Supabase.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Shopify** — Admin API (media, menus, orders), Storefront / Headless, Customer Account API (email OTP login)
- **Supabase** — PostgreSQL theme settings + admin authentication
- Lucide React icons · dark / light theme (default: dark)

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill env vars (sections below), then:
npm run dev
```

| Surface | URL |
| --- | --- |
| Storefront | [http://localhost:3000](http://localhost:3000) |
| Admin (`/myadmin`) | [http://localhost:3000/myadmin](http://localhost:3000/myadmin) |

---

## Environment overview

Copy [`.env.example`](.env.example) → `.env.local`. You will configure three groups:

| Group | Purpose |
| --- | --- |
| Supabase | Admin login + `store_settings` |
| Shopify Admin app | Menus, Files CDN uploads, products, checkout orders |
| Headless Customer Account API | Customer email OTP login on `/account` |

Admin Client ID (`SHOPIFY_CLIENT_ID`) and Customer Account Client ID (`SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`) are **different**. Do not reuse one for the other.

---

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`database/store-settings.sql`](database/store-settings.sql).
3. **Project Settings → API** → copy into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

4. **Authentication → Users** — add admin email/password accounts for `/myadmin` (no extra users table).

See [`database/README.md`](database/README.md) for schema notes.

---

## 2. Shopify Admin app (Dev Dashboard)

Used for theme media (Shopify Files CDN), navigation menus, catalog, and custom checkout orders.

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_API_VERSION=2025-07
```

Optional: `SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...` instead of client credentials. Dev Dashboard apps usually work with Client ID + Secret (client_credentials).

Legacy env names still work: `Shopify_Store_URL`, `Shopify_Store_Client_ID`, `Shopify_Store_Client_Secret`, `API_version`.

### Required access scopes (every store)

**Shopify Dev Dashboard → your app → Configuration → Access scopes:**

| Scope | Used for |
| --- | --- |
| `read_online_store_navigation` | Header / mobile menus (Online Store → Navigation) |
| `read_products` | Collections, product pages, search, catalog |
| `read_files` | Resolve CDN URLs after theme media upload |
| `write_files` | Logo, favicon, hero images/videos → Shopify Files |
| `write_orders` | Custom checkout → create order in Shopify Orders |
| `read_orders` | Order status + history (`/orders`) |
| `write_customers` | Checkout marketing checkbox → email/SMS subscriber |
| `read_customers` | Match existing customers by email/phone |
| `read_content` | Online Store pages at `/pages/{handle}` (About, Shipping, Privacy, FAQ, …) |

**Recommended:**

| Scope | Used for |
| --- | --- |
| `read_markets` | Checkout Country/Region from Markets |
| `unauthenticated_read_content` | Preferred Storefront path for public `/pages/{handle}` (falls back to Admin `read_content`) |

After changing scopes: **release a new app version**, then **install / approve** on that store.  
If menus fail with *Access denied for menus field*, the scope is missing on that store’s install.

- Connection check: `GET /api/admin/shopify-connection` (also shown in Header → Navigation panel).
- Default menu handle: **`main-menu`** (override with `SHOPIFY_MAIN_MENU_HANDLE`).
- Admin uploads go to **Shopify Files**; only permanent CDN URLs are saved in Supabase `store_settings`.

### Online Store pages (`/pages/{handle}`)

Footer Help links (About Us, Shipping, Privacy, FAQ, …) use paths like `/pages/shipping-payments`. This app renders them from Shopify **Online Store → Pages**:

1. Create/publish the page in Shopify Admin (handle must match the footer href).
2. Enable **`read_content`** on the Dev Dashboard app (and ideally Storefront **`unauthenticated_read_content`**), then release + reinstall.
3. Visit `https://YOUR-DOMAIN/pages/{handle}` — content loads from Shopify HTML body.

---

## 3. Customer login (Headless → Customer Account API)

Storefront `/account` uses Shopify **New customer accounts** (email OTP), not password login. Credentials come from the **Headless** sales channel — not the Dev Dashboard Admin app.

### Prerequisites

1. Shopify Admin → **Settings → Customer accounts** → enable **New customer accounts**.
2. **Sales channels → Headless** → create/open a storefront (if you do not have one yet).
3. On the Headless storefront page, open **Customer Account API → Manage**  
   (do **not** use Storefront API Manage for login URLs).

### Callback path (fixed by this app)

The app always redirects to:

```text
{NEXT_PUBLIC_APP_URL}/account/callback
```

Logout returns to:

```text
{NEXT_PUBLIC_APP_URL}/account
```

### Manage page — URLs to fill

Replace `YOUR-DOMAIN` with your public HTTPS origin (no trailing slash), e.g. `https://www.yourstore.com`.

| Field in Shopify (Customer Account API → Manage) | Value |
| --- | --- |
| **Callback URI / Redirect URI** | `https://YOUR-DOMAIN/account/callback` |
| **Logout / Post-logout redirect URI** | `https://YOUR-DOMAIN/account` |
| **JavaScript origin** (if requested) | `https://YOUR-DOMAIN` |

**Local development** — add these as well:

| Field | Value |
| --- | --- |
| Callback URI | `http://localhost:3000/account/callback` |
| Logout redirect URI | `http://localhost:3000/account` |
| JavaScript origin | `http://localhost:3000` |

URIs must match **exactly** (scheme, host, `www` vs bare domain, no extra slash). A mismatch causes Shopify to reject the login redirect.

### Env vars

After saving URLs on the Manage page, copy the **Customer Account API Client ID** (public web client — not the Admin Client ID):

```env
# Public site origin used to build OAuth redirect_uri (required in production)
NEXT_PUBLIC_APP_URL=https://www.yourstore.com

# Headless → Customer Account API → Client ID
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
# Legacy alias also supported: Shopify_Customer_Account_Client_ID=
```

| Variable | Source | Used for |
| --- | --- | --- |
| `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` | Dev Dashboard app | Admin API (media, menus, orders) |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Headless → **Customer Account API → Manage** | Customer OTP login |
| `NEXT_PUBLIC_APP_URL` | Your deployed storefront origin | Builds `/account/callback` + logout redirect |

Restart the Next.js server after changing env vars.

### Login flow (reference)

1. Customer enters email on `/account`.
2. App starts PKCE OAuth → Shopify authorization (OTP / New customer accounts).
3. Shopify redirects to `{origin}/account/callback`.
4. App exchanges the code → Customer Account access token → profile / orders.

---

## 4. Run locally

```bash
npm run dev
```

---

## Project structure

```
app/           # Pages + API routes (storefront, /myadmin, /account, /api)
components/    # UI, admin editor, account, products
context/       # Admin editor + store theme state
database/      # Supabase SQL migrations
lib/           # Shopify, Supabase, account auth, theme helpers
public/        # Static assets
```

---

## Admin panel

Open **`/myadmin`** for the theme editor (live preview: mobile / tablet / desktop).

- Auth: Supabase Authentication users (email + password).
- Settings: Supabase table **`store_settings`** (works on Vercel and locally — no settings JSON on disk).

---

## Deploy (Vercel)

Set the same env vars in **Vercel → Project → Environment Variables** (Production + Preview):

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Shopify Admin: `SHOPIFY_STORE_URL`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_API_VERSION`
- Customer login: `NEXT_PUBLIC_APP_URL`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`

On the Headless **Customer Account API → Manage** page, register the **production** callback and logout URLs for that same `NEXT_PUBLIC_APP_URL` origin.

---

## Notes

- Theme media must use permanent Shopify Files CDN URLs (see project rules / `lib/store-media.ts`). Do not host admin-managed media in Supabase Storage.
- `Courier-Dashboard/` is a local reference project only (gitignored, not pushed to GitHub).
