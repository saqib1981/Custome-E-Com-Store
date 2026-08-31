-- Floating action buttons (back to top + WhatsApp)
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
