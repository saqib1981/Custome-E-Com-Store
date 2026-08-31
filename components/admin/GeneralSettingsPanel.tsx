'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { normalizeHexColor } from '@/lib/announcement'
import { DEFAULT_GENERAL_SETTINGS } from '@/lib/general-settings'

const inputClass =
  'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

const BACKGROUND_PRESETS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Light gray', value: '#f9fafb' },
  { label: 'Warm white', value: '#fafaf9' },
  { label: 'Soft blue', value: '#f0f9ff' },
  { label: 'Dark', value: '#111827' },
] as const

export default function GeneralSettingsPanel() {
  const {
    closeGlobalSetting,
    generalSettingsDraft,
    generalSettingsDirty,
    generalSettingsSaving,
    generalSettingsStatus,
    updateGeneralSettingsDraft,
    saveGeneralSettings,
  } = useAdminEditor()

  const normalized = normalizeHexColor(
    generalSettingsDraft.backgroundColor,
    DEFAULT_GENERAL_SETTINGS.backgroundColor
  )

  return (
    <AdminPanelShell
      title="General settings"
      subtitle="Store-wide theme appearance"
      onBack={closeGlobalSetting}
      onSave={() => void saveGeneralSettings()}
      saveDisabled={!generalSettingsDirty}
      saving={generalSettingsSaving}
      status={generalSettingsStatus}
    >
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Theme colors
        </p>

        <div>
          <label
            htmlFor="theme-background-color"
            className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            Theme background color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="theme-background-color"
              type="color"
              value={normalized}
              onChange={(e) => updateGeneralSettingsDraft({ backgroundColor: e.target.value })}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              value={generalSettingsDraft.backgroundColor}
              onChange={(e) => updateGeneralSettingsDraft({ backgroundColor: e.target.value })}
              onBlur={() => updateGeneralSettingsDraft({ backgroundColor: normalized })}
              className={inputClass}
              placeholder={DEFAULT_GENERAL_SETTINGS.backgroundColor}
              spellCheck={false}
              maxLength={7}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Applied to the live store page background. Default is white.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {BACKGROUND_PRESETS.map((preset) => {
            const active = normalized === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateGeneralSettingsDraft({ backgroundColor: preset.value })}
                className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: preset.value }}
                  aria-hidden
                />
                {preset.label}
              </button>
            )
          })}
        </div>

        <div
          className="mt-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          style={{ backgroundColor: normalized }}
        >
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Preview swatch</p>
        </div>
      </div>
    </AdminPanelShell>
  )
}
