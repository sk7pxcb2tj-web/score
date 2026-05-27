-- ============================================================
-- ScoreBoard — Supabase Migration
-- วิธีใช้: ไปที่ Supabase Dashboard → SQL Editor → วางโค้ดนี้แล้วกด Run
-- ============================================================

-- 1. PROFILES (ข้อมูล admin / super_admin)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  role text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- ทุกคนที่ login แล้วอ่านได้
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

-- super_admin อ่านได้ทุก row
create policy "profiles: super_admin read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
  );

-- สร้าง profile อัตโนมัติเมื่อสมัคร
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), 'admin');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. STUDENTS (ข้อมูลนักเรียน)
create table public.students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  nickname text not null default '',
  group_name text not null default 'ทั่วไป',
  score integer not null default 0,
  created_at timestamptz default now()
);
alter table public.students enable row level security;

-- อ่านได้ทุกคน (leaderboard เป็น public)
create policy "students: public read" on public.students
  for select using (true);

-- เขียนได้เฉพาะ authenticated
create policy "students: auth insert" on public.students
  for insert with check (auth.role() = 'authenticated');

create policy "students: auth update" on public.students
  for update using (auth.role() = 'authenticated');

-- ลบได้เฉพาะ super_admin
create policy "students: super_admin delete" on public.students
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
  );

-- 3. SCORE_LOGS (ประวัติการให้คะแนน)
create table public.score_logs (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students on delete cascade not null,
  admin_id uuid references public.profiles on delete set null,
  delta integer not null,
  activity text not null default '',
  created_at timestamptz default now()
);
alter table public.score_logs enable row level security;

create policy "score_logs: auth read" on public.score_logs
  for select using (auth.role() = 'authenticated');

create policy "score_logs: auth insert" on public.score_logs
  for insert with check (auth.role() = 'authenticated');

-- 4. REALTIME — เปิด realtime สำหรับ students
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.score_logs;

-- 5. ข้อมูลตัวอย่าง (ลบได้ถ้าไม่ต้องการ)
insert into public.students (name, nickname, group_name, score) values
  ('สมชาย ใจดี',   'ต้นหอม', 'แดง',    87),
  ('นภา สวัสดิ์',  'หน่อย',  'น้ำเงิน', 92),
  ('กฤษณ์ รักเรียน','อาร์ต', 'แดง',    74),
  ('มะลิ จันทร์',  'ใบ',     'เขียว',  110),
  ('ธีรพงศ์ พรหม', 'โอ้ท',   'เหลือง',  65),
  ('อัญชนา บุญ',   'ปลา',    'น้ำเงิน',  88),
  ('ชาติชาย สุข',  'เปิ้ล',  'เขียว',  101),
  ('ภัทรา ดี',     'แนน',    'เหลือง',  77),
  ('วรรณา ลา',     'ติ๊ก',   'แดง',    95),
  ('จิรัฐ แก้ว',   'นัท',    'น้ำเงิน',  83);
