'use client'

import { normalizeHexColor } from '@/lib/announcement'

const inputClass =
  'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

type ColorFieldProps = {
  id: string
  label: string
  value: string
  fallback: string
  onChange: (hex: string) => void
}

export default function ColorField({ id, label, value, fallback, onChange }: ColorFieldProps) {
  const normalized = normalizeHexColor(value, fallback)

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
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
