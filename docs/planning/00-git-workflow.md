# Git Workflow & Commit Rules

เอกสารกำหนดกติกาการใช้งาน Git สำหรับโปรเจกต์ PET-HOME เพื่อให้การทำงานมีประวัติที่ชัดเจนและย้อนกลับได้ง่าย (โดยเฉพาะเมื่อทำงานร่วมกับ AI)

## 1. Branch Strategy
- **`main`**: บรันช์หลักที่มีโค้ดที่เสถียรที่สุด 
- **`phase-X`** (เช่น `phase-2-auth`): แยกบรันช์ตาม Phase (หากต้องการ) เพื่อพัฒนาฟีเจอร์ให้เสร็จสมบูรณ์ทีละส่วน แล้วค่อยทำ PR (Pull Request) กลับเข้าไปรวมกับ `main` (สำหรับกรณีที่มีนักพัฒนาหลายคน)
- ในการพัฒนาแบบคู่กับ AI Agent สามารถ Commit ลง `main` ได้โดยตรงหากได้รับการอนุญาตและยืนยันในแต่ละ Phase แล้ว

## 2. Commit Convention
เราใช้มาตรฐาน Conventional Commits:
- `feat:` เพิ่มฟีเจอร์ใหม่
- `fix:` แก้ไขบัก
- `docs:` สร้างหรือแก้ไขเอกสาร
- `chore:` งานทำความสะอาด, ปรับตั้งค่า, เพิ่มแพ็กเกจ (ไม่กระทบโค้ดหลัก)
- `refactor:` แก้ไขโค้ดเดิมโดยไม่มีฟีเจอร์เพิ่มและไม่ได้แก้บัก

## 3. When to Commit (เมื่อไหร่ควร Commit)
1. **จบแต่ละ Planning Step**: หากมีการแก้ไขเอกสารแผนงาน (เช่น `planing.md`, `imprementtation.md`) ให้ Commit แจ้งว่า "docs: update implementation plan for phase X"
2. **จบแต่ละ Implementation Phase**: เมื่อผ่าน Acceptance Criteria อย่างครบถ้วน ให้รวบยอด Commit 1 รอบ (เช่น `feat: complete phase 2 authentication`)
3. **หลังจากแก้บั๊ก (Bug Fix)**: หากมีปัญหาเกิดขึ้นและแก้ไขเรียบร้อย ให้ Commit ทันทีเพื่อไม่ให้ปัญหาบานปลาย (เช่น `fix: resolve JWT token error during login`)

## 4. ไฟล์ที่ไม่ควรถูก Commit
จะต้องถูกครอบคลุมโดย `.gitignore`
- ไฟล์รหัสผ่านหรือความลับ: `.env`, `.env.local`
- โฟลเดอร์ที่ได้จากการ Build: `node_modules/`, `dist/`, `build/`
- ข้อมูลที่อัปโหลด (ยกเว้น `.gitkeep`): `backend/uploads/`
- ข้อมูลของ Database: โฟลเดอร์ volume หรือ `.docker/`

## 5. ตัวอย่าง Commit Messages
- `docs: add tech stack decision`
- `docs: add AI working rules`
- `feat: complete phase 0 project setup`
- `feat: complete phase 1 database schema and backend foundation`
- `feat: complete phase 5 — chat system`
- `docs: add chat system workflow to planning docs`
- `fix: resolve backend database connection issue on docker`
- `chore: update docker compose configuration`
