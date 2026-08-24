import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'CMTC AI Knowledge Management System',
    template: '%s | CMTC AI KMS',
  },
  description:
    'ระบบจัดการความรู้อัจฉริยะสำหรับองค์กร ขับเคลื่อนด้วย AI เพื่อการค้นหาและแชร์ความรู้ที่มีประสิทธิภาพสูงสุด',
  keywords: ['knowledge management', 'AI', 'CMTC', 'knowledge base', 'ระบบจัดการความรู้'],
  authors: [{ name: 'CMTC Team' }],
  openGraph: {
    title: 'CMTC AI Knowledge Management System',
    description: 'ระบบจัดการความรู้อัจฉริยะสำหรับองค์กร ขับเคลื่อนด้วย AI',
    type: 'website',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  )
}
