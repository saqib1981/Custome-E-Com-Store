'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode, MouseEventHandler } from 'react'

type StoreNavLinkProps = {
  href: string
  external?: boolean
  /** When true, clicks update preview route instead of leaving /myadmin. */
  previewMode?: boolean
  onPreviewNavigate?: (path: string) => void
  onClick?: MouseEventHandler<HTMLAnchorElement>
  className?: string
  style?: CSSProperties
  children: ReactNode
  'aria-current'?: 'page' | undefined
  'aria-label'?: string
  'data-active'?: 'true' | 'false'
  /** Opens internal links in a new browser tab. */
  openInNewTab?: boolean
}

export default function StoreNavLink({
  href,
  external = false,
  previewMode = false,
  onPreviewNavigate,
  onClick,
  className,
  style,
  children,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  'data-active': dataActive,
  openInNewTab = false,
}: StoreNavLinkProps) {
  const newTabProps = openInNewTab ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}

  if (external) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-label={ariaLabel}
        data-active={dataActive}
      >
        {children}
      </a>
    )
  }

  if (previewMode) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        data-active={dataActive}
        {...newTabProps}
        onClick={(e) => {
          if (!openInNewTab) {
            e.preventDefault()
            onPreviewNavigate?.(href)
          }
          onClick?.(e)
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      style={style}
      onClick={onClick}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      data-active={dataActive}
      {...newTabProps}
    >
      {children}
    </Link>
  )
}
