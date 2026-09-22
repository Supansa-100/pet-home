const express = require('express')
const router = express.Router()
const { getProvinces } = require('../controllers/master.controller')

// Public route — ใช้เติม Dropdown เลือกพื้นที่ (ไม่ต้องล็อกอิน)
router.get('/provinces', getProvinces)

module.exports = router
