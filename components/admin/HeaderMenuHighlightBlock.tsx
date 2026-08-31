'use client'

import { Database, Trash2 } from 'lucide-react'
import ColorField from '@/components/admin/ColorField'
import {
  DEFAULT_MENU_ITEM_HIGHLIGHT,
  MENU_BADGE_PRESETS,
  type HeaderMenuItemHighlight,
} from '@/lib/header-settings'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

type HeaderMenuHighlightBlockProps = {
  block: HeaderMenuItemHighlight
  index: number
  onChange: (patch: Partial<HeaderMenuItemHighlight>) => void
  onRemove: () => void
}

export default function HeaderMenuHighlightBlock({
  block,
  index,
  onChange,
  onRemove,
}: HeaderMenuHighlightBlockProps) {
  const badgePresetValues = MENU_BADGE_PRESETS.map((preset) => preset.value)
  const badgeSelectValue = badgePresetValues.includes(
    block.badgeLabel as (typeof MENU_BADGE_PRESETS)[number]['value']
  )
    ? block.badgeLabel
    : block.badgeLabel
      ? '__custom__'
      : ''

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Menu item {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          aria-label={`Remove menu item ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label
              htmlFor={`menu-highlight-title-${block.id}`}
              className="text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Menu item
            </label>
            <Database className="h-4 w-4 text-gray-400" aria-hidden />
          </div>
          <input
            id={`menu-highlight-title-${block.id}`}
            type="text"
            value={block.menuTitle}
            onChange={(e) => onChange({ menuTitle: e.target.value })}
            className={inputClass}
            placeholder="Azadi Collection"
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter the exact level 1 menu name. Case-sensitive — must match Shopify navigation.
          </p>
        </div>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Open link in new tab
          </span>
          <input
            type="checkbox"
            checked={block.openInNewTab}
            onChange={(e) => onChange({ openInNewTab: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </label>

        <div>
          <label
            htmlFor={`menu-highlight-badge-${block.id}`}
            className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            Select label
          </label>
          <select
            id={`menu-highlight-badge-${block.id}`}
            value={badgeSelectValue}
            onChange={(e) => {
              const value = e.target.value
              if (value === '__custom__') {
                onChange({ badgeLabel: block.badgeLabel || 'Sale' })
                return
              }
              onChange({ badgeLabel: value })
            }}
            className={inputClass}
          >
            {MENU_BADGE_PRESETS.map((preset) => (
              <option key={preset.value || 'none'} value={preset.value}>
                {preset.label}
              </option>
            ))}
            <option value="__custom__">Custom</option>
          </select>
          {badgeSelectValue === '__custom__' ? (
            <input
              type="text"
              value={block.badgeLabel}
              onChange={(e) => onChange({ badgeLabel: e.target.value })}
              className={`${inputClass} mt-2`}
              placeholder="Custom badge text"
              maxLength={24}
            />
          ) : null}
        </div>

        <ColorField
          id={`menu-highlight-color-${block.id}`}
          label="Title color"
          value={block.linkColor}
          fallback={DEFAULT_MENU_ITEM_HIGHLIGHT.linkColor}
          onChange={(linkColor) =>
            onChange({
              linkColor,
              linkHoverColor: linkColor,
              linkActiveColor: linkColor,
              linkActiveUnderlineColor: linkColor,
              badgeBackgroundColor: linkColor,
            })
          }
        />

        <ColorField
          id={`menu-highlight-underline-${block.id}`}
          label="Underline color"
          value={block.linkActiveUnderlineColor}
          fallback={DEFAULT_MENU_ITEM_HIGHLIGHT.linkActiveUnderlineColor}
          onChange={(linkActiveUnderlineColor) => onChange({ linkActiveUnderlineColor })}
        />

        <ColorField
          id={`menu-highlight-badge-bg-${block.id}`}
          label="Badge background"
          value={block.badgeBackgroundColor}
          fallback={DEFAULT_MENU_ITEM_HIGHLIGHT.badgeBackgroundColor}
          onChange={(badgeBackgroundColor) => onChange({ badgeBackgroundColor })}
        />

        <ColorField
          id={`menu-highlight-badge-text-${block.id}`}
          label="Badge text color"
          value={block.badgeTextColor}
          fallback={DEFAULT_MENU_ITEM_HIGHLIGHT.badgeTextColor}
          onChange={(badgeTextColor) => onChange({ badgeTextColor })}
        />
      </div>
    </div>
  )
}
