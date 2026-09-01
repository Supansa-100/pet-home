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
- **Database:** MySQL 8 (port 3307)
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

## โครงสร้างโปรเจกต์
```
pet-home/
├── frontend/     React + Vite + MUI
├── backend/      Node.js + Express
├── db/init/      SQL init scripts
├── docs/         เอกสาร Planning
└── .agents/      SKILL.md สำหรับ AI
```
