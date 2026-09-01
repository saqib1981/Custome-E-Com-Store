'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { formatWhatsAppNumberDisplay, normalizeWhatsAppNumber } from '@/lib/floating-buttons'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export default function FloatingButtonsSettingsPanel() {
  const {
    closeGlobalSetting,
    floatingButtonsDraft,
    floatingButtonsDirty,
    floatingButtonsSaving,
    floatingButtonsStatus,
    updateFloatingButtonsDraft,
    saveFloatingButtons,
  } = useAdminEditor()

  const digits = normalizeWhatsAppNumber(floatingButtonsDraft.whatsappNumber)
  const previewUrl = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent('Hello, I have a question about this page: https://yourstore.com/...')}`
    : ''

  return (
    <AdminPanelShell
      title="Floating buttons"
      subtitle="Changes save automatically · preview updates instantly"
      onBack={closeGlobalSetting}
      onSave={() => void saveFloatingButtons()}
      saveDisabled={!floatingButtonsDirty || floatingButtonsSaving}
      saving={floatingButtonsSaving}
      status={floatingButtonsStatus}
    >
      <SettingsCollapsibleSection title="Back to top" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show back to top button</span>
          <input
            type="checkbox"
            checked={floatingButtonsDraft.backToTopEnabled}
            onChange={(e) => updateFloatingButtonsDraft({ backToTopEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
        <p className="px-1 pb-2 text-xs text-gray-500 dark:text-gray-400">
          Appears after scrolling down. Scroll progress ring works the same as before.
        </p>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="WhatsApp" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show WhatsApp button</span>
          <input
            type="checkbox"
            checked={floatingButtonsDraft.whatsappEnabled}
            onChange={(e) => updateFloatingButtonsDraft({ whatsappEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>

        <div className="space-y-2 px-1 pb-2">
          <label htmlFor="floating-whatsapp-number" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            WhatsApp number
          </label>
          <input
            id="floating-whatsapp-number"
            type="tel"
            inputMode="numeric"
            value={floatingButtonsDraft.whatsappNumber}
            onChange={(e) =>
              updateFloatingButtonsDraft({ whatsappNumber: normalizeWhatsAppNumber(e.target.value) })
            }
            placeholder="923001234567"
            className={inputClass}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Country code + number, digits only (no + or spaces). Example: 923001234567 for Pakistan.
          </p>
          {digits ? (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Saved as: <span className="font-medium">{formatWhatsAppNumberDisplay(digits)}</span>
            </p>
          ) : null}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            When a customer taps WhatsApp, their app opens with a pre-filled message that includes the
            current page URL so you know which page they came from.
          </p>
          {previewUrl ? (
            <p className="break-all rounded-md border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Link preview: {previewUrl}
            </p>
          ) : null}
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
