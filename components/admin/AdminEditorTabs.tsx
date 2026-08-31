'use client'

import { LayoutGrid, Settings } from 'lucide-react'
import { useAdminEditor, type AdminSidebarTab } from '@/context/AdminEditorContext'

const tabButtonClass = (active: boolean) =>
  `inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
    active
      ? 'bg-primary-600 text-white shadow-sm'
      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
  }`

export default function AdminEditorTabs() {
  const { sidebarTab, setSidebarTab, closeSection, closeGlobalSetting } = useAdminEditor()

  const switchTab = (tab: AdminSidebarTab) => {
    closeSection()
    closeGlobalSetting()
    setSidebarTab(tab)
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-gray-700 bg-gray-900 p-0.5"
      role="tablist"
      aria-label="Theme editor navigation"
    >
      <button
        type="button"
        role="tab"
        aria-selected={sidebarTab === 'sections'}
        aria-label="Sections"
        title="Sections"
        onClick={() => switchTab('sections')}
        className={tabButtonClass(sidebarTab === 'sections')}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={sidebarTab === 'global'}
        aria-label="Global settings"
        title="Global settings"
        onClick={() => switchTab('global')}
        className={tabButtonClass(sidebarTab === 'global')}
      >
        <Settings className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    </div>
  )
}
