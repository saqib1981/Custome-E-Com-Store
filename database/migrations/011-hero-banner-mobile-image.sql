-- Mobile hero image fields (recommended 600×480)
update public.store_settings
set value = value || jsonb_build_object('imageUrlMobile', '', 'imageFileNameMobile', '')
where key = 'hero-banner'
  and not (value ? 'imageUrlMobile');

update public.store_settings
set value = value || jsonb_build_object('imageFileNameMobile', '')
where key = 'hero-banner'
  and not (value ? 'imageFileNameMobile');
