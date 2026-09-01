import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import ThemeInit from '@/components/ThemeInit'
import LayoutContent from '@/components/LayoutContent'
import { fetchShopifyShopName } from '@/lib/shopify-shop-server'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

export async function generateMetadata(): Promise<Metadata> {
  const storeName = await fetchShopifyShopName()
  const title = storeName.trim() || 'Store'

  return {
    title: { default: title, template: `%s | ${title}` },
    description: `${title} — online store`,
    applicationName: title,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeInit />
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
