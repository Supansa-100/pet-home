# PET-HOME — แพลตฟอร์มหาบ้านให้สัตว์เลี้ยง

## ฟีเจอร์หลัก
- 📋 ลงประกาศสัตว์เลี้ยงพร้อมรูปภาพ
- 🔍 ค้นหาและกรองสัตว์เลี้ยงตามชนิด, สายพันธุ์, พื้นที่
- 📨 ส่งคำขอรับอุปการะ + ติดตามสถานะ
- 💬 **ระบบสนทนาแชท** ระหว่างเจ้าของและผู้รับเลี้ยง (HTTP Polling)
- 🛡️ Admin Panel ดูแลความเรียบร้อยของแพลตฟอร์ม

## Tech Stack
- **Frontend:** React 18 + Vite 5 + MUI 5 (port 5173)
- **Backend:** Node.js 20 + Express 4 (port 5001)
- **Database:** MySQL 8 (port 3308)
- **Dev Tool:** Docker Compose + phpMyAdmin (port 8081)
- **Deploy:** Railway (single-container, multi-stage Dockerfile)

## เริ่มต้น Development

```bash
# 1. Copy ไฟล์ environment
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ

# 2. รัน Docker
docker-compose up

# 3. เข้าใช้งาน
# Frontend:    http://localhost:5173
# Backend API: http://localhost:5001
# phpMyAdmin:  http://localhost:8081
```

## คำสั่งที่ใช้บ่อย

```bash
# รันแบบ background
docker-compose up -d

# หยุดทุก service
docker-compose down

# รีเซ็ต database
docker-compose down -v

# Rebuild หลังเพิ่ม package
docker-compose up --build

# ดู log
docker-compose logs backend
docker-compose logs db
```

## การนำขึ้นใช้งานจริง (Deployment)

ระบบถูกแพ็กเป็น **Single Container** — Express เสิร์ฟทั้งหน้าเว็บ React และ API
จากพอร์ตเดียวกัน (`/api/*` คือ API ส่วน path อื่นคืนหน้าเว็บ) จึงไม่ต้องตั้งค่า CORS
หรือแยกโดเมนระหว่าง frontend กับ backend

> **อยากแยก deploy คนละที่?** ดู [คู่มือ TiDB Cloud + Render + Vercel](docs/deployment-vercel-render-tidb.md)
> ซึ่งใช้บริการฟรีทั้งหมด (เลือกทำอย่างใดอย่างหนึ่ง ไม่ต้องทำทั้งสองแบบ)

### ตัวเลือก A: Railway (แนะนำ)

1. Push โค้ดขึ้น GitHub แล้วสร้าง Project ใหม่ใน Railway ชี้มาที่ repo นี้
   (Railway จะอ่าน `railway.toml` และ build จาก `Dockerfile` ให้อัตโนมัติ)
2. เพิ่ม **MySQL** เข้าไปใน Project เดียวกัน
3. ตั้งค่า Environment Variables ในหน้า Railway:

   | ตัวแปร | ค่า |
   | :--- | :--- |
   | `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | อ้างอิงจาก MySQL service ที่เพิ่มไว้ |
   | `DB_SSL` | `true` (ถ้า MySQL ต้องการ SSL) |
   | `JWT_SECRET` | สุ่มค่าที่เดายาก **ห้ามใช้ค่าตัวอย่าง** |
   | `FRONTEND_URL` | URL จริงที่ Railway ออกให้ (ใช้ประกอบลิงก์ในอีเมล) |
   | `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | ถ้าไม่ตั้ง ระบบอีเมลจะทำงานแบบ mock เขียนลง log แทน |

4. Deploy — ตอนสตาร์ทครั้งแรก backend จะรันสคริปต์ใน `backend/db/init/` สร้างตารางให้เอง
5. ตรวจสุขภาพระบบที่ `https://<your-domain>/health`

### ตัวเลือก B: VPS / เครื่องตัวเอง (Docker Compose)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

ต้องมี `.env` ที่กำหนด `DB_ROOT_PASSWORD`, `DB_USER`, `DB_PASSWORD` และ `JWT_SECRET`
(ถ้าขาดตัวใดตัวหนึ่ง compose จะเตือนและหยุดทันที) จากนั้นเข้าใช้งานที่ http://localhost:5001

### ข้อควรระวังก่อนขึ้น Production

- เปลี่ยน `JWT_SECRET` และรหัสผ่านฐานข้อมูลเป็นค่าจริง อย่าใช้ค่าจาก `.env.example`
- เปลี่ยนรหัสผ่านบัญชี `admin@pethome.com` (ค่าเริ่มต้นคือ `password123`)
- ไฟล์ seed ข้อมูลตัวอย่าง (`03-seed-mock-data.sql`, `06-seed-20-posters.sql`)
  จะถูกรันด้วย หากไม่ต้องการข้อมูลจำลองบน production ให้ย้ายออกจาก `backend/db/init/` ก่อน build

## โครงสร้างโปรเจกต์
```
pet-home/
├── frontend/     React + Vite + MUI
├── backend/      Node.js + Express
├── db/init/      SQL init scripts
├── docs/         เอกสาร Planning
└── .agents/      SKILL.md สำหรับ AI
```
