const express = require('express')
const router = express.Router()
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller')
const { verifyToken, verifyAdmin } = require('../middlewares/auth')

// Public routes
router.get('/', getCategories)

// Admin routes
router.use(verifyToken, verifyAdmin)
router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router
