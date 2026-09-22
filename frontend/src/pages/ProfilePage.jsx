import { useState, useEffect, useRef } from 'react'
import { Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Avatar, IconButton, Tooltip, CircularProgress } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import BackButton from '../components/ui/BackButton'
import UserDashboard from '../components/dashboard/UserDashboard'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [profileData, setProfileData] = useState({ full_name: '', phone: '', avatar_url: '' })
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  // ปรับขนาดและบีบอัดรูปภาพโปรไฟล์ (ไม่เกิน 400x400) เพื่อความคมชัดและโหลดรวดเร็ว
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 400
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88)
          resolve(compressedBase64)
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'ขนาดไฟล์ภาพต้องไม่เกิน 5MB' })
      return
    }

    try {
      const base64 = await compressImage(file)
      setProfileData(prev => ({ ...prev, avatar_url: base64 }))
      setProfileMessage({ type: 'info', text: 'เลือกรูปภาพแล้ว กด "บันทึกข้อมูล" ด้านล่างเพื่ออัปเดต' })
    } catch (err) {
      console.error('Error processing image:', err)
      setProfileMessage({ type: 'error', text: 'ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง' })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    setProfileData(prev => ({ ...prev, avatar_url: '' }))
    setProfileMessage({ type: 'info', text: 'ลบรูปภาพแล้ว กด "บันทึกข้อมูล" เพื่อยืนยันการเปลี่ยนแปลง' })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })
    setProfileLoading(true)

    try {
      const res = await api.put('/auth/profile', profileData)
      if (res.data.success) {
        setProfileMessage({ type: 'success', text: 'บันทึกข้อมูลโปรไฟล์และรูปภาพสำเร็จ' })
        if (res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(prev => ({ ...prev, ...profileData }))
        }
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    if (passwordData.new_password !== passwordData.confirm_password) {
      return setPasswordMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' })
    }

    setPasswordLoading(true)
    try {
      const res = await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' })
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <BackButton fallbackPath="/" label="ย้อนกลับ" />
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          จัดการโปรไฟล์
        </Typography>

        {/* สรุปสถานะประกาศและคำขอของฉัน */}
        <UserDashboard />

        <Grid container spacing={4}>
          {/* ส่วนข้อมูลส่วนตัว และรูปโปรไฟล์ */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>ข้อมูลส่วนตัว</Typography>
              
              {profileMessage.text && (
                <Alert severity={profileMessage.type} sx={{ mb: 2 }}>
                  {profileMessage.text}
                </Alert>
              )}

              {/* ส่วนแสดงและอัปโหลดรูปโปรไฟล์ */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2.5 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profileData.avatar_url || ''}
                    alt={profileData.full_name || user?.full_name}
                    sx={{
                      width: 105,
                      height: 105,
                      fontSize: '2.5rem',
                      bgcolor: 'primary.main',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      border: '3px solid #ffffff',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.03)' }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData.full_name?.charAt(0).toUpperCase() || user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Tooltip title="คลิกเพื่อเปลี่ยนรูป">
                    <IconButton
                      color="primary"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: 'grey.100' },
                        p: 0.8
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={handleFileSelect}
                />

                {profileData.avatar_url && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={handleRemoveAvatar}
                      sx={{ textTransform: 'none' }}
                    >
                      ลบรูป
                    </Button>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6 }}>
                  รองรับไฟล์ภาพ JPG, PNG หรือ WebP (คลิกที่รูปเพื่อเปลี่ยน)
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField fullWidth label="อีเมล (เปลี่ยนไม่ได้)" value={user?.email || ''} margin="normal" disabled />
                <TextField fullWidth label="ระดับผู้ใช้งาน" value={user?.role || ''} margin="normal" disabled />
                <TextField fullWidth label="ชื่อ-นามสกุล *" name="full_name" value={profileData.full_name} onChange={handleProfileChange} margin="normal" required />
                <TextField fullWidth label="เบอร์โทรศัพท์" name="phone" value={profileData.phone} onChange={handleProfileChange} margin="normal" />
                
                {/* ช่องกรอก URL สำรอง หากต้องการใส่ลิงก์ตรง */}
                <TextField 
                  fullWidth 
                  label="รูปโปรไฟล์ (URL ภาพ หรืออัปโหลดจากปุ่มด้านบน)" 
                  name="avatar_url" 
                  value={profileData.avatar_url} 
                  onChange={handleProfileChange} 
                  margin="normal" 
                  placeholder="https://... หรืออัปโหลดจากด้านบน"
                  helperText="สามารถกดปุ่มเลือกรูปด้านบน หรือวางลิงก์รูปภาพในช่องนี้ได้"
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  disabled={profileLoading}
                  sx={{ mt: 2.5, py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {profileLoading ? <CircularProgress size={24} color="inherit" /> : 'บันทึกข้อมูล'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* ส่วนเปลี่ยนรหัสผ่าน */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>เปลี่ยนรหัสผ่าน</Typography>
              
              {passwordMessage.text && (
                <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
                  {passwordMessage.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField fullWidth label="รหัสผ่านปัจจุบัน" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} margin="normal" required />
                <TextField fullWidth label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} margin="normal" required />
                <TextField fullWidth label="ยืนยันรหัสผ่านใหม่" name="confirm_password" type="password" value={passwordData.confirm_password} onChange={handlePasswordChange} margin="normal" required />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  disabled={passwordLoading}
                  sx={{ mt: 3, py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'เปลี่ยนรหัสผ่าน'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default ProfilePage

