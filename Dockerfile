# =============================================================
# PET-HOME — Multi-stage Dockerfile (Target A: Single Container)
# Stage 1 build React → Stage 2 ให้ Express เสิร์ฟทั้งเว็บและ API
# =============================================================

# ---------- Stage 1: Build Frontend ----------
FROM node:20-alpine AS frontend-build

WORKDIR /build

# ติดตั้ง dependencies ก่อน เพื่อให้ Docker cache layer นี้ไว้
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# คัดลอกซอร์สแล้ว build เป็นไฟล์ static
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: Backend Runtime ----------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# ติดตั้งเฉพาะ dependencies ที่ใช้ตอนรันจริง (ไม่เอา devDependencies)
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# คัดลอกโค้ด backend และสคริปต์สร้างฐานข้อมูล
COPY backend/src ./src
COPY backend/db ./db

# คัดลอกผลลัพธ์ React จาก Stage 1 มาไว้ให้ Express เสิร์ฟ
COPY --from=frontend-build /build/dist ./public

# รันด้วยผู้ใช้ที่ไม่ใช่ root เพื่อความปลอดภัย
USER node

EXPOSE 5001

CMD ["node", "src/server.js"]
