export type Role = 'admin' | 'super_admin'

export interface Profile {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
}

export interface Student {
  id: string
  name: string
  nickname: string
  group_name: string
  score: number
  created_at: string
}

export interface ScoreLog {
  id: string
  student_id: string
  admin_id: string | null
  delta: number
  activity: string
  created_at: string
  students?: { name: string; nickname: string }
  profiles?: { name: string; email: string }
}
