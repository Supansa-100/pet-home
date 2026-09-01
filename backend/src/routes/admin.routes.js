const express = require('express')
const router = express.Router()

const {
  getDashboardStats,
  getAllUsers,
  toggleUserBan,
  getAllListings
} = require('../controllers/admin.controller')

const { verifyToken, verifyAdmin } = require('../middlewares/auth')

// ทุก Route ใน Admin ต้องล็อกอินและเป็น Admin
router.use(verifyToken, verifyAdmin)

router.get('/stats', getDashboardStats)
router.get('/users', getAllUsers)
router.patch('/users/:id/ban', toggleUserBan)
router.get('/listings', getAllListings)

module.exports = router
