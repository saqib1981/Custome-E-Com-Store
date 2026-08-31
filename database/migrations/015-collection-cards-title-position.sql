-- Collection cards: title on card vs below card
update public.store_settings
set value = value || jsonb_build_object('titlePosition', 'overlay')
where key = 'collection-cards'
  and (value->>'titlePosition') is null;

insert into public.store_settings (key, value)
values (
  'collection-cards',
  jsonb_build_object(
    'enabled', true,
    'titlePosition', 'overlay',
    'cards', jsonb_build_array()
  )
)
on conflict (key) do nothing;
