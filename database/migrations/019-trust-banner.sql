-- Homepage trust banner (Free Shipping / Returns / Support)
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
