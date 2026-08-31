'use client'

import { LayoutGrid, Megaphone, Settings } from 'lucide-react'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { GLOBAL_SETTINGS_ITEMS } from '@/lib/admin-global-settings'

const tabClass = (active: boolean) =>
  `flex flex-1 items-center justify-center border-b-2 px-3 py-3 transition-colors ${
    active
      ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
  }`

export default function AdminSidebarNav() {
  const { sidebarTab, setSidebarTab, openSection, openGlobalSetting } = useAdminEditor()

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 border-b border-gray-200 dark:border-gray-800"
        role="tablist"
        aria-label="Theme editor navigation"
      >
        <button
          type="button"
          role="tab"
          aria-selected={sidebarTab === 'sections'}
          aria-label="Sections"
          title="Sections"
          onClick={() => setSidebarTab('sections')}
          className={tabClass(sidebarTab === 'sections')}
        >
          <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sidebarTab === 'global'}
          aria-label="Global settings"
          title="Global settings"
          onClick={() => setSidebarTab('global')}
          className={tabClass(sidebarTab === 'global')}
        >
          <Settings className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sidebarTab === 'sections' ? (
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Homepage
            </p>
            <nav className="mt-2 space-y-1" aria-label="Store sections">
              <button
                type="button"
                onClick={() => openSection('announcement')}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
                Announcement bar
              </button>
            </nav>
          </div>
        ) : (
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Theme settings
            </p>
            <nav className="mt-2 space-y-1" aria-label="Global settings">
              {GLOBAL_SETTINGS_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openGlobalSetting(item.id)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <Icon className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
                      {item.name}
                    </span>
                    <span className="pl-6 text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
