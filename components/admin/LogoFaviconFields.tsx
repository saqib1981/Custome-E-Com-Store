'use client'

import { ChevronDown, ChevronUp, Database, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { isShopifyFilesUrl } from '@/lib/store-media'

function truncateFileName(name: string, max = 18): string {
  if (name.length <= max) return name
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
  const base = name.slice(0, max - ext.length - 1)
  return `${base}…${ext}`
}

type ImageUploadFieldProps = {
  id: string
  label: string
  imageUrl: string
  fileName: string
  helperText?: string
  accept?: string
  emptyLabel?: string
  dashed?: boolean
  uploading?: boolean
  onUpload: (file: File) => Promise<void>
  onClear?: () => void
}

export function ImageUploadField({
  id,
  label,
  imageUrl,
  fileName,
  helperText,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  emptyLabel = 'Select',
  dashed = false,
  uploading = false,
  onUpload,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const safeUrl = isShopifyFilesUrl(imageUrl) ? imageUrl.trim() : ''
  const [previewFailed, setPreviewFailed] = useState(false)
  const hasImage = Boolean(safeUrl) && !previewFailed

  useEffect(() => {
    setPreviewFailed(false)
  }, [safeUrl])

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 pt-1">
        <label htmlFor={id} className="text-sm text-gray-800 dark:text-gray-200">
          {label}
        </label>
        {helperText ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : null}
      </div>

      <div className="shrink-0">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onUpload(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`group relative block overflow-hidden rounded-lg bg-gray-100 transition hover:ring-2 hover:ring-primary-500 dark:bg-gray-800 ${
            dashed
              ? 'h-[88px] w-[140px] border-2 border-dashed border-gray-300 dark:border-gray-600'
              : 'h-[88px] w-[140px] border border-gray-200 dark:border-gray-700'
          }`}
        >
          {uploading ? (
            <span className="flex h-full items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            </span>
          ) : hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeUrl}
                alt=""
                className="h-full w-full object-contain p-2"
                onError={() => setPreviewFailed(true)}
              />
              {fileName ? (
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px] text-white">
                  {truncateFileName(fileName)}
                </span>
              ) : null}
            </>
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
              <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                {emptyLabel}
              </span>
              {dashed ? (
                <Database className="h-4 w-4 text-gray-400" aria-hidden />
              ) : null}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

type LogoWidthRowProps = {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function LogoWidthRow({ label, value, min = 40, max = 400, onChange }: LogoWidthRowProps) {
  return (
    <div className="flex items-center gap-2 py-3">
      <span className="w-14 shrink-0 text-sm text-gray-800 dark:text-gray-200">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-primary-600"
      />
      <div className="flex shrink-0 items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (Number.isFinite(next)) onChange(next)
          }}
          onBlur={(e) => {
            const next = Number(e.target.value)
            if (!Number.isFinite(next)) onChange(min)
            else onChange(Math.min(max, Math.max(min, next)))
          }}
          className="w-[4.25rem] min-w-[4.25rem] rounded border border-gray-300 bg-white px-1.5 py-1 text-center text-sm tabular-nums text-gray-900 [appearance:textfield] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">px</span>
      </div>
    </div>
  )
}

export function SettingsCollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = open ? ChevronUp : ChevronDown

  return (
    <section className="border-b border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-1 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
        <Icon className="h-4 w-4 text-gray-500" aria-hidden />
      </button>
      {open ? <div className="pb-2">{children}</div> : null}
    </section>
  )
}
