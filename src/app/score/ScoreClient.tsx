'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Student } from '@/lib/types'

const GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  แดง:    { bg: 'rgba(255,107,107,0.12)', text: '#ff6b6b',  border: 'rgba(255,107,107,0.25)' },
  น้ำเงิน: { bg: 'rgba(107,168,255,0.12)', text: '#6ba8ff',  border: 'rgba(107,168,255,0.25)' },
  เขียว:  { bg: 'rgba(107,255,158,0.12)', text: '#6bff9e',  border: 'rgba(107,255,158,0.25)' },
  เหลือง: { bg: 'rgba(255,204,107,0.12)', text: '#ffcc6b',  border: 'rgba(255,204,107,0.25)' },
}
function gc(g: string) { return GROUP_COLORS[g] || { bg: 'rgba(255,255,255,0.08)', text: '#a09a92', border: 'rgba(255,255,255,0.15)' } }

const ACTIVITIES = ['ตอบคำถามถูก','ทำกิจกรรมสำเร็จ','ช่วยเหลือผู้อื่น','ส่งงานตรงเวลา','ความคิดสร้างสรรค์']

export default function ScoreClient({
  initialStudents, adminId,
}: { initialStudents: Student[]; adminId: string }) {
  const supabase = createClient()
  const [students, setStudents] = useState(initialStudents)
  const [activeGroup, setActiveGroup] = useState('ทั้งหมด')
  const [activity, setActivity] = useState(ACTIVITIES[0])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  function toast(m: string) { setMsg(m); setTimeout(() => setMsg(''), 2200) }

  const groups = ['ทั้งหมด', ...Array.from(new Set(students.map(s => s.group_name)))]
  const filtered = activeGroup === 'ทั้งหมด' ? students : students.filter(s => s.group_name === activeGroup)

  async function applyDelta(ids: string[], delta: number, act: string) {
    setLoading(ids.join(','))
    for (const id of ids) {
      const s = students.find(x => x.id === id)
      if (!s) continue
      const newScore = Math.max(0, s.score + delta)
      await supabase.from('students').update({ score: newScore }).eq('id', id)
      await supabase.from('score_logs').insert({
        student_id: id, admin_id: adminId, delta, activity: act,
      })
    }
    setStudents(prev => prev.map(s =>
      ids.includes(s.id) ? { ...s, score: Math.max(0, s.score + delta) } : s
    ))
    setLoading(null)
    toast(ids.length > 1 ? `+${delta} ให้ ${ids.length} คน · "${act}"` : `+${delta} คะแนน`)
  }

  function bulkScore(delta: number) {
    const ids = filtered.map(s => s.id)
    applyDelta(ids, delta, activity)
  }

  return (
    <div>
      {/* Bulk toolbar */}
      <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center"
        style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
        <span className="text-sm" style={{color:'#a09a92'}}>เพิ่มทั้งกลุ่ม:</span>
        <select value={activity} onChange={e => setActivity(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-[160px]"
          style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}}>
          {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={() => bulkScore(1)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{background:'rgba(107,255,158,0.1)',color:'#6bff9e',border:'1px solid rgba(107,255,158,0.2)'}}>
          +1 ทั้งกลุ่ม
        </button>
        <button onClick={() => bulkScore(5)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{background:'rgba(75,200,232,0.1)',color:'#4bc8e8',border:'1px solid rgba(75,200,232,0.2)'}}>
          +5 ทั้งกลุ่ม
        </button>
      </div>

      {/* Group filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {groups.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeGroup === g
                ? (g === 'ทั้งหมด' ? 'rgba(232,184,75,0.1)' : gc(g).bg)
                : 'transparent',
              color: activeGroup === g
                ? (g === 'ทั้งหมด' ? '#e8b84b' : gc(g).text)
                : '#a09a92',
              border: '1px solid',
              borderColor: activeGroup === g
                ? (g === 'ทั้งหมด' ? '#8a6a22' : gc(g).border)
                : 'rgba(255,255,255,0.08)',
            }}>
            {g === 'ทั้งหมด' ? 'ทั้งหมด' : 'กลุ่ม' + g}
          </button>
        ))}
      </div>

      {/* Score cards grid */}
      <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))'}}>
        {filtered.map(s => {
          const c = gc(s.group_name)
          const isLoading = loading === s.id
          return (
            <div key={s.id} className="rounded-2xl p-4 text-center transition-colors"
              style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div className="font-semibold text-sm mb-0.5">{s.name.split(' ')[0]}</div>
              <div className="text-xs mb-3 flex items-center justify-center gap-1.5" style={{color:'#a09a92'}}>
                {s.nickname}
                <span className="px-1.5 py-0.5 rounded-md text-[10px]"
                  style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`}}>
                  {s.group_name}
                </span>
              </div>
              <div className="text-3xl font-bold mb-3 mono" style={{color:'#e8b84b',letterSpacing:'-0.02em'}}>
                {isLoading ? '...' : s.score}
              </div>
              <div className="flex gap-1">
                <button onClick={() => applyDelta([s.id], -1, 'ลดคะแนน')}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90"
                  style={{background:'rgba(232,92,75,0.1)',color:'#ff6b6b',border:'1px solid rgba(232,92,75,0.2)'}}>
                  −1
                </button>
                <button onClick={() => applyDelta([s.id], 1, activity)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90"
                  style={{background:'rgba(107,255,158,0.1)',color:'#6bff9e',border:'1px solid rgba(107,255,158,0.2)'}}>
                  +1
                </button>
                <button onClick={() => applyDelta([s.id], 5, activity)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90"
                  style={{background:'rgba(75,200,232,0.1)',color:'#4bc8e8',border:'1px solid rgba(75,200,232,0.2)'}}>
                  +5
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {msg && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl text-sm z-50"
          style={{background:'#22222e',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}}>
          {msg}
        </div>
      )}
    </div>
  )
}
