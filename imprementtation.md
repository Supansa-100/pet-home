# Implementation Plan — PET-HOME
> แพลตฟอร์มหาบ้านให้สัตว์เลี้ยง | Tech Stack: React 18 + Vite 5 + MUI 5 / Node.js 20 + Express 4 / MySQL 8 / Docker / Railway

---

## สรุปภาพรวม Implementation

```
Phase 0  →  Project Setup & Infrastructure
Phase 1  →  Database & Backend Foundation
Phase 2  →  Authentication & User Management
Phase 3  →  Pet Listing (Core Feature)
Phase 4  →  Adoption Request Workflow
Phase 5  →  Chat System (ระบบสนทนา)
Phase 6  →  Admin Panel
Phase 7  →  Search, Filter & UX Polish
Phase 8  →  Testing & Production Deploy
```

---

## Phase 0 — Project Setup & Infrastructure

**เป้าหมาย:** ตั้งค่าโครงสร้างโปรเจกต์ Docker และ Dev Environment ให้พร้อมใช้งาน

**ระยะเวลาโดยประมาณ:** 1–2 วัน

### งานที่ต้องทำ

#### 0.1 สร้าง Folder Structure
```
pet-home/
├── frontend/          # React 18 + Vite 5 + MUI 5
├── backend/           # Node.js 20 + Express 4
├── db/
│   └── init/
│       └── 01-init.sql
├── docs/
│   └── planning/
├── .agents/
│   └── skills/
│       └── pethome-dev/
│           └── SKILL.md
├── Dockerfile         # multi-stage (production)
├── docker-compose.yml # development only
├── .env.example
├── .env               # ห้าม commit
└── .gitignore
```

#### 0.2 ตั้งค่า Docker Compose (Development)
- สร้าง `docker-compose.yml` โดยไม่มี `version` field
- กำหนด 4 services: `frontend`, `backend`, `db`, `phpmyadmin`
- ใช้ custom bridge network ชื่อ `pethome-network`
- กำหนด port mapping ตามแผน
- ตั้งค่า MySQL healthcheck + `depends_on: condition: service_healthy`
- ใช้ bind mounts สำหรับ source code
- ใช้ anonymous volume สำหรับ `node_modules` ทั้ง frontend และ backend

#### 0.3 ตั้งค่า Frontend (React + Vite + MUI)
- สร้างโปรเจกต์ด้วย Vite template react
- ติดตั้ง MUI 5, React Router v6, Axios
- ตั้งค่า Vite `server.port: 5173` + `proxy` ไปยัง backend port 5001
- กำหนด folder structure:
  ```
  frontend/src/
  ├── components/     # Reusable UI components
  ├── pages/          # Page-level components
  ├── hooks/          # Custom React hooks
  ├── services/       # API call functions (axios)
  ├── contexts/       # React Context (Auth)
  ├── utils/          # Helper functions
  └── theme/          # MUI theme config
  ```

#### 0.4 ตั้งค่า Backend (Node.js + Express)
- สร้างโปรเจกต์ Node.js พร้อม `package.json`
- ติดตั้ง: `express`, `mysql2`, `dotenv`, `cors`, `helmet`, `bcryptjs`, `jsonwebtoken`, `multer`
- ติดตั้ง dev: `nodemon`
- กำหนด folder structure:
  ```
  backend/src/
  ├── config/         # db connection, env config
  ├── controllers/    # Route handlers
  ├── middlewares/    # auth, error handler, upload
  ├── models/         # DB query functions
  ├── routes/         # Express routers
  └── utils/          # Helper functions
  ```
- ตั้งค่า `app.js` และ `server.js`

#### 0.5 ตั้งค่า Database Init Script
- สร้าง `db/init/01-init.sql`
- กำหนด charset `utf8mb4` และ collation `utf8mb4_unicode_ci`
- สร้าง Database `pethome_db`

#### 0.6 ตั้งค่า Dockerfile (Production)
- Multi-stage build: stage 1 build frontend, stage 2 setup backend + copy frontend dist
- Backend serve static frontend files
- Expose port เดียวสำหรับ Railway

#### 0.7 ตั้งค่า .gitignore และ .env
- `.gitignore` ครอบคลุม: `.env`, `node_modules/`, `dist/`, `*.log`, `.DS_Store`
- `.env.example` มีทุก key แต่ใช้ placeholder value

### Acceptance Criteria
- [ ] `docker-compose up` รันได้โดยไม่ error
- [ ] Frontend เข้าได้ที่ `http://localhost:5173`
- [ ] Backend response ที่ `http://localhost:5001/health` → `{ status: "ok" }`
- [ ] phpMyAdmin เข้าได้ที่ `http://localhost:8081`
- [ ] MySQL connect ได้จาก backend ผ่าน service name `db`

### Git Commit Message
```
feat: complete phase 0 — project setup and docker infrastructure
```

---

## Phase 1 — Database Design & Backend Foundation

**เป้าหมาย:** ออกแบบ Database Schema ทั้งหมดและสร้าง Backend boilerplate พร้อม DB connection

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 1.1 Database Schema

#### ตาราง `users`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt |
| `full_name` | VARCHAR(255) NOT NULL | |
| `phone` | VARCHAR(20) | |
| `role` | ENUM('poster','adopter','admin') | default: adopter |
| `avatar_url` | VARCHAR(500) | |
| `is_banned` | TINYINT(1) | default: 0 |
| `created_at` | TIMESTAMP | default: NOW() |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() |

#### ตาราง `pet_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `name` | VARCHAR(100) NOT NULL | เช่น สุนัข, แมว, กระต่าย |
| `created_at` | TIMESTAMP | |

#### ตาราง `pet_listings`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `user_id` | INT FK → users.id | เจ้าของ |
| `category_id` | INT FK → pet_categories.id | |
| `name` | VARCHAR(255) NOT NULL | ชื่อสัตว์ |
| `breed` | VARCHAR(255) | สายพันธุ์ |
| `age_years` | INT | อายุ (ปี) |
| `age_months` | INT | อายุ (เดือน) |
| `gender` | ENUM('male','female','unknown') | |
| `size` | ENUM('small','medium','large') | |
| `color` | VARCHAR(100) | |
| `description` | TEXT | รายละเอียด |
| `health_info` | TEXT | ประวัติสุขภาพ, วัคซีน |
| `conditions` | TEXT | เงื่อนไขการรับเลี้ยง |
| `location` | VARCHAR(255) | จังหวัด/พื้นที่ |
| `status` | ENUM('available','pending','adopted','closed') | default: available |
| `is_hidden` | TINYINT(1) | Admin ซ่อน, default: 0 |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

#### ตาราง `pet_images`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `listing_id` | INT FK → pet_listings.id | |
| `image_url` | VARCHAR(500) NOT NULL | |
| `is_primary` | TINYINT(1) | default: 0 |
| `created_at` | TIMESTAMP | |

#### ตาราง `adoption_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `listing_id` | INT FK → pet_listings.id | |
| `adopter_id` | INT FK → users.id | ผู้ขอรับ |
| `message` | TEXT | ข้อความแนะนำตัว |
| `status` | ENUM('pending','approved','rejected','cancelled') | default: pending |
| `reviewed_at` | TIMESTAMP | วันที่พิจารณา |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

#### ตาราง `chat_rooms`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `listing_id` | INT FK → pet_listings.id | ประกาศที่เชื่อมกับห้องแชท |
| `poster_id` | INT FK → users.id | เจ้าของสัตว์เลี้ยง |
| `adopter_id` | INT FK → users.id | ผู้ขอรับอุปการะ |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

#### ตาราง `chat_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `room_id` | INT FK → chat_rooms.id | |
| `sender_id` | INT FK → users.id | |
| `message` | TEXT NOT NULL | ข้อความ |
| `is_read` | TINYINT(1) | default: 0 |
| `created_at` | TIMESTAMP | |

### 1.2 งาน Backend

- สร้าง `config/db.js` — MySQL connection pool ผ่าน `mysql2/promise`
- ตรวจสอบ DB connection เมื่อ server start
- สร้าง `middlewares/errorHandler.js` — global error handler
- สร้าง `middlewares/notFound.js` — 404 handler
- ตั้งค่า `cors`, `helmet`, `express.json()`, `express.urlencoded()`
- สร้าง route `/health` สำหรับ health check
- นำ init SQL ไปสร้าง tables ทั้งหมด
- Seed ข้อมูลเริ่มต้น: pet_categories (สุนัข, แมว, กระต่าย, นก, อื่นๆ), admin user

### Acceptance Criteria
- [ ] Tables ทั้งหมดสร้างได้สำเร็จใน MySQL
- [ ] `GET /health` response `{ status: "ok", db: "connected" }`
- [ ] ดู tables ผ่าน phpMyAdmin ได้
- [ ] Seed data pet_categories และ admin user อยู่ในฐานข้อมูล

### Git Commit Message
```
feat: complete phase 1 — database schema and backend foundation
```

---

## Phase 2 — Authentication & User Management

**เป้าหมาย:** ระบบสมัครสมาชิก, เข้าสู่ระบบ, JWT Auth, Profile management

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 2.1 Backend — Auth APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก | Public |
| POST | `/api/auth/login` | เข้าสู่ระบบ → JWT | Public |
| GET | `/api/auth/me` | ดูข้อมูลตัวเอง | Auth |
| PUT | `/api/auth/profile` | แก้ไข profile | Auth |
| PUT | `/api/auth/change-password` | เปลี่ยน password | Auth |

- ใช้ `bcryptjs` hash password ก่อนบันทึก (saltRounds: 12)
- ใช้ `jsonwebtoken` สร้าง JWT (expire: 7 days)
- สร้าง `middlewares/auth.js` — verify JWT token จาก `Authorization: Bearer <token>`
- สร้าง `middlewares/roles.js` — ตรวจ role (poster, adopter, admin)
- Validation: ตรวจ email format, password length ≥ 8 ตัว, required fields

### 2.2 Frontend — Auth Pages & Context

**หน้าที่ต้องสร้าง:**
- `pages/RegisterPage.jsx` — ฟอร์มสมัครสมาชิก (ชื่อ, email, password, role)
- `pages/LoginPage.jsx` — ฟอร์มเข้าสู่ระบบ
- `pages/ProfilePage.jsx` — ดู/แก้ไข profile ของตนเอง

**Components:**
- `components/auth/RegisterForm.jsx`
- `components/auth/LoginForm.jsx`
- `components/layout/Navbar.jsx` — แสดง user info + logout button

**Context:**
- `contexts/AuthContext.jsx` — เก็บ user state, token ใน localStorage
- Custom hook `useAuth()` สำหรับเข้าถึง auth state

**Routing:**
- Protected Route component — redirect ไป `/login` ถ้ายังไม่ login
- Route guard ตาม role

### Acceptance Criteria
- [ ] สมัครสมาชิกสำเร็จ → เก็บข้อมูลใน DB
- [ ] เข้าสู่ระบบ → ได้รับ JWT token
- [ ] Token หมดอายุหรือผิด → ได้ 401 Unauthorized
- [ ] Protected route redirect ถ้าไม่ login
- [ ] แก้ไข profile สำเร็จ → ข้อมูลอัปเดตใน DB
- [ ] Logout → ล้าง token จาก localStorage

### Git Commit Message
```
feat: complete phase 2 — authentication and user management
```

---

## Phase 3 — Pet Listing (Core Feature)

**เป้าหมาย:** CRUD ประกาศสัตว์เลี้ยง, อัปโหลดรูปภาพ, หน้าแสดงรายการและรายละเอียด

**ระยะเวลาโดยประมาณ:** 3–4 วัน

### 3.1 Backend — Pet Listing APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/listings` | ดูรายการทั้งหมด (available) | Public |
| GET | `/api/listings/:id` | ดูรายละเอียดประกาศ | Public |
| POST | `/api/listings` | สร้างประกาศใหม่ | Poster |
| PUT | `/api/listings/:id` | แก้ไขประกาศ | Owner |
| DELETE | `/api/listings/:id` | ลบประกาศ | Owner/Admin |
| PATCH | `/api/listings/:id/close` | ปิดประกาศ (สัตว์ได้บ้านแล้ว) | Owner |
| GET | `/api/listings/my` | ดูประกาศของตัวเอง | Poster |
| POST | `/api/listings/:id/images` | อัปโหลดรูปภาพ | Owner |
| DELETE | `/api/listings/:id/images/:imgId` | ลบรูปภาพ | Owner |
| GET | `/api/categories` | ดูหมวดหมู่ทั้งหมด | Public |

- ใช้ `multer` จัดการ file upload
- เก็บรูปใน `backend/uploads/` (development) หรือ Railway Volume (production)
- จำกัดจำนวนรูป: สูงสุด 5 รูปต่อประกาศ
- จำกัดขนาดรูป: สูงสุด 5MB ต่อรูป
- รองรับ format: JPG, JPEG, PNG, WEBP

### 3.2 Frontend — Pet Listing Pages

**หน้าที่ต้องสร้าง:**
- `pages/HomePage.jsx` — แสดงประกาศล่าสุด, featured pets
- `pages/ListingsPage.jsx` — รายการประกาศทั้งหมด + pagination
- `pages/ListingDetailPage.jsx` — รายละเอียดสัตว์เลี้ยง + รูปภาพ gallery
- `pages/CreateListingPage.jsx` — ฟอร์มสร้างประกาศ (Poster เท่านั้น)
- `pages/EditListingPage.jsx` — ฟอร์มแก้ไขประกาศ
- `pages/MyListingsPage.jsx` — จัดการประกาศของตัวเอง

**Components:**
- `components/pet/PetCard.jsx` — การ์ดแสดงสัตว์เลี้ยงในรายการ
- `components/pet/PetGrid.jsx` — Grid layout ของ PetCard
- `components/pet/PetImageGallery.jsx` — Slideshow รูปภาพ
- `components/pet/PetForm.jsx` — ฟอร์มสร้าง/แก้ไขประกาศ
- `components/pet/ImageUploader.jsx` — อัปโหลดรูปภาพ drag-and-drop
- `components/ui/StatusChip.jsx` — แสดงสถานะ (Available, Pending, Adopted)
- `components/ui/Pagination.jsx` — Pagination component

### Acceptance Criteria
- [ ] สร้างประกาศสำเร็จ → ข้อมูลอยู่ใน DB
- [ ] อัปโหลดรูปภาพ → รูปปรากฏในหน้ารายละเอียด
- [ ] หน้า Home แสดงประกาศล่าสุด
- [ ] หน้า Listings แสดงรายการ + pagination ทำงาน
- [ ] เจ้าของแก้ไข/ปิดประกาศได้
- [ ] คนอื่นแก้ไขประกาศของคนอื่นไม่ได้ → 403

### Git Commit Message
```
feat: complete phase 3 — pet listing CRUD and image upload
```

---

## Phase 4 — Adoption Request Workflow

**เป้าหมาย:** ระบบส่งคำขอรับอุปการะ, พิจารณาคำขอ, ติดตามสถานะ

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 4.1 Backend — Adoption Request APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/listings/:id/requests` | ส่งคำขอรับอุปการะ | Adopter |
| GET | `/api/requests/my` | ดูคำขอที่ตัวเองส่ง | Adopter |
| GET | `/api/listings/:id/requests` | ดูคำขอทั้งหมดของประกาศ | Owner |
| PATCH | `/api/requests/:id/approve` | อนุมัติคำขอ | Owner |
| PATCH | `/api/requests/:id/reject` | ปฏิเสธคำขอ | Owner |
| PATCH | `/api/requests/:id/cancel` | ยกเลิกคำขอ | Adopter |

**Business Rules:**
- Adopter 1 คน ส่งคำขอได้ 1 คำขอต่อ 1 ประกาศ
- เมื่อ Owner อนุมัติคำขอ → สถานะ listing เปลี่ยนเป็น `adopted` อัตโนมัติ
- เมื่อ listing ถูก `adopted` หรือ `closed` → คำขอที่ pending อื่นๆ ถูก reject อัตโนมัติ
- ตรวจสอบว่า listing ต้องมีสถานะ `available` ก่อนส่งคำขอได้

### 4.2 Frontend — Request Pages

**หน้าที่ต้องสร้าง:**
- `pages/MyRequestsPage.jsx` — Adopter ดูคำขอทั้งหมดที่ส่ง + สถานะ
- `pages/IncomingRequestsPage.jsx` — Poster ดูคำขอที่เข้ามาในแต่ละประกาศ

**Components:**
- `components/request/RequestCard.jsx` — แสดงข้อมูลคำขอ + ปุ่มอนุมัติ/ปฏิเสธ
- `components/request/RequestForm.jsx` — Modal ส่งคำขอ + ช่องเขียนข้อความแนะนำตัว
- `components/request/RequestStatusBadge.jsx` — แสดงสถานะคำขอ

**UI Flow:**
1. Adopter กดปุ่ม "ขอรับอุปการะ" ในหน้า Listing Detail → เปิด Modal
2. กรอกข้อความแนะนำตัว → Submit → สถานะ `pending`
3. Poster เข้าดูรายการคำขอ → กด อนุมัติ / ปฏิเสธ
4. Adopter ดูสถานะคำขอใน "คำขอของฉัน"

### Acceptance Criteria
- [ ] Adopter ส่งคำขอได้ → ข้อมูลอยู่ใน DB
- [ ] ส่งคำขอซ้ำในประกาศเดิม → Error
- [ ] Owner อนุมัติ → listing status → `adopted`, คำขออื่น → `rejected`
- [ ] Adopter ยกเลิกคำขอได้ (ตราบที่ยัง pending)
- [ ] แต่ละฝ่ายเห็นเฉพาะคำขอที่เกี่ยวข้องกับตัวเอง

### Git Commit Message
```
feat: complete phase 4 — adoption request workflow
```

---

## Phase 5 — Chat System (ระบบสนทนา)

**เป้าหมาย:** ระบบสนทนาแชทระหว่างเจ้าของสัตว์เลี้ยงและผู้ต้องการรับอุปการะ หลังจากส่งคำขอรับอุปการะ

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 5.1 Backend — Chat APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/chat/rooms` | ดูรายการห้องแชทของตัวเอง | Auth |
| GET | `/api/chat/rooms/:id` | ดูข้อมูลห้องแชทพร้อมประวัติข้อความ | Participant |
| POST | `/api/chat/rooms/:id/messages` | ส่งข้อความในห้องแชท | Participant |
| PATCH | `/api/chat/rooms/:id/read` | Mark ข้อความทั้งหมดว่าอ่านแล้ว | Participant |

**Business Rules:**
- ห้องแชทถูกสร้างโดยอัตโนมัติเมื่อ Adopter ส่ง Adoption Request (1 Request = 1 Room)
- เฉพาะ `poster_id` และ `adopter_id` ของห้องนั้นเท่านั้นที่เข้าถึงได้ → คนอื่นได้ 403
- ใช้ **HTTP Polling** (ทุก 5 วินาที) แทน WebSocket เพื่อความเรียบง่ายในเวอร์ชันแรก
- ห้องแชทยังเปิดอยู่แม้คำขอจะถูก approved/rejected/cancelled แล้ว (สามารถอ่านประวัติย้อนหลังได้)
- Pagination สำหรับ message list: 50 ข้อความต่อหน้า

### 5.2 Frontend — Chat Pages & Components

**หน้าที่ต้องสร้าง:**
- `pages/ChatListPage.jsx` — รายการห้องแชทของตนเอง + badge แจ้งข้อความที่ยังไม่อ่าน
- `pages/ChatRoomPage.jsx` — ห้องแชทพร้อม message list + input box

**Components:**
- `components/chat/ChatRoomList.jsx` — รายการห้องแชท แสดงชื่อสัตว์เลี้ยง + ผู้สนทนา + ข้อความล่าสุด
- `components/chat/ChatMessage.jsx` — bubble ข้อความแต่ละอัน (ซ้าย = อีกฝ่าย, ขวา = ตัวเอง)
- `components/chat/ChatInput.jsx` — กล่อง input + ปุ่มส่ง (กด Enter หรือคลิก)
- `components/ui/UnreadBadge.jsx` — badge จำนวนข้อความที่ยังไม่อ่าน (ใช้ซ้ำใน Navbar)

**UI Flow:**
1. Adopter ส่งคำขอรับอุปการะ → ห้องแชทถูกสร้างอัตโนมัติ
2. ทั้งสองฝ่ายเห็น "กล่องข้อความ" ใน Navbar
3. เข้าห้องแชท → เห็นประวัติข้อความทั้งหมด → พิมพ์และส่งข้อความได้
4. Polling รีเฟรชทุก 5 วินาทีเพื่อดึงข้อความใหม่

**Routing:**
- `/chat` — หน้ารายการห้องแชท
- `/chat/:roomId` — หน้าห้องแชทเฉพาะ

### Acceptance Criteria
- [ ] Adopter ส่งคำขอ → ห้องแชทถูกสร้างโดยอัตโนมัติใน DB
- [ ] ทั้งสองฝ่ายส่งข้อความถึงกันได้
- [ ] ประวัติข้อความปรากฏเมื่อเข้าห้องแชท
- [ ] Polling รีเฟรชข้อความใหม่ทุก 5 วินาที
- [ ] คนนอกห้องแชทเข้าไม่ได้ (403)
- [ ] Badge แสดงจำนวนข้อความที่ยังไม่ได้อ่านใน Navbar
- [ ] Mark อ่านแล้วเมื่อเปิดห้องแชท

### Git Commit Message
```
feat: complete phase 5 — chat system
```

---

## Phase 6 — Admin Panel

**เป้าหมาย:** หน้า Admin สำหรับจัดการผู้ใช้งาน, ตรวจสอบโพสต์, ดู Dashboard

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 5.1 Backend — Admin APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/users` | ดูรายชื่อผู้ใช้ทั้งหมด | Admin |
| PATCH | `/api/admin/users/:id/ban` | แบนผู้ใช้ | Admin |
| PATCH | `/api/admin/users/:id/unban` | ปลดแบน | Admin |
| GET | `/api/admin/listings` | ดูประกาศทั้งหมด (รวมที่ซ่อน) | Admin |
| PATCH | `/api/admin/listings/:id/hide` | ซ่อนประกาศ | Admin |
| PATCH | `/api/admin/listings/:id/show` | แสดงประกาศ | Admin |
| DELETE | `/api/admin/listings/:id` | ลบประกาศ | Admin |
| GET | `/api/admin/categories` | จัดการหมวดหมู่ | Admin |
| POST | `/api/admin/categories` | เพิ่มหมวดหมู่ | Admin |
| DELETE | `/api/admin/categories/:id` | ลบหมวดหมู่ | Admin |
| GET | `/api/admin/stats` | ข้อมูลสถิติ | Admin |

### 5.2 Frontend — Admin Pages

**หน้าที่ต้องสร้าง:**
- `pages/admin/AdminDashboardPage.jsx` — สถิติภาพรวม
- `pages/admin/AdminUsersPage.jsx` — จัดการผู้ใช้งาน
- `pages/admin/AdminListingsPage.jsx` — ตรวจสอบประกาศ
- `pages/admin/AdminCategoriesPage.jsx` — จัดการหมวดหมู่

**Components:**
- `components/admin/AdminLayout.jsx` — Layout พร้อม Sidebar
- `components/admin/StatsCard.jsx` — การ์ดแสดงตัวเลขสถิติ
- `components/admin/DataTable.jsx` — ตารางข้อมูล + action buttons

**Dashboard Stats ที่ต้องแสดง:**
- จำนวนผู้ใช้งานทั้งหมด / แยกตาม role
- จำนวนประกาศทั้งหมด / แยกตาม status
- จำนวนคำขอรับอุปการะทั้งหมด / แยกตาม status
- ประกาศใหม่ในช่วง 7 วันล่าสุด

### Acceptance Criteria
- [ ] Admin เห็นรายชื่อผู้ใช้ทั้งหมด
- [ ] Admin แบน/ปลดแบนผู้ใช้ได้ → ผู้ถูกแบน login ไม่ได้
- [ ] Admin ซ่อน/แสดง/ลบประกาศได้
- [ ] Non-admin เข้าหน้า admin → redirect หรือ 403
- [ ] Dashboard แสดงสถิติถูกต้อง

### Git Commit Message
```
feat: complete phase 5 — admin panel and dashboard
```

---

## Phase 7 — Search, Filter & UX Polish

**เป้าหมาย:** ระบบค้นหาและกรองสัตว์เลี้ยง, ปรับปรุง UX ให้สมบูรณ์

**ระยะเวลาโดยประมาณ:** 2 วัน

### 7.1 Backend — Search & Filter

- เพิ่ม query parameters ให้ `GET /api/listings`:
  - `category` — กรองตามหมวดหมู่
  - `gender` — เพศ (male, female, unknown)
  - `size` — ขนาด (small, medium, large)
  - `location` — จังหวัด/พื้นที่ (LIKE search)
  - `keyword` — ค้นหาในชื่อ, สายพันธุ์, รายละเอียด
  - `page` + `limit` — pagination
  - `sort` — เรียงตาม (newest, oldest)

### 7.2 Frontend — Search & Filter UI

**Components:**
- `components/search/SearchBar.jsx` — ช่องค้นหาหลัก
- `components/search/FilterPanel.jsx` — Sidebar filter (category, gender, size, location)
- `components/search/ActiveFilters.jsx` — แสดง filter ที่ใช้งานอยู่ + ปุ่มล้าง
- `components/ui/EmptyState.jsx` — แสดงเมื่อไม่พบผลลัพธ์

### 7.3 UX Improvements

- Loading skeleton สำหรับ PetCard ขณะโหลดข้อมูล
- Error boundary + friendly error messages
- Toast notifications (success/error) ด้วย MUI Snackbar
- Confirmation dialog ก่อนลบ/ปิดประกาศ
- Responsive design — mobile-friendly
- Image lazy loading
- Form validation with inline error messages

### Acceptance Criteria
- [ ] ค้นหาด้วย keyword ได้ผลลัพธ์ถูกต้อง
- [ ] กรองด้วย category, gender, size, location ทำงานได้
- [ ] ใช้ filter หลายอย่างพร้อมกันได้
- [ ] ล้าง filter ทั้งหมดได้ด้วยคลิกเดียว
- [ ] หน้าจอ mobile ใช้งานได้ไม่ติด
- [ ] Loading state แสดงระหว่างรอข้อมูล

### Git Commit Message
```
feat: complete phase 7 — search filter and ux improvements
```

---

## Phase 8 — Testing & Production Deploy

**เป้าหมาย:** ทดสอบระบบ, เตรียม Production build, Deploy บน Railway

**ระยะเวลาโดยประมาณ:** 2–3 วัน

### 7.1 Testing Checklist

**Backend API Testing (ใช้ Postman หรือ Thunder Client):**
- [ ] Auth flow: register → login → access protected route → logout
- [ ] Listing CRUD ทุก endpoint
- [ ] Upload รูปภาพ
- [ ] Adoption request workflow ครบทุก status
- [ ] Admin endpoints ทำงานถูกต้อง
- [ ] Permission enforcement (role-based)

**Frontend E2E Flow Testing:**
- [ ] สมัครสมาชิก → เข้าสู่ระบบ
- [ ] สร้างประกาศ + อัปโหลดรูป
- [ ] ค้นหาและกรองสัตว์เลี้ยง
- [ ] ส่งคำขอรับอุปการะ → ห้องแชทถูกสร้างอัตโนมัติ
- [ ] ทดสอบการส่ง-รับข้อความแชทระหว่างสองฝ่าย
- [ ] ทดสอบว่าคนนอกเข้าห้องแชทไม่ได้ (403)
- [ ] เจ้าของอนุมัติคำขอ → listing status เปลี่ยน
- [ ] Admin จัดการผู้ใช้และโพสต์
- [ ] ทดสอบบน mobile browser

### 7.2 Production Build

**Dockerfile multi-stage:**
```
Stage 1 (build-frontend):
  - node:20-alpine
  - copy frontend/
  - npm install + npm run build
  - output: frontend/dist/

Stage 2 (production):
  - node:20-alpine
  - copy backend/
  - npm install --production
  - copy dist จาก Stage 1 → backend/public/
  - EXPOSE port (Railway จะกำหนด)
  - CMD: node src/server.js
```

### 7.3 Railway Deploy

- สร้าง Railway project → เชื่อมกับ GitHub repo
- เพิ่ม MySQL service (Railway MySQL plugin)
- กำหนด Environment Variables ใน Railway:
  - `NODE_ENV=production`
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET`
  - `PORT` (Railway จัดการให้อัตโนมัติ)
- ตั้งค่า Railway Volume สำหรับ uploads (ถ้ามี)
- ทดสอบ Production URL

### 7.4 Post-Deploy Checklist
- [ ] Production URL เข้าได้
- [ ] Database connect ได้จาก production backend
- [ ] รูปภาพแสดงผลได้
- [ ] SSL ทำงาน (Railway จัดการให้)
- [ ] ทดสอบ user flow หลักบน Production

### Git Commit Message
```
feat: complete phase 7 — testing and production deployment
chore: add multi-stage dockerfile for production
```

---

## สรุปตาราง Phases

| Phase | ชื่อ | ระยะเวลา | ไฟล์หลักที่สร้าง |
|---|---|---|---|
| **0** | Project Setup & Infrastructure | 1–2 วัน | `docker-compose.yml`, `Dockerfile`, `.env.example` |
| **1** | Database & Backend Foundation | 2–3 วัน | `01-init.sql`, `config/db.js`, route `/health` |
| **2** | Authentication & User Management | 2–3 วัน | Auth routes, JWT middleware, Login/Register pages |
| **3** | Pet Listing (Core Feature) | 3–4 วัน | Listing routes, image upload, Listing pages |
| **4** | Adoption Request Workflow | 2–3 วัน | Request routes, Request pages, status flow |
| **5** | Chat System (ระบบสนทนา) | 2–3 วัน | Chat routes, `chat_rooms`, `chat_messages`, Chat pages |
| **6** | Admin Panel | 2–3 วัน | Admin routes, Admin pages, Dashboard |
| **7** | Search, Filter & UX Polish | 2 วัน | Search/Filter API params, Filter UI, UX |
| **8** | Testing & Production Deploy | 2–3 วัน | Test checklist, Dockerfile, Railway deploy |
| **รวม** | | **18–26 วัน** | |

---

## กฎการ Implementation (ห้ามละเมิด)

- ❌ ห้ามทำ Phase ถัดไปก่อน Phase ปัจจุบันผ่าน Acceptance Criteria
- ❌ ห้ามเพิ่ม Feature นอกแผน
- ❌ ห้ามเปลี่ยน DB Schema หลัง Phase 1 โดยไม่แจ้งก่อน
- ✅ Commit หลังจบทุก Phase
- ✅ ทดสอบ Acceptance Criteria ทุกข้อก่อนขึ้น Phase ถัดไป
- ✅ ทุก API ต้องตรวจสอบ Authentication และ Authorization

---

> **อ้างอิง:** `Overview.md` | `planing.md` | `example.md`
