'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function AccountSettingsPanel() {
  const {
    closeSection,
    accountDraft,
    accountDirty,
    accountSaving,
    accountStatus,
    updateAccountDraft,
    saveAccount,
    accountPreviewLoggedIn,
    setAccountPreviewLoggedIn,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Account"
      subtitle="Email OTP login via Shopify (no password) · /account"
      onBack={closeSection}
      onSave={() => void saveAccount()}
      saveDisabled={!accountDirty}
      saving={accountSaving}
      status={accountStatus}
    >
      <SettingsCollapsibleSection title="Preview" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show logged-in sample customer
          </span>
          <input
            type="checkbox"
            checked={accountPreviewLoggedIn}
            onChange={(e) => setAccountPreviewLoggedIn(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Enable account page
          </span>
          <input
            type="checkbox"
            checked={accountDraft.enabled}
            onChange={(e) => updateAccountDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show order history
          </span>
          <input
            type="checkbox"
            checked={accountDraft.showOrders}
            onChange={(e) => updateAccountDraft({ showOrders: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show addresses
          </span>
          <input
            type="checkbox"
            checked={accountDraft.showAddresses}
            onChange={(e) => updateAccountDraft({ showAddresses: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Copy" defaultOpen>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Login title
          </span>
          <input
            type="text"
            value={accountDraft.loginTitle}
            onChange={(e) => updateAccountDraft({ loginTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Account title
          </span>
          <input
            type="text"
            value={accountDraft.accountTitle}
            onChange={(e) => updateAccountDraft({ accountTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Continue button
          </span>
          <input
            type="text"
            value={accountDraft.loginButtonLabel}
            onChange={(e) => updateAccountDraft({ loginButtonLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Logout button
          </span>
          <input
            type="text"
            value={accountDraft.logoutButtonLabel}
            onChange={(e) => updateAccountDraft({ logoutButtonLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Login is email-only: Shopify sends an OTP. Enable <strong>New customer accounts</strong>,
          register callback <code>/account/callback</code> on the Headless / Customer Account API
          client (same Client ID), and set <code>NEXT_PUBLIC_APP_URL</code> to your public HTTPS
          origin.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
