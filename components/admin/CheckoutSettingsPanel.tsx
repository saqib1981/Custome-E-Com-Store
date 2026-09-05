'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function CheckoutSettingsPanel() {
  const {
    closeSection,
    checkoutDraft,
    checkoutDirty,
    checkoutSaving,
    checkoutStatus,
    checkoutErrorMessage,
    updateCheckoutDraft,
    saveCheckout,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Checkout"
      subtitle="Custom /checkout page + customer details form"
      onBack={closeSection}
      onSave={() => void saveCheckout()}
      saveDisabled={!checkoutDirty}
      saving={checkoutSaving}
      status={checkoutStatus}
      errorMessage={checkoutErrorMessage}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Enable checkout page
          </span>
          <input
            type="checkbox"
            checked={checkoutDraft.enabled}
            onChange={(e) => updateCheckoutDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show order notes field
          </span>
          <input
            type="checkbox"
            checked={checkoutDraft.showOrderNotes}
            onChange={(e) => updateCheckoutDraft({ showOrderNotes: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Required fields" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Phone</span>
          <input
            type="checkbox"
            checked={checkoutDraft.requirePhone}
            onChange={(e) => updateCheckoutDraft({ requirePhone: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Email</span>
          <input
            type="checkbox"
            checked={checkoutDraft.requireEmail}
            onChange={(e) => updateCheckoutDraft({ requireEmail: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Address</span>
          <input
            type="checkbox"
            checked={checkoutDraft.requireAddress}
            onChange={(e) => updateCheckoutDraft({ requireAddress: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">City</span>
          <input
            type="checkbox"
            checked={checkoutDraft.requireCity}
            onChange={(e) => updateCheckoutDraft({ requireCity: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Shipping" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Custom checkout does not read Shopify shipping rates. Set the flat rate
          and free-shipping threshold here — changes apply to /checkout totals and
          orders placed from this store.
        </p>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Shipping amount (PKR)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={checkoutDraft.shippingAmount}
            onChange={(e) =>
              updateCheckoutDraft({ shippingAmount: Number(e.target.value) || 0 })
            }
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Shipping label
          </span>
          <input
            type="text"
            value={checkoutDraft.shippingTitle}
            onChange={(e) => updateCheckoutDraft({ shippingTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Enable free shipping above threshold
          </span>
          <input
            type="checkbox"
            checked={checkoutDraft.freeShippingEnabled}
            onChange={(e) => updateCheckoutDraft({ freeShippingEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Free shipping threshold (PKR)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            disabled={!checkoutDraft.freeShippingEnabled}
            value={checkoutDraft.freeShippingThreshold}
            onChange={(e) =>
              updateCheckoutDraft({ freeShippingThreshold: Number(e.target.value) || 0 })
            }
            className={`${inputClass} disabled:opacity-50`}
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Payment methods" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Shopify does not share manual payment notes via API. Paste the same
          instructions you wrote in Shopify → Settings → Payments (Bank Deposit,
          COD, etc.) so customers see them at checkout.
        </p>
        {checkoutDraft.paymentMethods.map((method, index) => (
          <div
            key={method.id}
            className="mt-3 rounded-md border border-gray-200 p-3 dark:border-gray-700"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Method name
              </span>
              <input
                type="text"
                value={method.name}
                onChange={(e) => {
                  const paymentMethods = checkoutDraft.paymentMethods.map((m, i) =>
                    i === index ? { ...m, name: e.target.value } : m
                  )
                  updateCheckoutDraft({ paymentMethods })
                }}
                className={inputClass}
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Instructions / notes (shown when selected)
              </span>
              <textarea
                rows={5}
                value={method.description}
                placeholder="Account title, bank name, IBAN, JazzCash number, etc."
                onChange={(e) => {
                  const paymentMethods = checkoutDraft.paymentMethods.map((m, i) =>
                    i === index ? { ...m, description: e.target.value } : m
                  )
                  updateCheckoutDraft({ paymentMethods })
                }}
                className={inputClass}
              />
            </label>
          </div>
        ))}
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Labels & copy" defaultOpen>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Page title
          </span>
          <input
            type="text"
            value={checkoutDraft.pageTitle}
            onChange={(e) => updateCheckoutDraft({ pageTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Place order / Complete order button
          </span>
          <input
            type="text"
            value={checkoutDraft.submitLabel}
            onChange={(e) => updateCheckoutDraft({ submitLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Empty cart message
          </span>
          <input
            type="text"
            value={checkoutDraft.emptyCartText}
            onChange={(e) => updateCheckoutDraft({ emptyCartText: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Success title
          </span>
          <input
            type="text"
            value={checkoutDraft.successTitle}
            onChange={(e) => updateCheckoutDraft({ successTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Success message
          </span>
          <textarea
            rows={3}
            value={checkoutDraft.successMessage}
            onChange={(e) => updateCheckoutDraft({ successMessage: e.target.value })}
            className={inputClass}
          />
        </label>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
