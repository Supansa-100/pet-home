# 05 — การออกแบบฐานข้อมูล (Database Design Overview)

> **โปรเจกต์:** PET-HOME — แพลตฟอร์มสื่อกลางหาบ้านให้สัตว์เลี้ยง
> **เอกสาร:** Step 1.5 | Phase 1 — Planning Only
> **ผู้รับผิดชอบ:** Senior Database Architect / Backend Architect
> **DBMS:** MySQL 8 (InnoDB, utf8mb4)

เอกสารนี้แสดงภาพรวมการออกแบบโครงสร้างฐานข้อมูล (Database Schema) เพื่อรองรับ Requirement และ Workflow ของระบบ PET-HOME ทั้งหมด โดยออกแบบให้มีความยืดหยุ่น รองรับการขยายตัว และมีการเก็บประวัติที่ตรวจสอบได้ (Audit Log)

---

## 1. หมวดหมู่ตาราง (Table Categories)

เพื่อให้ระบบเป็นระเบียบ เราแบ่งตารางออกเป็น 3 หมวดหมู่หลัก ดังนี้:

### 1.1 ตาราง Master Data (ข้อมูลอ้างอิงหลัก)
- `users`: เก็บข้อมูลบัญชีผู้ใช้งานทั้งหมด
- `pet_categories`: เก็บข้อมูลชนิดสัตว์เลี้ยงหลัก (เช่น สุนัข, แมว)
- `pet_breeds`: เก็บข้อมูลสายพันธุ์ (ผูกกับ Category)

### 1.2 ตาราง Transaction (ข้อมูลที่มีการเปลี่ยนแปลงบ่อยตาม Workflow)
- `pet_listings`: เก็บโพสต์ประกาศหาบ้าน
- `pet_images`: เก็บรูปภาพสัตว์เลี้ยง (รองรับหลายรูปต่อ 1 ประกาศ)
- `adoption_requests`: เก็บคำขอรับอุปการะ
- `chat_rooms`: เก็บห้องสนทนา (ผูกกับคำขอรับอุปการะ)
- `chat_messages`: เก็บข้อความสนทนาภายในห้องแชท

### 1.3 ตาราง Log / History (ข้อมูลประวัติและการทำ Audit)
- `status_histories`: เก็บประวัติการเปลี่ยนสถานะ (Status Tracking) สำหรับประกาศและคำขอ
- `audit_logs`: เก็บบันทึกการกระทำที่สำคัญในระบบ (System Audit Log)

---

## 2. รายละเอียดตารางและ Field สำคัญ (Table Details & Key Fields)

*(หมายเหตุ: ทุกตารางจะมี `created_at` และ `updated_at` เป็นมาตรฐานพื้นฐาน)*

### 2.1 Table: `users`
- **วัตถุประสงค์:** จัดเก็บข้อมูลผู้ใช้งานระบบ
- **Primary Key:** `id` (BIGINT)
- **Key Fields:** 
  - `email` (VARCHAR, UNIQUE)
  - `password_hash` (VARCHAR)
  - `first_name`, `last_name` (VARCHAR)
  - `phone_number` (VARCHAR, NULLABLE)
  - `role` (ENUM: 'user', 'admin')
  - `status` (ENUM: 'active', 'banned')

### 2.2 Table: `pet_categories`
- **วัตถุประสงค์:** จัดเก็บหมวดหมู่ชนิดสัตว์หลัก เพื่อใช้ทำ Filter ค้นหา
- **Primary Key:** `id` (INT)
- **Key Fields:** `name_th`, `name_en`, `is_active`

### 2.3 Table: `pet_breeds`
- **วัตถุประสงค์:** จัดเก็บสายพันธุ์เพื่อเป็นมาตรฐานให้ User เลือกแทนการพิมพ์เอง
- **Primary Key:** `id` (INT)
- **Foreign Key:** `category_id` (อ้างอิง `pet_categories.id`)
- **Key Fields:** `name_th`, `name_en`, `is_active`

### 2.4 Table: `pet_listings`
- **วัตถุประสงค์:** เก็บข้อมูลประกาศสัตว์เลี้ยง
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** 
  - `owner_id` (อ้างอิง `users.id`)
  - `category_id` (อ้างอิง `pet_categories.id`)
  - `breed_id` (อ้างอิง `pet_breeds.id`, NULLABLE กรณีพันธุ์ผสมไม่ทราบชื่อ)
- **Key Fields:**
  - `name` (VARCHAR)
  - `gender` (ENUM: 'male', 'female', 'unknown')
  - `age_months` (INT)
  - `size` (ENUM: 'small', 'medium', 'large')
  - `color` (VARCHAR)
  - `health_detail` (TEXT)
  - `adoption_conditions` (TEXT)
  - `province` (VARCHAR)
  - `status` (ENUM: 'available', 'pending', 'adopted', 'closed', 'hidden')

### 2.5 Table: `pet_images`
- **วัตถุประสงค์:** เก็บ URL รูปภาพสัตว์เลี้ยง (แยกตารางเพื่อรองรับได้ 1-5 รูป)
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** `listing_id` (อ้างอิง `pet_listings.id`)
- **Key Fields:** `image_url` (VARCHAR), `display_order` (INT)

### 2.6 Table: `adoption_requests`
- **วัตถุประสงค์:** เก็บข้อมูลคำขอรับอุปการะ
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** 
  - `listing_id` (อ้างอิง `pet_listings.id`)
  - `adopter_id` (อ้างอิง `users.id`)
- **Key Fields:**
  - `introduction_text` (TEXT)
  - `status` (ENUM: 'pending', 'approved', 'rejected', 'cancelled')

### 2.7 Table: `chat_rooms`
- **วัตถุประสงค์:** เก็บข้อมูลห้องสนทนา
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** `request_id` (อ้างอิง `adoption_requests.id` แบบ 1:1)

### 2.8 Table: `chat_messages`
- **วัตถุประสงค์:** เก็บข้อความที่สนทนากัน
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** 
  - `room_id` (อ้างอิง `chat_rooms.id`)
  - `sender_id` (อ้างอิง `users.id`)
- **Key Fields:** `message_text` (TEXT), `is_read` (BOOLEAN)

### 2.9 Table: `status_histories`
- **วัตถุประสงค์:** เก็บรอยเท้า (Tracking) ว่าประกาศ หรือ คำขอ ถูกเปลี่ยนสถานะเมื่อไหร่ ใครเป็นคนเปลี่ยน และเปลี่ยนด้วยสาเหตุอะไร
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** `changed_by_user_id` (อ้างอิง `users.id`)
- **Key Fields:**
  - `entity_type` (ENUM: 'pet_listing', 'adoption_request')
  - `entity_id` (BIGINT) - ชี้ไปหา ID ตาม Type ด้านบน (Polymorphic-like)
  - `old_status` (VARCHAR)
  - `new_status` (VARCHAR)
  - `reason_text` (VARCHAR, NULLABLE)

### 2.10 Table: `audit_logs`
- **วัตถุประสงค์:** เก็บบันทึกประวัติการกระทำสำคัญในระบบ เช่น แอดมินลบโพสต์ หรือแอดมินแบนยูสเซอร์ เพื่อให้สามารถตรวจสอบย้อนหลังได้ (Accountability)
- **Primary Key:** `id` (BIGINT)
- **Foreign Key:** `action_by_user_id` (อ้างอิง `users.id`)
- **Key Fields:** 
  - `action_type` (VARCHAR) เช่น 'BAN_USER', 'HIDE_LISTING'
  - `target_entity` (VARCHAR)
  - `target_id` (BIGINT)
  - `payload_details` (JSON) เก็บข้อมูลย่อยๆ
  - `ip_address` (VARCHAR)

---

## 3. สรุปความสัมพันธ์ระหว่างตาราง (Relationships Overview)

- **User (1) ➔ (M) Pet Listing**: ผู้ใช้ 1 คน สามารถลงประกาศได้หลายประกาศ
- **Pet Listing (1) ➔ (M) Pet Image**: 1 ประกาศ สามารถมีรูปภาพได้หลายรูป (สูงสุด 5 รูป ควบคุมที่ Business Logic)
- **Pet Listing (1) ➔ (M) Adoption Request**: 1 ประกาศ สามารถมีผู้ส่งคำขอได้หลายคน
- **User (1) ➔ (M) Adoption Request**: 1 User (Adopter) สามารถยื่นคำขอไปได้หลายประกาศ
- **Adoption Request (1) ➔ (1) Chat Room**: 1 คำขอ จะผูกกับ 1 ห้องแชทเท่านั้น
- **Chat Room (1) ➔ (M) Chat Message**: 1 ห้องแชท มีข้อความสนทนาได้จำนวนมาก
- **Category (1) ➔ (M) Breed**: 1 หมวดหมู่ชนิดสัตว์ มีสายพันธุ์ได้หลากหลาย

---

## 4. ข้อควรระวังเรื่องข้อมูลส่วนบุคคล (Data Privacy & Security)

ในขั้นตอนการทำ Database และ API Design มีข้อพึงระวังดังนี้:
1. **Password Hashing:** ต้องไม่เก็บรหัสผ่านเป็น Plain Text เด็ดขาด แนะนำให้ใช้ Algorithm เช่น `bcrypt` 
2. **Sensitive Information:** ฟิลด์ `phone_number` ถูกกำหนดให้สามารถรับค่าว่างได้ (Nullable) เพื่อไม่เป็นการบังคับ ผู้ใช้อาจไม่ต้องการเปิดเผยเบอร์โทรศัพท์ และควรตกลงแลกเบอร์กันทางห้องแชทจะปลอดภัยกว่า
3. **Soft Delete vs Hard Delete:** 
   - เพื่อป้องกันข้อมูลสูญหายกรณีข้อพิพาท กรณี Admin ลงโทษ ให้ใช้การ Update `status` เป็น `banned` หรือ `hidden` (Soft approach) แทนที่จะลบแถวข้อมูลทิ้ง (Hard Delete) ทันที
   - การทำ Hard Delete จะอนุญาตเฉพาะเจ้าของบัญชีประสงค์ลบบัญชีตนเองตามหลักสิทธิส่วนบุคคล (PDPA)
4. **Data Injection / Encoding:** ฐานข้อมูลใช้ Collation `utf8mb4` เพื่อให้รองรับภาษาไทยแบบสมบูรณ์ รวมถึง Emoji ในหน้า Chat ได้อย่างไม่มีปัญหา
