-- =============================================================================
-- Custom E-Com Store — store_settings (single schema file)
-- Run once in Supabase → SQL Editor (idempotent / safe to re-run).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.store_settings is
  'Admin-managed store/theme settings keyed by section (e.g. announcement).';

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.store_settings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at
  before update on public.store_settings
  for each row
  execute function public.store_settings_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS disabled — reads/writes via Next.js service role + SECURITY DEFINER RPCs
-- ---------------------------------------------------------------------------
alter table public.store_settings disable row level security;
drop policy if exists "store_settings_service_all" on public.store_settings;

-- ---------------------------------------------------------------------------
-- Realtime — live storefront/admin sync on store_settings changes
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.store_settings;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication missing — enable Realtime in Supabase dashboard';
end $$;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
drop function if exists public.force_upsert_store_setting(text, jsonb);
drop function if exists public.upsert_store_setting(text, jsonb);
drop function if exists public.get_store_setting(text);

create or replace function public.force_upsert_store_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k text := trim(coalesce(p_key, ''));
  v jsonb;
  n int;
begin
  if k = '' then
    raise exception 'store setting key is required';
  end if;
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    raise exception 'store setting value must be a jsonb object';
  end if;

  update public.store_settings
  set value = p_value,
      updated_at = now()
  where key = k;
  get diagnostics n = row_count;

  if n = 0 then
    insert into public.store_settings (key, value, updated_at)
    values (k, p_value, now());
  end if;

  select value into v from public.store_settings where key = k;

  if v is null then
    raise exception 'force_upsert_store_setting persist check failed for key %', k;
  end if;

  return v;
end;
$$;

create or replace function public.get_store_setting(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return null;
  end if;
  select value into v from public.store_settings where key = trim(p_key);
  return v;
end;
$$;

create or replace function public.upsert_store_setting(p_key text, p_value jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.force_upsert_store_setting(p_key, p_value);
end;
$$;

alter function public.force_upsert_store_setting(text, jsonb) owner to postgres;
alter function public.get_store_setting(text) owner to postgres;
alter function public.upsert_store_setting(text, jsonb) owner to postgres;

revoke all on function public.force_upsert_store_setting(text, jsonb) from public;
revoke all on function public.get_store_setting(text) from public;
revoke all on function public.upsert_store_setting(text, jsonb) from public;

grant execute on function public.force_upsert_store_setting(text, jsonb) to service_role;
grant execute on function public.get_store_setting(text) to service_role;
grant execute on function public.upsert_store_setting(text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Default rows (on conflict do nothing — will not overwrite live admin data)
-- ---------------------------------------------------------------------------

insert into public.store_settings (key, value)
values (
  'announcement',
  jsonb_build_object(
    'enabled', true,
    'message', 'Free shipping on orders above PKR 3500 in Pakistan',
    'speed', '15s',
    'gap', '3rem',
    'backgroundColor', '#0369a1',
    'textColor', '#ffffff',
    'height', '36px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'logo-favicon',
  jsonb_build_object(
    'faviconUrl', '',
    'faviconFileName', '',
    'logoUrl', '',
    'logoFileName', '',
    'logoTransparentUrl', '',
    'logoTransparentFileName', '',
    'logoWidthDesktop', 200,
    'logoWidthMobile', 150
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'general',
  jsonb_build_object(
    'backgroundColor', '#ffffff'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'header-nav',
  jsonb_build_object(
    'menuId', '',
    'menuHandle', '',
    'linkColor', '#1f2937',
    'linkHoverColor', '#0284c7',
    'linkActiveColor', '#0284c7',
    'linkActiveUnderlineColor', '#0284c7',
    'navBorderColor', '#e5e7eb',
    'menuHighlights', '[]'::jsonb
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'hero-banner',
  jsonb_build_object(
    'enabled', true,
    'slides', '[]'::jsonb,
    'autoplay', true,
    'autoplaySeconds', 6,
    'heightDesktop', '800px',
    'heightMobile', '480px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'collection-cards',
  jsonb_build_object(
    'enabled', true,
    'titlePosition', 'overlay',
    'cards', jsonb_build_array()
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider-after-cards',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'collection-tabs',
  jsonb_build_object(
    'enabled', true,
    'productsPerTab', 8,
    'tabs', jsonb_build_array()
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider-after-tabs',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'trust-banner',
  jsonb_build_object(
    'enabled', true,
    'backgroundColor', '#1f1f1f',
    'textColor', '#ffffff',
    'items', jsonb_build_array(
      jsonb_build_object(
        'id', 'trust-shipping',
        'icon', 'shipping',
        'title', 'Free Shipping',
        'description', 'Free shipping on orders above PKR 3500 in Pakistan'
      ),
      jsonb_build_object(
        'id', 'trust-returns',
        'icon', 'returns',
        'title', 'Free Returns',
        'description', 'Free returns within 07 days, please make sure the items are in undamaged condition.'
      ),
      jsonb_build_object(
        'id', 'trust-support',
        'icon', 'support',
        'title', 'Support Online',
        'description', 'We support customers 24/7, send questions we will solve for you immediately.'
      )
    )
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'floating-buttons',
  jsonb_build_object(
    'backToTopEnabled', true,
    'whatsappEnabled', false,
    'whatsappNumber', ''
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider-after-trust-banner',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'store-footer',
  jsonb_build_object(
    'enabled', true,
    'backgroundColor', '#ffffff',
    'textColor', '#374151',
    'headingColor', '#111827',
    'borderColor', '#e5e7eb',
    'infoHeading', 'Information',
    'logoUrl', '',
    'logoFileName', '',
    'description', 'at One Spot an online Shopping Market Place. Shop Online at One Spot and Delivery on Your Door Step. 😍',
    'city', 'Gujranwala',
    'phone', '+92 311 1668976',
    'email', 'info@atonespot.pk',
    'socialLinks', jsonb_build_array(
      jsonb_build_object('id', 'footer-social-facebook', 'platform', 'facebook', 'url', 'https://www.facebook.com/people/At-One-Spot/61567300170154', 'enabled', true),
      jsonb_build_object('id', 'footer-social-instagram', 'platform', 'instagram', 'url', 'https://www.instagram.com/atonespot.pk/', 'enabled', true),
      jsonb_build_object('id', 'footer-social-tiktok', 'platform', 'tiktok', 'url', 'https://www.tiktok.com/@at.one.spot', 'enabled', true),
      jsonb_build_object('id', 'footer-social-youtube', 'platform', 'youtube', 'url', 'https://www.youtube.com/@atOneSpot-Pk', 'enabled', true),
      jsonb_build_object('id', 'footer-social-whatsapp', 'platform', 'whatsapp', 'url', 'https://whatsapp.com/channel/0029Vas68WyH5JLq1zVcQ02r', 'enabled', true)
    ),
    'helpHeading', 'Help Customer',
    'menuLinks', jsonb_build_array(
      jsonb_build_object('id', 'footer-link-search', 'label', 'Search', 'href', '/search'),
      jsonb_build_object('id', 'footer-link-about', 'label', 'About Us', 'href', '/pages/about-us'),
      jsonb_build_object('id', 'footer-link-privacy', 'label', 'Privacy Policy', 'href', '/pages/privacy-policy'),
      jsonb_build_object('id', 'footer-link-shipping', 'label', 'Shipping & Payments', 'href', '/pages/shipping-payments'),
      jsonb_build_object('id', 'footer-link-returns', 'label', 'Exchange, Return & Refund Policy', 'href', '/pages/exchange-return-refund-policy'),
      jsonb_build_object('id', 'footer-link-terms', 'label', 'Terms and Conditions', 'href', '/pages/terms-and-conditions'),
      jsonb_build_object('id', 'footer-link-faq', 'label', 'FAQ', 'href', '/pages/faq')
    ),
    'newsletterEnabled', true,
    'newsletterHeading', 'Sign Up to Newsletter',
    'newsletterPlaceholder', 'Enter your email...',
    'newsletterButtonText', 'Sign Up',
    'newsletterDisclaimer', '***By entering the e-mail you accept the terms and conditions and the privacy policy.',
    'copyrightText', '© {year}, {storeName} - All rights reserved.'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'collections-list',
  jsonb_build_object(
    'enabled', true,
    'titlePosition', 'overlay',
    'pageTitle', 'Collections',
    'columnsDesktop', 4,
    'pageSize', 24,
    'paginationMode', 'pagination'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'collection-products',
  jsonb_build_object(
    'enabled', true,
    'columnsDesktop', 4,
    'cardImageAspect', 'square',
    'pageSize', 24,
    'paginationMode', 'load-more',
    'defaultSort', 'manual',
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 30
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'product-page',
  jsonb_build_object(
    'enabled', true,
    'contentWidth', 'full',
    'showSaleBadge', true,
    'showDeliveryEstimate', true,
    'deliveryEstimateText', 'Estimate delivery times: 3-5 Working Days.',
    'showFreeShippingNote', true,
    'freeShippingText', 'Free shipping on orders above PKR 3500 in Pakistan',
    'showSku', true,
    'showAvailability', true,
    'showStockUrgency', true,
    'showQuantity', true,
    'showDescription', true,
    'showAskQuestion', true,
    'addToCartLabel', 'Add to Cart'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'search',
  jsonb_build_object(
    'enabled', true,
    'placeholder', 'Search products…',
    'showProductImages', true,
    'showPrices', true,
    'maxResults', 8,
    'minQueryLength', 2,
    'noResultsText', 'No products found',
    'emptyHintText', 'Start typing to search the store'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'cart',
  jsonb_build_object(
    'enabled', true,
    'drawerEnabled', true,
    'cartPageTitle', 'Your cart',
    'emptyCartText', 'Your cart is empty',
    'continueShoppingLabel', 'Continue shopping',
    'checkoutLabel', 'Checkout',
    'showProductImages', true,
    'showPrices', true,
    'showQuantityControls', true,
    'showFreeShippingProgress', true,
    'freeShippingThreshold', 3500,
    'freeShippingUnlockedText', 'Congratulations! You''ve unlocked Free shipping!'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'checkout',
  jsonb_build_object(
    'enabled', true,
    'pageTitle', 'Checkout',
    'submitLabel', 'Complete order',
    'successTitle', 'Order placed',
    'successMessage', 'Thank you! We received your order and will contact you soon.',
    'emptyCartText', 'Your cart is empty. Add products before checkout.',
    'showOrderNotes', true,
    'requirePhone', true,
    'requireEmail', true,
    'requireAddress', true,
    'requireCity', true,
    'paymentMethods', jsonb_build_array(
      jsonb_build_object(
        'id', 'bank-deposit',
        'name', 'Bank Deposit',
        'description',
          'Pay via bank deposit / transfer. We will share account details after you place the order.',
        'manual', true
      ),
      jsonb_build_object(
        'id', 'cod',
        'name', 'Cash on Delivery (COD)',
        'description', 'Pay with cash when your order is delivered.',
        'manual', true
      )
    ),
    'shippingAmount', 200,
    'shippingTitle', 'Standard',
    'freeShippingEnabled', true,
    'freeShippingThreshold', 3500
  )
)
on conflict (key) do nothing;

-- Merge shipping fields into existing checkout rows (seed above won't overwrite).
update public.store_settings
set value = coalesce(value, '{}'::jsonb) || jsonb_build_object(
  'shippingAmount', coalesce((value->>'shippingAmount')::numeric, 200),
  'shippingTitle', coalesce(nullif(value->>'shippingTitle', ''), 'Standard'),
  'freeShippingEnabled', coalesce((value->>'freeShippingEnabled')::boolean, true),
  'freeShippingThreshold', coalesce((value->>'freeShippingThreshold')::numeric, 3500)
),
updated_at = now()
where key = 'checkout';

insert into public.store_settings (key, value)
values (
  'related-products',
  jsonb_build_object(
    'enabled', true,
    'heading', 'Related products',
    'limit', 4,
    'columnsDesktop', 4,
    'cardImageAspect', 'square',
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 5
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider-after-product',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'home-divider-after-related-products',
  jsonb_build_object(
    'enabled', true,
    'lineColor', '#e5e7eb',
    'gapTop', '15px',
    'gapBottom', '15px'
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'recent-products',
  jsonb_build_object(
    'enabled', true,
    'heading', 'Recently viewed',
    'limit', 4,
    'columnsDesktop', 4,
    'cardImageAspect', 'square',
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 5
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'badges',
  jsonb_build_object(
    'showSaleBadge', true,
    'showNewBadge', true,
    'newBadgeDays', 30
  )
)
on conflict (key) do nothing;

insert into public.store_settings (key, value)
values (
  'account',
  jsonb_build_object(
    'enabled', true,
    'loginTitle', 'Login',
    'registerTitle', 'Create account',
    'accountTitle', 'My account',
    'showRegister', true,
    'showRecoverPassword', true,
    'showOrders', true,
    'showAddresses', true,
    'loginButtonLabel', 'Sign in',
    'registerButtonLabel', 'Create',
    'logoutButtonLabel', 'Log out'
  )
)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
