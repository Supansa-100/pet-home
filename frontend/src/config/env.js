/**
 * ค่าตั้งต้นของ frontend ที่มาจาก Environment Variables
 *
 * ไฟล์นี้เป็น "ที่เดียวในระบบ" ที่ได้รับอนุญาตให้อ่าน import.meta.env
 * ไฟล์อื่นทั้งหมดต้อง import ค่าจากที่นี่ ห้ามอ่าน env เองโดยตรง
 * (ตรวจได้ด้วย: grep -rn "import.meta.env" frontend/src ต้องเจอไฟล์นี้ไฟล์เดียว)
 *
 * ตั้งค่าได้ที่ไฟล์ frontend/.env — ดูตัวอย่างใน frontend/.env.example
 *
 * หมายเหตุสำคัญ: Vite ฝังค่าเหล่านี้ลงใน bundle ตอน build ไม่ใช่ตอนรัน
 * แก้ค่าใน .env หรือบน Vercel แล้วต้อง build/redeploy ใหม่เสมอ
 */

// Vite แทนที่ import.meta.env.VITE_X ด้วยค่าจริงตอน build แบบแทนที่ข้อความตรงๆ
// จึงต้องเขียนเป็น property ตายตัวเท่านั้น ห้ามใช้ import.meta.env[ชื่อตัวแปร]
// เพราะการเข้าถึงแบบ dynamic จะได้ undefined ใน production build
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const RAW_LEGACY_API_URL = import.meta.env.VITE_API_URL

const isDev = import.meta.env.DEV

/**
 * แปลงค่าที่ผู้ใช้กรอกให้เหลือแค่ origin ที่สะอาด
 *
 * รับได้ทุกรูปแบบที่คนมักกรอกมา:
 *   'https://api.example.com'      → 'https://api.example.com'
 *   'https://api.example.com/'     → 'https://api.example.com'
 *   'https://api.example.com/api'  → 'https://api.example.com'
 *   'api.example.com'              → 'https://api.example.com'
 *   '' / '   ' / undefined         → ''  (โดเมนเดียวกัน)
 *
 * ใช้ new URL().origin ซึ่งตัด path, query, hash และ / ปิดท้ายให้ในคราวเดียว
 * จึงไม่ต้องใช้ .replace() ที่เคยเป็นต้นเหตุของบั๊ก URL รูปภาพ
 */
const rejectValue = (value, reason) => {
  if (isDev) {
    console.error(
      `[config] ค่า backend URL ไม่ถูกต้อง: "${value}" (${reason}) — ` +
      'จะใช้โดเมนเดียวกันแทน กรุณาแก้ VITE_BACKEND_URL ในไฟล์ .env'
    )
  }
  // ถอยไปใช้โดเมนเดียวกัน ดีกว่าปล่อยให้ยิง request ด้วย URL ที่พัง
  return ''
}

// ยอมรับเฉพาะ http/https เท่านั้น
// เพราะ new URL() รับ scheme แปลกๆ ได้ด้วย เช่น 'C:/path' จะได้ scheme 'c:'
// แล้ว .origin จะคืนสตริงคำว่า "null" ซึ่งถ้าปล่อยผ่านจะได้ URL เป็น 'null/api'
const originFromUrl = (candidate, rawValue) => {
  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return rejectValue(rawValue, 'รองรับเฉพาะ http:// และ https://')
  }
  if (parsed.origin === 'null' || !parsed.hostname) {
    return rejectValue(rawValue, 'ไม่พบชื่อโฮสต์ที่ใช้งานได้')
  }
  return parsed.origin
}

// ค่าที่กรอกมาโดยไม่มี scheme จะเดาให้เป็น https ต่อเมื่อ "หน้าตาเหมือนโฮสต์จริง"
// คือมีจุดคั่น (example.com) หรือเป็น localhost เท่านั้น
// กันไม่ให้ค่ามั่วอย่าง 'not_a_url' กลายเป็น https://not_a_url ที่ยิงไปไหนไม่ได้
const looksLikeHost = (value) =>
  /^[\w.-]+(:\d+)?$/.test(value) && (value.includes('.') || /^localhost(:|$)/i.test(value))

const normalizeOrigin = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''

  // กรอกมาเป็น path สัมพัทธ์ (เช่น '/api') = ตั้งใจใช้โดเมนเดียวกัน
  if (trimmed.startsWith('/')) return ''

  if (/^[a-z][\w+.-]*:\/\//i.test(trimmed)) {
    const result = originFromUrl(trimmed, trimmed)
    return result === null ? rejectValue(trimmed, 'รูปแบบ URL ไม่ถูกต้อง') : result
  }

  // ไม่มี scheme — เติมให้ถ้าหน้าตาเหมือนโฮสต์
  // เครื่องตัวเองเดาเป็น http ส่วนโดเมนจริงเดาเป็น https
  if (looksLikeHost(trimmed)) {
    const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(trimmed)
    const scheme = isLocal ? 'http' : 'https'
    const result = originFromUrl(`${scheme}://${trimmed}`, trimmed)
    return result === null ? rejectValue(trimmed, 'รูปแบบ URL ไม่ถูกต้อง') : result
  }

  return rejectValue(trimmed, 'ไม่ใช่ URL หรือชื่อโฮสต์')
}

const resolveBackendOrigin = () => {
  if (String(RAW_BACKEND_URL || '').trim()) {
    return normalizeOrigin(RAW_BACKEND_URL)
  }

  // รองรับชื่อเดิมที่เคยตั้งไว้ (เช่นบน Vercel) ให้ยังใช้งานได้
  // ไม่ต้องตัด /api ทิ้งเอง เพราะ new URL().origin จัดการให้แล้ว
  if (String(RAW_LEGACY_API_URL || '').trim()) {
    if (isDev) {
      console.warn(
        '[config] VITE_API_URL เป็นชื่อเดิมที่เลิกใช้แล้ว ' +
        'กรุณาเปลี่ยนไปใช้ VITE_BACKEND_URL (ใส่แค่ origin ไม่ต้องมี /api ต่อท้าย)'
      )
    }
    return normalizeOrigin(RAW_LEGACY_API_URL)
  }

  return ''
}

/**
 * Origin ของ backend
 * - '' หมายถึงอยู่โดเมนเดียวกัน (dev ผ่าน proxy ของ Vite หรือรันใน container เดียว)
 * - 'https://host' เมื่อแยก deploy คนละโดเมน (เช่น Vercel + Render)
 */
export const BACKEND_ORIGIN = resolveBackendOrigin()

/** true เมื่อ backend อยู่โดเมนเดียวกับหน้าเว็บ */
export const IS_SAME_ORIGIN_BACKEND = BACKEND_ORIGIN === ''

/**
 * ปลายทางของ API ที่ axios ใช้เป็น baseURL
 * โดเมนเดียวกัน → '/api'  |  แยก deploy → 'https://host/api'
 */
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`

/**
 * แปลง path ของไฟล์ฝั่ง backend (เช่น '/uploads/pet.jpg') ให้เป็น URL ที่ใช้ได้จริง
 *
 * ค่าที่เป็น URL เต็มหรือ data:/blob: อยู่แล้วจะคืนกลับไปโดยไม่แตะ
 * (รูปในระบบตอนนี้เก็บเป็น base64 จึงเข้าเงื่อนไขนี้)
 *
 * เมื่ออยู่โดเมนเดียวกันจะคืน path สัมพัทธ์เฉยๆ ตั้งใจไม่เติม window.location.origin
 * เพราะปล่อยให้เบราว์เซอร์ resolve เองถูกต้องทั้งตอน dev (ผ่าน proxy),
 * ตอนรวมใน container เดียว และตอนแยก deploy
 */
export const backendUrl = (path) => {
  if (!path) return ''

  const value = String(path)
  if (/^(https?:|data:|blob:)/i.test(value)) return value

  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  return `${BACKEND_ORIGIN}${normalizedPath}`
}

// บอกโหมดที่ใช้อยู่ตอน dev เพื่อให้ไล่ปัญหา "ยิง request ผิดปลายทาง" ได้เร็วขึ้น
if (isDev) {
  console.info(
    IS_SAME_ORIGIN_BACKEND
      ? '[config] Backend: โดเมนเดียวกัน (ผ่าน proxy ของ Vite) → /api'
      : `[config] Backend: ${BACKEND_ORIGIN} → ${API_BASE_URL}`
  )
}
