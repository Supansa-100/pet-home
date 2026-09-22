const express = require('express')
const router = express.Router()

const {
  getDashboardStats,
  getDashboardCharts,
  exportReport,
  getAllUsers,
  toggleUserBan,
  getAllListings,
  getReports,
  updateReportStatus,
  triggerSLACheck,
  getSLAStatus
} = require('../controllers/admin.controller')

const { verifyToken, verifyAdmin } = require('../middlewares/auth')

// ทุก Route ใน Admin ต้องล็อกอินและเป็น Admin
router.use(verifyToken, verifyAdmin)

router.get('/stats', getDashboardStats)
router.get('/charts', getDashboardCharts)
router.get('/export/:type', exportReport)
router.get('/users', getAllUsers)
router.patch('/users/:id/ban', toggleUserBan)
router.get('/listings', getAllListings)
router.get('/reports', getReports)
router.patch('/reports/:id', updateReportStatus)
router.get('/sla/status', getSLAStatus)
router.post('/sla/trigger', triggerSLACheck)

module.exports = router
