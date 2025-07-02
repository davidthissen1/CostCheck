import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/contexts/cart-context'

export const metadata: Metadata = {
  title: 'CostCheck - Real-time Grocery Price Tracker',
  description: 'Track real-time grocery and household item prices from government sources (BLS & USDA)',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
