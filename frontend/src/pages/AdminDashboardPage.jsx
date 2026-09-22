import { useState, useEffect } from 'react'
import { Container, Typography, Box, Tabs, Tab, CircularProgress, Badge, Button, Alert, Snackbar, Card, CardContent, Chip, Grid } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getStats, getCharts, triggerSLACheck, getSLAStatus } from '../services/adminService'

import AdminStats from '../components/admin/AdminStats'
import AdminCharts from '../components/admin/AdminCharts'
import AdminReportExport from '../components/admin/AdminReportExport'
import AdminUsersTable from '../components/admin/AdminUsersTable'
import AdminListingsTable from '../components/admin/AdminListingsTable'
import AdminCategoriesTable from '../components/admin/AdminCategoriesTable'
import AdminReportsTable from '../components/admin/AdminReportsTable'
import BackButton from '../components/ui/BackButton'
import { formatBangkokDateTime } from '../utils/dateUtils'

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [slaInfo, setSlaInfo] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // SLA Alert state
  const [runningSLA, setRunningSLA] = useState(false)
  const [slaResult, setSlaResult] = useState(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
        navigate('/')
        return
      }
      fetchDashboardData()
    }
  }, [user, authLoading, navigate])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes, slaRes] = await Promise.allSettled([
        getStats(),
        getCharts(),
        getSLAStatus()
      ])
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data)
      }
      if (chartsRes.status === 'fulfilled' && chartsRes.value?.success) {
        setCharts(chartsRes.value.data)
      }
      if (slaRes.status === 'fulfilled' && slaRes.value?.success) {
        setSlaInfo(slaRes.value.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleTriggerSLA = async () => {
    setRunningSLA(true)
    try {
      const res = await triggerSLACheck()
      if (res.success) {
        const { pendingRequestsAlerted, staleListingsAlerted, unreadMessagesAlerted, totalAlerts, emailsSent } = res.data
        setSlaResult({
          type: 'success',
          message: `รัน SLA สำเร็จ! สร้างแจ้งเตือนใหม่ ${totalAlerts} รายการ (คำขอค้าง: ${pendingRequestsAlerted}, ประกาศนิ่ง: ${staleListingsAlerted}, แชทค้าง: ${unreadMessagesAlerted}) | ส่งอีเมลแจ้งเตือน: ${emailsSent || 0} ฉบับ`
        })
        // Refresh SLA info & stats
        fetchDashboardData()
      }
    } catch (error) {
      setSlaResult({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการรัน SLA: ' + (error.response?.data?.message || error.message)
      })
    } finally {
      setRunningSLA(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (authLoading || loadingStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <BackButton fallbackPath="/" label="กลับหน้าหลัก" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            ระบบจัดการหลังบ้าน (Admin Dashboard)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ภาพรวมระบบและการดูแลความเรียบร้อยของแพลตฟอร์ม
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="warning"
          startIcon={runningSLA ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          disabled={runningSLA}
          onClick={handleTriggerSLA}
          sx={{ fontWeight: 'bold', boxShadow: 2 }}
        >
          {runningSLA ? 'กำลังตรวจสอบ SLA...' : 'รัน SLA Alerts ทันที'}
        </Button>
      </Box>

      {/* SLA Status Card */}
      <Card sx={{ mb: 4, bgcolor: 'orange.50', border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <NotificationsActiveIcon color="warning" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  ระบบตรวจสอบ SLA อัตโนมัติ (Automated SLA Alerts)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ตั้งเวลาทำงาน: <strong>{slaInfo?.cronSchedule || '0 0 * * * (ทุกวันเวลา 00:00 น.)'}</strong>
                  {slaInfo?.lastRun?.executedAt && (
                    <> • ตรวจสอบล่าสุด: {formatBangkokDateTime(slaInfo.lastRun.executedAt)}</>
                  )}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip icon={<CheckCircleIcon />} label="Cron Scheduler Active" color="success" size="small" />
              <Chip icon={<EmailIcon />} label="Email Escalation Ready" color="info" size="small" />
              {slaInfo?.lastRun && (
                <Chip 
                  label={`ผลตรวจล่าสุด: +${slaInfo.lastRun.totalAlerts} Alerts (${slaInfo.lastRun.emailsSent || 0} Emails)`} 
                  variant="outlined" 
                  size="small" 
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {slaResult && (
        <Snackbar
          open={Boolean(slaResult)}
          autoHideDuration={8000}
          onClose={() => setSlaResult(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSlaResult(null)} severity={slaResult.type} sx={{ width: '100%', boxShadow: 3 }}>
            {slaResult.message}
          </Alert>
        </Snackbar>
      )}

      
      <Box sx={{ mb: 4, mt: 4 }}>
        <AdminStats stats={stats} />
      </Box>

      <AdminCharts charts={charts} />

      <AdminReportExport />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="ผู้ใช้งานทั้งหมด" />
          <Tab label="ประกาศทั้งหมด" />
          <Tab label="หมวดหมู่สัตว์เลี้ยง" />
          <Tab
            label={
              <Badge
                badgeContent={stats?.pendingReports || 0}
                color="error"
                sx={{ '& .MuiBadge-badge': { right: -12, top: 4 } }}
              >
                รายงานไม่เหมาะสม
              </Badge>
            }
          />
        </Tabs>
      </Box>

      {tabValue === 0 && <AdminUsersTable />}
      {tabValue === 1 && <AdminListingsTable />}
      {tabValue === 2 && <AdminCategoriesTable />}
      {tabValue === 3 && <AdminReportsTable onReportsUpdated={fetchDashboardData} />}
    </Container>
  )
}

export default AdminDashboardPage
