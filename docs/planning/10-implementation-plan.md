# Implementation Plan - PET-HOME

เอกสารนี้ระบุแผนการดำเนินงาน (Implementation Plan) แบบละเอียด แบ่งเป็น 16 Phases (0-15) เพื่อใช้เป็นแนวทางในการพัฒนาระบบ PET-HOME โดยอิงจากเอกสาร Requirement, Database Design, API Contract, Frontend Page Structure, Dashboard Design และ Docker Architecture

*(หมายเหตุ: คำว่า Complaint ใน Requirement เดิม ถูกปรับใช้เป็น Pet Listing (ประกาศสัตว์เลี้ยง) และ Adoption Request (คำขอรับอุปการะ) เพื่อให้ตรงกับบริบทของ PET-HOME)*

---

## Phase 0: Requirement and Architecture
- **เป้าหมาย:** สรุปความต้องการและออกแบบสถาปัตยกรรมของระบบให้เสร็จสมบูรณ์
- **งานที่ต้องทำ:** จัดทำเอกสาร Planning ทั้งหมด (01 ถึง 09)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `docs/planning/*.md`
- **ผลลัพธ์ที่ต้องส่งมอบ:** เอกสารแผนงานสมบูรณ์
- **วิธีทดสอบ:** Review เอกสารโดยผู้มีส่วนได้ส่วนเสีย
- **Acceptance Criteria:** เอกสารทั้งหมดได้รับการอนุมัติ และเข้าใจตรงกัน
- **Dependency:** -
- **Git Commit:** `docs: complete requirement and architecture planning`
- **ความเสี่ยง:** Requirement เปลี่ยนแปลงกลางคัน (Scope Creep)

---

## Phase 1: Project Setup
- **เป้าหมาย:** เตรียมโครงสร้างโปรเจกต์ โฟลเดอร์ และ Environment พื้นฐาน
- **งานที่ต้องทำ:** 
  1. สร้างโฟลเดอร์ frontend ด้วย Vite (React) และติดตั้ง MUI
  2. สร้างโฟลเดอร์ backend (Node.js/Express)
  3. ตั้งค่า `.env.example`, `.gitignore`, `eslint`, `prettier`
- **ไฟล์/Module ที่เกี่ยวข้อง:** `frontend/package.json`, `backend/package.json`
- **ผลลัพธ์ที่ต้องส่งมอบ:** โครงสร้างโฟลเดอร์พร้อมรัน
- **วิธีทดสอบ:** รัน `npm run dev` ทั้งสองฝั่งผ่านโดยไม่มี Error
- **Acceptance Criteria:** สามารถเข้าถึง localhost:5173 (React) และ localhost:5001 (Express) ได้
- **Dependency:** Phase 0
- **Git Commit:** `chore: initial project setup for frontend and backend`
- **ความเสี่ยง:** Version ของ Node/NPM ไม่ตรงกันระหว่างทีมพัฒนา

---

## Phase 2: Database Schema and Seed Data
- **เป้าหมาย:** สร้าง Database Schema และเตรียมข้อมูลจำลอง (Seed Data) พื้นฐาน
- **งานที่ต้องทำ:**
  1. เขียน SQL สคริปต์สร้างตาราง (Users, Pets, Requests, etc.)
  2. เขียน SQL จำลองข้อมูลตั้งต้น (Master Data: จังหวัด, หมวดหมู่)
  3. ตั้งค่า `docker-compose.yml` สำหรับ MySQL และ phpMyAdmin
- **ไฟล์/Module ที่เกี่ยวข้อง:** `db/init/01-schema.sql`, `db/init/02-seed.sql`, `docker-compose.yml`
- **ผลลัพธ์ที่ต้องส่งมอบ:** ฐานข้อมูลพร้อมใช้งานใน Local Docker
- **วิธีทดสอบ:** รัน `docker-compose up` และดูผ่าน phpMyAdmin (localhost:8081)
- **Acceptance Criteria:** ตารางถูกสร้างครบถ้วน มี Data พื้นฐาน และ Relations (Foreign Keys) ถูกต้อง
- **Dependency:** Phase 1
- **Git Commit:** `feat(db): create database schema and seed data`
- **ความเสี่ยง:** การตั้งค่า Collation ผิดพลาด (ควรเป็น utf8mb4 เพื่อรองรับภาษาไทย/Emoji)

---

## Phase 3: Backend Core and MySQL Connection
- **เป้าหมาย:** ตั้งค่า Backend ให้เชื่อมต่อฐานข้อมูล และโครงสร้าง API พื้นฐาน (Error Handling, Logger)
- **งานที่ต้องทำ:**
  1. ติดตั้ง `mysql2` และตั้งค่า Connection Pool
  2. สร้าง Middleware สำหรับ Global Error Handler
  3. สร้าง Healthcheck API `/api/v1/health`
- **ไฟล์/Module ที่เกี่ยวข้อง:** `backend/src/config/db.js`, `backend/src/server.js`, `backend/src/middlewares/error.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** Backend พร้อมรับ Request
- **วิธีทดสอบ:** เรียก API `/api/v1/health` และทดสอบ Query ง่ายๆ ในโค้ด
- **Acceptance Criteria:** Backend ต่อ DB ได้สำเร็จ ไม่แครชเมื่อ Query ผิด
- **Dependency:** Phase 2
- **Git Commit:** `feat(backend): setup express server and mysql connection`
- **ความเสี่ยง:** Environment variables (.env) ใส่ไม่ครบทำให้ต่อ DB ไม่ได้

---

## Phase 4: Authentication and Authorization
- **เป้าหมาย:** ระบบ Login/Register และตรวจสอบสิทธิ์ผู้ใช้
- **งานที่ต้องทำ:**
  1. เขียน API สมัครสมาชิก (Hash Password ด้วย bcrypt)
  2. เขียน API เข้าสู่ระบบ (สร้าง JWT Token)
  3. สร้าง Auth Middleware เพื่อเช็ค Token และ Role (Admin, User)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `controllers/authController.js`, `middlewares/auth.js`, `models/userModel.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** API Auth พร้อมใช้งาน
- **วิธีทดสอบ:** ทดสอบยิง API ด้วย Postman สร้าง Token และนำ Token ไปทดสอบ Route ที่ล็อคไว้
- **Acceptance Criteria:** User สมัครและล็อกอินได้, เข้าถึง Private API ได้เมื่อมี Token ที่ถูกต้อง
- **Dependency:** Phase 3
- **Git Commit:** `feat(auth): implement user registration, login and jwt middleware`
- **ความเสี่ยง:** ความปลอดภัยของ Secret Key หรือลืมซ่อน Password จาก Response

---

## Phase 5: Pet Listing CRUD API (เทียบเท่า Complaint CRUD API)
- **เป้าหมาย:** สร้าง API สำหรับลงประกาศ ดู แก้ไข และลบประกาศสัตว์เลี้ยง
- **งานที่ต้องทำ:**
  1. สร้าง API `/pets` (GET, POST, PUT, DELETE)
  2. รองรับ Query Params สำหรับ Filter (ชนิด, พันธุ์, พื้นที่)
  3. ติดตั้งเครื่องมืออัปโหลดรูปภาพ (เช่น Multer)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `routes/petRoutes.js`, `controllers/petController.js`, `models/petModel.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** API สำหรับจัดการโพสต์หาบ้าน
- **วิธีทดสอบ:** ส่ง Request POST พร้อมข้อมูลครบถ้วน และทดสอบ GET เพื่อ Filter
- **Acceptance Criteria:** สร้างประกาศได้, ผู้อื่นสามารถค้นหาประกาศได้
- **Dependency:** Phase 4
- **Git Commit:** `feat(api): implement pet listing crud operations`
- **ความเสี่ยง:** ระบบอัปโหลดรูปภาพอาจมีปัญหาเรื่อง Storage ขนาดใหญ่

---

## Phase 6: Adoption Request & Status Workflow API
- **เป้าหมาย:** API สำหรับส่งคำขอรับเลี้ยง และการจัดการสถานะโดยเจ้าของ
- **งานที่ต้องทำ:**
  1. สร้าง API ให้ Adopter ส่ง Request รับเลี้ยง
  2. สร้าง API ให้ Owner กด อนุมัติ/ปฏิเสธ คำขอ (เปลี่ยน Status)
  3. เขียน Transaction อัปเดตสถานะสัตว์เลี้ยงเมื่ออนุมัติ
- **ไฟล์/Module ที่เกี่ยวข้อง:** `routes/requestRoutes.js`, `controllers/requestController.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** Workflow ระบบจับคู่สมบูรณ์ (ฝั่ง Backend)
- **วิธีทดสอบ:** จำลอง User A ตั้งโพสต์, User B ส่งคำขอ, User A อนุมัติ -> ตรวจสอบสถานะว่าเปลี่ยนจาก AVAILABLE เป็น ADOPTED
- **Acceptance Criteria:** สถานะของสัตว์และคำขอเปลี่ยนไปอย่างสอดคล้องกัน
- **Dependency:** Phase 5
- **Git Commit:** `feat(api): implement adoption request and status workflow`
- **ความเสี่ยง:** Database Race Condition กรณีมีผู้ส่งคำขอพร้อมกันแล้วกดอนุมัติชนกัน (ต้องป้องกันระดับ DB)

---

## Phase 7: Dashboard and Report API
- **เป้าหมาย:** เตรียม API สถิติสำหรับหน้าแดชบอร์ด
- **งานที่ต้องทำ:**
  1. สร้าง API ดึงสถิติภาพรวมสำหรับ Admin (ยอดผู้ใช้, ยอดหาบ้านสำเร็จ)
  2. สร้าง API ดึงสถิติส่วนตัวสำหรับ User
- **ไฟล์/Module ที่เกี่ยวข้อง:** `controllers/dashboardController.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** Endpoint ที่คืนค่าเป็นตัวเลขสถิติ
- **วิธีทดสอบ:** ยิง API เพื่อตรวจสอบความถูกต้องของผลรวมเปรียบเทียบกับฐานข้อมูล
- **Acceptance Criteria:** ข้อมูลสถิติแม่นยำและ Query ตอบสนองรวดเร็ว
- **Dependency:** Phase 6
- **Git Commit:** `feat(api): add dashboard statistics endpoints`
- **ความเสี่ยง:** Query สถิติอาจช้าหากไม่ได้ทำ Index ใน Database

---

## Phase 8: Frontend Layout and Routing
- **เป้าหมาย:** วางโครงสร้างหน้าเว็บ Frontend และระบบนำทาง (React Router)
- **งานที่ต้องทำ:**
  1. สร้าง Layouts (Public, User, Admin)
  2. ตั้งค่า React Router DOM กำหนด Path ตาม 07-frontend-pages.md
  3. สร้าง Components ย่อย (Navbar, Sidebar)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `App.jsx`, `routes.jsx`, `components/Layouts/*`
- **ผลลัพธ์ที่ต้องส่งมอบ:** หน้าเว็บที่คลิกเปลี่ยนหน้าได้ แต่ยังไม่มีข้อมูล
- **วิธีทดสอบ:** คลิกเมนูตาม Navbar/Sidebar ต้องเปลี่ยน Path โดยไม่พัง
- **Acceptance Criteria:** Routing ถูกต้องและ Layout แสดงผลรองรับหน้าจอมือถือ (Responsive)
- **Dependency:** Phase 1
- **Git Commit:** `feat(ui): setup layouts and react router`
- **ความเสี่ยง:** จัด Layout ไม่ดีทำให้เละในจอมือถือ (ต้องใช้ Grid/Flex ให้เหมาะสม)

---

## Phase 9: Frontend Authentication
- **เป้าหมาย:** นำ API Auth มาเชื่อมกับ UI
- **งานที่ต้องทำ:**
  1. สร้างฟอร์ม Login, Register
  2. สร้าง Auth Context กักเก็บ Token และ User Info
  3. ทำ Protected Route (บังคับ Login ก่อนเข้าบางหน้า)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `pages/Auth/*`, `contexts/AuthContext.jsx`, `services/api.js`
- **ผลลัพธ์ที่ต้องส่งมอบ:** ระบบ Login ผ่าน UI ที่ใช้งานได้จริง
- **วิธีทดสอบ:** สมัครบัญชีใหม่ ล็อกอิน ปิดหน้าต่างแล้วเปิดใหม่ต้องยังล็อกอินอยู่ (Persist State)
- **Acceptance Criteria:** ล็อกอินสำเร็จ เก็บ Token ได้ (LocalStorage หรือ Cookie), ถูกดีดออกเมื่อเข้าหน้าห้ามเข้า
- **Dependency:** Phase 4, Phase 8
- **Git Commit:** `feat(ui): implement login, register and auth context`
- **ความเสี่ยง:** จัดการ Token ผิดวิธีทำให้เกิดช่องโหว่ด้านความปลอดภัย (XSS)

---

## Phase 10: Pet Listing & Request Management UI
- **เป้าหมาย:** สร้างหน้าค้นหาและโพสต์ประกาศ (หน้าหลักของเว็บ)
- **งานที่ต้องทำ:**
  1. สร้างหน้า Home และ Card แสดงสัตว์เลี้ยง
  2. สร้างฟอร์มลงประกาศ (รองรับรูปภาพ)
  3. สร้างหน้ารายละเอียด และหน้าส่งคำขอรับอุปการะ
  4. สร้างหน้าจัดการคำขอ (สำหรับเจ้าของ)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `pages/Pets/*`, `pages/Requests/*`
- **ผลลัพธ์ที่ต้องส่งมอบ:** ระบบหลักของ PET-HOME ฝั่งหน้าเว็บทำงานครบถ้วน
- **วิธีทดสอบ:** ผู้ใช้ A โพสต์, ผู้ใช้ B หาโพสต์เจอแล้วส่งคำขอ, ผู้ใช้ A เห็นและกดอนุมัติ
- **Acceptance Criteria:** ทำ Flow หาบ้านและขอรับเลี้ยงตั้งแต่ต้นจนจบผ่าน UI ได้
- **Dependency:** Phase 5, Phase 6, Phase 9
- **Git Commit:** `feat(ui): implement pet listing and adoption request workflows`
- **ความเสี่ยง:** ฟอร์มอัปโหลดรูปภาพฝั่ง Frontend เขียนยาก หรือพังเมื่อไฟล์ใหญ่

---

## Phase 11: Dashboard and Report UI
- **เป้าหมาย:** สร้างหน้าจอแสดงกราฟและสถิติ
- **งานที่ต้องทำ:**
  1. สร้างแดชบอร์ดของ User (สรุปสถานะโพสต์/คำขอตัวเอง)
  2. สร้างแดชบอร์ด Admin แสดงตัวเลขและกราฟ (อาจใช้ Chart.js หรือ Recharts)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `pages/Dashboard/*`, `pages/Admin/*`
- **ผลลัพธ์ที่ต้องส่งมอบ:** หน้าแดชบอร์ดที่ดึงข้อมูลจาก API
- **วิธีทดสอบ:** ดูสถิติผ่านหน้าเว็บ เทียบกับสถานการณ์จริง
- **Acceptance Criteria:** UI สวยงาม กราฟแสดงข้อมูลถูกต้องตามที่ API ส่งมา
- **Dependency:** Phase 7, Phase 9
- **Git Commit:** `feat(ui): implement admin and user dashboards`
- **ความเสี่ยง:** Library Chart ตีกับ MUI หรือตั้งค่าแกนผิด

---

## Phase 12: Notification and SLA Alert
- **เป้าหมาย:** ระบบแจ้งเตือนเมื่อมีความเคลื่อนไหวสำคัญ
- **งานที่ต้องทำ:**
  1. พัฒนา Backend ให้บันทึก Notification เมื่อมี Event (ส่งคำขอ, อนุมัติ)
  2. สร้าง Notification Dropdown ใน Frontend (Topbar)
  3. (Optional) ตั้งค่า Cronjob หรือ Scheduled Task สำหรับ SLA Alerts (เช่น แจ้งเตือนโพสต์เกิน 30 วัน)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `controllers/notificationController.js`, `components/NotificationMenu.jsx`
- **ผลลัพธ์ที่ต้องส่งมอบ:** กระดิ่งแจ้งเตือนบนเว็บที่อัปเดตแบบเรียลไทม์ หรือรีเฟรชแล้วมา
- **วิธีทดสอบ:** กระทำบางอย่าง (เช่น อนุมัติคำขอ) แล้วเช็คแอคเคาท์ฝั่งตรงข้ามว่ามีแจ้งเตือนขึ้นไหม
- **Acceptance Criteria:** แจ้งเตือนขึ้นถูกต้อง และคลิกเปลี่ยนสถานะเป็น "อ่านแล้ว" ได้
- **Dependency:** Phase 10
- **Git Commit:** `feat(system): implement notifications and cron alerts`
- **ความเสี่ยง:** แจ้งเตือนซ้ำซ้อน หากเขียน Logic สร้าง Notification ไว้ผิดที่

---

## Phase 13: Docker Integration
- **เป้าหมาย:** นำระบบทั้งหมดแพ็คใส่ Docker เพื่อเตรียมพร้อมใช้จริง
- **งานที่ต้องทำ:**
  1. สร้าง `Dockerfile` แบบ Multi-stage (ฝัง Frontend เข้า Backend ตามแผน Target A: Railway)
  2. แก้ไข `server.js` ให้ Serve Static Files จาก React
  3. สร้าง `docker-compose.prod.yml` (สำหรับ Target B)
- **ไฟล์/Module ที่เกี่ยวข้อง:** `Dockerfile`, `backend/src/server.js`, `docker-compose.prod.yml`
- **ผลลัพธ์ที่ต้องส่งมอบ:** Docker Image ที่มีครบทั้งเว็บและ API ในตัวเดียว
- **วิธีทดสอบ:** รัน `docker build` และ `docker run -p 5001:5001` เข้าเบราว์เซอร์ผ่าน localhost:5001 ควรเจอหน้าเว็บ React
- **Acceptance Criteria:** Single Container สามารถใช้งานเว็บได้ทุกหน้า และยิง API ได้ตามปกติ
- **Dependency:** Phase 11
- **Git Commit:** `chore(docker): setup multi-stage dockerfile and static serve`
- **ความเสี่ยง:** ลืม Catch-all route ใน Express ทำให้กด Refresh หน้าลูกๆ (เช่น /pets/123) แล้วเจอ 404 Not Found

---

## Phase 14: Testing and Bug Fix
- **เป้าหมาย:** ทดสอบการทำงานรวม ปิดช่องโหว่ แก้ไขบั๊ก
- **งานที่ต้องทำ:**
  1. ทดสอบ UAT (User Acceptance Testing) จำลองเหตุการณ์ตั้งแต่สมัครจนได้บ้าน
  2. แก้ไขบั๊ก UI พัง บั๊กกดปุ่มรัวๆ
  3. ตรวจสอบการจัดการ Error Message (เช่น กรอกรหัสผิด ให้แจ้งเตือนดีๆ)
- **ไฟล์/Module ที่เกี่ยวข้อง:** ทุกไฟล์
- **ผลลัพธ์ที่ต้องส่งมอบ:** ระบบที่เสถียร
- **วิธีทดสอบ:** สุ่มให้คนอื่นลองเล่น, คลิกทดสอบแบบ Edge Case
- **Acceptance Criteria:** ไม่มีบั๊กบล็อกการทำงานร้ายแรง (No Critical Bugs)
- **Dependency:** Phase 12
- **Git Commit:** `fix: resolve bugs from testing phase`
- **ความเสี่ยง:** เจอการแก้ไขที่ส่งผลกระทบเป็นลูกโซ่กับระบบอื่น

---

## Phase 15: Production Deployment Guide
- **เป้าหมาย:** เอาแอปพลิเคชันขึ้น Server หรือ Cloud
- **งานที่ต้องทำ:**
  1. นำโปรเจกต์ผูกกับ Railway หรือ Deploy ผ่าน VPS
  2. จัดการ Environment Variables (.env) ฝั่ง Production
  3. ยิงสคริปต์ Init Database บน Production Database
- **ไฟล์/Module ที่เกี่ยวข้อง:** `railway.toml`, Railway Dashboard
- **ผลลัพธ์ที่ต้องส่งมอบ:** ลิงก์ URL ของระบบที่เข้าได้จากอินเทอร์เน็ตจริง
- **วิธีทดสอบ:** เข้าผ่าน Domain Name บนมือถือและคอมพิวเตอร์ ทำการสมัครสมาชิกจริง
- **Acceptance Criteria:** ระบบทำงานบน Cloud ได้อย่างสมบูรณ์
- **Dependency:** Phase 13, Phase 14
- **Git Commit:** `docs: add deployment instructions`
- **ความเสี่ยง:** ลืมเปลี่ยน URL จาก localhost เป็น URL จริงในหน้าเว็บ ทำให้ดึงข้อมูลไม่ได้บน Production
