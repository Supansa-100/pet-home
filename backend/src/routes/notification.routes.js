const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const authMiddleware = require('../middlewares/auth')

// ต้องล็อกอินถึงจะเข้าถึงได้
router.use(authMiddleware.verifyToken)

router.get('/', notificationController.getNotifications)
// ต้องอยู่ก่อน /:id/read ไม่งั้นจะถูกมองว่า read-all คือ id
router.put('/read-all', notificationController.markAllAsRead)
router.put('/:id/read', notificationController.markAsRead)

module.exports = router
