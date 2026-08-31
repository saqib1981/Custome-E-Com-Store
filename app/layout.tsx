import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeInit from '@/components/ThemeInit'
import LayoutContent from '@/components/LayoutContent'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: { default: 'Custom E-Com Store', template: '%s | Custom E-Com Store' },
  description: 'Custom E-Commerce Store — Shopify products display',
  applicationName: 'Custom E-Com Store',
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
