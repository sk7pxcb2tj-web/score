'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false); return }
    router.push('/score')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#0a0a0f'}}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{background:'#e8b84b'}}>
            <span className="text-2xl font-bold text-black">S</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">ScoreBoard</h1>
          <p className="text-sm mt-1" style={{color:'#a09a92'}}>ระบบสะสมคะแนนกิจกรรม</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="rounded-2xl p-6 space-y-4"
            style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.08)'}}>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'#a09a92'}}>อีเมล</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com" required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.12)',color:'#f0ede8'}}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'#a09a92'}}>รหัสผ่าน</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.12)',color:'#f0ede8'}}
              />
            </div>

            {error && (
              <p className="text-xs text-center py-2 rounded-lg"
                style={{background:'rgba(232,92,75,0.1)',color:'#ff6b6b'}}>
                {error}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity"
            style={{background:'#e8b84b',color:'#0a0a0f',opacity:loading?0.7:1}}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{color:'#5a5550'}}>
          หน้า Leaderboard สาธารณะ →{' '}
          <a href="/leaderboard" className="underline" style={{color:'#a09a92'}}>/leaderboard</a>
        </p>
      </div>
    </div>
  )
}
