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

### 3. Run

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
