---
name: pethome-dev
description: คำแนะนำและกฎการทำงานสำหรับ AI ในโปรเจกต์ PET-HOME
---

# PET-HOME Development Skill

นี่คือกฎและคำแนะนำเบื้องต้นสำหรับ AI ในการช่วยพัฒนาโปรเจกต์ **PET-HOME (แพลตฟอร์มหาบ้านให้สัตว์เลี้ยง)**

## 1. การทำงานตาม Phases
- โปรเจกต์นี้ถูกแบ่งออกเป็นหลาย Phase (**Phase 0–8**)
- **ห้ามข้าม Phase** ให้ทำตาม `imprementtation.md` อย่างเคร่งครัด
- ก่อนเริ่มเขียนโค้ด ให้คุณขออนุญาตและสรุปแผนงาน (วางแผน Phase ปัจจุบัน) ให้ผู้ใช้ Review ก่อนเสมอ
- เมื่อทำแต่ละ Phase จบ ให้รัน `docker-compose up` หรือเครื่องมือที่เกี่ยวข้อง เพื่อตรวจสอบความถูกต้องตาม Acceptance Criteria ที่กำหนดไว้ใน `imprementtation.md`

**Phase Overview:**
| Phase | ชื่อ |
|---|---|
| 0 | Project Setup & Infrastructure |
| 1 | Database & Backend Foundation |
| 2 | Authentication & User Management |
| 3 | Pet Listing (Core Feature) |
| 4 | Adoption Request Workflow |
| **5** | **Chat System (ระบบสนทนา)** |
| 6 | Admin Panel |
| 7 | Search, Filter & UX Polish |
| 8 | Testing & Production Deploy |

## 2. Tech Stack และเครื่องมือ
- **Frontend**: React 18, Vite 5, MUI 5
- **Backend**: Node.js 20, Express 4
- **Database**: MySQL 8
- **Infrastructure**: Docker Compose (สำหรับ Development) และ Railway (สำหรับ Production)
- **สำคัญ**: ไม่มี Nginx เป็น Reverse Proxy (Railway จัดการให้ใน Production แล้ว) ให้ Frontend และ Backend อยู่คนละ Port ใน Development (Frontend: 5173, Backend: 5001)

## 3. กติกาสำหรับ Docker และ Local Environment
- เมื่อเพิ่ม package.json ของ Backend ให้รัน Backend ใหม่ หาก nodemon ไม่โหลด ให้เพิ่ม flag `-L` (`nodemon -L`) เพื่อแก้ปัญหา Volume file watcher บน Windows Docker Desktop
- การแก้ไขฐานข้อมูล ให้เขียน SQL สคริปต์ไปเก็บไว้ใน `db/init/` 
- ไม่ใช้ Port 5000 (เพื่อป้องกันการชนกับ macOS Airplay) ให้ใช้ `5001` แทน

## 4. Git Workflow
- ใช้ Conventional Commits (เช่น `feat:`, `fix:`, `docs:`, `chore:`)
- อย่าลืมเขียน Commit Message ที่ระบุ Phase ให้ชัดเจนหากเป็นไปได้ เช่น `feat: complete phase 2 authentication`

## 5. การใช้เครื่องมือของ AI
- ใช้เครื่องมือเท่าที่จำเป็น ห้ามทำสิ่งที่ไม่ได้รับมอบหมาย
- เมื่อมีการแก้ไขไฟล์เกิน 1 แห่ง ให้ใช้ความระมัดระวังในการ Replace Text 
- ใช้ `manage_task` หรือรอระบบ Notify กลับมาเมื่อสั่งรัน Background task ที่ใช้เวลานาน (เช่น npm install, docker-compose build)

## 6. เอกสารอ้างอิง
เอกสารต่อไปนี้เป็นแหล่งข้อมูลความจริงของโปรเจกต์:
- `planing.md`: ภาพรวมและ Roadmap 
- `imprementtation.md`: รายละเอียดของงานในแต่ละ Phase
- `Overview.md`: บริบทของระบบ (เป้าหมาย, กลุ่มเป้าหมาย)
- `phase0-setup.md`: คู่มือการตั้งค่าช่วงเริ่มต้น
