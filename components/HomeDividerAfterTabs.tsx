import SectionDivider from '@/components/SectionDivider'

/** Homepage divider below collection tabs — loads saved settings from admin API. */
export default function HomeDividerAfterTabs() {
  return <SectionDivider apiPath="/api/admin/home-divider-after-tabs" />
}
