const express = require('express')
const router = express.Router()

const {
  getMyRequests,
  approveRequest,
  rejectRequest,
  cancelRequest
} = require('../controllers/request.controller')

const { verifyToken } = require('../middlewares/auth')

// Protected routes (ต้องล็อกอิน)
router.use(verifyToken)

router.get('/my', getMyRequests)
router.patch('/:id/approve', approveRequest)
router.patch('/:id/reject', rejectRequest)
router.patch('/:id/cancel', cancelRequest)

module.exports = router
