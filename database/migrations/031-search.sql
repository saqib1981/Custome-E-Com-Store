-- Search popup / theme page settings
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
