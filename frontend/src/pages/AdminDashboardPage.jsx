import { useState, useEffect } from 'react'
import { Container, Typography, Box, Tabs, Tab, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/adminService'

import AdminStats from '../components/admin/AdminStats'
import AdminUsersTable from '../components/admin/AdminUsersTable'
import AdminListingsTable from '../components/admin/AdminListingsTable'
import AdminCategoriesTable from '../components/admin/AdminCategoriesTable'

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
        navigate('/')
        return
      }
      fetchStats()
    }
  }, [user, authLoading, navigate])

  const fetchStats = async () => {
    try {
      const res = await getStats()
      if (res.success) {
        setStats(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats', error)
    } finally {
      setLoadingStats(false)
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        ระบบจัดการหลังบ้าน (Admin Dashboard)
      </Typography>
      
      <Box sx={{ mb: 6, mt: 4 }}>
        <AdminStats stats={stats} />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="ผู้ใช้งานทั้งหมด" />
          <Tab label="ประกาศทั้งหมด" />
          <Tab label="หมวดหมู่สัตว์เลี้ยง" />
        </Tabs>
      </Box>

      {tabValue === 0 && <AdminUsersTable />}
      {tabValue === 1 && <AdminListingsTable />}
      {tabValue === 2 && <AdminCategoriesTable />}
    </Container>
  )
}

export default AdminDashboardPage
