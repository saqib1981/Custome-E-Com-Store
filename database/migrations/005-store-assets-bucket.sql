-- Migration: Supabase Storage bucket for logo, favicon, and theme assets
-- Run in Supabase → SQL Editor before uploading images in admin.
-- Safe to run multiple times.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-assets',
  'store-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for storefront favicon/logo URLs
drop policy if exists "Public read store assets" on storage.objects;
create policy "Public read store assets"
  on storage.objects for select
  using (bucket_id = 'store-assets');

-- Uploads go through Next.js API using the service role key (no public insert policy).
