/**
 * สร้างบัญชีผู้ดูแลระบบ (Admin)
 *
 * API สมัครสมาชิกปกติจะบังคับ role เป็น poster/adopter เท่านั้น (ดู auth.controller.js)
 * จึงต้องสร้างบัญชี Admin ผ่านสคริปต์นี้
 *
 * วิธีใช้ — แบบถามตอบ (แนะนำ รหัสผ่านจะไม่แสดงบนหน้าจอและไม่ติดประวัติคำสั่ง):
 *   npm run create-admin
 *
 * วิธีใช้ — แบบไม่ถามตอบ (สำหรับ CI หรือ server ที่ไม่มีหน้าจอโต้ตอบ):
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... ADMIN_NAME="ชื่อ นามสกุล" npm run create-admin
 *
 * ถ้าอีเมลนั้นมีบัญชีอยู่แล้ว จะเลื่อนบัญชีนั้นเป็น Admin ให้แทนการสร้างใหม่
 */

const readline = require('readline')
const bcrypt = require('bcryptjs')
const { pool } = require('../src/config/db')

const MIN_PASSWORD_LENGTH = 8

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/**
 * สร้างบัญชี Admin ใหม่ หรือเลื่อนบัญชีที่มีอยู่ให้เป็น Admin
 * แยกออกมาจากส่วนถามตอบ เพื่อให้เรียกใช้และทดสอบได้โดยตรง
 */
async function createOrPromoteAdmin({ email, password, fullName, phone }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('รูปแบบอีเมลไม่ถูกต้อง')
  }

  const [existing] = await pool.query('SELECT id, full_name, role FROM users WHERE email = ?', [normalizedEmail])

  // มีบัญชีอยู่แล้ว → เลื่อนเป็น Admin (และเปลี่ยนรหัสผ่านถ้าระบุมา)
  if (existing.length > 0) {
    const user = existing[0]

    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`)
      }
      const hash = await bcrypt.hash(password, 12)
      await pool.query(
        'UPDATE users SET role = "admin", password_hash = ?, is_banned = 0 WHERE id = ?',
        [hash, user.id]
      )
      return { action: 'promoted_with_password', id: user.id, name: user.full_name, previousRole: user.role }
    }

    await pool.query('UPDATE users SET role = "admin", is_banned = 0 WHERE id = ?', [user.id])
    return { action: 'promoted', id: user.id, name: user.full_name, previousRole: user.role }
  }

  // สร้างบัญชีใหม่
  if (!fullName) throw new Error('กรุณาระบุชื่อ-นามสกุล')
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`)
  }

  // ใช้ cost 12 ให้ตรงกับที่ระบบใช้ตอนสมัครสมาชิก (auth.controller.js)
  const hash = await bcrypt.hash(password, 12)

  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, "admin")',
    [normalizedEmail, hash, fullName, phone || null]
  )

  return { action: 'created', id: result.insertId, name: fullName }
}

// ─── ส่วนถามตอบผ่าน terminal ────────────────────────────────────────────────

function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  // ถ้า stdin จบก่อน (เช่นโดน pipe ข้อมูลมาไม่ครบ) ให้ขึ้นข้อความที่เข้าใจง่าย
  const guard = (promise) =>
    promise.catch(() => {
      throw new Error('อ่านค่าจากหน้าจอไม่สำเร็จ — กรุณารันคำสั่งนี้ใน terminal โดยตรง หรือใช้แบบ env var')
    })

  const ask = (question) => guard(new Promise((resolve, reject) => {
    rl.once('close', reject)
    rl.question(question, (answer) => {
      rl.removeListener('close', reject)
      resolve(answer.trim())
    })
  }))

  // ถามรหัสผ่านโดยไม่แสดงตัวอักษรบนหน้าจอ
  const askPassword = (question) => guard(new Promise((resolve, reject) => {
    const onData = () => {
      // เขียนทับบรรทัดด้วยข้อความคำถามเดิม เพื่อซ่อนสิ่งที่พิมพ์
      readline.clearLine(process.stdout, 0)
      readline.cursorTo(process.stdout, 0)
      process.stdout.write(question)
    }

    process.stdin.on('data', onData)
    rl.once('close', reject)

    rl.question(question, (answer) => {
      process.stdin.removeListener('data', onData)
      rl.removeListener('close', reject)
      process.stdout.write('\n')
      resolve(answer.trim())
    })
  }))

  return { ask, askPassword, close: () => rl.close() }
}

async function runInteractive() {
  const { ask, askPassword, close } = createPrompter()

  try {
    console.log('\n=== สร้างบัญชีผู้ดูแลระบบ PET-HOME ===\n')

    const email = await ask('อีเมล: ')
    if (!isValidEmail(email)) throw new Error('รูปแบบอีเมลไม่ถูกต้อง')

    const [existing] = await pool.query('SELECT full_name, role FROM users WHERE email = ?', [email.toLowerCase()])

    let fullName = ''
    let phone = ''

    if (existing.length > 0) {
      const user = existing[0]
      const message = user.role === 'admin'
        ? `\nℹ️  "${user.full_name}" เป็นผู้ดูแลระบบอยู่แล้ว`
        : `\nพบบัญชีอยู่แล้ว: "${user.full_name}" (สิทธิ์ปัจจุบัน: ${user.role})`
      console.log(message)

      const confirm = await ask(
        user.role === 'admin'
          ? 'ต้องการตั้งรหัสผ่านใหม่ให้บัญชีนี้หรือไม่? (y/N): '
          : 'ต้องการเลื่อนบัญชีนี้เป็นผู้ดูแลระบบหรือไม่? (y/N): '
      )
      if (confirm.toLowerCase() !== 'y') {
        console.log('ยกเลิก ไม่มีการเปลี่ยนแปลง')
        return
      }
    } else {
      fullName = await ask('ชื่อ-นามสกุล: ')
      if (!fullName) throw new Error('กรุณากรอกชื่อ-นามสกุล')
      phone = await ask('เบอร์โทรศัพท์ (ไม่บังคับ): ')
    }

    const promptText = existing.length > 0
      ? `รหัสผ่านใหม่ (เว้นว่างเพื่อใช้รหัสเดิม): `
      : `รหัสผ่าน (อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร): `

    const password = await askPassword(promptText)

    if (password) {
      const confirmPassword = await askPassword('ยืนยันรหัสผ่าน: ')
      if (password !== confirmPassword) throw new Error('รหัสผ่านทั้งสองครั้งไม่ตรงกัน')
    }

    const result = await createOrPromoteAdmin({ email, password, fullName, phone })
    printResult(result, email)
  } finally {
    close()
  }
}

function printResult(result, email) {
  if (result.action === 'created') {
    console.log(`\n✅ สร้างบัญชีผู้ดูแลระบบสำเร็จ (id: ${result.id})`)
  } else if (result.action === 'promoted_with_password') {
    console.log(`\n✅ ตั้งค่า "${result.name}" เป็นผู้ดูแลระบบพร้อมรหัสผ่านใหม่แล้ว`)
  } else {
    console.log(`\n✅ เลื่อน "${result.name}" จาก ${result.previousRole} เป็นผู้ดูแลระบบแล้ว (รหัสผ่านเดิมไม่เปลี่ยน)`)
  }
  console.log(`   อีเมล: ${email}`)
  console.log('   เข้าสู่ระบบที่หน้า /login แล้วเปิดหน้าจัดการที่ /admin')
}

async function main() {
  // โหมดไม่ถามตอบ: ใช้เมื่อกำหนด ADMIN_EMAIL มาทาง environment variable
  if (process.env.ADMIN_EMAIL) {
    const email = process.env.ADMIN_EMAIL
    const result = await createOrPromoteAdmin({
      email,
      password: process.env.ADMIN_PASSWORD,
      fullName: process.env.ADMIN_NAME,
      phone: process.env.ADMIN_PHONE
    })
    printResult(result, email)
    return
  }

  await runInteractive()
}

main()
  .catch((error) => {
    console.error(`\n❌ ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })

module.exports = { createOrPromoteAdmin }
