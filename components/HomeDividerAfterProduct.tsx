'use client'

import SectionDivider from '@/components/SectionDivider'
import HomeDividerSection from '@/components/home/HomeDividerSection'
import type { HomeDividerConfig } from '@/lib/home-divider'

type HomeDividerAfterProductProps = {
  configOverride?: HomeDividerConfig
}

/** Divider between product details and related products on /products/… */
export default function HomeDividerAfterProduct({ configOverride }: HomeDividerAfterProductProps) {
  if (configOverride) {
    return <HomeDividerSection config={configOverride} />
  }

  return <SectionDivider apiPath="/api/admin/home-divider-after-product" />
}
