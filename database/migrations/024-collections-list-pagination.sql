-- Collections list pagination (24 per page, page numbers by default)
update public.store_settings
set value = value
  || jsonb_build_object(
    'pageSize', 24,
    'paginationMode', 'pagination'
  )
where key = 'collections-list'
  and not (value ? 'paginationMode');
