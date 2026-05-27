# 🏆 ScoreBoard — ระบบสะสมคะแนนกิจกรรม

เว็บแอปสำหรับบันทึกและแสดงผลคะแนนกิจกรรมเด็กๆ แบบ Real-time  
สร้างด้วย **Next.js 14** + **Supabase** + **Tailwind CSS**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwind-css)

---

## ✨ ฟีเจอร์

| หน้า | สิทธิ์ | รายละเอียด |
|------|--------|------------|
| `/login` | ทุกคน | เข้าสู่ระบบด้วย email/password |
| `/score` | Admin, Super Admin | กดให้คะแนนรายคน หรือทั้งกลุ่มพร้อมกัน |
| `/admin` | Super Admin เท่านั้น | เพิ่ม/ลบ/แก้ไขนักเรียน, ดู log |
| `/leaderboard` | ทุกคน (ไม่ต้อง login) | อันดับคะแนน Real-time สำหรับจอโปรเจกเตอร์ |

---

## 🚀 วิธีติดตั้งและใช้งาน

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/your-username/scoreboard.git
cd scoreboard
npm install
```

### 2. ตั้งค่า Supabase

1. ไปที่ [supabase.com](https://supabase.com) → สร้าง Project ใหม่
2. ไปที่ **SQL Editor** → วางโค้ดจากไฟล์ `supabase/migrations/001_init.sql` แล้วกด **Run**
3. ไปที่ **Project Settings → API** → คัดลอก `Project URL` และ `anon public key`

### 3. ตั้งค่า Environment Variables

```bash
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. สร้าง Admin User

ไปที่ Supabase Dashboard → **Authentication → Users → Invite user**  
หรือใช้ SQL:

```sql
-- สร้าง Super Admin (ทำหลังจาก signup แล้ว)
update public.profiles
set role = 'super_admin', name = 'ชื่อของคุณ'
where email = 'your@email.com';
```

### 5. รันในเครื่อง

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy บน Vercel (ฟรี)

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → **New Project** → เลือก repo นี้
3. เพิ่ม Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. กด **Deploy** — เสร็จ!

---

## 🗂️ โครงสร้างโปรเจกต์

```
scoreboard/
├── src/
│   ├── app/
│   │   ├── admin/          # Super Admin — จัดการนักเรียน
│   │   │   ├── page.tsx
│   │   │   └── AdminClient.tsx
│   │   ├── score/          # Admin — ให้คะแนน
│   │   │   ├── page.tsx
│   │   │   └── ScoreClient.tsx
│   │   ├── leaderboard/    # Public — อันดับคะแนน Realtime
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx        # redirect อัตโนมัติ
│   │   └── globals.css
│   ├── components/
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── supabase-client.ts   # Browser client
│   │   ├── supabase-server.ts   # Server client (RSC)
│   │   └── types.ts
│   └── middleware.ts            # ป้องกัน route ที่ต้อง login
├── supabase/
│   └── migrations/
│       └── 001_init.sql         # Schema + RLS + ข้อมูลตัวอย่าง
├── .env.local.example
└── README.md
```

---

## 🗄️ Database Schema

```sql
profiles     — ข้อมูล admin (id, email, name, role)
students     — ข้อมูลนักเรียน (id, name, nickname, group_name, score)
score_logs   — ประวัติการให้คะแนน (student_id, admin_id, delta, activity)
```

Realtime เปิดใช้งานบน `students` และ `score_logs` อัตโนมัติ

---

## 📱 Mobile-First

หน้า `/score` ออกแบบมาสำหรับมือถือโดยเฉพาะ — ปุ่มใหญ่ กดง่าย  
หน้า `/leaderboard` ออกแบบสำหรับจอโปรเจกเตอร์ — dark mode, ตัวใหญ่, อัปเดตอัตโนมัติ
