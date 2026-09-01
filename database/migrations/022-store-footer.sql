-- Store footer (Information / Help / Newsletter)
insert into public.store_settings (key, value)
values (
  'store-footer',
  jsonb_build_object(
    'enabled', true,
    'backgroundColor', '#ffffff',
    'textColor', '#374151',
    'headingColor', '#111827',
    'borderColor', '#e5e7eb',
    'infoHeading', 'Information',
    'logoUrl', '',
    'logoFileName', '',
    'description', 'at One Spot an online Shopping Market Place. Shop Online at One Spot and Delivery on Your Door Step. 😍',
    'city', 'Gujranwala',
    'phone', '+92 311 1668976',
    'email', 'info@atonespot.pk',
    'socialLinks', jsonb_build_array(
      jsonb_build_object('id', 'footer-social-facebook', 'platform', 'facebook', 'url', 'https://www.facebook.com/people/At-One-Spot/61567300170154', 'enabled', true),
      jsonb_build_object('id', 'footer-social-instagram', 'platform', 'instagram', 'url', 'https://www.instagram.com/atonespot.pk/', 'enabled', true),
      jsonb_build_object('id', 'footer-social-tiktok', 'platform', 'tiktok', 'url', 'https://www.tiktok.com/@at.one.spot', 'enabled', true),
      jsonb_build_object('id', 'footer-social-youtube', 'platform', 'youtube', 'url', 'https://www.youtube.com/@atOneSpot-Pk', 'enabled', true),
      jsonb_build_object('id', 'footer-social-whatsapp', 'platform', 'whatsapp', 'url', 'https://whatsapp.com/channel/0029Vas68WyH5JLq1zVcQ02r', 'enabled', true)
    ),
    'helpHeading', 'Help Customer',
    'menuLinks', jsonb_build_array(
      jsonb_build_object('id', 'footer-link-search', 'label', 'Search', 'href', '/search'),
      jsonb_build_object('id', 'footer-link-about', 'label', 'About Us', 'href', '/pages/about-us'),
      jsonb_build_object('id', 'footer-link-privacy', 'label', 'Privacy Policy', 'href', '/pages/privacy-policy'),
      jsonb_build_object('id', 'footer-link-shipping', 'label', 'Shipping & Payments', 'href', '/pages/shipping-payments'),
      jsonb_build_object('id', 'footer-link-returns', 'label', 'Exchange, Return & Refund Policy', 'href', '/pages/exchange-return-refund-policy'),
      jsonb_build_object('id', 'footer-link-terms', 'label', 'Terms and Conditions', 'href', '/pages/terms-and-conditions'),
      jsonb_build_object('id', 'footer-link-faq', 'label', 'FAQ', 'href', '/pages/faq')
    ),
    'newsletterEnabled', true,
    'newsletterHeading', 'Sign Up to Newsletter',
    'newsletterPlaceholder', 'Enter your email...',
    'newsletterButtonText', 'Sign Up',
    'newsletterDisclaimer', '***By entering the e-mail you accept the terms and conditions and the privacy policy.',
    'copyrightText', '© {year}, {storeName} - All rights reserved.'
  )
)
on conflict (key) do nothing;
