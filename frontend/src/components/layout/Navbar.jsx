import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Badge, Divider, List, ListItem, ListItemText } from '@mui/material'
import PetsIcon from '@mui/icons-material/Pets'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { getUnreadCount } from '../../services/chatService'
import { getNotifications, markAsRead } from '../../services/notificationService'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Notification States
  const [anchorElNotif, setAnchorElNotif] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchAllData()
      const interval = setInterval(fetchAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      const chatRes = await getUnreadCount()
      if (chatRes.success) {
        setUnreadCount(chatRes.data.unread_count)
      }
      const notifRes = await getNotifications()
      if (notifRes.success) {
        setNotifications(notifRes.data)
        setUnreadNotifCount(notifRes.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget)
  }

  const handleNotifClose = () => {
    setAnchorElNotif(null)
  }

  const handleNotifClick = async (notif) => {
    handleNotifClose()
    if (!notif.is_read) {
      try {
        await markAsRead(notif.id)
        fetchAllData()
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
    // Navigate based on type
    if (notif.type === 'adoption_request') {
      navigate('/my-listings')
    } else if (notif.type === 'request_approved' || notif.type === 'request_rejected') {
      navigate('/my-requests')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAsRead('all')
      fetchAllData()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleLogout = () => {
    handleClose()
    logout()
    navigate('/')
  }

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar>
        <IconButton edge="start" color="primary" component={Link} to="/" sx={{ mr: 1 }}>
          <PetsIcon />
        </IconButton>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>
          PET-HOME
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button component={Link} to="/listings" color="inherit">
            หาบ้านให้สัตว์เลี้ยง
          </Button>

          {!user ? (
            <>
              <Button component={Link} to="/login" color="inherit">
                เข้าสู่ระบบ
              </Button>
              <Button component={Link} to="/register" variant="contained" color="primary" sx={{ ml: 1 }}>
                สมัครสมาชิก
              </Button>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <Button component={Link} to="/admin" color="primary" sx={{ fontWeight: 'bold' }}>
                  จัดการระบบ (Admin)
                </Button>
              ) : (
                <>
                  {user.role !== 'adopter' && (
                    <Button component={Link} to="/listings/create" variant="contained" color="secondary" size="small" sx={{ mr: 2 }}>
                      ลงประกาศ
                    </Button>
                  )}
                  <Button component={Link} to="/chat" color="inherit">
                    <Badge color="error" badgeContent={unreadCount}>
                      แชท
                    </Badge>
                  </Button>
                  
                  {/* Notifications */}
                  <IconButton color="inherit" onClick={handleNotifMenu} sx={{ ml: 1 }}>
                    <Badge color="error" badgeContent={unreadNotifCount}>
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.full_name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>โปรไฟล์ส่วนตัว</MenuItem>
                <MenuItem component={Link} to="/my-requests" onClick={handleClose}>คำขอรับอุปการะของฉัน</MenuItem>
                {user.role !== 'adopter' && (
                  <MenuItem component={Link} to="/my-listings" onClick={handleClose}>ประกาศของฉัน</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
              </Menu>

              {/* Notification Menu */}
              <Menu
                anchorEl={anchorElNotif}
                open={Boolean(anchorElNotif)}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { width: 320, maxHeight: 400 }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">การแจ้งเตือน</Typography>
                  {unreadNotifCount > 0 && (
                    <Button size="small" onClick={handleMarkAllRead}>อ่านทั้งหมด</Button>
                  )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <MenuItem disabled>ไม่มีการแจ้งเตือน</MenuItem>
                ) : (
                  notifications.map((notif) => (
                    <MenuItem 
                      key={notif.id} 
                      onClick={() => handleNotifClick(notif)}
                      sx={{ 
                        bgcolor: notif.is_read ? 'transparent' : 'action.hover',
                        whiteSpace: 'normal',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText 
                        primary={notif.message} 
                        secondary={new Date(notif.created_at).toLocaleString('th-TH')}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: notif.is_read ? 'normal' : 'bold' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </MenuItem>
                  ))
                )}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
