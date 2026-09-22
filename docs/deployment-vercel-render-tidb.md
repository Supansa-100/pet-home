# คู่มือ Deploy: TiDB Cloud + Render + Vercel

คู่มือนี้อธิบายวิธีนำ PET-HOME ขึ้นใช้งานจริงแบบ **แยก 3 บริการ** (ทุกบริการมีแพ็กเกจฟรี)

| ส่วน | บริการ | หน้าที่ |
| :--- | :--- | :--- |
| ฐานข้อมูล | TiDB Cloud Serverless | MySQL-compatible ฟรี 5 GB |
| Backend (API) | Render | รัน Node.js/Express |
| Frontend (เว็บ) | Vercel | เสิร์ฟไฟล์ static ที่ build จาก React |

> **ต่างจากวิธีใน README อย่างไร:** README อธิบายแบบ *Single Container* (Express เสิร์ฟทั้งเว็บและ API
> จากโดเมนเดียว) ส่วนคู่มือนี้แยกคนละโดเมน จึงต้องตั้งค่า **CORS** และ **VITE_BACKEND_URL** เพิ่ม
> เลือกทำอย่างใดอย่างหนึ่ง ไม่ต้องทำทั้งสองแบบ

---

## ลำดับการทำงาน

ต้องทำตามลำดับนี้ เพราะแต่ละขั้นต้องใช้ค่าจากขั้นก่อนหน้า

```
1. TiDB Cloud  ──(ได้ host/user/password)──►  2. Render  ──(ได้ URL ของ API)──►  3. Vercel
                                                   ▲                                  │
                                                   └──(ได้ URL ของเว็บ)───────────────┘
                                                      4. กลับมาตั้ง FRONTEND_URL
```

ขั้นที่ 4 คือจุดที่คนพลาดบ่อยที่สุด — ถ้าข้ามไป เว็บจะเปิดได้แต่ล็อกอินไม่ได้ เพราะ CORS บล็อก

---

## ขั้นที่ 1: สร้างฐานข้อมูลบน TiDB Cloud

1. สมัครที่ [tidbcloud.com](https://tidbcloud.com) แล้วสร้าง Cluster แบบ **Serverless** (ฟรี)
   - เลือก Region ใกล้ไทยที่สุด เช่น `Singapore (ap-southeast-1)` เพื่อให้ latency ต่ำ
2. กดปุ่ม **Connect** แล้วเลือกภาษา/เครื่องมือเป็น **General** หรือ **Node.js** จะได้ค่าหน้าตาแบบนี้

   | ค่า | ตัวอย่าง |
   | :--- | :--- |
   | Host | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
   | Port | `4000` |
   | User | `2AbCdEfGhIj.root` |
   | Password | กด **Generate Password** แล้ว **คัดลอกเก็บไว้ทันที** (ระบบแสดงครั้งเดียว) |

3. **เก็บค่าทั้ง 4 ไว้** จะใช้ในขั้นที่ 2

> **ไม่ต้องสร้าง database เองและไม่ต้องรันไฟล์ SQL ใดๆ**
> ตอน backend สตาร์ทครั้งแรก มันจะสร้าง database `pethome_db` และตารางทั้งหมดให้อัตโนมัติ
> (ดู `backend/src/config/db.js` ฟังก์ชัน `ensureDatabaseExists` และ `backend/src/config/initDB.js`)

### ข้อควรรู้เรื่อง TiDB

- **บังคับใช้ TLS** ต้องตั้ง `DB_SSL=true` เสมอ ไม่งั้นต่อไม่ติด
- **พอร์ตคือ 4000** ไม่ใช่ 3306 ที่คุ้นเคย
- **ขนาดแถวจำกัดราว 6 MB** ระบบนี้เก็บรูปเป็น base64 ลงฐานข้อมูลโดยตรงและ*ไม่ได้บีบอัด*
  รูปที่ใหญ่เกิน ~4.5 MB จะกลายเป็น base64 เกิน 6 MB แล้ว **อัปโหลดไม่ผ่าน**
  แนะนำให้ย่อรูปก่อนอัปโหลด หรือเพิ่มการบีบอัดฝั่ง frontend ใน `ImageUploader.jsx`

---

## ขั้นที่ 2: Deploy Backend ขึ้น Render

1. Push โค้ดขึ้น GitHub ให้เรียบร้อยก่อน
2. ที่ [render.com](https://render.com) เลือก **New → Web Service** แล้วเชื่อมกับ repo นี้
3. ตั้งค่าตามนี้ (สำคัญ: ต้องชี้ Root Directory ไปที่ `backend`)

   | ช่อง | ค่า |
   | :--- | :--- |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm ci` |
   | Start Command | `node src/server.js` |
   | Health Check Path | `/health` |
   | Instance Type | `Free` |

4. เพิ่ม **Environment Variables** ทั้งหมดนี้

   | ตัวแปร | ค่า | หมายเหตุ |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | จำเป็น — ทำให้ระบบข้ามการใส่ข้อมูลจำลอง |
   | `DB_HOST` | host จาก TiDB | |
   | `DB_PORT` | `4000` | |
   | `DB_NAME` | `pethome_db` | ระบบสร้างให้เองถ้ายังไม่มี |
   | `DB_USER` | user จาก TiDB (เช่น `xxx.root`) | |
   | `DB_PASSWORD` | password จาก TiDB | |
   | `DB_SSL` | `true` | **ห้ามลืม** TiDB บังคับ TLS |
   | `JWT_SECRET` | สุ่มค่ายาวๆ ที่เดาไม่ได้ | ดูวิธีสุ่มด้านล่าง |
   | `FRONTEND_URL` | `http://localhost:5173` | ใส่ค่าชั่วคราวไปก่อน แล้วกลับมาแก้ในขั้นที่ 4 |
   | `SEED_DEMO_DATA` | `false` | ไม่ใส่สัตว์เลี้ยงปลอมลง production |

   สุ่ม `JWT_SECRET` ด้วยคำสั่งนี้:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

5. กด Deploy แล้วดู **Logs** ควรเห็นข้อความประมาณนี้

   ```
   ✅ MySQL connected: gateway01...tidbcloud.com:4000/pethome_db
   ⏭️  ข้าม 03-seed-mock-data.sql (ข้อมูลจำลอง ไม่รันบน production)
   🎉 Database initialization complete!
   🚀 Server is running on port 10000
   ```

6. ทดสอบว่า API ทำงาน — เปิด `https://<ชื่อ-service>.onrender.com/health` ควรได้ JSON กลับมา
7. **จด URL ของ Render ไว้** เช่น `https://pethome-api.onrender.com`

> มีไฟล์ [`render.yaml`](../render.yaml) เตรียมไว้ให้แล้ว ถ้าใช้ฟีเจอร์ **Blueprint** ของ Render
> จะตั้งค่าส่วนใหญ่ให้อัตโนมัติ เหลือแค่กรอกค่าที่เป็นความลับเอง

### ข้อจำกัดของ Render แพ็กเกจฟรี

- เครื่องจะ **หลับเมื่อไม่มีคนใช้ 15 นาที** คนเข้าเว็บครั้งแรกหลังหลับต้องรอราว 50 วินาที
  (ตอนนำเสนองาน ให้เปิดเว็บทิ้งไว้ก่อนสัก 1 นาที)
- **Cron ของ SLA Alerts จะไม่ทำงานตามเวลา** เพราะเครื่องหลับไปแล้ว
  ถ้าต้องการให้ทำงาน ให้กดปุ่ม "รัน SLA Alerts ทันที" ในหน้า Admin แทน
- ระบบไฟล์เขียนถาวรไม่ได้ — แต่โปรเจกต์นี้เก็บรูปลงฐานข้อมูลอยู่แล้ว จึงไม่กระทบ

---

## ขั้นที่ 3: Deploy Frontend ขึ้น Vercel

1. ที่ [vercel.com](https://vercel.com) เลือก **Add New → Project** แล้วเลือก repo เดียวกัน
2. ตั้งค่า (สำคัญ: ต้องชี้ Root Directory ไปที่ `frontend`)

   | ช่อง | ค่า |
   | :--- | :--- |
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. เพิ่ม **Environment Variable** ตัวเดียว

   | ตัวแปร | ค่า |
   | :--- | :--- |
   | `VITE_BACKEND_URL` | `https://pethome-api.onrender.com` |

   > ใส่**แค่ origin** ไม่ต้องมี `/api` ต่อท้าย เพราะโค้ดเติมให้เอง
   > (ดูไฟล์ตั้งค่ากลาง [`frontend/src/config/env.js`](../frontend/src/config/env.js)
   > และตัวอย่างค่าทั้งหมดที่ [`frontend/.env.example`](../frontend/.env.example))
   >
   > ถ้าเผลอใส่ `/api` หรือ `/` ปิดท้ายมาด้วย ระบบตัดทิ้งให้อัตโนมัติ

4. กด Deploy แล้วจด URL ที่ได้ เช่น `https://pethome.vercel.app`

> ไฟล์ [`frontend/vercel.json`](../frontend/vercel.json) เตรียม **rewrite** ไว้แล้ว
> เพื่อให้กด Refresh ที่หน้าลูก (เช่น `/listings/3`) ไม่เจอ 404
> เพราะ React Router จัดการ path ฝั่งเบราว์เซอร์ ไม่ใช่ฝั่ง server

---

## ขั้นที่ 4: กลับไปตั้ง FRONTEND_URL บน Render

**ขั้นตอนนี้ห้ามข้าม** ไม่งั้นเว็บจะเปิดได้แต่ล็อกอินไม่ได้

1. กลับไปที่ Render → Environment
2. แก้ `FRONTEND_URL` เป็น URL จริงของ Vercel

   ```
   FRONTEND_URL=https://pethome.vercel.app
   ```

3. Save แล้วรอ Render deploy ใหม่อัตโนมัติ

### ถ้าอยากให้ preview URL ของ Vercel ใช้งานได้ด้วย

ทุกครั้งที่ push Vercel จะสร้าง URL ใหม่ (เช่น `https://pethome-git-dev-xxx.vercel.app`)
ซึ่ง CORS จะบล็อกเพราะไม่ตรงกับ `FRONTEND_URL` เลือกแก้ได้ 2 วิธี

- **วิธีที่ 1 (ปลอดภัยกว่า)** ใส่หลาย URL คั่นด้วยคอมมา
  ```
  FRONTEND_URL=https://pethome.vercel.app,https://pethome-git-dev-xxx.vercel.app
  ```
- **วิธีที่ 2 (สะดวกกว่า)** เปิดให้โดเมน `*.vercel.app` ทั้งหมดผ่าน
  ```
  ALLOW_VERCEL_PREVIEWS=true
  ```
  เหมาะกับตอนพัฒนา แต่**ควรปิดเมื่อใช้งานจริง** เพราะใครก็ตามที่มีเว็บบน vercel.app
  จะเรียก API ของคุณจากเบราว์เซอร์ผู้ใช้ได้

---

## ตรวจสอบว่าใช้งานได้จริง

ไล่ตามนี้ทีละข้อ

1. เปิด `https://<render>.onrender.com/health` → ต้องได้ JSON ไม่ใช่หน้า error
2. เปิดเว็บบน Vercel → ต้องเห็นรายการสัตว์เลี้ยง (ถ้ายังไม่มีข้อมูลจะว่าง ถือว่าปกติ)
3. กด **F12 → แท็บ Console** → ต้องไม่มีข้อความสีแดงคำว่า `CORS`
4. กด **F12 → แท็บ Network** → คลิก request ที่ยิงไป ต้องเป็น URL ของ Render ไม่ใช่ URL ของ Vercel
5. สมัครสมาชิกใหม่ 1 บัญชี แล้วล็อกอิน → ต้องผ่าน
6. ลงประกาศ 1 รายการพร้อมรูป → ต้องบันทึกได้และเห็นรูป
7. ปิดเบราว์เซอร์แล้วเปิดใหม่ → ต้องยังล็อกอินอยู่
8. เข้า `https://<vercel>/listings/1` ตรงๆ แล้วกด Refresh → ต้องไม่เจอ 404

### บัญชีผู้ดูแลระบบเริ่มต้น

ไฟล์ `01-init.sql` สร้างบัญชีแอดมินให้อัตโนมัติ

```
email:    admin@pethome.com
password: password123
```

**เข้าไปเปลี่ยนรหัสผ่านทันทีหลัง deploy เสร็จ** ที่หน้าโปรไฟล์

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
| :--- | :--- | :--- |
| Console ขึ้น `blocked by CORS policy` | ยังไม่ได้ทำขั้นที่ 4 หรือใส่ URL ผิด | ตั้ง `FRONTEND_URL` ให้ตรงกับ URL ของ Vercel เป๊ะๆ (ไม่ต้องมี `/` ปิดท้าย) |
| เว็บขึ้นแต่ไม่มีข้อมูล / Network ยิงไป `vercel.app/api` | ลืมตั้ง `VITE_BACKEND_URL` หรือตั้งหลัง build ไปแล้ว | ค่านี้ถูกฝังตอน build ต้อง **Redeploy** ใหม่ทุกครั้งที่แก้ค่า |
| Log ขึ้น `ECONNREFUSED` / `ETIMEDOUT` | ลืมตั้ง `DB_SSL=true` หรือใส่พอร์ตเป็น 3306 | ตั้ง `DB_SSL=true` และ `DB_PORT=4000` |
| Log ขึ้น `Access denied for user` | user/password ผิด | TiDB user ต้องมีจุดและ `root` ต่อท้าย เช่น `2AbCd.root` ไม่ใช่แค่ `root` |
| Render ขึ้น `Missing required environment variables` | กรอก env ไม่ครบ | ต้องมีครบ: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` |
| กด Refresh หน้าลูกแล้ว 404 | Root Directory ไม่ได้ชี้ไป `frontend` จึงไม่ได้อ่าน `vercel.json` | ตั้ง Root Directory = `frontend` แล้ว deploy ใหม่ |
| เข้าเว็บครั้งแรกช้ามาก ~50 วินาที | Render แพ็กเกจฟรีหลับอยู่ | ปกติของแพ็กเกจฟรี เปิดเว็บทิ้งไว้ก่อนใช้งานจริง |
| อัปโหลดรูปใหญ่แล้ว error | รูป base64 เกินขีดจำกัดแถวของ TiDB (~6 MB) | ย่อรูปก่อนอัปโหลด |
| ล็อกอินหลุดทุกครั้งที่ Render deploy ใหม่ | `JWT_SECRET` เปลี่ยนค่า (เช่นใช้ `generateValue`) | ตั้ง `JWT_SECRET` เป็นค่าคงที่ค่าเดียว อย่าเปลี่ยนอีก |

---

## สรุป Environment Variables ทั้งหมด

**Render (backend)**
```
NODE_ENV=production
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=pethome_db
DB_USER=2AbCdEfGhIj.root
DB_PASSWORD=<password จาก TiDB>
DB_SSL=true
JWT_SECRET=<ค่าสุ่มยาวๆ>
FRONTEND_URL=https://pethome.vercel.app
SEED_DEMO_DATA=false
```

**Vercel (frontend)**
```
VITE_BACKEND_URL=https://pethome-api.onrender.com
```
