-- Customer account page (/account) theme settings
insert into public.store_settings (key, value)
values (
  'account',
  jsonb_build_object(
    'enabled', true,
    'loginTitle', 'Login',
    'registerTitle', 'Create account',
    'accountTitle', 'My account',
    'showRegister', true,
    'showRecoverPassword', true,
    'showOrders', true,
    'showAddresses', true,
    'loginButtonLabel', 'Sign in',
    'registerButtonLabel', 'Create',
    'logoutButtonLabel', 'Log out'
  )
)
on conflict (key) do nothing;
