import HeroBanner from '@/components/HeroBanner'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="sr-only">Home</h1>
      </div>
    </>
  )
}
