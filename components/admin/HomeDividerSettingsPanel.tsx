'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  DEFAULT_HOME_DIVIDER,
  parseHomeDividerGapPx,
} from '@/lib/home-divider'

const GAP_PRESETS = [0, 8, 15, 24, 32, 48] as const

type GapFieldProps = {
  id: string
  label: string
  value: string
  onChange: (gap: string) => void
}

function GapField({ id, label, value, onChange }: GapFieldProps) {
  const px = parseHomeDividerGapPx(value, 15)

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
        {label} ({px}px)
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={64}
        value={px}
        onChange={(e) => onChange(`${e.target.value}px`)}
        className="mb-2 w-full accent-primary-600"
      />
      <div className="flex flex-wrap gap-2">
        {GAP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(`${preset}px`)}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
              px === preset
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {preset}px
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HomeDividerSettingsPanel() {
  const {
    closeSection,
    homeDividerDraft,
    homeDividerDirty,
    homeDividerSaving,
    homeDividerStatus,
    updateHomeDividerDraft,
    saveHomeDivider,
  } = useAdminEditor()

  return (
    <AdminPanelShell
      title="Divider"
      subtitle="Line between hero slider and homepage sections"
      onBack={closeSection}
      onSave={() => void saveHomeDivider()}
      saveDisabled={!homeDividerDirty}
      saving={homeDividerSaving}
      status={homeDividerStatus}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show divider</span>
          <input
            type="checkbox"
            checked={homeDividerDraft.enabled}
            onChange={(e) => updateHomeDividerDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Style" defaultOpen>
        <div className="space-y-4 px-3 pb-2">
          <ColorField
            id="home-divider-line-color"
            label="Line color"
            value={homeDividerDraft.lineColor}
            fallback={DEFAULT_HOME_DIVIDER.lineColor}
            onChange={(lineColor) => updateHomeDividerDraft({ lineColor })}
          />
          <GapField
            id="home-divider-gap-top"
            label="Gap above line (after slider)"
            value={homeDividerDraft.gapTop}
            onChange={(gapTop) => updateHomeDividerDraft({ gapTop })}
          />
          <GapField
            id="home-divider-gap-bottom"
            label="Gap below line (before sections)"
            value={homeDividerDraft.gapBottom}
            onChange={(gapBottom) => updateHomeDividerDraft({ gapBottom })}
          />
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
