-- Product detail page (/products/[handle]) theme settings
insert into public.store_settings (key, value)
values (
  'product-page',
  jsonb_build_object(
    'enabled', true,
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
