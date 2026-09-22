const express = require('express')
const router = express.Router()

const {
  getMyRequests,
  getAllIncomingRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  cancelRequest
} = require('../controllers/request.controller')

const { verifyToken } = require('../middlewares/auth')

// Protected routes (ต้องล็อกอิน)
router.use(verifyToken)

router.get('/my', getMyRequests)
router.get('/incoming', getAllIncomingRequests)
// ต้องอยู่หลัง /my และ /incoming เพื่อไม่ให้ถูกจับเป็น :id
router.get('/:id', getRequestById)
router.patch('/:id/approve', approveRequest)
router.patch('/:id/reject', rejectRequest)
router.patch('/:id/cancel', cancelRequest)

module.exports = router
