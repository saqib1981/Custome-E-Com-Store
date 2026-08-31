import HeroBanner from '@/components/HeroBanner'
import HomeDivider from '@/components/HomeDivider'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HomeDivider contentClassName="px-4 sm:px-6 lg:px-8">
        <h1 className="sr-only">Home</h1>
      </HomeDivider>
    </>
  )
}
