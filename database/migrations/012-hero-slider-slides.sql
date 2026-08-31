-- Hero banner → multi-slide slider (Shopify Files URLs only)
update public.store_settings
set value = jsonb_build_object(
  'enabled', coalesce((value->>'enabled')::boolean, true),
  'autoplay', true,
  'autoplaySeconds', 6,
  'heightDesktop', coalesce(value->>'heightDesktop', '800px'),
  'heightMobile', coalesce(value->>'heightMobile', '480px'),
  'slides', case
    when jsonb_typeof(value->'slides') = 'array' then value->'slides'
    when coalesce(value->>'imageUrl', '') <> '' then jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'imageUrl', value->>'imageUrl',
        'imageFileName', coalesce(value->>'imageFileName', ''),
        'imageUrlMobile', coalesce(value->>'imageUrlMobile', ''),
        'imageFileNameMobile', coalesce(value->>'imageFileNameMobile', ''),
        'linkUrl', coalesce(nullif(value->>'buttonUrl', ''), '/collections/all'),
        'alt', coalesce(nullif(value->>'heading', ''), 'Hero slide')
      )
    )
    else '[]'::jsonb
  end
)
where key = 'hero-banner'
  and (not (value ? 'slides') or jsonb_typeof(value->'slides') <> 'array');

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
