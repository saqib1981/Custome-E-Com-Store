'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function CartSettingsPanel() {
  const {
    closeSection,
    cartDraft,
    cartDirty,
    cartSaving,
    cartStatus,
    updateCartDraft,
    saveCart,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Cart"
      subtitle="Cart drawer + /cart page"
      onBack={closeSection}
      onSave={() => void saveCart()}
      saveDisabled={!cartDirty}
      saving={cartSaving}
      status={cartStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable cart</span>
          <input
            type="checkbox"
            checked={cartDraft.enabled}
            onChange={(e) => updateCartDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Open drawer after add to cart
          </span>
          <input
            type="checkbox"
            checked={cartDraft.drawerEnabled}
            onChange={(e) => updateCartDraft({ drawerEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Show product images
          </span>
          <input
            type="checkbox"
            checked={cartDraft.showProductImages}
            onChange={(e) => updateCartDraft({ showProductImages: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show prices</span>
          <input
            type="checkbox"
            checked={cartDraft.showPrices}
            onChange={(e) => updateCartDraft({ showPrices: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Quantity controls
          </span>
          <input
            type="checkbox"
            checked={cartDraft.showQuantityControls}
            onChange={(e) => updateCartDraft({ showQuantityControls: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Free shipping progress
          </span>
          <input
            type="checkbox"
            checked={cartDraft.showFreeShippingProgress}
            onChange={(e) => updateCartDraft({ showFreeShippingProgress: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      {cartDraft.showFreeShippingProgress ? (
        <SettingsCollapsibleSection title="Free shipping" defaultOpen>
          <label className="mt-1 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Threshold amount (PKR)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={cartDraft.freeShippingThreshold}
              onChange={(e) =>
                updateCartDraft({ freeShippingThreshold: Number(e.target.value) || 0 })
              }
              className={inputClass}
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Unlocked message
            </span>
            <input
              type="text"
              value={cartDraft.freeShippingUnlockedText}
              onChange={(e) => updateCartDraft({ freeShippingUnlockedText: e.target.value })}
              className={inputClass}
            />
          </label>
        </SettingsCollapsibleSection>
      ) : null}

      <SettingsCollapsibleSection title="Messaging" defaultOpen>
        <label className="mt-1 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Cart title
          </span>
          <input
            type="text"
            value={cartDraft.cartPageTitle}
            onChange={(e) => updateCartDraft({ cartPageTitle: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Empty cart text
          </span>
          <input
            type="text"
            value={cartDraft.emptyCartText}
            onChange={(e) => updateCartDraft({ emptyCartText: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Continue shopping label
          </span>
          <input
            type="text"
            value={cartDraft.continueShoppingLabel}
            onChange={(e) => updateCartDraft({ continueShoppingLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Checkout label
          </span>
          <input
            type="text"
            value={cartDraft.checkoutLabel}
            onChange={(e) => updateCartDraft({ checkoutLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Changes show in preview immediately. Click <strong>Save</strong> to push to Supabase.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
