'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function ProductPageSettingsPanel() {
  const {
    closeSection,
    productPageDraft,
    productPageDirty,
    productPageSaving,
    productPageStatus,
    updateProductPageDraft,
    saveProductPage,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Product"
      subtitle="Product detail page (/products/…) — layout like store PDP"
      onBack={closeSection}
      onSave={() => void saveProductPage()}
      saveDisabled={!productPageDirty}
      saving={productPageSaving}
      status={productPageStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show product page</span>
          <input
            type="checkbox"
            checked={productPageDraft.enabled}
            onChange={(e) => updateProductPageDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Sale badge</span>
          <input
            type="checkbox"
            checked={productPageDraft.showSaleBadge}
            onChange={(e) => updateProductPageDraft({ showSaleBadge: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">SKU</span>
          <input
            type="checkbox"
            checked={productPageDraft.showSku}
            onChange={(e) => updateProductPageDraft({ showSku: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Availability</span>
          <input
            type="checkbox"
            checked={productPageDraft.showAvailability}
            onChange={(e) => updateProductPageDraft({ showAvailability: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Stock urgency</span>
          <input
            type="checkbox"
            checked={productPageDraft.showStockUrgency}
            onChange={(e) => updateProductPageDraft({ showStockUrgency: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Quantity selector</span>
          <input
            type="checkbox"
            checked={productPageDraft.showQuantity}
            onChange={(e) => updateProductPageDraft({ showQuantity: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Description</span>
          <input
            type="checkbox"
            checked={productPageDraft.showDescription}
            onChange={(e) => updateProductPageDraft({ showDescription: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Ask a question</span>
          <input
            type="checkbox"
            checked={productPageDraft.showAskQuestion}
            onChange={(e) => updateProductPageDraft({ showAskQuestion: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Buy Now button</span>
          <input
            type="checkbox"
            checked={productPageDraft.showBuyNow}
            onChange={(e) => updateProductPageDraft({ showBuyNow: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Messaging" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Delivery estimate
          </span>
          <input
            type="checkbox"
            checked={productPageDraft.showDeliveryEstimate}
            onChange={(e) => updateProductPageDraft({ showDeliveryEstimate: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        {productPageDraft.showDeliveryEstimate ? (
          <label className="mt-1 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Delivery text
            </span>
            <input
              type="text"
              value={productPageDraft.deliveryEstimateText}
              onChange={(e) => updateProductPageDraft({ deliveryEstimateText: e.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}

        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Free shipping note
          </span>
          <input
            type="checkbox"
            checked={productPageDraft.showFreeShippingNote}
            onChange={(e) => updateProductPageDraft({ showFreeShippingNote: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        {productPageDraft.showFreeShippingNote ? (
          <label className="mt-1 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Free shipping text
            </span>
            <input
              type="text"
              value={productPageDraft.freeShippingText}
              onChange={(e) => updateProductPageDraft({ freeShippingText: e.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}

        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Add to cart label
          </span>
          <input
            type="text"
            value={productPageDraft.addToCartLabel}
            onChange={(e) => updateProductPageDraft({ addToCartLabel: e.target.value })}
            className={inputClass}
          />
        </label>
        {productPageDraft.showBuyNow ? (
          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Buy Now label
            </span>
            <input
              type="text"
              value={productPageDraft.buyNowLabel}
              onChange={(e) => updateProductPageDraft({ buyNowLabel: e.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Changes show in preview immediately. Click <strong>Save</strong> to push to Supabase.
        </p>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
