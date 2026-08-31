'use client'

import Link from 'next/link'
import { ExternalLink, LayoutPanelTop } from 'lucide-react'
import { AdminEditorProvider, useAdminEditor } from '@/context/AdminEditorContext'
import AdminSectionsNav, { AnnouncementBarSettingsPanel } from '@/components/admin/AdminSidebar'

function MyAdminShell({ children }: { children: React.ReactNode }) {
  const { activeSection } = useAdminEditor()

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-950">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <LayoutPanelTop className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Theme editor</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Custom E-Com Store · Admin</p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          View store
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside
          className={`shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-y-auto transition-[width] duration-200 ${
            activeSection ? 'w-[360px]' : 'w-64'
          }`}
        >
          {activeSection === 'announcement' ? <AnnouncementBarSettingsPanel /> : <AdminSectionsNav />}
        </aside>
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

export default function MyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminEditorProvider>
      <MyAdminShell>{children}</MyAdminShell>
    </AdminEditorProvider>
  )
}
