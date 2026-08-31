'use client'

import type { HomeDividerConfig } from '@/lib/home-divider'

type HomeDividerSectionProps = {
  config: HomeDividerConfig
  children: React.ReactNode
  contentClassName?: string
}

export default function HomeDividerSection({
  config,
  children,
  contentClassName = '',
}: HomeDividerSectionProps) {
  if (!config.enabled) {
    return <div className={contentClassName}>{children}</div>
  }

  return (
    <section
      className="flex flex-1 flex-col border-t"
      style={{
        marginTop: config.gapTop,
        borderTopColor: config.lineColor,
        paddingTop: config.gapBottom,
      }}
    >
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
