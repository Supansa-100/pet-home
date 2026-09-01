# แผนการทำงานโปรเจกต์ PET-HOME
> วิเคราะห์จาก `Overview.md` | อัปเดต: 2026-06-23

---

## 1. ภาพรวมโปรเจกต์

| รายการ | รายละเอียด |
|---|---|
| **ชื่อโปรเจกต์** | PET-HOME |
| **วัตถุประสงค์** | แพลตฟอร์มสื่อกลางสำหรับหาบ้านและผู้อุปการะให้กับสัตว์เลี้ยง |
| **กลุ่มเป้าหมาย** | เจ้าของสัตว์เลี้ยง, ผู้ต้องการรับอุปการะ, ผู้ดูแลระบบ |
| **ประเภท** | Web Application (Full-stack) |

---

## 2. กลุ่มผู้ใช้งานหลัก (Target Users)

### 👤 1. เจ้าของสัตว์เลี้ยง (Pet Owners / Posters)
ผู้ใช้งานที่ต้องการหาบ้านใหม่ให้กับสัตว์เลี้ยงของตนเอง

**สิทธิ์การใช้งาน:**
- ลงประกาศรายละเอียดสัตว์เลี้ยง (รูปภาพ, ชนิด, สายพันธุ์, อายุ, ประวัติสุขภาพ, เงื่อนไขการรับเลี้ยง)
- แก้ไขหรือปิดประกาศของตนเองได้เมื่อสัตว์เลี้ยงได้บ้านแล้ว
- ตรวจสอบและพิจารณาคำขอรับอุปการะจากผู้ที่สนใจ
- สื่อสารและให้ข้อมูลเพิ่มเติมกับผู้ที่ต้องการรับเลี้ยง

### 🐾 2. ผู้ที่ต้องการรับอุปการะ (Adopters)
ผู้ใช้งานที่กำลังมองหาสัตว์เลี้ยงเพื่อนำไปดูแลและมอบความรัก

**สิทธิ์การใช้งาน:**
- ค้นหาและกรองสัตว์เลี้ยงตามความสนใจ (ชนิด, สายพันธุ์, ขนาด, เพศ, พื้นที่)
- อ่านรายละเอียดข้อมูลสัตว์เลี้ยงและเงื่อนไขของเจ้าของ
- ส่งคำขอ (Request) เพื่อติดต่อขอรับอุปการะ
- ติดตามสถานะคำขอรับอุปการะของตนเอง

### 🛡️ 3. ผู้ดูแลระบบ (Administrators)
ผู้ใช้งานที่มีสิทธิ์สูงสุดในการควบคุมและดูแลความเรียบร้อยของแพลตฟอร์ม

**สิทธิ์การใช้งาน:**
- จัดการบัญชีผู้ใช้งาน (แบนผู้ใช้ที่ทำผิดกฎ หรืออนุมัติการสมัคร)
- ตรวจสอบ, ซ่อน, หรือลบโพสต์ที่ไม่เหมาะสม, เป็นสแปม, หรือละเมิดข้อตกลง
- จัดการข้อมูลพื้นฐานของระบบ (หมวดหมู่สัตว์เลี้ยง)
- ดูภาพรวม สถิติ และดูแลความปลอดภัยของระบบ

---

## 3. Tech Stack (อ้างอิงจาก example.md)

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite 5 + MUI 5 |
| **Backend** | Node.js 20 LTS + Express 4 |
| **Database** | MySQL 8 |
| **Dev Tool** | Docker Compose + phpMyAdmin |
| **Deploy** | Railway (single-container, multi-stage Dockerfile) |

---

## 4. Port Mapping (Development)

| Service | Host Port | Container Port | หมายเหตุ |
|---|---|---|---|
| Frontend (Vite) | 5173 | 5173 | Hot Reload |
| Backend (Express) | 5001 | 5001 | nodemon |
| MySQL 8 | 3307 | 3306 | healthcheck required |
| phpMyAdmin | 8081 | 80 | Apple Silicon → `platform: linux/amd64` |

---

## 5. ช่วงการทำงาน (Phases)

### ช่วงที่ 0 — เตรียมกติกาและบริบท

| Step | งาน | ไฟล์ผลลัพธ์ | สถานะ |
|---|---|---|---|
| 0.1 | กำหนด Tech Stack | `docs/planning/00-tech-stack-decision.md` | ⬜ |
| 0.2 | สร้าง AI Working Rules | `docs/planning/00-ai-working-rules.md` | ⬜ |
| 0.3 | สร้าง SKILL.md | `.agents/skills/pethome-dev/SKILL.md` | ⬜ |
| 0.4 | กำหนดโครงสร้างเอกสาร | `docs/planning/00-documentation-structure.md` | ⬜ |
| 0.5 | กำหนด Git Workflow | `docs/planning/00-git-workflow.md` | ⬜ |
| 0.6 | ตรวจความพร้อม | `docs/planning/00-readiness-check.md` | ⬜ |

### ช่วงที่ 1 — Planning Only

| Step | ไฟล์ที่ต้องสร้าง | เนื้อหา |
|---|---|---|
| 1.1 | `docs/planning/01-system-overview.md` | ภาพรวมระบบ PET-HOME, actors, flow หลัก |
| 1.2 | `docs/planning/02-requirements.md` | Functional + Non-functional Requirements |
| 1.3 | `docs/planning/03-roles-permissions.md` | Poster / Adopter / Admin — บทบาทและสิทธิ์ |
| 1.4 | `docs/planning/04-adoption-workflow.md` | ขั้นตอนการโพสต์ → ขอรับอุปการะ → อนุมัติ |
| 1.5 | `docs/planning/05-database-design.md` | ER Diagram, Tables, Schema (utf8mb4) รวม chat_rooms, chat_messages |
| 1.6 | `docs/planning/06-api-contract.md` | REST API endpoints, request/response รวม Chat APIs |
| 1.7 | `docs/planning/07-frontend-pages.md` | หน้าจอ, components, routing รวม Chat Pages |
| 1.8 | `docs/planning/08-dashboard-report.md` | Dashboard สถิติ, รายงาน, Admin panel |
| 1.9 | `docs/planning/09-docker-architecture.md` | Docker Compose architecture |
| 1.10 | `docs/planning/PROJECT_CONTEXT.md` | Context รวมสำหรับ AI ก่อน implement |
| 1.11 | `docs/planning/10-implementation-plan.md` | แผน Implementation แบ่ง Phase ย่อย |

### ช่วงที่ 2 — Implementation

> กำหนด Phase ย่อยหลังจบ Planning ช่วงที่ 1 แล้วเท่านั้น
>
> **Phase 0–8** (Phase 5 = Chat System, Phase 6 = Admin Panel, Phase 7 = Search/UX, Phase 8 = Deploy)

---

## 6. Feature หลักของระบบ

| Feature | กลุ่มผู้ใช้ | รายละเอียด |
|---|---|---|
| ลงประกาศสัตว์เลี้ยง | Pet Owner | รูปภาพ, ชนิด, สายพันธุ์, อายุ, สุขภาพ, เงื่อนไข |
| ค้นหา/กรองสัตว์เลี้ยง | Adopter | ชนิด, สายพันธุ์, ขนาด, เพศ, พื้นที่ |
| ส่งคำขอรับอุปการะ | Adopter | Request + ติดตามสถานะ |
| ระบบสนทนาแชท (Chat) | Pet Owner, Adopter | สนทนาหลังส่งคำขอ, อ่านประวัติย้อนหลัง, HTTP Polling 5วิ |
| พิจารณาคำขอ | Pet Owner | อนุมัติ / ปฏิเสธ คำขอ |
| จัดการประกาศ | Pet Owner | แก้ไข / ปิดประกาศ |
| จัดการผู้ใช้งาน | Admin | แบน, อนุมัติ |
| ตรวจสอบโพสต์ | Admin | ลบ/ซ่อนโพสต์ไม่เหมาะสม |
| ดูภาพรวมสถิติ | Admin | Dashboard, รายงาน |

---

## 7. Docker Rules (สรุป)

- ❌ ห้ามใส่ `version` ใน `docker-compose.yml`
- ✅ ใช้ custom Docker bridge network เดียวกันทุก service
- ✅ Backend ติดต่อ DB ผ่าน service name `db` port 3306 (ไม่ใช้ `localhost`)
- ✅ bind mounts สำหรับ source code, anonymous volume สำหรับ `node_modules`
- ✅ MySQL ต้องมี `healthcheck` + `depends_on: condition: service_healthy`
- ✅ SQL init script → `db/init/01-init.sql` charset `utf8mb4`

---

## 8. AI Working Rules (สรุปกติกาสำคัญ)

- ❌ ห้ามเขียน Code ก่อน Planning เสร็จ
- ❌ ห้ามทำเกิน Phase ที่กำหนด
- ❌ ห้ามเพิ่ม Feature นอกแผน
- ❌ ห้ามเปลี่ยน Tech Stack / DB Schema / API Contract โดยไม่ได้รับอนุญาต
- ✅ ถ้าต้องเปลี่ยน → ต้องแจ้งเหตุผลก่อน
- ✅ ทุก Phase ต้องมี: วิธีรัน + วิธีทดสอบ + Acceptance Criteria + Git Commit Message



## 9. Known Risks

| ความเสี่ยง | วิธีรับมือ |
|---|---|
| Port 5000 ชนกับ macOS AirPlay | ใช้ backend port **5001** |
| phpMyAdmin บน Apple Silicon | เพิ่ม `platform: linux/amd64` |
| `node_modules` ใน Docker ทับกับ host | ใช้ anonymous volume |
| Backend ขึ้นก่อน DB พร้อม | ใช้ MySQL `healthcheck` + `service_healthy` |
| File upload บน Railway | Railway filesystem เป็น ephemeral → ใช้ Railway Volume |
| Secret หลุดใน git | ใช้ `.env` + `.gitignore` ครอบคลุม |

---

## 10. ลำดับขั้นตอนถัดไป

1. **สร้างไฟล์ Phase 0** ตาม Prompt 0.1–0.6 จาก `example.md`
2. **ตรวจสอบความพร้อม** ด้วย Prompt 0.6 ก่อนเข้า Planning
3. **เริ่ม Planning Phase 1** ตามลำดับไฟล์ 1.1–1.11
4. **ห้ามเริ่ม Implementation** จนกว่า Planning ทุกข้อจะสมบูรณ์

---

> **อ้างอิง:** `Overview.md` (ภาพรวมโปรเจกต์ PET-HOME) | `example.md` (Prompt Templates 0.1–0.6)
