'use client'

import SectionDivider from '@/components/SectionDivider'
import HomeDividerSection from '@/components/home/HomeDividerSection'
import type { HomeDividerConfig } from '@/lib/home-divider'

type HomeDividerAfterRelatedProductsProps = {
  configOverride?: HomeDividerConfig
}

/** Divider below related products on /products/… (before footer). */
export default function HomeDividerAfterRelatedProducts({
  configOverride,
}: HomeDividerAfterRelatedProductsProps) {
  if (configOverride) {
    return <HomeDividerSection config={configOverride} />
  }

  return <SectionDivider apiPath="/api/admin/home-divider-after-related-products" />
}
