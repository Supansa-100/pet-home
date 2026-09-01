# Phase 0 — ตั้งค่าโปรเจกต์และโครงสร้างพื้นฐาน
# (Project Setup & Infrastructure)

> โปรเจกต์: PET-HOME | ระยะเวลา: 1–2 วัน

---

## เป้าหมายของ Phase นี้

ตั้งค่าโครงสร้างโปรเจกต์ทั้งหมดให้พร้อมก่อนเริ่มเขียนโค้ดจริง ได้แก่:
- โครงสร้างโฟลเดอร์
- Docker สำหรับ Development
- ตั้งค่าเบื้องต้น Frontend และ Backend
- ไฟล์ Config และ Environment Variables
- เตรียม Git Repository

---

## ขั้นตอนที่ 0.1 — สร้างโครงสร้างโฟลเดอร์

### โครงสร้างที่ต้องสร้าง

```
pet-home/                          ← root ของโปรเจกต์
│
├── frontend/                      ← React 18 + Vite 5 + MUI 5
│   ├── src/
│   │   ├── components/            ← UI Components ที่ใช้ซ้ำได้
│   │   ├── pages/                 ← หน้าจอแต่ละหน้า
│   │   ├── hooks/                 ← Custom React Hooks
│   │   ├── services/              ← ฟังก์ชันเรียก API (axios)
│   │   ├── contexts/              ← React Context (เช่น AuthContext)
│   │   ├── utils/                 ← ฟังก์ชันช่วยเหลือ
│   │   └── theme/                 ← ธีม MUI
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                       ← Node.js 20 + Express 4
│   ├── src/
│   │   ├── config/                ← ตั้งค่า DB, environment
│   │   ├── controllers/           ← จัดการ logic ของแต่ละ route
│   │   ├── middlewares/           ← auth, error handler, upload
│   │   ├── models/                ← query ฐานข้อมูล
│   │   ├── routes/                ← Express Router
│   │   └── utils/                 ← ฟังก์ชันช่วยเหลือ
│   ├── uploads/                   ← เก็บรูปภาพที่อัปโหลด (dev)
│   ├── app.js                     ← ตั้งค่า Express app
│   ├── server.js                  ← จุดเริ่มต้น server
│   └── package.json
│
├── db/
│   └── init/
│       └── 01-init.sql            ← SQL สร้าง database + tables
│
├── docs/
│   └── planning/                  ← เอกสาร Planning ทั้งหมด
│
├── .agents/
│   └── skills/
│       └── pethome-dev/
│           └── SKILL.md           ← คู่มือ AI สำหรับโปรเจกต์นี้
│
├── Dockerfile                     ← Multi-stage build (Production)
├── docker-compose.yml             ← Development environment เท่านั้น
├── .env                           ← ค่า config จริง (ห้าม commit!)
├── .env.example                   ← ตัวอย่าง key ทั้งหมด (commit ได้)
├── .gitignore
└── README.md
```

---

## ขั้นตอนที่ 0.2 — ตั้งค่า Docker Compose (Development)

### ไฟล์: `docker-compose.yml`

**Services ที่ต้องมี 4 ตัว:**

| Service | Image | Port (Host→Container) | หน้าที่ |
|---|---|---|---|
| `frontend` | node:20-alpine | 5173 → 5173 | React + Vite dev server |
| `backend` | node:20-alpine | 5001 → 5001 | Express API + nodemon |
| `db` | mysql:8 | 3307 → 3306 | ฐานข้อมูล MySQL 8 |
| `phpmyadmin` | phpmyadmin | 8081 → 80 | จัดการ DB ผ่าน UI |

**กฎสำคัญที่ต้องทำตาม:**

| กฎ | รายละเอียด |
|---|---|
| ❌ ห้ามใส่ `version:` | Docker Compose รุ่นใหม่ไม่ใช้แล้ว |
| ✅ Network เดียวกัน | ทุก service อยู่ใน custom bridge network ชื่อ `pethome-network` |
| ✅ ติดต่อ DB ผ่าน service name | backend และ phpmyadmin ใช้ `db:3306` ไม่ใช่ `localhost:3307` |
| ✅ Bind mount | โค้ด frontend/backend mount จาก host → container (Hot Reload ได้) |
| ✅ Anonymous volume สำหรับ node_modules | ป้องกัน host ทับ container และปัญหา architecture |
| ✅ MySQL healthcheck | backend ต้องรอ DB พร้อมก่อนด้วย `depends_on: condition: service_healthy` |
| ⚠️ Apple Silicon | หาก phpmyadmin ไม่ทำงานบน M1/M2/M3/M4 ให้เพิ่ม `platform: linux/amd64` |

---

## ขั้นตอนที่ 0.3 — ตั้งค่า Frontend (React + Vite + MUI)

### สิ่งที่ต้องทำ

**1. สร้างโปรเจกต์ Vite:**
```
สร้างด้วย template: react
ติดตั้ง dependencies:
  - @mui/material
  - @mui/icons-material
  - @emotion/react
  - @emotion/styled
  - react-router-dom
  - axios
```

**2. ตั้งค่า `vite.config.js`:**
- กำหนด port: `5173`
- ตั้งค่า proxy: คำขอที่ขึ้นต้นด้วย `/api` ให้ส่งต่อไปยัง `http://backend:5001`
- เปิดใช้งาน Hot Module Replacement (HMR)

**3. โครงสร้าง `src/` ที่ต้องสร้าง:**

```
src/
├── components/
│   └── .gitkeep          ← สร้างโฟลเดอร์ว่างไว้ก่อน
├── pages/
│   └── .gitkeep
├── hooks/
│   └── .gitkeep
├── services/
│   └── api.js            ← ตั้งค่า axios instance เบื้องต้น
├── contexts/
│   └── .gitkeep
├── utils/
│   └── .gitkeep
├── theme/
│   └── theme.js          ← ตั้งค่าธีม MUI เบื้องต้น
├── App.jsx               ← App component หลัก
└── main.jsx              ← จุดเริ่มต้น React
```

**4. ตั้งค่าธีม MUI เบื้องต้น (`theme/theme.js`):**
- กำหนดสีหลัก (primary color)
- กำหนดสีรอง (secondary color)
- กำหนด typography (font family)

---

## ขั้นตอนที่ 0.4 — ตั้งค่า Backend (Node.js + Express)

### สิ่งที่ต้องทำ

**1. สร้าง `package.json` และติดตั้ง dependencies:**

```
dependencies (ใช้งานจริง):
  - express          ← Web framework
  - mysql2           ← MySQL driver พร้อม Promise support
  - dotenv           ← โหลด .env
  - cors             ← จัดการ Cross-Origin
  - helmet           ← Security headers
  - bcryptjs         ← Hash password
  - jsonwebtoken     ← สร้าง/ตรวจสอบ JWT
  - multer           ← จัดการ file upload

devDependencies:
  - nodemon          ← Auto-restart เมื่อโค้ดเปลี่ยน
```

**2. สร้างไฟล์หลัก:**

**`app.js`** — ตั้งค่า Express:
- ใช้ `cors()`, `helmet()`, `express.json()`, `express.urlencoded()`
- Mount route `/health`
- Mount global error handler (ไว้ท้ายสุด)
- Mount 404 handler

**`server.js`** — จุดเริ่มต้น:
- โหลด `.env` ด้วย `dotenv`
- เชื่อมต่อฐานข้อมูล
- เริ่ม Express server บน port 5001

**3. สร้างไฟล์ใน `src/config/`:**
- `db.js` — สร้าง MySQL connection pool ผ่าน `mysql2/promise`
- `env.js` — Export ค่า environment variables ทั้งหมด

**4. สร้าง Middleware พื้นฐาน:**
- `middlewares/errorHandler.js` — จับ error ทั้งหมดและส่ง JSON response
- `middlewares/notFound.js` — ตอบ 404 เมื่อ route ไม่ตรง

**5. สร้าง Route `/health`:**
- ตรวจสอบว่า server ทำงาน
- ตรวจสอบว่า DB เชื่อมต่อได้
- ตอบกลับ: `{ status: "ok", db: "connected" }`

---

## ขั้นตอนที่ 0.5 — สร้าง Database Init Script

### ไฟล์: `db/init/01-init.sql`

**สิ่งที่ต้องมีในไฟล์นี้:**

1. สร้าง Database `pethome_db`
2. กำหนด charset และ collation รองรับภาษาไทย:
   - `charset: utf8mb4`
   - `collation: utf8mb4_unicode_ci`
3. USE `pethome_db`

> **หมายเหตุ:** Phase 0 สร้างแค่ Database เปล่าก่อน  
> Tables จะสร้างใน **Phase 1**

---

## ขั้นตอนที่ 0.6 — ตั้งค่า Dockerfile (Production)

### ไฟล์: `Dockerfile`

**แนวคิด Multi-stage Build:**

```
Stage 1: สร้าง Frontend
  - ใช้ node:20-alpine
  - copy โค้ด frontend
  - npm install
  - npm run build
  - ผลลัพธ์: โฟลเดอร์ dist/

Stage 2: Production Server
  - ใช้ node:20-alpine
  - copy โค้ด backend
  - npm install --production (ไม่ติดตั้ง devDependencies)
  - copy dist/ จาก Stage 1 → backend/public/
  - backend serve static files จาก public/
  - EXPOSE port (Railway กำหนดให้อัตโนมัติ)
  - CMD: node src/server.js
```

**ข้อดีของวิธีนี้:**
- Image production มีขนาดเล็ก
- ไม่ต้องใช้ Nginx แยก (Railway จัดการ SSL/domain เอง)
- Deploy ด้วย container เดียว

---

## ขั้นตอนที่ 0.7 — ตั้งค่า Git และ Environment Variables

### ไฟล์: `.gitignore`

ต้องครอบคลุมอย่างน้อย:
```
.env
node_modules/
dist/
*.log
.DS_Store
uploads/
```

### ไฟล์: `.env.example`

ตัวอย่าง key ที่ต้องมี (ใช้ placeholder เท่านั้น):
```
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=pethome_db
DB_USER=pethome_user
DB_PASSWORD=your_password_here
DB_ROOT_PASSWORD=your_root_password_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# phpMyAdmin
PMA_HOST=db
```

### ไฟล์: `.env` (สร้างเองในเครื่อง ห้าม commit!)

Copy จาก `.env.example` แล้วใส่ค่าจริง

---

## Acceptance Criteria (เกณฑ์ผ่าน Phase 0)

ต้องผ่านทุกข้อก่อนไป Phase 1:

- [ ] รัน `docker-compose up` แล้วไม่มี error
- [ ] **Frontend** — เข้า `http://localhost:5173` ได้ เห็นหน้าเว็บ React
- [ ] **Backend** — `GET http://localhost:5001/health` ตอบกลับ `{ status: "ok", db: "connected" }`
- [ ] **phpMyAdmin** — เข้า `http://localhost:8081` ได้ และเห็น database `pethome_db`
- [ ] **MySQL** — backend เชื่อมต่อได้ผ่าน service name `db:3306`
- [ ] **Hot Reload** — แก้ไขโค้ด frontend/backend แล้ว auto-reload โดยไม่ต้อง restart container
- [ ] ไฟล์ `.env` ไม่ถูก track โดย git (`git status` ไม่เห็น `.env`)
- [ ] โครงสร้างโฟลเดอร์ตรงตามแผน

---

## คำสั่งที่ใช้ใน Phase นี้

```bash
# เริ่มต้น services ทั้งหมด
docker-compose up

# เริ่มแบบ background
docker-compose up -d

# หยุดทุก service
docker-compose down

# หยุดและลบ volume (รีเซ็ต DB)
docker-compose down -v

# ดู log ของ service ที่ต้องการ
docker-compose logs backend
docker-compose logs db

# Rebuild เมื่อเพิ่ม package ใหม่
docker-compose up --build

# ตรวจสอบ .env ไม่ถูก track
git status
git check-ignore -v .env
```

---

## Git Commit Message (หลังจบ Phase 0)

```
feat: complete phase 0 — project setup and docker infrastructure
```

**สิ่งที่ commit:**
- โครงสร้างโฟลเดอร์
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`
- `.gitignore`
- `db/init/01-init.sql`
- `backend/package.json` + ไฟล์เริ่มต้น
- `frontend/package.json` + ไฟล์เริ่มต้น

**สิ่งที่ไม่ commit:**
- `.env` (เด็ดขาด)
- `node_modules/`
- `dist/`
- `uploads/`

---

## ขั้นตอนถัดไป

หลังผ่าน Phase 0 ทุก Acceptance Criteria → เริ่ม **Phase 1: Database Design & Backend Foundation**

> อ้างอิง: `imprementtation.md` | `planing.md` | `Overview.md`
