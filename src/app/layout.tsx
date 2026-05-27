import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScoreBoard — ระบบสะสมคะแนนกิจกรรม',
  description: 'ระบบสะสมคะแนนกิจกรรมสำหรับเด็กๆ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-bg0 text-white min-h-screen">{children}</body>
    </html>
  )
}
