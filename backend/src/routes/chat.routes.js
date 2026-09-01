const express = require('express')
const router = express.Router()

const {
  getMyRooms,
  getRoomMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/chat.controller')

const { verifyToken } = require('../middlewares/auth')

// Protected routes (ต้องล็อกอิน)
router.use(verifyToken)

router.get('/rooms', getMyRooms)
router.get('/unread-count', getUnreadCount)
router.get('/rooms/:id', getRoomMessages)
router.post('/rooms/:id/messages', sendMessage)
router.patch('/rooms/:id/read', markAsRead)

module.exports = router
