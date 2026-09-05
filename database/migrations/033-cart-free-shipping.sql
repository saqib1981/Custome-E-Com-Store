-- Cart free-shipping progress bar settings
update public.store_settings
set value = coalesce(value, '{}'::jsonb) || jsonb_build_object(
  'showFreeShippingProgress', true,
  'freeShippingThreshold', 3500,
  'freeShippingUnlockedText', 'Congratulations! You''ve unlocked Free shipping!'
)
where key = 'cart';

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
