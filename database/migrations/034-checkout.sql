-- Checkout page theme settings
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
    'requireCity', true
  )
)
on conflict (key) do nothing;
