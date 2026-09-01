# API Contract - PET-HOME

เอกสารนี้ระบุ REST API Contract เบื้องต้นสำหรับระบบ PET-HOME อ้างอิงจาก Database Design Overview และ Workflow ก่อนหน้า โดยแบ่งตาม Module หลักของระบบ

---

## 1. Auth (ระบบยืนยันตัวตน)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| POST | `/api/v1/auth/register` | สมัครสมาชิก | `{ email, password, firstName, lastName, role }` | `{ token, user }` | ❌ | Any | - |
| POST | `/api/v1/auth/login` | เข้าสู่ระบบ | `{ email, password }` | `{ token, user }` | ❌ | Any | คืนค่า JWT |
| POST | `/api/v1/auth/forgot-password` | ลืมรหัสผ่าน | `{ email }` | `{ message }` | ❌ | Any | - |
| POST | `/api/v1/auth/reset-password` | ตั้งรหัสผ่านใหม่ | `{ token, newPassword }` | `{ message }` | ❌ | Any | - |
| GET | `/api/v1/auth/me` | ตรวจสอบ Session/Profile | N/A | `{ user }` | ✅ | All | ใช้ JWT |

---

## 2. Users & Profiles (ระบบจัดการผู้ใช้และโปรไฟล์)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/users/profile` | ดึงข้อมูลโปรไฟล์ส่วนตัว | N/A | `{ profile }` | ✅ | All | - |
| PUT | `/api/v1/users/profile` | แก้ไขข้อมูลโปรไฟล์ | `{ firstName, lastName, phone, address, avatarUrl }` | `{ profile }` | ✅ | All | - |
| GET | `/api/v1/users` | ดึงรายชื่อผู้ใช้ (มี Paging) | N/A (มี Query Params) | `[{ users }], pagination` | ✅ | Admin | - |
| GET | `/api/v1/users/:id` | ดูข้อมูลผู้ใช้รายบุคคล | N/A | `{ user }` | ✅ | Admin | - |
| PUT | `/api/v1/users/:id/status` | เปลี่ยนสถานะผู้ใช้ (แบน/เปิด) | `{ isActive }` | `{ message }` | ✅ | Admin | - |

---

## 3. Master Data (ระบบข้อมูลพื้นฐาน)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/master/provinces` | ดึงข้อมูลจังหวัด | N/A | `[{ id, name }]` | ❌ | Any | ใช้ในฟอร์มเลือกพื้นที่ |
| GET | `/api/v1/master/districts/:provinceId` | ดึงข้อมูลอำเภอตามจังหวัด | N/A | `[{ id, name }]` | ❌ | Any | - |

---

## 4. Pet Categories (ระบบหมวดหมู่สัตว์เลี้ยง)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/categories` | ดึงชนิดสัตว์ทั้งหมด (หมา,แมว) | N/A | `[{ id, name, icon }]` | ❌ | Any | - |
| GET | `/api/v1/categories/:id/breeds` | ดึงสายพันธุ์ย่อยตามชนิดสัตว์ | N/A | `[{ id, name }]` | ❌ | Any | - |
| POST | `/api/v1/categories` | เพิ่มหมวดหมู่ใหม่ | `{ name, icon }` | `{ category }` | ✅ | Admin | - |
| PUT | `/api/v1/categories/:id` | แก้ไขหมวดหมู่ | `{ name, icon }` | `{ category }` | ✅ | Admin | - |
| DELETE | `/api/v1/categories/:id` | ลบหมวดหมู่ | N/A | `{ message }` | ✅ | Admin | Soft Delete |

---

## 5. Pet Listings (ระบบประกาศหาบ้าน)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/pets` | ค้นหาประกาศ (Feed) | Query: `categoryId, breed, location, page, limit` | `[{ pets }], pagination` | ❌ | Any | ค้นหาและ Filter |
| GET | `/api/v1/pets/:id` | ดูรายละเอียดประกาศเฉพาะตัว | N/A | `{ petDetail, ownerInfo }` | ❌ | Any | - |
| POST | `/api/v1/pets` | สร้างประกาศหาบ้านใหม่ | `{ title, description, categoryId, breed, age, gender, images }` | `{ pet }` | ✅ | Owner | - |
| PUT | `/api/v1/pets/:id` | แก้ไขประกาศของตนเอง | `{ title, description, images, status }` | `{ pet }` | ✅ | Owner | - |
| DELETE | `/api/v1/pets/:id` | ลบ/ยกเลิกประกาศ | N/A | `{ message }` | ✅ | Owner, Admin | Soft Delete |
| PUT | `/api/v1/pets/:id/status` | อัปเดตสถานะ (หาบ้าน, ได้บ้านแล้ว) | `{ status: 'AVAILABLE', 'ADOPTED' }` | `{ pet }` | ✅ | Owner | - |

---

## 6. Adoption Requests (ระบบคำขอรับอุปการะ)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| POST | `/api/v1/requests` | ส่งคำขอรับเลี้ยงสัตว์ | `{ petId, message, contactInfo }` | `{ request }` | ✅ | Adopter | - |
| GET | `/api/v1/requests/my-requests` | ดูคำขอที่ตนเองเคยส่ง (Adopter)| N/A | `[{ requests }]` | ✅ | Adopter | - |
| GET | `/api/v1/requests/received` | ดูคำขอที่ส่งมาถึงตนเอง (Owner) | Query: `petId` | `[{ requests }]` | ✅ | Owner | - |
| GET | `/api/v1/requests/:id` | ดูรายละเอียดของคำขอ | N/A | `{ requestDetails }` | ✅ | Owner, Adopter | - |
| PUT | `/api/v1/requests/:id/status` | อนุมัติ/ปฏิเสธคำขอ | `{ status: 'APPROVED' หรือ 'REJECTED', note }` | `{ request }` | ✅ | Owner | เมื่ออนุมัติ จะโยงไปเปลี่ยนสถานะสัตว์ |

---

## 7. Chat & Status (ระบบแชทและอัปเดตสถานะ)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| POST | `/api/v1/chats/initiate` | เริ่มการสนทนาจากประกาศ | `{ petId, receiverId }` | `{ chatRoomId }` | ✅ | Owner, Adopter | - |
| GET | `/api/v1/chats` | ดึงรายการห้องแชทของตนเอง | N/A | `[{ chats, unreadCount }]` | ✅ | Owner, Adopter | - |
| GET | `/api/v1/chats/:id/messages` | ดึงประวัติข้อความในห้องแชท | Query: `page, limit` | `[{ messages }]` | ✅ | Owner, Adopter | ต้องเป็นสมาชิกห้อง |
| POST | `/api/v1/chats/:id/messages` | ส่งข้อความใหม่ | `{ messageType, content }` | `{ message }` | ✅ | Owner, Adopter | รองรับการทำ Socket.io ด้วย |

---

## 8. Media & Attachments (ระบบจัดการไฟล์และรูปภาพ)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| POST | `/api/v1/upload` | อัปโหลดรูปภาพ/ไฟล์ | `FormData (file)` | `{ url, publicId }` | ✅ | All | รองรับ Cloudinary หรือ S3 |
| DELETE | `/api/v1/upload/:publicId` | ลบไฟล์ | N/A | `{ message }` | ✅ | All, Admin | ลบเมื่อยกเลิกโพสต์ |

---

## 9. Notifications (ระบบแจ้งเตือน)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/notifications` | ดึงรายการแจ้งเตือน | N/A | `[{ notifications }]` | ✅ | All | - |
| PUT | `/api/v1/notifications/:id/read` | มาร์คว่าอ่านแล้ว 1 รายการ | N/A | `{ success: true }` | ✅ | All | - |
| PUT | `/api/v1/notifications/read-all`| มาร์คว่าอ่านแล้วทั้งหมด | N/A | `{ success: true }` | ✅ | All | - |

---

## 10. Dashboard (แผงควบคุมสถิติ)

| Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Req. | Role | หมายเหตุ |
|---|---|---|---|---|:---:|---|---|
| GET | `/api/v1/dashboard/admin/summary`| ข้อมูลสถิติระบบภาพรวม | N/A | `{ totalUsers, activePets, successRate }` | ✅ | Admin | - |
| GET | `/api/v1/dashboard/user/summary` | ข้อมูลสถิติส่วนตัว | N/A | `{ totalPosts, requestsSent }` | ✅ | Owner, Adopter | - |
