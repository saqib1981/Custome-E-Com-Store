export const ACCOUNT_SETTING_KEY = 'account'

export type AccountConfig = {
  enabled: boolean
  loginTitle: string
  registerTitle: string
  accountTitle: string
  showRegister: boolean
  showRecoverPassword: boolean
  showOrders: boolean
  showAddresses: boolean
  loginButtonLabel: string
  registerButtonLabel: string
  logoutButtonLabel: string
}

export const DEFAULT_ACCOUNT: AccountConfig = {
  enabled: true,
  loginTitle: 'Login',
  registerTitle: 'Create account',
  accountTitle: 'My account',
  showRegister: false,
  showRecoverPassword: false,
  showOrders: true,
  showAddresses: true,
  loginButtonLabel: 'Continue with email',
  registerButtonLabel: 'Create',
  logoutButtonLabel: 'Log out',
}

export function normalizeAccountConfig(
  input: Partial<AccountConfig> | null | undefined
): AccountConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_ACCOUNT.enabled),
    loginTitle:
      String(input?.loginTitle ?? DEFAULT_ACCOUNT.loginTitle).trim() || DEFAULT_ACCOUNT.loginTitle,
    registerTitle:
      String(input?.registerTitle ?? DEFAULT_ACCOUNT.registerTitle).trim() ||
      DEFAULT_ACCOUNT.registerTitle,
    accountTitle:
      String(input?.accountTitle ?? DEFAULT_ACCOUNT.accountTitle).trim() ||
      DEFAULT_ACCOUNT.accountTitle,
    showRegister: Boolean(input?.showRegister ?? DEFAULT_ACCOUNT.showRegister),
    showRecoverPassword: Boolean(
      input?.showRecoverPassword ?? DEFAULT_ACCOUNT.showRecoverPassword
    ),
    showOrders: Boolean(input?.showOrders ?? DEFAULT_ACCOUNT.showOrders),
    showAddresses: Boolean(input?.showAddresses ?? DEFAULT_ACCOUNT.showAddresses),
    loginButtonLabel:
      String(input?.loginButtonLabel ?? DEFAULT_ACCOUNT.loginButtonLabel).trim() ||
      DEFAULT_ACCOUNT.loginButtonLabel,
    registerButtonLabel:
      String(input?.registerButtonLabel ?? DEFAULT_ACCOUNT.registerButtonLabel).trim() ||
      DEFAULT_ACCOUNT.registerButtonLabel,
    logoutButtonLabel:
      String(input?.logoutButtonLabel ?? DEFAULT_ACCOUNT.logoutButtonLabel).trim() ||
      DEFAULT_ACCOUNT.logoutButtonLabel,
  }
}

export function accountConfigsEqual(a: AccountConfig, b: AccountConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.loginTitle === b.loginTitle &&
    a.registerTitle === b.registerTitle &&
    a.accountTitle === b.accountTitle &&
    a.showRegister === b.showRegister &&
    a.showRecoverPassword === b.showRecoverPassword &&
    a.showOrders === b.showOrders &&
    a.showAddresses === b.showAddresses &&
    a.loginButtonLabel === b.loginButtonLabel &&
    a.registerButtonLabel === b.registerButtonLabel &&
    a.logoutButtonLabel === b.logoutButtonLabel
  )
}

export type AccountAddress = {
  id: string
  name: string
  address1: string
  address2: string
  city: string
  province: string
  country: string
  zip: string
  phone: string
}

export type AccountOrder = {
  id: string
  name: string
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: string
  statusUrl: string
}

export type AccountCustomer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  displayName: string
  addresses: AccountAddress[]
  orders: AccountOrder[]
}

/** Preview-only sample customer when editing Account in admin. */
export const PREVIEW_ACCOUNT_CUSTOMER: AccountCustomer = {
  id: 'gid://shopify/Customer/preview',
  firstName: 'Ayesha',
  lastName: 'Khan',
  email: 'ayesha@example.com',
  phone: '+92 300 1234567',
  displayName: 'Ayesha Khan',
  addresses: [
    {
      id: 'addr-1',
      name: 'Ayesha Khan',
      address1: '12 Main Boulevard',
      address2: 'Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      country: 'Pakistan',
      zip: '54000',
      phone: '+92 300 1234567',
    },
  ],
  orders: [
    {
      id: 'order-1',
      name: '#1042',
      processedAt: '2026-08-12T10:00:00Z',
      financialStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      totalPrice: 'PKR 4,250',
      statusUrl: '#',
    },
    {
      id: 'order-2',
      name: '#1031',
      processedAt: '2026-07-02T14:30:00Z',
      financialStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      totalPrice: 'PKR 1,890',
      statusUrl: '#',
    },
  ],
}
