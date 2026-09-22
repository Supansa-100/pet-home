const nodemailer = require('nodemailer')

let transporter = null

// ตรวจสอบการตั้งค่า SMTP จาก Environment Variables
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}

const isConfigured = Boolean(smtpConfig.host && smtpConfig.auth.user)

if (isConfigured) {
  try {
    transporter = nodemailer.createTransport(smtpConfig)
    console.log('📧 [Email Service] SMTP Transporter configured for host:', smtpConfig.host)
  } catch (error) {
    console.error('❌ [Email Service] Failed to initialize SMTP transporter:', error.message)
  }
} else {
  console.log('ℹ️ [Email Service] No SMTP credentials provided. Running in Mock/Development Mode.')
}

/**
 * ส่งอีเมลทั่วไป
 * @param {Object} options - { to, subject, text, html }
 */
async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || '"PET-HOME System" <no-reply@pethome.local>'

  if (transporter && isConfigured) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      })
      console.log(`✉️ [Email Service] Sent email to ${to}: ${subject} (MessageID: ${info.messageId})`)
      return { success: true, messageId: info.messageId, mocked: false }
    } catch (error) {
      console.error(`❌ [Email Service] Failed to send email to ${to}:`, error.message)
      return { success: false, error: error.message, mocked: false }
    }
  }

  // Development / Mock Delivery Mode
  console.log('\n========================================')
  console.log('📬 [EMAIL MOCK DELIVERED]')
  console.log(`From:    ${from}`)
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log('----------------------------------------')
  console.log(text || html)
  console.log('========================================\n')

  return { success: true, mocked: true, messageId: `mock-${Date.now()}` }
}

/**
 * ส่งอีเมลแจ้งเตือนข้อความแชทค้างเกิน 48 ชม. (SLA Rule 3)
 */
async function sendUnreadMessageAlertEmail({ toEmail, toName, petName, roomId }) {
  const subject = `[PET-HOME] คุณมีข้อความแชทเกี่ยวกับ "${petName}" ที่ยังไม่ได้อ่าน`
  const chatUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${roomId}`

  const text = `สวัสดีคุณ ${toName || 'ผู้ใช้งาน'},

คุณมีข้อความใหม่เกี่ยวกับสัตว์เลี้ยง "${petName}" บนระบบ PET-HOME ที่ยังไม่ได้อ่านเกิน 48 ชั่วโมง
กรุณาเข้าสู่ระบบเพื่อตรวจสอบและตอบกลับข้อความ:
${chatUrl}

ขอแสดงความนับถือ,
ทีมงาน PET-HOME`

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ff7043; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">PET-HOME แจ้งเตือนข้อความใหม่</h2>
      </div>
      <div style="padding: 24px;">
        <p>สวัสดีคุณ <strong>${toName || 'ผู้ใช้งาน'}</strong>,</p>
        <p>คุณมีข้อความแชทเกี่ยวกับสัตว์เลี้ยง <strong>"${petName}"</strong> บนแพลตฟอร์ม PET-HOME ที่ยังไม่ได้รับการเปิดอ่านเกิน <strong>48 ชั่วโมง</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${chatUrl}" style="background-color: #ff7043; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
            เปิดดูข้อความแชท
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">การตอบกลับที่รวดเร็วจะช่วยเพิ่มโอกาสให้สัตว์เลี้ยงได้บ้านที่อบอุ่นเร็วขึ้น</p>
      </div>
      <div style="background-color: #f5f5f5; color: #888; padding: 12px 24px; font-size: 12px; text-align: center;">
        อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ PET-HOME กรุณาอย่าตอบกลับอีเมลนี้
      </div>
    </div>
  `

  return sendMail({
    to: toEmail,
    subject,
    text,
    html
  })
}

/**
 * ส่งอีเมลลิงก์รีเซ็ตรหัสผ่าน
 */
async function sendPasswordResetEmail({ toEmail, toName, token, expiresInMinutes = 60 }) {
  const subject = '[PET-HOME] ลิงก์สำหรับตั้งรหัสผ่านใหม่'
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`

  const text = `สวัสดีคุณ ${toName || 'ผู้ใช้งาน'},

มีการขอตั้งรหัสผ่านใหม่สำหรับบัญชี PET-HOME ของคุณ
กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้ใช้ได้ภายใน ${expiresInMinutes} นาที และใช้ได้เพียงครั้งเดียว):
${resetUrl}

หากคุณไม่ได้เป็นผู้ขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านเดิมของคุณจะยังใช้งานได้ตามปกติ

ขอแสดงความนับถือ,
ทีมงาน PET-HOME`

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ff7043; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">PET-HOME ตั้งรหัสผ่านใหม่</h2>
      </div>
      <div style="padding: 24px;">
        <p>สวัสดีคุณ <strong>${toName || 'ผู้ใช้งาน'}</strong>,</p>
        <p>มีการขอตั้งรหัสผ่านใหม่สำหรับบัญชี PET-HOME ของคุณ กดปุ่มด้านล่างเพื่อดำเนินการต่อ</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ff7043; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
            ตั้งรหัสผ่านใหม่
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          ลิงก์นี้ใช้ได้ภายใน <strong>${expiresInMinutes} นาที</strong> และใช้ได้เพียงครั้งเดียว<br>
          หากคุณไม่ได้เป็นผู้ขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านเดิมจะยังใช้งานได้ตามปกติ
        </p>
      </div>
      <div style="background-color: #f5f5f5; color: #888; padding: 12px 24px; font-size: 12px; text-align: center;">
        อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ PET-HOME กรุณาอย่าตอบกลับอีเมลนี้
      </div>
    </div>
  `

  return sendMail({ to: toEmail, subject, text, html })
}

module.exports = {
  sendMail,
  sendUnreadMessageAlertEmail,
  sendPasswordResetEmail
}
