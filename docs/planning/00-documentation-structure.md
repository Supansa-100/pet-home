# Documentation Structure

เอกสารนี้ใช้อธิบายโครงสร้างของโฟลเดอร์เอกสาร (Docs) และหน้าที่ของไฟล์สำคัญแต่ละไฟล์ในโปรเจกต์ PET-HOME

## Root Documentation
- `README.md`: ข้อมูลสรุปโปรเจกต์แบบสั้น วิธีรันโปรเจกต์ด้วยคำสั่งพื้นฐาน (เปิดให้คนทั่วไปอ่าน)
- `planing.md`: เอกสารหลักในการสรุปจุดประสงค์ของโปรเจกต์ โครงสร้าง และแผนระยะยาว
- `imprementtation.md`: เอกสาร Roadmap เชิงลึก แบ่งงานออกเป็น Phase พร้อม Checklists และ API Contract ย่อย
- `Overview.md`: ข้อมูลบริบทโปรเจกต์ (Project Context) ผู้ใช้งานคือใคร ฟีเจอร์หลักคืออะไร
- `phase0-setup.md`: คำอธิบายการทำงานในส่วนของโครงสร้างเบื้องต้นและ Docker

## โฟลเดอร์ `docs/planning/`
เป็นที่เก็บเอกสารที่ใช้กำหนดข้อตกลงและกติกาต่างๆ ของทีม (รวมถึงกติกาของ AI)
- `00-tech-stack-decision.md`: บันทึกการตัดสินใจและเหตุผลในการเลือกใช้เทคโนโลยีต่างๆ (รวมถึงการตัดสินใจใช้ HTTP Polling สำหรับ Chat)
- `00-ai-working-rules.md`: กฎเหล็กที่ AI ต้องปฏิบัติตาม
- `00-git-workflow.md`: วิธีจัดการ Git Branch และการตั้งชื่อ Commit
- `00-documentation-structure.md`: ไฟล์อธิบายโครงสร้างนี้นี่เอง
- `00-readiness-check.md`: เช็กลิสต์ความพร้อมก่อนเริ่มแผนงานจริงๆ
- `01-system-overview.md`: ภาพรวมระบบ รวมถึง Chat Workflow (4.4) และ DB Tables (chat_rooms, chat_messages)

> **หมายเหตุ Chat System:** เอกสารที่เกี่ยวกับฟีเจอร์แชทกระจายอยู่ใน:
> - `01-system-overview.md` — Chat Workflow และ Architecture
> - `imprementtation.md` — Phase 5 Chat Implementation (DB Schema, API, Frontend)
> - `05-database-design.md` *(ยังไม่ได้สร้าง)* — จะครอบคลุม chat_rooms, chat_messages

## โฟลเดอร์ `.agents/skills/`
- `.agents/skills/pethome-dev/SKILL.md`: คำสั่งรวบยอด (System Instructions) สำหรับสั่งให้ AI Agent จดจำรูปแบบของโปรเจกต์นี้ เพื่อให้เริ่มงานต่อได้เลยในเซสชันใหม่ (มี Phase 0-8 รวม Chat Phase 5)
