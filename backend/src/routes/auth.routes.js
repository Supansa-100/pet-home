const express = require('express')
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth')

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Protected routes
router.use(verifyToken) // ทุก route ด้านล่างต้องมี token
router.get('/me', getMe)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)

module.exports = router
