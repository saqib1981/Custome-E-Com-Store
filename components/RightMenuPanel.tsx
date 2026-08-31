'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

type RightMenuPanelProps = {
  open?: boolean
  onClose?: () => void
}

/** Off-canvas drawer from the right — quick tools (expand later). */
export default function RightMenuPanel({ open = false, onClose }: RightMenuPanelProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] transform flex-col bg-white shadow-xl transition-transform duration-200 ease-out dark:bg-gray-800 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Others menu"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Others</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 mt-2 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-2" aria-label="Right menu">
          <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
            Quick tools will appear here.
          </p>
        </nav>
      </aside>
    </>
  )
}
