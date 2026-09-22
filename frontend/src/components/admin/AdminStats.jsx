import { Grid, Paper, Typography, Box } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import PetsIcon from '@mui/icons-material/Pets'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ChatIcon from '@mui/icons-material/Chat'
import FlagIcon from '@mui/icons-material/Flag'
import FavoriteIcon from '@mui/icons-material/Favorite'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={0} variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 2 }}>
    <Box sx={{ 
      backgroundColor: `${color}.50`, 
      color: `${color}.main`, 
      p: 2, 
      borderRadius: '50%',
      display: 'flex'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
)

const AdminStats = ({ stats }) => {
  if (!stats) return null

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard title="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} icon={<PeopleIcon fontSize="large" />} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard title="ประกาศทั้งหมด" value={stats.totalListings} icon={<PetsIcon fontSize="large" />} color="secondary" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard title="คำขออุปการะ" value={stats.totalRequests} icon={<AssignmentIcon fontSize="large" />} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={6} lg={2.4}>
        <StatCard title="ห้องแชททั้งหมด" value={stats.totalChats} icon={<ChatIcon fontSize="large" />} color="info" />
      </Grid>
      <Grid item xs={12} sm={6} md={6} lg={2.4}>
        <StatCard
          title="รายงานที่รอตรวจ"
          value={stats.pendingReports || 0}
          icon={<FlagIcon fontSize="large" />}
          color={stats.pendingReports > 0 ? "error" : "warning"}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          title="อัตราการจับคู่สำเร็จ"
          value={`${stats.matchSuccessRate ?? 0}%`}
          icon={<FavoriteIcon fontSize="large" />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          title="ประกาศใหม่วันนี้"
          value={stats.dailyNewListings ?? 0}
          icon={<TrendingUpIcon fontSize="large" />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <StatCard
          title="หาบ้านสำเร็จแล้ว"
          value={stats.totalAdopted ?? 0}
          icon={<PetsIcon fontSize="large" />}
          color="success"
        />
      </Grid>
    </Grid>
  )
}

export default AdminStats
