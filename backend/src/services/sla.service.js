const cron = require('node-cron')
const { pool } = require('../config/db')
const { sendUnreadMessageAlertEmail } = require('./email.service')

let lastSLAExecution = null

/**
 * 1. Rule 1: Pending Request Timeout
 * แจ้งเตือนเจ้าของเมื่อคำขอค้าง pending เกิน 5 วัน
 */
async function checkPendingRequestsSLA() {
  let createdCount = 0
  try {
    const [requests] = await pool.query(`
      SELECT r.id as request_id, r.listing_id, p.user_id as owner_id, p.name as pet_name
      FROM adoption_requests r
      JOIN pet_listings p ON r.listing_id = p.id
      WHERE r.status = 'pending'
        AND r.created_at <= NOW() - INTERVAL 5 DAY
    `)

    for (const req of requests) {
      // ตรวจสอบว่าเคยแจ้งเตือนสำหรับ request นี้ใน 5 วันล่าสุดหรือไม่ (Deduplication)
      const [existing] = await pool.query(`
        SELECT id FROM notifications
        WHERE user_id = ?
          AND type = 'sla_pending_request'
          AND reference_id = ?
          AND created_at >= NOW() - INTERVAL 5 DAY
        LIMIT 1
      `, [req.owner_id, req.request_id])

      if (existing.length === 0) {
        await pool.query(`
          INSERT INTO notifications (user_id, type, reference_id, message)
          VALUES (?, 'sla_pending_request', ?, ?)
        `, [
          req.owner_id,
          req.request_id,
          `คุณมีคำขอรับอุปการะของ "${req.pet_name}" ที่รอพิจารณาอยู่ โปรดตอบกลับเพื่อไม่ให้ผู้รับเลี้ยงรอนาน`
        ])
        createdCount++
      }
    }
  } catch (error) {
    console.error('❌ Error checking Pending Requests SLA:', error.message)
  }
  return createdCount
}

/**
 * 2. Rule 2: Stale Listing Alert
 * แจ้งเตือนเจ้าของเมื่อประกาศสถานะ available ไม่มีความเคลื่อนไหวเกิน 30 วัน
 */
async function checkStaleListingsSLA() {
  let createdCount = 0
  try {
    const [listings] = await pool.query(`
      SELECT p.id as listing_id, p.user_id as owner_id, p.name as pet_name
      FROM pet_listings p
      WHERE p.status = 'available'
        AND p.is_hidden = 0
        AND p.updated_at <= NOW() - INTERVAL 30 DAY
    `)

    for (const listing of listings) {
      // ตรวจสอบว่าเคยแจ้งเตือนสำหรับ listing นี้ใน 30 วันล่าสุดหรือไม่
      const [existing] = await pool.query(`
        SELECT id FROM notifications
        WHERE user_id = ?
          AND type = 'sla_stale_listing'
          AND reference_id = ?
          AND created_at >= NOW() - INTERVAL 30 DAY
        LIMIT 1
      `, [listing.owner_id, listing.listing_id])

      if (existing.length === 0) {
        await pool.query(`
          INSERT INTO notifications (user_id, type, reference_id, message)
          VALUES (?, 'sla_stale_listing', ?, ?)
        `, [
          listing.owner_id,
          listing.listing_id,
          `ประกาศของ "${listing.pet_name}" ยังหาบ้านอยู่หรือไม่? หากได้บ้านแล้วโปรดอัปเดตสถานะ หรืออัปเดตรูปใหม่เพื่อเพิ่มความน่าสนใจ`
        ])
        createdCount++
      }
    }
  } catch (error) {
    console.error('❌ Error checking Stale Listings SLA:', error.message)
  }
  return createdCount
}

/**
 * 3. Rule 3: Unread Messages Escalation
 * แจ้งเตือนผู้รับเมื่อมีข้อความแชทค้างไม่ได้อ่านเกิน 48 ชั่วโมง (In-App + Email)
 */
async function checkUnreadMessagesSLA() {
  let createdCount = 0
  let emailCount = 0
  try {
    const [rooms] = await pool.query(`
      SELECT cr.id as room_id, p.name as pet_name,
             recipient.id as recipient_id,
             recipient.full_name as recipient_name,
             recipient.email as recipient_email
      FROM chat_messages m
      JOIN chat_rooms cr ON m.room_id = cr.id
      JOIN pet_listings p ON cr.listing_id = p.id
      JOIN users recipient ON recipient.id = IF(m.sender_id = cr.poster_id, cr.adopter_id, cr.poster_id)
      WHERE m.is_read = 0
        AND m.created_at <= NOW() - INTERVAL 48 HOUR
      GROUP BY cr.id, recipient.id, recipient.full_name, recipient.email, p.name
    `)

    for (const room of rooms) {
      // ตรวจสอบว่าเคยแจ้งเตือนสำหรับห้องนี้ใน 48 ชั่วโมงล่าสุดหรือไม่
      const [existing] = await pool.query(`
        SELECT id FROM notifications
        WHERE user_id = ?
          AND type = 'sla_unread_message'
          AND reference_id = ?
          AND created_at >= NOW() - INTERVAL 48 HOUR
        LIMIT 1
      `, [room.recipient_id, room.room_id])

      if (existing.length === 0) {
        // 1. ส่ง In-App Notification
        await pool.query(`
          INSERT INTO notifications (user_id, type, reference_id, message)
          VALUES (?, 'sla_unread_message', ?, ?)
        `, [
          room.recipient_id,
          room.room_id,
          `คุณมีข้อความใหม่เกี่ยวกับ "${room.pet_name}" ที่ยังไม่ได้อ่านบน PET-HOME เกิน 48 ชั่วโมง`
        ])
        createdCount++

        // 2. ส่ง Email Notification
        if (room.recipient_email) {
          try {
            await sendUnreadMessageAlertEmail({
              toEmail: room.recipient_email,
              toName: room.recipient_name,
              petName: room.pet_name,
              roomId: room.room_id
            })
            emailCount++
          } catch (mailErr) {
            console.error(`⚠️ Failed to send SLA email to ${room.recipient_email}:`, mailErr.message)
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking Unread Messages SLA:', error.message)
  }
  return { alertsCreated: createdCount, emailsSent: emailCount }
}

/**
 * รันการตรวจสอบ SLA ทั้งหมด
 */
async function runAllSLAChecks() {
  console.log('⏰ [SLA Cron] Starting SLA alerts check...')
  const pendingRequestsAlerted = await checkPendingRequestsSLA()
  const staleListingsAlerted = await checkStaleListingsSLA()
  const unreadMessagesResult = await checkUnreadMessagesSLA()

  const summary = {
    executedAt: new Date().toISOString(),
    pendingRequestsAlerted,
    staleListingsAlerted,
    unreadMessagesAlerted: unreadMessagesResult.alertsCreated,
    emailsSent: unreadMessagesResult.emailsSent,
    totalAlerts: pendingRequestsAlerted + staleListingsAlerted + unreadMessagesResult.alertsCreated
  }

  lastSLAExecution = summary
  console.log(`✅ [SLA Cron] Completed. Generated ${summary.totalAlerts} alerts (${summary.emailsSent} emails sent).`, summary)
  return summary
}

/**
 * กำหนดเวลา Cronjob (รันทุกวันเวลาเที่ยงคืน 00:00)
 */
function initCronJobs() {
  // รันทุกวันเวลา 00:00 น.
  cron.schedule('0 0 * * *', async () => {
    await runAllSLAChecks()
  })

  console.log('⏰ [SLA Cron] Cron scheduler initialized (Runs daily at 00:00)')
}

/**
 * ดึงสถานะ Cron และข้อมูลการรันล่าสุด
 */
function getSLAStatus() {
  return {
    cronSchedule: '0 0 * * * (ทุกวันเวลา 00:00 น.)',
    cronStatus: 'active',
    lastRun: lastSLAExecution
  }
}

module.exports = {
  checkPendingRequestsSLA,
  checkStaleListingsSLA,
  checkUnreadMessagesSLA,
  runAllSLAChecks,
  initCronJobs,
  getSLAStatus
}
