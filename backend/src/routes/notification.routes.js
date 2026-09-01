const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const authMiddleware = require('../middlewares/auth')

// ต้องล็อกอินถึงจะเข้าถึงได้
router.use(authMiddleware.verifyToken)

router.get('/', notificationController.getNotifications)
router.put('/:id/read', notificationController.markAsRead)

module.exports = router
