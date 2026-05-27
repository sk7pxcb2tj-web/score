'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Student, ScoreLog } from '@/lib/types'

const GROUP_COLORS: Record<string, string> = {
  แดง: 'rgba(255,107,107,0.15)',
  น้ำเงิน: 'rgba(107,168,255,0.15)',
  เขียว: 'rgba(107,255,158,0.15)',
  เหลือง: 'rgba(255,204,107,0.15)',
}
const GROUP_TEXT: Record<string, string> = {
  แดง: '#ff6b6b', น้ำเงิน: '#6ba8ff', เขียว: '#6bff9e', เหลือง: '#ffcc6b',
}

export default function AdminClient({
  initialStudents, initialLogs,
}: { initialStudents: Student[]; initialLogs: ScoreLog[] }) {
  const supabase = createClient()
  const [students, setStudents] = useState(initialStudents)
  const [logs] = useState(initialLogs)
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [group, setGroup] = useState('แดง')
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'students'|'logs'>('students')

  function toast(m: string) { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !nickname.trim()) { toast('กรุณากรอกชื่อและชื่อเล่น'); return }
    const { data, error } = await supabase
      .from('students').insert({ name: name.trim(), nickname: nickname.trim(), group_name: group, score: 0 })
      .select().single()
    if (error) { toast('เกิดข้อผิดพลาด: ' + error.message); return }
    setStudents(prev => [data, ...prev])
    setName(''); setNickname('')
    toast(`เพิ่ม "${nickname}" เรียบร้อยแล้ว`)
  }

  async function deleteStudent(id: string, nick: string) {
    if (!confirm(`ลบ "${nick}" ออกจากระบบ?`)) return
    await supabase.from('students').delete().eq('id', id)
    setStudents(prev => prev.filter(s => s.id !== id))
    toast('ลบนักเรียนแล้ว')
  }

  async function changeGroup(id: string, newGroup: string) {
    await supabase.from('students').update({ group_name: newGroup }).eq('id', id)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, group_name: newGroup } : s))
  }

  const totalScore = students.reduce((a, b) => a + b.score, 0)
  const topStudent = [...students].sort((a, b) => b.score - a.score)[0]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'นักเรียนทั้งหมด', value: students.length + ' คน' },
          { label: 'คะแนนรวม', value: totalScore.toLocaleString(), gold: true },
          { label: 'กลุ่มทั้งหมด', value: new Set(students.map(s=>s.group_name)).size + ' กลุ่ม' },
          { label: 'คะแนนสูงสุด', value: topStudent ? `${topStudent.score} (${topStudent.nickname})` : '-' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 relative overflow-hidden"
            style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#e8b84b,transparent)'}}/>
            <div className="text-xs uppercase tracking-wider mb-2" style={{color:'#5a5550'}}>
              {s.label}
            </div>
            <div className="text-xl font-semibold" style={{color: s.gold ? '#e8b84b' : '#f0ede8'}}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="rounded-2xl mb-5" style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
        <div className="px-5 py-3 border-b" style={{borderColor:'rgba(255,255,255,0.07)'}}>
          <span className="text-sm font-medium">เพิ่มนักเรียนใหม่</span>
        </div>
        <form onSubmit={addStudent} className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'#a09a92'}}>ชื่อ-นามสกุล</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="สมชาย ใจดี"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'#a09a92'}}>ชื่อเล่น</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="ต้นหอม"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{color:'#a09a92'}}>กลุ่ม</label>
              <select value={group} onChange={e => setGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#0a0a0f',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}}>
                {['แดง','น้ำเงิน','เขียว','เหลือง'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity"
                style={{background:'#e8b84b',color:'#0a0a0f'}}>
                + เพิ่ม
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['students','logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-sm transition-colors"
            style={{
              background: tab===t ? 'rgba(232,184,75,0.1)' : 'transparent',
              color: tab===t ? '#e8b84b' : '#a09a92',
              border: '1px solid', borderColor: tab===t ? '#8a6a22' : 'rgba(255,255,255,0.08)',
            }}>
            {t === 'students' ? `รายชื่อนักเรียน (${students.length})` : 'ประวัติการให้คะแนน'}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <div className="rounded-2xl overflow-hidden" style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                  {['ชื่อ-นามสกุล','ชื่อเล่น','กลุ่ม','คะแนน','จัดการ'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium"
                      style={{color:'#5a5550'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3" style={{color:'#a09a92'}}>{s.nickname}</td>
                    <td className="px-4 py-3">
                      <select value={s.group_name} onChange={e => changeGroup(s.id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs outline-none"
                        style={{
                          background: GROUP_COLORS[s.group_name] || 'rgba(255,255,255,0.08)',
                          color: GROUP_TEXT[s.group_name] || '#a09a92',
                          border: '1px solid currentColor',
                        }}>
                        {['แดง','น้ำเงิน','เขียว','เหลือง'].map(g => (
                          <option key={g} value={g} style={{background:'#12121a',color:'#f0ede8'}}>{g}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mono text-sm font-medium px-2 py-0.5 rounded-md"
                        style={{background:'rgba(232,184,75,0.1)',color:'#e8b84b'}}>
                        {s.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteStudent(s.id, s.nickname)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{color:'#ff6b6b',background:'rgba(232,92,75,0.08)',border:'1px solid rgba(232,92,75,0.2)'}}>
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="rounded-2xl overflow-hidden" style={{background:'#12121a',border:'1px solid rgba(255,255,255,0.07)'}}>
          <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.05)'}}>
            {logs.length === 0 && (
              <div className="px-5 py-8 text-center text-sm" style={{color:'#5a5550'}}>
                ยังไม่มีประวัติ
              </div>
            )}
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-3">
                <span className="mono text-xs min-w-[90px]" style={{color:'#5a5550'}}>
                  {new Date(l.created_at).toLocaleString('th-TH',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})}
                </span>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:'#e8b84b'}} />
                <span className="flex-1 text-sm" style={{color:'#a09a92'}}>
                  <span style={{color:'#f0ede8'}}>{l.profiles?.name || 'admin'}</span>
                  {' '}ให้{' '}
                  <span style={{color:'#f0ede8'}}>{l.students?.nickname || '?'}</span>
                  {' '}· {l.activity}
                </span>
                <span className="mono text-sm font-medium"
                  style={{color: l.delta >= 0 ? '#6bff9e' : '#ff6b6b'}}>
                  {l.delta >= 0 ? '+' : ''}{l.delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl text-sm z-50"
          style={{background:'#22222e',border:'1px solid rgba(255,255,255,0.1)',color:'#f0ede8'}}>
          {msg}
        </div>
      )}
    </div>
  )
}
