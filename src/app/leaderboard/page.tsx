'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Student } from '@/lib/types'

const GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  แดง:    { bg: 'rgba(255,107,107,0.12)', text: '#ff6b6b',  border: 'rgba(255,107,107,0.25)' },
  น้ำเงิน: { bg: 'rgba(107,168,255,0.12)', text: '#6ba8ff',  border: 'rgba(107,168,255,0.25)' },
  เขียว:  { bg: 'rgba(107,255,158,0.12)', text: '#6bff9e',  border: 'rgba(107,255,158,0.25)' },
  เหลือง: { bg: 'rgba(255,204,107,0.12)', text: '#ffcc6b',  border: 'rgba(255,204,107,0.25)' },
}
function gc(g: string) { return GROUP_COLORS[g] || { bg: 'rgba(255,255,255,0.08)', text: '#a09a92', border: 'rgba(255,255,255,0.15)' } }
const MEDALS = ['🥇','🥈','🥉']

export default function LeaderboardPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [pulse, setPulse] = useState(false)

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*').order('score', { ascending: false })
    if (data) setStudents(data as Student[])
  }

  useEffect(() => {
    fetchStudents()
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents()
        setPulse(true)
        setTimeout(() => setPulse(false), 800)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Group totals
  const groups = Array.from(new Set(students.map(s => s.group_name)))
  const groupScores = groups
    .map(g => ({ name: g, total: students.filter(s => s.group_name === g).reduce((a, b) => a + b.score, 0) }))
    .sort((a, b) => b.total - a.total)
  const maxGroupScore = groupScores[0]?.total || 1
  const maxScore = students[0]?.score || 1
  const top3 = students.slice(0, 3)
  const rest = students.slice(3)

  return (
    <div className="min-h-screen" style={{background:'#0a0a0f'}}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{borderColor:'rgba(255,255,255,0.07)'}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{background:'#e8b84b',color:'#0a0a0f'}}>S</div>
          <span className="font-semibold">Score<span style={{color:'#e8b84b'}}>Board</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pulse ? 'scale-150' : ''} transition-transform`}
            style={{background:'#6bff9e'}} />
          <span className="text-xs mono" style={{color:'#5a5550'}}>LIVE</span>
        </div>
        <a href="/login" className="text-xs px-3 py-1.5 rounded-lg"
          style={{color:'#a09a92',border:'1px solid rgba(255,255,255,0.08)'}}>
          เข้าสู่ระบบ →
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{background:'radial-gradient(ellipse 400px 200px at 50% 0%, rgba(232,184,75,0.1), transparent)'}} />
          <p className="mono text-xs tracking-widest mb-3" style={{color:'#e8b84b'}}>
            กิจกรรมค่ายวิชาการ 2568
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
            อันดับ<span style={{color:'#e8b84b'}}>คะแนน</span>
          </h1>
          <p className="text-sm" style={{color:'#5a5550'}}>อัปเดตอัตโนมัติ ไม่ต้องรีเฟรช</p>
        </div>

        {/* Group scores */}
        <p className="mono text-xs tracking-widest mb-3" style={{color:'#5a5550'}}>
          คะแนนรวมตามกลุ่ม
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {groupScores.map((g, i) => {
            const c = gc(g.name)
            const pct = Math.round(g.total / maxGroupScore * 100)
            return (
              <div key={g.name} className="rounded-2xl p-4 text-center relative overflow-hidden"
                style={{
                  background: '#12121a',
                  border: `1px solid ${i === 0 ? '#8a6a22' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: i === 0 ? '0 0 30px rgba(232,184,75,0.06)' : 'none',
                }}>
                {i === 0 && (
                  <div className="absolute top-0 right-0 text-[9px] font-bold px-2 py-1 rounded-bl-lg"
                    style={{background:'#e8b84b',color:'#0a0a0f'}}>อันดับ 1</div>
                )}
                <div className="mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>
                    {g.name}
                  </span>
                </div>
                <div className="text-3xl font-bold mono mt-2 mb-2"
                  style={{color: i === 0 ? '#e8b84b' : '#f0ede8'}}>
                  {g.total}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{background:'#22222e'}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${pct}%`,background: i === 0 ? '#e8b84b' : '#5a5550'}} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Podium top 3 */}
        {top3.length > 0 && (
          <>
            <p className="mono text-xs tracking-widest mb-3" style={{color:'#5a5550'}}>TOP 3</p>
            <div className="grid gap-3 mb-4"
              style={{gridTemplateColumns: top3.length >= 3 ? '1fr 1.12fr 1fr' : `repeat(${top3.length},1fr)`}}>
              {(top3.length >= 3 ? [top3[1],top3[0],top3[2]] : top3).map((s, i) => {
                const rank = top3.length >= 3 ? [2,1,3][i] : i+1
                const c = gc(s.group_name)
                return (
                  <div key={s.id} className="rounded-2xl p-5 text-center relative overflow-hidden"
                    style={{
                      background: rank === 1 ? 'linear-gradient(160deg,#1e1a0f,#12121a)' : '#12121a',
                      border: `1px solid ${rank === 1 ? '#8a6a22' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="text-3xl mb-1">{MEDALS[rank-1]}</div>
                    <div className="text-xs mb-2 mono" style={{color:'#5a5550'}}>อันดับ {rank}</div>
                    <div className="font-semibold text-base">{s.name.split(' ')[0]}</div>
                    <div className="text-xs mt-0.5 mb-3" style={{color:'#a09a92'}}>
                      {s.nickname} ·{' '}
                      <span className="px-1.5 py-0.5 rounded-md text-[10px]"
                        style={{background:c.bg,color:c.text}}>
                        {s.group_name}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mono"
                      style={{color: rank === 1 ? '#e8b84b' : '#f0ede8', letterSpacing:'-0.02em'}}>
                      {s.score}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <>
            <p className="mono text-xs tracking-widest mb-3" style={{color:'#5a5550'}}>
              อันดับ 4 เป็นต้นไป
            </p>
            <div className="flex flex-col gap-2">
              {rest.map((s, i) => {
                const c = gc(s.group_name)
                const pct = Math.round(s.score / maxScore * 100)
                return (
                  <div key={s.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <span className="mono text-xs min-w-5 text-center" style={{color:'#5a5550'}}>
                      {i + 4}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {s.name}{' '}
                        <span className="text-xs font-normal" style={{color:'#a09a92'}}>({s.nickname})</span>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md"
                          style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>
                          {s.group_name}
                        </span>
                      </div>
                    </div>
                    <div className="w-24 h-1 rounded-full overflow-hidden hidden sm:block"
                      style={{background:'#22222e'}}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{width:`${pct}%`,background:'#3a3a4a'}} />
                    </div>
                    <span className="mono text-base font-medium min-w-8 text-right">{s.score}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {students.length === 0 && (
          <div className="text-center py-20" style={{color:'#5a5550'}}>
            <div className="text-4xl mb-4">🏆</div>
            <p>ยังไม่มีข้อมูลนักเรียน</p>
          </div>
        )}
      </div>
    </div>
  )
}
