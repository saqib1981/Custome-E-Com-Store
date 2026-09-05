-- Cart page / drawer theme settings
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
    'showQuantityControls', true
  )
)
on conflict (key) do nothing;
