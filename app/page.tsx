import HeroBanner from '@/components/HeroBanner'
import HomeDivider from '@/components/HomeDivider'
import HomeDividerAfterCards from '@/components/HomeDividerAfterCards'
import CollectionCards from '@/components/CollectionCards'
import CollectionTabs from '@/components/CollectionTabs'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HomeDivider />
      <h1 className="sr-only">Home</h1>
      <CollectionCards />
      <HomeDividerAfterCards />
      <CollectionTabs />
    </>
  )
}
