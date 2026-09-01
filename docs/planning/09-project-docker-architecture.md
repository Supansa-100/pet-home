# Project Structure & Docker Architecture - PET-HOME

เอกสารนี้กำหนดโครงสร้างโฟลเดอร์ของโปรเจกต์ และสถาปัตยกรรมการใช้งาน Docker สำหรับระบบ PET-HOME ทั้งในสภาพแวดล้อมการพัฒนา (Development) และระดับใช้งานจริง (Production)

---

## 1. Project Folder Structure

```text
ta-pethome/
├── frontend/                 # React Application (Vite 5 + MUI 5)
│   ├── public/               # Static assets สำหรับ Frontend
│   ├── src/                  # Source code React
│   │   ├── assets/           # รูปภาพ, ไอคอนต่างๆ
│   │   ├── components/       # Reusable components (ปุ่ม, ฟอร์ม, UI กลาง)
│   │   ├── contexts/         # React Context (Auth, Theme)
│   │   ├── pages/            # Page components (แบ่งตาม Route)
│   │   └── services/         # API Service Calls (Axios)
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                  # Node.js Application (Express 4)
│   ├── src/                  # Source code Node.js
│   │   ├── config/           # Configurations (DB connection, ENV)
│   │   ├── controllers/      # Request handlers (รับ/ตอบ API)
│   │   ├── middlewares/      # Express middlewares (Auth, Error, Upload)
│   │   ├── models/           # Database queries/models (SQL)
│   │   ├── routes/           # API routes definition
│   │   ├── public/           # *** สำหรับ Production: เก็บไฟล์ Build ของ Frontend ***
│   │   └── server.js         # Entry point (Main server file)
│   └── package.json          # Backend dependencies
├── db/                       # Database Configurations
│   └── init/                 # โฟลเดอร์เก็บ SQL scripts สำหรับ Init Database
├── nginx/                    # (สำหรับ On-premise) Nginx configuration
│   └── default.conf
├── docs/                     # Project documentation (โฟลเดอร์เก็บเอกสารเหล่านี้)
├── .env.example              # ตัวอย่าง Environment variables
├── .gitignore                # Git ignore rules
├── docker-compose.yml        # Docker Compose สำหรับ Development
├── docker-compose.prod.yml   # Docker Compose สำหรับ On-premise Production
├── Dockerfile                # Multi-stage Dockerfile สำหรับ Build Production
└── railway.toml              # Configuration สำหรับ Railway Deployment
```

---

## 2. Docker Architecture (Development Environment)

สำหรับการพัฒนาในเครื่อง (Local Dev) จะใช้ `docker-compose.yml` เพื่อให้ทุกอย่างจำลองการทำงานเหมือนจริง

### 2.1 Services & Ports (Local Host -> Container)
| Service Name | Image Base | Host Port | Container Port | หน้าที่ |
| :--- | :--- | :--- | :--- | :--- |
| **frontend** | `node:20` | `5173` | `5173` | รัน Vite dev server สำหรับ UI (React) |
| **backend** | `node:20` | `5001` | `5001` | รัน Express API server (nodemon) |
| **mysql** | `mysql:8` | `3307` | `3306` | ระบบฐานข้อมูล MySQL หลัก |
| **phpmyadmin**| `phpmyadmin` | `8081` | `80` | GUI จัดการฐานข้อมูลทาง Web Browser |

### 2.2 Network & Volumes
*   **Network (`pethome-network`):** ใช้ Bridge network เดียวกันทั้งหมด เพื่อให้ Backend เชื่อมไปยัง MySQL ผ่านชื่อ Service ได้โดยตรง (ใช้ Host: `mysql`)
*   **Volumes สำหรับ MySQL:**
    *   `mysql-data:/var/lib/mysql` (Named Volume): ป้องกันข้อมูล Database หายเวลาลบ Container
    *   `./db/init/:/docker-entrypoint-initdb.d/` (Bind Mount): นำสคริปต์ SQL ตั้งต้นเข้าไปรันอัตโนมัติเมื่อ Container ฐานข้อมูลสร้างใหม่
*   **Volumes สำหรับ Code:** Bind Mount `./frontend:/app` และ `./backend:/app` เพื่อให้ Code อัปเดตทันที (Hot Reload)

---

## 3. Production Environment (2 Targets)

โครงสร้างรองรับการนำไปใช้จริง 2 รูปแบบ

### Target A: Railway (Single-Container Cloud PaaS) - แผนหลัก
*   **แนวคิด:** ใช้ 1 Service (ไม่รวม Managed DB) เพื่อประหยัดทรัพยากรบน Cloud ไม่ใช้ Nginx
*   **กระบวนการ (ผ่าน Multi-stage `Dockerfile` + `railway.toml`):**
    *   **Stage 1 (Builder):** ติดตั้ง NPM ฝั่ง Frontend และรัน `npm run build` จะได้ไฟล์ Static ออกมาที่โฟลเดอร์ `dist`
    *   **Stage 2 (Runtime):** ติดตั้ง NPM ฝั่ง Backend และคัดลอกไฟล์จาก `dist` ใน Stage 1 เข้ามาใส่ที่ `backend/src/public/`
*   **การทำงานตอนรัน:**
    *   Node.js (Express) เป็นผู้รับ Request ทั้งหมดบน Port เดียว (เช่น 8080 หรือตาม ENV PORT)
    *   ถ้า Request ขึ้นต้นด้วย `/api/v1/*` ➡️ วิ่งเข้า Backend Controllers
    *   ถ้า Request ไปที่อื่นๆ ➡️ Express จะ Serve ไฟล์ Static จากโฟลเดอร์ `public/` (หน้าเว็บ React)

### Target B: On-premise (Docker Compose Prod) - แผนสำรอง
*   **แนวคิด:** แยกรัน Services แบบเต็มรูปแบบบน VPS
*   **กระบวนการ (ผ่าน `docker-compose.prod.yml`):**
    *   มี Service `nginx` อ่านไฟล์ `nginx/default.conf` รับหน้าที่ Serve ไฟล์ Frontend ที่ Build แล้ว และทำ Reverse Proxy โยน /api ไปหา `backend`
    *   มี Service `backend` (รัน Express ล้วนๆ)
    *   มี Service `mysql`

---

## 4. Environment Variables ที่จำเป็น

ตั้งค่าไว้ในไฟล์ `.env` (ที่ Backend และ Frontend ดึงไปใช้)

```env
# ==== Backend Settings ====
PORT=5001
NODE_ENV=development

# ==== Database Settings ====
DB_HOST=mysql           # สำคัญ! ต้องเป็นชื่อ Service ใน Docker, หากรันข้างนอกใช้ localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=pethome_db

# ==== Security & Auth ====
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# ==== Frontend Settings ====
VITE_API_URL=http://localhost:5001/api/v1  # ชี้ไปหา API ตอน Develop (ตอน Prod อาจเปลี่ยนเป็น /api/v1)
```

---

## 5. ข้อควรระวังสำคัญ (Caveats & Pitfalls)

1.  **CORS (Cross-Origin Resource Sharing)**
    *   **Dev:** Frontend รันที่ `localhost:5173` ส่วน Backend รันที่ `localhost:5001` เบราว์เซอร์จะบล็อก API ข้ามพอร์ต ดังนั้น Backend ต้องเปิด `app.use(cors())` หรือตีกรอบ origin ไว้ที่ 5173
    *   **Prod (Railway):** Frontend และ Backend ถูกเสิร์ฟจากโดเมนเดียวกัน ปัญหา CORS จะหมดไปโดยธรรมชาติ
2.  **Database Connection String**
    *   Backend ใน Docker **ห้าม** ต่อ DB ผ่าน `localhost` เด็ดขาด เพราะ localhost ของ Backend คือตัวมันเอง ไม่ใช่ Service ฐานข้อมูล ต้องใช้ `DB_HOST=mysql`
    *   แต่ถ้าใช้ GUI (เช่น DBeaver / TablePlus) จาก Windows เข้าไปดู DB ให้ใช้ `localhost:3307` ตามที่ Map Port ไว้
3.  **File Uploads ใน Cloud (Railway)**
    *   ระบบ Cloud ส่วนใหญ่เป็น *Ephemeral Disk* หากอัปโหลดรูปภาพเก็บไว้ในโฟลเดอร์ของแอป รูปภาพจะหายไปเมื่อแอป Rebuild หรือ Restart
    *   **คำแนะนำ:** ระบบ Production ของ PET-HOME ควรต่อกับ Cloud Storage ภายนอก เช่น Cloudinary, AWS S3 หรือ Firebase Storage
4.  **React Router (Client-side Routing)**
    *   ใน Target A (Railway) เนื่องจากไม่มี Nginx จัดการ เมื่อผู้ใช้กด Refresh หน้าเว็บที่ไม่ใช่หน้าแรก (เช่น `/pets/123`) Express จะมองหาไฟล์นั้นและจะเจอ Error 404
    *   **วิธีแก้:** ท้ายไฟล์ `server.js` ต้องใส่ Catch-all route (หลังจาก /api ทั้งหมด) ให้ส่งกลับ `index.html` เสมอ เพื่อให้ React Router ดำเนินการต่อ
        ```javascript
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
        });
        ```
5.  **Windows Docker Watcher**
    *   ถ้า `nodemon` ใน Backend ไม่ยอม Restart ตัวเองเวลาแก้โค้ดบน Windows ให้เติม Flag `--legacy-watch` หรือ `-L` ใน package.json (`nodemon -L src/server.js`)
