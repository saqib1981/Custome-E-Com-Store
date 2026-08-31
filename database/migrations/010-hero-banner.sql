-- Homepage hero banner section (theme editor)
insert into public.store_settings (key, value)
values (
  'hero-banner',
  jsonb_build_object(
    'enabled', true,
    'heading', 'New season styles',
    'subheading', 'Discover curated pieces for every occasion.',
    'buttonLabel', 'Shop now',
    'buttonUrl', '/collections/all',
    'imageUrl', '',
    'imageFileName', '',
    'imageUrlMobile', '',
    'imageFileNameMobile', '',
    'backgroundColor', '#0f172a',
    'textColor', '#ffffff',
    'buttonBackgroundColor', '#ffffff',
    'buttonTextColor', '#0f172a',
    'overlayOpacity', 35,
    'heightDesktop', '800px',
    'heightMobile', '480px',
    'textAlign', 'center'
  )
)
on conflict (key) do nothing;
