import { useState, useEffect } from 'react'
import { Grid, Paper, Typography, Box, Skeleton, Divider } from '@mui/material'
import { Link } from 'react-router-dom'
import PetsIcon from '@mui/icons-material/Pets'
import InboxIcon from '@mui/icons-material/Inbox'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChatIcon from '@mui/icons-material/Chat'
import ArchiveIcon from '@mui/icons-material/Archive'
import { getUserSummary } from '../../services/dashboardService'

const SummaryTile = ({ title, value, icon, color, to, highlight }) => (
  <Paper
    elevation={0}
    variant="outlined"
    component={Link}
    to={to}
    sx={{
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: 2,
      textDecoration: 'none',
      color: 'inherit',
      height: '100%',
      borderColor: highlight ? `${color}.main` : 'divider',
      transition: 'box-shadow 0.15s, transform 0.15s',
      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }
    }}
  >
    <Box sx={{ bgcolor: `${color}.50`, color: `${color}.main`, p: 1.5, borderRadius: '50%', display: 'flex' }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" noWrap>{title}</Typography>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
)

const UserDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getUserSummary()
        if (res.success) setSummary(res.data)
      } catch (err) {
        console.error('Failed to fetch user summary:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rounded" height={86} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!summary) return null

  return (
    <Box sx={{ mb: 4 }}>
      {/* มุมมองผู้หาบ้าน */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" color="text.secondary">
          ในฐานะผู้หาบ้านให้สัตว์เลี้ยง
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (ประกาศทั้งหมด {summary.totalListings} รายการ)
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryTile
            title="กำลังหาบ้านอยู่"
            value={summary.activeListings}
            icon={<PetsIcon />}
            color="primary"
            to="/my-listings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryTile
            title="คำขอที่รอคุณพิจารณา"
            value={summary.pendingIncomingRequests}
            icon={<InboxIcon />}
            color="warning"
            to="/incoming-requests"
            highlight={summary.pendingIncomingRequests > 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryTile
            title="หาบ้านสำเร็จแล้ว"
            value={summary.adoptedListings}
            icon={<FavoriteIcon />}
            color="success"
            to="/my-listings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryTile
            title="ปิดประกาศแล้ว"
            value={summary.closedListings}
            icon={<ArchiveIcon />}
            color="info"
            to="/my-listings"
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* มุมมองผู้รับอุปการะ */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        ในฐานะผู้ขอรับอุปการะ
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryTile
            title="คำขอที่รอเจ้าของตัดสินใจ"
            value={summary.myPendingRequests}
            icon={<HourglassEmptyIcon />}
            color="info"
            to="/my-requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryTile
            title="คำขอที่ได้รับอนุมัติ"
            value={summary.myApprovedRequests}
            icon={<CheckCircleIcon />}
            color="success"
            to="/my-requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryTile
            title="ข้อความที่ยังไม่ได้อ่าน"
            value={summary.unreadMessages}
            icon={<ChatIcon />}
            color="error"
            to="/chat"
            highlight={summary.unreadMessages > 0}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserDashboard
