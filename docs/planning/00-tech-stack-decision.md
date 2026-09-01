# Tech Stack Decision — PET-HOME

เอกสารนี้ระบุเทคโนโลยีหลักที่ใช้พัฒนาโปรเจกต์ PET-HOME และเหตุผลประกอบการตัดสินใจ

## Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5 (เนื่องจากทำงานได้เร็วกว่า Create React App และรองรับ Hot Module Replacement ได้อย่างมีประสิทธิภาพ)
- **UI Library**: Material-UI (MUI) 5 (มี Component ให้ใช้ครบถ้วน และมีระบบ Theme ที่ยืดหยุ่น)
- **Routing**: React Router DOM v6
- **Port**: 5173

## Backend
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Database Driver**: `mysql2/promise` (รองรับ Async/Await อย่างสมบูรณ์)
- **Authentication**: JWT (`jsonwebtoken`) และ `bcryptjs` สำหรับ Hash รหัสผ่าน
- **File Upload**: Multer (สำหรับ Phase 3)
- **Port**: 5001 (หลีกเลี่ยงการใช้ 5000 เนื่องจากอาจชนกับระบบ AirPlay บนระบบปฏิบัติการ macOS)

## Database
- **Engine**: MySQL 8
- **Encoding**: `utf8mb4` (เพื่อให้รองรับการเก็บข้อมูลภาษาไทยและ Emoji ได้สมบูรณ์)
- **Port**: 3306 (ภายใน Docker), 3307 (ภายนอก Host)

## Infrastructure & DevOps
- **Local Development**: Docker และ Docker Compose (ช่วยให้ Environment ในการพัฒนาตรงกันระหว่างนักพัฒนา)
- **Deployment**: Railway
- **Architecture**: Single-container deployment โดยใช้ Multi-stage Dockerfile เพื่อ Build Frontend ไปเสิร์ฟใน Express (ไม่ใช้ Nginx เป็น Reverse Proxy เนื่องจาก Railway จัดการส่วนนี้ให้แล้ว)

## Chat System
- **Communication Pattern**: HTTP Polling (เวอร์ชันแรก)
  - เหตุผล: ง่ายต่อการ Implement ใน Express โดยไม่ต้องเพิ่ม dependency ใหม่ (ไม่ต้องใช้ WebSocket/Socket.io)
  - Polling interval: ทุก 5 วินาที (Frontend เรียก API `/api/chat/rooms/:id` ซ้ำ)
- **Storage**: MySQL — ตาราง `chat_rooms` และ `chat_messages` (ไม่ใช้ Redis หรือ external service)
- **Future Upgrade**: สามารถเปลี่ยนเป็น WebSocket / Socket.io ในภายหลัง โดยไม่กระทบ DB Schema
