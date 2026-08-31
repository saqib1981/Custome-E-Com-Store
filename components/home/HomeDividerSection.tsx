'use client'

import type { HomeDividerConfig } from '@/lib/home-divider'

type HomeDividerSectionProps = {
  config: HomeDividerConfig
  children?: React.ReactNode
  contentClassName?: string
}

export default function HomeDividerSection({
  config,
  children,
  contentClassName = '',
}: HomeDividerSectionProps) {
  if (!config.enabled) {
    if (!children) return null
    return <div className={contentClassName}>{children}</div>
  }

  return (
    <section
      className="w-full shrink-0 border-t"
      style={{
        marginTop: config.gapTop,
        borderTopColor: config.lineColor,
        paddingTop: config.gapBottom,
      }}
      aria-hidden={children ? undefined : true}
    >
      {children ? <div className={contentClassName}>{children}</div> : null}
    </section>
  )
}
