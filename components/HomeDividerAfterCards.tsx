import SectionDivider from '@/components/SectionDivider'

/** Homepage divider below collection cards — loads saved settings from admin API. */
export default function HomeDividerAfterCards() {
  return <SectionDivider apiPath="/api/admin/home-divider-after-cards" />
}
