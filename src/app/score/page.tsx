import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ScoreClient from './ScoreClient'
import type { Profile, Student } from '@/lib/types'

export default async function ScorePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: students } = await supabase
    .from('students').select('*').order('group_name')

  return (
    <div>
      <Navbar profile={profile as Profile} />
      <main className="pt-14 max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">ให้คะแนน</h1>
          <p className="text-sm mt-1" style={{color:'#a09a92'}}>
            กดให้คะแนนรายคน หรือให้ทั้งกลุ่มพร้อมกัน
          </p>
        </div>
        <ScoreClient
          initialStudents={(students || []) as Student[]}
          adminId={user.id}
        />
      </main>
    </div>
  )
}
