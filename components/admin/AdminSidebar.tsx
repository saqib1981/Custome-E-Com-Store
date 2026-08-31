'use client'

import AdminPanelShell from '@/components/admin/AdminPanelShell'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { normalizeHexColor } from '@/lib/announcement'

const GAP_OPTIONS = [
  { value: '2rem', label: 'Small' },
  { value: '3rem', label: 'Medium' },
  { value: '4rem', label: 'Large' },
] as const

const SPEED_MIN = 8
const SPEED_MAX = 90

const SPEED_PRESETS = [
  { label: 'Fast', value: 10 },
  { label: 'Normal', value: 15 },
  { label: 'Slow', value: 30 },
  { label: 'Very slow', value: 45 },
  { label: 'Ultra slow', value: 60 },
  { label: 'Super slow', value: 90 },
] as const

const HEIGHT_MIN = 24
const HEIGHT_MAX = 80

const HEIGHT_PRESETS = [
  { label: 'Compact', value: 28 },
  { label: 'Default', value: 36 },
  { label: 'Medium', value: 44 },
  { label: 'Large', value: 52 },
  { label: 'Extra large', value: 64 },
] as const

const inputClass =
  'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

function parseSpeedSeconds(speed: string): number {
  const m = speed.match(/^(\d+)s$/)
  return m ? Number(m[1]) : 15
}

function parseHeightPx(height: string): number {
  const m = height.match(/^(\d+)px$/)
  return m ? Number(m[1]) : 36
}

function ColorField({
  id,
  label,
  value,
  fallback,
  onChange,
}: {
  id: string
  label: string
  value: string
  fallback: string
  onChange: (hex: string) => void
}) {
  const normalized = normalizeHexColor(value, fallback)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={normalized}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(normalized)}
          className={inputClass}
          placeholder={fallback}
          spellCheck={false}
          maxLength={7}
        />
      </div>
    </div>
  )
}

export function AnnouncementBarSettingsPanel() {
  const {
    closeSection,
    announcementDraft,
    announcementDirty,
    announcementSaving,
    announcementStatus,
    updateAnnouncementDraft,
    saveAnnouncement,
  } = useAdminEditor()

  const speedSeconds = parseSpeedSeconds(announcementDraft.speed)
  const heightPx = parseHeightPx(announcementDraft.height)

  return (
    <AdminPanelShell
      title="Announcement bar"
      subtitle="Top marquee message"
      onBack={closeSection}
      onSave={() => void saveAnnouncement()}
      saveDisabled={!announcementDirty}
      saving={announcementSaving}
      status={announcementStatus}
    >
      <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Show announcement bar</span>
          <input
            type="checkbox"
            checked={announcementDraft.enabled}
            onChange={(e) => updateAnnouncementDraft({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>

        <div>
          <label htmlFor="announcement-message" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Message
          </label>
          <textarea
            id="announcement-message"
            rows={3}
            value={announcementDraft.message}
            onChange={(e) => updateAnnouncementDraft({ message: e.target.value })}
            className={inputClass}
            placeholder="Free shipping on orders above PKR 3500 in Pakistan"
            maxLength={280}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {announcementDraft.message.length}/280 characters
          </p>
        </div>

        <div className="space-y-4 pt-1 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Colors
          </p>
          <ColorField
            id="announcement-bg"
            label="Background color"
            value={announcementDraft.backgroundColor}
            fallback="#0369a1"
            onChange={(backgroundColor) => updateAnnouncementDraft({ backgroundColor })}
          />
          <ColorField
            id="announcement-text"
            label="Text color"
            value={announcementDraft.textColor}
            fallback="#ffffff"
            onChange={(textColor) => updateAnnouncementDraft({ textColor })}
          />
        </div>

        <div>
          <label htmlFor="announcement-height" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Bar height · {heightPx}px
          </label>
          <input
            id="announcement-height"
            type="range"
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            step={1}
            value={heightPx}
            onChange={(e) => updateAnnouncementDraft({ height: `${e.target.value}px` })}
            className="w-full accent-primary-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Shorter ({HEIGHT_MIN}px)</span>
            <span>Taller ({HEIGHT_MAX}px)</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {HEIGHT_PRESETS.map((preset) => {
              const active = heightPx === preset.value
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateAnnouncementDraft({ height: `${preset.value}px` })}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {preset.label} · {preset.value}px
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="announcement-speed" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Scroll speed · {speedSeconds}s per loop
          </label>
          <input
            id="announcement-speed"
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={1}
            value={speedSeconds}
            onChange={(e) => updateAnnouncementDraft({ speed: `${e.target.value}s` })}
            className="w-full accent-primary-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Faster ({SPEED_MIN}s)</span>
            <span>Slower ({SPEED_MAX}s)</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPEED_PRESETS.map((preset) => {
              const active = speedSeconds === preset.value
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateAnnouncementDraft({ speed: `${preset.value}s` })}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {preset.label} · {preset.value}s
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="announcement-gap" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Space between repeats
          </label>
          <select
            id="announcement-gap"
            value={announcementDraft.gap}
            onChange={(e) => updateAnnouncementDraft({ gap: e.target.value })}
            className={inputClass}
          >
            {GAP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
    </AdminPanelShell>
  )
}
