const express = require('express')
const router = express.Router()
const { getUserSummary } = require('../controllers/dashboard.controller')
const { verifyToken } = require('../middlewares/auth')

// ต้องล็อกอินก่อนถึงจะดูสถิติส่วนตัวได้
router.use(verifyToken)

router.get('/user/summary', getUserSummary)

module.exports = router
