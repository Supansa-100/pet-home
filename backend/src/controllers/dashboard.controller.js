const { pool } = require('../config/db')

// GET /api/dashboard/user/summary
// สถิติส่วนตัวของผู้ใช้ — รวมทั้งมุมมอง "ผู้หาบ้าน" และ "ผู้รับอุปการะ" ไว้ด้วยกัน
// เพราะ 1 บัญชีเป็นได้ทั้งสองบทบาทพร้อมกัน (ดู docs/planning/03-roles-permissions.md)
exports.getUserSummary = async (req, res, next) => {
  try {
    const userId = req.user.id

    // ── มุมมองผู้หาบ้าน (Pet Owner) ──────────────────────────────────────
    // นับประกาศทุกสถานะในรอบเดียว เพื่อให้ตัวเลขแต่ละช่องรวมกันแล้วเท่ากับ
    // จำนวนประกาศทั้งหมดจริงๆ (ถ้าแยก query แล้วนับเฉพาะบางสถานะ
    // ประกาศที่เป็น pending หรือ closed จะหายไปจากแดชบอร์ดทั้งที่ยังมีอยู่)
    const [listingCounts] = await pool.query(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status IN ('available', 'pending') AND is_hidden = 0 THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'adopted' THEN 1 ELSE 0 END) as adopted,
         SUM(CASE WHEN status = 'closed' OR is_hidden = 1 THEN 1 ELSE 0 END) as closed
       FROM pet_listings
       WHERE user_id = ?`,
      [userId]
    )

    // SUM() คืนค่าเป็น string หรือ null เมื่อไม่มีแถว จึงต้องแปลงเป็นตัวเลขก่อนส่งออก
    const listings = listingCounts[0]
    const toNumber = (value) => Number(value) || 0

    // คำขอที่รอฉันพิจารณา
    const [pendingIncoming] = await pool.query(
      `SELECT COUNT(*) as count FROM adoption_requests r
       JOIN pet_listings p ON r.listing_id = p.id
       WHERE p.user_id = ? AND r.status = 'pending'`,
      [userId]
    )

    // ── มุมมองผู้รับอุปการะ (Adopter) ────────────────────────────────────
    // คำขอที่ฉันส่งไปและยังรอเจ้าของตัดสินใจ
    const [myPending] = await pool.query(
      `SELECT COUNT(*) as count FROM adoption_requests
       WHERE adopter_id = ? AND status = 'pending'`,
      [userId]
    )

    // คำขอของฉันที่ได้รับอนุมัติ
    const [myApproved] = await pool.query(
      `SELECT COUNT(*) as count FROM adoption_requests
       WHERE adopter_id = ? AND status = 'approved'`,
      [userId]
    )

    // ── ทั้งสองมุมมอง ────────────────────────────────────────────────────
    // ข้อความแชทที่ยังไม่ได้อ่าน (นับเฉพาะข้อความที่คนอื่นส่งมา)
    const [unreadMessages] = await pool.query(
      `SELECT COUNT(*) as count FROM chat_messages m
       JOIN chat_rooms cr ON m.room_id = cr.id
       WHERE (cr.poster_id = ? OR cr.adopter_id = ?)
         AND m.sender_id != ?
         AND m.is_read = 0`,
      [userId, userId, userId]
    )

    res.json({
      success: true,
      data: {
        // ผู้หาบ้าน
        totalListings: toNumber(listings.total),
        activeListings: toNumber(listings.active),
        adoptedListings: toNumber(listings.adopted),
        closedListings: toNumber(listings.closed),
        pendingIncomingRequests: toNumber(pendingIncoming[0].count),
        // ผู้รับอุปการะ
        myPendingRequests: toNumber(myPending[0].count),
        myApprovedRequests: toNumber(myApproved[0].count),
        // ร่วมกัน
        unreadMessages: toNumber(unreadMessages[0].count)
      }
    })
  } catch (error) {
    next(error)
  }
}
