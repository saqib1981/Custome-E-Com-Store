'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import { SettingsCollapsibleSection } from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import {
  DEFAULT_HOME_DIVIDER,
  parseHomeDividerGapPx,
  type HomeDividerConfig,
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

type DividerSettingsPanelProps = {
  title: string
  subtitle: string
  idPrefix: string
  gapTopLabel: string
  gapBottomLabel: string
  draft: HomeDividerConfig
  dirty: boolean
  saving: boolean
  status: 'idle' | 'saved' | 'error'
  onUpdate: (patch: Partial<HomeDividerConfig>) => void
  onSave: () => void
  onBack: () => void
}

function DividerSettingsPanel({
  title,
  subtitle,
  idPrefix,
  gapTopLabel,
  gapBottomLabel,
  draft,
  dirty,
  saving,
  status,
  onUpdate,
  onSave,
  onBack,
}: DividerSettingsPanelProps) {
  return (
    <AdminPanelShell
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      onSave={onSave}
      saveDisabled={!dirty}
      saving={saving}
      status={status}
    >
      <SettingsCollapsibleSection title="Visibility" defaultOpen>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show divider</span>
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Style" defaultOpen>
        <div className="space-y-4 px-3 pb-2">
          <ColorField
            id={`${idPrefix}-line-color`}
            label="Line color"
            value={draft.lineColor}
            fallback={DEFAULT_HOME_DIVIDER.lineColor}
            onChange={(lineColor) => onUpdate({ lineColor })}
          />
          <GapField
            id={`${idPrefix}-gap-top`}
            label={gapTopLabel}
            value={draft.gapTop}
            onChange={(gapTop) => onUpdate({ gapTop })}
          />
          <GapField
            id={`${idPrefix}-gap-bottom`}
            label={gapBottomLabel}
            value={draft.gapBottom}
            onChange={(gapBottom) => onUpdate({ gapBottom })}
          />
        </div>
      </SettingsCollapsibleSection>
    </AdminPanelShell>
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
    <DividerSettingsPanel
      title="Divider"
      subtitle="Line between hero slider and collection cards"
      idPrefix="home-divider"
      gapTopLabel="Gap above line (after slider)"
      gapBottomLabel="Gap below line (before collection cards)"
      draft={homeDividerDraft}
      dirty={homeDividerDirty}
      saving={homeDividerSaving}
      status={homeDividerStatus}
      onUpdate={updateHomeDividerDraft}
      onSave={() => void saveHomeDivider()}
      onBack={closeSection}
    />
  )
}

export function HomeDividerAfterCardsSettingsPanel() {
  const {
    closeSection,
    homeDividerAfterCardsDraft,
    homeDividerAfterCardsDirty,
    homeDividerAfterCardsSaving,
    homeDividerAfterCardsStatus,
    updateHomeDividerAfterCardsDraft,
    saveHomeDividerAfterCards,
  } = useAdminEditor()

  return (
    <DividerSettingsPanel
      title="Divider"
      subtitle="Line below collection cards"
      idPrefix="home-divider-after-cards"
      gapTopLabel="Gap above line (after collection cards)"
      gapBottomLabel="Gap below line (before next sections)"
      draft={homeDividerAfterCardsDraft}
      dirty={homeDividerAfterCardsDirty}
      saving={homeDividerAfterCardsSaving}
      status={homeDividerAfterCardsStatus}
      onUpdate={updateHomeDividerAfterCardsDraft}
      onSave={() => void saveHomeDividerAfterCards()}
      onBack={closeSection}
    />
  )
}

export function HomeDividerAfterTabsSettingsPanel() {
  const {
    closeSection,
    homeDividerAfterTabsDraft,
    homeDividerAfterTabsDirty,
    homeDividerAfterTabsSaving,
    homeDividerAfterTabsStatus,
    updateHomeDividerAfterTabsDraft,
    saveHomeDividerAfterTabs,
  } = useAdminEditor()

  return (
    <DividerSettingsPanel
      title="Divider"
      subtitle="Line below collection tabs"
      idPrefix="home-divider-after-tabs"
      gapTopLabel="Gap above line (after collection tabs)"
      gapBottomLabel="Gap below line (before next sections)"
      draft={homeDividerAfterTabsDraft}
      dirty={homeDividerAfterTabsDirty}
      saving={homeDividerAfterTabsSaving}
      status={homeDividerAfterTabsStatus}
      onUpdate={updateHomeDividerAfterTabsDraft}
      onSave={() => void saveHomeDividerAfterTabs()}
      onBack={closeSection}
    />
  )
}
