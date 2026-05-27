'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/lib/types'

export default function Navbar({ profile }: { profile: Profile | null }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
  { href: '/score', label: 'ให้คะแนน' },
  { href: '/leaderboard', label: 'Leaderboard' },

  ...(profile?.role === 'super_admin'
    ? [{ href: '/admin', label: 'จัดการระบบ' }]
    : [])
]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-2"
      style={{background:'rgba(10,10,15,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
      {/* Logo */}
      <Link href="/score" className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{background:'#e8b84b',color:'#0a0a0f'}}>S</div>
        <span className="font-semibold text-sm hidden sm:block">
          Score<span style={{color:'#e8b84b'}}>Board</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex gap-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              color: path === l.href ? '#e8b84b' : '#a09a92',
              background: path === l.href ? 'rgba(232,184,75,0.1)' : 'transparent',
            }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        {profile && (
          <span className="text-xs px-2 py-1 rounded-full hidden sm:block"
            style={{
              background: profile.role === 'super_admin' ? 'rgba(232,184,75,0.1)' : 'rgba(255,255,255,0.06)',
              color: profile.role === 'super_admin' ? '#e8b84b' : '#a09a92',
              border: '1px solid', borderColor: profile.role === 'super_admin' ? '#8a6a22' : 'rgba(255,255,255,0.1)',
              fontFamily: 'IBM Plex Mono, monospace',
            }}>
            {profile.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
          </span>
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
          style={{background:'#22222e',color:'#e8b84b',border:'1px solid rgba(255,255,255,0.1)'}}>
          {profile?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <button onClick={logout}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{color:'#5a5550',border:'1px solid rgba(255,255,255,0.07)'}}>
          ออก
        </button>
      </div>
    </nav>
  )
}
