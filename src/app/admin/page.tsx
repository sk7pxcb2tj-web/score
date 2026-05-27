import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AdminClient from './AdminClient'
import type { Profile, Student, ScoreLog } from '@/lib/types'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'super_admin') redirect('/score')

  const { data: students } = await supabase
    .from('students').select('*').order('created_at', { ascending: false })

  const { data: logs } = await supabase
    .from('score_logs')
    .select('*, students(name,nickname), profiles(name,email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <Navbar profile={profile as Profile} />
      <main className="pt-14 max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">จัดการระบบ</h1>
          <p className="text-sm mt-1" style={{color:'#a09a92'}}>เพิ่ม/แก้ไขนักเรียน, กำหนดกลุ่ม, ดูประวัติคะแนน</p>
        </div>
        <AdminClient
          initialStudents={(students || []) as Student[]}
          initialLogs={(logs || []) as ScoreLog[]}
        />
      </main>
    </div>
  )
}
