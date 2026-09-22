const express = require('express')
const router = express.Router()

const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  updatePetStatus,
  deletePet,
  getMyPets,
  reportPet
} = require('../controllers/pet.controller')

const {
  createRequest,
  getRequestsByPet
} = require('../controllers/request.controller')

const { verifyToken } = require('../middlewares/auth')
const upload = require('../middlewares/upload')

// ประกาศของฉัน (ต้องล็อกอิน และต้องอยู่ก่อน /:id เพื่อป้องกันการมองว่า "my" คือ id)
router.get('/my', verifyToken, getMyPets)

// Public routes (ไม่ต้องล็อกอิน)
router.get('/', getPets)
router.get('/:id', getPetById)

// Protected routes (ต้องล็อกอิน)
router.use(verifyToken)

// Adoption requests
router.post('/:id/requests', createRequest)
router.get('/:id/requests', getRequestsByPet)

// Report inappropriate pet listing
router.post('/:id/report', reportPet)

// สามารถอัปโหลดได้สูงสุด 5 รูป (ทั้งสร้างใหม่และแก้ไข)
router.post('/', upload.array('images', 5), createPet)

// เฉพาะเจ้าของโพสต์หรือ Admin ถึงจะทำได้
router.put('/:id', upload.array('images', 5), updatePet)
router.put('/:id/status', updatePetStatus)
router.delete('/:id', deletePet)

module.exports = router
