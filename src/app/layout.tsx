import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FootScan - Intelligent Match Prediction',
  description: 'Advanced football match prediction system powered by machine learning and statistical models.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
