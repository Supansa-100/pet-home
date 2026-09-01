# Prompt 0.1: กำหนด Tech Stack และขอบเขตเบื้องต้น

คุณคือ Senior Full-stack Architect และ Technical Lead

ฉันต้องการเตรียมโปรเจกต์ Web Application ก่อนเริ่มวิเคราะห์และพัฒนา

ตอนนี้อยู่ในช่วงที่ 0: เตรียมกติกาและบริบท

ข้อกำหนดสำคัญ:

* ยังไม่ต้องวิเคราะห์ Requirement ละเอียด
* ยังไม่ต้องออกแบบ Database
* ยังไม่ต้องออกแบบ API
* ยังไม่ต้องเขียน Code
* ให้ช่วยกำหนดกรอบเทคโนโลยีและขอบเขตเบื้องต้นเท่านั้น

ระบบที่ต้องการสร้าง:
ระบบรับเรื่องร้องเรียนศูนย์ดำรงธรรมจังหวัดศรีสะเกษ (DCMS)

Tech Stack ที่ต้องการใช้:

* Frontend: React 18 + Vite 5 + MUI 5
* Backend: Node.js 20 LTS + Express 4
* Database: MySQL 8
* Docker: Docker Compose (Dev)
* Database Tool: phpMyAdmin (Dev)
* Deploy: Railway (single-container จาก Dockerfile multi-stage — ไม่ใช้ Nginx แยก)

รายละเอียด Development Environment ที่ต้องระบุในเอกสาร:

* Frontend ใช้ Vite port 5173 และรองรับ Hot Reload
* Backend ใช้ Express port 5001 และรองรับ Hot Reload ด้วย nodemon
* หลีกเลี่ยง port 5000 เพราะ macOS ใช้กับ AirPlay Receiver
* MySQL 8 ใช้ host port 3307 map ไป container port 3306
* phpMyAdmin ใช้ host port 8081 map ไป container port 80
* ถ้าเครื่องเป็น Apple Silicon (M1/M2/M3/M4) ให้ระบุข้อควรระวังว่า phpMyAdmin อาจต้องใช้ `platform: linux/amd64`
* ทุก service อยู่ใน custom Docker bridge network เดียวกัน
* Backend และ phpMyAdmin ต้องเชื่อมต่อ MySQL ผ่านชื่อ service `db` และ internal port 3306 ไม่ใช้ `localhost`
* ใช้ bind mounts สำหรับ Frontend/Backend เพื่อพัฒนาแบบ Hot Reload
* ใช้ anonymous volume สำหรับ `node_modules` เพื่อป้องกัน host overwrite และปัญหา architecture ไม่ตรง
* กำหนด environment variables ผ่านไฟล์ `.env` และอ้างอิงใน `docker-compose.yml` ด้วยรูปแบบ `${VARIABLE:-default}`
* ไม่ต้องใส่ `version: "3.8"` ใน `docker-compose.yml` เพราะ Docker Compose รุ่นใหม่ไม่ใช้แล้ว
* MySQL ต้องมี healthcheck และ service ที่พึ่งพา DB ต้องใช้ `depends_on` พร้อม `condition: service_healthy`
* SQL init script ให้วางใน `db/init/01-init.sql` และใช้ charset/collation ที่รองรับภาษาไทย เช่น `utf8mb4`

รายละเอียด Production Environment ที่ต้องระบุในเอกสาร:

* Railway เป็น deployment target หลัก ใช้ root `Dockerfile` แบบ multi-stage สำหรับ single-container app
* Railway จัดการ SSL/domain เอง ไม่ต้องใช้ Nginx แยก
* หากมี on-premise/Ubuntu เป็นทางเลือก ให้ระบุว่าใช้ image/app เดียวกันร่วมกับ MySQL และ Nginx reverse proxy ได้ แต่ต้องไม่ทำให้โค้ดผูกกับ target ใด target หนึ่ง
* ห้ามใส่ secrets หรือ production config ลงใน source code โดยตรง ให้ใช้ environment variables
* ต้องระบุข้อจำกัดว่า Railway filesystem เป็น ephemeral หากมี uploads ในอนาคตต้องใช้ Railway Volume หรือ Object Storage

งานที่ต้องการ:
ช่วยจัดทำเอกสาร Tech Stack Decision โดยมีหัวข้อ:

1. Project Name
2. Purpose of the System
3. Selected Tech Stack
4. Reason for Each Technology
5. Development Environment
6. Production Environment
7. Tools Required
8. Folder Strategy เบื้องต้น
9. Constraints
10. Assumptions
11. Open Questions
12. Key Decisions
13. Docker Service Map & Port Mapping
14. Docker Network Rules
15. Environment Variable Strategy
16. Known Setup Risks / Lessons Learned

ในหัวข้อ Known Setup Risks / Lessons Learned ให้ระบุอย่างน้อย:

* Port 5000 อาจชนกับ macOS AirPlay Receiver จึงใช้ backend port 5001
* phpMyAdmin บน Apple Silicon อาจต้องกำหนด `platform: linux/amd64`
* `version` ใน Docker Compose เป็น attribute ที่ล้าสมัย
* `node_modules` ใน Docker ควรใช้ anonymous volume และเมื่อเพิ่ม package ใหม่ต้อง rebuild container
* Backend อาจเชื่อมต่อ DB ไม่ได้ถ้าไม่มี MySQL healthcheck และ `depends_on` ที่รอ DB พร้อม

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`docs/planning/00-tech-stack-decision.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown
* ห้ามเขียน Code
* ห้ามเริ่ม Planning Step 1
* ห้ามเพิ่ม Feature ที่ยังไม่ได้ระบุ
# Prompt 0.2: สร้าง AI Working Rules

คุณคือ AI Workflow Designer และ Senior Software Engineer

ฉันต้องการกำหนดกติกาการทำงานร่วมกับ AI สำหรับโปรเจกต์ Web Application

ตอนนี้อยู่ในช่วงที่ 0: เตรียมกติกาและบริบท

เป้าหมาย:
ต้องการให้ AI ทำงานเป็นระบบ ไม่เขียนโค้ดเกินขอบเขต ไม่ข้าม Phase และไม่เปลี่ยน Architecture เอง

บริบทของโปรเจกต์ที่กติกานี้ต้องรองรับ:

* Project: Damrongdham SSK / ระบบรับเรื่องร้องเรียนศูนย์ดำรงธรรมจังหวัดศรีสะเกษ
* Frontend: React 18 + Vite 5 + MUI 5
* Backend: Node.js 20 LTS + Express 4
* Database: MySQL 8
* Dev Infrastructure: Docker Compose + phpMyAdmin
* Deployment หลัก: Railway แบบ single-container จาก root `Dockerfile`
* Development ports: frontend 5173, backend 5001, MySQL host 3307 -> container 3306, phpMyAdmin 8081 -> 80
* Docker network rule: service ภายใน Docker ต้องคุยกันผ่าน service name และ internal port ไม่ใช้ `localhost`

งานที่ต้องการ:
ช่วยออกแบบ AI Working Rules สำหรับโปรเจกต์นี้ โดยมีหัวข้อ:

1. General AI Rules
2. Planning Rules
3. Implementation Rules
4. Phase Control Rules
5. Code Generation Rules
6. Debugging Rules
7. Documentation Rules
8. Testing Rules
9. Git Commit Rules
10. Forbidden Actions
11. Required Output Format
12. How AI Should Ask Questions
13. How AI Should Handle Unclear Requirements
14. How AI Should Report Changes
15. Docker Development Rules
16. Git / GitHub Workflow Rules
17. Skill / Project Instruction Rules
18. Environment & Secret Handling Rules

กติกาสำคัญที่ต้องมี:

* ห้ามเขียน Code ก่อน Planning เสร็จ
* ห้ามทำเกิน Phase ที่กำหนด
* ห้ามเพิ่ม Feature นอกแผน
* ห้ามเปลี่ยน Tech Stack โดยไม่ได้รับอนุญาต
* ห้ามเปลี่ยน Database Schema, API Contract หรือ Project Structure โดยไม่มีเหตุผล
* ถ้าจำเป็นต้องเปลี่ยนจากแผนเดิม ต้องแจ้งเหตุผลก่อน
* ทุก Phase ต้องมีวิธีรัน วิธีทดสอบ และ Acceptance Criteria
* ทุก Phase ต้องมี Git Commit Message ที่แนะนำ
* หลังจบ Phase ต้องมี Phase Completion Report

Docker Development Rules ที่ต้องระบุ:

* ใช้ `docker-compose.yml` สำหรับ development environment
* ไม่ใส่ `version` ใน `docker-compose.yml`
* ใช้ frontend port 5173 และ backend port 5001
* หลีกเลี่ยง backend port 5000 เพราะ macOS AirPlay Receiver อาจใช้อยู่
* MySQL ใช้ host port 3307 และ container port 3306
* phpMyAdmin ใช้ host port 8081 และ container port 80
* หากใช้ Apple Silicon และ image ไม่รองรับ ARM โดยตรง ให้พิจารณา `platform: linux/amd64` เฉพาะ service ที่จำเป็น
* ใช้ bind mounts สำหรับ source code และ anonymous volume สำหรับ `node_modules`
* Backend/phpMyAdmin ติดต่อ DB ผ่าน service name `db` และ internal port 3306
* MySQL ต้องมี healthcheck และ service ที่พึ่งพา DB ต้องรอ `service_healthy`
* เมื่อเพิ่ม dependency ใหม่ ต้องระบุว่าต้อง rebuild container หรือ restart service เท่านั้น

Git / GitHub Workflow Rules ที่ต้องระบุ:

* ก่อน commit ต้องตรวจสอบ `git status` และตรวจว่า `.env` ไม่ถูก track
* `.gitignore` ต้องครอบคลุม `.env`, `node_modules`, `dist`, logs และไฟล์ local ที่ไม่ควร commit
* ใช้ Conventional Commits เป็นหลัก เช่น `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
* ทุก Phase ต้องเสนอ commit message ที่ชัดเจนและสอดคล้องกับงาน
* README.md ควรอัปเดตเมื่อคำสั่งรัน, dependency, port หรือ workflow เปลี่ยน
* หากต้อง push GitHub ให้ใช้ GitHub CLI (`gh`) ได้ แต่ต้องไม่ทำขั้นตอน login/authorize แทนผู้ใช้โดยไม่แจ้งก่อน
* ห้าม commit secrets, production credentials, token หรือข้อมูลส่วนบุคคลจริง
* หาก repo ยังไม่มี README ที่เพียงพอ ให้แนะนำหัวข้อ README ได้แก่ project name, description, tech stack, install/run, port mapping, Docker commands, folder structure, license/owner

Skill / Project Instruction Rules ที่ต้องระบุ:

* AI ต้องอ่าน project instruction หรือ skill ที่เกี่ยวข้องก่อนเริ่มงานกับโปรเจกต์
* หากมี `.agents/skills/[skill-name]/SKILL.md` ต้องใช้เป็นแหล่งกติกาหลักร่วมกับเอกสาร planning
* ชื่อ skill ควรเป็น lowercase และใช้ `-` คั่น เช่น `damrongdham-dev`
* `SKILL.md` ควรมี YAML frontmatter ที่ประกอบด้วย `name` และ `description` ที่สั้น ชัดเจน และ match กับโปรเจกต์
* skill ควรระบุ When to Use, When NOT to Use, Project Architecture, Service Map & Ports, Network Rules, Environment Variables, Commands, Coding Guidelines, Output Format และ Examples
* ข้อมูลที่ยาว เช่น API spec หรือ DB schema ควรอ้างอิงจากเอกสารใน `docs/planning/` แทนการคัดลอกทั้งหมดลง skill
* เมื่อ architecture, ports, service หรือ convention เปลี่ยน ต้องพิจารณาอัปเดต skill และ planning docs ให้ตรงกัน

Environment & Secret Handling Rules ที่ต้องระบุ:

* ใช้ `.env` สำหรับ local development และ `.env.example` สำหรับตัวอย่างค่า
* ห้ามใส่ secret จริงใน source code, prompt, README หรือ planning docs
* production environment ให้ตั้งค่าผ่าน platform env vars เช่น Railway variables
* เมื่อแสดงตัวอย่าง config ให้ใช้ placeholder เท่านั้น

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`docs/planning/00-ai-working-rules.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown
* ห้ามเขียน Code
* ใช้ภาษาชัดเจน เหมาะสำหรับนำไปใช้ควบคุม AI ในทุก Phase 
# Prompt 0.3: สร้าง SKILL.md

คุณคือ Senior Full-stack Developer, AI Coding Assistant Designer และ Technical Lead

ฉันต้องการสร้างไฟล์ `SKILL.md` สำหรับใช้เป็นคู่มือการทำงานของ AI ในโปรเจกต์ Web Application

ตำแหน่งไฟล์:

`.agents/skills/damrongdham-dev/SKILL.md` (repo นี้ใช้ Antigravity IDE — เก็บ SKILL.md ในโฟลเดอร์ .agents)

วัตถุประสงค์ของไฟล์นี้:

* บอก AI ว่าต้องทำงานอย่างไร
* กำหนดมาตรฐานการเขียนโค้ด
* กำหนดกติกาการทำงานเป็น Phase
* กำหนดข้อห้าม
* กำหนดรูปแบบคำตอบที่ AI ต้องส่งกลับ
* ใช้ร่วมกับ `docs/planning/PROJECT_CONTEXT.md`
* ใช้ร่วมกับ `docs/planning/10-implementation-plan.md`

Tech Stack:

* Frontend: React 18 + Vite 5 + MUI 5
* Backend: Node.js 20 LTS + Express 4
* Database: MySQL 8
* Docker: Docker Compose (Dev)
* Database Tool: phpMyAdmin (Dev)
* Deploy: Railway (single-container จาก Dockerfile multi-stage — ไม่ใช้ Nginx แยก)

งานที่ต้องการ:
ช่วยสร้างเนื้อหา `SKILL.md` โดยมีหัวข้อ:

1. Purpose
2. Project Working Principles
3. AI General Rules
4. Planning Rules
5. Implementation by Phase Rules
6. Frontend Development Rules
7. Backend Development Rules
8. Database Development Rules
9. API Development Rules
10. Docker Development Rules
11. Testing Rules
12. Debugging Rules
13. Documentation Rules
14. Git Commit Rules
15. Security Rules
16. Forbidden Actions
17. Required Response Format
18. Phase Completion Report Format

กติกาสำคัญที่ต้องมี:

* AI ต้องอ่าน `SKILL.md` ก่อนเริ่มทำงานทุกครั้ง
* AI ต้องอ่าน `docs/planning/PROJECT_CONTEXT.md` ก่อนเริ่ม Implementation
* AI ต้องอ่าน `docs/planning/10-implementation-plan.md` ก่อนทำแต่ละ Phase
* ทำเฉพาะ Phase ที่ได้รับมอบหมายเท่านั้น
* ห้ามทำ Phase ถัดไปล่วงหน้า
* ห้ามเพิ่ม Feature นอกเหนือจาก Planning
* ห้ามเปลี่ยน Architecture ถ้าไม่จำเป็น
* ถ้าต้องเปลี่ยน ต้องแจ้งเหตุผลก่อน
* ทุกครั้งที่สร้างหรือแก้ไฟล์ ต้องระบุไฟล์ที่เกี่ยวข้อง
* ทุก Phase ต้องมีวิธีรัน วิธีทดสอบ และ Acceptance Criteria Checklist
* ทุก Phase ต้องมี Git Commit Message ที่แนะนำ

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`SKILL.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown ของไฟล์
* ห้ามเขียน Code Implementation
* ให้เขียนเป็นคู่มือที่ AI อ่านแล้วทำตามได้ทันที
# Prompt 0.4: กำหนดโครงสร้างเอกสารและไฟล์ Planning

คุณคือ Technical Writer และ Software Project Manager

ฉันต้องการกำหนดโครงสร้างเอกสารของโปรเจกต์ก่อนเริ่ม Planning Only

ตอนนี้อยู่ในช่วงที่ 0: เตรียมกติกาและบริบท

งานที่ต้องการ:
ช่วยออกแบบ Documentation Structure สำหรับโปรเจกต์ Web Application โดยต้องมี:

1. โครงสร้างโฟลเดอร์ `docs/`
2. โครงสร้าง `docs/planning/`
3. โครงสร้าง `docs/testing/`
4. โครงสร้าง `docs/deployment/`
5. รายชื่อไฟล์ Planning ที่ต้องสร้าง
6. ลำดับการสร้างไฟล์
7. วัตถุประสงค์ของแต่ละไฟล์
8. กติกาการตั้งชื่อไฟล์
9. กติกาการเขียน Markdown
10. วิธีใช้เอกสารเหล่านี้กับ AI ในแต่ละ Phase

ไฟล์ Planning ที่ควรมี:

* `00-tech-stack-decision.md`
* `00-ai-working-rules.md`
* `01-system-overview.md`
* `02-requirements.md`
* `03-roles-permissions.md`
* `04-complaint-workflow.md`
* `05-database-design.md`
* `06-api-contract.md`
* `07-frontend-pages.md`
* `08-dashboard-report-notification.md`
* `09-project-docker-architecture.md`
* `PROJECT_CONTEXT.md`
* `10-implementation-plan.md`

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`docs/planning/00-documentation-structure.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown
* ห้ามเขียน Code
* ใช้ตารางเมื่อเหมาะสม
# Prompt 0.5: กำหนด Git Workflow และ Commit Rules

คุณคือ Senior Software Engineer และ Git Workflow Consultant

ฉันต้องการกำหนด Git Workflow สำหรับโปรเจกต์ Web Application ที่พัฒนาด้วย AI

ตอนนี้อยู่ในช่วงที่ 0: เตรียมกติกาและบริบท

เป้าหมาย:
ต้องการให้การทำงานกับ AI มีจุดย้อนกลับชัดเจน โดยเฉพาะหลังจบแต่ละ Planning Step และหลังจบแต่ละ Implementation Phase

งานที่ต้องการ:
ช่วยออกแบบ Git Workflow โดยมีหัวข้อ:

1. Branch Strategy
2. Commit Convention
3. Commit Message Format
4. When to Commit
5. Commit per Planning Step
6. Commit per Implementation Phase
7. Commit after Bug Fix
8. Rollback Strategy
9. Files that Should Be Committed
10. Files that Should Not Be Committed
11. Suggested `.gitignore` Rules
12. Example Commit Messages

ตัวอย่าง commit message ที่ต้องการ:

* `docs: add tech stack decision`
* `docs: add AI working rules`
* `docs: add system overview`
* `docs: add project context`
* `feat: complete phase 1 project setup`
* `fix: resolve backend database connection`
* `chore: update docker compose configuration`

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`docs/planning/00-git-workflow.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown
* ห้ามเขียน Code Implementation
* สามารถแนะนำตัวอย่าง `.gitignore` เบื้องต้นได้ แต่ไม่ต้องสร้างไฟล์จริง
# Prompt 0.6: ตรวจความพร้อมก่อนเข้าสู่ Planning Only

คุณคือ Technical Lead และ Project Manager

ฉันต้องการตรวจความพร้อมของช่วงที่ 0 ก่อนเข้าสู่ช่วงที่ 1: Planning Only

เอกสารที่มีแล้ว:

1. `SKILL.md`
2. `docs/planning/00-tech-stack-decision.md`
3. `docs/planning/00-ai-working-rules.md`
4. `docs/planning/00-documentation-structure.md`
5. `docs/planning/00-git-workflow.md`

งานที่ต้องการ:
ช่วยตรวจสอบว่าเอกสารช่วงที่ 0 พร้อมสำหรับเข้าสู่ Planning Only หรือไม่

ให้ตรวจตามหัวข้อ:

1. Tech Stack ชัดเจนหรือไม่
2. AI Working Rules ครบหรือไม่
3. SKILL.md ใช้ควบคุม AI ได้จริงหรือไม่
4. โครงสร้าง docs พร้อมหรือไม่
5. Git Workflow ชัดเจนหรือไม่
6. มีข้อขัดแย้งระหว่างเอกสารหรือไม่
7. มีสิ่งใดที่ยังขาดก่อนเริ่ม Planning Step 1 หรือไม่
8. มีความเสี่ยงอะไรบ้าง
9. ต้องแก้ไขเอกสารใดก่อนหรือไม่
10. พร้อมเข้าสู่ Planning Only หรือยัง

ให้ตอบเป็น:

* Readiness Summary
* Checklist
* Missing Items
* Risks
* Recommended Fixes
* Final Decision: Ready / Not Ready

ให้จัดทำผลลัพธ์เป็น Markdown สำหรับบันทึกเป็นไฟล์:

`docs/planning/00-readiness-check.md`

เงื่อนไข:

* ให้แสดงเฉพาะเนื้อหา Markdown
* ห้ามเขียน Code
* ถ้ายังไม่พร้อม ให้บอกชัดเจนว่าต้องแก้อะไรก่อน