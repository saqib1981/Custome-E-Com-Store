'use client'

import { Monitor, Smartphone, Tablet } from 'lucide-react'
import type { PreviewViewport } from '@/lib/preview-viewport'

const PREVIEW_VIEWPORTS: {
  id: PreviewViewport
  label: string
  icon: typeof Smartphone
}[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
]

type PreviewViewportSwitcherProps = {
  viewport: PreviewViewport
  onChange: (viewport: PreviewViewport) => void
}

export default function PreviewViewportSwitcher({
  viewport,
  onChange,
}: PreviewViewportSwitcherProps) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-gray-700 bg-gray-900 p-0.5"
      role="group"
      aria-label="Preview screen size"
    >
      {PREVIEW_VIEWPORTS.map(({ id, label, icon: Icon }) => {
        const active = viewport === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              active
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
