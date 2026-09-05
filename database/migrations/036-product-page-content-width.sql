-- Product detail page content width (full | container | stretch)
-- Existing `product-page` row keeps prior fields; contentWidth applied on read via
-- normalizeProductPageConfig defaults until admin saves.

update public.store_settings
set value =
  case
    when value ? 'contentWidth' then value
    else value || jsonb_build_object('contentWidth', 'full')
  end,
  updated_at = now()
where key = 'product-page';
