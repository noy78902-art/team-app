# ทีม Creative — Workspace

เว็บแอปสำหรับทีม 3-4 คน: แชท จัดการงาน ปฏิทิน routine ประจำวัน บันทึกวันลา และสรุปแจ้งเตือนสำหรับ Line

## สิ่งที่มีในแอป

- **แชท** — คุยกันแบบ real-time (ทุกคนเห็นข้อความใหม่ทันที)
- **งาน** — เพิ่ม/แก้ไข/ลบงาน มอบหมายคน กำหนดวันครบ ทำเครื่องหมายงานด่วน
- **ปฏิทิน** — ดูวันลาและ routine ของทีมแต่ละวัน
- **Routine** — บันทึกกิจวัตรประจำวันของทีม (เช่น standup, ส่งรายงาน)
- **ลางาน** — บันทึกวันลาของสมาชิก แสดงผลในปฏิทินและแถบทีม
- **แจ้ง Line** — สร้างข้อความสรุป (งานด่วน / สรุปเช้า / สรุปเย็น) พร้อม copy ไป paste ใน Line group
- **AI ผู้ช่วย** — ถาม Claude เกี่ยวกับสถานะงาน วันลา routine ของทีม (ต้องใส่ Anthropic API key)

ข้อมูลทั้งหมดเก็บใน Supabase (ฐานข้อมูลจริง) — ทุกคนในทีมเห็นข้อมูลเดียวกัน

---

## วิธีรันบนเครื่อง (ทดสอบก่อน deploy)

ต้องมี Node.js ติดตั้งไว้ก่อน (เวอร์ชัน 18 ขึ้นไป) ดาวน์โหลดได้ที่ nodejs.org

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ลิงก์ที่แสดง (ปกติคือ http://localhost:5173)

---

## การตั้งค่า Supabase (ทำไปแล้วถ้าทำตามขั้นตอนกับ Claude)

ไฟล์ .env มี:
```
VITE_SUPABASE_URL=https://รหัสโปรเจกต์ของคุณ.supabase.co
VITE_SUPABASE_ANON_KEY=คีย์ publishable ของคุณ
```

ถ้ายังไม่ได้สร้างตาราง ให้รัน SQL ที่ Claude ให้ไว้ใน Supabase SQL Editor

---

## วิธี Deploy ขึ้นเว็บจริง (แนะนำ Vercel — ฟรี)

### ขั้นตอนที่ 1: สร้าง GitHub repository

1. ไปที่ github.com สมัคร/login
2. กด "New repository" ตั้งชื่อ เช่น team-app
3. อัปโหลดโค้ดทั้งหมดในโฟลเดอร์นี้ขึ้น repository (ใช้ GitHub Desktop หรือคำสั่ง git)

### ขั้นตอนที่ 2: Deploy ผ่าน Vercel

1. ไปที่ vercel.com สมัครด้วยบัญชี GitHub
2. กด "Add New" -> "Project"
3. เลือก repository team-app ที่สร้างไว้
4. ในหน้า Environment Variables ใส่:
   - VITE_SUPABASE_URL = URL โปรเจกต์ Supabase ของคุณ
   - VITE_SUPABASE_ANON_KEY = publishable key ของคุณ
5. กด "Deploy"

รอ 1-2 นาที จะได้ URL เว็บแอป (เช่น team-app.vercel.app) ที่ทุกคนในทีมเปิดได้

### ขั้นตอนที่ 3: แชร์ลิงก์ให้ทีม

ส่งลิงก์ที่ได้ให้สมาชิกทีมทุกคน เปิดครั้งแรกจะให้เลือกว่าตัวเองคือใคร (เลือกชื่อตัวเอง) — ระบบจะจดจำไว้ในเบราว์เซอร์

---

## ใช้ AI ผู้ช่วย

ต้องมี API key จาก console.anthropic.com (สร้างบัญชี -> API Keys -> Create Key)

ใส่ key ใน panel "AI ผู้ช่วย" ครั้งแรกที่ใช้งาน — key จะถูกเก็บไว้ในเบราว์เซอร์ของผู้ใช้แต่ละคนเท่านั้น (ไม่ส่งไปไหน) แต่ละคนต้องใส่ key ของตัวเอง หรือใช้ key เดียวกันก็ได้ถ้าทีมตกลงกัน

หมายเหตุ: API key มีค่าใช้จ่ายตามการใช้งานจริง (pay-as-you-go) ปริมาณการใช้งานของทีมเล็กจะมีค่าใช้จ่ายต่ำมาก

---

## โครงสร้างไฟล์

```
src/
  App.jsx          — หน้าหลัก, navigation, เลือกผู้ใช้
  ChatPanel.jsx    — หน้าแชท
  TasksPanel.jsx   — หน้าจัดการงาน
  CalendarPanel.jsx— หน้าปฏิทิน
  RoutinesPanel.jsx— หน้า routine
  LeavesPanel.jsx  — หน้าบันทึกวันลา
  LinePanel.jsx    — หน้าสร้างข้อความสำหรับ Line
  AIPanel.jsx      — หน้า AI ผู้ช่วย
  dataHooks.js     — เชื่อมต่อ Supabase (database)
  supabaseClient.js— ตั้งค่า Supabase client
```

## การแก้ไขสมาชิกทีม

ไปที่ Supabase -> Table Editor -> ตาราง members เพิ่ม/แก้ไข/ลบสมาชิกได้โดยตรง

ค่า color ที่ใช้ได้: purple, teal, coral, blue
