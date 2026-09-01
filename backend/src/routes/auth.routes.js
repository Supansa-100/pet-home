const express = require('express')
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth')

const router = express.length ? express.Router() : require('express').Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.use(verifyToken) // ทุก route ด้านล่างต้องมี token
router.get('/me', getMe)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)

module.exports = router
