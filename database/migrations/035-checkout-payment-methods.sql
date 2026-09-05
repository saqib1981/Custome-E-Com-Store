-- Checkout payment method instructions (Shopify notes are not readable via API)
-- Existing `checkout` row keeps prior fields; paymentMethods applied on read via normalizeCheckoutConfig defaults
-- until admin saves. Optional upsert merges paymentMethods when key already exists without them.

update public.store_settings
set value =
  case
    when value ? 'paymentMethods' then value
    else value || jsonb_build_object(
      'paymentMethods',
      jsonb_build_array(
        jsonb_build_object(
          'id', 'bank-deposit',
          'name', 'Bank Deposit',
          'description',
            'Pay via bank deposit / transfer. We will share account details after you place the order.',
          'manual', true
        ),
        jsonb_build_object(
          'id', 'cod',
          'name', 'Cash on Delivery (COD)',
          'description', 'Pay with cash when your order is delivered.',
          'manual', true
        )
      )
    )
  end,
  updated_at = now()
where key = 'checkout';
