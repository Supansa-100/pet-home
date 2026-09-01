# ─── Stage 1: Build Frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS build-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build
# ผลลัพธ์อยู่ที่ /app/frontend/dist/


# ─── Stage 2: Production Server ──────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# ติดตั้ง dependencies backend เท่านั้น (--production)
COPY backend/package*.json ./
RUN npm install --production

# Copy source code backend
COPY backend/ .

# Copy frontend build มาไว้ใน public/ เพื่อให้ backend serve
COPY --from=build-frontend /app/frontend/dist ./public

# Railway จะ inject PORT เอง
EXPOSE 5001

CMD ["node", "src/server.js"]
