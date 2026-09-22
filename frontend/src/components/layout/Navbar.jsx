import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Badge, Divider, Chip, Tooltip } from '@mui/material'
import PetsIcon from '@mui/icons-material/Pets'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { getUnreadCount } from '../../services/chatService'
import { getNotifications, markAsRead } from '../../services/notificationService'
import { formatBangkokDateTime } from '../../utils/dateUtils'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Notification States
  const [anchorElNotif, setAnchorElNotif] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)

  const fetchAllData = useCallback(async () => {
    if (!user) return

    // ดึงจำนวนแชทที่ยังไม่ได้อ่าน
    try {
      const chatRes = await getUnreadCount()
      if (chatRes && chatRes.success) {
        setUnreadCount(Number(chatRes.data?.unread_count) || 0)
      }
    } catch (error) {
      // Ignore chat error to allow notifications to load
    }

    // ดึงรายการแจ้งเตือนและจำนวนที่ยังไม่ได้อ่าน
    try {
      const notifRes = await getNotifications()
      if (notifRes && notifRes.success) {
        setNotifications(notifRes.data || [])
        setUnreadNotifCount(Number(notifRes.unreadCount) || 0)
      }
    } catch (error) {
      // Ignore notification error
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAllData()
      // Polling ทุก 5 วินาทีเพื่อให้การแจ้งเตือนเข้ามาแบบ real-time รวดเร็ว
      const interval = setInterval(fetchAllData, 5000)

      // รีเฟรชทันทีเมื่อผู้ใช้กลับมาที่แท็บเบราว์เซอร์
      const handleFocus = () => fetchAllData()
      window.addEventListener('focus', handleFocus)

      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
      }
    } else {
      setNotifications([])
      setUnreadNotifCount(0)
      setUnreadCount(0)
    }
  }, [user, location.pathname, fetchAllData])

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
    
    // อัปเดต UI ทันที (Optimistic update)
    const isUnread = notif.is_read === 0 || notif.is_read === false || !notif.is_read
    if (isUnread) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n))
      setUnreadNotifCount(prev => Math.max(0, prev - 1))
      try {
        await markAsRead(notif.id)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // นำทางไปยังหน้าที่เกี่ยวข้อง
    if (notif.type === 'adoption_request' || notif.type === 'sla_pending_request' || notif.type === 'sla_stale_listing') {
      navigate('/my-listings')
    } else if (notif.type === 'request_approved' || notif.type === 'request_rejected' || notif.type === 'request_rejected_adopted') {
      navigate('/my-requests')
    } else if (notif.type === 'chat_message' || notif.type === 'sla_unread_message') {
      if (notif.reference_id) {
        navigate(`/chat/${notif.reference_id}`)
      } else {
        navigate('/chat')
      }
    } else if (notif.type === 'admin_report_threshold') {
      navigate('/admin')
    }
  }

  const handleMarkAllRead = async () => {
    // อัปเดต UI ให้ทุกรายการเป็นอ่านแล้วทันที และเคลียร์วงกลมสีแดง
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    setUnreadNotifCount(0)
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              {user.role === 'admin' && (
                <Button component={Link} to="/admin" color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold' }}>
                  จัดการระบบ (Admin)
                </Button>
              )}
              {user.role !== 'admin' && (
                <Button component={Link} to="/listings/create" variant="contained" color="secondary" size="small">
                  ลงประกาศ
                </Button>
              )}
              <Button component={Link} to="/chat" color="inherit">
                <Badge 
                  color="error" 
                  badgeContent={unreadCount}
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#e53935',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '0.72rem',
                      minWidth: 18,
                      height: 18,
                      border: '2px solid #ffffff'
                    }
                  }}
                >
                  แชท
                </Badge>
              </Button>
              
              {/* Notifications Icon with Red Circle Badge */}
              <Tooltip title={unreadNotifCount > 0 ? `มีการแจ้งเตือนใหม่ ${unreadNotifCount} รายการ` : 'การแจ้งเตือน'}>
                <IconButton 
                  color="inherit" 
                  onClick={handleNotifMenu}
                  aria-label="แจ้งเตือน"
                  sx={{ 
                    position: 'relative',
                    transition: 'transform 0.15s ease-in-out',
                    '&:hover': { transform: 'scale(1.08)' }
                  }}
                >
                  <Badge 
                    badgeContent={unreadNotifCount} 
                    color="error"
                    max={99}
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#e53935', // วงกลมสีแดงสด
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '0.72rem',
                        minWidth: 20,
                        height: 20,
                        borderRadius: '50%',
                        padding: '0 4px',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(229, 57, 53, 0.5)',
                        animation: unreadNotifCount > 0 ? 'pulseBadge 2.2s infinite' : 'none',
                        '@keyframes pulseBadge': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.14)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 24, color: unreadNotifCount > 0 ? '#e53935' : 'inherit' }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 0.5, p: 0.5 }}>
                <Avatar 
                  src={user.avatar_url || ''} 
                  alt={user.full_name || 'User'} 
                  sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.95rem', border: '2px solid rgba(0,0,0,0.08)' }}
                >
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
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
                <MenuItem component={Link} to="/my-listings" onClick={handleClose}>ประกาศของฉัน</MenuItem>
                <MenuItem component={Link} to="/incoming-requests" onClick={handleClose}>คำขอที่ส่งเข้ามาหาฉัน</MenuItem>
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin" onClick={handleClose}>แผงควบคุม Admin</MenuItem>
                )}
                <Divider />
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
                  sx: { width: 370, maxHeight: 480, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">การแจ้งเตือน</Typography>
                    {unreadNotifCount > 0 ? (
                      <Chip 
                        label={`${unreadNotifCount} ยังไม่ได้ดู`} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e53935', 
                          color: '#ffffff', 
                          fontWeight: 'bold', 
                          fontSize: '0.72rem',
                          height: 22 
                        }} 
                      />
                    ) : (
                      <Chip 
                        label="อ่านครบแล้ว" 
                        size="small" 
                        variant="outlined"
                        color="success"
                        sx={{ height: 22, fontSize: '0.72rem' }} 
                      />
                    )}
                  </Box>
                  {unreadNotifCount > 0 && (
                    <Button 
                      size="small" 
                      onClick={handleMarkAllRead} 
                      sx={{ fontSize: '0.8rem', textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
                    >
                      อ่านทั้งหมด
                    </Button>
                  )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">ไม่มีการแจ้งเตือนในขณะนี้</Typography>
                  </Box>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = notif.is_read === 0 || notif.is_read === false || !notif.is_read
                    let chipColor = '#757575'
                    let label = 'แจ้งเตือน'
                    if (notif.type === 'request_approved') {
                      chipColor = '#2e7d32'
                      label = 'อนุมัติคำขอ'
                    } else if (notif.type === 'request_rejected' || notif.type === 'request_rejected_adopted') {
                      chipColor = '#c62828'
                      label = 'คำขอ'
                    } else if (notif.type === 'adoption_request') {
                      chipColor = '#7b1fa2'
                      label = 'คำขอรับเลี้ยง'
                    } else if (notif.type?.startsWith('sla_')) {
                      chipColor = '#ef6c00'
                      label = 'SLA Alert'
                    } else if (notif.type === 'chat_message') {
                      chipColor = '#1976d2'
                      label = 'ข้อความ'
                    } else if (notif.type === 'admin_report_threshold') {
                      chipColor = '#d81b60'
                      label = 'ด่วน/รายงาน'
                    }

                    return (
                      <MenuItem 
                        key={notif.id} 
                        onClick={() => handleNotifClick(notif)}
                        sx={{ 
                          bgcolor: isUnread ? 'rgba(229, 57, 53, 0.05)' : 'transparent',
                          borderLeft: isUnread ? '4px solid #e53935' : '4px solid transparent',
                          whiteSpace: 'normal',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          py: 1.5,
                          px: 2,
                          display: 'flex',
                          alignItems: 'flex-start',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: isUnread ? 'rgba(229, 57, 53, 0.12)' : 'action.hover' }
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              {/* วงกลมสีแดงที่แสดงว่ายังไม่ได้เข้าไปดู */}
                              {isUnread && (
                                <Box 
                                  component="span" 
                                  title="ยังไม่ได้เข้าไปดู"
                                  sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: '#e53935', 
                                    boxShadow: '0 0 6px rgba(229, 57, 53, 0.9)',
                                    display: 'inline-block',
                                    flexShrink: 0
                                  }} 
                                />
                              )}
                              <Box 
                                component="span" 
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  px: 1, 
                                  py: 0.2, 
                                  borderRadius: 1, 
                                  bgcolor: chipColor, 
                                  color: 'white',
                                  fontWeight: 'bold' 
                                }}
                              >
                                {label}
                              </Box>
                              {isUnread && (
                                <Typography variant="caption" sx={{ color: '#e53935', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                  ใหม่
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatBangkokDateTime(notif.created_at)}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: isUnread ? 600 : 'normal',
                              color: isUnread ? 'text.primary' : 'text.secondary',
                              lineHeight: 1.45
                            }}
                          >
                            {notif.message}
                          </Typography>
                        </Box>
                      </MenuItem>
                    )
                  })
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
